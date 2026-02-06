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

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [eventLog.length]);

  return (
    <motion.div
      variants={hudVariants}
      className="rounded-2xl border border-border bg-surface p-4 lg:p-5 w-full max-w-md flex flex-col gap-3"
      style={{ height: 'clamp(300px, 55vh, 600px)' }}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-sm font-semibold text-text-secondary tracking-[0.2em] uppercase">
          Battle Status
        </h2>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full bg-player1-accent transition-all',
                activePlayer === 1 && phase === 'battle' && 'ring-2 ring-player1-accent/20 ring-offset-1 ring-offset-surface'
              )}
            />
            <span className="text-xs text-text-secondary font-medium">{p1.name}</span>
          </div>
          <motion.span
            variants={vsPulseVariants}
            animate="pulse"
            className="text-text-muted font-semibold text-[10px] tracking-widest"
          >
            VS
          </motion.span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-medium">{p2.name}</span>
            <div
              className={cn(
                'w-2 h-2 rounded-full bg-player2-accent transition-all',
                activePlayer === 2 && phase === 'battle' && 'ring-2 ring-player2-accent/20 ring-offset-1 ring-offset-surface'
              )}
            />
          </div>
        </div>
      </div>

      {/* Momentum bars */}
      <div className="rounded-xl border border-border-subtle bg-surface-raised p-3 space-y-2.5">
        {/* P1 */}
        <div className="flex items-center gap-3">
          <span className={cn('text-[10px] font-mono w-7 text-right tabular-nums', getMomentumColor(p1.stats.momentum))}>
            {p1.stats.momentum}
          </span>
          <div className="flex-1 h-2 bg-fill-subtle rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-player1-accent/50 to-player1-accent"
              animate={{ width: `${p1.stats.momentum}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            />
          </div>
        </div>
        {/* P2 */}
        <div className="flex items-center gap-3">
          <span className={cn('text-[10px] font-mono w-7 text-right tabular-nums', getMomentumColor(p2.stats.momentum))}>
            {p2.stats.momentum}
          </span>
          <div className="flex-1 h-2 bg-fill-subtle rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-player2-accent/50 to-player2-accent"
              animate={{ width: `${p2.stats.momentum}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      {phase === 'battle' && (
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <MiniStats player={p1} accent="player1" />
          <MiniStats player={p2} accent="player2" />
        </div>
      )}

      {/* Event log */}
      <div ref={logRef} className="flex-1 rounded-xl border border-border-subtle bg-surface-raised p-3 overflow-y-auto min-h-0 scrollbar-thin">
        <AnimatePresence initial={false}>
          {eventLog.length === 0 ? (
            <div className="text-text-muted text-xs text-center py-6">
              {phase === 'idle'
                ? 'Press Start Game to begin'
                : phase === 'setup'
                  ? 'Setting up characters'
                  : 'Send a prompt to begin the battle'}
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
                  'text-xs px-3 py-2 rounded-lg mb-1.5 border-l-2',
                  event.player === 1
                    ? 'bg-player1-muted text-player1-light/80 border-player1-accent/30'
                    : 'bg-player2-muted text-player2-light/80 border-player2-accent/30'
                )}
              >
                <span className="font-medium text-text-primary">
                  {state.players[event.player - 1].name}:
                </span>{' '}
                {event.result}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Status bar */}
      <div className="text-center text-[10px] text-text-muted font-medium">
        {phase === 'idle' && 'Ready'}
        {phase === 'setup' && `Player ${state.setupPlayer} setup`}
        {phase === 'battle' &&
          (isProcessing
            ? 'Resolving action...'
            : `${state.players[activePlayer - 1].name}'s turn`)}
        {phase === 'victory' && 'Battle complete'}
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
  const isP1 = accent === 'player1';
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-2.5 space-y-1">
      <div className={cn('text-[10px] font-medium truncate', isP1 ? 'text-player1-accent/80' : 'text-player2-accent/80')}>
        {player.name}
      </div>
      <div className="flex justify-between text-[10px] text-text-muted tabular-nums">
        <span>PWR {player.stats.power}</span>
        <span>DEF {player.stats.defense}</span>
        <span>NRG {player.stats.energy}</span>
      </div>
    </div>
  );
}
