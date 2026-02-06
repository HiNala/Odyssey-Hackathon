# Python Examples

> Complete usage examples for the Odyssey Python client.

## Complete Application with OpenCV

```python
import asyncio
import cv2
from odyssey import (
    Odyssey, VideoFrame, ConnectionStatus,
    OdysseyAuthError, OdysseyConnectionError, OdysseyStreamError,
)

class VideoApp:
    def __init__(self, api_key: str):
        self.client = Odyssey(api_key=api_key)
        self.current_frame = None
        self.running = True

    def on_frame(self, frame: VideoFrame) -> None:
        self.current_frame = cv2.cvtColor(frame.data, cv2.COLOR_RGB2BGR)

    def on_status(self, status: ConnectionStatus, message: str | None) -> None:
        print(f"Status: {status.value} - {message or ''}")

    def on_stream_error(self, reason: str, message: str) -> None:
        print(f"Stream error: {reason} - {message}")

    async def run(self) -> None:
        try:
            await self.client.connect(
                on_video_frame=self.on_frame,
                on_stream_error=self.on_stream_error,
                on_status_change=self.on_status,
            )
            
            await self.client.start_stream("A serene mountain landscape")
            
            while self.running:
                if self.current_frame is not None:
                    cv2.imshow("Odyssey", self.current_frame)
                
                key = cv2.waitKey(1) & 0xFF
                if key == ord("q"):
                    self.running = False
                elif key == ord("i"):
                    await self.client.interact("Add a waterfall")
                
                await asyncio.sleep(0.01)
            
            await self.client.end_stream()
        
        except OdysseyAuthError:
            print("Invalid API key")
        except OdysseyConnectionError as e:
            print(f"Connection failed: {e}")
        except OdysseyStreamError as e:
            print(f"Stream error: {e}")
        finally:
            await self.client.disconnect()
            cv2.destroyAllWindows()

async def main():
    app = VideoApp(api_key="ody_your_api_key_here")
    await app.run()

asyncio.run(main())
```

## Headless Processing

```python
import asyncio
from odyssey import Odyssey, VideoFrame, OdysseyConnectionError

frames_collected = []

def collect_frame(frame: VideoFrame) -> None:
    frames_collected.append(frame.data.copy())

async def main():
    client = Odyssey(api_key="ody_your_api_key_here")
    
    try:
        await client.connect(on_video_frame=collect_frame)
        
        await client.start_stream("A busy city street")
        
        # Collect frames for 10 seconds
        await asyncio.sleep(10)
        
        await client.end_stream()
    except OdysseyConnectionError as e:
        print(f"Connection failed: {e}")
    finally:
        await client.disconnect()
    
    print(f"Collected {len(frames_collected)} frames")
    # Process frames with your ML model...

asyncio.run(main())
```

## Status Monitoring

```python
import asyncio
from odyssey import Odyssey, ConnectionStatus

def on_status_change(status: ConnectionStatus, message: str | None) -> None:
    match status:
        case ConnectionStatus.AUTHENTICATING:
            print("Authenticating...")
        case ConnectionStatus.CONNECTING:
            print("Connecting to server...")
        case ConnectionStatus.RECONNECTING:
            print("Reconnecting...")
        case ConnectionStatus.CONNECTED:
            print("Connected and ready!")
        case ConnectionStatus.DISCONNECTED:
            print("Disconnected")
        case ConnectionStatus.FAILED:
            print(f"Connection failed: {message or 'Unknown error'}")

async def main():
    client = Odyssey(api_key="ody_your_api_key_here")
    
    await client.connect(
        on_video_frame=lambda f: None,
        on_status_change=on_status_change,
    )
    
    # ... use the client ...
    
    await client.disconnect()

asyncio.run(main())
```

## Error Handling Pattern

```python
import asyncio
from odyssey import (
    Odyssey,
    OdysseyAuthError,
    OdysseyConnectionError,
    OdysseyStreamError,
)

async def main():
    client = Odyssey(api_key="ody_your_api_key_here")
    
    try:
        await client.connect(
            on_video_frame=lambda f: None,
            on_stream_error=lambda reason, msg: print(f"Stream error: {reason} - {msg}"),
            on_error=lambda err, fatal: print(f"Error (fatal={fatal}): {err}"),
        )
        
        stream_id = await client.start_stream("A forest scene")
        await client.interact("Add some deer")
        await client.end_stream()
    
    except OdysseyAuthError:
        print("Authentication failed - check your API key")
    except OdysseyConnectionError as e:
        print(f"Connection failed: {e}")
        # Could retry here
    except OdysseyStreamError as e:
        print(f"Stream operation failed: {e}")
    finally:
        await client.disconnect()

asyncio.run(main())
```

## Recording Workflow

```python
import asyncio
from odyssey import Odyssey

async def main():
    client = Odyssey(api_key="ody_your_api_key_here")
    stream_id = None
    
    try:
        await client.connect(on_video_frame=lambda f: None)
        
        # Start stream and save the ID
        stream_id = await client.start_stream("A sunset over the ocean")
        print(f"Stream ID: {stream_id}")
        
        await client.interact("Add some seagulls flying")
        await asyncio.sleep(5)
        await client.end_stream()
    finally:
        await client.disconnect()
    
    # Retrieve the recording (after disconnect is fine)
    if stream_id:
        recording = await client.get_recording(stream_id)
        print(f"Video URL: {recording.video_url}")
        print(f"Duration: {recording.duration_seconds}s")
    
    # List all recordings
    result = await client.list_stream_recordings(limit=5)
    print(f"Total recordings: {result.total}")
    for rec in result.recordings:
        print(f"  - {rec.stream_id}: {rec.duration_seconds}s")

asyncio.run(main())
```

## Using with PIL

```python
import asyncio
from PIL import Image
from odyssey import Odyssey, VideoFrame

latest_image = None

def on_frame(frame: VideoFrame) -> None:
    global latest_image
    latest_image = Image.fromarray(frame.data)

async def main():
    client = Odyssey(api_key="ody_your_api_key_here")
    
    await client.connect(on_video_frame=on_frame)
    await client.start_stream("A beautiful garden")
    
    # Wait for some frames
    await asyncio.sleep(2)
    
    # Save the latest frame
    if latest_image:
        latest_image.save("screenshot.png")
        print("Saved screenshot.png")
    
    await client.end_stream()
    await client.disconnect()

asyncio.run(main())
```

## Batch Processing Multiple Prompts

```python
import asyncio
from odyssey import Odyssey

async def main():
    client = Odyssey(api_key="ody_your_api_key_here")
    
    prompts = [
        "A cat sitting by a window",
        "The cat looks outside",
        "The cat stretches",
        "The cat yawns",
        "The cat curls up to sleep",
    ]
    
    try:
        await client.connect(on_video_frame=lambda f: None)
        
        await client.start_stream(prompts[0])
        
        for prompt in prompts[1:]:
            await asyncio.sleep(3)  # Wait between interactions
            ack = await client.interact(prompt)
            print(f"Acknowledged: {ack}")
        
        await client.end_stream()
    finally:
        await client.disconnect()

asyncio.run(main())
```

## Image-to-Video

```python
import asyncio
from odyssey import Odyssey, VideoFrame

frames = []

def on_frame(frame: VideoFrame) -> None:
    frames.append(frame.data.copy())

async def main():
    client = Odyssey(api_key="ody_your_api_key_here")
    
    try:
        # Connect to Odyssey
        await client.connect(on_video_frame=on_frame)
        
        # Start stream with an image (file path)
        stream_id = await client.start_stream(
            prompt="A cat",
            portrait=False,
            image="/path/to/your/image.jpg"
        )
        print(f"Stream started: {stream_id}")
        
        # Interact as usual
        await client.interact("Pet the cat")
        await asyncio.sleep(5)
        
        await client.end_stream()
    finally:
        await client.disconnect()
    
    print(f"Collected {len(frames)} frames")

asyncio.run(main())
```

You can also use PIL Images, bytes, or NumPy arrays:

```python
from PIL import Image

# Using PIL Image
pil_image = Image.open("/path/to/image.jpg")
stream_id = await client.start_stream(prompt="A cat", image=pil_image)

# Using bytes
with open("/path/to/image.jpg", "rb") as f:
    image_bytes = f.read()
stream_id = await client.start_stream(prompt="A cat", image=image_bytes)
```

## Working with the Simulate API

```python
import asyncio
from odyssey import Odyssey

async def main():
    client = Odyssey(api_key="ody_your_api_key_here")
    
    # Create a simulation with a scripted sequence
    job = await client.simulate(
        script=[
            {"timestamp_ms": 0, "start": {"prompt": "A cat sitting on a windowsill"}},
            {"timestamp_ms": 3000, "interact": {"prompt": "The cat watches a bird outside"}},
            {"timestamp_ms": 6000, "interact": {"prompt": "The cat stretches lazily"}},
            {"timestamp_ms": 9000, "end": {}}
        ],
        portrait=True
    )
    
    print(f"Simulation started: {job.job_id}")
    
    # Poll for completion
    while True:
        status = await client.get_simulate_status(job.job_id)
        
        if status.status == "completed":
            break
        if status.status == "failed":
            print(f"Simulation failed: {status.error_message}")
            return
        if status.status == "cancelled":
            print("Simulation was cancelled")
            return
        
        await asyncio.sleep(5)
    
    # Get recordings from completed simulation
    for stream in status.streams:
        recording = await client.get_recording(stream.stream_id)
        print(f"Video URL: {recording.video_url}")

asyncio.run(main())
```
