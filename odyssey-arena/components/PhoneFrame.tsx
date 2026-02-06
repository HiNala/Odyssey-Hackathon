'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { phoneVariants } from '@/lib/animations';
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
  const isP1 = side === 'left';

  return (
    <motion.div
      custom={side}
      variants={phoneVariants}
      initial="hidden"
      animate="visible"
    >
      <div
        className={cn(
          'rounded-2xl p-[1px] w-full max-w-sm transition-all duration-500',
          isActive
            ? isP1
              ? 'bg-gradient-to-b from-player1-accent/30 via-player1-accent/10 to-transparent'
              : 'bg-gradient-to-b from-player2-accent/30 via-player2-accent/10 to-transparent'
            : 'bg-gradient-to-b from-white/[0.08] to-transparent',
          className
        )}
        style={{ height: 'clamp(350px, 60vh, 600px)' }}
      >
        <div className="h-full rounded-[calc(0.75rem-1px)] bg-surface flex flex-col gap-2 p-3 lg:p-4">
          {/* Notch — subtle indicator bar */}
          <div className="flex justify-center">
            <div
              className={cn(
                'w-16 h-[3px] rounded-full transition-colors duration-500',
                isActive
                  ? isP1 ? 'bg-player1-accent/40' : 'bg-player2-accent/40'
                  : 'bg-white/10'
              )}
            />
          </div>

          {/* Player label */}
          {(label || playerName) && (
            <div
              className={cn(
                'text-center text-xs font-medium tracking-wide',
                isP1 ? 'text-player1-accent/70' : 'text-player2-accent/70'
              )}
            >
              {playerName || label}
            </div>
          )}

          {/* Stream content */}
          <div className="flex-1 overflow-hidden rounded-xl bg-black/40">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}
