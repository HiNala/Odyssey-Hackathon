import { Odyssey } from '@odysseyml/odyssey';

let odysseyClient: Odyssey | null = null;

/**
 * Get or create the singleton Odyssey client instance.
 * This ensures we only have one connection to Odyssey at a time,
 * which is critical since the API limits to 1 concurrent session.
 */
export function getOdysseyClient(): Odyssey {
  if (!odysseyClient) {
    const apiKey = process.env.NEXT_PUBLIC_ODYSSEY_API_KEY;

    if (!apiKey) {
      throw new Error(
        'NEXT_PUBLIC_ODYSSEY_API_KEY is not defined. Please add it to your .env.local file.'
      );
    }

    odysseyClient = new Odyssey({ apiKey });
  }

  return odysseyClient;
}

/**
 * Disconnect and reset the Odyssey client.
 * Call this when you need to force a new connection.
 */
export function resetOdysseyClient(): void {
  if (odysseyClient) {
    try {
      odysseyClient.disconnect();
    } catch (error) {
      console.warn('Error disconnecting Odyssey client:', error);
    }
    odysseyClient = null;
  }
}

/**
 * Check if we have an active Odyssey client
 */
export function hasOdysseyClient(): boolean {
  return odysseyClient !== null;
}
