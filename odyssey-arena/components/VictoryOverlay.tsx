'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Trophy, RotateCcw } from 'lucide-react';
import { victoryOverlayVariants, victoryContentVariants } from '@/lib/animations';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        variants={victoryContentVariants}
        className="panel-elevated rounded-2xl p-8 max-w-lg w-full mx-4 text-center space-y-6"
      >
        {/* Trophy Icon */}
        <div className={cn(
          'w-16 h-16 rounded-2xl mx-auto flex items-center justify-center',
          isP1 ? 'bg-player1-dim' : 'bg-player2-dim'
        )}>
          <Trophy className={cn(
            'w-8 h-8',
            isP1 ? 'text-player1-accent' : 'text-player2-accent'
          )} />
        </div>

        {/* Winner Name */}
        <div className="space-y-1">
          <h2
            className={cn(
              'text-2xl font-bold tracking-tight',
              isP1 ? 'text-player1-accent' : 'text-player2-accent'
            )}
          >
            {winner.name} Wins
          </h2>
          <p className="text-text-secondary text-sm">{winner.character}</p>
        </div>

        {/* Final Stats Comparison */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label={winner.name} stats={winner.stats} accent={isP1 ? 'player1' : 'player2'} isWinner />
          <StatCard label={loser.name} stats={loser.stats} accent={isP1 ? 'player2' : 'player1'} />
        </div>

        {/* Play Again */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onPlayAgain}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-surface-elevated border border-border hover:border-border-highlight text-text-primary font-medium text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
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
  const accentColor = accent === 'player1' ? 'text-player1-accent' : 'text-player2-accent';
  const borderAccent = accent === 'player1' ? 'border-player1-accent/20' : 'border-player2-accent/20';
  return (
    <div className={cn(
      'rounded-xl bg-surface-elevated border p-3 space-y-1.5',
      isWinner ? borderAccent : 'border-border'
    )}>
      <div className={cn('text-xs font-semibold', accentColor)}>{label}</div>
      <div className="grid grid-cols-2 gap-1 text-[10px] text-text-secondary font-mono tabular-nums">
        <div>MTM <span className="text-text-primary">{stats.momentum}</span></div>
        <div>PWR <span className="text-text-primary">{stats.power}</span></div>
        <div>DEF <span className="text-text-primary">{stats.defense}</span></div>
        <div>NRG <span className="text-text-primary">{stats.energy}</span></div>
      </div>
    </div>
  );
}
