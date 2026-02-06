/**
 * Framer Motion Animation Variants
 * Refined, intentional motion. No bouncing orbs. No gratuitous movement.
 * Every animation serves a purpose: entrance, feedback, or state change.
 */

import type { Variants, Transition } from 'framer-motion';

// ─── Timing & Easing ────────────────────────────────────────────────

export const timing = { fast: 0.15, normal: 0.25, slow: 0.4, verySlow: 0.6 };

export const easing = {
  smooth: [0.4, 0, 0.2, 1] as const,
  out: [0, 0, 0.2, 1] as const,
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
    transition: { duration: timing.slow, staggerChildren: 0.1 },
  },
};

// ─── Phone Frames ───────────────────────────────────────────────────

export const phoneVariants: Variants = {
  hidden: (side: 'left' | 'right') => ({
    opacity: 0,
    x: side === 'left' ? -40 : 40,
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: timing.slow, ease: easing.out },
  },
};

export const activeGlowVariants: Variants = {
  active: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  inactive: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

// ─── Center HUD ─────────────────────────────────────────────────────

export const hudVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: timing.slow, ease: easing.out, staggerChildren: 0.08 },
  },
};

export const vsPulseVariants: Variants = {
  pulse: {
    opacity: [0.6, 1, 0.6],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

// ─── Event Log Items ────────────────────────────────────────────────

export const eventItemVariants: Variants = {
  hidden: { opacity: 0, x: -12, height: 0 },
  visible: {
    opacity: 1,
    x: 0,
    height: 'auto',
    transition: { duration: timing.normal, ease: easing.out },
  },
  exit: { opacity: 0, x: 12, transition: { duration: timing.fast } },
};

// ─── Prompt Bar ─────────────────────────────────────────────────────

export const promptBarVariants: Variants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: timing.slow, ease: easing.out, delay: 0.2 },
  },
};

// ─── Victory Overlay ────────────────────────────────────────────────

export const victoryOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, staggerChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const victoryContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: timing.slow, ease: easing.out },
  },
};

// ─── Impact Shake ───────────────────────────────────────────────────

export const shakeVariants: Variants = {
  idle: { x: 0 },
  shake: {
    x: [0, -6, 6, -4, 4, 0],
    transition: { duration: 0.4 },
  },
  shakeHard: {
    x: [0, -12, 10, -8, 6, -3, 0],
    transition: { duration: 0.5 },
  },
};

// ─── Setup Form ─────────────────────────────────────────────────────

export const setupFormVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: timing.slow, ease: easing.out },
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

// ─── Fade ───────────────────────────────────────────────────────────

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: timing.normal } },
  exit: { opacity: 0, transition: { duration: timing.fast } },
};
