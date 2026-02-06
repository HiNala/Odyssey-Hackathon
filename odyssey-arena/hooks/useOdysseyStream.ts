'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getOdysseyClient, resetOdysseyClient } from '@/lib/odyssey-client';
import type { ConnectionStatus } from '@/lib/types';

/**
 * Options for starting an Odyssey stream.
 * Supports both text-to-video and image-to-video modes.
 */
export interface StartStreamOptions {
  prompt: string;
  image?: File | Blob;
  portrait?: boolean;
}

interface UseOdysseyStreamReturn {
  status: ConnectionStatus;
  error: string | null;
  mediaStream: MediaStream | null;
  streamId: string | null;
  connect: () => Promise<MediaStream>;
  startStream: (promptOrOptions: string | StartStreamOptions) => Promise<string>;
  interact: (prompt: string) => Promise<void>;
  endStream: () => Promise<void>;
  disconnect: () => void;
}

/**
 * Hook to manage the Odyssey SDK connection lifecycle.
 *
 * Key design decisions (from Odyssey SDK docs):
 * - Uses event handlers in connect() for reactive UI updates
 * - Passes portrait: true to startStream() for phone-screen format (704×1280)
 * - Singleton pattern enforced via odyssey-client.ts (1 concurrent session limit)
 * - Cleanup on unmount AND beforeunload (prevent 40s session block)
 * - Retry logic with exponential backoff on connect failure
 */
export function useOdysseyStream(): UseOdysseyStreamReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [streamId, setStreamId] = useState<string | null>(null);
  
  // Use ref to store client to avoid recreating on every render
  const clientRef = useRef<ReturnType<typeof getOdysseyClient> | null>(null);

  // Initialize client ref
  const getClient = useCallback(() => {
    if (!clientRef.current) {
      try {
        clientRef.current = getOdysseyClient();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize client');
        setStatus('error');
        throw err;
      }
    }
    return clientRef.current;
  }, []);

  // Disconnect helper (shared by cleanup, unmount, and beforeunload)
  const performDisconnect = useCallback(() => {
    if (clientRef.current) {
      try {
        clientRef.current.disconnect();
      } catch (err) {
        console.warn('Error during disconnect:', err);
      }
      clientRef.current = null;
    }
    resetOdysseyClient();
  }, []);

  // ── Cleanup on unmount — CRITICAL for Odyssey's single session limit ──
  useEffect(() => {
    return () => {
      performDisconnect();
    };
  }, [performDisconnect]);

  // ── Cleanup on tab close / navigation — prevents 40s session block ──
  useEffect(() => {
    const handleBeforeUnload = () => {
      performDisconnect();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [performDisconnect]);

  // ── Connect to Odyssey with full event handlers (per SDK docs) ──
  //
  // IMPORTANT: Fatal errors (invalid API key, access denied) stop retries
  // immediately. Only transient errors (timeout, no streamers) are retried.
  // This prevents creating multiple stale sessions on the server.
  const connect = useCallback(async (): Promise<MediaStream> => {
    const client = getClient();
    const maxRetries = 2;
    let lastError: Error | null = null;
    let isFatalError = false;

    // Fatal error messages from Odyssey SDK docs (06-types.md)
    const FATAL_PATTERNS = [
      'invalid api key',
      'api key format',
      'api key access denied',
      'api key cannot be empty',
      'apikey is required',
    ];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setStatus('connecting');
        setError(null);
        isFatalError = false;

        console.log(`[Odyssey] Connecting (attempt ${attempt}/${maxRetries})...`);

        // Use the SDK's handler pattern for reactive state updates
        const stream = await client.connect({
          onConnected: (ms: MediaStream) => {
            console.log('[Odyssey] onConnected — stream ready');
            setMediaStream(ms);
            setStatus('connected');
          },
          onDisconnected: () => {
            console.log('[Odyssey] onDisconnected');
            setMediaStream(null);
            setStatus('disconnected');
          },
          onStreamStarted: (id: string) => {
            console.log('[Odyssey] onStreamStarted:', id);
            setStreamId(id);
            setStatus('streaming');
          },
          onStreamEnded: () => {
            console.log('[Odyssey] onStreamEnded');
            setStreamId(null);
            setStatus('connected');
          },
          onInteractAcknowledged: (prompt: string) => {
            console.log('[Odyssey] onInteractAcknowledged:', prompt.slice(0, 60));
          },
          onStreamError: (reason: string, message: string) => {
            console.error(`[Odyssey] onStreamError [${reason}]: ${message}`);
            setError(`Stream error: ${message}`);
          },
          onError: (err: Error, fatal: boolean) => {
            console.error(`[Odyssey] onError (fatal=${fatal}):`, err.message);
            setError(err.message);
            if (fatal) {
              isFatalError = true;
              setStatus('failed');
            }
          },
          onStatusChange: (newStatus: string, message?: string) => {
            console.log(`[Odyssey] onStatusChange: ${newStatus}`, message || '');
            if (newStatus === 'authenticating') setStatus('authenticating');
            else if (newStatus === 'connecting') setStatus('connecting');
            else if (newStatus === 'reconnecting') setStatus('reconnecting');
            else if (newStatus === 'connected') setStatus('connected');
            else if (newStatus === 'disconnected') setStatus('disconnected');
            else if (newStatus === 'failed') {
              setStatus('failed');
              setError(message || 'Connection failed');
            }
          },
        });

        setMediaStream(stream);
        setStatus('connected');
        console.log('[Odyssey] Connected successfully');

        return stream;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Connection failed');
        const msg = lastError.message.toLowerCase();
        console.warn(`[Odyssey] Connection attempt ${attempt}/${maxRetries} failed:`, lastError.message);

        // Check if this is a fatal error — don't retry
        const isFatal = isFatalError || FATAL_PATTERNS.some((p) => msg.includes(p));
        if (isFatal) {
          console.error('[Odyssey] Fatal error — not retrying');
          performDisconnect();
          break;
        }

        // Wait before retry (exponential backoff) for transient errors
        if (attempt < maxRetries) {
          const delay = 1000 * attempt;
          console.log(`[Odyssey] Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Failed
    const errorMessage = formatOdysseyError(lastError?.message || 'Connection failed');
    setStatus('error');
    setError(errorMessage);
    throw new Error(errorMessage);
  }, [getClient, performDisconnect]);

  // ── Ensure client is connected, reconnecting if needed ──
  const ensureConnected = useCallback(async (): Promise<void> => {
    const client = getClient();
    
    // If the SDK reports connected, we're good
    if (client.isConnected) return;
    
    // Client exists but isn't connected — need to reconnect
    console.log('[Odyssey] Client disconnected, reconnecting before stream...');
    await connect();
  }, [getClient, connect]);

  // ── Start a stream — supports both text-to-video and image-to-video ──
  // Usage: startStream("prompt") or startStream({ prompt: "...", image: file })
  // Auto-reconnects if the client is disconnected (e.g. after HMR or endStream).
  const startStream = useCallback(async (promptOrOptions: string | StartStreamOptions): Promise<string> => {
    try {
      setError(null);
      
      // Ensure we have a live connection before starting a stream
      await ensureConnected();
      const client = getClient();
      
      // Normalize input to options object
      const options: StartStreamOptions = typeof promptOrOptions === 'string'
        ? { prompt: promptOrOptions }
        : promptOrOptions;
      
      // Default to portrait mode for phone-screen format (704×1280)
      const portrait = options.portrait ?? true;
      
      // Build stream options per Odyssey SDK docs
      // Image-to-video: max 25MB, formats: JPEG, PNG, WebP, GIF, BMP, HEIC, HEIF, AVIF
      const streamOptions: { prompt: string; portrait: boolean; image?: File | Blob } = {
        prompt: options.prompt,
        portrait,
      };
      
      // Add image if provided (enables image-to-video mode)
      if (options.image) {
        console.log('[Odyssey] Starting image-to-video stream');
        streamOptions.image = options.image;
      } else {
        console.log('[Odyssey] Starting text-to-video stream');
      }
      
      const id = await client.startStream(streamOptions);
      setStreamId(id);
      setStatus('streaming');
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Stream start failed';
      setStatus('error');
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getClient, ensureConnected]);

  // ── Send an interaction prompt (state descriptions, not action verbs) ──
  // Best-effort: if client is disconnected, silently skip instead of crashing.
  const interact = useCallback(async (prompt: string): Promise<void> => {
    try {
      const client = getClient();
      
      // Skip if not connected — interactions are visual-only, game logic doesn't depend on them
      if (!client.isConnected) {
        console.warn('[Odyssey] Skipping interact — client not connected');
        return;
      }
      
      setError(null);
      await client.interact({ prompt });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Interaction failed';
      setError(errorMessage);
      // Don't throw — interactions are best-effort, game continues
      console.warn('[Odyssey] Interaction failed (non-fatal):', errorMessage);
    }
  }, [getClient]);

  // ── End the current stream ──
  // Resilient: if client is disconnected, just reset local state.
  const endStream = useCallback(async (): Promise<void> => {
    try {
      const client = getClient();
      
      if (!client.isConnected) {
        console.warn('[Odyssey] endStream — client not connected, resetting local state');
        setStatus('disconnected');
        setStreamId(null);
        return;
      }
      
      await client.endStream();
      setStatus('connected');
      setStreamId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'End stream failed';
      setError(errorMessage);
      setStreamId(null);
      // Don't throw — end stream failures are recoverable
      console.warn('[Odyssey] endStream failed (non-fatal):', errorMessage);
    }
  }, [getClient]);

  // ── Disconnect and reset everything ──
  const disconnect = useCallback((): void => {
    performDisconnect();
    setStatus('disconnected');
    setMediaStream(null);
    setStreamId(null);
    setError(null);
  }, [performDisconnect]);

  return {
    status,
    error,
    mediaStream,
    streamId,
    connect,
    startStream,
    interact,
    endStream,
    disconnect,
  };
}

function formatOdysseyError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('401') || lower.includes('unauthorized') || lower.includes('invalid api')) {
    return `${message} — Check NEXT_PUBLIC_ODYSSEY_API_KEY in .env.local`;
  }
  return message;
}
