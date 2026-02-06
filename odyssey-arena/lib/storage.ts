/**
 * Local Storage utilities for persisting game data.
 * Stores battle history, statistics, and player records.
 */

export interface BattleRecord {
  id: string;
  timestamp: number;
  player1: {
    name: string;
    character?: string;
    finalStats: {
      momentum: number;
      power: number;
      defense: number;
      energy: number;
    };
  };
  player2: {
    name: string;
    character?: string;
    finalStats: {
      momentum: number;
      power: number;
      defense: number;
      energy: number;
    };
  };
  winner: 1 | 2 | null;
  turns: number;
  events: number;
}

export interface GameStats {
  totalBattles: number;
  player1Wins: number;
  player2Wins: number;
  draws: number;
  lastPlayed: number;
}

const STORAGE_KEYS = {
  BATTLE_HISTORY: 'odyssey_arena_battle_history',
  GAME_STATS: 'odyssey_arena_stats',
  LAST_CHARACTERS: 'odyssey_arena_last_characters',
} as const;

// ─── Battle History ────────────────────────────────────────────────

export function saveBattleRecord(record: BattleRecord): void {
  try {
    const history = getBattleHistory();
    history.unshift(record); // Add to beginning
    
    // Keep only last 50 battles
    const trimmed = history.slice(0, 50);
    
    localStorage.setItem(STORAGE_KEYS.BATTLE_HISTORY, JSON.stringify(trimmed));
    console.log('💾 Battle record saved to history');
  } catch (error) {
    console.warn('Failed to save battle record:', error);
  }
}

export function getBattleHistory(): BattleRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BATTLE_HISTORY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load battle history:', error);
    return [];
  }
}

export function clearBattleHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.BATTLE_HISTORY);
    console.log('🗑️ Battle history cleared');
  } catch (error) {
    console.warn('Failed to clear battle history:', error);
  }
}

// ─── Game Statistics ───────────────────────────────────────────────

export function updateGameStats(winner: 1 | 2 | null): void {
  try {
    const stats = getGameStats();
    
    stats.totalBattles++;
    stats.lastPlayed = Date.now();
    
    if (winner === 1) {
      stats.player1Wins++;
    } else if (winner === 2) {
      stats.player2Wins++;
    } else {
      stats.draws++;
    }
    
    localStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(stats));
    console.log('📊 Game stats updated');
  } catch (error) {
    console.warn('Failed to update game stats:', error);
  }
}

export function getGameStats(): GameStats {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.GAME_STATS);
    return stored ? JSON.parse(stored) : {
      totalBattles: 0,
      player1Wins: 0,
      player2Wins: 0,
      draws: 0,
      lastPlayed: 0,
    };
  } catch (error) {
    console.warn('Failed to load game stats:', error);
    return {
      totalBattles: 0,
      player1Wins: 0,
      player2Wins: 0,
      draws: 0,
      lastPlayed: 0,
    };
  }
}

export function resetGameStats(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_STATS);
    console.log('📊 Game stats reset');
  } catch (error) {
    console.warn('Failed to reset game stats:', error);
  }
}

// ─── Last Used Characters ──────────────────────────────────────────

interface SavedCharacters {
  player1?: { name: string; character: string; world: string };
  player2?: { name: string; character: string; world: string };
}

export function saveLastCharacters(characters: SavedCharacters): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_CHARACTERS, JSON.stringify(characters));
    console.log('💾 Last characters saved');
  } catch (error) {
    console.warn('Failed to save last characters:', error);
  }
}

export function getLastCharacters(): SavedCharacters {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_CHARACTERS);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Failed to load last characters:', error);
    return {};
  }
}

// ─── Export All ────────────────────────────────────────────────────

export const Storage = {
  // Battle history
  saveBattleRecord,
  getBattleHistory,
  clearBattleHistory,
  
  // Stats
  updateGameStats,
  getGameStats,
  resetGameStats,
  
  // Characters
  saveLastCharacters,
  getLastCharacters,
} as const;
