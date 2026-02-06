'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { useOdysseyStream } from '@/hooks/useOdysseyStream';
import { calculateStatChangesWithAI, createEventEntry } from '@/lib/scoring';
import { checkVictoryCondition } from '@/lib/gameState';
import {
  buildCharacterPreviewPrompt,
  buildBattleStartPrompt,
  buildActionPrompt,
} from '@/lib/prompt-templates';
import { saveBattleRecord, updateGameStats } from '@/lib/storage';
import { sanitizePrompt } from '@/lib/sanitize';
import { actionRateLimiter } from '@/lib/rate-limiter';
import { evaluatePostBattleEvolution, buildEvolvedBattlePrompt } from '@/lib/evolution';
import type { ArenaState, EvolutionLevel } from '@/types/game';

/**
 * High-level game orchestration hook.
 * Combines game context + Odyssey connection into a single interface.
 * All Odyssey prompts flow through the prompt-templates system.
 *
 * Handles Odyssey connection resilience:
 * - Syncs Odyssey disconnect events with game state (critical for HMR / reconnect)
 * - Auto-reconnects battle stream when Odyssey reconnects
 * - Guards against concurrent reconnection attempts
 */
export function useGameFlow() {
  const { state, dispatch } = useGame();
  const odyssey = useOdysseyStream();
  const battleStreamLockRef = useRef(false);

  // ── Live Commentary State (THE KILLER FEATURE) ──────────────────
  const [commentary, setCommentary] = useState<{
    text: string;
    variant: 'action' | 'start' | 'victory' | 'critical';
    key: string;
  } | null>(null);

  // Fire-and-forget commentary generation (never blocks game flow)
  const generateCommentary = useCallback(
    async (type: string, context: Record<string, unknown>) => {
      try {
        const res = await fetch('/api/commentary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, context }),
        });
        const data = await res.json();
        if (data.commentary) {
          const variant =
            type === 'battle_start' ? 'start' :
            type === 'victory' ? 'victory' :
            (context.isCritical ? 'critical' : 'action');
          setCommentary({
            text: data.commentary,
            variant: variant as 'action' | 'start' | 'victory' | 'critical',
            key: `${type}-${Date.now()}`,
          });
        }
      } catch {
        // Commentary is best-effort — never block the game
      }
    },
    []
  );

  // Evolution transformation state (consumed by page.tsx for the overlay)
  const [transformationData, setTransformationData] = useState<{
    characterName: string;
    fromLevel: EvolutionLevel;
    toLevel: EvolutionLevel;
  } | null>(null);

  // ── Sync Odyssey status with game state ────────────────────────
  // When Odyssey disconnects (HMR, network drop, stale session) while the game
  // is active, reset the game's isConnected + isStreaming flags. This allows
  // the battle-stream useEffect in page.tsx to re-fire and auto-reconnect.
  useEffect(() => {
    if (
      odyssey.status === 'disconnected' &&
      state.isConnected &&
      state.phase !== 'idle'
    ) {
      console.log('[GameFlow] Odyssey disconnected while game active — syncing state');
      dispatch({ type: 'DISCONNECT' });
    }
  }, [odyssey.status, state.isConnected, state.phase, dispatch]);

  // ── Start Game (Idle → Setup) ──────────────────────────────────
  const startGame = useCallback(async () => {
    if (state.phase !== 'idle') return;
    try {
      // Timeout Odyssey connection after 12 seconds to prevent indefinite hang
      const connectPromise = odyssey.connect();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Odyssey connection timed out after 12 seconds')), 12000)
      );
      await Promise.race([connectPromise, timeoutPromise]);
      dispatch({ type: 'CONNECT' });
    } catch (err) {
      dispatch({
        type: 'CONNECTION_ERROR',
        error: err instanceof Error ? err.message : 'Connection failed — check your Odyssey API key',
      });
    }
  }, [state.phase, odyssey, dispatch]);

  // ── Submit Character Setup (supports optional image for image-to-video) ──
  const submitCharacter = useCallback(
    async (player: 1 | 2, character: string, world: string, image?: File | Blob) => {
      dispatch({ type: 'SET_CHARACTER', player, character, world });
      dispatch({ type: 'SET_PROCESSING', processing: true });

      // Build prompt using template system (state descriptions, not action verbs)
      const prompt = buildCharacterPreviewPrompt(character, world);

      // Check if Odyssey is actually connected before trying stream
      const isOdysseyReady = odyssey.status === 'connected' || odyssey.status === 'streaming';

      if (isOdysseyReady) {
        try {
          const streamId = image
            ? await odyssey.startStream({ prompt, image })
            : await odyssey.startStream(prompt);
          dispatch({ type: 'START_STREAM', player, streamId });

          // Let it run long enough for player to see their character generated
          await new Promise((r) => setTimeout(r, 8000));

          await odyssey.endStream();
          dispatch({ type: 'END_STREAM', player });
        } catch (err) {
          console.error('Setup stream failed:', err);
          // Brief pause so the UI doesn't flash
          await new Promise((r) => setTimeout(r, 2000));
        }
      } else {
        // Odyssey not connected yet — wait then continue setup
        console.warn('[GameFlow] Odyssey not ready during setup — skipping preview stream');
        await new Promise((r) => setTimeout(r, 2000));
      }

      dispatch({ type: 'COMPLETE_SETUP', player });
      dispatch({ type: 'SET_PROCESSING', processing: false });
    },
    [odyssey, dispatch]
  );

  // ── Submit Battle Action ───────────────────────────────────────
  const submitAction = useCallback(
    async (action: string) => {
      if (state.phase !== 'battle' || state.isProcessing) return;

      // Rate limiting check
      if (!actionRateLimiter.canMakeRequest()) {
        console.warn('[Game] Rate limit exceeded. Slow down!');
        return;
      }
      actionRateLimiter.recordRequest();

      // Sanitize and validate the action prompt
      const { sanitized, safe } = sanitizePrompt(action);
      if (!safe || !sanitized) {
        console.warn('[Game] Unsafe or empty action rejected');
        return;
      }

      const playerId = state.activePlayer;
      dispatch({ type: 'SET_PROCESSING', processing: true });

      // Calculate stat changes via AI-enhanced scoring engine
      const changes = await calculateStatChangesWithAI(sanitized, state);
      const event = createEventEntry(playerId, sanitized, changes);

      // Send to Odyssey for visual feedback using prompt templates
      try {
        const activePlayer = state.players[playerId - 1];
        const opponent = state.players[playerId === 1 ? 1 : 0];

        // Build action prompt using state descriptions (avoids looping)
        const battlePrompt = buildActionPrompt(
          activePlayer.character || activePlayer.name,
          action,
          opponent.character || opponent.name
        );
        await odyssey.interact(battlePrompt);
      } catch {
        // Odyssey interaction is best-effort; game continues regardless
      }

      // Brief delay for "resolving action..." feel
      await new Promise((r) => setTimeout(r, 400));

      // Resolve the action in state
      dispatch({ type: 'RESOLVE_ACTION', event });

      // Fire action commentary (non-blocking — never delays game)
      {
        const activeP = state.players[playerId - 1];
        const opponentP = state.players[playerId === 1 ? 1 : 0];
        generateCommentary('action', {
          attacker: activeP.character || activeP.name,
          defender: opponentP.character || opponentP.name,
          action: sanitized,
          impact: changes.impactType,
          momentumChange: (playerId === 1 ? changes.player1.momentum : changes.player2.momentum) || 0,
          isCritical: changes.impactType === 'critical',
          comboCount: changes.comboCount || 0,
        });
      }

      // Check victory AFTER state update — compute from the event
      const updatedState = applyEventToState(state, event);
      const winner = checkVictoryCondition(updatedState);

      if (winner) {
        dispatch({ type: 'DECLARE_WINNER', winner });

        // Fire victory commentary (non-blocking)
        const winnerP = updatedState.players[winner - 1];
        const loserP = updatedState.players[winner === 1 ? 1 : 0];
        generateCommentary('victory', {
          winner: winnerP.character || winnerP.name,
          loser: loserP.character || loserP.name,
          turns: updatedState.turnCount,
        });

        // Evaluate evolution after the battle
        const winnerPlayer = updatedState.players[winner - 1];
        const loserPlayer = updatedState.players[winner === 1 ? 1 : 0];
        const evoResult = evaluatePostBattleEvolution(
          winnerPlayer,
          loserPlayer,
          state.battleStats,
          updatedState.turnCount,
        );

        // Apply evolution state changes
        if (evoResult.winnerChanged) {
          dispatch({
            type: 'EVOLVE_PLAYER',
            player: evoResult.winnerId,
            newLevel: evoResult.winnerNewLevel,
            trigger: evoResult.winnerTrigger,
          });
          // Show transformation overlay for winner
          setTransformationData({
            characterName: winnerPlayer.character || winnerPlayer.name,
            fromLevel: winnerPlayer.evolutionLevel,
            toLevel: evoResult.winnerNewLevel,
          });
        }
        if (evoResult.loserChanged) {
          dispatch({
            type: 'EVOLVE_PLAYER',
            player: evoResult.loserId,
            newLevel: evoResult.loserNewLevel,
            trigger: evoResult.loserTrigger,
          });
        }

        // Persist battle record & stats to localStorage
        try {
          const p1 = updatedState.players[0];
          const p2 = updatedState.players[1];
          saveBattleRecord({
            id: `battle_${Date.now()}`,
            timestamp: Date.now(),
            player1: { name: p1.name, character: p1.character, finalStats: p1.stats },
            player2: { name: p2.name, character: p2.character, finalStats: p2.stats },
            winner,
            turns: updatedState.eventLog.length,
            events: updatedState.eventLog.length,
          });
          updateGameStats(winner);
        } catch {
          // Storage is best-effort, game continues regardless
        }
      } else {
        dispatch({ type: 'SWITCH_ACTIVE_PLAYER' });
      }
    },
    [state, odyssey, dispatch]
  );

  // ── Reset Game ─────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    odyssey.disconnect();
    dispatch({ type: 'RESET_GAME' });
  }, [odyssey, dispatch]);

  // ── Rematch (keep characters + evolution, reset stats) ────────
  const rematch = useCallback(() => {
    dispatch({ type: 'REMATCH' });
  }, [dispatch]);

  // ── Clear transformation overlay ──────────────────────────────
  const clearTransformation = useCallback(() => {
    setTransformationData(null);
  }, []);

  // ── Start Battle Stream ────────────────────────────────────────
  // Attempts to start the Odyssey stream for the battle view.
  // Uses a ref-based lock to prevent concurrent reconnection attempts.
  // Does a fresh reconnect to clear stale state from setup phase.
  const startBattleStream = useCallback(async () => {
    if (state.phase !== 'battle') return;

    // Prevent concurrent reconnection attempts (e.g. from rapid re-renders)
    if (battleStreamLockRef.current) {
      console.log('[GameFlow] Battle stream start already in progress — skipping');
      return;
    }
    battleStreamLockRef.current = true;

    const p1 = state.players[0];
    const p2 = state.players[1];

    // Build battle prompt — use evolution-aware prompts if characters have evolved
    const arena = p1.world || p2.world || undefined;
    const hasEvolution = p1.evolutionLevel !== 0 || p2.evolutionLevel !== 0;
    const prompt = hasEvolution
      ? buildEvolvedBattlePrompt(
          p1.character || p1.name,
          p2.character || p2.name,
          p1.evolutionLevel,
          p2.evolutionLevel,
          arena,
        )
      : buildBattleStartPrompt(
          p1.character || p1.name,
          p2.character || p2.name,
          arena,
        );

    try {
      // Fresh reconnect: after the setup phase the Odyssey session is often stale.
      // Force a clean disconnect→reconnect cycle so startStream doesn't hit
      // "Already connecting" from leftover SDK state.
      console.log('[GameFlow] Force-reconnecting Odyssey for battle stream...');
      await odyssey.forceReconnect();
      if (!state.isConnected) {
        dispatch({ type: 'CONNECT' });
      }

      const streamId = await odyssey.startStream(prompt);
      dispatch({ type: 'START_STREAM', player: state.activePlayer, streamId });
      battleStreamLockRef.current = false;

      // Fire battle-start commentary (non-blocking)
      generateCommentary('battle_start', {
        player1: p1.character || p1.name,
        player2: p2.character || p2.name,
        arena: arena || 'the arena',
      });

      return; // Success
    } catch (err) {
      console.error('[GameFlow] Battle stream failed after force-reconnect:', err);
    }

    // Fallback: one more attempt after a longer delay
    try {
      console.log('[GameFlow] Retrying battle stream in 3s...');
      await new Promise((r) => setTimeout(r, 3000));
      const streamId = await odyssey.startStream(prompt);
      if (!state.isConnected) {
        dispatch({ type: 'CONNECT' });
      }
      dispatch({ type: 'START_STREAM', player: state.activePlayer, streamId });
      battleStreamLockRef.current = false;
      return;
    } catch (err) {
      console.error('[GameFlow] Battle stream retry also failed:', err);
    }

    battleStreamLockRef.current = false;
    // All attempts failed — game continues without stream (Odyssey is best-effort)
    console.warn('[GameFlow] Battle stream could not be started. Game continues without video.');
  }, [state, odyssey, dispatch]);

  return {
    state,
    dispatch,
    odyssey,
    startGame,
    submitCharacter,
    submitAction,
    resetGame,
    rematch,
    startBattleStream,
    transformationData,
    clearTransformation,
    commentary,
  };
}

// ── Local helper: preview state after event (before dispatch completes) ──

function applyEventToState(
  state: ArenaState,
  event: ReturnType<typeof createEventEntry>
): ArenaState {
  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max);
  const players = state.players.map((p) => {
    const changes =
      p.id === 1 ? event.statChanges.player1 : event.statChanges.player2;
    if (!changes) return p;
    return {
      ...p,
      stats: {
        momentum: clamp(p.stats.momentum + (changes.momentum || 0), 0, 100),
        power: clamp(p.stats.power + (changes.power || 0), 0, 100),
        defense: clamp(p.stats.defense + (changes.defense || 0), 0, 100),
        energy: clamp(p.stats.energy + (changes.energy || 0), 0, 100),
      },
    };
  }) as [typeof state.players[0], typeof state.players[1]];
  return { ...state, players, eventLog: [...state.eventLog, event] };
}
