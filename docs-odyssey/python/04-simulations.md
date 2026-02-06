# Simulate API

> Run scripted video generation asynchronously with the Simulate API.

The Simulate API requires SDK version 1.0.0 or higher.

The Simulate API allows you to run scripted interactions asynchronously. Unlike the Interactive API where you connect and interact in real-time, simulations execute in the background and produce recordings you can retrieve when complete.

## When to Use the Simulate API

| Use Case | Recommended Approach |
|----------|---------------------|
| Real-time interaction | Interactive API (`connect()` + `start_stream()`) |
| Batch video generation | Simulate API |
| Pre-scripted sequences | Simulate API |
| Background processing | Simulate API |
| User-driven interactions | Interactive API |

## Script Format

A simulation script is a list of dictionaries that define the sequence of actions using timestamps:

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

### Entry Types

| Action | Fields | Description |
|--------|--------|-------------|
| `start` | `{ prompt, image? }` | Begin a new stream with initial prompt |
| `interact` | `{ prompt }` | Send an interaction prompt |
| `end` | `{}` | End the current stream |

### Example Script

```python
script = [
    # Start a portrait video of a cat at t=0
    {"timestamp_ms": 0, "start": {"prompt": "A cat sitting by a window"}},
    
    # Interact at t=3000ms (3 seconds)
    {"timestamp_ms": 3000, "interact": {"prompt": "The cat looks outside"}},
    
    # Another interaction at t=6000ms (6 seconds)
    {"timestamp_ms": 6000, "interact": {"prompt": "The cat stretches"}},
    
    # End the stream at t=9000ms (9 seconds)
    {"timestamp_ms": 9000, "end": {}}
]
```

## Basic Workflow

### 1. Create a Simulation

```python
import asyncio
from odyssey import Odyssey

async def main():
    client = Odyssey(api_key="ody_your_api_key_here")
    
    job = await client.simulate(
        script=[
            {"timestamp_ms": 0, "start": {"prompt": "A serene mountain landscape"}},
            {"timestamp_ms": 5000, "interact": {"prompt": "Clouds roll across the sky"}},
            {"timestamp_ms": 10000, "interact": {"prompt": "The sun begins to set"}},
            {"timestamp_ms": 15000, "end": {}}
        ],
        portrait=False
    )
    
    print(f"Simulation ID: {job.job_id}")
    print(f"Status: {job.status}")  # 'pending'

asyncio.run(main())
```

### 2. Poll for Completion

```python
async def wait_for_completion(client, job_id):
    while True:
        status = await client.get_simulate_status(job_id)
        
        if status.status == "completed":
            return status
        if status.status == "failed":
            raise Exception(f"Simulation failed: {status.error_message}")
        if status.status == "cancelled":
            raise Exception("Simulation was cancelled")
        
        # Wait 5 seconds before checking again
        await asyncio.sleep(5)

result = await wait_for_completion(client, job.job_id)
print("Simulation completed!")
```

### 3. Retrieve Recordings

```python
# Get the stream IDs from the completed simulation
for stream in result.streams:
    recording = await client.get_recording(stream.stream_id)
    print(f"Video URL: {recording.video_url}")
    print(f"Duration: {recording.duration_seconds} seconds")
```

## Image-to-Video with the Simulate API

You can start a simulation with an image:

```python
# Using a file path string
job = await client.simulate(
    script=[
        {"timestamp_ms": 0, "start": {"prompt": "A cat", "image": "/path/to/image.jpg"}},
        {"timestamp_ms": 3000, "interact": {"prompt": "The cat looks around"}},
        {"timestamp_ms": 6000, "end": {}}
    ],
    portrait=False
)

# Using bytes
with open("/path/to/image.jpg", "rb") as f:
    image_bytes = f.read()

job = await client.simulate(
    script=[
        {"timestamp_ms": 0, "start": {"prompt": "A cat", "image": image_bytes}},
        {"timestamp_ms": 10000, "end": {}}
    ]
)

# Using a base64 data URL string
job = await client.simulate(
    script=[
        {"timestamp_ms": 0, "start": {"prompt": "Robot dancing", "image": "data:image/png;base64,iVBORw0KGgo..."}},
        {"timestamp_ms": 10000, "end": {}}
    ]
)
```

## Managing Simulation Jobs

### List Your Simulation Jobs

```python
result = await client.list_simulations(limit=10)

for sim in result.jobs:
    print(f"{sim.job_id}: {sim.status} (created: {sim.created_at})")

print(f"Showing {len(result.jobs)} of {result.total} total simulations")
```

### Cancel a Simulation

```python
# Cancel a pending or running simulation
await client.cancel_simulation(job.job_id)
print("Simulation cancelled")
```

## Complete Example

```python
import asyncio
from odyssey import Odyssey

async def run_simulation():
    client = Odyssey(api_key="ody_your_api_key_here")
    
    # Create simulation
    job = await client.simulate(
        script=[
            {"timestamp_ms": 0, "start": {"prompt": "A cat sitting on a windowsill"}},
            {"timestamp_ms": 3000, "interact": {"prompt": "The cat watches a bird outside"}},
            {"timestamp_ms": 6000, "interact": {"prompt": "The cat stretches lazily"}},
            {"timestamp_ms": 9000, "interact": {"prompt": "The cat curls up to sleep"}},
            {"timestamp_ms": 12000, "end": {}}
        ],
        portrait=True
    )
    
    print(f"Started simulation: {job.job_id}")
    
    # Poll for completion
    status = None
    while True:
        await asyncio.sleep(5)
        status = await client.get_simulate_status(job.job_id)
        print(f"Status: {status.status}")
        
        if status.status not in ("pending", "running"):
            break
    
    if status.status == "completed":
        # Download recordings
        for stream in status.streams:
            recording = await client.get_recording(stream.stream_id)
            print(f"Recording ready: {recording.video_url}")
    else:
        print(f"Simulation failed: {status.error_message}")

asyncio.run(run_simulation())
```

## Error Handling

```python
from odyssey import Odyssey

async def main():
    client = Odyssey(api_key="ody_your_api_key_here")
    
    try:
        job = await client.simulate(
            script=[
                {"timestamp_ms": 0, "start": {"prompt": "A sunset over the ocean"}},
                {"timestamp_ms": 5000, "end": {}}
            ]
        )
        
        status = await client.get_simulate_status(job.job_id)
        
        if status.status == "failed":
            print(f"Job failed: {status.error_message}")
            
            # Check individual streams for errors
            for stream in status.streams:
                if stream.status == "failed":
                    print(f"Stream {stream.stream_id} failed: {stream.error_message}")
    
    except Exception as e:
        print(f"API error: {e}")

asyncio.run(main())
```
