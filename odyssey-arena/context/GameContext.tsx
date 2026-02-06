'use client';

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  type ReactNode,
  type Dispatch,
} from 'react';
import { gameReducer, createInitialState } from '@/lib/gameState';
import type { ArenaState, GameAction } from '@/types/game';

interface GameContextValue {
  state: ArenaState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <GameContext.Provider value={value}>{children}</GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
