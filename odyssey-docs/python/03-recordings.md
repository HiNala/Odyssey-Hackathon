# Recordings

> Working with stream recordings in the Odyssey Python client.

After a stream session ends, you can retrieve recording artifacts including the full video, events log, thumbnail, and preview.

## Capturing the Stream ID

The stream ID is provided in the `on_stream_started` callback or returned from `start_stream()`. Save this ID to retrieve recordings later:

```python
import asyncio
from odyssey import Odyssey

client = Odyssey(api_key="ody_your_api_key_here")

current_stream_id = None

def on_stream_started(stream_id: str) -> None:
    global current_stream_id
    current_stream_id = stream_id
    print(f"Stream started: {stream_id}")

async def main():
    await client.connect(
        on_video_frame=lambda frame: None,
        on_stream_started=on_stream_started,
    )
    
    # Or capture from return value
    stream_id = await client.start_stream("A cat")
    
    # ... interact with the stream ...
    await client.end_stream()
    await client.disconnect()

asyncio.run(main())
```

## Retrieving a Recording

Use `get_recording()` with the stream ID to get presigned URLs for the recording artifacts:

```python
recording = await client.get_recording(current_stream_id)

if recording.video_url:
    print(f"Video URL: {recording.video_url}")
    print(f"Duration: {recording.duration_seconds}s")
    print(f"Frames: {recording.frame_count}")

if recording.events_url:
    # Download and parse the events log (JSONL format)
    import httpx
    import json
    
    async with httpx.AsyncClient() as http:
        response = await http.get(recording.events_url)
        events = [json.loads(line) for line in response.text.strip().split('\n')]
        print(f"Session events: {events}")
```

> **Note:** `get_recording()` can be called without an active connection. It only requires a valid API key.

### Recording Properties

| Property | Type | Description |
|----------|------|-------------|
| `stream_id` | `str` | The stream ID |
| `video_url` | `str \| None` | Presigned URL for full recording (MP4) |
| `events_url` | `str \| None` | Presigned URL for events log (JSONL) |
| `thumbnail_url` | `str \| None` | Presigned URL for thumbnail (JPEG) |
| `preview_url` | `str \| None` | Presigned URL for preview video (MP4) |
| `frame_count` | `int \| None` | Total frames in recording |
| `duration_seconds` | `float \| None` | Recording duration in seconds |

## Listing All Recordings

Use `list_stream_recordings()` to get a paginated list of all your recordings:

```python
# Get recent recordings
result = await client.list_stream_recordings(limit=10)

print(f"Found {result.total} recordings")

for rec in result.recordings:
    print(f"Stream {rec.stream_id}: {rec.duration_seconds}s at {rec.width}x{rec.height}")

# Paginate through results
page2 = await client.list_stream_recordings(limit=10, offset=10)
```

### Pagination Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `limit` | `int \| None` | `None` | Maximum recordings to return |
| `offset` | `int \| None` | `None` | Number of recordings to skip |

## Complete Workflow Example

```python
import asyncio
from odyssey import Odyssey, OdysseyConnectionError

async def main():
    client = Odyssey(api_key="ody_your_api_key_here")
    
    try:
        await client.connect(
            on_video_frame=lambda frame: print(f"Frame: {frame.width}x{frame.height}"),
        )
        
        # Start an interactive stream and capture the stream ID
        stream_id = await client.start_stream(
            "A cat sitting on a windowsill",
            portrait=True
        )
        print(f"Stream started: {stream_id}")
        
        # Send some interactions
        await client.interact("The cat stretches and yawns")
        await client.interact("The cat looks outside at birds")
        
        # Let it run for a bit
        await asyncio.sleep(5)
        
        # End the stream
        await client.end_stream()
        
    except OdysseyConnectionError as e:
        print(f"Connection failed: {e}")
    finally:
        await client.disconnect()
    
    # Retrieve the recording (can be done after disconnect)
    recording = await client.get_recording(stream_id)
    
    if recording.video_url:
        print(f"Recording available at: {recording.video_url}")
        print(f"Duration: {recording.duration_seconds} seconds")

asyncio.run(main())
```

## Downloading Recordings

Example of downloading recording files:

```python
import httpx
from pathlib import Path

async def download_recording(client: Odyssey, stream_id: str, output_dir: Path):
    recording = await client.get_recording(stream_id)
    
    async with httpx.AsyncClient() as http:
        if recording.video_url:
            response = await http.get(recording.video_url)
            (output_dir / f"{stream_id}.mp4").write_bytes(response.content)
            print(f"Downloaded video: {stream_id}.mp4")
        
        if recording.thumbnail_url:
            response = await http.get(recording.thumbnail_url)
            (output_dir / f"{stream_id}_thumb.jpg").write_bytes(response.content)
            print(f"Downloaded thumbnail: {stream_id}_thumb.jpg")
```
