/**
 * Scoring & Narrative System
 * Analyzes player actions and calculates stat changes + generates event text.
 *
 * Action types and their effects:
 * - Offensive: gains momentum, costs energy, reduces opponent momentum
 * - Defensive: gains defense, small energy cost, minor momentum
 * - Special:   high momentum gain, high energy cost, high risk/reward
 * - Neutral:   moderate momentum, moderate energy cost
 *
 * Stats:
 * - momentum: 0–100, primary win condition (reach 100 or opponent reaches 0)
 * - power:    offensive modifier (higher = more momentum gained)
 * - defense:  defensive modifier (higher = less momentum lost)
 * - energy:   resource pool (depletes with actions, some recovery on defend)
 */

import type { ArenaState, PlayerStats, EventEntry, ImpactType } from '@/types/game';

// ─── Gemini AI Integration ─────────────────────────────────────────────

interface GeminiResponse {
  narrative: string;
  analysis: {
    type: 'offensive' | 'defensive' | 'special' | 'neutral';
    intensity: 'weak' | 'normal' | 'strong' | 'devastating';
    impactType: ImpactType;
  };
  statChanges: {
    player1: Partial<PlayerStats>;
    player2: Partial<PlayerStats>;
  };
}

/**
 * Call Gemini API for AI-powered narrative and stat analysis.
 * Falls back to local analysis if API fails.
 */
async function callGeminiAPI(
  action: string,
  state: ArenaState
): Promise<GeminiResponse | null> {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        context: {
          players: state.players,
          activePlayer: state.activePlayer,
        },
      }),
    });

    if (!response.ok) {
      console.warn('Gemini API returned error:', response.status);
      return null;
    }

    const data: GeminiResponse = await response.json();
    return data;
  } catch (error) {
    console.warn('Gemini API call failed, using local fallback:', error);
    return null;
  }
}

// ─── Action Analysis ────────────────────────────────────────────────

interface ActionAnalysis {
  type: 'offensive' | 'defensive' | 'special' | 'neutral';
  intensity: 'weak' | 'normal' | 'strong' | 'devastating';
  keywords: string[];
}

const OFFENSIVE = [
  'attack', 'strike', 'blast', 'slash', 'crush', 'destroy', 'smash',
  'unleash', 'fire', 'shoot', 'punch', 'kick', 'throws', 'launches',
  'hits', 'charge', 'swing', 'cleave', 'pierce', 'slam',
];
const DEFENSIVE = [
  'defend', 'block', 'shield', 'protect', 'guard', 'counter', 'parry',
  'evade', 'dodge', 'heal', 'recover', 'brace', 'fortif', 'absorb',
];
const SPECIAL = [
  'ultimate', 'final', 'supreme', 'devastating', 'legendary', 'ancient',
  'forbidden', 'divine', 'cosmic', 'infinite', 'signature', 'unleashes',
];
const INTENSITY = [
  'devastating', 'powerful', 'massive', 'incredible', 'overwhelming',
  'unstoppable', 'furious', 'raging', 'tremendous', 'cataclysmic',
];

function analyzeAction(action: string): ActionAnalysis {
  const lower = action.toLowerCase();
  const words = lower.split(/\s+/);

  const foundOff = OFFENSIVE.filter((k) => lower.includes(k));
  const foundDef = DEFENSIVE.filter((k) => lower.includes(k));
  const foundSpe = SPECIAL.filter((k) => lower.includes(k));
  const foundInt = INTENSITY.filter((k) => lower.includes(k));

  let type: ActionAnalysis['type'] = 'neutral';
  if (foundOff.length > foundDef.length) type = 'offensive';
  else if (foundDef.length > 0) type = 'defensive';
  if (foundSpe.length > 0) type = 'special';

  let intensity: ActionAnalysis['intensity'] = 'normal';
  if (foundInt.length >= 2 || foundSpe.length > 0) intensity = 'devastating';
  else if (foundInt.length === 1 || foundOff.length >= 2) intensity = 'strong';
  else if (words.length < 3) intensity = 'weak';

  return {
    type,
    intensity,
    keywords: [...foundOff, ...foundDef, ...foundSpe, ...foundInt],
  };
}

// ─── Momentum Calculation ───────────────────────────────────────────

function calcBaseMomentum(analysis: ActionAnalysis): number {
  const base = { weak: 4, normal: 8, strong: 13, devastating: 20 }[
    analysis.intensity
  ];
  const typeMod = { offensive: 1.2, defensive: 0.3, special: 1.5, neutral: 1 }[
    analysis.type
  ];
  const variance = base * 0.4 * (Math.random() - 0.5);
  return Math.round(base * typeMod + variance);
}

function calcEnergyCost(analysis: ActionAnalysis): number {
  const base = { weak: 5, normal: 10, strong: 15, devastating: 25 }[
    analysis.intensity
  ];
  if (analysis.type === 'special') return Math.round(base * 1.5);
  if (analysis.type === 'defensive') return Math.round(base * 0.5);
  return base;
}

// ─── Impact Type ────────────────────────────────────────────────────

function determineImpact(momentum: number, type: ActionAnalysis['type']): ImpactType {
  // Defensive actions have their own impact scale
  if (type === 'defensive') {
    if (momentum >= 6) return 'strong';
    if (momentum >= 3) return 'normal';
    return 'weak';
  }
  if (momentum >= 18) return 'critical';
  if (momentum >= 12) return 'strong';
  if (momentum >= 6) return 'normal';
  if (momentum >= 3) return 'weak';
  return 'miss';
}

// ─── Narrative Generation ───────────────────────────────────────────

const NARRATIVES: Record<string, string[]> = {
  'offensive-critical': [
    'A devastating blow lands with thunderous force!',
    'An overwhelming display of power shakes the arena!',
    'The attack connects with earth-shattering intensity!',
    'A legendary strike! The crowd goes wild!',
  ],
  'offensive-strong': [
    'A solid hit finds its mark!',
    'The strike lands with impressive force!',
    'A powerful connection sends shockwaves!',
  ],
  'offensive-normal': [
    'The action takes effect.',
    'A clean exchange of blows.',
    'The move connects.',
  ],
  'offensive-weak': [
    'A glancing blow — barely any effect.',
    'Minimal impact from the attempt.',
    'A weak effort, easily absorbed.',
  ],
  'offensive-miss': [
    'The attack misses entirely!',
    'Evaded with ease!',
    'No effect — the opponent is unfazed.',
  ],
  'defensive-strong': [
    'An impenetrable defense! Armor gleams with power!',
    'Shields raised — an unbreakable wall of defense!',
    'A masterful defensive stance, practically invulnerable!',
  ],
  'defensive-normal': [
    'A solid defensive stance is established.',
    'Guard raised — ready for anything.',
    'Defense fortified, energy recovers.',
  ],
  'defensive-weak': [
    'A hasty guard — better than nothing.',
    'Minimal defensive positioning.',
    'A brief moment of recovery.',
  ],
  'special-critical': [
    'ULTIMATE POWER UNLEASHED! The arena trembles!',
    'A divine strike of unimaginable force!',
    'The signature move connects — absolutely devastating!',
  ],
  'special-strong': [
    'Signature power surges — a powerful display!',
    'Ancient energy erupts with fearsome intensity!',
  ],
  'special-normal': [
    'Special power activates, channeling energy.',
    'A focused burst of signature ability.',
  ],
  'special-weak': [
    'The special ability fizzles... not enough energy!',
    'Power surges but dissipates before connecting.',
  ],
  'special-miss': [
    'The ultimate attack whiffs completely!',
    'All that energy... wasted!',
  ],
  'neutral-normal': [
    'An unconventional move takes effect.',
    'Something unexpected happens in the arena.',
  ],
  'neutral-weak': [
    'A confused gesture... not much happens.',
    'The arena barely registers the action.',
  ],
};

function generateNarrative(
  type: ActionAnalysis['type'],
  impact: ImpactType
): string {
  const key = `${type}-${impact}`;
  const phrases = NARRATIVES[key] || NARRATIVES['neutral-normal']!;
  return phrases[Math.floor(Math.random() * phrases.length)];
}

// ─── Public API ─────────────────────────────────────────────────────

export interface StatChangeResult {
  player1: Partial<PlayerStats>;
  player2: Partial<PlayerStats>;
  impactType: ImpactType;
  narrative: string;
}

/**
 * Enhanced version with Gemini AI integration.
 * Attempts to use AI for narrative and analysis, falls back to local if needed.
 */
export async function calculateStatChangesWithAI(
  action: string,
  state: ArenaState
): Promise<StatChangeResult> {
  // Try Gemini AI first
  const geminiResult = await callGeminiAPI(action, state);
  
  if (geminiResult) {
    // Use Gemini's intelligent analysis
    console.log('✨ Using Gemini AI narrative');
    return {
      player1: geminiResult.statChanges.player1 || {},
      player2: geminiResult.statChanges.player2 || {},
      impactType: geminiResult.analysis.impactType,
      narrative: geminiResult.narrative,
    };
  }

  // Fallback to local analysis
  console.log('⚡ Using local fallback');
  return calculateStatChanges(action, state);
}

/**
 * Local stat calculation (fallback when Gemini unavailable).
 * Kept synchronous for backwards compatibility.
 */
export function calculateStatChanges(
  action: string,
  state: ArenaState
): StatChangeResult {
  const activeId = state.activePlayer;
  const active = state.players[activeId - 1];
  const opponent = state.players[activeId === 1 ? 1 : 0];

  const analysis = analyzeAction(action);
  const baseMomentum = calcBaseMomentum(analysis);
  const energyCost = calcEnergyCost(analysis);

  // Apply power/defense modifiers
  const powerMod = 1 + (active.stats.power - 50) / 100;
  const defMod = 1 + (opponent.stats.defense - 50) / 100;

  const result: StatChangeResult = {
    player1: {},
    player2: {},
    impactType: 'normal',
    narrative: '',
  };

  if (analysis.type === 'defensive') {
    // ── Defensive Action ────────────────────────────────────
    // Gains defense, recovers some energy, small momentum gain
    const defenseBoost = Math.round(5 + baseMomentum * 0.8);
    const energyRecovery = Math.round(8 + Math.random() * 7);
    const momentumGain = Math.round(baseMomentum * 0.3);

    const impactType = determineImpact(defenseBoost, 'defensive');
    result.impactType = impactType;
    result.narrative = generateNarrative('defensive', impactType);

    if (activeId === 1) {
      result.player1 = {
        momentum: momentumGain,
        defense: defenseBoost,
        energy: energyRecovery - energyCost, // net energy gain
      };
    } else {
      result.player2 = {
        momentum: momentumGain,
        defense: defenseBoost,
        energy: energyRecovery - energyCost,
      };
    }
  } else {
    // ── Offensive / Special / Neutral Action ────────────────
    const attackerMomentum = Math.round(baseMomentum * powerMod);
    const defenderMomentum = Math.round((-baseMomentum * 0.6) / defMod);

    // Special actions drain opponent defense
    const defPenalty =
      analysis.type === 'special' ? Math.round(-3 - Math.random() * 5) : 0;

    const impactType = determineImpact(attackerMomentum, analysis.type);
    result.impactType = impactType;
    result.narrative = generateNarrative(analysis.type, impactType);

    if (activeId === 1) {
      result.player1 = {
        momentum: attackerMomentum,
        energy: -energyCost,
      };
      result.player2 = {
        momentum: defenderMomentum,
        defense: defPenalty || undefined,
      };
    } else {
      result.player2 = {
        momentum: attackerMomentum,
        energy: -energyCost,
      };
      result.player1 = {
        momentum: defenderMomentum,
        defense: defPenalty || undefined,
      };
    }
  }

  return result;
}

export function createEventEntry(
  player: 1 | 2,
  action: string,
  changes: StatChangeResult
): EventEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    player,
    action,
    result: changes.narrative,
    statChanges: { player1: changes.player1, player2: changes.player2 },
    impactType: changes.impactType,
  };
}

/** Momentum color for UI */
export function getMomentumColor(value: number): string {
  if (value >= 80) return 'text-green-600';
  if (value >= 60) return 'text-emerald-600';
  if (value >= 40) return 'text-yellow-600';
  if (value >= 20) return 'text-orange-600';
  return 'text-red-600';
}
