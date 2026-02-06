'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { setupFormVariants } from '@/lib/animations';
import { sanitizeInput, validateCharacterInput, validateWorldInput } from '@/lib/sanitize';
import { getTestScenario, saveTestScenario } from '@/lib/storage';

interface SetupFormProps {
  playerId: 1 | 2;
  onSubmit: (character: string, world: string, image?: File) => void;
  isProcessing: boolean;
  /** Characters already selected by the other player (to discourage duplicates) */
  usedCharacter?: string;
}

// ── Two distinct preset pools so P1 and P2 get different suggestions ──

const P1_CHARACTER_PRESETS = [
  'A cyberpunk samurai with glowing red eyes and a plasma katana',
  'A fierce valkyrie in golden winged armor wielding a lightning spear',
  'An ancient dragon mage wreathed in blue dragonfire',
  'A shadow assassin made of living smoke with twin daggers',
];

const P2_CHARACTER_PRESETS = [
  'A neon-punk hacker with holographic armor and a data blade',
  'A celestial guardian clad in crystal armor radiating starlight',
  'A volcanic titan forged from obsidian with molten fists',
  'A spectral knight bound in ethereal chains with a ghostly greatsword',
];

const P1_WORLD_PRESETS = [
  'Neon-lit Tokyo streets at night, rain falling on holograms',
  'A floating crystal palace above the clouds at sunset',
  'An ancient volcanic arena with rivers of lava',
  'A frozen wasteland under shimmering aurora borealis',
];

const P2_WORLD_PRESETS = [
  'A cyberpunk rooftop with holographic billboards and neon rain',
  'A sunken temple deep underwater with bioluminescent coral',
  'A dark forest clearing with giant mushrooms glowing purple',
  'A shattered space station orbiting a dying star',
];

// Image-to-video requirements from Odyssey SDK:
// Max size: 25MB, Formats: JPEG, PNG, WebP, GIF, BMP, HEIC, HEIF, AVIF
const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/gif,image/bmp,image/heic,image/heif,image/avif';
const MAX_IMAGE_SIZE = 25 * 1024 * 1024; // 25MB

export function SetupForm({ playerId, onSubmit, isProcessing, usedCharacter }: SetupFormProps) {
  const [character, setCharacter] = useState('');
  const [world, setWorld] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [testScenario, setTestScenario] = useState<ReturnType<typeof getTestScenario>>(null);
  const isP1 = playerId === 1;

  // ── Reset form state when playerId changes (P1 → P2 transition) ──
  useEffect(() => {
    setCharacter('');
    setWorld('');
    setImage(null);
    setImagePreview(null);
    setError('');
    setTestScenario(getTestScenario());
  }, [playerId]);

  // Handle image selection with validation
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImage(null);
      setImagePreview(null);
      return;
    }
    
    // Validate file size (25MB max per Odyssey SDK docs)
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image must be under 25MB');
      return;
    }
    
    setError('');
    setImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const characterPresets = isP1 ? P1_CHARACTER_PRESETS : P2_CHARACTER_PRESETS;
  const worldPresets = isP1 ? P1_WORLD_PRESETS : P2_WORLD_PRESETS;

  const handleSubmit = () => {
    if (isProcessing) return;
    const charResult = validateCharacterInput(character);
    if (!charResult.valid) { setError(charResult.error || ''); return; }
    const worldResult = validateWorldInput(world);
    if (!worldResult.valid) { setError(worldResult.error || ''); return; }

    // Warn if character matches the other player's
    if (usedCharacter && character.trim().toLowerCase() === usedCharacter.trim().toLowerCase()) {
      setError('Choose a different character than Player 1!');
      return;
    }

    setError('');
    const sanitizedCharacter = sanitizeInput(character, 200);
    const sanitizedWorld = sanitizeInput(world, 200);

    // Save test scenario so it can be rerun quickly
    const existing = getTestScenario();
    const nextScenario = {
      player1: isP1
        ? { character: sanitizedCharacter, world: sanitizedWorld }
        : (existing?.player1 ?? { character: '', world: '' }),
      player2: !isP1
        ? { character: sanitizedCharacter, world: sanitizedWorld }
        : (existing?.player2 ?? { character: '', world: '' }),
      savedAt: Date.now(),
    };
    saveTestScenario(nextScenario);
    setTestScenario(nextScenario);

    // Pass image if provided (enables image-to-video mode)
    onSubmit(sanitizedCharacter, sanitizedWorld, image || undefined);
  };

  const handleLoadTestScenario = () => {
    const scenario = getTestScenario();
    if (!scenario) return;
    const target = isP1 ? scenario.player1 : scenario.player2;
    if (target.character) setCharacter(target.character);
    if (target.world) setWorld(target.world);
    setTestScenario(scenario);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`setup-${playerId}`}
        variants={setupFormVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-md mx-auto space-y-4"
      >
        <div className="text-center mb-2">
          <h3
            className={cn(
              'text-lg font-semibold',
              isP1 ? 'text-player1-accent' : 'text-player2-accent'
            )}
          >
            Player {playerId} Setup
          </h3>
          <p className="text-white/50 text-xs">
            {isP1 ? 'Create your champion and battleground' : 'Choose a challenger to face Player 1'}
          </p>
          {testScenario && (isP1 ? testScenario.player1.character : testScenario.player2.character) && (
            <button
              type="button"
              onClick={handleLoadTestScenario}
              className="mt-2 text-[10px] px-3 py-1 rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80 transition"
              disabled={isProcessing}
            >
              Load saved test setup
            </button>
          )}
        </div>

        {/* Character Input */}
        <div className="space-y-1.5">
          <label className="text-white/60 text-xs font-medium">Character</label>
          <input
            type="text"
            value={character}
            onChange={(e) => setCharacter(e.target.value)}
            placeholder={isP1 ? 'e.g. A cyberpunk samurai with glowing eyes' : 'e.g. A volcanic titan with molten fists'}
            maxLength={200}
            disabled={isProcessing}
            aria-label="Character description"
            className="w-full px-4 py-3 rounded-xl glass text-white text-sm placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
          />
          <div className="flex gap-1.5 flex-wrap">
            {characterPresets.map((p) => (
              <button
                key={p}
                onClick={() => setCharacter(p)}
                disabled={isProcessing}
                className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white/70 transition truncate max-w-[160px] disabled:opacity-40"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* World Input */}
        <div className="space-y-1.5">
          <label className="text-white/60 text-xs font-medium">World / Arena</label>
          <input
            type="text"
            value={world}
            onChange={(e) => setWorld(e.target.value)}
            placeholder={isP1 ? 'e.g. A volcanic arena at dusk' : 'e.g. A sunken temple underwater'}
            maxLength={200}
            disabled={isProcessing}
            aria-label="World description"
            className="w-full px-4 py-3 rounded-xl glass text-white text-sm placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
          />
          <div className="flex gap-1.5 flex-wrap">
            {worldPresets.map((p) => (
              <button
                key={p}
                onClick={() => setWorld(p)}
                disabled={isProcessing}
                className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white/70 transition truncate max-w-[160px] disabled:opacity-40"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Reference Image (Optional - enables image-to-video) */}
        <div className="space-y-1.5">
          <label className="text-white/60 text-xs font-medium">
            Reference Image <span className="text-white/40">(optional, enables image-to-video)</span>
          </label>
          {imagePreview ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/40">
              <img
                src={imagePreview}
                alt="Reference preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={clearImage}
                disabled={isProcessing}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition disabled:opacity-40"
                aria-label="Remove image"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className={cn(
              'flex flex-col items-center justify-center w-full py-4 rounded-xl glass cursor-pointer transition',
              'hover:bg-white/10 border-2 border-dashed border-white/20 hover:border-white/30',
              isProcessing && 'opacity-50 cursor-not-allowed'
            )}>
              <svg className="w-6 h-6 text-white/40 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-white/40 text-xs">Click to upload image</span>
              <span className="text-white/30 text-[10px]">JPEG, PNG, WebP, GIF (max 25MB)</span>
              <input
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                onChange={handleImageChange}
                disabled={isProcessing}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Validation error */}
        {error && (
          <p className="text-red-400 text-xs text-center">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!character.trim() || !world.trim() || isProcessing}
          className={cn(
            'w-full py-3 rounded-xl font-semibold text-sm transition-all',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            isP1
              ? 'bg-player1-accent hover:bg-player1-accent/80 text-black'
              : 'bg-player2-accent hover:bg-player2-accent/80 text-white'
          )}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating world...
            </span>
          ) : (
            `Lock In Player ${playerId}`
          )}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
