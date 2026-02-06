# ODYSSEY ARENA -- Hackathon Submission

## One-Sentence Pitch

Odyssey Arena is the first game with live AI commentary -- where Odyssey generates real-time battle visuals and Gemini provides ESPN-style play-by-play for every action.

## What We Built

A **two-player battle game** that orchestrates multiple AI systems in real-time:

1. **Odyssey-2 Pro** generates live video streams -- characters and worlds rendered frame-by-frame, reacting to player actions. The world model IS the game engine.
2. **Google Gemini** analyzes every action, generates vivid narrative commentary, and calculates balanced stat changes with bounded numerical ranges.
3. **Live Commentary Engine** surfaces Gemini's narratives as a prominent ESPN-style banner, creating an emotional connection no static video generator can match.

## The "Wow" Moment

When you attack in Odyssey Arena, you don't just see a stat change -- you see:

- The **Odyssey stream reacts** to your action in real-time
- A **live commentary banner** slides in: *"A devastating strike cleaves through the defender's guard, sending shockwaves across the arena!"*
- **Screen shakes** on critical hits, combo counters pop, status effects apply
- The **opponent's momentum drops**, energy costs are tracked, and the turn switches

This creates an emotional, spectator-friendly experience that feels alive.

## Technical Differentiation

| Feature | Typical Odyssey Project | Odyssey Arena |
|---------|------------------------|---------------|
| Video Generation | Static prompt -> video | Dynamic world model as game engine |
| AI Integration | Single model | Odyssey + Gemini orchestrated |
| User Interaction | Watch video | Play-by-play strategy game |
| Feedback | None | Live commentary + screen shake + combos |
| Replayability | One-shot | Infinite (different characters, worlds, strategies) |

### Key Technical Achievements

- **3-Layer Prompt Architecture**: Base world + character injection + action prompts using state descriptions (prevents Odyssey prompt looping)
- **Bounded AI Stat Changes**: Gemini follows strict numerical ranges in its JSON responses for balanced, predictable gameplay
- **Combo System**: Consecutive same-type actions multiply damage, tracked per player
- **Status Effects**: 5 types (burning, frozen, powered, weakened, shielded) with duration tracking
- **Stalemate Prevention**: Passive energy regeneration (+3/turn) and 30-turn auto-resolution
- **Victory Classifications**: Flawless Victory, Comeback, Domination based on final stats
- **Battle Reports**: Full statistical breakdown with MVP highlights

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| AI Video | Odyssey-2 Pro SDK |
| AI Narrative | Google Gemini API |
| State | React useReducer + Context |
| Icons | Lucide React |

## How to Run

```bash
cd odyssey-arena
npm install --legacy-peer-deps
# Create .env.local with NEXT_PUBLIC_ODYSSEY_API_KEY and GEMINI_API_KEY
npm run dev
```

Demo Mode works without any API keys -- click "Demo Mode" on the start screen.

## What's Next

- Multiplayer battles over WebSocket
- Twitch integration (stream battles with live commentary overlay)
- Tournament mode with brackets
- Mobile-native app
- Voice synthesis for commentary (text-to-speech)
- Creature evolution system (visual continuity across battles)

## Why This Wins

1. **Unique Feature**: Only project with live AI commentary
2. **Multi-AI Orchestration**: Best demonstration of Odyssey + Gemini working together
3. **Engagement**: Commentary creates an emotional, shareable experience
4. **Technical Depth**: Bounded stats, combos, status effects, stalemate prevention
5. **Polish**: Professional dark-theme UI, no emojis, no gimmicks, pure craft
6. **Replayability**: Every battle is unique -- different characters, worlds, and AI responses

Built for the Odyssey-2 Pro Inaugural Hackathon.
