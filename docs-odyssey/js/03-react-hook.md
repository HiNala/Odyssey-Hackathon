# React Hook

> useOdyssey hook for managing Odyssey client lifecycle in React.

## Usage

```typescript
import { useOdyssey } from '@odysseyml/odyssey/react';

function useOdyssey(options: UseOdysseyOptions): OdysseyClient
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options.apiKey` | `string` | Yes | Your Odyssey API key |
| `options.handlers` | `UseOdysseyHandlers` | No | Event handlers |

## Return Value

The hook returns an `OdysseyClient` object with the following properties and methods:

### Methods

| Method | Type | Description |
|--------|------|-------------|
| `connect` | `() => Promise<MediaStream>` | Connect to a session (returns MediaStream when connected, throws on failure) |
| `disconnect` | `() => void` | Disconnect from current session |
| `startStream` | `(options?: StartStreamOptions) => Promise<string>` | Start interactive stream |
| `interact` | `(options: InteractOptions) => Promise<string>` | Send interaction prompt |
| `endStream` | `() => Promise<void>` | End current stream |
| `attachToVideo` | `(el: HTMLVideoElement \| null) => HTMLVideoElement \| null` | Attach stream to video element |

### State

| Property | Type | Description |
|----------|------|-------------|
| `status` | `ConnectionStatus` | Current connection status |
| `error` | `string \| null` | Current error message |
| `isConnected` | `boolean` | Whether connected and ready |
| `mediaStream` | `MediaStream \| null` | Video/audio stream |
| `sessionId` | `string \| null` | Current session ID |

## Basic Example

```tsx
import { useOdyssey } from '@odysseyml/odyssey/react';
import { useEffect, useRef } from 'react';

function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const odyssey = useOdyssey({
    apiKey: 'ody_your_api_key_here',
    handlers: {
      onConnected: (mediaStream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      },
      onError: (error, fatal) => {
        console.error('Error:', error.message, 'Fatal:', fatal);
      },
      onStreamStarted: (id) => console.log('Started:', id),
      onInteractAcknowledged: (prompt) => console.log('Ack:', prompt),
    },
  });

  useEffect(() => {
    odyssey.connect()
      .then(stream => console.log('Connected with stream:', stream.id))
      .catch(err => console.error('Connection failed:', err.message));
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted />
      <p>Status: {odyssey.status}</p>
      {odyssey.error && <p>Error: {odyssey.error}</p>}
      <button onClick={() => odyssey.startStream({ prompt: 'A cat' })}>
        Start
      </button>
      <button onClick={() => odyssey.interact({ prompt: 'Pet the cat' })}>
        Interact
      </button>
    </div>
  );
}
```

## Complete Example

```tsx
import { useEffect, useRef, useState } from 'react';
import { useOdyssey } from '@odysseyml/odyssey/react';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [prompt, setPrompt] = useState('');

  const odyssey = useOdyssey({
    apiKey: 'ody_your_api_key_here',
    handlers: {
      onConnected: (mediaStream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      },
      onDisconnected: () => {
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      },
      onError: (error, fatal) => {
        console.error('Error:', error.message, 'Fatal:', fatal);
      },
      onStreamStarted: (streamId) => {
        console.log('Stream started:', streamId);
      },
      onInteractAcknowledged: (ackPrompt) => {
        console.log('Interaction acknowledged:', ackPrompt);
      },
      onStreamError: (reason, message) => {
        console.error('Stream error:', reason, message);
      },
    },
  });

  useEffect(() => {
    odyssey.connect()
      .then(stream => console.log('Connected with stream:', stream.id))
      .catch(err => console.error('Connection failed:', err.message));
    return () => odyssey.disconnect();
  }, []);

  const handleStart = async () => {
    await odyssey.startStream({ prompt: 'A cat', portrait: true });
  };

  const handleInteract = async () => {
    if (prompt.trim()) {
      await odyssey.interact({ prompt });
      setPrompt('');
    }
  };

  const handleEnd = async () => {
    await odyssey.endStream();
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted />
      
      <div>
        <p>Status: {odyssey.status}</p>
        {odyssey.error && <p style={{ color: 'red' }}>{odyssey.error}</p>}
      </div>
      
      <div>
        <button onClick={handleStart} disabled={!odyssey.isConnected}>
          Start Stream
        </button>

        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter interaction prompt..."
        />
        <button onClick={handleInteract} disabled={!odyssey.isConnected}>
          Send
        </button>

        <button onClick={handleEnd} disabled={!odyssey.isConnected}>
          End Stream
        </button>
      </div>
    </div>
  );
}
```

## Tips

- The hook automatically manages cleanup when the component unmounts, but it's good practice to explicitly call `disconnect()` in your cleanup function
- The `isConnected` property is useful for disabling buttons until the connection is ready
- Use the returned `status` and `error` properties to show connection state to users
- Always call `connect()` in a `useEffect` hook
