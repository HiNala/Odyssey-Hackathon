'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        variants={victoryContentVariants}
        className="glass rounded-3xl p-8 max-w-lg w-full mx-4 text-center space-y-6"
      >
        {/* Trophy */}
        <div className="text-6xl">🏆</div>

        {/* Winner Name */}
        <div>
          <h2
            className={cn(
              'text-3xl font-bold tracking-tight',
              isP1 ? 'text-player1-accent' : 'text-player2-accent'
            )}
          >
            {winner.name} Wins!
          </h2>
          <p className="text-white/50 text-sm mt-1">{winner.character}</p>
        </div>

        {/* Final Stats Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard label={winner.name} stats={winner.stats} accent={isP1 ? 'player1' : 'player2'} isWinner />
          <StatCard label={loser.name} stats={loser.stats} accent={isP1 ? 'player2' : 'player1'} />
        </div>

        {/* Play Again */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlayAgain}
          className="px-8 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm transition-colors"
        >
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
  return (
    <div className={cn('glass rounded-xl p-3 space-y-1', isWinner && 'ring-1 ring-white/20')}>
      <div className={cn('text-xs font-medium', accentColor)}>{label}</div>
      <div className="grid grid-cols-2 gap-1 text-[10px] text-white/60">
        <div>MTM: <span className="text-white/90">{stats.momentum}</span></div>
        <div>PWR: <span className="text-white/90">{stats.power}</span></div>
        <div>DEF: <span className="text-white/90">{stats.defense}</span></div>
        <div>NRG: <span className="text-white/90">{stats.energy}</span></div>
      </div>
    </div>
  );
}
