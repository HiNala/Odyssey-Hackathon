/**
 * Game State Reducer & Helpers
 * Heart of the game logic — all state transitions flow through here.
 */

import type {
  ArenaState,
  PlayerState,
  PlayerStats,
  GameAction,
  EventEntry,
} from '@/types/game';

// ─── Initial State Factories ────────────────────────────────────────

export function createDefaultStats(): PlayerStats {
  return { momentum: 50, power: 50, defense: 50, energy: 100 };
}

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

export function createInitialState(): ArenaState {
  return {
    phase: 'idle',
    players: [createPlayerState(1), createPlayerState(2)],
    eventLog: [],
    activePlayer: 1,
    setupPlayer: 1,
    winner: null,
    isConnected: false,
    connectionError: null,
    isProcessing: false,
  };
}

// ─── Helper Utilities ───────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function buildCharacterPrompt(character: string, world: string): string {
  return `A cinematic portrait of ${character}, in a ${world} environment. The camera is steady with close-up framing. Dramatic lighting with depth and atmosphere. Fantasy art style with rich detail.`;
}

function updatePlayer(
  players: [PlayerState, PlayerState],
  id: 1 | 2,
  updater: (p: PlayerState) => PlayerState
): [PlayerState, PlayerState] {
  return players.map((p) => (p.id === id ? updater(p) : p)) as [
    PlayerState,
    PlayerState,
  ];
}

function applyStatChanges(
  players: [PlayerState, PlayerState],
  event: EventEntry
): [PlayerState, PlayerState] {
  return players.map((player) => {
    const changes =
      player.id === 1 ? event.statChanges.player1 : event.statChanges.player2;
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

// ─── Main Reducer ───────────────────────────────────────────────────

export function gameReducer(
  state: ArenaState,
  action: GameAction
): ArenaState {
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
        players: updatePlayer(
          updatePlayer(state.players, 1, (p) => ({
            ...p,
            isStreaming: false,
            streamId: null,
          })),
          2,
          (p) => ({ ...p, isStreaming: false, streamId: null })
        ),
      };

    case 'CONNECTION_ERROR':
      return { ...state, isConnected: false, connectionError: action.error };

    case 'SET_PLAYER_NAME':
      return {
        ...state,
        players: updatePlayer(state.players, action.player, (p) => ({
          ...p,
          name: action.name,
        })),
      };

    case 'SET_CHARACTER': {
      const prompt = buildCharacterPrompt(action.character, action.world);
      return {
        ...state,
        players: updatePlayer(state.players, action.player, (p) => ({
          ...p,
          character: action.character,
          world: action.world,
          characterPrompt: prompt,
        })),
      };
    }

    case 'START_STREAM':
      return {
        ...state,
        players: updatePlayer(state.players, action.player, (p) => ({
          ...p,
          streamId: action.streamId,
          isStreaming: true,
        })),
      };

    case 'END_STREAM':
      return {
        ...state,
        players: updatePlayer(state.players, action.player, (p) => ({
          ...p,
          isStreaming: false,
        })),
      };

    case 'COMPLETE_SETUP': {
      const updated = updatePlayer(state.players, action.player, (p) => ({
        ...p,
        isSetupComplete: true,
      }));
      const bothReady = updated.every((p) => p.isSetupComplete);
      return {
        ...state,
        players: updated,
        phase: bothReady ? 'battle' : state.phase,
        setupPlayer: bothReady ? state.setupPlayer : 2,
        activePlayer: bothReady ? 1 : state.activePlayer,
      };
    }

    case 'START_BATTLE':
      return { ...state, phase: 'battle', activePlayer: 1 };

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.processing };

    case 'RESOLVE_ACTION':
      return {
        ...state,
        eventLog: [...state.eventLog, action.event],
        players: applyStatChanges(state.players, action.event),
        isProcessing: false,
      };

    case 'SWITCH_ACTIVE_PLAYER':
      return {
        ...state,
        activePlayer: state.activePlayer === 1 ? 2 : 1,
      };

    case 'DECLARE_WINNER':
      return { ...state, phase: 'victory', winner: action.winner };

    case 'RESET_GAME':
      return createInitialState();

    default:
      return state;
  }
}

// ─── Selectors ──────────────────────────────────────────────────────

export function getActivePlayer(state: ArenaState): PlayerState {
  return state.players[state.activePlayer - 1];
}

export function getOpponent(state: ArenaState): PlayerState {
  return state.players[state.activePlayer === 1 ? 1 : 0];
}

export function canPlayerAct(state: ArenaState): boolean {
  return (
    state.phase === 'battle' &&
    state.isConnected &&
    !state.isProcessing &&
    getActivePlayer(state).stats.energy > 0
  );
}

export function checkVictoryCondition(state: ArenaState): 1 | 2 | null {
  const [p1, p2] = state.players;
  if (p1.stats.momentum >= 100) return 1;
  if (p2.stats.momentum >= 100) return 2;
  if (p1.stats.momentum <= 0) return 2;
  if (p2.stats.momentum <= 0) return 1;
  return null;
}

export function getRecentEvents(state: ArenaState, count = 10): EventEntry[] {
  return state.eventLog.slice(-count);
}
