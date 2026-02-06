import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * POST /api/commentary
 * Generate live ESPN-style battle commentary via Gemini.
 * Lightweight endpoint — returns a single commentary line, fast.
 *
 * Body: { type: 'opening' | 'closing', ... context }
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ commentary: null }, { status: 200 });
    }

    const body = await request.json();
    const { type } = body;

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-3-flash-preview',
    });

    let prompt: string;

    if (type === 'opening') {
      const { character1, character2, world } = body;
      prompt = `You are a legendary sports announcer for an epic AI battle arena. Generate ONE electrifying opening line (max 25 words) for a battle between "${character1}" and "${character2}"${world ? ` in ${world}` : ''}.

Style: MAXIMUM HYPE. Think UFC announcer meets anime narrator. Make the audience feel the tension.

Examples of the energy level we need:
- "Ladies and gentlemen, the arena ERUPTS as ${character1} faces ${character2} in what promises to be an LEGENDARY clash!"
- "Two titans enter! Only one leaves! ${character1} versus ${character2} -- THIS. IS. WAR!"
- "The ground trembles as these warriors lock eyes across the battlefield -- LET'S GO!"

Generate ONE opening line NOW (just the line, no quotes, no prefix):`;
    } else if (type === 'closing') {
      const { winner, loser, turns, victoryType } = body;
      prompt = `You are a legendary sports announcer calling the end of an epic AI battle.

Winner: "${winner}"
Defeated: "${loser}"
Battle Length: ${turns} turns
Victory Type: ${victoryType || 'standard'}

Generate ONE dramatic closing line (max 25 words). Make the audience ROAR.

${victoryType === 'flawless' ? 'This was a FLAWLESS VICTORY - emphasize total domination!' : ''}
${victoryType === 'comeback' ? 'This was an incredible COMEBACK - emphasize the turnaround!' : ''}
${turns <= 4 ? 'This was a QUICK battle - emphasize the speed and power!' : ''}

Examples:
- "WHAT A BATTLE! ${winner} RISES VICTORIOUS after ${turns} rounds of PURE CHAOS!"
- "IT'S OVER! ${winner} has DONE IT! An UNFORGETTABLE performance!"
- "The arena EXPLODES as ${winner} claims TOTAL VICTORY!"

Generate closing line NOW (just the line, no quotes):`;
    } else {
      return NextResponse.json({ commentary: null }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const commentary = result.response.text().trim().replace(/^["']|["']$/g, '');

    return NextResponse.json({ commentary });
  } catch (error) {
    console.error('Commentary API error:', error);
    return NextResponse.json({ commentary: null }, { status: 200 });
  }
}
