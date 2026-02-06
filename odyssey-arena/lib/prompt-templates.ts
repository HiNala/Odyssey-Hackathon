/**
 * Prompt Template System
 * 3-layer architecture for consistent, high-quality Odyssey prompts.
 *
 * CRITICAL RULES (from Odyssey docs):
 * - Use STATE descriptions, not ACTION verbs (prevents looping)
 * - "is wearing armor" NOT "puts on armor"
 * - "has sword raised" NOT "raises sword"
 * - Be specific: subject, environment, camera, style, lighting
 */

// ─── Layer 1: Base World Prompts ────────────────────────────────────
// Sent once at startStream(). Establishes physics, camera, and lighting.

export const BASE_WORLD_PROMPT = `A cinematic third-person view of a dramatic battle arena.
Two distinct characters face each other across the arena.
The world follows consistent physical rules.
Motion, damage, and environmental changes persist over time.
The camera behaves like a modern video game, eye-level wide shot.
Lighting is dramatic and atmospheric with strong highlights and deep shadows.
Cinematic depth of field, rich detail, AAA game quality.`;

export const BASE_PORTRAIT_PROMPT = `A cinematic close-up portrait.
Dramatic lighting with depth and atmosphere.
The camera is steady with close-up framing.
Rich detail, cinematic quality, shallow depth of field.`;

// ─── Layer 2: Character Injection Prompts ───────────────────────────
// Sent via interact() immediately after stream starts.
// Defines WHO is in the scene and WHERE they are.

export function buildCharacterInjectionPrompt(
  player1Character: string,
  player2Character: string,
  arenaDescription: string
): string {
  return `Character A: ${player1Character}.
Character A is standing on the left side of the arena, facing right.

Character B: ${player2Character}.
Character B is standing on the right side of the arena, facing left.

Arena: ${arenaDescription}.

Both characters are in battle-ready stances.
The atmosphere is tense and cinematic.
Dramatic lighting casts long shadows across the arena floor.`;
}

export function buildCharacterPreviewPrompt(
  character: string,
  world: string
): string {
  return `A cinematic portrait of ${character}, in a ${world} environment.
The camera is steady with close-up framing.
Dramatic lighting with depth and atmosphere.
Fantasy art style with rich detail.
The character is in a powerful, confident pose.`;
}

// ─── Layer 3: Action Prompts ────────────────────────────────────────
// Sent via interact() during battle. Uses STATE descriptions.

export function buildActionPrompt(
  characterName: string,
  action: string,
  opponentName: string
): string {
  // Convert action verbs to state descriptions where possible
  const stateAction = convertToStateDescription(action);

  return `${characterName} ${stateAction}.
This action has visible force and impact on the scene.
${opponentName} is reacting realistically to the effect.
The environment is showing signs of the battle's intensity.
Dramatic cinematic camera angle captures the moment.`;
}

// ─── Pre-built Action Templates ─────────────────────────────────────
// These use state descriptions to prevent looping.

export const ACTION_TEMPLATES = {
  attack: (name: string) =>
    `${name} is striking with powerful force, body tensed mid-blow`,
  defend: (name: string) =>
    `${name} is in a defensive stance, arms raised to block`,
  special: (name: string) =>
    `${name} is channeling a signature power, glowing with energy`,
  taunt: (name: string) =>
    `${name} is in an intimidating pose, radiating confidence`,
  dodge: (name: string) =>
    `${name} is mid-dodge, body twisted to evade the attack`,
  heal: (name: string) =>
    `${name} is surrounded by a healing aura, recovering strength`,
};

// ─── Arena Presets ──────────────────────────────────────────────────

export const ARENA_PRESETS = [
  {
    name: 'Ancient Coliseum',
    description:
      'A ruined Roman coliseum at dusk with crumbling marble pillars, dust particles floating in golden light, dramatic shadows stretching across the sand floor',
  },
  {
    name: 'Neon City',
    description:
      'A rain-soaked cyberpunk city rooftop at night, neon signs reflecting off wet surfaces, holographic billboards in the background, steam rising from vents',
  },
  {
    name: 'Volcanic Arena',
    description:
      'An arena carved into an active volcano, rivers of lava flowing below, obsidian pillars rising from molten rock, ember particles floating upward, orange and red dramatic lighting',
  },
  {
    name: 'Frozen Tundra',
    description:
      'A vast frozen wasteland under northern lights, ice crystals glittering in the aurora, cracked ice floor revealing dark water below, cold blue atmospheric lighting',
  },
  {
    name: 'Floating Palace',
    description:
      'A floating crystal palace high above the clouds, translucent crystal pillars, sunset light refracting through prismatic surfaces, ethereal and magical atmosphere',
  },
];

// ─── Battle Start Prompt ────────────────────────────────────────────

export function buildBattleStartPrompt(
  p1Character: string,
  p2Character: string,
  arenaDescription?: string
): string {
  const arena =
    arenaDescription || 'a dramatic cinematic arena with atmospheric lighting';
  return `A dramatic battle arena: ${arena}.
On the left side: ${p1Character}, in a battle-ready stance.
On the right side: ${p2Character}, in a battle-ready stance.
They are facing each other, ready for battle.
Cinematic wide shot, dramatic lighting, tense atmosphere.
AAA game quality, rich detail, cinematic depth of field.`;
}

// ─── Utility: Convert action verbs to state descriptions ────────────

function convertToStateDescription(action: string): string {
  // Simple heuristic: if the action starts with common action verbs,
  // convert to state description form.
  const lower = action.toLowerCase().trim();

  const verbToState: Record<string, string> = {
    attacks: 'is attacking with',
    strikes: 'is striking with',
    punches: 'is delivering a powerful punch,',
    kicks: 'is delivering a powerful kick,',
    slashes: 'is mid-slash,',
    shoots: 'is firing,',
    casts: 'is channeling,',
    summons: 'has summoned',
    throws: 'has thrown',
    charges: 'is charging forward with',
    blocks: 'is blocking with',
    dodges: 'is evading,',
    heals: 'is surrounded by healing energy,',
    defends: 'is in a defensive stance,',
    taunts: 'is taunting the opponent,',
  };

  for (const [verb, state] of Object.entries(verbToState)) {
    if (lower.startsWith(verb)) {
      return state + action.slice(verb.length);
    }
  }

  // If it already uses state phrasing or is freeform, return as-is
  return action;
}
