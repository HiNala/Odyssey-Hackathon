/**
 * Core Type Definitions
 * Connection and streaming types for Odyssey integration.
 * Game-specific types live in @/types/game.ts
 */

// ─── Odyssey Connection Types ───────────────────────────────────────

/** Connection status matching Odyssey SDK + our custom states */
export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'streaming'
  | 'error'
  | 'authenticating'
  | 'reconnecting'
  | 'failed';

/** Stream configuration for startStream() */
export type StreamConfig = {
  prompt: string;
  portrait?: boolean;
};

/** Return type for the Odyssey stream hook */
export type OdysseyStreamState = {
  status: ConnectionStatus;
  mediaStream: MediaStream | null;
  streamId: string | null;
  error: string | null;
  isConnected: boolean;
  isStreaming: boolean;
};

/** Actions exposed by the Odyssey stream hook */
export type OdysseyStreamActions = {
  connect: () => Promise<MediaStream>;
  disconnect: () => void;
  startStream: (prompt: string) => Promise<string>;
  interact: (prompt: string) => Promise<void>;
  endStream: () => Promise<void>;
};
