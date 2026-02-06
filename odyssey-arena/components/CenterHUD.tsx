'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { hudVariants, vsPulseVariants, eventItemVariants } from '@/lib/animations';
import { getMomentumColor } from '@/lib/scoring';
import type { ArenaState } from '@/types/game';

interface CenterHUDProps {
  state: ArenaState;
}

export function CenterHUD({ state }: CenterHUDProps) {
  const { phase, players, eventLog, activePlayer, isProcessing } = state;
  const [p1, p2] = players;
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll event log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [eventLog.length]);

  return (
    <motion.div
      variants={hudVariants}
      className="glass rounded-2xl p-4 lg:p-5 w-full max-w-md flex flex-col gap-3"
      style={{ height: 'clamp(300px, 55vh, 600px)' }}
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white/90 tracking-wider">
          ODYSSEY ARENA
        </h2>
        <div className="flex items-center justify-center gap-3 mt-1">
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'w-2.5 h-2.5 rounded-full bg-player1-accent/80',
                activePlayer === 1 && phase === 'battle' && 'ring-2 ring-player1-accent/30'
              )}
            />
            <span className="text-xs text-white/70">{p1.name}</span>
          </div>
          <motion.span
            variants={vsPulseVariants}
            animate="pulse"
            className="text-white/50 font-bold text-xs"
          >
            VS
          </motion.span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-white/70">{p2.name}</span>
            <div
              className={cn(
                'w-2.5 h-2.5 rounded-full bg-player2-accent/80',
                activePlayer === 2 && phase === 'battle' && 'ring-2 ring-player2-accent/30'
              )}
            />
          </div>
        </div>
      </div>

      {/* Momentum Bars */}
      <div className="glass rounded-xl p-3 space-y-2">
        {/* P1 Momentum */}
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-mono w-8 text-right', getMomentumColor(p1.stats.momentum))}>
            {p1.stats.momentum}
          </span>
          <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-player1-accent/60 to-player1-accent"
              animate={{ width: `${p1.stats.momentum}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            />
          </div>
        </div>
        {/* P2 Momentum */}
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-mono w-8 text-right', getMomentumColor(p2.stats.momentum))}>
            {p2.stats.momentum}
          </span>
          <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-player2-accent/60 to-player2-accent"
              animate={{ width: `${p2.stats.momentum}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {phase === 'battle' && (
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <MiniStats player={p1} accent="player1" />
          <MiniStats player={p2} accent="player2" />
        </div>
      )}

      {/* Event Log */}
      <div ref={logRef} className="flex-1 glass rounded-xl p-3 overflow-y-auto min-h-0">
        <AnimatePresence initial={false}>
          {eventLog.length === 0 ? (
            <div className="text-white/40 text-xs italic text-center py-6">
              {phase === 'idle'
                ? 'Press Start Game to begin...'
                : phase === 'setup'
                  ? 'Setting up characters...'
                  : 'Send a prompt to begin the battle...'}
            </div>
          ) : (
            eventLog.map((event) => (
              <motion.div
                key={event.id}
                variants={eventItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn(
                  'text-xs px-2.5 py-1.5 rounded-lg mb-1.5',
                  event.player === 1
                    ? 'bg-player1-accent/10 text-player1-light border-l-2 border-player1-accent/40'
                    : 'bg-player2-accent/10 text-player2-light border-l-2 border-player2-accent/40'
                )}
              >
                <span className="font-medium">
                  {state.players[event.player - 1].name}:
                </span>{' '}
                {event.result}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="text-center text-[10px] text-white/40">
        {phase === 'idle' && 'Ready to begin'}
        {phase === 'setup' && `Setting up Player ${state.setupPlayer}...`}
        {phase === 'battle' &&
          (isProcessing
            ? 'Resolving action...'
            : `${state.players[activePlayer - 1].name}'s turn`)}
        {phase === 'victory' && 'Battle complete!'}
      </div>
    </motion.div>
  );
}

function MiniStats({
  player,
  accent,
}: {
  player: { name: string; stats: { power: number; defense: number; energy: number } };
  accent: 'player1' | 'player2';
}) {
  const color = accent === 'player1' ? 'text-player1-accent' : 'text-player2-accent';
  return (
    <div className="glass rounded-lg p-2 space-y-0.5">
      <div className={cn('font-medium truncate', color)}>{player.name}</div>
      <div className="flex justify-between text-white/50">
        <span>PWR {player.stats.power}</span>
        <span>DEF {player.stats.defense}</span>
        <span>NRG {player.stats.energy}</span>
      </div>
    </div>
  );
}
