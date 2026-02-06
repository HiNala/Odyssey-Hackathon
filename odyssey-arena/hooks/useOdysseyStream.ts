'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getOdysseyClient, resetOdysseyClient } from '@/lib/odyssey-client';
import type { ConnectionStatus } from '@/lib/types';

interface UseOdysseyStreamReturn {
  status: ConnectionStatus;
  error: string | null;
  mediaStream: MediaStream | null;
  streamId: string | null;
  connect: () => Promise<MediaStream>;
  startStream: (prompt: string) => Promise<string>;
  interact: (prompt: string) => Promise<void>;
  endStream: () => Promise<void>;
  disconnect: () => void;
}

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

  // Cleanup on unmount - CRITICAL for Odyssey's single session limit
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        try {
          clientRef.current.disconnect();
        } catch (err) {
          console.warn('Error during cleanup disconnect:', err);
        }
      }
    };
  }, []);

  const connect = useCallback(async (): Promise<MediaStream> => {
    const client = getClient();

    try {
      setStatus('connecting');
      setError(null);

      const stream = await client.connect();
      setMediaStream(stream);
      setStatus('connected');

      return stream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      setStatus('error');
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getClient]);

  const startStream = useCallback(async (prompt: string): Promise<string> => {
    const client = getClient();

    try {
      setStatus('streaming');
      setError(null);

      const id = await client.startStream({ prompt });
      setStreamId(id);

      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Stream start failed';
      setStatus('error');
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getClient]);

  const interact = useCallback(async (prompt: string): Promise<void> => {
    const client = getClient();

    try {
      setError(null);
      await client.interact({ prompt });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Interaction failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getClient]);

  const endStream = useCallback(async (): Promise<void> => {
    const client = getClient();

    try {
      await client.endStream();
      setStatus('connected');
      setStreamId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'End stream failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [getClient]);

  const disconnect = useCallback((): void => {
    if (clientRef.current) {
      try {
        clientRef.current.disconnect();
      } catch (err) {
        console.warn('Error during disconnect:', err);
      }
      clientRef.current = null;
    }
    
    // Also reset the singleton
    resetOdysseyClient();
    
    setStatus('disconnected');
    setMediaStream(null);
    setStreamId(null);
    setError(null);
  }, []);

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
