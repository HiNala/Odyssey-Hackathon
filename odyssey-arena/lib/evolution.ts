/**
 * Character Evolution System
 *
 * Characters exist in 5 evolutionary states:
 *   -2 (Devolved II / Critical)  →  -1 (Devolved I)  →  0 (Base)  →  +1 (Evolved I)  →  +2 (Evolved II / Ultimate)
 *
 * Evolution is determined locally after each battle. Winners evolve, losers devolve.
 * Evolution modifiers are appended to Odyssey prompts for visual transformation.
 */

import type { EvolutionLevel, PlayerState, BattleStats } from '@/types/game';

// ─── Evolution Level Metadata ────────────────────────────────────────

export interface EvolutionMeta {
  name: string;
  indicator: string;
  color: string;      // Tailwind-safe color class
  glowColor: string;  // CSS color for glow effects
}

const EVOLUTION_META: Record<number, EvolutionMeta> = {
  [-2]: { name: 'Critical',      indicator: '💀', color: 'text-red-900',    glowColor: 'rgba(127, 29, 29, 0.6)' },
  [-1]: { name: 'Weakened',      indicator: '🩸', color: 'text-red-400',    glowColor: 'rgba(248, 113, 113, 0.5)' },
  [0]:  { name: 'Base Form',     indicator: '⚔️', color: 'text-text-muted', glowColor: 'rgba(255, 255, 255, 0.2)' },
  [1]:  { name: 'Empowered',     indicator: '⚡', color: 'text-yellow-400', glowColor: 'rgba(250, 204, 21, 0.5)' },
  [2]:  { name: 'Transcendent',  indicator: '✨', color: 'text-yellow-300', glowColor: 'rgba(253, 224, 71, 0.7)' },
};

export function getEvolutionMeta(level: EvolutionLevel): EvolutionMeta {
  return EVOLUTION_META[level] ?? EVOLUTION_META[0];
}

// ─── Post-Battle Evolution Logic ─────────────────────────────────────

export interface EvolutionResult {
  winnerId: 1 | 2;
  loserId: 1 | 2;
  winnerNewLevel: EvolutionLevel;
  loserNewLevel: EvolutionLevel;
  winnerTrigger: string;
  loserTrigger: string;
  winnerChanged: boolean;
  loserChanged: boolean;
}

/**
 * Determine evolution changes after a battle ends.
 * Simple, deterministic rules — no API dependency.
 */
export function evaluatePostBattleEvolution(
  winner: PlayerState,
  loser: PlayerState,
  battleStats: BattleStats,
  turnCount: number,
): EvolutionResult {
  const winnerId = winner.id;
  const loserId = loser.id;

  let winnerNew = winner.evolutionLevel;
  let loserNew = loser.evolutionLevel;
  let winnerTrigger = '';
  let loserTrigger = '';

  const winnerKey = winnerId === 1 ? 'player1' : 'player2';
  const loserKey = loserId === 1 ? 'player1' : 'player2';

  // ── Winner Evolution ───────────────────────────────────────
  // Always evolve +1 on victory (max +2)
  if (winnerNew < 2) {
    winnerNew = (winnerNew + 1) as EvolutionLevel;
    winnerTrigger = 'Victory';
  }

  // Bonus: domination (won in ≤5 turns) → extra +1
  if (turnCount <= 5 && winnerNew < 2) {
    winnerNew = (winnerNew + 1) as EvolutionLevel;
    winnerTrigger = 'Domination victory';
  }

  // Bonus: flawless (won with ≥80 momentum) → guarantee +2
  if (winner.stats.momentum >= 80 && winnerNew < 2) {
    winnerNew = (winnerNew + 1) as EvolutionLevel;
    winnerTrigger = 'Flawless victory';
  }

  // ── Loser Devolution ──────────────────────────────────────
  // Always devolve -1 on loss (min -2)
  if (loserNew > -2) {
    loserNew = (loserNew - 1) as EvolutionLevel;
    loserTrigger = 'Defeat';
  }

  // Extra: crushed (lost with ≤10 momentum) → extra -1
  if (loser.stats.momentum <= 10 && loserNew > -2) {
    loserNew = (loserNew - 1) as EvolutionLevel;
    loserTrigger = 'Devastating defeat';
  }

  // Clamp to valid range
  winnerNew = Math.max(-2, Math.min(2, winnerNew)) as EvolutionLevel;
  loserNew = Math.max(-2, Math.min(2, loserNew)) as EvolutionLevel;

  return {
    winnerId,
    loserId,
    winnerNewLevel: winnerNew,
    loserNewLevel: loserNew,
    winnerTrigger: winnerTrigger || 'Victory',
    loserTrigger: loserTrigger || 'Defeat',
    winnerChanged: winnerNew !== winner.evolutionLevel,
    loserChanged: loserNew !== loser.evolutionLevel,
  };
}

// ─── Odyssey Prompt Modifiers ────────────────────────────────────────

const EVOLUTION_VISUAL_MODIFIERS: Record<number, string[]> = {
  [-2]: [
    'Severely wounded and barely holding together',
    'Surrounded by a dark, corrupted aura',
    'Colors are dull, gray, and fading',
    'Cracked and broken appearance',
  ],
  [-1]: [
    'Visibly damaged and weakened',
    'Faded, desaturated coloring',
    'Battle-worn with visible scars',
    'Diminished presence',
  ],
  [0]: [], // Base form — no modifiers
  [1]: [
    'Enhanced with a glowing energy aura',
    'Eyes crackling with power',
    'More vibrant and radiant colors',
    'Confident and empowered stance',
  ],
  [2]: [
    'Transcendent form radiating cosmic energy',
    'Surrounded by reality-bending light effects',
    'Blindingly brilliant colors and divine glow',
    'Massive, dominating presence with otherworldly features',
  ],
};

/**
 * Build an Odyssey prompt that incorporates evolution visual modifiers.
 */
export function buildEvolvedCharacterPrompt(
  baseCharacter: string,
  world: string,
  evolutionLevel: EvolutionLevel,
): string {
  const modifiers = EVOLUTION_VISUAL_MODIFIERS[evolutionLevel] ?? [];
  if (modifiers.length === 0) {
    // Base form — return standard prompt
    return `A cinematic portrait of ${baseCharacter}, in a ${world} environment.
The camera is steady with close-up framing.
Dramatic lighting with depth and atmosphere.
Fantasy art style with rich detail.
The character is in a powerful, confident pose.`;
  }

  const modifierText = modifiers.join('. ');
  return `A cinematic portrait of ${baseCharacter}, in a ${world} environment.
${modifierText}.
The camera is steady with close-up framing.
Dramatic lighting with depth and atmosphere.
Fantasy art style with rich detail.`;
}

/**
 * Build Odyssey battle prompt incorporating both players' evolution levels.
 */
export function buildEvolvedBattlePrompt(
  p1Character: string,
  p2Character: string,
  p1Level: EvolutionLevel,
  p2Level: EvolutionLevel,
  arena?: string,
): string {
  const arenaDesc = arena || 'a dramatic cinematic arena with atmospheric lighting';
  const p1Mods = EVOLUTION_VISUAL_MODIFIERS[p1Level] ?? [];
  const p2Mods = EVOLUTION_VISUAL_MODIFIERS[p2Level] ?? [];

  const p1Desc = p1Mods.length > 0 ? `${p1Character}. ${p1Mods[0]}` : p1Character;
  const p2Desc = p2Mods.length > 0 ? `${p2Character}. ${p2Mods[0]}` : p2Character;

  return `A dramatic battle arena: ${arenaDesc}.
On the left side: ${p1Desc}, in a battle-ready stance.
On the right side: ${p2Desc}, in a battle-ready stance.
They are facing each other, ready for battle.
Cinematic wide shot, dramatic lighting, tense atmosphere.
AAA game quality, rich detail, cinematic depth of field.`;
}

// ─── Transformation Narration ────────────────────────────────────────

const EVOLUTION_NARRATIONS: Record<string, string[]> = {
  'evolution-1': [
    '{name} channels newfound power and evolves!',
    'Energy surges through {name} — their form shifts, becoming more powerful!',
    '{name} ascends to a higher state!',
  ],
  'evolution-2': [
    '{name} TRANSCENDS to their ultimate form!',
    '{name} achieves PERFECTION — ultimate power unleashed!',
    '{name} ascends beyond mortal limits!',
  ],
  'devolution-1': [
    '{name} weakens, struggling to maintain form...',
    'The battle\'s toll shows on {name}\'s fading form...',
    '{name}\'s power wanes as defeat takes its toll...',
  ],
  'devolution-2': [
    '{name} is critically damaged — barely holding on!',
    '{name}\'s form crumbles under the weight of defeat!',
    '{name} is on the brink of collapse!',
  ],
};

export function generateTransformationNarration(
  characterName: string,
  fromLevel: EvolutionLevel,
  toLevel: EvolutionLevel,
): string {
  const direction = toLevel > fromLevel ? 'evolution' : 'devolution';
  const intensity = Math.abs(toLevel - fromLevel);
  const key = `${direction}-${Math.min(intensity, 2)}`;

  const templates = EVOLUTION_NARRATIONS[key] ?? [`${characterName} transforms!`];
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace('{name}', characterName);
}
