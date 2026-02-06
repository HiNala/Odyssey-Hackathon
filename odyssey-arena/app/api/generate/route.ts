import { NextRequest, NextResponse } from 'next/server';
import { generateContent, generateBattleNarration, generateVisualPrompt } from '@/lib/gemini-client';

/**
 * POST /api/generate
 * Server-side API route for Gemini text generation.
 * Keeps the API key secure on the server side.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, prompt, context } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    let result: string;

    switch (type) {
      case 'narration':
        result = await generateBattleNarration(prompt, context || {});
        break;

      case 'visual':
        result = await generateVisualPrompt(prompt, context || {});
        break;

      case 'general':
      default:
        result = await generateContent(prompt);
        break;
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Gemini generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
