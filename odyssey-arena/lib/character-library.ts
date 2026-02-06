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
  // ─── Fantasy ──────────────────────────────────────────
  {
    name: 'Solar Knight',
    character: 'A knight clad in molten gold armor wielding a plasma greatsword, radiating divine light and heat',
    world: 'An ancient volcanic arena with rivers of lava and obsidian pillars',
    category: 'fantasy',
  },
  {
    name: 'Void Mage',
    character: 'A hooded figure surrounded by floating runes and crackling purple energy, manipulating the fabric of space',
    world: 'A floating crystal palace above the clouds at sunset',
    category: 'fantasy',
  },
  {
    name: 'Shadow Assassin',
    character: 'A shadow assassin made of living smoke with twin obsidian daggers and glowing crimson eyes',
    world: 'A dark forest clearing with giant mushrooms glowing purple and swirling mist',
    category: 'fantasy',
  },
  {
    name: 'Storm Valkyrie',
    character: 'A fierce valkyrie in silver winged armor wielding a lightning spear crackling with electricity',
    world: 'A frozen tundra under shimmering aurora borealis with cracked ice and howling winds',
    category: 'fantasy',
  },

  // ─── Sci-Fi ───────────────────────────────────────────
  {
    name: 'Nexus-7',
    character: 'A sleek cybernetic warrior with glowing circuit patterns and adaptive plasma weapons across the body',
    world: 'A neon-lit cyberpunk rooftop at night with holographic billboards and rain',
    category: 'scifi',
  },
  {
    name: 'Stellar Ace',
    character: 'An elite pilot in a form-fitting exosuit with holographic HUD displays and energy shields',
    world: 'A shattered space station orbiting a dying star with debris floating in zero gravity',
    category: 'scifi',
  },

  // ─── Supernatural ─────────────────────────────────────
  {
    name: 'Infernus',
    character: 'A towering demon wreathed in living fire with obsidian horns and veins flowing with molten lava',
    world: 'A hellscape of crumbling basalt with rivers of fire and a blood-red sky',
    category: 'supernatural',
  },
  {
    name: 'Lumina',
    character: 'A radiant celestial being with crystalline wings that shimmer with prismatic light and a halo of stars',
    world: 'A celestial palace floating among the stars with crystalline floors and nebula skies',
    category: 'supernatural',
  },

  // ─── Modern ───────────────────────────────────────────
  {
    name: 'Iron Fist',
    character: 'A muscular martial artist with glowing tattoos and wrapped fists crackling with ki energy',
    world: 'A rain-soaked Tokyo street at night with neon signs reflecting off the wet pavement',
    category: 'modern',
  },
  {
    name: 'Ghost Protocol',
    character: 'A figure in sleek tactical tech gear surrounded by floating holographic code and data streams',
    world: 'A high-tech underground bunker with screens showing cascading data and blue ambient lighting',
    category: 'modern',
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
