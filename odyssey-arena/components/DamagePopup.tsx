'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ImpactType } from '@/types/game';

interface DamagePopupProps {
  value: number | null;
  side: 'left' | 'right';
  impact?: ImpactType;
  eventKey?: string;
}

/**
 * DamagePopup — Clean, refined damage indicator.
 * Floats up and fades. No bouncing, no flash. Just clarity.
 */
export function DamagePopup({ value, side, impact = 'normal', eventKey }: DamagePopupProps) {
  if (value === null || value === 0) return null;

  const isPositive = value > 0;

  const colorClass = isPositive
    ? 'text-success'
    : impact === 'critical'
      ? 'text-danger'
      : impact === 'strong'
        ? 'text-warning'
        : 'text-danger/70';

  const sizeClass =
    impact === 'critical' ? 'text-4xl' :
    impact === 'strong' ? 'text-3xl' :
    'text-2xl';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={eventKey || `${value}`}
        initial={{ opacity: 1, y: 0, scale: 0.8 }}
        animate={{ opacity: 0, y: -40, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={cn(
          'absolute z-50 pointer-events-none font-bold font-mono',
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
