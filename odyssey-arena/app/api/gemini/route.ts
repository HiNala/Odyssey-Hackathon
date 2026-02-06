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

    const prompt = `You are a dramatic battle narrator for an AI-powered arena game.

CONTEXT:
- Active Player: ${activePlayer.character || activePlayer.name} (${activePlayer.name})
  Stats: Momentum ${activePlayer.stats.momentum}, Power ${activePlayer.stats.power}, Defense ${activePlayer.stats.defense}, Energy ${activePlayer.stats.energy}
  
- Opponent: ${opponent.character || opponent.name} (${opponent.name})
  Stats: Momentum ${opponent.stats.momentum}, Power ${opponent.stats.power}, Defense ${opponent.stats.defense}, Energy ${opponent.stats.energy}

ACTION: "${action}"

TASK:
1. Analyze the action and determine:
   - Type: offensive, defensive, special, or neutral
   - Intensity: weak, normal, strong, or devastating
   - Impact: miss, weak, normal, strong, or critical

2. Generate a dramatic 1-2 sentence narration describing what happens.

3. Calculate stat changes based on the action intensity:
   - Strong actions: high momentum gain for attacker, high loss for defender
   - Defensive actions: momentum shifts more balanced, defense boost
   - Energy cost scales with intensity

Respond in this EXACT JSON format (no markdown):
{
  "narrative": "Your dramatic narration here",
  "analysis": {
    "type": "offensive",
    "intensity": "strong",
    "impactType": "strong"
  },
  "statChanges": {
    "player1": { "momentum": 0, "energy": 0 },
    "player2": { "momentum": 0, "energy": 0 }
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
