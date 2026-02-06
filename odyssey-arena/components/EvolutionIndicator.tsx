'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getEvolutionMeta } from '@/lib/evolution';
import type { EvolutionLevel } from '@/types/game';

interface EvolutionIndicatorProps {
  level: EvolutionLevel;
  side: 'left' | 'right';
  compact?: boolean;
}

/**
 * Small badge showing the character's current evolution level.
 * Placed on or near the PhoneFrame during battle.
 */
export function EvolutionIndicator({ level, side, compact = false }: EvolutionIndicatorProps) {
  const meta = getEvolutionMeta(level);

  // Don't show anything at base level to keep the UI clean
  if (level === 0) return null;

  const isEvolved = level > 0;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'absolute z-20 flex items-center gap-1.5',
        'rounded-full border px-2.5 py-1 backdrop-blur-sm',
        compact ? 'top-2' : 'top-3',
        side === 'left' ? (compact ? 'left-2' : 'left-3') : (compact ? 'right-2' : 'right-3'),
        isEvolved
          ? 'bg-yellow-500/15 border-yellow-400/30'
          : 'bg-red-500/15 border-red-400/30',
      )}
    >
      <motion.span
        animate={isEvolved ? { scale: [1, 1.15, 1] } : {}}
        transition={isEvolved ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
        className="text-sm select-none"
      >
        {meta.indicator}
      </motion.span>
      {!compact && (
        <span className={cn('text-[10px] font-bold tracking-wide', meta.color)}>
          {meta.name}
        </span>
      )}
    </motion.div>
  );
}

/**
 * Evolution progress bar — shows all 5 levels with the current one highlighted.
 * Used in the CenterHUD or victory screen.
 */
export function EvolutionBar({ level, side }: { level: EvolutionLevel; side: 'left' | 'right' }) {
  const isP1 = side === 'left';
  const segments = [-2, -1, 0, 1, 2] as const;

  return (
    <div className="flex items-center gap-0.5">
      {segments.map((seg) => {
        const isActive = seg === level;
        const isPast = (level > 0 && seg > 0 && seg <= level) || (level < 0 && seg < 0 && seg >= level) || seg === 0;
        return (
          <motion.div
            key={seg}
            animate={isActive ? { scale: [1, 1.2, 1] } : {}}
            transition={isActive ? { duration: 1, repeat: Infinity } : {}}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              isActive
                ? seg > 0
                  ? 'bg-yellow-400 shadow-sm shadow-yellow-400/50'
                  : seg < 0
                    ? 'bg-red-400 shadow-sm shadow-red-400/50'
                    : isP1 ? 'bg-player1-accent' : 'bg-player2-accent'
                : isPast
                  ? 'bg-white/20'
                  : 'bg-white/8',
            )}
            title={getEvolutionMeta(seg).name}
          />
        );
      })}
    </div>
  );
}
