'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { setupFormVariants } from '@/lib/animations';
import { sanitizeInput, validateCharacterInput, validateWorldInput } from '@/lib/sanitize';
import { getTestScenario, saveTestScenario } from '@/lib/storage';
import { CHARACTER_ARCHETYPES, type CharacterArchetype } from '@/lib/character-library';
import { ImagePlus, X, Loader2, RotateCcw, Zap } from 'lucide-react';

interface SetupFormProps {
  playerId: 1 | 2;
  onSubmit: (character: string, world: string, image?: File) => void;
  isProcessing: boolean;
  usedCharacter?: string;
}

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

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/gif,image/bmp,image/heic,image/heif,image/avif';
const MAX_IMAGE_SIZE = 25 * 1024 * 1024;

export function SetupForm({ playerId, onSubmit, isProcessing, usedCharacter }: SetupFormProps) {
  const [character, setCharacter] = useState('');
  const [world, setWorld] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [testScenario, setTestScenario] = useState<ReturnType<typeof getTestScenario>>(null);
  const isP1 = playerId === 1;

  useEffect(() => {
    setCharacter('');
    setWorld('');
    setImage(null);
    setImagePreview(null);
    setError('');
    setTestScenario(getTestScenario());
  }, [playerId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImage(null);
      setImagePreview(null);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image must be under 25MB');
      return;
    }
    setError('');
    setImage(file);
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
    if (usedCharacter && character.trim().toLowerCase() === usedCharacter.trim().toLowerCase()) {
      setError('Choose a different character than Player 1');
      return;
    }
    setError('');
    const sanitizedCharacter = sanitizeInput(character, 200);
    const sanitizedWorld = sanitizeInput(world, 200);
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
        className="w-full max-w-md mx-auto"
      >
        {/* Card container */}
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-5">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                isP1 ? 'bg-player1-accent' : 'bg-player2-accent'
              )} />
              <h3 className={cn(
                'text-base font-semibold tracking-tight',
                isP1 ? 'text-player1-accent' : 'text-player2-accent'
              )}>
                Player {playerId}
              </h3>
            </div>
            <p className="text-text-muted text-xs">
              {isP1 ? 'Create your champion and battleground' : 'Choose a challenger to face Player 1'}
            </p>
            {testScenario && (isP1 ? testScenario.player1.character : testScenario.player2.character) && (
              <button
                type="button"
                onClick={handleLoadTestScenario}
                className="mt-1 inline-flex items-center gap-1.5 text-[10px] px-3 py-1 rounded-md border border-border bg-surface-raised text-text-muted hover:text-text-secondary hover:border-white/10 transition"
                disabled={isProcessing}
              >
                <RotateCcw className="w-3 h-3" />
                Load saved setup
              </button>
            )}
          </div>

          {/* Quick-Select Archetypes */}
          <div className="space-y-2">
            <label className="text-text-secondary text-xs font-medium flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              Quick Select
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {CHARACTER_ARCHETYPES
                .filter((_: CharacterArchetype, i: number) => isP1 ? i % 2 === 0 : i % 2 === 1)
                .slice(0, 4)
                .map((arch: CharacterArchetype) => (
                  <button
                    key={arch.name}
                    onClick={() => {
                      setCharacter(arch.character);
                      setWorld(arch.world);
                    }}
                    disabled={isProcessing || (usedCharacter === arch.character)}
                    className={cn(
                      'text-[10px] px-2.5 py-1.5 rounded-lg border transition-all font-medium',
                      'disabled:opacity-30 disabled:cursor-not-allowed',
                      isP1
                        ? 'border-player1-accent/20 bg-player1-muted text-player1-accent hover:bg-player1-accent/15 hover:border-player1-accent/30'
                        : 'border-player2-accent/20 bg-player2-muted text-player2-accent hover:bg-player2-accent/15 hover:border-player2-accent/30'
                    )}
                  >
                    {arch.name}
                  </button>
                ))}
            </div>
          </div>

          {/* Character input */}
          <div className="space-y-2">
            <label className="text-text-secondary text-xs font-medium">Character</label>
            <input
              type="text"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              placeholder={isP1 ? 'e.g. A cyberpunk samurai with glowing eyes' : 'e.g. A volcanic titan with molten fists'}
              maxLength={200}
              disabled={isProcessing}
              aria-label="Character description"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-raised text-white text-sm placeholder:text-text-muted outline-none focus:border-white/15 transition disabled:opacity-40"
            />
            <div className="flex gap-1.5 flex-wrap">
              {characterPresets.map((p) => (
                <button
                  key={p}
                  onClick={() => setCharacter(p)}
                  disabled={isProcessing}
                  className="text-[10px] px-2.5 py-1 rounded-md border border-border bg-surface-raised text-text-muted hover:text-text-secondary hover:border-white/10 transition truncate max-w-[160px] disabled:opacity-30"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* World input */}
          <div className="space-y-2">
            <label className="text-text-secondary text-xs font-medium">World / Arena</label>
            <input
              type="text"
              value={world}
              onChange={(e) => setWorld(e.target.value)}
              placeholder={isP1 ? 'e.g. A volcanic arena at dusk' : 'e.g. A sunken temple underwater'}
              maxLength={200}
              disabled={isProcessing}
              aria-label="World description"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-raised text-white text-sm placeholder:text-text-muted outline-none focus:border-white/15 transition disabled:opacity-40"
            />
            <div className="flex gap-1.5 flex-wrap">
              {worldPresets.map((p) => (
                <button
                  key={p}
                  onClick={() => setWorld(p)}
                  disabled={isProcessing}
                  className="text-[10px] px-2.5 py-1 rounded-md border border-border bg-surface-raised text-text-muted hover:text-text-secondary hover:border-white/10 transition truncate max-w-[160px] disabled:opacity-30"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Reference image */}
          <div className="space-y-2">
            <label className="text-text-secondary text-xs font-medium">
              Reference Image <span className="text-text-muted">(optional)</span>
            </label>
            {imagePreview ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/40 border border-border">
                <img
                  src={imagePreview}
                  alt="Reference preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={clearImage}
                  disabled={isProcessing}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white/70 hover:text-white transition disabled:opacity-40"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className={cn(
                'flex flex-col items-center justify-center w-full py-5 rounded-xl cursor-pointer transition',
                'border border-dashed border-border hover:border-white/15 bg-surface-raised hover:bg-white/[0.03]',
                isProcessing && 'opacity-40 cursor-not-allowed'
              )}>
                <ImagePlus className="w-5 h-5 text-text-muted mb-1.5" strokeWidth={1.5} />
                <span className="text-text-muted text-xs">Click to upload</span>
                <span className="text-text-muted/50 text-[10px]">JPEG, PNG, WebP, GIF (max 25MB)</span>
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

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2">
              <p className="text-danger/80 text-xs">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!character.trim() || !world.trim() || isProcessing}
            className={cn(
              'w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200',
              'disabled:opacity-30 disabled:cursor-not-allowed',
              isP1
                ? 'bg-player1-accent hover:bg-player1-accent/85 text-black'
                : 'bg-player2-accent hover:bg-player2-accent/85 text-white'
            )}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating world...
              </span>
            ) : (
              `Lock In Player ${playerId}`
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
