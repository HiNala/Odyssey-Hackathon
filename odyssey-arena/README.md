# Odyssey Arena
## Live AI Creature Battles with Real-Time Commentary

> The first game where AI generates both the battle visuals AND live play-by-play commentary

**Two players create characters, place them in AI-generated worlds, and battle in real-time** -- with ESPN-style live commentary powered by Google Gemini narrating every move.

Unlike traditional game engines or video generators, Odyssey Arena uses a **world model as the game engine itself**. Every frame is generated live based on physics, history, and narrative context. No pre-rendered assets, no scripted animations -- just pure emergent gameplay with an AI commentator calling every shot.

## What Makes This Different

**Every other Odyssey project:** "Look at this AI-generated video"

**Odyssey Arena:** "Watch creatures battle with live AI commentary that makes you feel like you're watching ESPN"

### The Innovation

- **Dual AI System**: Odyssey generates visuals, Gemini generates commentary
- **Real-Time Feedback**: Every action gets instant announcer-style commentary
- **Living Stats**: Win battles through strategy -- momentum, power, defense, energy
- **No Pre-Rendered Assets**: Every pixel generated live by AI, every word of commentary unique

## Features

- **Live AI Commentary** -- Gemini generates real-time battle commentary displayed as a sleek ESPN-style banner
- **Real-time AI Video** -- Odyssey-2 Pro generates continuous video streams that react to player actions
- **Turn-Based Battle System** -- Momentum, power, defense, and energy stats create meaningful choices
- **Combo System** -- Chain same-type actions for escalating damage bonuses
- **Status Effects** -- Burning, frozen, powered, weakened, shielded
- **Critical Hits & Screen Shake** -- Visual impact feedback with dynamic overlays
- **Quick Action Buttons** -- Attack, Defend, Special, Taunt with energy costs
- **Demo Mode** -- Full game flow without API for testing and offline demos
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
| AI Video | Odyssey-2 Pro SDK |
| AI Narrative | Google Gemini API |
| State | React useReducer + Context |

## Getting Started

### Prerequisites

- Node.js 18+
- An Odyssey API key ([developer.odyssey.ml](https://developer.odyssey.ml))
- A Gemini API key ([aistudio.google.com](https://aistudio.google.com/apikey))

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
GEMINI_MODEL=gemini-3-flash-preview
```

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

1. **Start Game** — Click "Start Game" (or "Demo Mode" for offline testing)
2. **Create Characters** — Describe your character and world for each player
3. **Battle** — Use quick action buttons or type custom prompts
4. **Win** — Drive your momentum to 100 (or your opponent's to 0) to win

### Actions

| Action | Effect | Energy Cost |
|--------|--------|-------------|
| Attack | Deal damage, gain momentum | 10 |
| Defend | Boost defense, recover energy | 7 |
| Special | High damage, high risk | 25 |
| Taunt | Drain opponent energy | 5 |

## Architecture

```
Player Prompt → Odyssey World Model → Live Video Stream
                     ↓
              Gemini Analysis → Stat Changes + Narrative Commentary
                     ↓
              Game State Update → Live Commentary Banner + Event Log → Victory Check
```

**3 AI Systems Working Together:**
1. **Odyssey-2 Pro** -- Real-time video generation (world model as game engine)
2. **Gemini Pro** -- Battle narrative generation + stat analysis (bounded, balanced)
3. **Commentary Engine** -- Surfaces Gemini narratives as live ESPN-style banners

**Technical Highlights:**
- 3-Layer Prompt System: Base world prompt + character injection + action prompts (state descriptions prevent looping)
- Singleton Odyssey Client: One session per API key, managed by custom hook
- Discriminated Union Actions: Type-safe state machine with `useReducer`
- AI-bounded stat changes: Gemini follows strict numerical ranges for balanced gameplay
- Passive energy regeneration prevents stalemates

## Project Structure

```
odyssey-arena/
├── app/
│   ├── page.tsx          # Main arena (all game phases)
│   ├── layout.tsx         # Root layout + providers
│   ├── error.tsx          # Error boundary page
│   ├── loading.tsx        # Loading skeleton
│   ├── globals.css        # Tailwind v4 + custom utilities
│   └── api/gemini/        # Gemini AI route
├── components/
│   ├── ArenaBackground    # Atmospheric gradient + orbs
│   ├── PhoneFrame         # Glassmorphism video container
│   ├── OdysseyStream      # Video + connection status overlays
│   ├── CenterHUD          # Momentum bars, stats, event log
│   ├── ActionButtons      # Quick battle actions
│   ├── PromptInput        # Custom action input
│   ├── SetupForm          # Character + world creation
│   ├── VictoryOverlay     # End-of-battle summary
│   ├── DamagePopup        # Floating damage numbers
│   └── ErrorBoundary      # React error catch
├── hooks/
│   ├── useGameFlow        # Game orchestration
│   └── useOdysseyStream   # Odyssey SDK wrapper
├── lib/
│   ├── gameState          # Reducer + selectors
│   ├── scoring            # AI-enhanced stat calculation
│   ├── prompt-templates   # 3-layer prompt architecture
│   ├── animations         # Framer Motion variants
│   ├── sanitize           # Input validation
│   ├── storage            # Battle history persistence
│   └── odyssey-client     # Singleton SDK instance
├── types/
│   └── game.ts            # All game type definitions
└── context/
    └── GameContext.tsx     # Global state provider
```

## 30-Second Demo

1. Enter player names and click "Start Game" (or "Demo Mode" for instant offline play)
2. Create two characters with descriptions and worlds
3. Battle starts -- Gemini announces: *"Shadow Knight vs Storm Mage -- the battle begins!"*
4. Attack -- Commentary banner: *"A devastating strike cleaves through the defender's guard!"*
5. Critical hit -- Screen shakes, "CRITICAL!" overlay, commentary: *"An absolutely crushing blow!"*
6. Victory -- Full battle report with stats, MVP highlight, victory classification

You just witnessed:
- Odyssey generating live battle video streams
- Gemini providing real-time sports-style commentary
- Dynamic combo, status effect, and stat systems
- All in 30 seconds

## License

MIT

## Credits

Built for the Odyssey-2 Pro Inaugural Hackathon.
