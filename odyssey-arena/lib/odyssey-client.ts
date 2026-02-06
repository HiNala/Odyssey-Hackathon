import { Odyssey } from '@odysseyml/odyssey';

let odysseyClient: Odyssey | null = null;

/**
 * Validate Odyssey API key format.
 * Per SDK docs, keys start with "ody_" — length varies by account.
 */
function validateAPIKey(apiKey: string): { valid: boolean; error?: string } {
  if (!apiKey || apiKey.trim() === '') {
    return { valid: false, error: 'API key is empty' };
  }
  
  if (!apiKey.startsWith('ody_')) {
    return { valid: false, error: 'Invalid API key format (should start with "ody_")' };
  }
  
  // Only validate prefix — key length varies by account tier
  if (apiKey.length < 5) {
    return { valid: false, error: 'API key appears incomplete' };
  }
  
  return { valid: true };
}

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

    // Validate API key format
    const validation = validateAPIKey(apiKey);
    if (!validation.valid) {
      throw new Error(
        `Invalid Odyssey API key: ${validation.error}. Please check your .env.local file. Get a valid key from https://developer.odyssey.ml`
      );
    }

    try {
      odysseyClient = new Odyssey({ apiKey });
      console.log('[Odyssey] Client initialized successfully');
    } catch (error) {
      throw new Error(
        `Failed to initialize Odyssey client: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
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
