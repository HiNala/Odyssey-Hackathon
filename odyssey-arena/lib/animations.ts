/**
 * Framer Motion Animation Variants
 * Centralized animation config for consistent motion design.
 */

import type { Variants, Transition } from 'framer-motion';

// ─── Timing & Easing ────────────────────────────────────────────────

export const timing = { fast: 0.15, normal: 0.3, slow: 0.5, verySlow: 0.8 };

export const easing = {
  smooth: [0.4, 0, 0.2, 1] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
  sharp: [0.4, 0, 0.6, 1] as const,
};

export const defaultTransition: Transition = {
  duration: timing.normal,
  ease: easing.smooth,
};

// ─── Arena Container ────────────────────────────────────────────────

export const arenaVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: timing.slow, staggerChildren: 0.15 },
  },
};

// ─── Phone Frames ───────────────────────────────────────────────────

export const phoneVariants: Variants = {
  hidden: (side: 'left' | 'right') => ({
    opacity: 0,
    x: side === 'left' ? -80 : 80,
    scale: 0.92,
  }),
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 90, damping: 14 },
  },
};

export const phoneFloatVariants: Variants = {
  float: {
    y: [0, -6, 0],
    transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const activeGlowVariants: Variants = {
  active: {
    boxShadow: [
      '0 0 8px rgba(56,189,248,0.12)',
      '0 0 16px rgba(56,189,248,0.22)',
      '0 0 8px rgba(56,189,248,0.12)',
    ],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
  inactive: {
    boxShadow: '0 0 0px rgba(56,189,248,0)',
    transition: { duration: 0.3 },
  },
};

// ─── Center HUD ─────────────────────────────────────────────────────

export const hudVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 12, staggerChildren: 0.1 },
  },
};

export const vsPulseVariants: Variants = {
  pulse: {
    scale: [1, 1.06, 1],
    opacity: [1, 0.85, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

// ─── Event Log Items ────────────────────────────────────────────────

export const eventItemVariants: Variants = {
  hidden: { opacity: 0, x: -20, height: 0 },
  visible: {
    opacity: 1,
    x: 0,
    height: 'auto',
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
  exit: { opacity: 0, x: 20, transition: { duration: timing.fast } },
};

// ─── Prompt Bar ─────────────────────────────────────────────────────

export const promptBarVariants: Variants = {
  hidden: { y: 60, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 90, damping: 14, delay: 0.4 },
  },
};

// ─── Victory Overlay ────────────────────────────────────────────────

export const victoryOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, staggerChildren: 0.15 },
  },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export const victoryContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 10 },
  },
};

// ─── Impact Shake ───────────────────────────────────────────────────

export const shakeVariants: Variants = {
  idle: { x: 0 },
  shake: {
    x: [0, -8, 8, -8, 8, 0],
    transition: { duration: 0.4 },
  },
  shakeHard: {
    x: [0, -16, 16, -12, 12, -8, 8, 0],
    transition: { duration: 0.5 },
  },
};

// ─── Setup Form ─────────────────────────────────────────────────────

export const setupFormVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 14 },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

// ─── Fade generic ───────────────────────────────────────────────────

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: timing.normal } },
  exit: { opacity: 0, transition: { duration: timing.fast } },
};
