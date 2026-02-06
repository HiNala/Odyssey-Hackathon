'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getEvolutionMeta } from '@/lib/evolution';
import type { EvolutionLevel } from '@/types/game';

interface TransformationOverlayProps {
  characterName: string;
  fromLevel: EvolutionLevel;
  toLevel: EvolutionLevel;
  onComplete: () => void;
}

/**
 * Full-screen dramatic transformation overlay.
 * Shows for ~3 seconds when a character evolves or devolves.
 */
export function TransformationOverlay({
  characterName,
  fromLevel,
  toLevel,
  onComplete,
}: TransformationOverlayProps) {
  const isEvolution = toLevel > fromLevel;
  const meta = getEvolutionMeta(toLevel);
  const intensity = Math.abs(toLevel - fromLevel);

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const accentColor = isEvolution ? '#FBBF24' : '#EF4444';
  const bgGradient = isEvolution
    ? 'from-yellow-900/30 via-background/95 to-background'
    : 'from-red-900/30 via-background/95 to-background';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'fixed inset-0 z-[60] flex items-center justify-center',
        `bg-gradient-to-b ${bgGradient}`,
        'backdrop-blur-xl',
      )}
    >
      {/* Radial flash */}
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
        }}
      />

      {/* Energy particles */}
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, scale: 0, opacity: 0.8 }}
          animate={{
            x: (Math.random() - 0.5) * 600,
            y: (Math.random() - 0.5) * 400,
            scale: Math.random() * 1.5 + 0.5,
            opacity: 0,
          }}
          transition={{
            duration: 1.5 + Math.random() * 0.5,
            delay: Math.random() * 0.4,
            ease: 'easeOut',
          }}
          className="absolute w-2 h-2 rounded-full"
          style={{ background: accentColor }}
        />
      ))}

      <div className="text-center space-y-6 z-10">
        {/* Character name */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
          className="text-2xl lg:text-3xl font-bold text-white/90"
        >
          {characterName}
        </motion.div>

        {/* Evolution indicator */}
        <motion.div
          initial={{ scale: 0, rotate: isEvolution ? -180 : 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 150, damping: 12 }}
          className="text-7xl lg:text-8xl select-none"
        >
          {meta.indicator}
        </motion.div>

        {/* Transformation text */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div
            className={cn(
              'text-4xl lg:text-6xl font-black tracking-tighter select-none',
              isEvolution ? 'text-yellow-400' : 'text-red-400',
            )}
            style={{
              textShadow: `0 0 40px ${accentColor}`,
            }}
          >
            {isEvolution ? 'EVOLVING!' : 'DEVOLVING...'}
          </div>
        </motion.div>

        {/* Level transition */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex items-center justify-center gap-3 text-lg text-white/70"
        >
          <span className="font-mono">{getEvolutionMeta(fromLevel).name}</span>
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            {isEvolution ? '→' : '→'}
          </motion.span>
          <span
            className={cn('font-bold', isEvolution ? 'text-yellow-400' : 'text-red-400')}
          >
            {meta.name}
          </span>
        </motion.div>

        {/* Intensity label for dramatic effect */}
        {intensity >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7, 1] }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className={cn(
              'text-sm font-bold tracking-widest uppercase',
              isEvolution ? 'text-yellow-300/80' : 'text-red-300/80',
            )}
          >
            {isEvolution ? 'DOUBLE EVOLUTION!' : 'DEVASTATING DEVOLUTION!'}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
