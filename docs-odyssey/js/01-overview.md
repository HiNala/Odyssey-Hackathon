# JavaScript SDK Overview

> Complete API reference for the Odyssey JavaScript client library.

The `@odysseyml/odyssey` package provides a TypeScript/JavaScript client for interacting with Odyssey's audio-visual intelligence.

## Requirements

| Feature | Minimum Version |
|---------|-----------------|
| Core SDK | `^1.0.0` |
| Recordings | `^1.0.0` |
| Simulate API | `^1.0.0` |

## Installation

```bash
# npm
npm install @odysseyml/odyssey

# yarn
yarn add @odysseyml/odyssey

# pnpm
pnpm add @odysseyml/odyssey
```

## API Summary

### Methods

| Signature | Description |
|-----------|-------------|
| `connect(handlers?): Promise<MediaStream>` | Connect to a streaming session (returns MediaStream when ready) |
| `disconnect(): void` | Disconnect and clean up resources |
| `startStream(options?): Promise<string>` | Start an interactive stream |
| `interact(options): Promise<string>` | Send a prompt to update the video |
| `endStream(): Promise<void>` | End the current stream session |
| `attachToVideo(element): HTMLVideoElement` | Attach stream to a video element |
| `getRecording(streamId): Promise<Recording>` | Get recording URLs for a stream |
| `listStreamRecordings(options?): Promise<StreamRecordingsListResponse>` | List user's stream recordings |
| `simulate(options): Promise<SimulationJob>` | Create an async simulation job |
| `getSimulateStatus(id): Promise<SimulationJobDetail>` | Get simulation job status |
| `listSimulations(options?): Promise<SimulationJobsList>` | List simulation jobs |
| `cancelSimulation(id): Promise<void>` | Cancel a simulation job |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `isConnected` | `boolean` | Whether connected and ready |
| `currentStatus` | `ConnectionStatus` | Current connection status |
| `currentSessionId` | `string \| null` | Current session ID |
| `mediaStream` | `MediaStream \| null` | Video stream from streamer |
| `connectionState` | `RTCPeerConnectionState \| null` | WebRTC connection state |

### Event Handlers

| Handler | Parameters | Description |
|---------|------------|-------------|
| `onConnected` | `mediaStream: MediaStream` | Video stream established |
| `onDisconnected` | - | Video stream closed |
| `onStreamStarted` | `streamId: string` | Interactive stream ready (streamId can be used for recordings) |
| `onStreamEnded` | - | Interactive stream ended |
| `onInteractAcknowledged` | `prompt: string` | Interaction processed |
| `onStreamError` | `reason, message` | Stream error occurred |
| `onError` | `error: Error, fatal: boolean` | General error |
| `onStatusChange` | `status, message?` | Connection status changed |

## Browser Compatibility

| Browser | Minimum Version |
|---------|-----------------|
| Chrome/Edge | 90+ |
| Firefox | 88+ |
| Safari | 14.1+ |

Requires WebRTC support (`RTCPeerConnection`, `RTCDataChannel`)
