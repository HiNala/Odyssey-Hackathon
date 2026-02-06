# MISSION 02: Odyssey SDK Integration

## Mission Objective

Integrate the Odyssey-2 Pro SDK to enable real-time video streaming. By the end of this mission, you should have a working video stream displaying in one of the phone screens, with the ability to connect, start a stream with a prompt, and disconnect cleanly.

This mission establishes the core technology that makes the demo impressive — live AI-generated video.

---

## Time Estimate

**45-60 minutes**

---

## Prerequisites

Before starting, ensure you have:
- Mission 01 completed (static UI is working)
- Odyssey API key (format: `ody_xxxxx`)
- Stable internet connection
- Chrome/Edge browser (Safari has WebRTC quirks)

---

## Detailed Instructions

### Phase 1: Environment Configuration

Set up the environment variable for the Odyssey API key. This keeps the key out of your code and allows easy swapping during development.

Create a `.env.local` file in the project root. This file should NOT be committed to git — add it to `.gitignore` if not already there.

The environment variable should be named with the `NEXT_PUBLIC_` prefix so it's accessible in client-side code. This is intentional for this hackathon demo — in production, you'd use server-side handling.

**What to verify:**
- `.env.local` file exists
- `NEXT_PUBLIC_ODYSSEY_API_KEY` is set
- `.gitignore` includes `.env.local`

---

### Phase 2: Install Odyssey SDK

Install the official Odyssey JavaScript SDK from npm. This provides the `Odyssey` class and types for interacting with the API.

The SDK is published as `@odysseyml/odyssey`. It includes TypeScript types out of the box, so no additional type packages are needed.

**What to verify:**
- Package appears in `package.json` dependencies
- No installation errors
- Types are available (`Odyssey` can be imported)

---

### Phase 3: Create Odyssey Client Module

Create a dedicated module for managing the Odyssey client instance. Because of the single-session limitation (max 1 concurrent stream per API key), we use a singleton pattern to ensure we never accidentally create multiple connections.

The module should export:
- `getOdysseyClient()` — Returns the singleton instance, creating it if needed
- `disconnectOdyssey()` — Disconnects and clears the instance

This module lives in `lib/odyssey.ts` and serves as the single source of truth for Odyssey connection state.

**What to verify:**
- Module exports both functions
- API key is read from environment variable
- Error is thrown if API key is missing

---

### Phase 4: Create Connection Hook

Create a custom React hook that manages the Odyssey connection lifecycle. This hook abstracts the complexity of connection management and provides a clean API for components.

The hook should:
- Track connection state (isConnected, isStreaming, error)
- Store the MediaStream for video playback
- Provide methods: `connect()`, `disconnect()`, `startStream()`, `interact()`, `endStream()`
- Handle cleanup on component unmount
- Report errors in a user-friendly way

Name this hook `useOdysseyConnection` and place it in `hooks/useOdysseyConnection.ts`.

**What to verify:**
- Hook compiles without TypeScript errors
- All state values are properly typed
- Cleanup function disconnects on unmount

---

### Phase 5: Create Video Player Component

Create a VideoPlayer component that displays the Odyssey MediaStream in a video element. This component handles attaching/detaching the stream to the video element correctly.

Key requirements:
- Accept a `MediaStream | null` prop
- Handle stream changes gracefully
- Set appropriate video attributes (autoplay, playsInline, muted)
- Fill its container completely
- Clean up when stream is removed

The component should also show a placeholder when no stream is active.

**What to verify:**
- Video element accepts srcObject correctly
- Placeholder shows when stream is null
- No console errors about video playback

---

### Phase 6: Basic Connection Test

Before integrating into the full UI, create a simple test to verify the Odyssey connection works. This can be a temporary test component or just some code in page.tsx.

The test should:
1. Initialize the connection when a button is clicked
2. Start a stream with a simple prompt ("A cat")
3. Display the video in a basic video element
4. End the stream and disconnect when done

This is a sanity check — if it doesn't work here, it won't work in the full UI.

**What to verify:**
- Connection establishes (check Network tab for WebRTC)
- Video appears after starting stream
- No errors in console
- Disconnect works cleanly

---

### Phase 7: Integrate with PhoneScreen

Update the PhoneScreen component to use the real video stream instead of placeholders. For now, we'll only connect one phone screen (since we can only have one stream at a time).

The integration should:
- Accept video-related props (mediaStream, isStreaming)
- Render VideoPlayer when stream is active
- Show placeholder when no stream
- Add visual indicator for "live" state

For this mission, focus on getting ONE phone working. We'll handle the dual-phone complexity in Mission 03.

**What to verify:**
- Video displays inside the phone frame
- Video fills the screen area properly
- "Live" indicator shows when streaming

---

### Phase 8: Add Connection Controls

Add temporary UI controls for testing the connection flow. These will be replaced by proper game flow logic in Mission 03, but are needed now for testing.

Add controls for:
- Connect button
- Start stream (with hardcoded prompt)
- Interact (with hardcoded prompt)
- End stream
- Disconnect

Place these controls somewhere visible, like below the arena or in a debug panel.

**What to verify:**
- Each button triggers the correct action
- State changes are reflected in UI
- No double-connection issues

---

### Phase 9: Error Handling

Implement proper error handling for common Odyssey failure modes. The SDK can fail in several ways, and users should see helpful messages.

Handle these error cases:
- Invalid API key (401 error)
- No available streamers (capacity issue)
- Connection timeout
- Stream start failure
- Unexpected disconnection

Display errors in a visible location (toast, alert, or inline message).

**What to verify:**
- Invalid API key shows appropriate message
- Network errors are caught
- UI doesn't break on errors

---

### Phase 10: Connection Lifecycle Cleanup

Ensure the connection is properly cleaned up in all scenarios:
- Component unmount
- Page navigation
- Browser tab close
- Error states

The `beforeunload` event handler is particularly important to prevent stale sessions that block future connections.

**What to verify:**
- Closing tab disconnects cleanly
- Navigating away disconnects
- Multiple connect attempts don't create issues

---

## Deliverables Checklist

At the end of Mission 02, you should have:

### Files Created/Modified
- [ ] `.env.local` with API key
- [ ] `lib/odyssey.ts` - Singleton client module
- [ ] `hooks/useOdysseyConnection.ts` - Connection hook
- [ ] `components/VideoPlayer.tsx` - Video display component
- [ ] Updated `components/PhoneScreen.tsx` - Integrated video

### Functionality Working
- [ ] Can connect to Odyssey
- [ ] Can start a video stream with prompt
- [ ] Video displays in phone screen
- [ ] Can send interact prompts
- [ ] Can end stream
- [ ] Can disconnect cleanly
- [ ] Errors are handled gracefully

### Technical Verification
- [ ] No TypeScript errors
- [ ] No console errors during normal operation
- [ ] Cleanup works on unmount
- [ ] beforeunload handler registered

---

## Cursor Coding Model Instructions

**ATTENTION CURSOR:** When executing this mission, follow these steps precisely:

1. **Review relevant documentation:**
   - Read `docs/game-logic/02-odyssey-integration.md` for SDK patterns
   - Read Odyssey SDK docs in `odyssey-docs/js/` folder
   - Understand the single-session constraint

2. **Set up environment:**
   ```bash
   # Create .env.local in project root
   # Add: NEXT_PUBLIC_ODYSSEY_API_KEY=ody_your_key_here
   ```

3. **Install SDK:**
   ```bash
   npm install @odysseyml/odyssey
   ```

4. **Create lib/odyssey.ts:**
   - Implement singleton pattern
   - Export getOdysseyClient and disconnectOdyssey
   - Read API key from process.env

5. **Create hooks/useOdysseyConnection.ts:**
   - Implement state management for connection
   - Provide all necessary methods
   - Handle cleanup properly

6. **Create components/VideoPlayer.tsx:**
   - Handle MediaStream attachment
   - Show placeholder when no stream
   - Set correct video attributes

7. **Update PhoneScreen.tsx:**
   - Accept new props for video
   - Conditionally render VideoPlayer vs placeholder
   - Add streaming indicator

8. **Test the integration:**
   - Start dev server
   - Test connect → startStream → interact → endStream → disconnect
   - Verify video displays correctly

9. **Add error handling:**
   - Wrap Odyssey calls in try/catch
   - Display user-friendly error messages
   - Handle edge cases

10. **Verify cleanup:**
    - Add beforeunload handler
    - Test unmount cleanup
    - Check no stale connections

11. **Run final checks:**
    ```bash
    npm run lint
    npm run build
    ```

12. **Do NOT proceed to Mission 03** until video is displaying correctly in phone screen.

---

## Troubleshooting

### Common Issues

**"API key is invalid" error:**
- Check .env.local file exists
- Verify key starts with `ody_`
- Ensure no quotes around the value in .env.local
- Restart the dev server after changing env vars

**Video not displaying:**
- Check browser console for WebRTC errors
- Ensure video element has srcObject set (not src)
- Verify autoplay and muted attributes are set
- Try Chrome/Edge instead of Safari

**"Maximum concurrent sessions" error:**
- Previous session didn't disconnect properly
- Wait 40 seconds for server timeout
- Or restart the dev server

**Connection hangs:**
- Check network connectivity
- Try refreshing the page
- Check Odyssey status/Discord for outages

**TypeScript errors with SDK:**
- Ensure @odysseyml/odyssey is installed
- Check import statement is correct
- Verify tsconfig.json includes node_modules types

---

## Odyssey Prompting Tips

For testing, use prompts that work well with the model:

**Good test prompts:**
- "A cat sitting on a sunny windowsill, soft lighting"
- "A warrior knight in a mystical forest, dramatic lighting, fantasy style"
- "A cyberpunk city street at night, neon signs, rain"

**Good interact prompts:**
- "The cat stretches and yawns"
- "The knight draws their sword, which begins to glow"
- "A flying car passes by in the background"

**Avoid:**
- Action verbs that loop ("The cat jumps" will loop)
- Very specific fictional characters (silhouettes suffer)
- Vague prompts ("something happens")

---

## Success Criteria

This mission is complete when:
1. Video stream appears in the phone screen
2. Connect/start/interact/end/disconnect all work
3. Errors are handled without breaking the UI
4. No stale connection issues
5. Clean disconnect on page close
