import type { Character, GameEvent, StatDelta } from './types'

/**
 * Calculate damage based on attacker power vs defender defense
 * This is fake but feels convincing and game-like
 */
export function calculateDamage(
  attacker: Character,
  defender: Character,
  actionType: 'attack' | 'special' = 'attack'
): number {
  const baseDamage = actionType === 'special' ? 25 : 15
  const powerMultiplier = attacker.stats.power / 100
  const defenseMultiplier = defender.stats.defense / 100
  
  const rawDamage = baseDamage * powerMultiplier
  const mitigatedDamage = rawDamage * (2 - defenseMultiplier)
  
  // Add randomness (±20%) for variety
  const variance = 0.8 + Math.random() * 0.4
  
  return Math.round(Math.max(5, mitigatedDamage * variance))
}

/**
 * Create a game event from an action
 */
export function createGameEvent(
  actor: 1 | 2,
  actorName: string,
  action: string,
  impact: GameEvent['impact']
): GameEvent {
  return {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    actor,
    actorName,
    action,
    narration: generateNarration(actorName, action, impact),
    impact,
  }
}

/**
 * Generate narration text for event log
 */
function generateNarration(
  actorName: string,
  action: string,
  impact: GameEvent['impact']
): string {
  const player1Damage = Math.abs(impact.player1Delta?.power ?? 0)
  const player2Damage = Math.abs(impact.player2Delta?.power ?? 0)
  
  if (player1Damage > 0) {
    return `${actorName}'s ${action} deals ${player1Damage} damage!`
  } else if (player2Damage > 0) {
    return `${actorName}'s ${action} deals ${player2Damage} damage!`
  } else if (impact.player1Delta?.defense || impact.player2Delta?.defense) {
    const defenseGain = Math.abs(impact.player1Delta?.defense ?? impact.player2Delta?.defense ?? 0)
    return `${actorName} ${action} - defense increased by ${defenseGain}`
  } else if (impact.player1Delta?.energy || impact.player2Delta?.energy) {
    const energyChange = impact.player1Delta?.energy ?? impact.player2Delta?.energy ?? 0
    if (energyChange > 0) {
      return `${actorName} ${action} - energy surges by ${energyChange}`
    } else {
      return `${actorName} ${action} - energy reduced by ${Math.abs(energyChange)}`
    }
  } else {
    return `${actorName} ${action}`
  }
}

/**
 * Apply stat delta to character (immutable update)
 */
export function applyStatDelta(
  character: Character,
  delta: StatDelta | undefined
): Character {
  if (!delta) return character
  
  return {
    ...character,
    stats: {
      power: Math.max(0, Math.min(100, character.stats.power + (delta.power ?? 0))),
      defense: Math.max(0, Math.min(100, character.stats.defense + (delta.defense ?? 0))),
      energy: Math.max(0, Math.min(100, character.stats.energy + (delta.energy ?? 0))),
    },
  }
}

/**
 * Check if battle is over based on power (HP) levels
 */
export function checkBattleEnd(
  player1: Character,
  player2: Character
): { ended: boolean; winner: 1 | 2 | null } {
  const p1Defeated = player1.stats.power <= 0
  const p2Defeated = player2.stats.power <= 0
  
  if (p1Defeated && p2Defeated) {
    return { ended: true, winner: null } // Draw
  } else if (p1Defeated) {
    return { ended: true, winner: 2 }
  } else if (p2Defeated) {
    return { ended: true, winner: 1 }
  }
  
  return { ended: false, winner: null }
}

/**
 * Create initial character with default stats
 */
export function createCharacter(
  name: string,
  archetype: string,
  description: string
): Character {
  return {
    name,
    archetype,
    description,
    stats: {
      power: 100, // Acts as HP
      defense: 100,
      energy: 100,
    },
  }
}
