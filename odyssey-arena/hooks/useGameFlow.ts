'use client';

import { useCallback, useState } from 'react';
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
import type { ArenaState } from '@/types/game';

/**
 * High-level game orchestration hook.
 * Combines game context + Odyssey connection into a single interface.
 * Supports "demo mode" — full game flow without live Odyssey video.
 * All Odyssey prompts flow through the prompt-templates system.
 */
export function useGameFlow() {
  const { state, dispatch } = useGame();
  const odyssey = useOdysseyStream();
  const [isDemoMode, setIsDemoMode] = useState(false);

  // ── Start Game (Idle → Setup) ──────────────────────────────────
  const startGame = useCallback(async () => {
    if (state.phase !== 'idle') return;
    try {
      await odyssey.connect();
      dispatch({ type: 'CONNECT' });
    } catch (err) {
      dispatch({
        type: 'CONNECTION_ERROR',
        error: err instanceof Error ? err.message : 'Connection failed',
      });
    }
  }, [state.phase, odyssey, dispatch]);

  // ── Start Demo Mode (skip Odyssey, test full UI flow) ──────────
  const startDemoMode = useCallback(() => {
    if (state.phase !== 'idle') return;
    setIsDemoMode(true);
    dispatch({ type: 'CONNECT' });
  }, [state.phase, dispatch]);

  // ── Submit Character Setup (supports optional image for image-to-video) ──
  const submitCharacter = useCallback(
    async (player: 1 | 2, character: string, world: string, image?: File | Blob) => {
      dispatch({ type: 'SET_CHARACTER', player, character, world });
      dispatch({ type: 'SET_PROCESSING', processing: true });

      if (isDemoMode) {
        // Demo mode: simulate a brief delay, then complete
        await new Promise((r) => setTimeout(r, 1500));
        dispatch({ type: 'COMPLETE_SETUP', player });
        dispatch({ type: 'SET_PROCESSING', processing: false });
        return;
      }

      // Build prompt using template system (state descriptions, not action verbs)
      const prompt = buildCharacterPreviewPrompt(character, world);

      try {
        // Start a short preview stream so the player sees their character
        // If image is provided, use image-to-video mode (per Odyssey SDK docs)
        const streamId = image
          ? await odyssey.startStream({ prompt, image })
          : await odyssey.startStream(prompt);
        dispatch({ type: 'START_STREAM', player, streamId });

        // Let it run briefly to establish the scene
        await new Promise((r) => setTimeout(r, 4000));

        // End preview stream and mark setup complete
        await odyssey.endStream();
        dispatch({ type: 'END_STREAM', player });
        dispatch({ type: 'COMPLETE_SETUP', player });
        dispatch({ type: 'SET_PROCESSING', processing: false });
      } catch (err) {
        console.error('Setup stream failed:', err);
        // Still mark complete so the game can proceed
        dispatch({ type: 'COMPLETE_SETUP', player });
        dispatch({ type: 'SET_PROCESSING', processing: false });
      }
    },
    [odyssey, dispatch, isDemoMode]
  );

  // ── Submit Battle Action ───────────────────────────────────────
  const submitAction = useCallback(
    async (action: string) => {
      if (state.phase !== 'battle' || state.isProcessing) return;

      const playerId = state.activePlayer;
      dispatch({ type: 'SET_PROCESSING', processing: true });

      // Calculate stat changes via AI-enhanced scoring engine
      const changes = await calculateStatChangesWithAI(action, state);
      const event = createEventEntry(playerId, action, changes);

      // Send to Odyssey for visual feedback using prompt templates (skip in demo)
      if (!isDemoMode) {
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
      }

      // Brief delay for "resolving action..." feel (800ms in demo, 400ms with stream)
      await new Promise((r) => setTimeout(r, isDemoMode ? 800 : 400));

      // Resolve the action in state
      dispatch({ type: 'RESOLVE_ACTION', event });

      // Check victory AFTER state update — compute from the event
      const updatedState = applyEventToState(state, event);
      const winner = checkVictoryCondition(updatedState);

      if (winner) {
        dispatch({ type: 'DECLARE_WINNER', winner });

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
    [state, odyssey, dispatch, isDemoMode]
  );

  // ── Reset Game ─────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    odyssey.disconnect();
    setIsDemoMode(false);
    dispatch({ type: 'RESET_GAME' });
  }, [odyssey, dispatch]);

  // ── Start Battle Stream ────────────────────────────────────────
  const startBattleStream = useCallback(async () => {
    if (state.phase !== 'battle' || isDemoMode) return;
    const p1 = state.players[0];
    const p2 = state.players[1];

    // Build battle prompt using template system
    const arena = p1.world || p2.world || undefined;
    const prompt = buildBattleStartPrompt(
      p1.character || p1.name,
      p2.character || p2.name,
      arena
    );

    try {
      const streamId = await odyssey.startStream(prompt);
      dispatch({ type: 'START_STREAM', player: state.activePlayer, streamId });
    } catch (err) {
      console.error('Failed to start battle stream:', err);
    }
  }, [state, odyssey, dispatch, isDemoMode]);

  return {
    state,
    dispatch,
    odyssey,
    isDemoMode,
    startGame,
    startDemoMode,
    submitCharacter,
    submitAction,
    resetGame,
    startBattleStream,
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
