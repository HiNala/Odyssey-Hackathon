import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Gemini with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * POST /api/gemini
 * Generate AI narrative and analysis for battle actions.
 * 
 * Request body:
 * {
 *   action: string,          // Player's action description
 *   context: {
 *     player1: { name, character, stats },
 *     player2: { name, character, stats },
 *     activePlayer: 1 | 2
 *   }
 * }
 * 
 * Response:
 * {
 *   narrative: string,       // AI-generated event narration
 *   analysis: {
 *     type: 'offensive' | 'defensive' | 'special' | 'neutral',
 *     intensity: 'weak' | 'normal' | 'strong' | 'devastating',
 *     impactType: 'miss' | 'weak' | 'normal' | 'strong' | 'critical'
 *   },
 *   statChanges: {
 *     player1: { momentum?, power?, defense?, energy? },
 *     player2: { momentum?, power?, defense?, energy? }
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Parse request
    const body = await request.json();
    const { action, context } = body;

    if (!action || !context) {
      return NextResponse.json(
        { error: 'Missing required fields: action, context' },
        { status: 400 }
      );
    }

    // Get model
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview' 
    });

    // Build prompt for Gemini
    const activePlayer = context.players[context.activePlayer - 1];
    const opponent = context.players[context.activePlayer === 1 ? 1 : 0];

    const isP1Active = context.activePlayer === 1;

    const prompt = `You are a dramatic battle narrator for an AI arena game. Be concise and vivid. No emojis.

CONTEXT:
- Attacker: ${activePlayer.character || activePlayer.name} (${activePlayer.name})
  Momentum ${activePlayer.stats.momentum}/100, Power ${activePlayer.stats.power}, Defense ${activePlayer.stats.defense}, Energy ${activePlayer.stats.energy}/100

- Defender: ${opponent.character || opponent.name} (${opponent.name})
  Momentum ${opponent.stats.momentum}/100, Power ${opponent.stats.power}, Defense ${opponent.stats.defense}, Energy ${opponent.stats.energy}/100

ACTION: "${action}"

RULES FOR STAT CHANGES (you MUST follow these ranges):
- Momentum changes: attacker gains +3 to +18, defender loses -2 to -12 (offensive)
- Defensive actions: attacker gains +1 to +5 momentum, gains +3 to +8 defense, recovers +2 to +6 energy
- Special moves: attacker gains +8 to +22 momentum, costs -15 to -30 energy
- Energy cost for attacks: -5 to -15
- A "miss" means near-zero changes
- NEVER change momentum by more than 25 in a single action
- NEVER change energy by more than 30 in a single action
- Consider current stats: if attacker has low energy, the action should be weaker

Player 1 is the attacker: ${isP1Active ? 'YES' : 'NO'}

RESPOND IN THIS EXACT JSON (no markdown, no code blocks):
{
  "narrative": "1-2 vivid sentences describing the action result",
  "analysis": {
    "type": "offensive|defensive|special|neutral",
    "intensity": "weak|normal|strong|devastating",
    "impactType": "miss|weak|normal|strong|critical"
  },
  "statChanges": {
    "player1": { "momentum": 0, "power": 0, "defense": 0, "energy": 0 },
    "player2": { "momentum": 0, "power": 0, "defense": 0, "energy": 0 }
  }
}`;

    // Call Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON response (handle markdown code blocks if present)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    const parsed = JSON.parse(jsonText);

    // Validate response structure
    if (!parsed.narrative || !parsed.analysis || !parsed.statChanges) {
      throw new Error('Invalid response format from Gemini');
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate narrative',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gemini
 * Health check endpoint
 */
export async function GET() {
  const isConfigured = !!process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';
  
  return NextResponse.json({
    status: isConfigured ? 'ready' : 'not_configured',
    model,
    message: isConfigured 
      ? 'Gemini API is configured and ready' 
      : 'Gemini API key not found in environment'
  });
}
