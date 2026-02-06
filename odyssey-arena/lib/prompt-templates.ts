import type { Character, World } from './types'

/**
 * Base world prompt - establishes physics and camera behavior
 * Sent once at startStream()
 */
export const BASE_WORLD_PROMPT = `A cinematic third-person view of a battle arena.
Two distinct characters face each other.
The world follows consistent physical rules.
Motion, damage, and environmental changes persist over time.
The camera behaves like a modern video game with dynamic angles.
Lighting and atmosphere remain coherent throughout.
High quality, dramatic, and visually striking.`

/**
 * Build character injection prompt
 * Sent immediately after stream starts via interact()
 */
export function buildCharacterInjectionPrompt(
  player1: Character,
  player2: Character,
  arena: World
): string {
  return `Character A: ${player1.description}
Character A is standing on the left side of the arena.
Character A has the archetype of ${player1.archetype}.

Character B: ${player2.description}
Character B is standing on the right side of the arena.
Character B has the archetype of ${player2.archetype}.

Arena: ${arena.description}
The environment is ${arena.environment}.

Both characters are ready for battle.
The atmosphere is tense and cinematic.
Epic lighting and dramatic composition.`
}

/**
 * Build action prompt with state descriptions (NOT action verbs)
 * This is critical for Odyssey - use "is doing" not "does"
 */
export function buildActionPrompt(
  character: Character,
  action: string,
  opponent: Character
): string {
  return `${character.name} ${action}.
This action has visible force and impact.
${opponent.name} reacts realistically to the action.
The environment responds naturally.
The camera captures the dramatic moment.`
}

/**
 * Pre-built action templates for quick actions
 */
export const ACTION_TEMPLATES = {
  attack: (char: Character) => `${char.name} is striking with powerful force`,
  defend: (char: Character) => `${char.name} is adopting a defensive stance with raised guard`,
  special: (char: Character) => `${char.name} is channeling their signature power`,
  taunt: (char: Character) => `${char.name} is intimidating the opponent with aggressive posturing`,
}

/**
 * Default arena templates for quick setup
 */
export const ARENA_TEMPLATES = {
  coliseum: {
    name: 'Ancient Coliseum',
    description: 'A ruined Roman coliseum at golden hour with crumbling stone pillars',
    environment: 'atmospheric with dramatic lighting and ancient architecture',
  },
  volcanic: {
    name: 'Volcanic Ruins',
    description: 'A cracked obsidian platform surrounded by flowing lava',
    environment: 'dangerous with glowing molten rock and ash in the air',
  },
  frozen: {
    name: 'Frozen Tundra',
    description: 'An icy wasteland with towering glaciers and northern lights',
    environment: 'cold and ethereal with mystical aurora effects',
  },
  cyberpunk: {
    name: 'Neon District',
    description: 'A rain-soaked rooftop in a cyberpunk city at night',
    environment: 'futuristic with neon lights reflecting off wet surfaces',
  },
  mystic: {
    name: 'Mystic Forest',
    description: 'An enchanted forest clearing with bioluminescent plants',
    environment: 'magical with glowing flora and mystical atmosphere',
  },
}
