'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { hudVariants, vsPulseVariants, eventItemVariants } from '@/lib/animations';
import { getMomentumColor } from '@/lib/scoring';
import { Flame, Snowflake, Zap, ShieldCheck, TrendingDown } from 'lucide-react';
import type { ArenaState, StatusEffect } from '@/types/game';

interface CenterHUDProps {
  state: ArenaState;
}

export function CenterHUD({ state }: CenterHUDProps) {
  const { phase, players, eventLog, activePlayer, isProcessing, turnCount } = state;
  const [p1, p2] = players;
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [eventLog.length]);

  // Latest combo info
  const latestEvent = eventLog[eventLog.length - 1];
  const comboCount = latestEvent?.comboCount ?? 0;

  return (
    <motion.div
      variants={hudVariants}
      className="rounded-2xl border border-border bg-surface p-4 lg:p-5 w-full max-w-md flex flex-col gap-2.5"
      style={{ height: 'clamp(280px, 45vh, 520px)' }}
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-[10px] font-semibold text-text-muted tracking-[0.2em] uppercase">
            Battle Status
          </h2>
          {phase === 'battle' && turnCount > 0 && (
            <span className="text-[9px] text-text-muted/50 font-mono tabular-nums">
              Turn {turnCount}
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
      <div className="rounded-xl border border-border-subtle bg-surface-raised p-3 space-y-2.5">
        {/* P1 Momentum */}
        <div className="flex items-center gap-3">
          <motion.span
            key={`p1m-${p1.stats.momentum}`}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            className={cn('text-sm font-bold font-mono w-8 text-right tabular-nums', getMomentumColor(p1.stats.momentum))}
          >
            {p1.stats.momentum}
          </motion.span>
          <div className="flex-1 h-2.5 bg-fill-subtle rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-player1-accent/50 to-player1-accent"
              animate={{ width: `${p1.stats.momentum}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            />
          </div>
        </div>
        {/* P2 Momentum */}
        <div className="flex items-center gap-3">
          <motion.span
            key={`p2m-${p2.stats.momentum}`}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            className={cn('text-sm font-bold font-mono w-8 text-right tabular-nums', getMomentumColor(p2.stats.momentum))}
          >
            {p2.stats.momentum}
          </motion.span>
          <div className="flex-1 h-2.5 bg-fill-subtle rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-player2-accent/50 to-player2-accent"
              animate={{ width: `${p2.stats.momentum}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            />
          </div>
        </div>
      </div>

      {/* Status effects + stats grid */}
      {phase === 'battle' && (
        <div className="grid grid-cols-2 gap-2">
          <MiniStats player={p1} accent="player1" />
          <MiniStats player={p2} accent="player2" />
        </div>
      )}

      {/* Combo indicator */}
      <AnimatePresence>
        {comboCount > 1 && phase === 'battle' && (
          <motion.div
            key={`combo-${comboCount}-${latestEvent?.id}`}
            initial={{ opacity: 0, scale: 0.6, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="text-center"
          >
            <span className={cn(
              'inline-block px-3 py-0.5 rounded-full text-xs font-bold tracking-wider',
              latestEvent?.player === 1
                ? 'bg-player1-accent/15 text-player1-accent border border-player1-accent/20'
                : 'bg-player2-accent/15 text-player2-accent border border-player2-accent/20'
            )}>
              {comboCount}x COMBO
            </span>
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
                <span className="font-medium text-text-primary">
                  {state.players[event.player - 1].name}:
                </span>{' '}
                {event.result}
                {event.statusApplied && (
                  <span className="ml-1.5 inline-block">
                    <StatusIcon type={event.statusApplied} />
                  </span>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Turn indicator */}
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
                  ? 'text-player1-accent bg-player1-muted ring-1 ring-player1-accent/20'
                  : 'text-player2-accent bg-player2-muted ring-1 ring-player2-accent/20'
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

// ─── Status Effect Icons (lucide, no emojis) ────────────────────

const STATUS_ICONS: Record<string, { Icon: typeof Flame; label: string; color: string }> = {
  burning:  { Icon: Flame,        label: 'Burning',  color: 'text-orange-400' },
  frozen:   { Icon: Snowflake,    label: 'Frozen',   color: 'text-cyan-400' },
  powered:  { Icon: Zap,          label: 'Powered',  color: 'text-warning' },
  weakened: { Icon: TrendingDown,  label: 'Weakened', color: 'text-player2-accent/70' },
  shielded: { Icon: ShieldCheck,  label: 'Shielded', color: 'text-info' },
};

function StatusIcon({ type }: { type: string }) {
  const config = STATUS_ICONS[type];
  if (!config) return null;
  const { Icon, label, color } = config;
  return (
    <span title={label}>
      <Icon className={cn('w-3 h-3 inline-block', color)} strokeWidth={2} />
    </span>
  );
}

function StatusEffectBar({ effects }: { effects: StatusEffect[] }) {
  if (effects.length === 0) return null;
  return (
    <div className="flex gap-1 items-center">
      {effects.map((effect, i) => {
        const config = STATUS_ICONS[effect.type];
        if (!config) return null;
        const { Icon, label, color } = config;
        return (
          <motion.span
            key={`${effect.type}-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            title={`${label} (${effect.duration} turns)`}
          >
            <Icon className={cn('w-3 h-3', color)} strokeWidth={2} />
          </motion.span>
        );
      })}
    </div>
  );
}

// ─── MiniStats ───────────────────────────────────────────────────

function MiniStats({
  player,
  accent,
}: {
  player: { name: string; stats: { power: number; defense: number; energy: number }; statusEffects: StatusEffect[] };
  accent: 'player1' | 'player2';
}) {
  const isP1 = accent === 'player1';
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-2.5 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className={cn('text-[10px] font-medium truncate', isP1 ? 'text-player1-accent/80' : 'text-player2-accent/80')}>
          {player.name}
        </span>
        <StatusEffectBar effects={player.statusEffects} />
      </div>
      <div className="flex justify-between text-[10px] text-text-muted tabular-nums">
        <span>PWR {player.stats.power}</span>
        <span>DEF {player.stats.defense}</span>
      </div>
      {/* Visual energy bar */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between text-[9px] text-text-muted tabular-nums">
          <span>ENERGY</span>
          <span>{player.stats.energy}/100</span>
        </div>
        <div className="h-1.5 bg-fill-subtle rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full transition-colors',
              player.stats.energy > 50
                ? isP1 ? 'bg-player1-accent/70' : 'bg-player2-accent/70'
                : player.stats.energy > 20
                  ? 'bg-warning/60'
                  : 'bg-danger/60'
            )}
            animate={{ width: `${player.stats.energy}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          />
        </div>
      </div>
    </div>
  );
}
