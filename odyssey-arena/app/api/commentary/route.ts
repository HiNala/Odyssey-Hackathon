import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * POST /api/commentary
 * Generate live battle commentary — the killer feature.
 * Ultra-fast, single-line responses for real-time feel.
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ commentary: null }, { status: 200 });
    }

    const body = await request.json();
    const { type, context } = body;

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    });

    let prompt = '';

    if (type === 'battle_start') {
      prompt = `You are an electrifying sports commentator for a creature battle arena. Generate ONE dramatic opening line (max 20 words). No quotes.

${context.player1} versus ${context.player2} in ${context.arena || 'the arena'}.

Style: ESPN/UFC announcer energy. Hype. Drama. Make viewers lean forward.
Examples of tone: "Ladies and gentlemen, the arena trembles as two titans prepare to clash!"
Generate the opening line NOW:`;
    } else if (type === 'victory') {
      prompt = `You are a legendary sports commentator calling the end of an epic battle. Generate ONE triumphant closing line (max 20 words). No quotes.

Winner: ${context.winner}
Defeated: ${context.loser}
Battle lasted: ${context.turns} turns

Style: Iconic sports moment energy. The crowd is going WILD.
Generate the closing line NOW:`;
    } else if (type === 'action') {
      prompt = `You are an electrifying sports commentator for a live creature battle. Generate ONE short, explosive commentary line (max 18 words). No quotes.

${context.attacker} used "${context.action}" against ${context.defender}.
Impact: ${context.impact} | Momentum shift: ${context.momentumChange > 0 ? '+' : ''}${context.momentumChange}
${context.isCritical ? 'THIS WAS A CRITICAL HIT!' : ''}
${context.comboCount > 1 ? `${context.comboCount}x COMBO!` : ''}

Style: ESPN/UFC commentator calling the action live. Raw energy. Make it visceral.
Generate the commentary NOW:`;
    } else {
      return NextResponse.json({ commentary: null });
    }

    const result = await model.generateContent(prompt);
    const commentary = result.response.text().trim().replace(/^["']|["']$/g, '');

    return NextResponse.json({ commentary });
  } catch (error) {
    console.error('[Commentary] API error:', error);
    return NextResponse.json({ commentary: null });
  }
}
