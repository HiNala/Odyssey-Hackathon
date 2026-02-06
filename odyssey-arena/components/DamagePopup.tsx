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
 * DamagePopup — Juicy damage indicator with impact-scaled animations.
 * Critical hits get extra bounce. Strong hits float bigger. Weak hits are subtle.
 */
export function DamagePopup({ value, side, impact = 'normal', eventKey }: DamagePopupProps) {
  if (value === null || value === 0) return null;

  const isPositive = value > 0;
  const isCrit = impact === 'critical';

  const colorClass = isPositive
    ? 'text-success'
    : isCrit
      ? 'text-danger'
      : impact === 'strong'
        ? 'text-warning'
        : 'text-danger/70';

  const sizeClass = isCrit
    ? 'text-5xl lg:text-6xl'
    : impact === 'strong'
      ? 'text-3xl lg:text-4xl'
      : 'text-2xl';

  // Critical hits get a more dramatic animation
  const animateProps = isCrit
    ? {
        opacity: [1, 1, 0],
        y: [0, -30, -60],
        scale: [0.5, 1.4, 1.1],
        rotate: [0, -5, 3],
      }
    : {
        opacity: [1, 1, 0],
        y: [0, -30, -50],
        scale: [0.8, 1.1, 1],
      };

  const duration = isCrit ? 1.4 : 1;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={eventKey || `${value}`}
        initial={{ opacity: 0, y: 0, scale: 0.5 }}
        animate={animateProps}
        exit={{ opacity: 0 }}
        transition={{ duration, ease: 'easeOut', times: [0, 0.3, 1] }}
        className={cn(
          'absolute z-50 pointer-events-none font-black font-mono select-none',
          side === 'left' ? 'left-1/3' : 'right-1/3',
          'top-1/4',
          sizeClass,
          colorClass,
          isCrit && 'drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]',
          impact === 'strong' && 'drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]',
        )}
      >
        {isPositive ? `+${value}` : value}
      </motion.div>
    </AnimatePresence>
  );
}
