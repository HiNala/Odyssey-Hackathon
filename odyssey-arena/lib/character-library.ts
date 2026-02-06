/**
 * Character Archetype Library
 * Pre-built character templates for fast demo setup.
 * Each archetype includes a vivid character and matching world description.
 */

export interface CharacterArchetype {
  name: string;
  character: string;
  world: string;
  category: 'fantasy' | 'scifi' | 'supernatural' | 'modern';
}

export const CHARACTER_ARCHETYPES: CharacterArchetype[] = [
  // ── Fantasy ─────────────────────────────────────
  {
    name: 'Solar Knight',
    character: 'A knight clad in molten gold armor wielding a plasma greatsword, radiating divine light and heat',
    world: 'An ancient coliseum at dusk with crumbling marble pillars and golden light streaming through dust',
    category: 'fantasy',
  },
  {
    name: 'Void Mage',
    character: 'A hooded figure surrounded by floating runes and crackling purple energy, manipulating the fabric of space',
    world: 'A floating crystal palace above the clouds at sunset, translucent pillars refracting prismatic light',
    category: 'fantasy',
  },
  {
    name: 'Shadow Rogue',
    character: 'A shadow assassin made of living smoke with twin daggers that drip venom and glowing violet eyes',
    world: 'A dark enchanted forest with giant mushrooms glowing purple and mist curling between ancient trees',
    category: 'fantasy',
  },
  {
    name: 'Dragon Sage',
    character: 'An ancient dragon mage wreathed in blue dragonfire, scales shimmering with arcane runes',
    world: 'A volcanic arena carved into a mountain with rivers of lava and obsidian pillars',
    category: 'fantasy',
  },

  // ── Sci-Fi ──────────────────────────────────────
  {
    name: 'Nexus-7',
    character: 'A sleek cybernetic warrior with glowing circuit patterns and adaptive plasma weapons',
    world: 'A rain-soaked cyberpunk city rooftop at night with neon signs and holographic billboards',
    category: 'scifi',
  },
  {
    name: 'Stellar Ace',
    character: 'An elite pilot in a form-fitting exosuit with holographic displays and energy shields',
    world: 'A shattered space station orbiting a dying star, debris floating in zero gravity',
    category: 'scifi',
  },

  // ── Supernatural ────────────────────────────────
  {
    name: 'Infernus',
    character: 'A towering demon wreathed in living fire with obsidian horns and molten veins pulsing with magma',
    world: 'A volcanic arena with rivers of lava flowing below, ember particles floating upward',
    category: 'supernatural',
  },
  {
    name: 'Lumina',
    character: 'A radiant celestial guardian with crystalline wings that shimmer with prismatic starlight',
    world: 'A vast frozen wasteland under northern lights, ice crystals glittering in the aurora',
    category: 'supernatural',
  },

  // ── Modern ──────────────────────────────────────
  {
    name: 'Iron Fist',
    character: 'A muscular martial artist with glowing tattoos and wrapped fists crackling with energy',
    world: 'A underground fight cage lit by harsh overhead lights with concrete walls and steel beams',
    category: 'modern',
  },
  {
    name: 'Ghost Protocol',
    character: 'A figure in sleek tech gear surrounded by floating holographic code and data streams',
    world: 'A cyberpunk rooftop with holographic billboards and neon rain reflecting off wet surfaces',
    category: 'modern',
  },
];

/** Get archetypes filtered by category */
export function getArchetypesByCategory(category: CharacterArchetype['category']): CharacterArchetype[] {
  return CHARACTER_ARCHETYPES.filter((a) => a.category === category);
}

/** Get a random archetype, optionally excluding certain names */
export function getRandomArchetype(exclude?: string): CharacterArchetype {
  const available = exclude
    ? CHARACTER_ARCHETYPES.filter((a) => a.name !== exclude)
    : CHARACTER_ARCHETYPES;
  return available[Math.floor(Math.random() * available.length)];
}
