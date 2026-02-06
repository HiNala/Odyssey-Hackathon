'use client';

import { useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { useOdysseyStream } from '@/hooks/useOdysseyStream';
import { calculateStatChanges, createEventEntry } from '@/lib/scoring';
import { checkVictoryCondition } from '@/lib/gameState';
import type { ArenaState } from '@/types/game';

/**
 * High-level game orchestration hook.
 * Combines game context + Odyssey connection into a single interface.
 */
export function useGameFlow() {
  const { state, dispatch } = useGame();
  const odyssey = useOdysseyStream();

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

  // ── Submit Character Setup ─────────────────────────────────────
  const submitCharacter = useCallback(
    async (player: 1 | 2, character: string, world: string) => {
      dispatch({ type: 'SET_CHARACTER', player, character, world });
      dispatch({ type: 'SET_PROCESSING', processing: true });

      const prompt = `A cinematic portrait of ${character}, in a ${world} environment. The camera is steady with close-up framing. Dramatic lighting with depth and atmosphere.`;

      try {
        // Start a short preview stream
        const streamId = await odyssey.startStream(prompt);
        dispatch({ type: 'START_STREAM', player, streamId });

        // Let it run briefly to establish the scene
        await new Promise((r) => setTimeout(r, 4000));

        // End preview stream and mark setup complete
        await odyssey.endStream();
        dispatch({ type: 'END_STREAM', player });
        dispatch({ type: 'COMPLETE_SETUP', player });
        dispatch({ type: 'SET_PROCESSING', processing: false });
      } catch (err) {
        console.error('Setup failed:', err);
        // Still mark complete so the game can proceed
        dispatch({ type: 'COMPLETE_SETUP', player });
        dispatch({ type: 'SET_PROCESSING', processing: false });
      }
    },
    [odyssey, dispatch]
  );

  // ── Submit Battle Action ───────────────────────────────────────
  const submitAction = useCallback(
    async (action: string) => {
      if (state.phase !== 'battle' || state.isProcessing) return;

      const playerId = state.activePlayer;
      dispatch({ type: 'SET_PROCESSING', processing: true });

      // Calculate stat changes
      const changes = calculateStatChanges(action, state);
      const event = createEventEntry(playerId, action, changes);

      // Send to Odyssey if connected for visual feedback
      try {
        const activePlayer = state.players[playerId - 1];
        const opponent = state.players[playerId === 1 ? 1 : 0];
        const battlePrompt = `${activePlayer.character} ${action}. The attack has visible force and impact. ${opponent.character} reacts realistically.`;
        await odyssey.interact(battlePrompt);
      } catch {
        // Odyssey interaction is best-effort; game continues regardless
      }

      // Resolve the action in state
      dispatch({ type: 'RESOLVE_ACTION', event });

      // Check victory AFTER state update — compute from the event
      const updatedState = applyEventToState(state, event);
      const winner = checkVictoryCondition(updatedState);

      if (winner) {
        dispatch({ type: 'DECLARE_WINNER', winner });
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

  // ── Start Battle Stream ────────────────────────────────────────
  const startBattleStream = useCallback(async () => {
    if (state.phase !== 'battle') return;
    const p1 = state.players[0];
    const p2 = state.players[1];
    const prompt = `A dramatic battle arena. On the left: ${p1.character}. On the right: ${p2.character}. They face each other ready for battle. Cinematic lighting, tense atmosphere.`;
    try {
      const streamId = await odyssey.startStream(prompt);
      dispatch({ type: 'START_STREAM', player: state.activePlayer, streamId });
    } catch (err) {
      console.error('Failed to start battle stream:', err);
    }
  }, [state, odyssey, dispatch]);

  return {
    state,
    dispatch,
    odyssey,
    startGame,
    submitCharacter,
    submitAction,
    resetGame,
    startBattleStream,
  };
}

// ── Local helper: preview state after event (before dispatch completes) ──

function applyEventToState(state: ArenaState, event: ReturnType<typeof createEventEntry>): ArenaState {
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
  const players = state.players.map((p) => {
    const changes = p.id === 1 ? event.statChanges.player1 : event.statChanges.player2;
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
  return { ...state, players };
}
