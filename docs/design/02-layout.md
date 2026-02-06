# Layout Architecture

## Overview

The layout of Odyssey Arena is designed for immediate visual comprehension. At a glance, viewers should understand: two players, head-to-head, with a central conflict zone. The composition draws from fighting game UI conventions while maintaining a clean, modern aesthetic.

The layout uses CSS Grid for the main structure and Flexbox for component internals. Everything is centered on the viewport with fixed positioning for the prompt bar at the bottom.

---

## Master Layout Grid

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                 ARENA                                     │
│                          (Full viewport, gradient bg)                     │
│                                                                           │
│  ┌────────────────┐    ┌──────────────────────┐    ┌────────────────┐   │
│  │                │    │                      │    │                │   │
│  │    PHONE 1     │    │      CENTER HUD      │    │    PHONE 2     │   │
│  │   (280×560)    │    │      (320×560)       │    │   (280×560)    │   │
│  │                │    │                      │    │                │   │
│  │  - Video       │    │  - VS Badge          │    │  - Video       │   │
│  │  - Stats       │    │  - Momentum Bars     │    │  - Stats       │   │
│  │  - Character   │    │  - Event Log         │    │  - Character   │   │
│  │                │    │  - Battle FX         │    │                │   │
│  │                │    │                      │    │                │   │
│  └────────────────┘    └──────────────────────┘    └────────────────┘   │
│                                                                           │
│                 ┌────────────────────────────────────┐                   │
│                 │          PROMPT BAR                │                   │
│                 │  ⬅️ [____________________] ➡️      │                   │
│                 └────────────────────────────────────┘                   │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## CSS Grid Structure

### Arena Container

```typescript
// src/components/Arena.tsx

const arenaStyles = `
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
  overflow-hidden
`;

const battleAreaStyles = `
  flex
  items-center
  justify-center
  gap-4
  lg:gap-8
  xl:gap-12
  w-full
  max-w-7xl
`;
```

### Main Battle Grid

```typescript
// The three-column battle layout
const battleGridStyles = `
  grid
  grid-cols-[280px_1fr_280px]
  lg:grid-cols-[280px_320px_280px]
  xl:grid-cols-[320px_400px_320px]
  gap-4
  lg:gap-8
  items-center
`;
```

---

## Phone Screen Layout

### Phone Container Positioning

```typescript
// Phone wrapper (positions phone in grid)
const phoneWrapperStyles = `
  flex
  flex-col
  items-center
`;

// Phone 1 (left side)
const phone1Styles = `
  transform
  -rotate-2    /* Slight tilt for visual interest */
  hover:rotate-0
  transition-transform
  duration-300
`;

// Phone 2 (right side)
const phone2Styles = `
  transform
  rotate-2     /* Mirror tilt */
  hover:rotate-0
  transition-transform
  duration-300
`;
```

### Phone Internal Layout

```
┌─────────────────────────────────────┐
│           PHONE FRAME               │
│  ┌───────────────────────────────┐  │
│  │         NOTCH (opt)           │  │
│  │───────────────────────────────│  │
│  │                               │  │
│  │                               │  │
│  │       VIDEO STREAM            │  │
│  │       (Full height)           │  │
│  │                               │  │
│  │                               │  │
│  │───────────────────────────────│  │
│  │       OVERLAY INFO            │  │
│  │  - Character Name             │  │
│  │  - Stat Bars                  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

```typescript
// Phone screen internal layout
const phoneScreenLayout = `
  relative
  w-full
  h-full
  flex
  flex-col
`;

// Video container (takes most space)
const videoContainerStyles = `
  flex-1
  relative
  overflow-hidden
`;

// Overlay info (bottom of phone)
const overlayInfoStyles = `
  absolute
  bottom-0
  left-0
  right-0
  p-4
  bg-gradient-to-t
  from-black/60
  to-transparent
`;
```

---

## Center HUD Layout

### HUD Container

```
┌────────────────────────────────────┐
│           CENTER HUD               │
│                                    │
│    ┌─────────  VS  ─────────┐     │
│    │          ⚔️            │     │
│    └─────────────────────────┘     │
│                                    │
│    ┌─────────────────────────┐     │
│    │    MOMENTUM BARS        │     │
│    │  P1 ████████░░ vs ░░████████ P2│
│    └─────────────────────────┘     │
│                                    │
│    ┌─────────────────────────┐     │
│    │      EVENT LOG          │     │
│    │  - Event 1              │     │
│    │  - Event 2              │     │
│    │  - Event 3              │     │
│    └─────────────────────────┘     │
│                                    │
└────────────────────────────────────┘
```

```typescript
// Center HUD container
const centerHudStyles = `
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
  min-h-[400px]
  lg:min-h-[500px]
`;

// VS Badge
const vsBadgeStyles = `
  text-4xl
  lg:text-5xl
  font-bold
  text-white
  drop-shadow-lg
  animate-pulse-soft
`;

// Momentum bars container
const momentumContainerStyles = `
  w-full
  flex
  flex-col
  gap-4
`;

// Event log container
const eventLogStyles = `
  w-full
  max-h-[200px]
  overflow-y-auto
  scrollbar-thin
  scrollbar-thumb-white/20
`;
```

---

## Prompt Bar Layout

### Fixed Bottom Positioning

```
┌─────────────────────────────────────────────────────────┐
│                      PROMPT BAR                          │
│                                                          │
│   ┌────┐  ┌─────────────────────────────────┐  ┌────┐  │
│   │ ⬅️ │  │        Text Input               │  │ ➡️ │  │
│   │ P1 │  │  "Enter your action..."         │  │ P2 │  │
│   └────┘  └─────────────────────────────────┘  └────┘  │
│                                                          │
│                    [  SEND  ]                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

```typescript
// Prompt bar container (fixed to bottom)
const promptBarContainerStyles = `
  fixed
  bottom-0
  left-0
  right-0
  p-4
  lg:p-6
  flex
  justify-center
  z-30
`;

// Prompt bar inner content
const promptBarInnerStyles = `
  w-full
  max-w-2xl
  bg-white/15
  backdrop-blur-xl
  border
  border-white/25
  rounded-2xl
  p-4
  shadow-glass-lg
`;

// Input row layout
const inputRowStyles = `
  flex
  items-center
  gap-3
`;

// Player selector button
const playerSelectorStyles = `
  w-12
  h-12
  flex
  items-center
  justify-center
  rounded-full
  bg-white/10
  border
  border-white/20
  transition-all
  hover:bg-white/20
`;

// Selected player indicator
const playerSelectedStyles = `
  ring-2
  ring-sky-400
  bg-sky-400/20
`;

// Input field
const inputFieldStyles = `
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
`;
```

---

## Responsive Layout Breakpoints

### Mobile (< 768px)

```typescript
// Stack phones vertically on mobile
const mobileLayoutStyles = `
  flex
  flex-col
  items-center
  gap-4
`;

// Hide center HUD on mobile, show minimal info
const mobileHudStyles = `
  w-full
  flex
  justify-between
  px-4
`;
```

### Tablet (768px - 1024px)

```typescript
// Three-column layout, smaller phones
const tabletLayoutStyles = `
  grid
  grid-cols-[240px_240px_240px]
  gap-4
`;
```

### Desktop (1024px+)

```typescript
// Full three-column layout
const desktopLayoutStyles = `
  grid
  grid-cols-[280px_320px_280px]
  lg:grid-cols-[320px_400px_320px]
  gap-8
`;
```

---

## Z-Index Stacking

```typescript
// Z-index scale for proper layering
const zIndexScale = {
  background: 0,        // Arena gradient
  phones: 10,           // Phone screens
  phoneShadows: 5,      // Shadows behind phones
  centerHud: 20,        // Center HUD
  promptBar: 30,        // Fixed prompt bar
  overlays: 40,         // Victory overlay, etc.
  modals: 50,           // Error modals, dialogs
  toasts: 60,           // Toast notifications
};
```

---

## Spacing System

Use a consistent spacing scale based on Tailwind's defaults:

```typescript
// Spacing values (in Tailwind units)
const spacing = {
  xs: '1',    // 4px
  sm: '2',    // 8px
  md: '4',    // 16px
  lg: '6',    // 24px
  xl: '8',    // 32px
  '2xl': '12', // 48px
  '3xl': '16', // 64px
};

// Gap between major elements
const majorGap = 'gap-8'; // 32px
// Gap within components
const minorGap = 'gap-4'; // 16px
// Padding for containers
const containerPadding = 'p-6'; // 24px
```

---

## Component Dimensions

### Fixed Dimensions

| Component | Width | Height | Notes |
|-----------|-------|--------|-------|
| Phone Frame | 280px | 560px | Desktop default |
| Phone Frame (lg) | 320px | 640px | Large screens |
| Center HUD | 320px | auto | Min-height 400px |
| Prompt Bar | max 672px | auto | Max-width 2xl |
| VS Badge | 80px | 80px | Square, centered |

### Relative Dimensions

```typescript
// Phone aspect ratio (9:18 = 0.5)
const phoneAspectRatio = 'aspect-[9/18]';

// Video container fills phone height
const videoFill = 'h-full w-full object-cover';

// Momentum bar height
const momentumBarHeight = 'h-4'; // 16px
```

---

## Layout Implementation Example

```tsx
// src/components/Arena.tsx

export function Arena() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-100 via-sky-200 to-pink-300 p-8">
      {/* Main Battle Area */}
      <div className="flex items-center justify-center gap-8 w-full max-w-7xl mx-auto">
        
        {/* Phone 1 */}
        <div className="transform -rotate-2 hover:rotate-0 transition-transform">
          <PhoneScreen player={1} />
        </div>

        {/* Center HUD */}
        <div className="flex flex-col items-center justify-center gap-6 p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl min-h-[500px]">
          <VSBadge />
          <MomentumBars />
          <EventLog />
        </div>

        {/* Phone 2 */}
        <div className="transform rotate-2 hover:rotate-0 transition-transform">
          <PhoneScreen player={2} />
        </div>

      </div>

      {/* Prompt Bar (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-30">
        <PromptBar />
      </div>
    </div>
  );
}
```

---

## Checklist

- [ ] Create Arena.tsx with grid layout
- [ ] Implement PhoneScreen.tsx component
- [ ] Implement CenterHUD.tsx component
- [ ] Implement PromptBar.tsx with fixed positioning
- [ ] Add responsive breakpoints for mobile/tablet
- [ ] Test layout at various screen sizes
- [ ] Verify z-index stacking works correctly
- [ ] Ensure prompt bar doesn't overlap content
