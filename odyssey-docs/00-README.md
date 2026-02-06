# Odyssey-2 Pro Hackathon Documentation

**Hackathon Date:** February 5, 2026  
**Location:** CANOPY Menlo Park

## Quick Links

- **Developer Portal:** https://developer.odyssey.ml
- **Documentation:** https://documentation.api.odyssey.ml
- **Discord Community:** Join for support and updates

## Prizes

- **1st place:** $25K cash, $25K API credits, $25K AWS Credits
- **2nd place:** $7.5K cash, $7.5K API credits, $10K AWS Credits
- **3rd place:** $2.5K cash, $2.5K API credits, $5K AWS Credits
- **2 honorable mentions:** $1K API credits each

## Documentation Structure

### Getting Started
- `01-introduction.md` - Introducing the Odyssey API
- `02-odyssey2-overview.md` - Odyssey-2 Pro Overview (World Model)
- `03-api-quickstart.md` - Get up and running in 5 minutes
- `04-interaction-tips.md` - Prompting guide and best practices

### JavaScript SDK
- `js/01-overview.md` - SDK overview and installation
- `js/02-odyssey-class.md` - Main client class API
- `js/03-react-hook.md` - useOdyssey React hook
- `js/04-recordings.md` - Working with recordings
- `js/05-simulations.md` - Simulate API (async batch generation)
- `js/06-types.md` - TypeScript types and interfaces
- `js/07-examples.md` - Complete code examples

### Python SDK
- `python/01-overview.md` - SDK overview and installation
- `python/02-client.md` - Main client class API
- `python/03-recordings.md` - Working with recordings
- `python/04-simulations.md` - Simulate API (async batch generation)
- `python/05-types.md` - Python types and dataclasses
- `python/06-examples.md` - Complete code examples

## Key Concepts

### World Model vs Video Model
- **World Model (Odyssey-2 Pro):** Predicts one frame at a time, reacts to input, fully interactive
- **Video Model:** Generates full video at once, no interactivity

### Three API Endpoints
1. **Interactive Streams** - Real-time, user-driven interactions
2. **Viewable Streams** - Online, real-time generation
3. **Simulations** - Offline, batch/scripted video generation

## Installation

**JavaScript:**
```bash
npm install @odysseyml/odyssey
```

**Python:**
```bash
pip install git+https://github.com/odysseyml/odyssey-python.git
```

## Quick Start

**JavaScript:**
```javascript
import { Odyssey } from '@odysseyml/odyssey';

const client = new Odyssey({ apiKey: 'ody_your_api_key_here' });
const mediaStream = await client.connect();
document.querySelector('video').srcObject = mediaStream;

await client.startStream({ prompt: 'A cat' });
await client.interact({ prompt: 'Pet the cat' });
await client.endStream();
client.disconnect();
```

**Python:**
```python
import asyncio
from odyssey import Odyssey

async def main():
    client = Odyssey(api_key="ody_your_api_key_here")
    await client.connect(
        on_video_frame=lambda frame: print(f"Frame: {frame.width}x{frame.height}")
    )
    await client.start_stream("A cat")
    await client.interact("Pet the cat")
    await client.end_stream()
    await client.disconnect()

asyncio.run(main())
```

## Important Notes

- **Max 1 concurrent session** - Always call `disconnect()` when done
- **Connections auto-clear after 40 seconds** if not properly disconnected
- **Image-to-video:** Max 25MB, formats: JPEG, PNG, WebP, GIF, BMP, HEIC, HEIF, AVIF
- **Resolution:** 1280x704 (landscape) or 704x1280 (portrait)
