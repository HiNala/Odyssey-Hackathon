# Odyssey Arena

> **Two players. AI-generated worlds. Real-time battle.**

Odyssey Arena is a live AI battle simulation built for the [Odyssey ML Hackathon](https://developer.odyssey.ml). Two players create characters and worlds using natural language, then battle through descriptive prompts — all rendered in real-time by the **Odyssey-2 Pro** world model with **Google Gemini 3 Flash** providing intelligent narration.

---

## How It Works

```
Player Prompt → Gemini AI (narration + scoring) → Odyssey-2 Pro (live video) → Arena UI
```

1. **Setup Phase** — Each player describes a character and world. Odyssey generates a cinematic live preview.
2. **Battle Phase** — Players alternate submitting actions via natural language. The AI analyzes keywords, calculates stat impacts, generates dramatic narration, and renders the scene in real-time video.
3. **Victory Phase** — When a player's momentum hits 100 (or their opponent's hits 0), the battle ends with a celebration.

### The Single-Session Challenge

Odyssey-2 Pro limits API keys to **1 concurrent video stream**. Odyssey Arena solves this with time-sharing: during setup, players take turns generating previews; during battle, only the active player's action is streamed live while both screens maintain context.

---

## Game Mechanics

### Stats (all 0–100)

| Stat | Role | Start | Win Condition |
|------|------|-------|---------------|
| **Momentum** | Primary score | 50 | Reach 100 (or opponent reaches 0) |
| **Power** | Offensive multiplier | 50 | Boosts momentum gains |
| **Defense** | Damage reduction | 50 | Reduces momentum losses |
| **Energy** | Action fuel | 100 | Actions cost energy; regenerates 5/turn |

### Action Resolution

Player prompts are analyzed for keywords to determine:
- **Type**: offensive / defensive / special / neutral
- **Intensity**: weak (4) → normal (8) → strong (13) → devastating (20) base momentum
- **Impact**: critical / strong / normal / weak / miss — drives UI effects and narration

Example: *"Unleashes a devastating plasma blade"* → Special + Devastating → ~30 momentum swing + screen shake + dramatic narration.

### Quick Actions

Pre-built action buttons for fast gameplay:
- **Attack** — Strike with force (offensive)
- **Defend** — Brace defensively (defensive, low energy cost)
- **Special** — Unleash signature power (1.5x multiplier, 1.5x energy cost)
- **Taunt** — Intimidate opponent (neutral)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16.1.6 (App Router) | Server/client rendering, API routes |
| **Language** | TypeScript 5 | Type safety across the codebase |
| **AI Video** | [Odyssey-2 Pro SDK](https://developer.odyssey.ml) (`@odysseyml/odyssey`) | Real-time interactive video generation |
| **AI Text** | [Google Gemini 3 Flash](https://ai.google.dev) (`@google/generative-ai`) | Battle narration, visual prompts, scoring |
| **Styling** | Tailwind CSS 4 | Glassmorphism UI with custom utilities |
| **Animation** | Framer Motion 12 | Spring physics, entrance animations, impact effects |
| **State** | React useReducer + Context | Full game state machine, no external libs |
| **UI Utils** | clsx + tailwind-merge | Conditional class composition |

---

## Architecture

### State Machine

```
IDLE  →  SETUP  →  BATTLE  →  VICTORY
 ↑                                |
 └────────── RESET ───────────────┘
```

All state transitions flow through a single `gameReducer` with 14 action types:

```
CONNECT / DISCONNECT / CONNECTION_ERROR
SET_PLAYER_NAME / SET_CHARACTER
START_STREAM / END_STREAM / COMPLETE_SETUP
START_BATTLE / SET_PROCESSING
RESOLVE_ACTION / SWITCH_ACTIVE_PLAYER
DECLARE_WINNER / RESET_GAME
```

### Project Structure

```
Odyssey-Hackathon/
├── README.md
├── .gitignore
│
├── odyssey-arena/                  # Next.js application
│   ├── app/
│   │   ├── layout.tsx              # Root layout (Geist fonts, metadata)
│   │   ├── page.tsx                # Main arena page
│   │   ├── globals.css             # Tailwind config, gradient bg, glass utilities
│   │   └── api/
│   │       └── generate/
│   │           └── route.ts        # POST /api/generate — Gemini server endpoint
│   │
│   ├── components/
│   │   ├── ArenaBackground.tsx     # Gradient bg with floating blur orbs
│   │   ├── PhoneFrame.tsx          # Glassmorphism phone wrapper (left/right variants)
│   │   ├── OdysseyStream.tsx       # Video element for Odyssey MediaStream
│   │   ├── CenterHUD.tsx           # VS badge, stats, event log, status
│   │   ├── PromptInput.tsx         # Bottom input bar with player target arrows
│   │   ├── CharacterForm.tsx       # Character creation form (name, archetype, desc)
│   │   ├── CharacterCard.tsx       # Character display card
│   │   ├── ActionButtons.tsx       # Quick action grid (attack/defend/special/taunt)
│   │   └── VideoStream.tsx         # Video stream display component
│   │
│   ├── hooks/
│   │   ├── useOdysseyStream.ts     # Odyssey SDK connection lifecycle management
│   │   └── useGameFlow.ts          # High-level game orchestration (combines state + SDK)
│   │
│   ├── context/
│   │   └── GameContext.tsx          # React Context + useReducer for global game state
│   │
│   ├── lib/
│   │   ├── odyssey-client.ts       # Singleton Odyssey SDK client
│   │   ├── gemini-client.ts        # Gemini AI client (narration, visual prompts)
│   │   ├── gameState.ts            # Game reducer, selectors, victory conditions
│   │   ├── scoring.ts              # Action analysis, momentum calc, narrative gen
│   │   ├── prompt-templates.ts     # Odyssey prompt templates & arena presets
│   │   ├── game-logic.ts           # Damage calculation, stat application, battle checks
│   │   ├── animations.ts           # Framer Motion variants (spring, shake, glow, etc.)
│   │   ├── types.ts                # Shared TypeScript types
│   │   └── utils.ts                # cn() utility (clsx + tailwind-merge)
│   │
│   ├── types/
│   │   └── game.ts                 # Game-specific types (ArenaState, PlayerStats, etc.)
│   │
│   ├── .env.example                # Environment variable template
│   ├── .env.local                  # Actual keys (git-ignored)
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── postcss.config.mjs
│
├── docs/                           # Design & implementation specs
│   ├── 00-MASTER-PLAN.md           # Project overview, architecture, build order
│   ├── design/
│   │   ├── 01-visual-style.md      # Color palette, glassmorphism, typography
│   │   ├── 02-layout.md            # Grid structure, z-index, responsive breakpoints
│   │   ├── 03-components.md        # Component hierarchy and specifications
│   │   └── 04-animations.md        # Framer Motion variants, timing, easing
│   ├── game-logic/
│   │   ├── 01-game-state.md        # State types, reducer, selectors
│   │   ├── 02-odyssey-integration.md  # SDK patterns, single-session handling
│   │   ├── 03-game-flow.md         # Phase transitions, demo script
│   │   └── 04-scoring-system.md    # Stat formulas, action analysis, narratives
│   └── missions/
│       ├── MISSION-01.md           # Foundation & core setup
│       ├── MISSION-02.md           # Odyssey SDK integration
│       ├── MISSION-03.md           # Game logic & state management
│       ├── MISSION-04.md           # UI polish & animations
│       └── MISSION-05.md           # Final polish & demo readiness
│
└── odyssey-docs/                   # Odyssey SDK reference documentation
    ├── 00-README.md
    ├── 01-introduction.md          # What is Odyssey-2 Pro (world model vs video model)
    ├── 02-odyssey2-overview.md     # Architecture, frame-by-frame prediction
    ├── 03-api-quickstart.md        # Connection lifecycle, code examples
    ├── 04-interaction-tips.md      # Prompt engineering (state desc vs action verbs)
    ├── js/
    │   ├── 01-overview.md          # JS SDK overview
    │   ├── 02-odyssey-class.md     # Odyssey class API reference
    │   ├── 03-react-hook.md        # useOdyssey hook
    │   ├── 04-recordings.md        # Stream recording retrieval
    │   ├── 05-simulations.md       # Simulate API (async batch generation)
    │   ├── 06-types.md             # TypeScript type definitions
    │   └── 07-examples.md          # Usage examples
    └── python/
        ├── 01-overview.md          # Python SDK overview
        ├── 02-client.md            # Python client
        ├── 03-recordings.md        # Recording retrieval
        ├── 04-simulations.md       # Simulate API
        ├── 05-types.md             # Python types
        └── 06-examples.md          # Python examples
```

---

## Design System

### Visual Language

**Apple "Liquid Glass" aesthetic** — soft gradients, glassmorphism panels, minimal chrome so the AI-generated video takes center stage.

- **Background**: Sky blue (#E0F2FE) → Cotton candy pink (#FCE7F3) at 135°
- **Glass panels**: `bg-white/10`, `backdrop-blur-xl`, `border-white/20`
- **Player 1**: Amber (#F59E0B) accents
- **Player 2**: Purple (#8B5CF6) accents
- **Typography**: Geist Sans / Geist Mono (system fallbacks)

### Layout

Three-column arena: **Phone 1** (left) | **Center HUD** | **Phone 2** (right), with a fixed prompt bar at the bottom.

- Phone frames: Glassmorphism wrappers with notch decoration, 384px max width
- Center HUD: VS badge, HP bars, event log, connection status
- Prompt bar: Rounded-full glass input with directional player-target arrows

### Animations

Centralized Framer Motion variants in `lib/animations.ts`:

| Animation | Trigger | Effect |
|-----------|---------|--------|
| Phone entrance | Page load | Slide from sides with spring physics |
| Phone float | Continuous | Gentle vertical bobbing (3.5s cycle) |
| Active glow | Player's turn | Pulsing box-shadow on active phone |
| VS pulse | Continuous | Scale/opacity pulse on VS badge |
| Impact shake | Critical hit | Screen shake (intensity varies by impact) |
| Event slide-in | New event | Slide + fade from left with spring |
| Victory overlay | Game end | Fade + scale entrance with stagger |
| Prompt bar | Page load | Slide up from bottom with delay |

---

## API Routes

### `POST /api/generate`

Server-side Gemini AI endpoint. Keeps the API key secure (never exposed to the client).

**Request body:**

```json
{
  "type": "narration | visual | general",
  "prompt": "Player 1 unleashes a devastating fire attack",
  "context": {
    "player1Character": "Fire Mage",
    "player2Character": "Ice Knight",
    "world": "Volcanic Arena",
    "previousEvents": ["Ice Knight raised a frost shield"]
  }
}
```

**Response:**

```json
{
  "result": "The Fire Mage channels molten fury through ancient runes..."
}
```

| Type | Purpose | System Prompt |
|------|---------|---------------|
| `general` | Free-form generation | None |
| `narration` | Battle narration | Theatrical, 2-3 sentences, dramatic |
| `visual` | Scene for Odyssey | Visual only, no dialogue, lighting/pose focus |

---

## Arena Presets

Pre-built world templates in `lib/prompt-templates.ts` for quick setup:

| Arena | Description |
|-------|-------------|
| **Ancient Coliseum** | Ruined Roman coliseum at golden hour with crumbling pillars |
| **Volcanic Ruins** | Cracked obsidian platform surrounded by flowing lava |
| **Frozen Tundra** | Icy wasteland with towering glaciers and northern lights |
| **Neon District** | Rain-soaked cyberpunk rooftop at night |
| **Mystic Forest** | Enchanted clearing with bioluminescent plants |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** (or yarn/pnpm)
- [Odyssey API Key](https://developer.odyssey.ml/dashboard)
- [Google Gemini API Key](https://aistudio.google.com/apikey)

### Installation

```bash
# Clone
git clone https://github.com/HiNala/Odyssey-Hackathon.git
cd Odyssey-Hackathon/odyssey-arena

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Environment Variables

| Variable | Required | Scope | Description |
|----------|----------|-------|-------------|
| `NEXT_PUBLIC_ODYSSEY_API_KEY` | Yes | Client | Odyssey ML API key |
| `GEMINI_API_KEY` | Yes | Server | Google Gemini API key |
| `GEMINI_MODEL` | No | Server | Model name (default: `gemini-3-flash-preview`) |

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Demo Script (90 seconds)

For hackathon presentation:

| Time | Action |
|------|--------|
| 0:00 | *"This is Odyssey Arena — two players, AI-generated worlds, real-time battle."* |
| 0:10 | Click **Start Game** → connects to Odyssey |
| 0:15 | P1 Setup: **"Cyberpunk samurai with plasma katana"** in **"Neon Tokyo rooftop"** |
| 0:30 | P2 Setup: **"Dragon mage in crystal armor"** in **"Volcanic crystal palace"** |
| 0:45 | Battle Round 1 (P1): *"Devastating plasma blade slash"* |
| 1:00 | Battle Round 2 (P2): *"Storm of crystalline shards"* |
| 1:15 | Battle Round 3 (P1): *"Channels the power grid for ultimate strike"* |
| 1:20 | Victory → Celebration animation |

### Prompt Tips

- **DO** use state descriptions: *"is wielding a glowing sword"* (stable)
- **DON'T** use action verbs: *"picks up the sword"* (may cause animation loops)
- Be visual and specific: lighting, colors, materials, camera angles
- Longer, more dramatic prompts → higher impact scores

---

## Odyssey SDK Key Concepts

**Odyssey-2 Pro** is a *world model*, not a video model. It predicts one frame at a time (~50ms), reacting to user input in real-time. Think of it as an AI game engine.

```typescript
// Connection lifecycle
const client = new Odyssey({ apiKey: 'ody_...' });
const mediaStream = await client.connect();       // WebRTC stream
const streamId = await client.startStream({ prompt: '...' });
await client.interact({ prompt: '...' });          // Change scene mid-stream
await client.endStream();
client.disconnect();                               // Always disconnect!
```

- **1 session per API key** — always disconnect to avoid 40-second lockout
- **Portrait mode**: 704x1280 (used for phone frames)
- **Recordings**: Retrieve video/events/thumbnails after stream ends
- **Simulations**: Async batch generation for pre-scripted sequences

---

## Build Missions

The project is structured as 5 incremental missions (~45 min each):

| Mission | Focus | Status |
|---------|-------|--------|
| **01** | Foundation — Next.js, Tailwind, static UI skeleton | Complete |
| **02** | Odyssey Integration — SDK, video streaming, lifecycle | Complete |
| **03** | Game Logic — State machine, scoring, battle flow | Complete |
| **04** | UI Polish — Framer Motion animations, glassmorphism | In Progress |
| **05** | Demo Ready — Bug fixes, error handling, demo script | Pending |

Full specifications for each mission are in `docs/missions/`.

---

## License

MIT

---

*Built for the [Odyssey ML Hackathon](https://developer.odyssey.ml) — showcasing Odyssey-2 Pro as a real-time AI game engine.*
