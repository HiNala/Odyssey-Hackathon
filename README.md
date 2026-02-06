# Odyssey Arena

**Live AI Battle Simulation** — A Next.js application powered by [Odyssey ML](https://developer.odyssey.ml) for real-time 3D world streaming and [Google Gemini](https://ai.google.dev) for intelligent battle narration.

## Overview

Odyssey Arena is a two-player AI battle game where players create characters and worlds, then engage in epic battles rendered in real-time by the Odyssey AI engine. Gemini AI provides dynamic narration, strategic analysis, and visual scene generation.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **AI Rendering:** Odyssey ML SDK — real-time 3D world generation
- **AI Narration:** Google Gemini 3 Flash — battle narration & prompt generation
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion
- **UI Utilities:** clsx + tailwind-merge

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- [Odyssey API Key](https://developer.odyssey.ml/dashboard)
- [Google Gemini API Key](https://aistudio.google.com/apikey)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/HiNala/Odyssey-Hackathon.git
   cd Odyssey-Hackathon
   ```

2. **Install dependencies:**
   ```bash
   cd odyssey-arena
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual API keys:
   ```
   NEXT_PUBLIC_ODYSSEY_API_KEY=ody_your_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3-flash-preview
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Odyssey-Hackathon/
├── odyssey-arena/          # Next.js application
│   ├── app/                # App Router pages & API routes
│   │   ├── api/generate/   # Gemini AI API endpoint
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main arena page
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   │   ├── gemini-client.ts    # Gemini AI integration
│   │   ├── odyssey-client.ts   # Odyssey SDK wrapper
│   │   ├── types.ts            # TypeScript types
│   │   └── utils.ts            # Utility functions
│   └── public/             # Static assets
├── docs/                   # Design & mission documentation
└── odyssey-docs/           # Odyssey SDK documentation
```

## API Routes

### `POST /api/generate`

Server-side Gemini AI generation endpoint. Supports three modes:

| Type | Description |
|------|-------------|
| `general` | Free-form text generation |
| `narration` | Battle narration with game context |
| `visual` | Visual scene descriptions for Odyssey rendering |

**Example:**
```json
{
  "type": "narration",
  "prompt": "Player 1 unleashes a fire attack",
  "context": {
    "player1Character": "Fire Mage",
    "player2Character": "Ice Knight",
    "world": "Volcanic Arena"
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_ODYSSEY_API_KEY` | Yes | Odyssey ML API key (client-side) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key (server-side only) |
| `GEMINI_MODEL` | No | Gemini model name (default: `gemini-3-flash-preview`) |

## License

MIT
