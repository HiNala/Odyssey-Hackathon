'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ArenaState } from '@/types/game';

interface BattleOverlaysProps {
  state: ArenaState;
}

/**
 * BattleOverlays — Full-screen overlays for spectacle moments:
 * - Large combo counter (3+ combos)
 * - Dynamic commentary banners for hype moments
 * - Low HP warnings
 */
export function BattleOverlays({ state }: BattleOverlaysProps) {
  const { phase, players, eventLog } = state;
  const [p1, p2] = players;
  const latestEvent = eventLog[eventLog.length - 1];
  const comboCount = latestEvent?.comboCount ?? 0;

  // Determine if there's a hype commentary to show
  const commentary = useMemo(() => {
    if (phase !== 'battle' || !latestEvent) return null;

    const opponent = latestEvent.player === 1 ? p2 : p1;
    const active = latestEvent.player === 1 ? p1 : p2;

    // Low HP threshold crossed
    if (opponent.stats.momentum <= 20 && opponent.stats.momentum > 0) {
      return { text: `${opponent.name} is on the ropes!`, type: 'danger' as const };
    }

    // Comeback detection: you were low but dealt big damage
    if (active.stats.momentum <= 30 && latestEvent.impactType === 'critical') {
      return { text: 'Against all odds!', type: 'success' as const };
    }

    // Close battle
    if (p1.stats.momentum <= 40 && p2.stats.momentum <= 40 && p1.stats.momentum > 0 && p2.stats.momentum > 0) {
      return { text: "It's anyone's game!", type: 'neutral' as const };
    }

    // Big combo
    if (comboCount === 3) {
      return { text: 'UNSTOPPABLE!', type: 'combo' as const };
    }
    if (comboCount >= 5) {
      return { text: 'LEGENDARY STREAK!', type: 'combo' as const };
    }

    return null;
  }, [phase, latestEvent, p1, p2, comboCount]);

  if (phase !== 'battle') return null;

  return (
    <>
      {/* Large Combo Counter (overlays the whole battle area) */}
      <AnimatePresence>
        {comboCount >= 3 && (
          <motion.div
            key={`big-combo-${comboCount}-${latestEvent?.id}`}
            initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
            animate={{ opacity: [0, 1, 1, 0.8], scale: [0.3, 1.3, 1.1, 1], rotate: [-15, 3, 0, 0] }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 1.2, times: [0, 0.15, 0.4, 1] }}
            className="absolute top-[15%] left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className={cn(
                  'text-6xl lg:text-8xl font-black tabular-nums select-none',
                  latestEvent?.player === 1
                    ? 'text-player1-accent drop-shadow-[0_0_40px_rgba(59,130,246,0.5)]'
                    : 'text-player2-accent drop-shadow-[0_0_40px_rgba(239,68,68,0.5)]'
                )}
              >
                {comboCount}x
              </motion.div>
              <div className="text-lg lg:text-2xl font-bold text-white/80 tracking-widest mt-1">
                COMBO
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Commentary Banner */}
      <AnimatePresence>
        {commentary && (
          <motion.div
            key={`commentary-${latestEvent?.id}-${commentary.text}`}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -10], scale: [0.9, 1, 1, 0.95] }}
            transition={{ duration: 2.5, times: [0, 0.1, 0.7, 1] }}
            className="absolute bottom-[20%] left-1/2 -translate-x-1/2 z-35 pointer-events-none"
          >
            <div
              className={cn(
                'px-5 py-2 rounded-full text-sm lg:text-base font-bold tracking-wide backdrop-blur-sm border select-none whitespace-nowrap',
                commentary.type === 'danger' && 'bg-red-500/20 border-red-500/30 text-red-300',
                commentary.type === 'success' && 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
                commentary.type === 'neutral' && 'bg-white/10 border-white/20 text-white/80',
                commentary.type === 'combo' && 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300',
              )}
            >
              {commentary.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
