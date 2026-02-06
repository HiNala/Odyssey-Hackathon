'use client';

import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Mic } from 'lucide-react';
import type { ArenaState } from '@/types/game';

interface BattleOverlaysProps {
  state: ArenaState;
}

/**
 * BattleOverlays — Full-screen overlays for spectacle moments:
 * - Live ESPN-style commentary banner (Gemini narrative for EVERY action)
 * - Gemini-powered battle opening announcement
 * - Large combo counter (3+ combos)
 * - Situational hype callouts
 */
export function BattleOverlays({ state }: BattleOverlaysProps) {
  const { phase, players, eventLog } = state;
  const [p1, p2] = players;
  const latestEvent = eventLog[eventLog.length - 1];
  const comboCount = latestEvent?.comboCount ?? 0;

  // Track the narrative for the live commentary banner
  const [showNarrative, setShowNarrative] = useState(false);
  const [openingShown, setOpeningShown] = useState(false);
  const [openingText, setOpeningText] = useState<string | null>(null);
  const prevEventIdRef = useRef<string | null>(null);

  // Fetch opening commentary from Gemini
  const fetchOpeningCommentary = useCallback(async () => {
    const fallback = `${p1.character || p1.name} vs ${p2.character || p2.name} -- the battle begins!`;
    try {
      const res = await fetch('/api/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'opening',
          character1: p1.character || p1.name,
          character2: p2.character || p2.name,
          world: p1.world || p2.world || null,
        }),
      });
      const data = await res.json();
      return data.commentary || fallback;
    } catch {
      return fallback;
    }
  }, [p1, p2]);

  // Battle opening commentary
  useEffect(() => {
    if (phase === 'battle' && eventLog.length === 0 && !openingShown) {
      setOpeningShown(true);
      fetchOpeningCommentary().then((text) => {
        setOpeningText(text);
        setTimeout(() => setOpeningText(null), 5000);
      });
    }
  }, [phase, eventLog.length, openingShown, fetchOpeningCommentary]);

  useEffect(() => {
    if (latestEvent && latestEvent.id !== prevEventIdRef.current && latestEvent.result) {
      prevEventIdRef.current = latestEvent.id;
      setShowNarrative(true);
      const timer = setTimeout(() => setShowNarrative(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [latestEvent]);

  // Determine if there's a hype callout to show (on top of the narrative)
  const hypeCallout = useMemo(() => {
    if (phase !== 'battle' || !latestEvent) return null;

    const opponent = latestEvent.player === 1 ? p2 : p1;
    const active = latestEvent.player === 1 ? p1 : p2;

    // Low HP threshold crossed
    if (opponent.stats.momentum <= 15 && opponent.stats.momentum > 0) {
      return { text: `${opponent.name} is on the ropes!`, type: 'danger' as const };
    }

    // Comeback detection
    if (active.stats.momentum <= 30 && latestEvent.impactType === 'critical') {
      return { text: 'WHAT A COMEBACK!', type: 'success' as const };
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
      {/* ── Live Commentary Banner (shows Gemini narrative for every action) ── */}
      <AnimatePresence>
        {showNarrative && latestEvent?.result && (
          <motion.div
            key={`commentary-${latestEvent.id}`}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-2xl px-4"
          >
            <div
              className={cn(
                'relative rounded-2xl px-6 py-4 border backdrop-blur-xl shadow-2xl',
                latestEvent.player === 1
                  ? 'bg-player1-accent/10 border-player1-accent/25 shadow-player1-accent/10'
                  : 'bg-player2-accent/10 border-player2-accent/25 shadow-player2-accent/10'
              )}
            >
              {/* Commentator icon */}
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5',
                    latestEvent.player === 1
                      ? 'bg-player1-accent/20'
                      : 'bg-player2-accent/20'
                  )}
                >
                  <Mic
                    className={cn(
                      'w-4 h-4',
                      latestEvent.player === 1 ? 'text-player1-accent' : 'text-player2-accent'
                    )}
                    strokeWidth={2}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-widest',
                        latestEvent.player === 1 ? 'text-player1-accent' : 'text-player2-accent'
                      )}
                    >
                      Live Commentary
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[9px] text-red-400/80 font-medium uppercase tracking-wider">Live</span>
                    </span>
                  </div>
                  <p className="text-sm lg:text-base text-text-primary font-medium leading-relaxed">
                    {latestEvent.result}
                  </p>
                  {/* Impact badge */}
                  {(latestEvent.impactType === 'critical' || latestEvent.impactType === 'strong') && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        'inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
                        latestEvent.impactType === 'critical'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                          : 'bg-warning/20 text-warning border border-warning/20'
                      )}
                    >
                      {latestEvent.impactType === 'critical' ? 'Critical Hit' : 'Strong Hit'}
                    </motion.span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Large Combo Counter ── */}
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
                    ? 'text-player1-accent drop-shadow-[0_0_40px_rgba(245,158,11,0.5)]'
                    : 'text-player2-accent drop-shadow-[0_0_40px_rgba(139,92,246,0.5)]'
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

      {/* ── Battle Opening Commentary (Gemini-powered) ── */}
      <AnimatePresence>
        {openingText && (
          <motion.div
            key="battle-opening"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-xl px-4"
          >
            <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl px-6 py-4 text-center shadow-2xl">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <Mic className="w-4 h-4 text-white/60" strokeWidth={2} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                  Live Commentary
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] text-red-400/80 font-medium uppercase tracking-wider">Live</span>
                </span>
              </div>
              <p className="text-base lg:text-lg text-text-primary font-semibold">
                {openingText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hype Callout (situational, on top of everything) ── */}
      <AnimatePresence>
        {hypeCallout && (
          <motion.div
            key={`hype-${latestEvent?.id}-${hypeCallout.text}`}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -10], scale: [0.9, 1, 1, 0.95] }}
            transition={{ duration: 2.5, times: [0, 0.1, 0.7, 1] }}
            className="absolute top-[35%] left-1/2 -translate-x-1/2 z-45 pointer-events-none"
          >
            <div
              className={cn(
                'px-6 py-2.5 rounded-full text-base lg:text-lg font-black tracking-wide backdrop-blur-sm border select-none whitespace-nowrap',
                hypeCallout.type === 'danger' && 'bg-red-500/20 border-red-500/30 text-red-300',
                hypeCallout.type === 'success' && 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
                hypeCallout.type === 'combo' && 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300',
              )}
            >
              {hypeCallout.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
