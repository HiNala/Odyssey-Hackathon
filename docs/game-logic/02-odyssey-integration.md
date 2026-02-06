# Odyssey SDK Integration

## Overview

The Odyssey-2 Pro SDK is the heart of this application. It provides real-time video generation through a WebRTC connection, allowing us to stream AI-generated video directly into the browser. Understanding the SDK's lifecycle, constraints, and best practices is critical for a smooth demo.

This document covers everything you need to know to integrate the Odyssey SDK correctly, including the single-session limitation workaround, proper connection lifecycle management, and optimal prompt engineering for consistent visual results.

---

## SDK Installation

```bash
npm install @odysseyml/odyssey
```

The SDK is available as an npm package. It requires a modern browser with WebRTC support (Chrome 90+, Firefox 88+, Safari 14.1+).

---

## Critical Constraints

### 1. Maximum 1 Concurrent Session

The most important constraint to understand: **you can only have ONE active stream per API key at a time**. This means we cannot run both player streams simultaneously. We must time-share the connection.

**Implication for Odyssey Arena:**
- During setup: Generate Player 1's stream, then end and start Player 2's stream
- During battle: Only one stream is "live" at a time
- We'll use static frames or placeholders when a stream isn't active

### 2. Connection Lifecycle

Always follow this pattern to avoid stale connections:

```typescript
// CORRECT PATTERN
const client = new Odyssey({ apiKey: 'ody_xxx' });

try {
  const mediaStream = await client.connect();
  // Use the stream...
  await client.startStream({ prompt: '...' });
  await client.interact({ prompt: '...' });
  await client.endStream();
} finally {
  client.disconnect(); // ALWAYS disconnect
}
```

If you don't call `disconnect()`, the connection will block for 40 seconds before timing out on the server side. This will prevent new connections.

### 3. Portrait vs Landscape

- **Portrait (704x1280):** Ideal for phone-style screens, set `portrait: true`
- **Landscape (1280x704):** Better for wide displays, set `portrait: false`

For Odyssey Arena, we use **portrait mode** to match our phone screen aesthetic.

---

## Integration Architecture

### Singleton Client Pattern

Since we can only have one session, we use a singleton pattern to manage the Odyssey client:

```typescript
// src/lib/odyssey.ts

import { Odyssey } from '@odysseyml/odyssey';

// Singleton instance
let odysseyClient: Odyssey | null = null;

/**
 * Get or create the Odyssey client instance
 */
export function getOdysseyClient(): Odyssey {
  if (!odysseyClient) {
    const apiKey = process.env.NEXT_PUBLIC_ODYSSEY_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_ODYSSEY_API_KEY is not set');
    }
    odysseyClient = new Odyssey({ apiKey });
  }
  return odysseyClient;
}

/**
 * Disconnect and clear the client
 */
export function disconnectOdyssey(): void {
  if (odysseyClient) {
    odysseyClient.disconnect();
    odysseyClient = null;
  }
}
```

### Connection Manager Hook

A custom hook to manage the Odyssey connection lifecycle:

```typescript
// src/hooks/useOdysseyConnection.ts

import { useEffect, useRef, useState, useCallback } from 'react';
import { getOdysseyClient, disconnectOdyssey } from '@/lib/odyssey';

interface OdysseyConnectionState {
  isConnected: boolean;
  isStreaming: boolean;
  currentStreamId: string | null;
  error: string | null;
  mediaStream: MediaStream | null;
}

export function useOdysseyConnection() {
  const [state, setState] = useState<OdysseyConnectionState>({
    isConnected: false,
    isStreaming: false,
    currentStreamId: null,
    error: null,
    mediaStream: null,
  });
  
  const clientRef = useRef<Odyssey | null>(null);

  // Connect to Odyssey
  const connect = useCallback(async () => {
    try {
      const client = getOdysseyClient();
      clientRef.current = client;

      const mediaStream = await client.connect({
        onConnected: (stream) => {
          setState(prev => ({ 
            ...prev, 
            isConnected: true, 
            mediaStream: stream,
            error: null 
          }));
        },
        onDisconnected: () => {
          setState(prev => ({ 
            ...prev, 
            isConnected: false, 
            isStreaming: false,
            mediaStream: null 
          }));
        },
        onStreamStarted: (streamId) => {
          setState(prev => ({ 
            ...prev, 
            isStreaming: true, 
            currentStreamId: streamId 
          }));
        },
        onStreamEnded: () => {
          setState(prev => ({ 
            ...prev, 
            isStreaming: false 
          }));
        },
        onError: (error, fatal) => {
          setState(prev => ({ 
            ...prev, 
            error: error.message 
          }));
          if (fatal) {
            disconnectOdyssey();
          }
        },
      });

      return mediaStream;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed';
      setState(prev => ({ ...prev, error: message }));
      throw error;
    }
  }, []);

  // Start a stream
  const startStream = useCallback(async (prompt: string, portrait: boolean = true) => {
    const client = clientRef.current;
    if (!client) throw new Error('Not connected');

    const streamId = await client.startStream({ prompt, portrait });
    return streamId;
  }, []);

  // Send an interaction
  const interact = useCallback(async (prompt: string) => {
    const client = clientRef.current;
    if (!client) throw new Error('Not connected');

    const ack = await client.interact({ prompt });
    return ack;
  }, []);

  // End the current stream
  const endStream = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    await client.endStream();
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    disconnectOdyssey();
    clientRef.current = null;
    setState({
      isConnected: false,
      isStreaming: false,
      currentStreamId: null,
      error: null,
      mediaStream: null,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    connect,
    startStream,
    interact,
    endStream,
    disconnect,
  };
}
```

---

## Prompt Engineering for Visual Consistency

### Character Generation Prompts

The key to good Odyssey results is specific, descriptive prompts. Here's our template:

```typescript
// src/lib/prompts.ts

/**
 * Build a character generation prompt
 */
export function buildCharacterPrompt(
  character: string,
  world: string,
  style: string = 'fantasy art'
): string {
  return [
    `A cinematic portrait of ${character}`,
    `standing in ${world}`,
    `${style} style with rich detail`,
    `dramatic lighting with depth and atmosphere`,
    `close-up framing, camera is steady`,
    `soft focus background, sharp subject`,
  ].join('. ') + '.';
}

/**
 * Build a battle action prompt
 */
export function buildActionPrompt(
  action: string,
  intensity: 'subtle' | 'moderate' | 'dramatic' = 'moderate'
): string {
  const intensityMap = {
    subtle: 'gently',
    moderate: 'with purpose',
    dramatic: 'explosively',
  };

  return [
    `The character ${action} ${intensityMap[intensity]}`,
    `the scene responds with matching energy`,
    `lighting shifts to emphasize the moment`,
  ].join('. ') + '.';
}

/**
 * Style presets for different character types
 */
export const stylePresets = {
  fantasy: 'high fantasy art style, magical atmosphere',
  scifi: 'sci-fi aesthetic, neon lighting, futuristic',
  noir: 'film noir style, high contrast, shadows',
  anime: 'anime art style, vibrant colors',
  realistic: 'photorealistic, natural lighting',
  horror: 'dark fantasy, ominous atmosphere, horror elements',
};
```

### Midstream Prompt Best Practices

When sending `interact()` prompts during a stream, follow these rules:

**DO:**
- Use state descriptions: "The character is holding a glowing sword"
- Be specific about visual changes: "Blue light emanates from the character's hands"
- Describe the result, not the action: "The enemy is knocked back"

**DON'T:**
- Use action verbs that loop: "The character swings the sword" (will loop)
- Be vague: "Something cool happens"
- Change the scene completely: "Now in a different location" (jarring)

```typescript
// GOOD prompts
await client.interact({ prompt: "The character is surrounded by flames" });
await client.interact({ prompt: "A powerful aura is visible around the character" });

// BAD prompts (will loop or be jarring)
await client.interact({ prompt: "The character attacks" });  // Loops
await client.interact({ prompt: "Do something" });           // Too vague
```

---

## Handling the Single-Session Limitation

Since we have two player screens but only one stream, we need a strategy:

### Option 1: Sequential Setup (Recommended)

During setup, generate each player's character one at a time:

```typescript
async function setupPlayers(player1Prompt: string, player2Prompt: string) {
  // Connect to Odyssey
  await connect();

  // Setup Player 1
  await startStream(player1Prompt, true);
  // Let it run for 3-5 seconds to establish the scene
  await new Promise(resolve => setTimeout(resolve, 4000));
  await endStream();

  // Small delay between streams
  await new Promise(resolve => setTimeout(resolve, 500));

  // Setup Player 2
  await startStream(player2Prompt, true);
  await new Promise(resolve => setTimeout(resolve, 4000));
  await endStream();

  // Both players are now set up
}
```

### Option 2: Active Player Streaming

During battle, only the active player's screen shows live video:

```typescript
async function switchToPlayer(playerId: 1 | 2, prompt: string) {
  // End any existing stream
  if (state.isStreaming) {
    await endStream();
  }

  // Start the new player's stream
  await startStream(prompt, true);
}
```

### Option 3: Pre-recorded Loop (Fallback)

If real-time streaming is problematic, pre-generate a short video for each character using the Simulate API, then loop the recording:

```typescript
// This is a fallback option if live streaming is unreliable
async function preGenerateCharacter(prompt: string): Promise<string> {
  const job = await client.simulate({
    script: [
      { timestamp_ms: 0, start: { prompt } },
      { timestamp_ms: 10000, end: {} },
    ],
    portrait: true,
  });

  // Poll for completion
  let status;
  do {
    await new Promise(resolve => setTimeout(resolve, 2000));
    status = await client.getSimulateStatus(job.job_id);
  } while (status.status === 'pending' || status.status === 'running');

  // Get the recording URL
  const recording = await client.getRecording(status.streams[0].stream_id);
  return recording.video_url!;
}
```

---

## Video Element Integration

Attaching the MediaStream to a video element:

```typescript
// src/components/VideoPlayer.tsx

import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  mediaStream: MediaStream | null;
  isActive: boolean;
}

export function VideoPlayer({ mediaStream, isActive }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (mediaStream && isActive) {
      video.srcObject = mediaStream;
      video.play().catch(console.error);
    } else {
      video.srcObject = null;
    }

    return () => {
      video.srcObject = null;
    };
  }, [mediaStream, isActive]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover"
    />
  );
}
```

---

## Error Handling

Common errors and how to handle them:

```typescript
// src/lib/odyssey.ts (continued)

export function handleOdysseyError(error: Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('api key')) {
    return 'Invalid API key. Please check your configuration.';
  }
  if (message.includes('concurrent session')) {
    return 'Another session is active. Please wait and try again.';
  }
  if (message.includes('no available streamers')) {
    return 'Service is busy. Please try again in a moment.';
  }
  if (message.includes('timeout')) {
    return 'Connection timed out. Please try again.';
  }

  return `Connection error: ${error.message}`;
}
```

---

## Environment Setup

Create a `.env.local` file in the project root:

```env
# .env.local
NEXT_PUBLIC_ODYSSEY_API_KEY=ody_your_api_key_here
```

---

## Checklist

- [ ] Install `@odysseyml/odyssey` package
- [ ] Create `.env.local` with API key
- [ ] Create `src/lib/odyssey.ts` with singleton client
- [ ] Create `src/hooks/useOdysseyConnection.ts`
- [ ] Create `src/lib/prompts.ts` with prompt templates
- [ ] Create `src/components/VideoPlayer.tsx`
- [ ] Test basic connect → startStream → interact → endStream flow
- [ ] Implement error handling with user-friendly messages
- [ ] Add cleanup on component unmount
