// Odyssey SDK types (based on documentation)
export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'streaming'
  | 'error'
  | 'authenticating'
  | 'reconnecting'
  | 'failed';

export interface OdysseyStreamOptions {
  prompt: string;
  portrait?: boolean;
}

export interface OdysseyInteractOptions {
  prompt: string;
}

// Game state types
export type StatusEffect = {
  type: 'burning' | 'frozen' | 'powered' | 'weakened' | 'shielded'
  duration: number // turns remaining
  power: number // effect strength
}

export interface Character {
  name: string;
  description: string;
  archetype: string;
  stats: {
    power: number; // Acts as HP
    defense: number;
    energy: number;
    actionPoints: number; // NEW: 3 max per turn for strategic choices
  };
  statusEffects: StatusEffect[]; // NEW: Active status effects
  comboCount: number; // NEW: Track consecutive similar actions
  lastAction: string | null; // NEW: For combo system
}

export interface World {
  name: string;
  description: string;
  environment: string;
}

export type Arena = World; // Alias for clarity

export type BattlePhase = 'setup' | 'active' | 'finished';

export type StatDelta = {
  power?: number;
  defense?: number;
  energy?: number;
}

export type GameEvent = {
  id: string;
  timestamp: number;
  actor: 1 | 2;
  actorName: string;
  action: string;
  narration: string;
  impact: {
    player1Delta?: StatDelta;
    player2Delta?: StatDelta;
  };
}

export type BattleLog = GameEvent[];

export type ActionType = 'quickAttack' | 'heavyAttack' | 'special' | 'defend' | 'powerUp' | 'taunt';

export type ActionCost = {
  quickAttack: 1
  heavyAttack: 2
  special: 3
  defend: 1
  powerUp: 2
  taunt: 1
}

export type BattleResult = {
  winner: 1 | 2 | null
  condition: 'knockout' | 'timeout' | 'surrender'
  turnsPlayed: number
  finalScores: { player1: number; player2: number }
}

export type DamageResult = {
  damage: number
  isCritical: boolean
  comboBonus: number
}

export interface PlayerStats {
  power: number;
  defense: number;
  energy: number;
  momentum: number;
}

export interface Player {
  id: 1 | 2;
  name: string;
  character: Character | null;
  world: World | null;
  stats: PlayerStats;
  color: string;
}

export type GamePhase = 'idle' | 'setup' | 'battle' | 'victory';

export interface EventEntry {
  id: string;
  turn: number;
  playerId: 1 | 2;
  action: string;
  narration: string;
  visualMoment?: string;
  statDeltas?: Partial<PlayerStats>;
  timestamp: number;
}

export interface GameState {
  phase: GamePhase;
  player1: Player;
  player2: Player;
  currentTurn: 1 | 2;
  isActive: boolean;
  eventLog: EventEntry[];
  winner: 1 | 2 | null;
}

// Initial player state factory
export function createInitialPlayer(id: 1 | 2): Player {
  return {
    id,
    name: id === 1 ? 'Player 1' : 'Player 2',
    character: null,
    world: null,
    stats: {
      power: 50,
      defense: 50,
      energy: 100,
      momentum: 50,
    },
    color: id === 1 ? '#F59E0B' : '#8B5CF6',
  };
}

// Initial game state
export function createInitialGameState(): GameState {
  return {
    phase: 'idle',
    player1: createInitialPlayer(1),
    player2: createInitialPlayer(2),
    currentTurn: 1,
    isActive: false,
    eventLog: [],
    winner: null,
  };
}
