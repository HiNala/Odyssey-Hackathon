'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Mic, Zap, Play } from 'lucide-react';

interface AutoDemoProps {
  onComplete: () => void;
}

const STEPS = [
  {
    duration: 3000,
    title: 'ODYSSEY ARENA',
    subtitle: 'Live AI Battle Simulation',
    icon: null,
  },
  {
    duration: 2500,
    title: 'Real-Time AI Video',
    subtitle: 'Odyssey-2 Pro generates every frame live',
    icon: Zap,
  },
  {
    duration: 2500,
    title: 'Live Commentary',
    subtitle: 'Gemini narrates every action like ESPN',
    icon: Mic,
  },
  {
    duration: 2500,
    title: 'Strategic Battles',
    subtitle: 'Momentum, combos, status effects, critical hits',
    icon: Swords,
  },
  {
    duration: 2500,
    title: 'Ready to Play?',
    subtitle: 'Click anywhere to enter the arena',
    icon: Play,
  },
];

export function AutoDemo({ onComplete }: AutoDemoProps) {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  const handleSkip = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    // Small delay so exit animation plays
    setTimeout(onComplete, 400);
  }, [onComplete, exiting]);

  useEffect(() => {
    if (exiting) return;
    const current = STEPS[step];
    const timer = setTimeout(() => {
      if (step < STEPS.length - 1) {
        setStep((s) => s + 1);
      } else {
        handleSkip();
      }
    }, current.duration);
    return () => clearTimeout(timer);
  }, [step, exiting, handleSkip]);

  const current = STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={handleSkip}
          className="fixed inset-0 z-100 flex flex-col items-center justify-center cursor-pointer bg-background"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSkip(); }}
        >
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)]" />

          {/* Content */}
          <div className="relative z-10 text-center space-y-6 max-w-xl px-6">
            {/* Icon */}
            <AnimatePresence mode="wait">
              {Icon && (
                <motion.div
                  key={`icon-${step}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="flex justify-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-white/70" strokeWidth={1.5} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Title */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={`title-${step}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-4xl lg:text-6xl font-black text-text-primary tracking-tighter"
              >
                {current.title}
              </motion.h1>
            </AnimatePresence>

            {/* Subtitle */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${step}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="text-lg lg:text-xl text-text-secondary"
              >
                {current.subtitle}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48">
            <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/20 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className="text-text-muted text-[10px] text-center mt-3 tracking-wide">
              Click anywhere to skip
            </p>
          </div>

          {/* Logo in corner */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <img src="/logo.svg" alt="Odyssey Arena" className="h-8 w-auto opacity-40" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
