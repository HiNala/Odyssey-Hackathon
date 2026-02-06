# Types & Interfaces

> TypeScript types and interfaces for the Odyssey client.

## Event Handlers

### OdysseyEventHandlers

Event handlers for the Odyssey client class.

```typescript
interface OdysseyEventHandlers {
  onConnected?: (mediaStream: MediaStream) => void;
  onDisconnected?: () => void;
  onStreamStarted?: (streamId: string) => void;
  onStreamEnded?: () => void;
  onInteractAcknowledged?: (prompt: string) => void;
  onStreamError?: (reason: string, message: string) => void;
  onError?: (error: Error, fatal: boolean) => void;
  onStatusChange?: (status: ConnectionStatus, message?: string) => void;
}
```

| Handler | Parameters | Description |
|---------|------------|-------------|
| `onConnected` | `mediaStream: MediaStream` | Called when video stream is established |
| `onDisconnected` | - | Called when video stream is closed |
| `onStreamStarted` | `streamId: string` | Called when interactive stream is ready |
| `onStreamEnded` | - | Called when interactive stream has ended |
| `onInteractAcknowledged` | `prompt: string` | Called when interaction is processed |
| `onStreamError` | `reason: string, message: string` | Called on stream error (e.g., model crash) |
| `onError` | `error: Error, fatal: boolean` | Called on general error |
| `onStatusChange` | `status: ConnectionStatus, message?: string` | Called when connection status changes |

### UseOdysseyOptions

Configuration for the `useOdyssey` React hook.

```typescript
interface UseOdysseyOptions {
  apiKey: string;
  handlers?: OdysseyEventHandlers;
}
```

## Configuration

### ClientConfig

```typescript
interface ClientConfig {
  apiKey: string;  // API key for authentication (required)
}
```

## Status Types

### ConnectionStatus

```typescript
type ConnectionStatus =
  | 'authenticating'  // Authenticating with Odyssey API
  | 'connecting'      // Connecting to streaming server
  | 'reconnecting'    // Reconnecting after disconnect
  | 'connected'       // Connected and ready
  | 'disconnected'    // Disconnected (clean)
  | 'failed';         // Connection failed (fatal)
```

## Recording Types

> Recording types were added in v1.0.0

### Recording

```typescript
interface Recording {
  stream_id: string;
  video_url: string | null;
  events_url: string | null;
  thumbnail_url: string | null;
  preview_url: string | null;
  frame_count: number | null;
  duration_seconds: number | null;
}
```

### StreamRecordingSummary

```typescript
interface StreamRecordingSummary {
  stream_id: string;
  width: number;
  height: number;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
}
```

### ListStreamRecordingsOptions

```typescript
interface ListStreamRecordingsOptions {
  limit?: number;   // Max 100, default 50
  offset?: number;  // Default 0
}
```

### StreamRecordingsListResponse

```typescript
interface StreamRecordingsListResponse {
  recordings: StreamRecordingSummary[];
  total: number;
  limit: number;
  offset: number;
}
```

## Simulate API Types

> Simulate API types were added in v1.0.0

### SimulationJobStatus

```typescript
type SimulationJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
```

| Status | Description |
|--------|-------------|
| `pending` | Job is queued and waiting to start |
| `running` | Job is currently executing |
| `completed` | Job finished successfully |
| `failed` | Job encountered an error |
| `cancelled` | Job was cancelled by user |

### ScriptEntry

```typescript
interface ScriptEntry {
  timestamp_ms: number;
  start?: {
    prompt: string;
    image?: File | Blob | string;
  };
  interact?: {
    prompt: string;
  };
  end?: Record<string, never>;
}
```

### SimulateOptions

```typescript
interface SimulateOptions {
  script: ScriptEntry[];
  portrait?: boolean;  // true for portrait (704x1280), false for landscape (1280x704)
}
```

### SimulationStream

```typescript
interface SimulationStream {
  stream_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error_message: string | null;
}
```

### SimulationJob

Response from `simulate()`.

```typescript
interface SimulationJob {
  job_id: string;
  status: SimulationJobStatus;
  priority: string;
  created_at: string;
  estimated_wait_minutes: number | null;
}
```

### SimulationJobDetail

Detailed information from `getSimulateStatus()`.

```typescript
interface SimulationJobDetail {
  job_id: string;
  status: SimulationJobStatus;
  priority: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  streams: SimulationStream[];
}
```

### SimulationJobInfo

Summary information in a list.

```typescript
interface SimulationJobInfo {
  job_id: string;
  status: SimulationJobStatus;
  priority: string;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
}
```

### ListSimulationsOptions

```typescript
interface ListSimulationsOptions {
  limit?: number;   // Max 100, default 50
  offset?: number;  // Default 0
}
```

### SimulationJobsList

```typescript
interface SimulationJobsList {
  jobs: SimulationJobInfo[];
  total: number;
  limit: number;
  offset: number;
}
```

## Error Handling

### Fatal vs Non-Fatal Errors

The `onError` handler receives a `fatal` boolean parameter:

| Fatal | Description | Action Required |
|-------|-------------|-----------------|
| `true` | Connection cannot continue | Return user to connect page |
| `false` | Recoverable error | May retry or notify user |

### Common Error Messages

| Error | Description |
|-------|-------------|
| `Odyssey: config object is required...` | Constructor called without a config object |
| `Odyssey: apiKey is required and must be a string...` | API key is missing or not a string |
| `Odyssey: apiKey cannot be empty...` | API key is an empty string |
| `Invalid API key` | The provided API key is invalid (401) |
| `Invalid API key format...` | API key format is malformed (422) |
| `API key access denied` | Valid API key but access denied (403) |
| `Maximum concurrent sessions (N) reached` | Concurrent session quota exceeded (429) |
| `No available sessions` | No streamers available, try again later |
| `Streamer not available` | Assigned streamer is not responding |
| `Streamer disconnected` | Streamer disconnected during session |
| `Timed out waiting for a streamer` | Queue timeout expired |

## TypeScript Exports

```typescript
// Main entry point (@odysseyml/odyssey)
export { Odyssey } from './odyssey';
export type { 
  OdysseyEventHandlers, 
  ConnectionStatus, 
  ClientConfig, 
  OdysseyClient 
} from './types';

// React entry point (@odysseyml/odyssey/react)
export { useOdyssey } from './useOdyssey';
export type { UseOdysseyHandlers, OdysseyClient } from './types';
```

## Browser Compatibility

| Browser | Minimum Version |
|---------|-----------------|
| Chrome/Edge | 90+ |
| Firefox | 88+ |
| Safari | 14.1+ |

Requires WebRTC support (`RTCPeerConnection`, `RTCDataChannel`)
