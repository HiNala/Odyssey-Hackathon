'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { phoneVariants, activeGlowVariants } from '@/lib/animations';
import type { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
  className?: string;
  side: 'left' | 'right';
  label?: string;
  isActive?: boolean;
  playerName?: string;
}

export function PhoneFrame({
  children,
  className,
  side,
  label,
  isActive = false,
  playerName,
}: PhoneFrameProps) {
  const accentBorder =
    side === 'left' ? 'border-player1-accent/30' : 'border-player2-accent/30';

  return (
    <motion.div
      custom={side}
      variants={phoneVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={activeGlowVariants}
        animate={isActive ? 'active' : 'inactive'}
        className={cn(
          'glass glass-inset rounded-3xl p-3 lg:p-4',
          'w-full max-w-sm',
          'flex flex-col gap-2',
          accentBorder,
          className
        )}
        style={{ height: 'clamp(350px, 60vh, 600px)' }}
      >
        {/* Notch */}
        <div className="w-20 h-1 bg-white/30 rounded-full mx-auto" />

        {/* Label / Player Name */}
        {(label || playerName) && (
          <div
            className={cn(
              'text-center text-xs font-medium',
              side === 'left'
                ? 'text-player1-accent/80'
                : 'text-player2-accent/80'
            )}
          >
            {playerName || label}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden rounded-2xl">{children}</div>
      </motion.div>
    </motion.div>
  );
}
