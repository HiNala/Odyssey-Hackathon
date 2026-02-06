# ODYSSEY ARENA -- Hackathon Submission

## One-Sentence Pitch

Odyssey Arena is the first game with live AI commentary -- where Odyssey-2 Pro generates real-time battle visuals and Google Gemini provides ESPN-style play-by-play narrating every single action.

## What We Built

A **two-player battle game** that orchestrates multiple AI systems in real-time:

1. **Odyssey-2 Pro** generates live video streams -- characters and worlds rendered frame-by-frame, reacting to every player action. The world model IS the game engine.
2. **Google Gemini** analyzes every action, generates vivid narrative commentary, calculates balanced stat changes, and delivers dramatic opening/closing announcements.
3. **Live Commentary Engine** surfaces Gemini's narratives as a prominent ESPN-style banner with a red LIVE indicator, creating an emotional connection no static video generator can match.

## The "Wow" Moment

When you attack in Odyssey Arena, three AI systems fire simultaneously:

- The **Odyssey stream reacts** to your action in real-time video
- A **live commentary banner** slides in: *"A devastating strike cleaves through the defender's guard, sending shockwaves across the arena!"*
- **Screen shakes** on critical hits, combo counters pop, status effects apply
- The **opponent's momentum drops**, energy costs are tracked, and the turn switches

At battle start, Gemini announces: *"Two titans enter! Only one leaves! THIS. IS. WAR!"*

At victory, Gemini calls the closing: *"WHAT A BATTLE! Dragon Knight RISES VICTORIOUS after 8 rounds of PURE CHAOS!"*

This creates an emotional, spectator-friendly experience that feels alive.

## Technical Differentiation

| Feature | Typical Odyssey Project | Odyssey Arena |
|---------|------------------------|---------------|
| Video Generation | Static prompt -> video | Dynamic world model as game engine |
| AI Integration | Single model | Odyssey + Gemini orchestrated in real-time |
| User Interaction | Watch video | Play-by-play strategy game with live feedback |
| Commentary | None | Gemini-powered ESPN-style play-by-play |
| Replayability | One-shot | Infinite (different characters, worlds, strategies) |
| Character Depth | Static | Evolution system -- win to power up, lose to devolve |

### Key Technical Achievements

- **Dual AI Orchestration**: Odyssey for visuals + Gemini for narrative, synchronized per action
- **3-Layer Prompt Architecture**: Base world + character injection + action prompts using state descriptions (prevents Odyssey prompt looping)
- **Live Commentary System**: Dedicated `/api/commentary` endpoint for battle opening/closing; `/api/gemini` for per-action narrative + stat analysis
- **Bounded AI Stat Changes**: Gemini follows strict numerical ranges in its JSON responses for balanced, predictable gameplay
- **Character Evolution**: 5-level evolution system (-2 to +2) with visual transformations via modified Odyssey prompts
- **Combo System**: Consecutive same-type actions multiply damage, tracked per player
- **Status Effects**: 5 types (burning, frozen, powered, weakened, shielded) with duration tracking
- **Stalemate Prevention**: Passive energy regeneration (+3/turn) and 30-turn auto-resolution
- **Victory Classifications**: Flawless Victory, Comeback, Domination with full battle reports
- **Auto-Demo Intro**: Judges see a cinematic slideshow highlighting every feature before gameplay

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| AI Video | Odyssey-2 Pro SDK (`@odysseyml/odyssey`) |
| AI Narrative | Google Gemini API (`@google/generative-ai`) |
| State | React useReducer + Context |
| Icons | Lucide React |

## How to Run

```bash
cd odyssey-arena
npm install --legacy-peer-deps
```

Create `.env.local`:

```env
NEXT_PUBLIC_ODYSSEY_API_KEY=ody_your_key_here
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-2.0-flash
```

```bash
npm run dev
```

Both API keys are **required** -- the Odyssey API is the entire point.

## What's Next

- Multiplayer battles over WebSocket
- Twitch integration (stream battles with live commentary overlay)
- Tournament mode with brackets
- Voice synthesis for commentary (text-to-speech)
- Mobile-native app

## Why This Wins

1. **Unique Feature**: Only project with live AI commentary -- every action narrated
2. **Multi-AI Orchestration**: Best demonstration of Odyssey + Gemini working together in real-time
3. **Engagement**: Commentary creates an emotional, shareable, spectator-friendly experience
4. **Technical Depth**: Evolution system, bounded stats, combos, status effects, stalemate prevention
5. **Polish**: Professional dark-theme UI, auto-demo intro, battle reports, no gimmicks
6. **Replayability**: Every battle is unique -- different characters, worlds, and AI responses

Built for the Odyssey-2 Pro Inaugural Hackathon.
