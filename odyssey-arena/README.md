# Odyssey Arena

**Live AI Battle Simulation** — Two players create characters, place them in AI-generated worlds, and battle in real-time through Odyssey's world model.

Unlike traditional game engines or video generators, Odyssey Arena uses a **world model as the game engine itself**. Every frame is generated live based on physics, history, and narrative context. No pre-rendered assets, no scripted animations — just pure emergent gameplay.

## Features

- **Real-time AI Video** — Odyssey-2 Pro generates continuous video streams that react to player actions
- **AI-Powered Narratives** — Google Gemini analyzes actions and generates dynamic battle commentary
- **Turn-Based Battle System** — Momentum, power, defense, and energy stats create meaningful choices
- **Quick Action Buttons** — Attack, Defend, Special, Taunt with energy costs
- **Demo Mode** — Full game flow without API for testing and offline demos
- **Glassmorphism UI** — Dark, dramatic design with smooth Framer Motion animations
- **Screen Shake** — Visual impact feedback on critical hits
- **Battle History** — Persisted to localStorage with win/loss tracking
- **Responsive** — Stacks vertically on mobile, side-by-side on desktop
- **Accessible** — Keyboard navigation, ARIA labels, focus indicators

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
Player Prompt → Odyssey World Model → Live Video
                     ↓
              Gemini Analysis → Stat Changes → Game State Update
                     ↓
              Event Log → Victory Check → Turn Switch
```

- **3-Layer Prompt System**: Base world prompt + character injection + action prompts (using state descriptions to prevent looping)
- **Singleton Odyssey Client**: One session per API key, managed by custom hook
- **Discriminated Union Actions**: Type-safe state machine with `useReducer`

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

## License

MIT

## Credits

Built for the Odyssey Hackathon.
