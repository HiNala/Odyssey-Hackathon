'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { victoryOverlayVariants, victoryContentVariants } from '@/lib/animations';
import { Trophy, RotateCcw } from 'lucide-react';
import type { PlayerState } from '@/types/game';

interface VictoryOverlayProps {
  winner: PlayerState;
  loser: PlayerState;
  onPlayAgain: () => void;
}

export function VictoryOverlay({ winner, loser, onPlayAgain }: VictoryOverlayProps) {
  const isP1 = winner.id === 1;

  return (
    <motion.div
      variants={victoryOverlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-md"
    >
      <motion.div
        variants={victoryContentVariants}
        className="rounded-2xl border border-border bg-surface p-8 max-w-lg w-full mx-4 text-center space-y-6"
      >
        {/* Trophy icon */}
        <div className={cn(
          'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto',
          isP1 ? 'bg-player1-muted border border-player1-accent/20' : 'bg-player2-muted border border-player2-accent/20'
        )}>
          <Trophy
            className={cn('w-7 h-7', isP1 ? 'text-player1-accent' : 'text-player2-accent')}
            strokeWidth={1.5}
          />
        </div>

        {/* Winner */}
        <div className="space-y-1">
          <h2
            className={cn(
              'text-2xl font-bold tracking-tight',
              isP1 ? 'text-player1-accent' : 'text-player2-accent'
            )}
          >
            {winner.name} Wins
          </h2>
          <p className="text-text-muted text-sm">{winner.character}</p>
        </div>

        {/* Final stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label={winner.name} stats={winner.stats} accent={isP1 ? 'player1' : 'player2'} isWinner />
          <StatCard label={loser.name} stats={loser.stats} accent={isP1 ? 'player2' : 'player1'} />
        </div>

        {/* Play again */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPlayAgain}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border bg-surface-raised hover:bg-fill-subtle text-text-secondary hover:text-text-primary font-medium text-sm transition-all"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
          Play Again
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function StatCard({
  label,
  stats,
  accent,
  isWinner = false,
}: {
  label: string;
  stats: { momentum: number; power: number; defense: number; energy: number };
  accent: 'player1' | 'player2';
  isWinner?: boolean;
}) {
  const isP1 = accent === 'player1';
  return (
    <div className={cn(
      'rounded-xl border bg-surface-raised p-3 space-y-1.5',
      isWinner
        ? isP1 ? 'border-player1-accent/20' : 'border-player2-accent/20'
        : 'border-border'
    )}>
      <div className={cn('text-xs font-medium', isP1 ? 'text-player1-accent/80' : 'text-player2-accent/80')}>{label}</div>
      <div className="grid grid-cols-2 gap-1 text-[10px] text-text-muted tabular-nums">
        <div>MTM <span className="text-text-secondary">{stats.momentum}</span></div>
        <div>PWR <span className="text-text-secondary">{stats.power}</span></div>
        <div>DEF <span className="text-text-secondary">{stats.defense}</span></div>
        <div>NRG <span className="text-text-secondary">{stats.energy}</span></div>
      </div>
    </div>
  );
}
