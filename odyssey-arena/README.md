# Odyssey Arena
## Live AI Creature Battles with Real-Time Commentary

> The first game where AI generates both the battle visuals AND live play-by-play commentary

**Two players create characters, place them in AI-generated worlds, and battle in real-time** -- with ESPN-style live commentary powered by Google Gemini narrating every move.

Unlike traditional game engines or video generators, Odyssey Arena uses a **world model as the game engine itself**. Every frame is generated live based on physics, history, and narrative context. No pre-rendered assets, no scripted animations -- just pure emergent gameplay with an AI commentator calling every shot.

## What Makes This Different

**Every other Odyssey project:** "Look at this AI-generated video"

**Odyssey Arena:** "Watch creatures battle with live AI commentary that makes you feel like you're watching ESPN"

### The Innovation

- **Dual AI System**: Odyssey generates visuals, Gemini generates commentary -- synchronized per action
- **Real-Time Feedback**: Every action gets instant announcer-style commentary with a LIVE indicator
- **Living Characters**: Win battles to evolve (+2), lose to devolve (-2) -- evolution changes Odyssey prompts
- **No Pre-Rendered Assets**: Every pixel generated live by AI, every word of commentary unique

## Features

- **Live AI Commentary** -- Gemini generates real-time battle commentary displayed as a sleek ESPN-style banner
- **AI Battle Opening** -- Gemini announces the match: *"Two titans enter! Only one leaves!"*
- **AI Victory Closing** -- Gemini calls the winner: *"WHAT A BATTLE! Dragon Knight RISES VICTORIOUS!"*
- **Real-time AI Video** -- Odyssey-2 Pro generates continuous video streams that react to player actions
- **Character Evolution** -- 5-level system (-2 to +2) with visual transformations via modified Odyssey prompts
- **Turn-Based Battle System** -- Momentum, power, defense, and energy stats create meaningful choices
- **Combo System** -- Chain same-type actions for escalating damage bonuses
- **Status Effects** -- Burning, frozen, powered, weakened, shielded
- **Critical Hits & Screen Shake** -- Visual impact feedback with dynamic overlays
- **Quick Action Buttons** -- Attack, Defend, Special, Taunt with energy costs
- **Auto-Demo Intro** -- Cinematic slideshow for judges / first impressions
- **Victory Classifications** -- Flawless Victory, Comeback, Domination with battle reports
- **Battle History** -- Persisted to localStorage with win/loss tracking
- **Stalemate Prevention** -- Energy regeneration + 30-turn auto-resolution
- **Responsive** -- Stacks vertically on mobile, side-by-side on desktop

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| AI Video | Odyssey-2 Pro SDK (`@odysseyml/odyssey`) |
| AI Narrative | Google Gemini API (`@google/generative-ai`) |
| State | React useReducer + Context |

## Getting Started

### Prerequisites

- Node.js 18+
- An Odyssey API key ([developer.odyssey.ml](https://developer.odyssey.ml)) -- **required**
- A Gemini API key ([aistudio.google.com](https://aistudio.google.com/apikey)) -- **required**

### Installation

```bash
cd odyssey-arena
npm install --legacy-peer-deps
```

### Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_ODYSSEY_API_KEY=ody_your_key_here
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.0-flash
```

Both keys are **required** -- the Odyssey API is the core of this project.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## How to Play

1. **Auto-Demo** -- A cinematic intro plays showcasing all features (click to skip)
2. **Start Game** -- Click "Start Game" to connect to Odyssey
3. **Create Characters** -- Describe your character and world for each player
4. **Battle** -- Use quick action buttons or type custom prompts
5. **Win** -- Drive your momentum to 100 (or your opponent's to 0) to win
6. **Evolve** -- Winners evolve, losers devolve -- rematch to see the transformation

### Actions

| Action | Effect | Energy Cost |
|--------|--------|-------------|
| Attack | Deal damage, gain momentum | 10 |
| Defend | Boost defense, recover energy | 7 |
| Special | High damage, high risk | 25 |
| Taunt | Drain opponent energy | 5 |

## Technical Highlights

- **3-Layer Prompt System**: Base world prompt + character injection + action prompts (state descriptions prevent Odyssey looping)
- **Singleton Odyssey Client**: One session per API key, managed by custom hook with auto-reconnect
- **AI-Bounded Stat Changes**: Gemini follows strict numerical ranges for balanced gameplay
- **Type-Safe State Machine**: Discriminated union actions with `useReducer`
- **Passive Energy Regeneration**: Prevents stalemates + 30-turn auto-resolution

## Project Structure

```
odyssey-arena/
├── app/
│   ├── page.tsx            # Main arena (all game phases)
│   ├── layout.tsx           # Root layout + providers
│   ├── globals.css          # Tailwind v4 + custom utilities
│   └── api/
│       ├── gemini/          # Gemini AI narrative + stat analysis
│       └── commentary/      # Gemini battle opening/closing commentary
├── components/
│   ├── ArenaBackground      # Atmospheric gradient + orbs
│   ├── PhoneFrame           # Glassmorphism video container
│   ├── OdysseyStream        # Video + connection status overlays
│   ├── CenterHUD            # Momentum bars, stats, event log
│   ├── BattleOverlays       # Live commentary banner + combo counter
│   ├── ActionButtons        # Quick battle actions
│   ├── PromptInput          # Custom action input
│   ├── SetupForm            # Character + world creation
│   ├── VictoryOverlay       # End-of-battle summary + closing commentary
│   ├── DamagePopup          # Floating damage numbers
│   ├── AutoDemo             # Auto-playing intro for judges
│   ├── TransformationOverlay # Evolution/devolution animation
│   └── EvolutionIndicator   # Character evolution level badge
├── hooks/
│   ├── useGameFlow          # Game orchestration
│   └── useOdysseyStream     # Odyssey SDK wrapper
├── lib/
│   ├── gameState            # Reducer + selectors
│   ├── scoring              # AI-enhanced stat calculation
│   ├── evolution            # Character evolution logic + prompts
│   ├── prompt-templates     # 3-layer prompt architecture
│   ├── animations           # Framer Motion variants
│   ├── sanitize             # Input validation
│   ├── storage              # Battle history persistence
│   └── odyssey-client       # Singleton SDK instance
├── types/
│   └── game.ts              # All game type definitions
└── context/
    └── GameContext.tsx       # Global state provider
```

## 30-Second Demo

1. Auto-demo intro plays showcasing features (click to skip)
2. Enter player names and click "Start Game"
3. Create two characters with descriptions and worlds
4. Battle starts -- Gemini announces the match with dramatic commentary
5. Attack -- Live commentary banner: *"A devastating strike cleaves through the defender's guard!"*
6. Critical hit -- Screen shakes, "CRITICAL!" overlay, combo counter
7. Victory -- Gemini calls the closing, full battle report with stats

You just witnessed:
- Odyssey generating live battle video streams
- Gemini providing real-time sports-style commentary (opening + per-action + closing)
- Character evolution system
- All in 30 seconds

## License

MIT

## Credits

Built for the Odyssey-2 Pro Inaugural Hackathon.
