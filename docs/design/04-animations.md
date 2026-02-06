# Animation & Motion Design

## Overview

Animations in Odyssey Arena serve two critical purposes: making the UI feel alive and premium, and communicating game state changes clearly. We use Framer Motion for declarative, physics-based animations that feel natural and responsive.

The animation philosophy is: **subtle but noticeable**. Every motion should have a purpose. Don't animate for the sake of animating — animate to guide attention, provide feedback, and create delight.

---

## Animation Library Setup

### Install Framer Motion

```bash
npm install framer-motion
```

### Global Animation Variants

Create a shared animation config:

```typescript
// src/lib/animations.ts

import { Variants, Transition } from 'framer-motion';

// Standard timing
export const timing = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  verySlow: 0.8,
};

// Standard easing (using CSS cubic-bezier values)
export const easing = {
  smooth: [0.4, 0, 0.2, 1],       // Material Design standard
  bounce: [0.68, -0.55, 0.265, 1.55], // Slight overshoot
  sharp: [0.4, 0, 0.6, 1],       // Quick start, slow end
  gentle: [0.25, 0.1, 0.25, 1],  // Very smooth
};

// Default transition
export const defaultTransition: Transition = {
  duration: timing.normal,
  ease: easing.smooth,
};
```

---

## Component Animations

### 1. Page/Container Entrance

When the arena first loads:

```typescript
// Arena entrance animation
export const arenaVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: timing.slow,
      staggerChildren: 0.2,
    },
  },
};

// Usage
<motion.div
  variants={arenaVariants}
  initial="hidden"
  animate="visible"
>
  {/* children */}
</motion.div>
```

### 2. Phone Screen Entrance

Phones slide in from sides with slight rotation:

```typescript
// Phone entrance variants
export const phoneVariants: Variants = {
  hidden: (player: 1 | 2) => ({
    opacity: 0,
    x: player === 1 ? -100 : 100,
    rotateY: player === 1 ? -15 : 15,
    scale: 0.9,
  }),
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

// Idle floating animation
export const phoneFloatVariants: Variants = {
  float: {
    y: [0, -8, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Usage
<motion.div
  custom={player}
  variants={phoneVariants}
  initial="hidden"
  animate="visible"
>
  <motion.div
    animate="float"
    variants={phoneFloatVariants}
  >
    <PhoneScreen />
  </motion.div>
</motion.div>
```

### 3. Center HUD Entrance

HUD scales up from center:

```typescript
export const hudVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 12,
      staggerChildren: 0.1,
    },
  },
};
```

### 4. VS Badge Pulse

Continuous subtle pulse:

```typescript
export const vsPulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.9, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Glow animation (for ring)
export const vsGlowVariants: Variants = {
  glow: {
    boxShadow: [
      '0 0 20px rgba(255,255,255,0.2)',
      '0 0 40px rgba(255,255,255,0.4)',
      '0 0 20px rgba(255,255,255,0.2)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
```

### 5. Momentum Bar Animation

Smooth width transitions:

```typescript
// MomentumBar component
function MomentumBar({ value, player }: MomentumBarProps) {
  return (
    <div className="h-4 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${player === 1 ? barFillP1 : barFillP2}`}
        initial={{ width: '50%' }}
        animate={{ width: `${value}%` }}
        transition={{
          type: 'spring',
          stiffness: 50,
          damping: 15,
        }}
      />
    </div>
  );
}

// Pulse when near victory/defeat
export const dangerPulseVariants: Variants = {
  danger: {
    opacity: [1, 0.7, 1],
    transition: {
      duration: 0.5,
      repeat: Infinity,
    },
  },
  normal: {
    opacity: 1,
  },
};
```

### 6. Event Log Item Animation

New events slide in and fade:

```typescript
export const eventItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
    height: 0,
  },
  visible: {
    opacity: 1,
    x: 0,
    height: 'auto',
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: timing.fast,
    },
  },
};

// Usage with AnimatePresence
<AnimatePresence mode="popLayout">
  {events.map((event) => (
    <motion.div
      key={event.id}
      variants={eventItemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      {event.result}
    </motion.div>
  ))}
</AnimatePresence>
```

### 7. Prompt Bar Slide Up

Enters from bottom:

```typescript
export const promptBarVariants: Variants = {
  hidden: {
    y: 100,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      delay: 0.5, // Wait for other elements
    },
  },
};
```

### 8. Player Selector Animation

Indicate selected player:

```typescript
export const selectorVariants: Variants = {
  inactive: {
    scale: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  active: {
    scale: 1.05,
    backgroundColor: 'rgba(56,189,248,0.2)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  tap: {
    scale: 0.95,
  },
};

// Usage
<motion.button
  variants={selectorVariants}
  initial="inactive"
  animate={isSelected ? 'active' : 'inactive'}
  whileTap="tap"
>
  P1
</motion.button>
```

---

## Battle Effect Animations

### 9. Impact Shake (Screen Shake)

When a powerful action lands:

```typescript
// Shake animation for the whole arena or phones
export const shakeVariants: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
    },
  },
  shakeHard: {
    x: [0, -20, 20, -15, 15, -10, 10, 0],
    transition: {
      duration: 0.5,
    },
  },
};

// Usage - trigger based on impact type
function useImpactShake(impactType: EventEntry['impactType']) {
  const controls = useAnimationControls();

  useEffect(() => {
    if (impactType === 'critical') {
      controls.start('shakeHard');
    } else if (impactType === 'strong') {
      controls.start('shake');
    }
  }, [impactType, controls]);

  return controls;
}
```

### 10. Stat Change Flash

Flash the stat bar when it changes:

```typescript
export const statFlashVariants: Variants = {
  flash: {
    backgroundColor: [
      'rgba(255,255,255,0)',
      'rgba(255,255,255,0.3)',
      'rgba(255,255,255,0)',
    ],
    transition: {
      duration: 0.3,
    },
  },
};

// Change indicator (up/down arrow)
export const changeIndicatorVariants: Variants = {
  increase: {
    y: [0, -10, 0],
    opacity: [1, 1, 0],
    transition: {
      duration: 0.6,
    },
  },
  decrease: {
    y: [0, 10, 0],
    opacity: [1, 1, 0],
    transition: {
      duration: 0.6,
    },
  },
};
```

### 11. Active Player Highlight

Glow effect on active player's phone:

```typescript
export const activeGlowVariants: Variants = {
  active: {
    boxShadow: [
      '0 0 20px rgba(56,189,248,0.3)',
      '0 0 40px rgba(56,189,248,0.5)',
      '0 0 20px rgba(56,189,248,0.3)',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  inactive: {
    boxShadow: '0 0 0px rgba(56,189,248,0)',
    transition: {
      duration: 0.3,
    },
  },
};
```

---

## Overlay Animations

### 12. Victory Overlay

Dramatic entrance for winner announcement:

```typescript
export const victoryOverlayVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.2,
    },
  },
};

export const victoryContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

// Confetti-like particles
export const confettiVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -100,
    rotate: 0,
  },
  visible: (i: number) => ({
    opacity: [1, 1, 0],
    y: 500,
    rotate: 360 * (i % 2 === 0 ? 1 : -1),
    transition: {
      duration: 2 + Math.random(),
      delay: Math.random() * 0.5,
      ease: 'easeIn',
    },
  }),
};
```

### 13. Setup Phase Transition

Transition from setup to battle:

```typescript
export const phaseTransitionVariants: Variants = {
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.3,
    },
  },
  enter: {
    opacity: [0, 1],
    scale: [0.9, 1],
    transition: {
      duration: 0.5,
      ease: easing.bounce,
    },
  },
};
```

---

## CSS Animations (Fallback/Global)

For simpler animations that don't need Framer Motion:

```css
/* src/app/globals.css */

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.2); }
  50% { box-shadow: 0 0 40px rgba(255,255,255,0.4); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-10px); }
  40% { transform: translateX(10px); }
  60% { transform: translateX(-10px); }
  80% { transform: translateX(10px); }
}

@keyframes shake-hard {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-20px); }
  20% { transform: translateX(20px); }
  30% { transform: translateX(-15px); }
  40% { transform: translateX(15px); }
  50% { transform: translateX(-10px); }
  60% { transform: translateX(10px); }
  70% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Utility classes */
.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-pulse-soft {
  animation: pulse-soft 2s ease-in-out infinite;
}

.animate-glow-pulse {
  animation: glow-pulse 2s ease-in-out infinite;
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}

.animate-shake-hard {
  animation: shake-hard 0.5s ease-in-out;
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
```

---

## Animation Guidelines

### DO ✅
- Use spring animations for interactive elements (buttons, cards)
- Stagger children animations for groups
- Use layout animations for list reordering
- Keep durations short (0.2-0.5s for most things)
- Use easing that matches the action (bouncy for playful, smooth for serious)

### DON'T ❌
- Animate everything constantly (fatigue)
- Use linear easing (feels robotic)
- Make animations too long (>1s blocks interaction)
- Animate layout-affecting properties unnecessarily (janky)
- Forget about reduced-motion preferences

### Accessibility: Reduced Motion

Respect user preferences:

```typescript
// Hook to detect reduced motion preference
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// Usage
const prefersReducedMotion = usePrefersReducedMotion();
const transition = prefersReducedMotion 
  ? { duration: 0 } 
  : { type: 'spring', stiffness: 100 };
```

---

## Checklist

- [ ] Install framer-motion
- [ ] Create `src/lib/animations.ts` with variants
- [ ] Add CSS keyframes to globals.css
- [ ] Implement phone entrance animations
- [ ] Implement HUD animations
- [ ] Implement momentum bar transitions
- [ ] Implement event log animations
- [ ] Implement battle impact effects (shake)
- [ ] Implement victory overlay
- [ ] Add reduced motion support
- [ ] Test animations at 60fps
- [ ] Verify animations don't cause layout shifts
