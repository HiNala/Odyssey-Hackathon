import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

/**
 * Get or create the singleton Google Generative AI instance.
 * Uses GEMINI_API_KEY from environment variables (server-side only).
 */
function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not defined. Please add it to your .env.local file.'
      );
    }

    genAI = new GoogleGenerativeAI(apiKey);
  }

  return genAI;
}

/**
 * Get or create the Gemini generative model.
 * Defaults to gemini-3-flash-preview (latest balanced model).
 * Override with GEMINI_MODEL env var.
 */
export function getGeminiModel(): GenerativeModel {
  if (!model) {
    const ai = getGenAI();
    const modelName = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

    model = ai.getGenerativeModel({ model: modelName });
  }

  return model;
}

/**
 * Generate text content from a prompt using Gemini.
 * This is the primary function for the prompt system.
 */
export async function generateContent(prompt: string): Promise<string> {
  const gemini = getGeminiModel();
  const result = await gemini.generateContent(prompt);
  const response = result.response;
  return response.text();
}

/**
 * Generate game narration for the arena battles.
 * Uses a system prompt tuned for dramatic battle narration.
 */
export async function generateBattleNarration(
  action: string,
  context: {
    player1Character?: string;
    player2Character?: string;
    world?: string;
    previousEvents?: string[];
  }
): Promise<string> {
  const systemPrompt = `You are the narrator for ODYSSEY ARENA, an epic AI battle simulation.
Your role is to create dramatic, vivid, and concise narration for battle actions.
Keep responses to 2-3 sentences maximum. Be theatrical and exciting.

Context:
- Player 1 character: ${context.player1Character || 'Unknown warrior'}
- Player 2 character: ${context.player2Character || 'Unknown warrior'}
- World/Arena: ${context.world || 'The Arena'}
${context.previousEvents?.length ? `- Recent events: ${context.previousEvents.slice(-3).join('; ')}` : ''}`;

  const fullPrompt = `${systemPrompt}\n\nNarrate this action: ${action}`;

  return generateContent(fullPrompt);
}

/**
 * Generate a visual scene description for Odyssey to render.
 * Creates prompts optimized for the Odyssey visual AI.
 */
export async function generateVisualPrompt(
  action: string,
  context: {
    character?: string;
    world?: string;
    mood?: string;
  }
): Promise<string> {
  const systemPrompt = `You are a visual scene director for an AI-powered battle arena.
Create a single, vivid visual description (1-2 sentences) that can be rendered as a 3D scene.
Focus on: dramatic lighting, dynamic poses, environmental effects.
Do NOT include dialogue or narrative - only visual description.

Character: ${context.character || 'A powerful warrior'}
World: ${context.world || 'A mystical arena'}
Mood: ${context.mood || 'Epic and intense'}`;

  const fullPrompt = `${systemPrompt}\n\nCreate a visual scene for: ${action}`;

  return generateContent(fullPrompt);
}

/**
 * Reset the Gemini client (useful for testing or key rotation).
 */
export function resetGeminiClient(): void {
  genAI = null;
  model = null;
}
