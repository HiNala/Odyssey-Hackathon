# Simulate API

> Run scripted video generation asynchronously with the Simulate API.

The Simulate API requires SDK version 1.0.0 or higher.

The Simulate API allows you to run scripted interactions asynchronously. Unlike the Interactive API where you connect and interact in real-time, simulations execute in the background and produce recordings you can retrieve when complete.

## When to Use the Simulate API

| Use Case | Recommended Approach |
|----------|---------------------|
| Real-time interaction | Interactive API (`connect()` + `startStream()`) |
| Batch video generation | Simulate API |
| Pre-scripted sequences | Simulate API |
| Background processing | Simulate API |
| User-driven interactions | Interactive API |

## Script Format

A simulation script is an array of entries that define the sequence of actions using timestamps:

```typescript
interface ScriptEntry {
  timestamp_ms: number;      // When this action occurs (milliseconds from start)
  start?: {                  // Begin a new stream
    prompt: string;
    image?: File | Blob | string;  // Optional image for image-to-video
  };
  interact?: {               // Send an interaction
    prompt: string;
  };
  end?: Record<string, never>;  // End the stream (empty object)
}
```

### Entry Types

| Action | Fields | Description |
|--------|--------|-------------|
| `start` | `{ prompt, image? }` | Begin a new stream with initial prompt |
| `interact` | `{ prompt }` | Send an interaction prompt |
| `end` | `{}` | End the current stream |

### Example Script

```javascript
const script = [
  // Start a portrait video of a cat at t=0
  { timestamp_ms: 0, start: { prompt: 'A cat sitting by a window' } },
  
  // Interact at t=3000ms (3 seconds)
  { timestamp_ms: 3000, interact: { prompt: 'The cat looks outside' } },
  
  // Another interaction at t=6000ms (6 seconds)
  { timestamp_ms: 6000, interact: { prompt: 'The cat stretches' } },
  
  // End the stream at t=9000ms (9 seconds)
  { timestamp_ms: 9000, end: {} }
];
```

## Basic Workflow

### 1. Create a Simulation

```javascript
import { Odyssey } from '@odysseyml/odyssey';

const client = new Odyssey({ apiKey: 'ody_your_api_key_here' });

const job = await client.simulate({
  script: [
    { timestamp_ms: 0, start: { prompt: 'A serene mountain landscape' } },
    { timestamp_ms: 5000, interact: { prompt: 'Clouds roll across the sky' } },
    { timestamp_ms: 10000, interact: { prompt: 'The sun begins to set' } },
    { timestamp_ms: 15000, end: {} }
  ],
  portrait: false
});

console.log('Simulation ID:', job.job_id);
console.log('Status:', job.status);  // 'pending'
```

### 2. Poll for Completion

```javascript
async function waitForCompletion(client, jobId) {
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
    
    // Wait 5 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

const result = await waitForCompletion(client, job.job_id);
console.log('Simulation completed!');
```

### 3. Retrieve Recordings

```javascript
// Get the stream IDs from the completed simulation
for (const stream of result.streams) {
  const recording = await client.getRecording(stream.stream_id);
  console.log('Video URL:', recording.video_url);
  console.log('Duration:', recording.duration_seconds, 'seconds');
}
```

## Image-to-Video with the Simulate API

You can start a simulation with an image:

```javascript
const imageFile = document.querySelector('input[type="file"]').files[0];

const job = await client.simulate({
  script: [
    { timestamp_ms: 0, start: { prompt: 'A cat', image: imageFile } },
    { timestamp_ms: 3000, interact: { prompt: 'The cat looks around' } },
    { timestamp_ms: 6000, end: {} }
  ],
  portrait: false
});
```

You can also use a base64 data URL string:

```javascript
const job = await client.simulate({
  script: [
    { timestamp_ms: 0, start: { prompt: 'Robot dancing', image: 'data:image/png;base64,iVBORw0KGgo...' } },
    { timestamp_ms: 10000, end: {} }
  ]
});
```

## Managing Simulation Jobs

### List Your Simulation Jobs

```javascript
const { jobs, total } = await client.listSimulations({ limit: 10 });

for (const sim of jobs) {
  console.log(`${sim.job_id}: ${sim.status} (created: ${sim.created_at})`);
}

console.log(`Showing ${jobs.length} of ${total} total simulations`);
```

### Cancel a Simulation

```javascript
// Cancel a pending or running simulation
await client.cancelSimulation(job.job_id);
console.log('Simulation cancelled');
```

## Complete Example

```javascript
import { Odyssey } from '@odysseyml/odyssey';

async function runSimulation() {
  const client = new Odyssey({ apiKey: 'ody_your_api_key_here' });
  
  // Create simulation
  const job = await client.simulate({
    script: [
      { timestamp_ms: 0, start: { prompt: 'A cat sitting on a windowsill' } },
      { timestamp_ms: 3000, interact: { prompt: 'The cat watches a bird outside' } },
      { timestamp_ms: 6000, interact: { prompt: 'The cat stretches lazily' } },
      { timestamp_ms: 9000, interact: { prompt: 'The cat curls up to sleep' } },
      { timestamp_ms: 12000, end: {} }
    ],
    portrait: true
  });
  
  console.log('Started simulation:', job.job_id);
  
  // Poll for completion
  let status;
  do {
    await new Promise(resolve => setTimeout(resolve, 5000));
    status = await client.getSimulateStatus(job.job_id);
    console.log('Status:', status.status);
  } while (status.status === 'pending' || status.status === 'running');
  
  if (status.status === 'completed') {
    // Download recordings
    for (const stream of status.streams) {
      const recording = await client.getRecording(stream.stream_id);
      console.log('Recording ready:', recording.video_url);
    }
  } else {
    console.error('Simulation failed:', status.error_message);
  }
}

runSimulation();
```

## Error Handling

```javascript
try {
  const job = await client.simulate({
    script: [
      { timestamp_ms: 0, start: { prompt: 'A sunset over the ocean' } },
      { timestamp_ms: 5000, end: {} }
    ]
  });
  
  const status = await client.getSimulateStatus(job.job_id);
  
  if (status.status === 'failed') {
    console.error('Job failed:', status.error_message);
    
    // Check individual streams for errors
    for (const stream of status.streams) {
      if (stream.status === 'failed') {
        console.error(`Stream ${stream.stream_id} failed:`, stream.error_message);
      }
    }
  }
} catch (error) {
  console.error('API error:', error.message);
}
```
