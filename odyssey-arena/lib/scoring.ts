/**
 * Scoring & Narrative System
 * Analyzes player actions and calculates stat changes + generates event text.
 */

import type { ArenaState, PlayerStats, EventEntry, ImpactType } from '@/types/game';

// ─── Action Analysis ────────────────────────────────────────────────

interface ActionAnalysis {
  type: 'offensive' | 'defensive' | 'special' | 'neutral';
  intensity: 'weak' | 'normal' | 'strong' | 'devastating';
  keywords: string[];
}

const OFFENSIVE = ['attack', 'strike', 'blast', 'slash', 'crush', 'destroy', 'smash', 'unleash', 'fire', 'shoot', 'punch', 'kick', 'throws', 'launches', 'hits'];
const DEFENSIVE = ['defend', 'block', 'shield', 'protect', 'guard', 'counter', 'parry', 'evade', 'dodge', 'heal', 'recover'];
const SPECIAL = ['ultimate', 'final', 'supreme', 'devastating', 'legendary', 'ancient', 'forbidden', 'divine', 'cosmic', 'infinite'];
const INTENSITY = ['devastating', 'powerful', 'massive', 'incredible', 'overwhelming', 'unstoppable', 'furious', 'raging'];

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

  return { type, intensity, keywords: [...foundOff, ...foundDef, ...foundSpe, ...foundInt] };
}

// ─── Momentum Calculation ───────────────────────────────────────────

function calcBaseMomentum(analysis: ActionAnalysis): number {
  const base = { weak: 4, normal: 8, strong: 13, devastating: 20 }[analysis.intensity];
  const typeMod = { offensive: 1.2, defensive: 0.5, special: 1.5, neutral: 1 }[analysis.type];
  const variance = base * 0.4 * (Math.random() - 0.5);
  return Math.round(base * typeMod + variance);
}

function calcEnergyCost(analysis: ActionAnalysis): number {
  const base = { weak: 5, normal: 10, strong: 15, devastating: 25 }[analysis.intensity];
  if (analysis.type === 'special') return Math.round(base * 1.5);
  if (analysis.type === 'defensive') return Math.round(base * 0.7);
  return base;
}

// ─── Impact Type ────────────────────────────────────────────────────

function determineImpact(momentum: number): ImpactType {
  if (momentum >= 18) return 'critical';
  if (momentum >= 12) return 'strong';
  if (momentum >= 6) return 'normal';
  if (momentum >= 3) return 'weak';
  return 'miss';
}

// ─── Narrative Generation ───────────────────────────────────────────

const NARRATIVES: Record<ImpactType, string[]> = {
  critical: [
    'A devastating blow lands with thunderous force!',
    'An overwhelming display of power shakes the arena!',
    'The attack connects with earth-shattering intensity!',
    'A legendary strike! The crowd goes wild!',
  ],
  strong: [
    'A solid hit finds its mark!',
    'The strike lands with impressive force!',
    'A powerful connection sends shockwaves!',
  ],
  normal: [
    'The action takes effect.',
    'A clean exchange of blows.',
    'The move connects.',
  ],
  weak: [
    'A glancing blow — barely any effect.',
    'Minimal impact from the attempt.',
    'A weak effort, easily absorbed.',
  ],
  miss: [
    'The attack misses entirely!',
    'Evaded with ease!',
    'No effect — the opponent is unfazed.',
  ],
};

function generateNarrative(impact: ImpactType): string {
  const phrases = NARRATIVES[impact];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

// ─── Public API ─────────────────────────────────────────────────────

export interface StatChangeResult {
  player1: Partial<PlayerStats>;
  player2: Partial<PlayerStats>;
  impactType: ImpactType;
  narrative: string;
}

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

  const attackerMomentum = Math.round(baseMomentum * powerMod);
  const defenderMomentum = Math.round((-baseMomentum * 0.6) / defMod);

  const impactType = determineImpact(attackerMomentum);
  const narrative = generateNarrative(impactType);

  const result: StatChangeResult = { player1: {}, player2: {}, impactType, narrative };

  if (activeId === 1) {
    result.player1 = { momentum: attackerMomentum, energy: -energyCost };
    result.player2 = { momentum: defenderMomentum };
  } else {
    result.player2 = { momentum: attackerMomentum, energy: -energyCost };
    result.player1 = { momentum: defenderMomentum };
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
  if (value >= 80) return 'text-green-400';
  if (value >= 60) return 'text-emerald-300';
  if (value >= 40) return 'text-yellow-300';
  if (value >= 20) return 'text-orange-400';
  return 'text-red-500';
}
