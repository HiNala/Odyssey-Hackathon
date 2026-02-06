# Types & Dataclasses

> Python types and dataclasses for the Odyssey client.

## Video Types

### VideoFrame

Video frame data received from the stream.

```python
@dataclass(frozen=True, slots=True)
class VideoFrame:
    data: np.ndarray      # RGB uint8 array, shape (height, width, 3)
    width: int            # Frame width in pixels
    height: int           # Frame height in pixels
    timestamp_ms: int     # Presentation timestamp in milliseconds
```

| Property | Type | Description |
|----------|------|-------------|
| `data` | `np.ndarray` | RGB uint8 array with shape `(height, width, 3)` |
| `width` | `int` | Frame width in pixels |
| `height` | `int` | Frame height in pixels |
| `timestamp_ms` | `int` | Presentation timestamp in milliseconds |

**Example usage:**

```python
import cv2
from PIL import Image

def on_frame(frame: VideoFrame) -> None:
    # OpenCV (note: OpenCV uses BGR)
    cv2.imshow("video", cv2.cvtColor(frame.data, cv2.COLOR_RGB2BGR))
    
    # PIL
    image = Image.fromarray(frame.data)
    
    # Headless processing
    processed = some_ml_model(frame.data)
```

## Recording Types

### Recording

Recording data with presigned URLs for a stream.

```python
@dataclass(frozen=True, slots=True)
class Recording:
    stream_id: str               # Unique stream identifier
    video_url: str | None        # Presigned URL for video file
    events_url: str | None       # Presigned URL for events JSON
    thumbnail_url: str | None    # Presigned URL for thumbnail image
    preview_url: str | None      # Presigned URL for preview video
    frame_count: int | None      # Total number of frames
    duration_seconds: float | None  # Duration in seconds
```

> **Note:** URLs are valid for a limited time (typically 1 hour).

### StreamRecordingInfo

Summary info for a stream recording in a list.

```python
@dataclass(frozen=True, slots=True)
class StreamRecordingInfo:
    stream_id: str             # Unique stream identifier
    width: int                 # Video width in pixels
    height: int                # Video height in pixels
    started_at: str            # ISO 8601 timestamp
    ended_at: str | None       # ISO 8601 timestamp or None if active
    duration_seconds: float | None  # Duration in seconds
```

### StreamRecordingsList

Paginated list of stream recordings.

```python
@dataclass(frozen=True, slots=True)
class StreamRecordingsList:
    recordings: list[StreamRecordingInfo]  # List of recording info
    total: int                             # Total recordings available
    limit: int                             # Max per request
    offset: int                            # Recordings skipped
```

## Simulate API Types

> Simulate API types were added in v1.0.0

### ScriptEntry

An entry in a simulation script.

```python
from typing import TypedDict, NotRequired

class StartAction(TypedDict):
    prompt: str
    image: NotRequired[str | bytes]  # Optional image for image-to-video

class InteractAction(TypedDict):
    prompt: str

class ScriptEntry(TypedDict):
    timestamp_ms: int  # When this action occurs (milliseconds from start)
    start: NotRequired[StartAction]  # Begin a new stream
    interact: NotRequired[InteractAction]  # Send an interaction
    end: NotRequired[dict]  # End the stream (empty dict)
```

### SimulationStream

Information about a stream within a simulation.

```python
@dataclass(frozen=True, slots=True)
class SimulationStream:
    stream_id: str           # Unique stream identifier
    status: str              # Stream status (pending, running, completed, failed)
    error_message: str | None  # Error message if failed
```

### SimulationJobInfo

Summary information for a simulation job in a list.

```python
@dataclass(frozen=True, slots=True)
class SimulationJobInfo:
    job_id: str              # Unique identifier for the job
    status: str              # Current job status
    priority: str            # Job priority
    created_at: str          # ISO timestamp when job was created
    completed_at: str | None # ISO timestamp when job completed
    error_message: str | None  # Error message if job failed
```

| Property | Type | Description |
|----------|------|-------------|
| `job_id` | `str` | Unique identifier for the job |
| `status` | `str` | Current job status (`pending`, `running`, `completed`, `failed`, `cancelled`) |
| `priority` | `str` | Job priority |
| `created_at` | `str` | ISO timestamp when job was created |
| `completed_at` | `str \| None` | ISO timestamp when job completed |
| `error_message` | `str \| None` | Error message if job failed |

### SimulationJobDetail

Detailed information about a simulation job.

```python
@dataclass(frozen=True, slots=True)
class SimulationJobDetail:
    job_id: str                       # Unique identifier for the job
    status: str                       # Current job status
    priority: str                     # Job priority
    created_at: str                   # ISO timestamp when job was created
    started_at: str | None            # ISO timestamp when job started running
    completed_at: str | None          # ISO timestamp when job completed
    error_message: str | None         # Error message if job failed
    streams: list[SimulationStream]   # Streams created during simulation
```

### SimulationJobsList

Paginated list of simulation jobs.

```python
@dataclass(frozen=True, slots=True)
class SimulationJobsList:
    jobs: list[SimulationJobInfo]  # List of simulation job summaries
    total: int                     # Total jobs available
    limit: int                     # Limit used in request
    offset: int                    # Offset used in request
```

## Status Types

### ConnectionStatus

```python
class ConnectionStatus(str, Enum):
    AUTHENTICATING = "authenticating"  # Authenticating with Odyssey API
    CONNECTING = "connecting"          # Connecting to signaling server
    RECONNECTING = "reconnecting"      # Reconnecting after disconnect
    CONNECTED = "connected"            # Connected and ready
    DISCONNECTED = "disconnected"      # Disconnected (clean)
    FAILED = "failed"                  # Connection failed (fatal)
```

## Configuration Types

### ClientConfig

```python
@dataclass
class ClientConfig:
    api_key: str                      # API key for authentication (required)
    api_url: str = "https://api.odyssey.ml"  # API URL
    dev: DevConfig = DevConfig()      # Development settings
    advanced: AdvancedConfig = AdvancedConfig()  # Advanced settings
```

### DevConfig

Development/debug settings.

```python
@dataclass
class DevConfig:
    signaling_url: str | None = None  # Direct signaling URL (bypasses API)
    session_id: str | None = None     # Session ID for direct connection
    debug: bool = False               # Enable debug logging
```

### AdvancedConfig

Advanced connection settings.

```python
@dataclass
class AdvancedConfig:
    max_retries: int = 5              # Max retry attempts
    initial_retry_delay_ms: int = 1000  # Initial retry delay
    max_retry_delay_ms: int = 2000    # Max retry delay
    retry_backoff_multiplier: float = 2.0  # Backoff multiplier
    queue_timeout_s: int = 30         # Queue timeout in seconds
```

## Exceptions

### OdysseyError

Base exception for all Odyssey errors.

```python
class OdysseyError(Exception):
    pass
```

### OdysseyAuthError

Raised when authentication fails.

```python
class OdysseyAuthError(OdysseyError):
    pass
```

### OdysseyConnectionError

Raised when connection fails.

```python
class OdysseyConnectionError(OdysseyError):
    pass
```

### OdysseyStreamError

Raised when a stream operation fails.

```python
class OdysseyStreamError(OdysseyError):
    pass
```

## Error Handling

### Fatal vs Non-Fatal Errors

The `on_error` handler receives a `fatal` boolean parameter:

| Fatal | Description | Action Required |
|-------|-------------|-----------------|
| `True` | Connection cannot continue | Reconnect or exit |
| `False` | Recoverable error | May retry or notify user |

### Common Errors

| Error | Description |
|-------|-------------|
| `OdysseyAuthError` | API key is invalid or expired |
| `OdysseyConnectionError: No streamers available` | No streamers available, try again later |
| `OdysseyConnectionError: Timed out waiting for a streamer` | Queue timeout expired |
| `OdysseyStreamError: Cannot start stream: client is disconnected` | Attempted operation while disconnected |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ODYSSEY_API_URL` | Override default API URL |
| `ODYSSEY_API_KEY` | Default API key (used by examples) |
