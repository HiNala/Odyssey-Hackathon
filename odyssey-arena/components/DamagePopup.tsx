'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ImpactType } from '@/types/game';

interface DamagePopupProps {
  /** The latest momentum change to display (positive = good, negative = bad) */
  value: number | null;
  /** Which side of the screen to show it */
  side: 'left' | 'right';
  /** Impact severity for styling */
  impact?: ImpactType;
  /** Unique key to re-trigger animation on each new event */
  eventKey?: string;
}

export function DamagePopup({ value, side, impact = 'normal', eventKey }: DamagePopupProps) {
  if (value === null || value === 0) return null;

  const isPositive = value > 0;

  const colorClass = isPositive
    ? 'text-emerald-400'
    : impact === 'critical'
      ? 'text-red-400'
      : impact === 'strong'
        ? 'text-orange-400'
        : 'text-red-300';

  const sizeClass =
    impact === 'critical' ? 'text-5xl' :
    impact === 'strong' ? 'text-4xl' :
    'text-3xl';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={eventKey || `${value}-${Date.now()}`}
        initial={{ opacity: 1, y: 0, scale: 0.5 }}
        animate={{ opacity: 0, y: -60, scale: 1.3 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className={cn(
          'absolute z-50 pointer-events-none font-bold drop-shadow-lg',
          side === 'left' ? 'left-1/3' : 'right-1/3',
          'top-1/3',
          sizeClass,
          colorClass,
        )}
      >
        {isPositive ? `+${value}` : value}
      </motion.div>
    </AnimatePresence>
  );
}
