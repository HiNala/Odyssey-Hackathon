/**
 * Odyssey Arena - Game Type Definitions
 * All game-related types in one place.
 */

/** Player statistics — all values range 0–100 */
export interface PlayerStats {
  momentum: number;  // Primary score: 100 wins, 0 loses
  power: number;     // Offensive modifier
  defense: number;   // Defensive modifier
  energy: number;    // Action resource pool
}

/** Individual player state */
export interface PlayerState {
  id: 1 | 2;
  name: string;
  character: string;        // Character description (user input)
  world: string;            // World description (user input)
  characterPrompt: string;  // Full prompt sent to Odyssey
  stats: PlayerStats;
  streamId: string | null;
  isStreaming: boolean;
  isSetupComplete: boolean;
}

/** Impact classifications for UI effects */
export type ImpactType = 'critical' | 'strong' | 'normal' | 'weak' | 'miss';

/** Event log entry for battle history */
export interface EventEntry {
  id: string;
  timestamp: number;
  player: 1 | 2;
  action: string;
  result: string;
  statChanges: {
    player1?: Partial<PlayerStats>;
    player2?: Partial<PlayerStats>;
  };
  impactType: ImpactType;
}

/** Game phases */
export type GamePhase = 'idle' | 'setup' | 'battle' | 'victory';

/** Global arena state */
export interface ArenaState {
  phase: GamePhase;
  players: [PlayerState, PlayerState];
  eventLog: EventEntry[];
  activePlayer: 1 | 2;
  setupPlayer: 1 | 2;       // Which player is currently setting up
  winner: 1 | 2 | null;
  isConnected: boolean;
  connectionError: string | null;
  isProcessing: boolean;     // True while an action is being resolved
}

/** All possible state actions (discriminated union) */
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
  | { type: 'SET_PROCESSING'; processing: boolean }
  | { type: 'RESOLVE_ACTION'; event: EventEntry }
  | { type: 'SWITCH_ACTIVE_PLAYER' }
  | { type: 'DECLARE_WINNER'; winner: 1 | 2 }
  | { type: 'RESET_GAME' };
