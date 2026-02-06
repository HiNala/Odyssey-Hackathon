/**
 * Character Archetype Library
 * Pre-built character + world pairs for quick demo setup.
 * Organized by category for easy browsing.
 */

export interface CharacterArchetype {
  name: string;
  character: string;
  world: string;
  category: 'fantasy' | 'scifi' | 'supernatural' | 'modern';
}

export const CHARACTER_ARCHETYPES: CharacterArchetype[] = [
  // ─── Fire / Electric ──────────────────────────────────
  {
    name: 'Emberpup',
    character: 'A small adorable fire puppy with big sparkling eyes, a fluffy orange mane of flames, and a wagging ember tail',
    world: 'A cozy volcanic meadow with warm glowing flowers and tiny lava pools at sunset',
    category: 'fantasy',
  },
  {
    name: 'Sparkitty',
    character: 'A tiny electric kitten with bright yellow fur, rosy cheeks crackling with sparks, and a lightning-bolt shaped tail',
    world: 'A cheerful hilltop during a gentle thunderstorm with rainbow lightning in the sky',
    category: 'fantasy',
  },
  {
    name: 'Frostling',
    character: 'A chubby little ice penguin with crystal blue feathers, a tiny top hat of ice, and big round sparkly eyes',
    world: 'A sparkling frozen lake surrounded by candy-colored icebergs and soft falling snow',
    category: 'fantasy',
  },
  {
    name: 'Leafsprout',
    character: 'A small cheerful plant creature with a big flower on its head, leafy arms, and a happy smile with rosy cheeks',
    world: 'A magical enchanted garden with oversized flowers and glowing fireflies at dusk',
    category: 'fantasy',
  },

  // ─── Water / Psychic ──────────────────────────────────
  {
    name: 'Bubblefin',
    character: 'An adorable round water dragon hatchling with tiny wings, shimmering blue scales, and bubbles floating around it',
    world: 'A crystal clear underwater cove with colorful coral and shafts of golden sunlight',
    category: 'fantasy',
  },
  {
    name: 'Stardust',
    character: 'A fluffy purple cosmic fox with starry fur, a crescent moon on its forehead, and a galaxy-swirl tail',
    world: 'A dreamy floating island among the stars with glowing crystal trees and nebula skies',
    category: 'supernatural',
  },

  // ─── Ghost / Dark ─────────────────────────────────────
  {
    name: 'Spooklet',
    character: 'A tiny friendly ghost with a round body, big cute oval eyes, a playful grin, and a wispy purple tail',
    world: 'A whimsical haunted forest with jack-o-lanterns and glowing purple mushrooms at twilight',
    category: 'supernatural',
  },
  {
    name: 'Shadowpaw',
    character: 'A small mischievous shadow cat with glowing teal eyes, pointy ears, and a swirling dark misty body',
    world: 'A moonlit bamboo forest with floating lanterns and silver mist drifting between the trees',
    category: 'supernatural',
  },

  // ─── Steel / Rock ─────────────────────────────────────
  {
    name: 'Geomite',
    character: 'A small round rock creature with crystals growing from its back, stubby legs, and a wide happy grin',
    world: 'A glittering crystal cave with gemstone walls reflecting rainbow light everywhere',
    category: 'modern',
  },
  {
    name: 'Zappbot',
    character: 'A tiny adorable robot creature with antenna ears, glowing LED eyes shaped like hearts, and little hover jets',
    world: 'A colorful futuristic playground with neon lights, floating platforms, and holographic toys',
    category: 'scifi',
  },
];

/** Get archetypes by category */
export function getArchetypesByCategory(category: CharacterArchetype['category']): CharacterArchetype[] {
  return CHARACTER_ARCHETYPES.filter((a) => a.category === category);
}

/** Get a random archetype that doesn't match the excluded name */
export function getRandomArchetype(excludeName?: string): CharacterArchetype {
  const available = excludeName
    ? CHARACTER_ARCHETYPES.filter((a) => a.name !== excludeName)
    : CHARACTER_ARCHETYPES;
  return available[Math.floor(Math.random() * available.length)];
}
