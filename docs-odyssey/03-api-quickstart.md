# API Quick Start

> Integrate Odyssey-2 Pro into your application in 5 minutes.

## 1. Create a Developer Account & Get an API Key

Sign up and receive an API key at https://developer.odyssey.ml

## 2. Install

### JavaScript/TypeScript

```bash
# npm
npm install @odysseyml/odyssey

# yarn
yarn add @odysseyml/odyssey

# pnpm
pnpm add @odysseyml/odyssey
```

Required version: `^1.0.0`

### Python

```bash
# pip
pip install git+https://github.com/odysseyml/odyssey-python.git

# uv
uv pip install git+https://github.com/odysseyml/odyssey-python.git
```

Requires Python 3.12+

## Image-to-Video Requirements

- **Max size:** 25MB
- **Supported formats:** JPEG, PNG, WebP, GIF, BMP, HEIC, HEIF, AVIF
- **Resolution:** Images are automatically resized to 1280x704 (landscape) or 704x1280 (portrait)

## HTML (CDN Import)

For standalone HTML files without a bundler:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui; max-width: 600px; margin: 2rem auto; }
    video { width: 100%; background: #000; }
    input[type="text"] { flex: 1; padding: 0.5rem; }
    button { padding: 0.5rem 1rem; }
    .row { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <video id="video" autoplay playsinline muted></video>
  <p id="status">Loading...</p>
  <div class="row">
    <input id="prompt" type="text" placeholder="Enter prompt..." />
    <button id="send">Send</button>
    <button id="end" disabled>End</button>
  </div>
  <script type="module">
    import { Odyssey } from 'https://esm.sh/@odysseyml/odyssey';

    const client = new Odyssey({ apiKey: 'ody_your_api_key_here' });
    const status = document.getElementById('status');
    const prompt = document.getElementById('prompt');
    const endBtn = document.getElementById('end');
    let isStreaming = false;

    window.addEventListener('beforeunload', () => client.disconnect());

    status.textContent = 'Connecting...';
    const mediaStream = await client.connect();
    document.getElementById('video').srcObject = mediaStream;
    status.textContent = 'Connected';

    document.getElementById('send').onclick = async () => {
      const text = prompt.value.trim();
      if (!text) return;
      prompt.value = '';

      if (isStreaming) {
        await client.interact({ prompt: text });
      } else {
        status.textContent = 'Starting...';
        await client.startStream({ prompt: text });
        isStreaming = true;
        endBtn.disabled = false;
        status.textContent = 'Streaming';
      }
    };

    endBtn.onclick = async () => {
      await client.endStream();
      isStreaming = false;
      endBtn.disabled = true;
      status.textContent = 'Connected';
    };
  </script>
</body>
</html>
```

## JavaScript

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

## React

```jsx
import { Odyssey } from '@odysseyml/odyssey';
import { useRef, useEffect, useState } from 'react';

const client = new Odyssey({ apiKey: 'ody_your_api_key_here' });

function App() {
  const videoRef = useRef(null);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('Disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    return () => client.disconnect();
  }, []);

  const handleConnect = async () => {
    setStatus('Connecting...');
    const mediaStream = await client.connect();
    if (videoRef.current) videoRef.current.srcObject = mediaStream;
    setIsConnected(true);
    setStatus('Connected');
  };

  const handleSend = async () => {
    if (!prompt.trim()) return;
    const text = prompt;
    setPrompt('');

    if (isStreaming) {
      await client.interact({ prompt: text });
    } else {
      setStatus('Starting...');
      await client.startStream({ prompt: text });
      setIsStreaming(true);
      setStatus('Streaming');
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted />
      <p>Status: {status}</p>
      <button onClick={handleConnect} disabled={isConnected}>Connect</button>
      <input 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)} 
        placeholder="Enter prompt..." 
        disabled={!isConnected} 
      />
      <button onClick={handleSend} disabled={!isConnected}>Send</button>
      <button onClick={() => client.endStream()} disabled={!isStreaming}>End</button>
    </div>
  );
}
```

## Next.js

```jsx
'use client';
import { Odyssey } from '@odysseyml/odyssey';
import { useRef, useEffect, useState } from 'react';

const client = new Odyssey({ apiKey: 'ody_your_api_key_here' });

export default function OdysseyDemo() {
  const videoRef = useRef(null);
  const [prompt, setPrompt] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => () => client.disconnect(), []);

  const handleConnect = async () => {
    const mediaStream = await client.connect();
    if (videoRef.current) videoRef.current.srcObject = mediaStream;
    setIsConnected(true);
  };

  const handleSend = async () => {
    const text = prompt;
    setPrompt('');
    if (isStreaming) {
      await client.interact({ prompt: text });
    } else {
      await client.startStream({ prompt: text });
      setIsStreaming(true);
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', background: '#000' }} />
      <button onClick={handleConnect} disabled={isConnected}>Connect</button>
      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter prompt..." disabled={!isConnected} />
      <button onClick={handleSend} disabled={!isConnected}>Send</button>
      <button onClick={() => { client.endStream(); setIsStreaming(false); }} disabled={!isStreaming}>End</button>
    </div>
  );
}
```

> **Note:** Next.js App Router requires the `'use client'` directive for components using React hooks and browser APIs like video elements.

## Python

```python
import asyncio
from odyssey import Odyssey, OdysseyAuthError, OdysseyConnectionError

async def main():
    client = Odyssey(api_key="ody_your_api_key_here")

    try:
        await client.connect(
            on_video_frame=lambda frame: print(f"Frame: {frame.width}x{frame.height}"),
            on_stream_started=lambda stream_id: print(f"Ready: {stream_id}"),
        )
        await client.start_stream("A cat", portrait=True)
        await client.interact("Pet the cat")
        await client.end_stream()
    except OdysseyAuthError:
        print("Invalid API key")
    except OdysseyConnectionError as e:
        print(f"Connection failed: {e}")
    finally:
        await client.disconnect()

asyncio.run(main())
```

## Important Notes

- Always ensure `disconnect()` is called when done (via page unload handlers or component cleanup)
- Stale connections count towards your concurrent session limit (max 1), which will block new connections until they time out
- If `disconnect()` is not called, connections are automatically cleared after 40 seconds on the server side
