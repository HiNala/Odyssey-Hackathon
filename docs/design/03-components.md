# UI Component Specifications

## Overview

This document provides detailed specifications for each UI component in Odyssey Arena. Every component is designed to be self-contained, reusable, and styled consistently with the liquid glass aesthetic. Components are organized from largest (containers) to smallest (atoms).

Each component specification includes: purpose, props interface, visual reference, styling details, and implementation notes.

---

## 1. Arena (Container)

### Purpose
The root container that holds all game elements. Manages the background gradient and overall layout.

### Props Interface
```typescript
interface ArenaProps {
  children: React.ReactNode;
}
```

### Visual Reference
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗   │
│  ║                    ARENA CONTENT                          ║   │
│  ║                  (children go here)                       ║   │
│  ╚══════════════════════════════════════════════════════════╝   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Styling
```typescript
// src/components/Arena.tsx
const arenaClasses = `
  min-h-screen
  w-full
  bg-gradient-to-br
  from-sky-100
  via-sky-200
  to-pink-300
  flex
  flex-col
  items-center
  justify-center
  p-4
  lg:p-8
  pb-32  /* Space for fixed prompt bar */
  overflow-hidden
  relative
`;
```

### Implementation Notes
- Uses fixed positioning context for prompt bar
- Gradient should be subtle, not distracting
- Consider adding subtle animated background elements

---

## 2. PhoneScreen (Major Component)

### Purpose
Displays a phone-styled container with video stream, character info, and stat bars for one player.

### Props Interface
```typescript
interface PhoneScreenProps {
  player: 1 | 2;
  characterName: string;
  worldName: string;
  stats: PlayerStats;
  mediaStream: MediaStream | null;
  isActive: boolean;
  isStreaming: boolean;
}
```

### Visual Reference
```
┌─────────────────────────────────────┐
│         ●                           │  <- Phone frame
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │                               │  │
│  │       [VIDEO STREAM]          │  │
│  │        or placeholder         │  │
│  │                               │  │
│  │                               │  │
│  │───────────────────────────────│  │
│  │  Character: Cyber Samurai     │  │  <- Overlay
│  │  World: Neon Tokyo            │  │
│  │  ████████░░ Power: 65         │  │  <- Stats
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Styling
```typescript
// Phone outer frame
const phoneFrameClasses = `
  relative
  w-[280px]
  h-[560px]
  lg:w-[320px]
  lg:h-[640px]
  bg-slate-900/90
  rounded-[44px]
  p-2
  shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]
`;

// Phone inner screen
const phoneScreenClasses = `
  w-full
  h-full
  bg-black
  rounded-[36px]
  overflow-hidden
  relative
`;

// Video element
const videoClasses = `
  absolute
  inset-0
  w-full
  h-full
  object-cover
`;

// Bottom overlay
const overlayClasses = `
  absolute
  bottom-0
  left-0
  right-0
  p-4
  bg-gradient-to-t
  from-black/80
  via-black/40
  to-transparent
`;

// Active state glow
const activeGlowClasses = `
  ring-4
  ring-sky-400/50
  shadow-[0_0_30px_rgba(56,189,248,0.3)]
`;
```

### Implementation Notes
- Video element should autoplay, be muted, and playsinline
- Show placeholder image when no stream active
- Add subtle pulsing glow when it's this player's turn

---

## 3. CenterHUD (Major Component)

### Purpose
Central display showing VS indicator, momentum comparison, and battle event log.

### Props Interface
```typescript
interface CenterHUDProps {
  player1: PlayerState;
  player2: PlayerState;
  events: EventEntry[];
  activePlayer: 1 | 2;
}
```

### Visual Reference
```
┌────────────────────────────────────┐
│                                    │
│           ⚔️  VS  ⚔️               │
│                                    │
│  ┌────────────────────────────┐   │
│  │      MOMENTUM BARS         │   │
│  │  P1 ████████░░  ░░████████ P2 │   │
│  └────────────────────────────┘   │
│                                    │
│  ┌────────────────────────────┐   │
│  │        EVENT LOG           │   │
│  │  ⚡ Critical hit!          │   │
│  │  💥 Strong attack lands    │   │
│  │  🛡️ Defense successful     │   │
│  └────────────────────────────┘   │
│                                    │
└────────────────────────────────────┘
```

### Styling
```typescript
// HUD container
const hudContainerClasses = `
  flex
  flex-col
  items-center
  justify-center
  gap-6
  p-6
  bg-white/10
  backdrop-blur-xl
  border
  border-white/20
  rounded-3xl
  min-w-[300px]
  lg:min-w-[360px]
`;

// VS Badge container
const vsBadgeClasses = `
  flex
  items-center
  justify-center
  gap-4
  text-4xl
  lg:text-5xl
  font-bold
`;

// VS text
const vsTextClasses = `
  text-white
  drop-shadow-lg
  animate-pulse-soft
`;
```

### Implementation Notes
- VS badge should have subtle animation
- Event log scrolls automatically to newest
- Momentum bars should animate smoothly on changes

---

## 4. MomentumBar (Sub-component)

### Purpose
Visual bar showing a player's momentum score (0-100).

### Props Interface
```typescript
interface MomentumBarProps {
  value: number;        // 0-100
  player: 1 | 2;
  label?: string;
  showValue?: boolean;
  animate?: boolean;
}
```

### Visual Reference
```
┌──────────────────────────────────────────┐
│  P1: Cyber Samurai                       │
│  ████████████████████░░░░░░░░░░  65/100 │
└──────────────────────────────────────────┘
```

### Styling
```typescript
// Bar container
const barContainerClasses = `
  w-full
  flex
  flex-col
  gap-1
`;

// Bar background (empty)
const barBackgroundClasses = `
  h-4
  bg-white/10
  rounded-full
  overflow-hidden
`;

// Bar fill (Player 1 - blue tones)
const barFillP1Classes = `
  h-full
  bg-gradient-to-r
  from-sky-400
  via-cyan-400
  to-teal-400
  rounded-full
  transition-all
  duration-500
  ease-out
`;

// Bar fill (Player 2 - pink tones)
const barFillP2Classes = `
  h-full
  bg-gradient-to-r
  from-pink-400
  via-rose-400
  to-red-400
  rounded-full
  transition-all
  duration-500
  ease-out
`;

// Value label
const valueLabelClasses = `
  text-sm
  text-white/80
  font-medium
`;
```

### Implementation Notes
- Use CSS width transition for smooth animation
- Consider adding pulsing effect when near 0 or 100
- Optional: add tick marks at 25%, 50%, 75%

---

## 5. EventLog (Sub-component)

### Purpose
Scrollable list showing recent battle events with narrative descriptions.

### Props Interface
```typescript
interface EventLogProps {
  events: EventEntry[];
  maxVisible?: number;  // Default 5
}
```

### Visual Reference
```
┌────────────────────────────────────┐
│  ⚡ P1 landed a devastating blow!  │
│  💫 P2's defense crumbles          │
│  🔥 A critical hit connects!       │
│  ───────────────────────────────── │
│  🛡️ P1 raises their shield         │
│  💥 The attack is deflected        │
└────────────────────────────────────┘
```

### Styling
```typescript
// Log container
const logContainerClasses = `
  w-full
  max-h-[200px]
  overflow-y-auto
  flex
  flex-col
  gap-2
  pr-2
  scrollbar-thin
  scrollbar-thumb-white/20
  scrollbar-track-transparent
`;

// Individual event
const eventItemClasses = `
  text-sm
  text-white/90
  p-2
  bg-white/5
  rounded-lg
  border-l-2
`;

// Event border colors by impact
const eventBorderByImpact = {
  critical: 'border-red-400',
  strong: 'border-orange-400',
  normal: 'border-yellow-400',
  weak: 'border-slate-400',
  miss: 'border-slate-600',
};
```

### Implementation Notes
- Auto-scroll to bottom on new events
- Newest events should fade in with animation
- Consider adding timestamp or turn number

---

## 6. PromptBar (Major Component)

### Purpose
Input area for players to type actions. Includes player selector arrows and submit button.

### Props Interface
```typescript
interface PromptBarProps {
  activePlayer: 1 | 2;
  onSubmit: (action: string) => void;
  onSelectPlayer: (player: 1 | 2) => void;
  disabled?: boolean;
  placeholder?: string;
}
```

### Visual Reference
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│   ┌─────┐  ┌─────────────────────────────────────────┐  ┌─────┐ │
│   │ ⬅️  │  │  Describe your action...                │  │  ➡️ │ │
│   │ P1  │  │                                         │  │  P2 │ │
│   │ ●   │  └─────────────────────────────────────────┘  │     │ │
│   └─────┘                                               └─────┘ │
│                         [ EXECUTE ]                              │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Styling
```typescript
// Prompt bar container
const promptBarContainerClasses = `
  fixed
  bottom-0
  left-0
  right-0
  p-6
  flex
  justify-center
  z-30
  pointer-events-none  /* Allow clicks through background */
`;

// Inner bar (re-enable pointer events)
const promptBarInnerClasses = `
  w-full
  max-w-2xl
  bg-white/15
  backdrop-blur-xl
  border
  border-white/25
  rounded-2xl
  p-4
  shadow-glass-lg
  pointer-events-auto
`;

// Player selector button
const playerSelectorClasses = `
  w-14
  h-14
  flex
  flex-col
  items-center
  justify-center
  rounded-xl
  bg-white/10
  border
  border-white/20
  transition-all
  duration-200
  hover:bg-white/20
  cursor-pointer
`;

// Selected state
const selectorSelectedClasses = `
  bg-sky-400/20
  border-sky-400/50
  ring-2
  ring-sky-400/30
`;

// Input field
const inputFieldClasses = `
  flex-1
  bg-white/10
  border
  border-white/20
  rounded-xl
  px-4
  py-3
  text-slate-900
  placeholder:text-slate-500
  focus:outline-none
  focus:border-white/40
  focus:ring-2
  focus:ring-white/20
  transition-all
`;

// Submit button
const submitButtonClasses = `
  px-6
  py-3
  bg-gradient-to-r
  from-sky-400
  to-pink-400
  hover:from-sky-500
  hover:to-pink-500
  text-white
  font-semibold
  rounded-xl
  shadow-lg
  transition-all
  hover:shadow-xl
  hover:scale-105
  disabled:opacity-50
  disabled:cursor-not-allowed
  disabled:hover:scale-100
`;
```

### Implementation Notes
- Arrow keys could switch selected player
- Enter key submits the action
- Disable during action resolution
- Show visual feedback when switching players

---

## 7. VSBadge (Atom)

### Purpose
Animated "VS" indicator in the center of the HUD.

### Props Interface
```typescript
interface VSBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}
```

### Styling
```typescript
const vsBadgeClasses = `
  flex
  items-center
  justify-center
  w-20
  h-20
  lg:w-24
  lg:h-24
  rounded-full
  bg-gradient-to-br
  from-sky-400/20
  to-pink-400/20
  border
  border-white/30
  shadow-glass-glow
`;

const vsTextClasses = `
  text-3xl
  lg:text-4xl
  font-black
  text-white
  drop-shadow-lg
`;

// Animation classes
const vsAnimateClasses = `
  animate-pulse-soft
`;
```

---

## 8. StatBar (Atom)

### Purpose
Small stat bar for individual stats (power, defense, energy).

### Props Interface
```typescript
interface StatBarProps {
  stat: 'power' | 'defense' | 'energy';
  value: number;
  showLabel?: boolean;
}
```

### Styling
```typescript
// Stat colors
const statColors = {
  power: 'from-orange-400 to-red-400',
  defense: 'from-blue-400 to-indigo-400',
  energy: 'from-yellow-400 to-amber-400',
};

const statBarClasses = `
  h-2
  bg-white/10
  rounded-full
  overflow-hidden
`;

const statFillClasses = `
  h-full
  rounded-full
  transition-all
  duration-300
`;
```

---

## 9. PlayerLabel (Atom)

### Purpose
Display player name and character name.

### Props Interface
```typescript
interface PlayerLabelProps {
  name: string;
  character: string;
  world: string;
  isActive?: boolean;
}
```

### Styling
```typescript
const playerLabelClasses = `
  flex
  flex-col
  gap-1
`;

const nameClasses = `
  text-lg
  font-bold
  text-white
  drop-shadow-sm
`;

const characterClasses = `
  text-sm
  text-white/80
`;

const worldClasses = `
  text-xs
  text-white/60
  italic
`;
```

---

## 10. Button (Atom)

### Purpose
Reusable button component with variants.

### Props Interface
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}
```

### Styling
```typescript
const buttonBase = `
  font-medium
  rounded-xl
  transition-all
  duration-200
  disabled:opacity-50
  disabled:cursor-not-allowed
`;

const buttonVariants = {
  primary: `
    bg-gradient-to-r from-sky-400 to-pink-400
    hover:from-sky-500 hover:to-pink-500
    text-white shadow-lg hover:shadow-xl hover:scale-105
  `,
  secondary: `
    bg-white/10 border border-white/20
    hover:bg-white/20 text-white
  `,
  ghost: `
    bg-transparent hover:bg-white/10
    text-white/80 hover:text-white
  `,
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};
```

---

## Checklist

- [ ] Create `src/components/Arena.tsx`
- [ ] Create `src/components/PhoneScreen.tsx`
- [ ] Create `src/components/CenterHUD.tsx`
- [ ] Create `src/components/MomentumBar.tsx`
- [ ] Create `src/components/EventLog.tsx`
- [ ] Create `src/components/PromptBar.tsx`
- [ ] Create `src/components/VSBadge.tsx`
- [ ] Create `src/components/StatBar.tsx`
- [ ] Create `src/components/PlayerLabel.tsx`
- [ ] Create `src/components/Button.tsx`
- [ ] Test all components in isolation
- [ ] Verify styling consistency across components
- [ ] Add proper TypeScript types to all props
