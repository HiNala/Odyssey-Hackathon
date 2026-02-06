# ODYSSEY ARENA - Master Plan

## Project Codename: ODYSSEY ARENA
*Live-generated characters, worlds, and battles — powered by Odyssey-2 Pro World Model*

---

## Executive Summary

Odyssey Arena is a hackathon demo application that showcases the power of Odyssey-2 Pro's real-time world model by creating an interactive "battle arena" where two players generate fictional characters and worlds, then battle through natural language prompts. The AI-powered world model becomes the game engine itself — generating continuous, interactive video streams that respond to player actions in real-time.

This is not a traditional game with static rules. This is a proof-of-concept that live world models can replace static game engines entirely. The Odyssey model resolves all interactions, generates cinematic narratives, and creates visually stunning outcomes — all streamed in real-time to the browser.

---

## Core Concept

Two players create fictional characters inside fictional worlds displayed as live video streams on phone-styled screens. Players interact by describing actions in natural language through a shared prompt bar. The Odyssey-2 Pro model:

- Generates what happens visually in real-time video
- Decides which player gains advantage based on creative actions
- Updates abstract game stats (momentum, power, defense, energy)
- Narrates cinematically through visual storytelling

**Think of it as:** Pokémon cards × D&D × live world models

---

## What This Demo Proves

1. **World models can be game engines** — No static rules, the AI decides everything
2. **Real-time interactivity is possible** — Sub-second response to user prompts
3. **Visual storytelling at scale** — Continuous video generation, not static images
4. **Natural language as input** — No buttons, just describe what you want

---

## Non-Negotiable Goals

### What Matters (Optimize For)
- **Instantly understandable** — Judge understands in 10 seconds
- **Visually striking** — Impressive from 10 feet away
- **Interactive in under 30 seconds** — Quick to demo
- **Feels futuristic** — Not a "CRUD app"

### What Does NOT Matter (Ignore)
- Persistence / databases
- Game balance
- Edge cases
- Multiplayer networking
- Authentication
- Docker / complex infrastructure

---

## Tech Stack (LOCKED)

| Category | Technology | Reason |
|----------|------------|--------|
| Framework | Next.js 14+ (App Router) | Single repo, SSR, fast dev |
| Language | TypeScript | Type safety, better DX |
| Styling | Tailwind CSS | Rapid UI development |
| Animation | Framer Motion | Smooth, declarative animations |
| World Model | Odyssey JS SDK | Real-time video streaming |
| State | React useState/useReducer | Simple, no external deps |

**No backend. No database. No Docker. No Redis.**

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INPUT                               │
│              (Natural language prompt + player selection)        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PROMPT ROUTER                              │
│         (Determines which phone screen receives the prompt)      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ODYSSEY SDK CLIENT                            │
│     - connect() → establishes WebRTC connection                  │
│     - startStream() → begins video generation                    │
│     - interact() → sends midstream prompts                       │
│     - endStream() → stops current stream                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ODYSSEY-2 PRO MODEL                           │
│     - Generates real-time video frames (50ms per frame)          │
│     - Responds to prompts within the stream                      │
│     - Creates continuous, interactive simulations                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         REACT UI                                 │
│     - Displays video streams on phone-styled screens             │
│     - Animates stat changes and battle events                    │
│     - Renders event log and momentum bars                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## UI Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         ARENA BACKGROUND                         │
│            (Hazy gradient: sky blue → cotton candy pink)         │
│                                                                   │
│  ┌──────────────┐    ┌────────────────────┐    ┌──────────────┐  │
│  │              │    │                    │    │              │  │
│  │   PHONE 1    │    │    CENTER HUD      │    │   PHONE 2    │  │
│  │              │    │                    │    │              │  │
│  │  Player 1    │    │   ⚔️ VS ⚔️         │    │  Player 2    │  │
│  │  Character   │    │                    │    │  Character   │  │
│  │  + World     │    │  Momentum Bars     │    │  + World     │  │
│  │  Video       │    │  Event Log         │    │  Video       │  │
│  │  Stream      │    │  Battle Effects    │    │  Stream      │  │
│  │              │    │                    │    │              │  │
│  └──────────────┘    └────────────────────┘    └──────────────┘  │
│                                                                   │
│              ┌─────────────────────────────────────┐             │
│              │     ⬅️  [  PROMPT INPUT  ]  ➡️      │             │
│              └─────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Game State Model

```typescript
// Player state for each participant
type PlayerState = {
  id: 1 | 2;
  name: string;
  character: string;        // Generated character description
  world: string;            // Generated world description
  stats: {
    momentum: number;       // 0-100, main score bar
    power: number;          // 0-100, attack strength
    defense: number;        // 0-100, damage resistance
    energy: number;         // 0-100, action resource
  };
  streamId: string | null;  // Odyssey stream ID
  isStreaming: boolean;     // Whether video is active
};

// Global arena state
type ArenaState = {
  players: [PlayerState, PlayerState];
  eventLog: EventEntry[];
  activePlayer: 1 | 2;
  phase: 'setup' | 'battle' | 'victory';
  winner: 1 | 2 | null;
};

// Event log entry
type EventEntry = {
  id: string;
  timestamp: number;
  player: 1 | 2;
  action: string;
  result: string;
  statChanges: Partial<PlayerState['stats']>;
};
```

---

## Game Flow

### Phase 1: Setup
1. Player 1 enters a character + world prompt
2. Odyssey generates Player 1's video stream
3. Player 2 enters a character + world prompt
4. Odyssey generates Player 2's video stream
5. Both streams run simultaneously → Battle begins

### Phase 2: Battle
1. Active player (alternating) types an action
2. Action is sent to both Odyssey streams as interact()
3. UI updates stat bars based on action creativity
4. Event log shows narrative result
5. Check for victory condition (momentum reaches 0 or 100)
6. Switch active player, repeat

### Phase 3: Victory
1. Winner announcement with celebration animation
2. Option to restart with new characters

---

## Odyssey Integration Details

### SDK Usage Pattern

```typescript
import { Odyssey } from '@odysseyml/odyssey';

// Single client instance (max 1 concurrent session per API key)
const odyssey = new Odyssey({ apiKey: process.env.NEXT_PUBLIC_ODYSSEY_API_KEY });

// Connect and get MediaStream
const mediaStream = await odyssey.connect();
videoElement.srcObject = mediaStream;

// Start streaming with initial prompt
const streamId = await odyssey.startStream({
  prompt: 'A warrior knight in a mystical forest, dramatic lighting, fantasy style',
  portrait: true  // 704x1280 for phone screens
});

// Midstream interactions
await odyssey.interact({
  prompt: 'The knight draws their sword, flames engulf the blade'
});

// End stream when done
await odyssey.endStream();
odyssey.disconnect();
```

### Important Odyssey Constraints

1. **Max 1 concurrent session** — Cannot run two streams simultaneously with one API key
2. **Portrait mode recommended** — 704x1280 fits phone screen aesthetic
3. **State descriptions, not action verbs** — "is holding a sword" not "picks up sword" (prevents loops)
4. **Always disconnect** — Call disconnect() on unmount or stale sessions block for 40 seconds

### Workaround for Two Screens

Since we can only have one active stream, we'll use a **time-sharing approach**:
- During setup: Generate Player 1 stream, capture final frame, then generate Player 2 stream
- During battle: Alternate which stream is "live" based on active player
- Use captured frames as static backgrounds when stream isn't active

---

## Prompt Engineering

### Character Generation Prompt Template

```
A cinematic portrait of {character_description}, 
in a {world_description} environment.
{style_modifiers}
The camera is steady, close-up framing.
Dramatic lighting with {lighting_style}.
```

### Battle Action Resolution

```
The character {action_description}.
The scene responds with {effect_description}.
{lighting_change} illuminates the moment.
```

### Style Modifiers (use these for visual consistency)
- `film noir lighting`
- `fantasy art style`
- `cyberpunk neon glow`
- `watercolor aesthetic`
- `dramatic chiaroscuro`
- `soft ethereal lighting`

---

## Build Order (5 Missions)

### Mission 1: Foundation (~45 min)
- Next.js project setup with TypeScript
- Tailwind configuration with custom theme
- Basic layout structure (background, phone frames, center HUD)
- Static placeholder content

### Mission 2: Odyssey Integration (~45 min)
- Odyssey SDK installation and configuration
- Single video stream working
- Basic connect/disconnect lifecycle
- Video display in phone frame

### Mission 3: Game Logic & State (~45 min)
- Full state management implementation
- Prompt input and routing
- Stat calculation system
- Event log population

### Mission 4: UI Polish & Animations (~45 min)
- Framer Motion animations
- Glassmorphism styling refinement
- Momentum bar animations
- Screen shake and impact effects

### Mission 5: Final Polish & Demo Ready (~30 min)
- Error handling and edge cases
- Demo script preparation
- Performance optimization
- Final visual polish

---

## Success Criteria

### Judge Checklist
- [ ] Understands concept within 10 seconds
- [ ] Visually impressive from across the room
- [ ] Interactive demo completes in under 2 minutes
- [ ] Clear differentiation from "just another video generator"
- [ ] Technical ambition is evident
- [ ] Polished, not hacky

### Technical Checklist
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Smooth 60fps animations
- [ ] Graceful error handling
- [ ] Clean disconnect on navigation

---

## What to Say to Judges

### The Pitch (30 seconds)
> "Odyssey Arena is a proof-of-concept that live world models can replace static game engines. Two players generate characters and worlds using the Odyssey-2 Pro API, then battle by describing actions in natural language. The AI resolves everything — there are no hardcoded rules. Every outcome is generated in real-time."

### The Vision (if asked "What's next?")
> "We'd turn this into a persistent card-like system where characters evolve over time, worlds branch, and players can remix or trade AI-generated entities. Imagine Pokémon, but every creature is unique and generated live."

### Technical Depth (if asked "How does it work?")
> "Odyssey-2 Pro is an action-conditioned world model that generates video frame-by-frame in real-time — 50 milliseconds per frame. We send natural language prompts and it responds by evolving the video stream. The model understands physics, lighting, and visual storytelling implicitly from training data."

---

## File Structure

```
odyssey-arena/
├── docs/
│   ├── 00-MASTER-PLAN.md          # This document
│   ├── game-logic/
│   │   ├── 01-game-state.md       # State types and management
│   │   ├── 02-odyssey-integration.md  # SDK usage patterns
│   │   ├── 03-game-flow.md        # Phase transitions
│   │   └── 04-scoring-system.md   # Stat calculations
│   ├── design/
│   │   ├── 01-visual-style.md     # Colors, gradients, theme
│   │   ├── 02-layout.md           # Component positioning
│   │   ├── 03-components.md       # UI component specs
│   │   └── 04-animations.md       # Motion design
│   └── missions/
│       ├── MISSION-01.md          # Foundation
│       ├── MISSION-02.md          # Odyssey Integration
│       ├── MISSION-03.md          # Game Logic
│       ├── MISSION-04.md          # UI Polish
│       └── MISSION-05.md          # Final Polish
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Arena.tsx
│   │   ├── PhoneScreen.tsx
│   │   ├── CenterHUD.tsx
│   │   ├── PromptBar.tsx
│   │   ├── MomentumBar.tsx
│   │   └── EventLog.tsx
│   ├── hooks/
│   │   └── useOdysseyArena.ts
│   ├── lib/
│   │   ├── odyssey.ts
│   │   └── gameState.ts
│   └── types/
│       └── game.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.local
```

---

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_ODYSSEY_API_KEY=ody_your_api_key_here
```

---

## Remember

**You are not building a game. You are building a proof that live world models can replace static game engines.**

Visual polish wins hackathons. Technical completeness does not. If you run out of time, prioritize:
1. Visual impressiveness
2. Smooth demo flow
3. Clear storytelling

Over:
1. Edge case handling
2. Feature completeness
3. Code cleanliness
