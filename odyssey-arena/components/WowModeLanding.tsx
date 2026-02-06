'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WowModeLandingProps {
  onSkip: () => void;
}

const SEQUENCES = [
  {
    duration: 2200,
    title: 'Two champions enter the arena',
    subtitle: 'AI generates their worlds in real time',
  },
  {
    duration: 2200,
    title: 'Every action reshapes reality',
    subtitle: 'Not a video. A living simulation.',
  },
  {
    duration: 2200,
    title: 'The battle begins now',
    subtitle: 'Welcome to Odyssey Arena',
  },
];

export function WowModeLanding({ onSkip }: WowModeLandingProps) {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  const handleSkip = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(onSkip, 400);
  }, [exiting, onSkip]);

  useEffect(() => {
    if (exiting) return;
    const current = SEQUENCES[step];
    const timer = setTimeout(() => {
      if (step < SEQUENCES.length - 1) {
        setStep((s) => s + 1);
      } else {
        handleSkip();
      }
    }, current.duration);
    return () => clearTimeout(timer);
  }, [step, exiting, handleSkip]);

  const current = SEQUENCES[step];
  const progress = ((step + 1) / SEQUENCES.length) * 100;

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
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleSkip();
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12)_0%,transparent_70%)]" />

          <div className="relative z-10 text-center space-y-6 max-w-xl px-6">
            <div className="mx-auto">
              <img src="/logo.svg" alt="Odyssey Arena" className="h-14 w-auto mx-auto" />
            </div>

            <AnimatePresence mode="wait">
              <motion.h1
                key={`title-${step}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="text-3xl lg:text-5xl font-black text-text-primary tracking-tight"
              >
                {current.title}
              </motion.h1>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${step}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-base lg:text-lg text-text-secondary"
              >
                {current.subtitle}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-52">
            <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white/25 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className="text-text-muted text-[10px] text-center mt-3 tracking-wide">
              Click anywhere to skip
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
