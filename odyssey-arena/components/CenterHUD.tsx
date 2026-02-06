'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { hudVariants, vsPulseVariants, eventItemVariants } from '@/lib/animations';
import { getMomentumColor } from '@/lib/scoring';
import type { ArenaState, StatusEffect } from '@/types/game';

interface CenterHUDProps {
  state: ArenaState;
}

export function CenterHUD({ state }: CenterHUDProps) {
  const { phase, players, eventLog, activePlayer, isProcessing, turnCount } = state;
  const [p1, p2] = players;
  const logRef = useRef<HTMLDivElement>(null);
  const latestEvent = eventLog[eventLog.length - 1];

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [eventLog.length]);

  return (
    <motion.div
      variants={hudVariants}
      className="rounded-2xl border border-border bg-surface p-4 lg:p-5 w-full max-w-md flex flex-col gap-2.5"
      style={{ height: 'clamp(280px, 45vh, 520px)' }}
    >
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[10px] font-semibold text-text-muted tracking-[0.15em] uppercase">
            Battle
          </span>
          {phase === 'battle' && (
            <span className="text-[10px] font-mono text-text-muted tabular-nums">
              · Turn {turnCount}
            </span>
          )}
        </div>
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

      {/* Momentum bars with animated numbers */}
      <div className="rounded-xl border border-border-subtle bg-surface-raised p-3 space-y-2">
        {/* P1 */}
        <div className="flex items-center gap-3">
          <motion.span
            key={`p1m-${p1.stats.momentum}`}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            className={cn('text-sm font-bold font-mono w-8 text-right tabular-nums', getMomentumColor(p1.stats.momentum))}
          >
            {p1.stats.momentum}
          </motion.span>
          <div className="flex-1 h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-player1-accent/50 to-player1-accent"
              animate={{ width: `${p1.stats.momentum}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            />
          </div>
          {/* P1 Status Effects */}
          <StatusIcons effects={p1.statusEffects} />
        </div>
        {/* P2 */}
        <div className="flex items-center gap-3">
          <motion.span
            key={`p2m-${p2.stats.momentum}`}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            className={cn('text-sm font-bold font-mono w-8 text-right tabular-nums', getMomentumColor(p2.stats.momentum))}
          >
            {p2.stats.momentum}
          </motion.span>
          <div className="flex-1 h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-player2-accent/50 to-player2-accent"
              animate={{ width: `${p2.stats.momentum}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            />
          </div>
          {/* P2 Status Effects */}
          <StatusIcons effects={p2.statusEffects} />
        </div>
      </div>

      {/* Stats + Combo Row */}
      {phase === 'battle' && (
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <MiniStats player={p1} accent="player1" />
          <MiniStats player={p2} accent="player2" />
        </div>
      )}

      {/* Combo Counter */}
      <AnimatePresence>
        {latestEvent && latestEvent.comboCount && latestEvent.comboCount > 1 && (
          <motion.div
            key={`combo-${latestEvent.id}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={cn(
              'text-center py-1 rounded-lg font-bold text-sm',
              latestEvent.player === 1
                ? 'text-player1-accent bg-player1-muted'
                : 'text-player2-accent bg-player2-muted'
            )}
          >
            {latestEvent.comboCount}x COMBO!
          </motion.div>
        )}
      </AnimatePresence>

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
                <span className="font-medium text-white/80">
                  {state.players[event.player - 1].name}:
                </span>{' '}
                {event.result}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Turn Indicator */}
      <div className="text-center">
        {phase === 'idle' && <span className="text-[10px] text-text-muted">Ready</span>}
        {phase === 'setup' && <span className="text-[10px] text-text-muted">Player {state.setupPlayer} setup</span>}
        {phase === 'battle' && (
          isProcessing ? (
            <span className="text-[10px] text-text-muted flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse" />
              Resolving action...
            </span>
          ) : (
            <motion.div
              key={activePlayer}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'text-xs font-semibold tracking-wide py-1 px-3 rounded-full inline-block',
                activePlayer === 1
                  ? 'text-player1-accent bg-player1-muted border border-player1-accent/20'
                  : 'text-player2-accent bg-player2-muted border border-player2-accent/20'
              )}
            >
              {state.players[activePlayer - 1].name}&apos;s turn
            </motion.div>
          )
        )}
        {phase === 'victory' && <span className="text-[10px] text-text-muted">Battle complete</span>}
      </div>
    </motion.div>
  );
}

// ─── Status Effect Icons ────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  burning:  { icon: '🔥', color: 'text-orange-400', label: 'Burning' },
  frozen:   { icon: '❄️', color: 'text-cyan-400', label: 'Frozen' },
  powered:  { icon: '⚡', color: 'text-yellow-400', label: 'Powered' },
  weakened: { icon: '💔', color: 'text-purple-400', label: 'Weakened' },
  shielded: { icon: '🛡️', color: 'text-blue-400', label: 'Shielded' },
};

function StatusIcons({ effects }: { effects: StatusEffect[] }) {
  if (!effects || effects.length === 0) return null;
  return (
    <div className="flex gap-0.5 flex-shrink-0">
      {effects.map((effect) => {
        const config = STATUS_CONFIG[effect.type];
        if (!config) return null;
        return (
          <span
            key={effect.type}
            className="text-xs select-none"
            title={`${config.label} (${effect.duration} turns)`}
          >
            {config.icon}
          </span>
        );
      })}
    </div>
  );
}

// ─── Mini Stats Card ────────────────────────────────────────────────

function MiniStats({
  player,
  accent,
}: {
  player: { name: string; stats: { power: number; defense: number; energy: number }; combo: { count: number } };
  accent: 'player1' | 'player2';
}) {
  const isP1 = accent === 'player1';
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-raised p-2.5 space-y-1">
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
