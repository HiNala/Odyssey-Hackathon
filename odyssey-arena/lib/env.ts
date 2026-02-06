/**
 * Environment variable validation.
 * Called at startup to ensure all required config is present.
 */

const REQUIRED_SERVER_VARS = ['GEMINI_API_KEY'] as const;
const REQUIRED_CLIENT_VARS = ['NEXT_PUBLIC_ODYSSEY_API_KEY'] as const;

export function validateEnv(): void {
  // Check required server-side vars
  const missingServer = REQUIRED_SERVER_VARS.filter((key) => !process.env[key]);
  if (missingServer.length > 0) {
    console.warn(
      `Missing server environment variables: ${missingServer.join(', ')}. ` +
      'Some features (AI narration) will use fallback logic.'
    );
  }

  // Check required client-side vars (Odyssey is the core of this app)
  const missingClient = REQUIRED_CLIENT_VARS.filter((key) => !process.env[key]);
  if (missingClient.length > 0) {
    console.error(
      `Missing client environment variables: ${missingClient.join(', ')}. ` +
      'The Odyssey API key is REQUIRED — live video streaming will not work without it. ' +
      'Get your key at https://developer.odyssey.ml/dashboard'
    );
  }

  if (missingServer.length === 0 && missingClient.length === 0) {
    console.log('[Env] All environment variables validated');
  }
}
