# Game State Architecture

## Overview

The Odyssey Arena game state is designed to be minimal yet expressive. We use React's built-in state management (useState + useReducer) to keep complexity low while maintaining full control over the game flow. No external state libraries are needed — this is a single-session, ephemeral experience.

The state architecture follows a clear hierarchy: a global ArenaState contains two PlayerState objects, an event log, and game phase information. All state changes flow through a single reducer function, making debugging straightforward and ensuring predictable updates.

---

## Core Type Definitions

These TypeScript types form the backbone of the entire application. Every component, hook, and utility function references these types. They should be placed in `src/types/game.ts` and imported wherever needed.

```typescript
// src/types/game.ts

/**
 * Player statistics - intentionally abstract to allow AI flexibility
 * All values range from 0-100
 */
export interface PlayerStats {
  momentum: number;    // Main score - reaching 100 wins, reaching 0 loses
  power: number;       // Offensive capability
  defense: number;     // Damage resistance
  energy: number;      // Action resource pool
}

/**
 * Individual player state
 */
export interface PlayerState {
  id: 1 | 2;
  name: string;
  character: string;          // Character description (user input)
  world: string;              // World description (user input)
  characterPrompt: string;    // Full prompt sent to Odyssey
  stats: PlayerStats;
  streamId: string | null;    // Odyssey stream ID when active
  isStreaming: boolean;       // Whether video is currently live
  isSetupComplete: boolean;   // Whether character/world has been defined
}

/**
 * Event log entry for battle history
 */
export interface EventEntry {
  id: string;
  timestamp: number;
  player: 1 | 2;
  action: string;             // What the player attempted
  result: string;             // Narrative outcome
  statChanges: {
    player1?: Partial<PlayerStats>;
    player2?: Partial<PlayerStats>;
  };
  impactType: 'critical' | 'strong' | 'normal' | 'weak' | 'miss';
}

/**
 * Game phases
 */
export type GamePhase = 'idle' | 'setup' | 'battle' | 'victory';

/**
 * Global arena state
 */
export interface ArenaState {
  phase: GamePhase;
  players: [PlayerState, PlayerState];
  eventLog: EventEntry[];
  activePlayer: 1 | 2;
  winner: 1 | 2 | null;
  isConnected: boolean;       // Odyssey connection status
  connectionError: string | null;
}

/**
 * Actions for the game reducer
 */
export type GameAction =
  | { type: 'CONNECT' }
  | { type: 'DISCONNECT' }
  | { type: 'CONNECTION_ERROR'; error: string }
  | { type: 'SET_PLAYER_NAME'; player: 1 | 2; name: string }
  | { type: 'SET_CHARACTER'; player: 1 | 2; character: string; world: string }
  | { type: 'START_STREAM'; player: 1 | 2; streamId: string }
  | { type: 'END_STREAM'; player: 1 | 2 }
  | { type: 'COMPLETE_SETUP'; player: 1 | 2 }
  | { type: 'START_BATTLE' }
  | { type: 'SUBMIT_ACTION'; player: 1 | 2; action: string }
  | { type: 'RESOLVE_ACTION'; event: EventEntry }
  | { type: 'SWITCH_ACTIVE_PLAYER' }
  | { type: 'DECLARE_WINNER'; winner: 1 | 2 }
  | { type: 'RESET_GAME' };
```

---

## Initial State Factory

A function to create the initial state ensures we can easily reset the game. Default stats are balanced at 50 for all values, with momentum starting at 50 (neutral position).

```typescript
// src/lib/gameState.ts

import { ArenaState, PlayerState, PlayerStats } from '@/types/game';

/**
 * Create default stats for a new player
 */
export function createDefaultStats(): PlayerStats {
  return {
    momentum: 50,    // Start neutral
    power: 50,
    defense: 50,
    energy: 100,     // Start with full energy
  };
}

/**
 * Create a new player state
 */
export function createPlayerState(id: 1 | 2): PlayerState {
  return {
    id,
    name: id === 1 ? 'Player 1' : 'Player 2',
    character: '',
    world: '',
    characterPrompt: '',
    stats: createDefaultStats(),
    streamId: null,
    isStreaming: false,
    isSetupComplete: false,
  };
}

/**
 * Create the initial arena state
 */
export function createInitialState(): ArenaState {
  return {
    phase: 'idle',
    players: [createPlayerState(1), createPlayerState(2)],
    eventLog: [],
    activePlayer: 1,
    winner: null,
    isConnected: false,
    connectionError: null,
  };
}
```

---

## Game Reducer

The reducer handles all state transitions in a predictable, testable way. Each action type maps to a specific state transformation. This pattern makes it easy to add new features and debug issues.

```typescript
// src/lib/gameState.ts (continued)

import { ArenaState, GameAction, EventEntry } from '@/types/game';

/**
 * Main game reducer - handles all state transitions
 */
export function gameReducer(state: ArenaState, action: GameAction): ArenaState {
  switch (action.type) {
    case 'CONNECT':
      return {
        ...state,
        isConnected: true,
        connectionError: null,
        phase: state.phase === 'idle' ? 'setup' : state.phase,
      };

    case 'DISCONNECT':
      return {
        ...state,
        isConnected: false,
        players: state.players.map(p => ({
          ...p,
          isStreaming: false,
          streamId: null,
        })) as [PlayerState, PlayerState],
      };

    case 'CONNECTION_ERROR':
      return {
        ...state,
        isConnected: false,
        connectionError: action.error,
      };

    case 'SET_PLAYER_NAME':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.player ? { ...p, name: action.name } : p
        ) as [PlayerState, PlayerState],
      };

    case 'SET_CHARACTER':
      const characterPrompt = buildCharacterPrompt(action.character, action.world);
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.player
            ? {
                ...p,
                character: action.character,
                world: action.world,
                characterPrompt,
              }
            : p
        ) as [PlayerState, PlayerState],
      };

    case 'START_STREAM':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.player
            ? { ...p, streamId: action.streamId, isStreaming: true }
            : p
        ) as [PlayerState, PlayerState],
      };

    case 'END_STREAM':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.player
            ? { ...p, isStreaming: false }
            : p
        ) as [PlayerState, PlayerState],
      };

    case 'COMPLETE_SETUP':
      const updatedPlayers = state.players.map(p =>
        p.id === action.player ? { ...p, isSetupComplete: true } : p
      ) as [PlayerState, PlayerState];
      
      // Check if both players are ready
      const bothReady = updatedPlayers.every(p => p.isSetupComplete);
      
      return {
        ...state,
        players: updatedPlayers,
        phase: bothReady ? 'battle' : state.phase,
      };

    case 'START_BATTLE':
      return {
        ...state,
        phase: 'battle',
        activePlayer: 1,
      };

    case 'SUBMIT_ACTION':
      // Action submission is handled externally, this just logs intent
      return state;

    case 'RESOLVE_ACTION':
      return {
        ...state,
        eventLog: [...state.eventLog, action.event],
        players: applyStatChanges(state.players, action.event),
      };

    case 'SWITCH_ACTIVE_PLAYER':
      return {
        ...state,
        activePlayer: state.activePlayer === 1 ? 2 : 1,
      };

    case 'DECLARE_WINNER':
      return {
        ...state,
        phase: 'victory',
        winner: action.winner,
      };

    case 'RESET_GAME':
      return createInitialState();

    default:
      return state;
  }
}

/**
 * Build the full character prompt for Odyssey
 */
function buildCharacterPrompt(character: string, world: string): string {
  return `A cinematic portrait of ${character}, in a ${world} environment. The camera is steady with close-up framing. Dramatic lighting with depth and atmosphere. Fantasy art style with rich detail.`;
}

/**
 * Apply stat changes from an event to players
 */
function applyStatChanges(
  players: [PlayerState, PlayerState],
  event: EventEntry
): [PlayerState, PlayerState] {
  return players.map(player => {
    const changes = player.id === 1 
      ? event.statChanges.player1 
      : event.statChanges.player2;
    
    if (!changes) return player;

    return {
      ...player,
      stats: {
        momentum: clamp(player.stats.momentum + (changes.momentum || 0), 0, 100),
        power: clamp(player.stats.power + (changes.power || 0), 0, 100),
        defense: clamp(player.stats.defense + (changes.defense || 0), 0, 100),
        energy: clamp(player.stats.energy + (changes.energy || 0), 0, 100),
      },
    };
  }) as [PlayerState, PlayerState];
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

---

## State Selectors

Helper functions to derive computed values from state. These keep components clean and make the state shape easier to refactor.

```typescript
// src/lib/gameState.ts (continued)

/**
 * Check if a player can take an action
 */
export function canPlayerAct(state: ArenaState, playerId: 1 | 2): boolean {
  return (
    state.phase === 'battle' &&
    state.activePlayer === playerId &&
    state.isConnected &&
    state.players[playerId - 1].energy > 0
  );
}

/**
 * Get the current player state
 */
export function getActivePlayer(state: ArenaState): PlayerState {
  return state.players[state.activePlayer - 1];
}

/**
 * Get the opponent state
 */
export function getOpponentPlayer(state: ArenaState): PlayerState {
  return state.players[state.activePlayer === 1 ? 1 : 0];
}

/**
 * Check for victory condition
 */
export function checkVictoryCondition(state: ArenaState): 1 | 2 | null {
  const [p1, p2] = state.players;
  
  if (p1.stats.momentum >= 100) return 1;
  if (p2.stats.momentum >= 100) return 2;
  if (p1.stats.momentum <= 0) return 2;
  if (p2.stats.momentum <= 0) return 1;
  
  return null;
}

/**
 * Get the most recent events for display
 */
export function getRecentEvents(state: ArenaState, count: number = 5): EventEntry[] {
  return state.eventLog.slice(-count).reverse();
}

/**
 * Check if game is ready to start battle
 */
export function isReadyForBattle(state: ArenaState): boolean {
  return state.players.every(p => p.isSetupComplete && p.character && p.world);
}
```

---

## Usage in Components

Here's how you'd use this state system in a React component:

```typescript
// Example usage in a component
import { useReducer, useCallback } from 'react';
import { gameReducer, createInitialState, canPlayerAct } from '@/lib/gameState';
import { GameAction } from '@/types/game';

function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

  const submitAction = useCallback((player: 1 | 2, action: string) => {
    if (!canPlayerAct(state, player)) return;
    
    dispatch({ type: 'SUBMIT_ACTION', player, action });
    // ... handle Odyssey interaction
  }, [state]);

  return { state, dispatch, submitAction };
}
```

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           IDLE                                   │
│                     (Initial state)                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │ CONNECT
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                          SETUP                                   │
│         Player 1 defines character → Player 2 defines character  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Both COMPLETE_SETUP
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BATTLE                                   │
│    Active player submits action → Resolve → Switch → Repeat      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Momentum reaches 0 or 100
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        VICTORY                                   │
│              Display winner → Option to RESET_GAME               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Checklist

- [ ] Create `src/types/game.ts` with all type definitions
- [ ] Create `src/lib/gameState.ts` with reducer and helpers
- [ ] Export all types and functions properly
- [ ] Test state transitions in isolation
- [ ] Verify TypeScript compiles without errors
