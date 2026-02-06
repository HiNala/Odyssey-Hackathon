# Odyssey Class

> Main client class for interacting with Odyssey's audio-visual intelligence.

## Constructor

```typescript
constructor(config: ClientConfig)
```

Creates a new Odyssey client instance with the provided API key.

| Parameter | Type | Description |
|-----------|------|-------------|
| `config` | `ClientConfig` | Configuration with API key |

```javascript
import { Odyssey } from '@odysseyml/odyssey';

const client = new Odyssey({ apiKey: 'ody_your_api_key_here' });
```

---

## Methods

### connect()

Connect to a streaming session. The Odyssey API automatically assigns an available session.

```typescript
async connect(handlers?: OdysseyEventHandlers): Promise<MediaStream>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `handlers` | `OdysseyEventHandlers` | Optional event handlers for callback style |

**Returns:** `Promise<MediaStream>` - Resolves with the MediaStream when the connection is fully ready (including data channel). You can call `startStream()` immediately after this resolves.

#### Await Style

```javascript
const mediaStream = await client.connect();
videoElement.srcObject = mediaStream;

// Connection is fully ready - no delay needed!
await client.startStream({ prompt: 'A cat' });
await client.interact({ prompt: 'Pet the cat' });
```

#### Callback Style

```javascript
await client.connect({
  onConnected: (mediaStream) => {
    videoElement.srcObject = mediaStream;
  },
  onDisconnected: () => {
    console.log('Disconnected');
  },
  onStreamStarted: (streamId) => {
    console.log('Stream started:', streamId);
  },
  onError: (error, fatal) => {
    console.error('Error:', error.message, 'Fatal:', fatal);
  },
});
```

#### When to Use Each Style

| Style | Best for |
|-------|----------|
| **Await** | Sequential operations, simpler code flow, when you control the timing |
| **Callback** | UI-driven interactions, reactive patterns, when you need to respond to events |

---

### disconnect()

Disconnect from the session and clean up resources.

```typescript
disconnect(): void
```

```javascript
client.disconnect();
```

---

### startStream()

Start an interactive stream session.

```typescript
startStream(options?: StartStreamOptions): Promise<string>
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prompt` | `string` | `''` | Initial prompt to generate video content |
| `portrait` | `boolean` | `true` | `true` for portrait (704x1280), `false` for landscape (1280x704) |
| `image` | `File \| Blob` | — | Optional image for image-to-video generation |

**Returns:** `Promise<string>` - Resolves with the stream ID when the stream is ready.

```javascript
const streamId = await client.startStream({ 
  prompt: 'A cat', 
  portrait: true 
});
console.log('Stream started:', streamId);
```

#### Image-to-Video

```javascript
const mediaStream = await client.connect();
const imageFile = fileInput.files[0];

const streamId = await client.startStream({
  prompt: 'A cat',
  portrait: false,
  image: imageFile
});
```

**Image-to-video requirements:**
- SDK version 1.0.0+
- Max size: 25MB
- Supported formats: JPEG, PNG, WebP, GIF, BMP, HEIC, HEIF, AVIF
- Images are resized to 1280x704 (landscape) or 704x1280 (portrait)

---

### interact()

Send an interaction prompt to update the video content.

```typescript
interact(options: InteractOptions): Promise<string>
```

| Option | Type | Description |
|--------|------|-------------|
| `prompt` | `string` | The interaction prompt |

**Returns:** `Promise<string>` - Resolves with the acknowledged prompt when processed.

```javascript
const ackPrompt = await client.interact({ prompt: 'Pet the cat' });
console.log('Interaction acknowledged:', ackPrompt);
```

---

### endStream()

End the current interactive stream session.

```typescript
endStream(): Promise<void>
```

```javascript
await client.endStream();
```

---

### attachToVideo()

Attach the media stream to a video element.

```typescript
attachToVideo(videoElement: HTMLVideoElement | null): HTMLVideoElement | null
```

```javascript
const videoEl = document.querySelector('video');
client.attachToVideo(videoEl);
```

---

### getRecording()

Get recording URLs for a completed stream. *(Added in v1.0.0)*

```typescript
getRecording(streamId: string): Promise<Recording>
```

```javascript
const recording = await client.getRecording('abc-123-def');
console.log('Video URL:', recording.video_url);
console.log('Duration:', recording.duration_seconds, 'seconds');
```

---

### listStreamRecordings()

List the user's stream recordings. *(Added in v1.0.0)*

```typescript
listStreamRecordings(options?: ListStreamRecordingsOptions): Promise<StreamRecordingsListResponse>
```

```javascript
// Get recent recordings
const { recordings, total } = await client.listStreamRecordings({ limit: 20 });

// Paginate
const page2 = await client.listStreamRecordings({ limit: 20, offset: 20 });
```

---

## Simulate API Methods

> Simulate API methods were added in v1.0.0

### simulate()

Create a new simulation job.

```typescript
simulate(options: SimulateOptions): Promise<SimulationJob>
```

```javascript
const job = await client.simulate({
  script: [
    { timestamp_ms: 0, start: { prompt: 'A cat sitting on a windowsill' } },
    { timestamp_ms: 3000, interact: { prompt: 'The cat stretches' } },
    { timestamp_ms: 6000, interact: { prompt: 'The cat yawns' } },
    { timestamp_ms: 9000, end: {} }
  ],
  portrait: true
});
console.log('Simulation started:', job.job_id);
```

### getSimulateStatus()

Get the current status of a simulation job.

```typescript
getSimulateStatus(simulationId: string): Promise<SimulationJobDetail>
```

```javascript
const status = await client.getSimulateStatus(job.job_id);
console.log('Status:', status.status);

if (status.status === 'completed') {
  for (const stream of status.streams) {
    console.log('Stream:', stream.stream_id);
  }
}
```

### listSimulations()

List simulation jobs for the authenticated user.

```typescript
listSimulations(options?: ListSimulationsOptions): Promise<SimulationJobsList>
```

```javascript
const { jobs, total } = await client.listSimulations({ limit: 10 });
for (const sim of jobs) {
  console.log(`${sim.job_id}: ${sim.status}`);
}
```

### cancelSimulation()

Cancel a pending or running simulation job.

```typescript
cancelSimulation(simulationId: string): Promise<void>
```

```javascript
await client.cancelSimulation(job.job_id);
console.log('Simulation cancelled');
```

> **Note:** Simulation methods can be called without an active connection. They only require a valid API key.

---

## Properties

### isConnected

```typescript
get isConnected(): boolean
```

Whether the client is currently connected and ready.

### currentStatus

```typescript
get currentStatus(): ConnectionStatus
```

**Possible values:** `'authenticating'` | `'connecting'` | `'reconnecting'` | `'connected'` | `'disconnected'` | `'failed'`

### currentSessionId

```typescript
get currentSessionId(): string | null
```

Current session ID, or `null` if not connected.

### mediaStream

```typescript
get mediaStream(): MediaStream | null
```

Current media stream containing video track from the streamer.

### connectionState

```typescript
get connectionState(): RTCPeerConnectionState | null
```

**Possible values:** `'new'` | `'connecting'` | `'connected'` | `'disconnected'` | `'failed'` | `'closed'` | `null`

### iceConnectionState

```typescript
get iceConnectionState(): RTCIceConnectionState | null
```

**Possible values:** `'new'` | `'checking'` | `'connected'` | `'completed'` | `'failed'` | `'disconnected'` | `'closed'` | `null`
