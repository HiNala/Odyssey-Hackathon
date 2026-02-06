# Scoring & Stat System

## Overview

The scoring system in Odyssey Arena is intentionally abstract and flexible. Rather than implementing complex game balance rules, we use simple heuristics that reward creative, dramatic actions. The AI-powered world model handles the visual storytelling; our scoring system just needs to create a sense of tension and progress.

The key insight is that **balance doesn't matter for a hackathon demo**. What matters is that the stat bars move visibly, the momentum shifts back and forth, and the winner feels earned. We achieve this through simple keyword detection and controlled randomness.

---

## Stat Definitions

### Momentum (Primary Score)
- **Range:** 0-100
- **Starting Value:** 50 (neutral)
- **Win Condition:** Reach 100 (or opponent reaches 0)
- **Purpose:** The main "score" that determines victory

Momentum represents the overall flow of the battle. A player gaining momentum means they're winning; losing momentum means they're on the defensive. The momentum bar is the central focus of the HUD.

### Power (Offensive)
- **Range:** 0-100
- **Starting Value:** 50
- **Purpose:** Modifies how much momentum you gain from attacks

Higher power = bigger swings in your favor. Power can increase from successful aggressive actions.

### Defense (Defensive)
- **Range:** 0-100
- **Starting Value:** 50
- **Purpose:** Modifies how much momentum you lose from opponent's attacks

Higher defense = you lose less momentum when hit. Defense can increase from defensive actions.

### Energy (Resource)
- **Range:** 0-100
- **Starting Value:** 100
- **Purpose:** Limits how many actions you can take

Actions cost energy. Running out of energy limits your options. Energy regenerates slightly each turn.

---

## Stat Change Calculation

### Core Algorithm

```typescript
// src/lib/scoring.ts

import { ArenaState, PlayerStats, EventEntry } from '@/types/game';

interface StatChangeResult {
  player1: Partial<PlayerStats>;
  player2: Partial<PlayerStats>;
  impactType: EventEntry['impactType'];
  narrative: string;
}

/**
 * Calculate stat changes from a battle action
 */
export function calculateStatChanges(
  action: string,
  state: ArenaState
): StatChangeResult {
  const activeId = state.activePlayer;
  const activePlayer = state.players[activeId - 1];
  const opponent = state.players[activeId === 1 ? 1 : 0];

  // Analyze the action
  const analysis = analyzeAction(action);

  // Calculate base changes
  let baseMomentum = calculateBaseMomentum(analysis);
  let energyCost = calculateEnergyCost(analysis);

  // Apply modifiers
  const powerMod = 1 + (activePlayer.stats.power - 50) / 100; // 0.5x to 1.5x
  const defenseMod = 1 + (opponent.stats.defense - 50) / 100; // 0.5x to 1.5x

  // Final momentum change (attacker gains, defender loses less with defense)
  const attackerMomentum = Math.round(baseMomentum * powerMod);
  const defenderMomentum = Math.round(-baseMomentum * 0.6 / defenseMod);

  // Determine impact type
  const impactType = determineImpactType(attackerMomentum);

  // Generate narrative
  const narrative = generateNarrative(action, impactType);

  return {
    player1: activeId === 1 
      ? { momentum: attackerMomentum, energy: -energyCost }
      : { momentum: defenderMomentum },
    player2: activeId === 2
      ? { momentum: attackerMomentum, energy: -energyCost }
      : { momentum: defenderMomentum },
    impactType,
    narrative,
  };
}
```

### Action Analysis

```typescript
// src/lib/scoring.ts (continued)

interface ActionAnalysis {
  type: 'offensive' | 'defensive' | 'special' | 'neutral';
  intensity: 'weak' | 'normal' | 'strong' | 'devastating';
  keywords: string[];
}

/**
 * Analyze an action string for keywords and intent
 */
function analyzeAction(action: string): ActionAnalysis {
  const lower = action.toLowerCase();
  const words = lower.split(/\s+/);

  // Keyword categories
  const offensiveKeywords = ['attack', 'strike', 'blast', 'slash', 'crush', 'destroy', 'smash', 'unleash', 'fire', 'shoot'];
  const defensiveKeywords = ['defend', 'block', 'shield', 'protect', 'guard', 'counter', 'parry', 'evade', 'dodge'];
  const specialKeywords = ['ultimate', 'final', 'supreme', 'devastating', 'legendary', 'ancient', 'forbidden', 'divine'];
  const intensityBoosters = ['devastating', 'powerful', 'massive', 'incredible', 'overwhelming', 'unstoppable'];

  // Detect keywords
  const foundOffensive = offensiveKeywords.filter(k => lower.includes(k));
  const foundDefensive = defensiveKeywords.filter(k => lower.includes(k));
  const foundSpecial = specialKeywords.filter(k => lower.includes(k));
  const foundIntensity = intensityBoosters.filter(k => lower.includes(k));

  // Determine type
  let type: ActionAnalysis['type'] = 'neutral';
  if (foundOffensive.length > foundDefensive.length) type = 'offensive';
  else if (foundDefensive.length > 0) type = 'defensive';
  if (foundSpecial.length > 0) type = 'special';

  // Determine intensity
  let intensity: ActionAnalysis['intensity'] = 'normal';
  if (foundIntensity.length >= 2 || foundSpecial.length > 0) intensity = 'devastating';
  else if (foundIntensity.length === 1) intensity = 'strong';
  else if (words.length < 3) intensity = 'weak';

  return {
    type,
    intensity,
    keywords: [...foundOffensive, ...foundDefensive, ...foundSpecial, ...foundIntensity],
  };
}
```

### Base Momentum Calculation

```typescript
// src/lib/scoring.ts (continued)

/**
 * Calculate base momentum change from action analysis
 */
function calculateBaseMomentum(analysis: ActionAnalysis): number {
  // Base values by intensity
  const intensityValues = {
    weak: 3,
    normal: 7,
    strong: 12,
    devastating: 18,
  };

  let base = intensityValues[analysis.intensity];

  // Type modifiers
  switch (analysis.type) {
    case 'offensive':
      base *= 1.2;
      break;
    case 'defensive':
      base *= 0.6;
      break;
    case 'special':
      base *= 1.5;
      break;
  }

  // Add some randomness (±20%)
  const variance = base * 0.4 * (Math.random() - 0.5);
  
  return Math.round(base + variance);
}

/**
 * Calculate energy cost of an action
 */
function calculateEnergyCost(analysis: ActionAnalysis): number {
  const costByIntensity = {
    weak: 5,
    normal: 10,
    strong: 15,
    devastating: 25,
  };

  const base = costByIntensity[analysis.intensity];

  // Special moves cost more
  if (analysis.type === 'special') return Math.round(base * 1.5);
  // Defensive moves cost less
  if (analysis.type === 'defensive') return Math.round(base * 0.7);

  return base;
}
```

### Impact Type Determination

```typescript
// src/lib/scoring.ts (continued)

/**
 * Determine the impact type for UI effects
 */
function determineImpactType(momentum: number): EventEntry['impactType'] {
  if (momentum >= 15) return 'critical';
  if (momentum >= 10) return 'strong';
  if (momentum >= 5) return 'normal';
  if (momentum >= 2) return 'weak';
  return 'miss';
}
```

---

## Narrative Generation

Generate cinematic descriptions for the event log:

```typescript
// src/lib/scoring.ts (continued)

/**
 * Generate a narrative description of the action result
 */
function generateNarrative(action: string, impact: EventEntry['impactType']): string {
  const impactPhrases = {
    critical: [
      'A devastating blow lands!',
      'The attack connects with tremendous force!',
      'An overwhelming display of power!',
    ],
    strong: [
      'A solid hit!',
      'The strike finds its mark!',
      'A powerful connection!',
    ],
    normal: [
      'The action takes effect.',
      'A clean exchange.',
      'The move lands.',
    ],
    weak: [
      'A glancing blow.',
      'Minimal effect.',
      'A weak attempt.',
    ],
    miss: [
      'The attack misses!',
      'Evaded!',
      'No effect.',
    ],
  };

  const phrases = impactPhrases[impact];
  return phrases[Math.floor(Math.random() * phrases.length)];
}
```

---

## Energy Regeneration

At the end of each turn, players regenerate some energy:

```typescript
// src/lib/scoring.ts (continued)

/**
 * Calculate energy regeneration at turn end
 */
export function calculateEnergyRegen(): number {
  return 5; // Flat 5 energy per turn
}

/**
 * Apply end-of-turn effects
 */
export function applyTurnEndEffects(stats: PlayerStats): Partial<PlayerStats> {
  return {
    energy: Math.min(100, stats.energy + calculateEnergyRegen()),
  };
}
```

---

## Victory Condition Check

```typescript
// src/lib/scoring.ts (continued)

/**
 * Check if the game has ended
 */
export function checkVictory(state: ArenaState): 1 | 2 | null {
  const p1 = state.players[0];
  const p2 = state.players[1];

  // Player 1 wins if their momentum reaches 100 or P2's reaches 0
  if (p1.stats.momentum >= 100 || p2.stats.momentum <= 0) return 1;
  
  // Player 2 wins if their momentum reaches 100 or P1's reaches 0
  if (p2.stats.momentum >= 100 || p1.stats.momentum <= 0) return 2;

  return null;
}
```

---

## Example Action Resolutions

Here are some example actions and their calculated results:

### Aggressive Attack
**Input:** "Unleashes a devastating plasma blade strike"
- **Analysis:** Type: special, Intensity: devastating, Keywords: [unleash, strike, devastating]
- **Base Momentum:** 18 × 1.5 (special) = 27 ±4
- **Energy Cost:** 25 × 1.5 = 37
- **Result:** Attacker +25 momentum, Defender -15 momentum, Attacker -37 energy

### Defensive Move
**Input:** "Raises a shield to block the attack"
- **Analysis:** Type: defensive, Intensity: normal, Keywords: [shield, block]
- **Base Momentum:** 7 × 0.6 (defensive) = 4 ±1
- **Energy Cost:** 10 × 0.7 = 7
- **Result:** Attacker +4 momentum, Defender -2 momentum, Attacker -7 energy

### Weak Action
**Input:** "Waits"
- **Analysis:** Type: neutral, Intensity: weak, Keywords: []
- **Base Momentum:** 3 ±1
- **Energy Cost:** 5
- **Result:** Attacker +3 momentum, Defender -2 momentum, Attacker -5 energy

---

## UI Integration

### Momentum Bar Colors

```typescript
// Color coding for momentum bars
export function getMomentumColor(value: number): string {
  if (value >= 80) return 'text-green-400'; // Winning
  if (value >= 60) return 'text-emerald-300'; // Advantage
  if (value >= 40) return 'text-yellow-300'; // Neutral
  if (value >= 20) return 'text-orange-400'; // Disadvantage
  return 'text-red-500'; // Danger
}
```

### Impact Effect Classes

```typescript
// CSS classes for impact effects
export function getImpactEffectClass(impact: EventEntry['impactType']): string {
  switch (impact) {
    case 'critical':
      return 'animate-shake-hard text-red-500';
    case 'strong':
      return 'animate-shake text-orange-400';
    case 'normal':
      return 'animate-pulse text-yellow-300';
    case 'weak':
      return 'opacity-70 text-gray-400';
    case 'miss':
      return 'opacity-50 text-gray-500 line-through';
  }
}
```

---

## Checklist

- [ ] Create `src/lib/scoring.ts` with all scoring logic
- [ ] Implement `analyzeAction()` function
- [ ] Implement `calculateStatChanges()` function
- [ ] Implement `generateNarrative()` function
- [ ] Add victory condition checking
- [ ] Add energy regeneration system
- [ ] Test with various action strings
- [ ] Verify momentum can swing both ways
- [ ] Ensure games don't end too quickly or drag on
