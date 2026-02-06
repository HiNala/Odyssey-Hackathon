# Visual Style Guide

## Overview

The visual style of Odyssey Arena draws inspiration from Apple's "Liquid Glass" aesthetic combined with soft, ethereal gradients. The goal is to create a UI that feels modern, premium, and slightly futuristic without being overwhelming. Think: a calm, beautiful canvas that lets the AI-generated video content be the star.

The color palette is deliberately soft and dreamy — sky blue fading into cotton candy pink — creating a pleasant, approachable atmosphere that contrasts nicely with the dramatic, high-energy content of the battles themselves.

---

## Color Palette

### Primary Gradient (Background)

The main arena background uses a soft diagonal gradient from sky blue to cotton candy pink:

```css
/* Background gradient */
background: linear-gradient(
  135deg,
  #E0F2FE 0%,    /* sky-100 - light sky blue */
  #BAE6FD 25%,   /* sky-200 - soft sky blue */
  #F9A8D4 75%,  /* pink-300 - cotton candy pink */
  #FBCFE8 100%   /* pink-200 - light pink */
);
```

### Tailwind Classes

```typescript
// Background classes for the arena
const backgroundClasses = `
  bg-gradient-to-br 
  from-sky-100 
  via-sky-200 
  to-pink-300
`;
```

### Extended Palette

| Purpose | Color | Tailwind | Hex |
|---------|-------|----------|-----|
| Background Light | Sky 100 | `sky-100` | #E0F2FE |
| Background Mid | Sky 200 | `sky-200` | #BAE6FD |
| Background Accent | Pink 300 | `pink-300` | #F9A8D4 |
| Glass Surface | White 10% | `white/10` | rgba(255,255,255,0.1) |
| Glass Border | White 20% | `white/20` | rgba(255,255,255,0.2) |
| Glass Highlight | White 30% | `white/30` | rgba(255,255,255,0.3) |
| Text Primary | Slate 900 | `slate-900` | #0F172A |
| Text Secondary | Slate 600 | `slate-600` | #475569 |
| Text Muted | Slate 400 | `slate-400` | #94A3B8 |
| Accent Blue | Sky 400 | `sky-400` | #38BDF8 |
| Accent Pink | Pink 400 | `pink-400` | #F472B6 |
| Success | Emerald 400 | `emerald-400` | #34D399 |
| Warning | Amber 400 | `amber-400` | #FBBF24 |
| Danger | Red 400 | `red-400` | #F87171 |

---

## Glassmorphism (Liquid Glass) Style

### Core Properties

The "liquid glass" effect is achieved through a combination of:
1. **Low-opacity white backgrounds** — `bg-white/10` to `bg-white/20`
2. **Backdrop blur** — `backdrop-blur-xl` (24px blur)
3. **Subtle borders** — `border border-white/20`
4. **Soft shadows** — Multi-layered, diffuse shadows
5. **Inner highlight** — Optional top border glow

### Glass Panel Classes

```typescript
// Standard glass panel
const glassPanelClasses = `
  bg-white/10
  backdrop-blur-xl
  border border-white/20
  rounded-2xl
  shadow-[0_8px_32px_rgba(0,0,0,0.08)]
`;

// Elevated glass panel (more prominent)
const glassElevatedClasses = `
  bg-white/15
  backdrop-blur-xl
  border border-white/25
  rounded-2xl
  shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_64px_rgba(255,255,255,0.05)]
`;

// Glass input field
const glassInputClasses = `
  bg-white/10
  backdrop-blur-md
  border border-white/20
  rounded-xl
  focus:border-white/40
  focus:ring-2
  focus:ring-white/20
  transition-all
`;
```

### Tailwind Custom Shadow (tailwind.config.ts)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.08)',
        'glass-lg': '0 8px 32px rgba(0,0,0,0.12), 0 0 64px rgba(255,255,255,0.05)',
        'glass-glow': '0 0 40px rgba(255,255,255,0.15)',
        'inner-glow': 'inset 0 1px 1px rgba(255,255,255,0.2)',
      },
    },
  },
};
```

---

## Phone Screen Styling

### Device Frame

The phone screens should look like modern smartphones with subtle frames:

```typescript
// Phone frame styling
const phoneFrameClasses = `
  relative
  w-[280px]
  h-[560px]
  bg-slate-900/80
  rounded-[40px]
  p-2
  shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]
`;

// Phone screen (inner content area)
const phoneScreenClasses = `
  w-full
  h-full
  bg-black
  rounded-[32px]
  overflow-hidden
  relative
`;

// Phone notch (optional, for realism)
const phoneNotchClasses = `
  absolute
  top-0
  left-1/2
  -translate-x-1/2
  w-24
  h-6
  bg-black
  rounded-b-2xl
  z-10
`;
```

### Screen Content Overlay

Add a subtle vignette or overlay for depth:

```typescript
// Screen vignette overlay
const screenVignetteClasses = `
  absolute
  inset-0
  pointer-events-none
  bg-gradient-to-t
  from-black/30
  via-transparent
  to-black/10
`;
```

---

## Typography

### Font Stack

Use system fonts for performance:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
};
```

### Type Scale

| Element | Class | Size | Weight |
|---------|-------|------|--------|
| Page Title | `text-4xl font-bold` | 36px | 700 |
| Section Title | `text-2xl font-semibold` | 24px | 600 |
| Card Title | `text-lg font-medium` | 18px | 500 |
| Body | `text-base` | 16px | 400 |
| Caption | `text-sm text-slate-600` | 14px | 400 |
| Micro | `text-xs text-slate-400` | 12px | 400 |

### Text Shadow for Readability

When text appears over gradient backgrounds:

```css
.text-shadow-soft {
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
```

---

## Depth & Shadow System

### Shadow Layers

Create depth through progressive shadow intensity:

```typescript
// Shadow scale
const shadows = {
  sm: '0 2px 4px rgba(0,0,0,0.05)',
  md: '0 4px 12px rgba(0,0,0,0.08)',
  lg: '0 8px 32px rgba(0,0,0,0.12)',
  xl: '0 16px 48px rgba(0,0,0,0.16)',
  phone: '0 25px 50px -12px rgba(0,0,0,0.5)',
};
```

### Z-Index Scale

```typescript
// z-index scale
const zIndex = {
  background: 0,
  phoneScreens: 10,
  centerHud: 20,
  promptBar: 30,
  overlays: 40,
  modals: 50,
};
```

---

## Gradient Accents

### Momentum Bar Gradients

```typescript
// Player 1 momentum (cool colors)
const player1MomentumGradient = `
  bg-gradient-to-r
  from-sky-400
  via-cyan-400
  to-teal-400
`;

// Player 2 momentum (warm colors)
const player2MomentumGradient = `
  bg-gradient-to-r
  from-pink-400
  via-rose-400
  to-red-400
`;
```

### Action Button Gradients

```typescript
// Primary action button
const primaryButtonClasses = `
  bg-gradient-to-r
  from-sky-400
  to-pink-400
  hover:from-sky-500
  hover:to-pink-500
  text-white
  font-medium
  px-6
  py-3
  rounded-full
  shadow-lg
  transition-all
  hover:shadow-xl
  hover:scale-105
`;
```

---

## Animation Keyframes

```css
/* globals.css */

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.2); }
  50% { box-shadow: 0 0 40px rgba(255,255,255,0.4); }
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-pulse-soft {
  animation: pulse-soft 2s ease-in-out infinite;
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}
```

---

## Dark Accents

For contrast elements like phone frames:

```typescript
// Dark glass (for phone frames)
const darkGlassClasses = `
  bg-slate-900/80
  backdrop-blur-xl
  border border-slate-700/50
`;

// Dark button
const darkButtonClasses = `
  bg-slate-800/80
  hover:bg-slate-700/80
  text-white
  border border-slate-600/50
  rounded-xl
  transition-all
`;
```

---

## Responsive Considerations

### Breakpoints

```typescript
// Responsive breakpoints
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
};

// Phone screen sizes responsive
const phoneResponsive = `
  w-[240px] h-[480px]      /* Default (mobile) */
  sm:w-[260px] sm:h-[520px] /* Small screens */
  lg:w-[280px] lg:h-[560px] /* Desktop */
  xl:w-[320px] xl:h-[640px] /* Large desktop */
`;
```

---

## Visual Style Summary

### DO ✅
- Use soft, low-contrast gradients
- Apply generous blur (24px+)
- Keep panels light and airy (white/10 to white/20)
- Use subtle shadows for depth
- Let video content be the star
- Maintain visual hierarchy

### DON'T ❌
- Use harsh, saturated colors
- Apply dark backgrounds to main elements
- Over-decorate with borders or patterns
- Make UI elements compete with video content
- Use flat, shadowless design
- Forget backdrop-blur on glass elements

---

## Checklist

- [ ] Set up Tailwind config with custom colors and shadows
- [ ] Create globals.css with animation keyframes
- [ ] Test background gradient on different screen sizes
- [ ] Verify glassmorphism effect looks correct
- [ ] Test contrast and readability of text on gradient
- [ ] Ensure phone frames have proper depth
- [ ] Check that video content is clearly visible
