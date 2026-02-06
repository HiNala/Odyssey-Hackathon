'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { setupFormVariants } from '@/lib/animations';
import { sanitizeInput, validateCharacterInput, validateWorldInput } from '@/lib/sanitize';
import { getTestScenario, saveTestScenario } from '@/lib/storage';
import { ImagePlus, X, Loader2, RotateCcw, Zap } from 'lucide-react';
import { CHARACTER_ARCHETYPES } from '@/lib/character-library';

interface SetupFormProps {
  playerId: 1 | 2;
  onSubmit: (character: string, world: string, image?: File) => void;
  isProcessing: boolean;
  usedCharacter?: string;
}

const P1_CHARACTER_PRESETS = [
  'A small adorable fire puppy with big sparkling eyes and a fluffy orange mane of flames',
  'A tiny electric kitten with bright yellow fur and rosy cheeks crackling with sparks',
  'An adorable round water dragon hatchling with shimmering blue scales and tiny wings',
  'A fluffy purple cosmic fox with starry fur and a galaxy-swirl tail',
];

const P2_CHARACTER_PRESETS = [
  'A chubby little ice penguin with crystal blue feathers and a tiny top hat of ice',
  'A small cheerful plant creature with a big flower on its head and leafy arms',
  'A tiny friendly ghost with big cute oval eyes and a wispy purple tail',
  'A tiny adorable robot creature with antenna ears and glowing heart-shaped LED eyes',
];

const P1_WORLD_PRESETS = [
  'A cozy volcanic meadow with warm glowing flowers and tiny lava pools at sunset',
  'A cheerful hilltop during a gentle thunderstorm with rainbow lightning',
  'A crystal clear underwater cove with colorful coral and golden sunlight',
  'A dreamy floating island among the stars with glowing crystal trees',
];

const P2_WORLD_PRESETS = [
  'A sparkling frozen lake surrounded by candy-colored icebergs and soft snow',
  'A magical enchanted garden with oversized flowers and glowing fireflies',
  'A whimsical haunted forest with jack-o-lanterns and purple mushrooms',
  'A colorful futuristic playground with neon lights and floating platforms',
];

// Default auto-fill values so judges can instantly hit "Lock In"
const P1_DEFAULT_CHARACTER = 'A small adorable fire puppy with big sparkling eyes, a fluffy orange mane of flames, and a wagging ember tail';
const P1_DEFAULT_WORLD = 'A cozy volcanic meadow with warm glowing flowers and tiny lava pools at sunset';
const P2_DEFAULT_CHARACTER = 'A chubby little ice penguin with crystal blue feathers, a tiny top hat of ice, and big round sparkly eyes';
const P2_DEFAULT_WORLD = 'A sparkling frozen lake surrounded by candy-colored icebergs and soft falling snow';

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
    // Auto-fill with cute defaults so judges can hit "Lock In" immediately
    setCharacter(isP1 ? P1_DEFAULT_CHARACTER : P2_DEFAULT_CHARACTER);
    setWorld(isP1 ? P1_DEFAULT_WORLD : P2_DEFAULT_WORLD);
    setImage(null);
    setImagePreview(null);
    setError('');
    setTestScenario(getTestScenario());
  }, [playerId, isP1]);

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
                className="mt-1 inline-flex items-center gap-1.5 text-[10px] px-3 py-1 rounded-lg border border-border bg-surface-raised text-text-muted hover:text-text-secondary hover:border-stroke-muted transition"
                disabled={isProcessing}
              >
                <RotateCcw className="w-3 h-3" />
                Load saved setup
              </button>
            )}
          </div>

          {/* Quick-select archetypes */}
          <div className="space-y-2">
            <label className="text-text-secondary text-xs font-medium flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              Quick Select
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {CHARACTER_ARCHETYPES
                .filter((a) => !usedCharacter || a.character !== usedCharacter)
                .slice(0, 6)
                .map((archetype) => (
                  <button
                    key={archetype.name}
                    onClick={() => {
                      setCharacter(archetype.character);
                      setWorld(archetype.world);
                    }}
                    disabled={isProcessing}
                    className={cn(
                      'text-[10px] px-2.5 py-1.5 rounded-lg border transition',
                      'border-border bg-surface-raised hover:border-white/15',
                      'disabled:opacity-30',
                      isP1 ? 'text-player1-accent/80 hover:bg-player1-muted' : 'text-player2-accent/80 hover:bg-player2-muted'
                    )}
                  >
                    {archetype.name}
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
              placeholder={isP1 ? 'e.g. A cute fire puppy with sparkling eyes' : 'e.g. A chubby ice penguin with a tiny top hat'}
              maxLength={200}
              disabled={isProcessing}
              aria-label="Character description"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-raised text-text-primary text-sm placeholder:text-text-muted outline-none focus:border-stroke-muted transition disabled:opacity-40"
            />
            <div className="flex gap-1.5 flex-wrap">
              {characterPresets.map((p) => (
                <button
                  key={p}
                  onClick={() => setCharacter(p)}
                  disabled={isProcessing}
                  className="text-[10px] px-2.5 py-1 rounded-lg border border-border bg-surface-raised text-text-muted hover:text-text-secondary hover:border-stroke-muted transition truncate max-w-[160px] disabled:opacity-30"
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
              placeholder={isP1 ? 'e.g. A cozy volcanic meadow at sunset' : 'e.g. A sparkling frozen lake with candy icebergs'}
              maxLength={200}
              disabled={isProcessing}
              aria-label="World description"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface-raised text-text-primary text-sm placeholder:text-text-muted outline-none focus:border-stroke-muted transition disabled:opacity-40"
            />
            <div className="flex gap-1.5 flex-wrap">
              {worldPresets.map((p) => (
                <button
                  key={p}
                  onClick={() => setWorld(p)}
                  disabled={isProcessing}
                  className="text-[10px] px-2.5 py-1 rounded-lg border border-border bg-surface-raised text-text-muted hover:text-text-secondary hover:border-stroke-muted transition truncate max-w-[160px] disabled:opacity-30"
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
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-background border border-border">
                <img
                  src={imagePreview}
                  alt="Reference preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={clearImage}
                  disabled={isProcessing}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-overlay hover:bg-overlay text-text-secondary hover:text-text-primary transition disabled:opacity-40"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className={cn(
                'flex flex-col items-center justify-center w-full py-5 rounded-xl cursor-pointer transition',
                'border border-dashed border-border hover:border-stroke-muted bg-surface-raised hover:bg-fill-subtle',
                isProcessing && 'opacity-40 cursor-not-allowed'
              )}>
                <ImagePlus className="w-5 h-5 text-text-muted mb-1.5" strokeWidth={1.5} />
                <span className="text-text-muted text-xs">Click to upload</span>
                <span className="text-text-muted/60 text-[10px]">JPEG, PNG, WebP, GIF (max 25MB)</span>
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
            <div className="rounded-xl border border-danger/20 bg-danger/5 px-3 py-2">
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
                ? 'bg-player1-accent hover:bg-player1-accent/85 text-background'
                : 'bg-player2-accent hover:bg-player2-accent/85 text-text-primary'
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
