# Odyssey Client

> Main client class for interacting with Odyssey's audio-visual intelligence.

## Constructor

```python
Odyssey(api_key: str, **kwargs)
```

Creates a new Odyssey client instance with the provided API key.

| Parameter | Type | Description |
|-----------|------|-------------|
| `api_key` | `str` | API key for authentication (required) |
| `**kwargs` | | Additional configuration options |

```python
from odyssey import Odyssey

client = Odyssey(api_key="ody_your_api_key_here")
```

---

## Methods

### connect()

Connect to a streaming session. The Odyssey API automatically assigns an available session.

```python
async def connect(
    on_connected: Callable[[], None] | None = None,
    on_disconnected: Callable[[], None] | None = None,
    on_video_frame: Callable[[VideoFrame], None] | None = None,
    on_stream_started: Callable[[str], None] | None = None,
    on_stream_ended: Callable[[], None] | None = None,
    on_interact_acknowledged: Callable[[str], None] | None = None,
    on_stream_error: Callable[[str, str], None] | None = None,
    on_error: Callable[[Exception, bool], None] | None = None,
    on_status_change: Callable[[ConnectionStatus, str | None], None] | None = None,
) -> None
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `on_connected` | `Callable[[], None]` | Called when connection is established |
| `on_disconnected` | `Callable[[], None]` | Called when connection is closed |
| `on_video_frame` | `Callable[[VideoFrame], None]` | Called for each video frame |
| `on_stream_started` | `Callable[[str], None]` | Called when stream starts (receives stream_id) |
| `on_stream_ended` | `Callable[[], None]` | Called when stream ends |
| `on_interact_acknowledged` | `Callable[[str], None]` | Called when interaction is acknowledged |
| `on_stream_error` | `Callable[[str, str], None]` | Called on stream error (reason, message) |
| `on_error` | `Callable[[Exception, bool], None]` | Called on error (error, fatal) |
| `on_status_change` | `Callable[[ConnectionStatus, str \| None], None]` | Called on status change |

**Raises:**

| Exception | Description |
|-----------|-------------|
| `OdysseyAuthError` | Authentication failed (invalid API key) |
| `OdysseyConnectionError` | Connection failed (no streamers, timeout, etc.) |

```python
try:
    await client.connect(
        on_video_frame=lambda frame: process_frame(frame),
        on_stream_error=lambda reason, msg: print(f"Stream error: {reason} - {msg}"),
        on_status_change=lambda status, msg: print(f"Status: {status.value}"),
    )
except OdysseyAuthError:
    print("Invalid API key")
except OdysseyConnectionError as e:
    print(f"Connection failed: {e}")
```

---

### disconnect()

Disconnect from the session and clean up resources.

```python
async def disconnect() -> None
```

```python
await client.disconnect()
```

---

### start_stream()

Start an interactive stream session.

```python
async def start_stream(
    prompt: str = "",
    portrait: bool = True,
    image: str | bytes | Image.Image | np.ndarray | None = None,
    image_path: str | None = None  # deprecated
) -> str
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `prompt` | `str` | `""` | Initial prompt to generate video content |
| `portrait` | `bool` | `True` | Portrait (704x1280) or landscape (1280x704) |
| `image` | `str \| bytes \| Image.Image \| np.ndarray \| None` | `None` | Image for image-to-video |
| `image_path` | `str \| None` | `None` | **Deprecated.** Use `image` instead |

**Supported image formats for the `image` parameter:**

| Type | Description |
|------|-------------|
| `str` | File path to an image |
| `bytes` | Raw image bytes |
| `PIL.Image.Image` | PIL Image object |
| `np.ndarray` | NumPy array (RGB uint8, shape HxWx3) |

**Returns:** `str` - Stream ID when the stream is ready.

**Raises:** `OdysseyStreamError` - If not connected or stream fails to start.

```python
try:
    stream_id = await client.start_stream("A cat", portrait=True)
    print(f"Stream started: {stream_id}")
except OdysseyStreamError as e:
    print(f"Failed to start stream: {e}")
```

#### Image-to-Video Examples

```python
await client.connect(on_video_frame=process_frame)

# Using a file path
stream_id = await client.start_stream(
    prompt="A cat",
    portrait=False,
    image="/path/to/image.jpg"
)

# Using PIL Image
from PIL import Image
pil_image = Image.open("/path/to/image.jpg")
stream_id = await client.start_stream(prompt="A cat", image=pil_image)

# Using bytes
with open("/path/to/image.jpg", "rb") as f:
    image_bytes = f.read()
stream_id = await client.start_stream(prompt="A cat", image=image_bytes)
```

**Image-to-video requirements:**
- SDK version 1.0.0+
- Max size: 25MB
- Supported formats: JPEG, PNG, WebP, GIF, BMP, HEIC, HEIF, AVIF
- Images are resized to 1280x704 (landscape) or 704x1280 (portrait)

---

### interact()

Send an interaction prompt to update the video content.

```python
async def interact(prompt: str) -> str
```

**Returns:** `str` - The acknowledged prompt when processed.

**Raises:** `OdysseyStreamError` - If not connected or no active stream.

```python
try:
    ack_prompt = await client.interact("Pet the cat")
    print(f"Interaction acknowledged: {ack_prompt}")
except OdysseyStreamError as e:
    print(f"Failed to interact: {e}")
```

---

### end_stream()

End the current interactive stream session.

```python
async def end_stream() -> None
```

**Raises:** `OdysseyStreamError` - If not connected.

```python
await client.end_stream()
```

---

### get_recording()

Get recording data for a stream with presigned URLs.

```python
async def get_recording(stream_id: str) -> Recording
```

> **Note:** This method can be called without an active connection.

```python
recording = await client.get_recording("stream-123")
if recording.video_url:
    print(f"Video: {recording.video_url}")
    print(f"Duration: {recording.duration_seconds}s")
```

---

### list_stream_recordings()

List stream recordings for the authenticated user.

```python
async def list_stream_recordings(
    limit: int | None = None,
    offset: int | None = None
) -> StreamRecordingsList
```

> **Note:** This method can be called without an active connection.

```python
result = await client.list_stream_recordings(limit=10)
for rec in result.recordings:
    print(f"{rec.stream_id}: {rec.duration_seconds}s ({rec.width}x{rec.height})")
print(f"Total: {result.total}")
```

---

## Simulate API Methods

> Simulate API methods were added in v1.0.0

### simulate()

Create a new simulation job.

```python
async def simulate(
    script: list[dict],
    portrait: bool = True
) -> SimulationJobInfo
```

**Script entry format:**

| Key | Type | Description |
|-----|------|-------------|
| `timestamp_ms` | `int` | When this action occurs (milliseconds from start) |
| `start` | `dict` | `{ "prompt": str, "image"?: str | bytes }` - Begin a new stream |
| `interact` | `dict` | `{ "prompt": str }` - Send an interaction prompt |
| `end` | `dict` | `{}` - End the current stream (empty dict) |

```python
job = await client.simulate(
    script=[
        {"timestamp_ms": 0, "start": {"prompt": "A cat sitting on a windowsill"}},
        {"timestamp_ms": 3000, "interact": {"prompt": "The cat stretches"}},
        {"timestamp_ms": 6000, "interact": {"prompt": "The cat yawns"}},
        {"timestamp_ms": 9000, "end": {}}
    ],
    portrait=True
)
print(f"Simulation started: {job.job_id}")
```

### get_simulate_status()

Get the current status of a simulation job.

```python
async def get_simulate_status(job_id: str) -> SimulationJobDetail
```

```python
status = await client.get_simulate_status(job.job_id)
print(f"Status: {status.status}")

if status.status == "completed":
    for stream in status.streams:
        print(f"Stream: {stream.stream_id}")
```

### list_simulations()

List simulation jobs for the authenticated user.

```python
async def list_simulations(
    limit: int | None = None,
    offset: int | None = None
) -> SimulationJobsList
```

```python
result = await client.list_simulations(limit=10)
for sim in result.jobs:
    print(f"{sim.job_id}: {sim.status}")
print(f"Total: {result.total}")
```

### cancel_simulation()

Cancel a pending or running simulation job.

```python
async def cancel_simulation(job_id: str) -> None
```

```python
await client.cancel_simulation(job.job_id)
print("Simulation cancelled")
```

> **Note:** Simulation methods can be called without an active connection.

---

## Properties

### is_connected

```python
@property
def is_connected(self) -> bool
```

Whether the client is currently connected and ready.

### current_status

```python
@property
def current_status(self) -> ConnectionStatus
```

**Possible values:** `AUTHENTICATING`, `CONNECTING`, `RECONNECTING`, `CONNECTED`, `DISCONNECTED`, `FAILED`

### current_session_id

```python
@property
def current_session_id(self) -> str | None
```

Current session ID, or `None` if not connected.
