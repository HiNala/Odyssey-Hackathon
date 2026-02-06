# JavaScript Examples

> Complete usage examples for the Odyssey client.

## Vanilla JavaScript

```javascript
import { Odyssey } from '@odysseyml/odyssey';

const videoElement = document.getElementById('video');
const statusElement = document.getElementById('status');
const client = new Odyssey({ apiKey: 'ody_your_api_key_here' });

async function connect() {
  try {
    await client.connect({
      onConnected: (mediaStream) => {
        videoElement.srcObject = mediaStream;
        videoElement.play();
      },
      onDisconnected: () => {
        videoElement.srcObject = null;
      },
      onStatusChange: (status, message) => {
        statusElement.textContent = message || status;
      },
      onError: (error, fatal) => {
        console.error('Error:', error.message);
        if (fatal) {
          statusElement.textContent = 'Connection failed: ' + error.message;
        }
      },
    });
  } catch (error) {
    console.error('Failed to connect:', error.message);
    statusElement.textContent = 'Connection failed: ' + error.message;
  }
}

async function startStream() {
  const streamId = await client.startStream({ prompt: 'A cat', portrait: true });
  console.log('Stream started:', streamId);
}

async function interact(prompt) {
  const ack = await client.interact({ prompt });
  console.log('Acknowledged:', ack);
}

function disconnect() {
  client.disconnect();
}

// Usage
connect();
document.getElementById('start-btn').onclick = startStream;
document.getElementById('interact-btn').onclick = () => interact('Pet the cat');
document.getElementById('disconnect-btn').onclick = disconnect;
```

## HTML Boilerplate

```html
<!DOCTYPE html>
<html>
<head>
  <title>Odyssey Demo</title>
</head>
<body>
  <video id="video" autoplay playsinline muted></video>
  <p id="status">Disconnected</p>
  <button id="start-btn">Start Stream</button>
  <button id="interact-btn">Interact</button>
  <button id="disconnect-btn">Disconnect</button>
  
  <script type="module">
    import { Odyssey } from '@odysseyml/odyssey';

    const client = new Odyssey({ apiKey: 'ody_your_api_key_here' });
    const video = document.getElementById('video');
    const status = document.getElementById('status');

    try {
      await client.connect({
        onConnected: (mediaStream) => {
          video.srcObject = mediaStream;
          status.textContent = 'Connected';
        },
        onError: (error, fatal) => {
          console.error('Error:', error.message);
          if (fatal) status.textContent = 'Connection failed';
        },
        onStatusChange: (s, msg) => {
          status.textContent = msg || s;
        },
      });

      document.getElementById('start-btn').onclick = async () => {
        await client.startStream({ prompt: 'A cat' });
      };
    } catch (error) {
      console.error('Failed to connect:', error.message);
      status.textContent = 'Connection failed';
    }

    document.getElementById('interact-btn').onclick = async () => {
      await client.interact({ prompt: 'Pet the cat' });
    };

    document.getElementById('disconnect-btn').onclick = () => {
      client.disconnect();
    };
  </script>
</body>
</html>
```

## React with TypeScript

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
    await odyssey.startStream({ prompt: 'A cat at sunset', portrait: true });
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

export default App;
```

## Error Handling Pattern

```javascript
import { Odyssey } from '@odysseyml/odyssey';

const client = new Odyssey({ apiKey: 'ody_your_api_key_here' });

await client.connect({
  onError: (error, fatal) => {
    if (fatal) {
      // Connection cannot continue - show error UI
      showErrorPage(error.message);
    } else {
      // Recoverable - show notification
      showNotification(`Warning: ${error.message}`);
    }
  },
  onStreamError: (reason, message) => {
    // Stream-specific error (e.g., model crashed)
    console.error(`Stream error [${reason}]: ${message}`);
    
    // You might want to restart the stream
    await client.endStream();
    await client.startStream({ prompt: 'Recovery prompt' });
  },
});
```

## Status Monitoring

```javascript
import { Odyssey } from '@odysseyml/odyssey';

const client = new Odyssey({ apiKey: 'ody_your_api_key_here' });

await client.connect({
  onStatusChange: (status, message) => {
    switch (status) {
      case 'authenticating':
        showLoader('Authenticating...');
        break;
      case 'connecting':
        showLoader('Connecting to server...');
        break;
      case 'reconnecting':
        showLoader('Reconnecting...');
        break;
      case 'connected':
        hideLoader();
        showSuccess('Connected!');
        break;
      case 'disconnected':
        showInfo('Disconnected');
        break;
      case 'failed':
        showError(message || 'Connection failed');
        break;
    }
  },
});
```

## Image-to-Video

```javascript
import { Odyssey } from '@odysseyml/odyssey';

const client = new Odyssey({ apiKey: 'ody_your_api_key_here' });

// File input handler
const fileInput = document.getElementById('image-input');

fileInput.addEventListener('change', async () => {
  const imageFile = fileInput.files?.[0];
  if (!imageFile) return;

  // Connect to Odyssey
  const mediaStream = await client.connect();
  document.querySelector('video').srcObject = mediaStream;

  // Start stream with the image
  const streamId = await client.startStream({
    prompt: 'A cat',
    portrait: false,  // landscape
    image: imageFile
  });
  console.log('Stream started:', streamId);

  // Interact as usual
  await client.interact({ prompt: 'Pet the cat' });
});

// Cleanup
window.addEventListener('beforeunload', () => client.disconnect());
```

## Working with the Simulate API

```javascript
import { Odyssey } from '@odysseyml/odyssey';

const client = new Odyssey({ apiKey: 'ody_your_api_key_here' });

// Create a simulation with a scripted sequence
const job = await client.simulate({
  script: [
    { timestamp_ms: 0, start: { prompt: 'A cat sitting on a windowsill' } },
    { timestamp_ms: 3000, interact: { prompt: 'The cat watches a bird outside' } },
    { timestamp_ms: 6000, interact: { prompt: 'The cat stretches lazily' } },
    { timestamp_ms: 9000, end: {} }
  ],
  portrait: true
});

console.log('Simulation started:', job.job_id);

// Poll for completion
async function waitForCompletion(jobId) {
  while (true) {
    const status = await client.getSimulateStatus(jobId);
    
    if (status.status === 'completed') {
      return status;
    }
    if (status.status === 'failed') {
      throw new Error(`Simulation failed: ${status.error_message}`);
    }
    if (status.status === 'cancelled') {
      throw new Error('Simulation was cancelled');
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

const result = await waitForCompletion(job.job_id);

// Get recordings from completed simulation
for (const stream of result.streams) {
  const recording = await client.getRecording(stream.stream_id);
  console.log('Video URL:', recording.video_url);
}
```
