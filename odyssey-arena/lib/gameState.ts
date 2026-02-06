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
  StatusEffect,
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
    statusEffects: [],
    combo: { lastActionType: '', count: 0 },
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
    turnCount: 0,
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

/** Tick down status effect durations and remove expired ones */
function tickStatusEffects(effects: StatusEffect[]): StatusEffect[] {
  return effects
    .map((e) => ({ ...e, duration: e.duration - 1 }))
    .filter((e) => e.duration > 0);
}

/** Apply start-of-turn status effects to a player's stats */
function applyStatusEffectsTick(player: PlayerState): PlayerState {
  let { momentum, power, defense, energy } = player.stats;

  for (const effect of player.statusEffects) {
    switch (effect.type) {
      case 'burning':
        momentum = clamp(momentum - effect.power, 0, 100);
        break;
      case 'frozen':
        energy = clamp(energy - effect.power, 0, 100);
        break;
      case 'powered':
        power = clamp(power + effect.power, 0, 100);
        break;
      case 'weakened':
        power = clamp(power - effect.power, 0, 100);
        break;
      // 'shielded' is checked during damage calculation, not here
    }
  }

  return {
    ...player,
    stats: { momentum, power, defense, energy },
    statusEffects: tickStatusEffects(player.statusEffects),
  };
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

    case 'RESOLVE_ACTION': {
      const updatedPlayers = applyStatChanges(state.players, action.event);

      // Add any status effect from the event to the opponent
      let playersWithEffects = updatedPlayers;
      if (action.event.statusApplied) {
        const attackerId = action.event.player;
        const defenderId = attackerId === 1 ? 2 : 1;
        playersWithEffects = updatePlayer(updatedPlayers, defenderId as 1 | 2, (p) => ({
          ...p,
          statusEffects: [
            ...p.statusEffects.filter((e) => e.type !== action.event.statusApplied),
            { type: action.event.statusApplied!, duration: 3, power: 5 },
          ],
        }));
      }

      // Update combo state for the active player
      const comboPlayers = updatePlayer(playersWithEffects, action.event.player, (p) => ({
        ...p,
        combo: {
          lastActionType: action.event.action,
          count: action.event.comboCount ?? 0,
        },
      }));

      return {
        ...state,
        eventLog: [...state.eventLog, action.event],
        players: comboPlayers,
        turnCount: state.turnCount + 1,
        isProcessing: false,
      };
    }

    case 'SWITCH_ACTIVE_PLAYER': {
      const nextPlayer = state.activePlayer === 1 ? 2 : 1;
      // Apply start-of-turn status effects to the next active player
      const tickedPlayers = updatePlayer(state.players, nextPlayer as 1 | 2, (p) =>
        applyStatusEffectsTick(p)
      );
      return {
        ...state,
        players: tickedPlayers,
        activePlayer: nextPlayer as 1 | 2,
      };
    }

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
