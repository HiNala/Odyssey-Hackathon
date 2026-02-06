'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Mic } from 'lucide-react';

interface CommentaryBoxProps {
  commentary: string | null;
  /** Unique key to re-trigger the animation even if text is same */
  eventKey?: string;
  variant?: 'action' | 'start' | 'victory' | 'critical';
}

/**
 * Live AI Commentary overlay — the killer differentiator.
 * Animated banner that shows Gemini-generated play-by-play
 * like a sports commentator calling the action.
 */
export function CommentaryBox({
  commentary,
  eventKey = '',
  variant = 'action',
}: CommentaryBoxProps) {
  const [visible, setVisible] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (commentary) {
      setDisplayText(commentary);
      setVisible(true);

      // Clear previous timer
      if (timerRef.current) clearTimeout(timerRef.current);

      // Hide after delay (longer for victory/start)
      const duration = variant === 'victory' || variant === 'start' ? 6000 : 4500;
      timerRef.current = setTimeout(() => setVisible(false), duration);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [commentary, eventKey, variant]);

  const gradients = {
    action: 'from-indigo-600/95 via-purple-600/95 to-pink-600/95',
    start: 'from-emerald-600/95 via-teal-600/95 to-cyan-600/95',
    victory: 'from-amber-500/95 via-orange-500/95 to-red-500/95',
    critical: 'from-red-600/95 via-pink-600/95 to-rose-600/95',
  };

  const borders = {
    action: 'border-purple-400/40',
    start: 'border-emerald-400/40',
    victory: 'border-amber-400/40',
    critical: 'border-red-400/40',
  };

  return (
    <AnimatePresence>
      {visible && displayText && (
        <motion.div
          key={`commentary-${eventKey}`}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            mass: 0.8,
          }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div
            className={cn(
              'relative rounded-2xl px-7 py-4 shadow-2xl border backdrop-blur-sm',
              'bg-gradient-to-r',
              gradients[variant],
              borders[variant],
              'max-w-2xl'
            )}
          >
            {/* Mic icon */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Mic className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-white/5 animate-pulse" />

            {/* Text */}
            <p className="relative text-white font-bold text-base lg:text-lg text-center leading-snug tracking-wide drop-shadow-md">
              {displayText}
            </p>

            {/* Live indicator */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[9px] text-white/70 font-semibold tracking-widest uppercase">
                Live Commentary
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
