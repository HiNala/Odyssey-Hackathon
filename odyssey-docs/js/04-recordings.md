# Recordings

> Working with stream recordings in the Odyssey client.

Recording features require v1.0.0 or later.

After a stream session ends, you can retrieve recording artifacts including the full video, events log, thumbnail, and preview.

## Capturing the Stream ID

The stream ID is provided in the `onStreamStarted` callback. Save this ID to retrieve recordings later:

```javascript
import { Odyssey } from '@odysseyml/odyssey';

const client = new Odyssey({ apiKey: 'ody_your_api_key_here' });

let currentStreamId = null;

const connected = await client.connect({
  onConnected: (mediaStream) => {
    videoElement.srcObject = mediaStream;
  },
  onStreamStarted: (streamId) => {
    // Save the stream ID for later recording retrieval
    currentStreamId = streamId;
    console.log('Stream started:', streamId);
  },
});

if (connected) {
  await client.startStream({ prompt: 'A cat' });
  // ... interact with the stream ...
  await client.endStream();
}

client.disconnect();
```

## Retrieving a Recording

Use `getRecording()` with the stream ID to get presigned URLs for the recording artifacts:

```javascript
if (currentStreamId) {
  const recording = await client.getRecording(currentStreamId);
  
  if (recording.video_url) {
    // Play back the recorded video
    const playbackVideo = document.getElementById('playback');
    playbackVideo.src = recording.video_url;
  }
  
  if (recording.events_url) {
    // Fetch and parse the events log (JSONL format)
    const response = await fetch(recording.events_url);
    const text = await response.text();
    const events = text.trim().split('\n').map(line => JSON.parse(line));
    console.log('Session events:', events);
  }
  
  console.log('Duration:', recording.duration_seconds, 'seconds');
  console.log('Frames:', recording.frame_count);
}
```

> **Note:** `getRecording()` can be called without an active connection. It only requires a valid API key.

### Recording Properties

| Property | Type | Description |
|----------|------|-------------|
| `stream_id` | `string` | The stream ID |
| `video_url` | `string \| null` | Presigned URL for full recording (MP4) |
| `events_url` | `string \| null` | Presigned URL for events log (JSONL) |
| `thumbnail_url` | `string \| null` | Presigned URL for thumbnail (JPEG) |
| `preview_url` | `string \| null` | Presigned URL for preview video (MP4) |
| `frame_count` | `number \| null` | Total frames in recording |
| `duration_seconds` | `number \| null` | Recording duration in seconds |

> **Note:** URLs are valid for a limited time (typically 1 hour).

## Listing All Recordings

Use `listStreamRecordings()` to get a paginated list of all your recordings:

```javascript
// Get recent recordings
const { recordings, total } = await client.listStreamRecordings({ limit: 10 });

console.log(`Found ${total} recordings`);

for (const rec of recordings) {
  console.log(`Stream ${rec.stream_id}: ${rec.duration_seconds}s at ${rec.width}x${rec.height}`);
}

// Paginate through results
const page2 = await client.listStreamRecordings({ limit: 10, offset: 10 });
```

### Pagination Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `limit` | `number` | `50` | Maximum recordings to return (max 100) |
| `offset` | `number` | `0` | Number of recordings to skip |

## React Example

```tsx
import { useOdyssey } from '@odysseyml/odyssey/react';
import { useState } from 'react';

function RecordingsViewer() {
  const odyssey = useOdyssey({ apiKey: 'ody_your_api_key_here' });
  const [recordings, setRecordings] = useState([]);

  const loadRecordings = async () => {
    const result = await odyssey.listStreamRecordings({ limit: 20 });
    setRecordings(result.recordings);
  };

  const playRecording = async (streamId) => {
    const recording = await odyssey.getRecording(streamId);
    if (recording.video_url) {
      window.open(recording.video_url, '_blank');
    }
  };

  return (
    <div>
      <button onClick={loadRecordings}>Load My Recordings</button>
      <ul>
        {recordings.map((rec) => (
          <li key={rec.stream_id}>
            {rec.stream_id} - {rec.duration_seconds}s
            <button onClick={() => playRecording(rec.stream_id)}>Play</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Complete Workflow Example

This example shows the full workflow: starting a stream, interacting with it, ending it, and then retrieving the recording:

```javascript
import { Odyssey } from '@odysseyml/odyssey';

const client = new Odyssey({ apiKey: 'ody_your_api_key_here' });

let currentStreamId = null;

const connected = await client.connect({
  onConnected: (mediaStream) => {
    videoElement.srcObject = mediaStream;
  },
  onStreamStarted: (streamId) => {
    currentStreamId = streamId;
    console.log('Stream started:', streamId);
  },
});

if (connected) {
  // Start an interactive stream
  await client.startStream({ 
    prompt: 'A cat sitting on a windowsill', 
    portrait: true 
  });
  
  // Send some interactions
  await client.interact({ prompt: 'The cat stretches and yawns' });
  await client.interact({ prompt: 'The cat looks outside at birds' });
  
  // End the stream
  await client.endStream();
}

client.disconnect();

// Retrieve the recording
if (currentStreamId) {
  const recording = await client.getRecording(currentStreamId);
  
  if (recording.video_url) {
    console.log('Recording available at:', recording.video_url);
    console.log('Duration:', recording.duration_seconds, 'seconds');
  }
}
```
