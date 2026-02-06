# Python SDK Overview

> Complete API reference for the Odyssey Python client library.

The `odyssey` package provides an async Python client for interacting with Odyssey's audio-visual intelligence.

## Requirements

- **Python 3.12+**

| Feature | Minimum Version |
|---------|-----------------|
| Core SDK | `^1.0.0` |
| Recordings | `^1.0.0` |
| Simulate API | `^1.0.0` |

## Installation

```bash
# pip
pip install git+https://github.com/odysseyml/odyssey-python.git

# uv
uv pip install git+https://github.com/odysseyml/odyssey-python.git
```

## API Summary

### Methods

| Signature | Description |
|-----------|-------------|
| `connect(**handlers) -> None` | Connect to a streaming session (raises on failure) |
| `disconnect() -> None` | Disconnect and clean up resources |
| `start_stream(prompt, portrait?, image?) -> str` | Start an interactive stream |
| `interact(prompt) -> str` | Send a prompt to update the video |
| `end_stream() -> None` | End the current stream session |
| `get_recording(stream_id) -> Recording` | Get recording URLs for a stream |
| `list_stream_recordings(limit?, offset?) -> StreamRecordingsList` | List user's stream recordings |
| `simulate(script) -> SimulationJobInfo` | Create an async simulation job *(v1.0.0+)* |
| `get_simulate_status(id) -> SimulationJobDetail` | Get simulation job status *(v1.0.0+)* |
| `list_simulations(limit?, offset?) -> SimulationJobsList` | List simulation jobs *(v1.0.0+)* |
| `cancel_simulation(id) -> None` | Cancel a simulation job *(v1.0.0+)* |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `is_connected` | `bool` | Whether connected and ready |
| `current_status` | `ConnectionStatus` | Current connection status |
| `current_session_id` | `str \| None` | Current session ID |

### Event Handlers

| Handler | Parameters | Description |
|---------|------------|-------------|
| `on_connected` | - | WebRTC connection established |
| `on_disconnected` | - | Connection closed |
| `on_video_frame` | `frame: VideoFrame` | Video frame received |
| `on_stream_started` | `stream_id: str` | Interactive stream ready |
| `on_stream_ended` | - | Interactive stream ended |
| `on_interact_acknowledged` | `prompt: str` | Interaction processed |
| `on_stream_error` | `reason, message` | Stream error occurred |
| `on_error` | `error: Exception, fatal: bool` | General error |
| `on_status_change` | `status, message?` | Connection status changed |

### Exceptions

| Exception | Description |
|-----------|-------------|
| `OdysseyError` | Base exception for all Odyssey errors |
| `OdysseyAuthError` | Authentication failed (invalid API key) |
| `OdysseyConnectionError` | Connection failed (no streamers, timeout) |
| `OdysseyStreamError` | Stream operation failed |

## Quick Start

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
