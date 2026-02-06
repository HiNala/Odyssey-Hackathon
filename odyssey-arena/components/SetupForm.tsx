'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { setupFormVariants } from '@/lib/animations';
import { sanitizeInput, validateCharacterInput, validateWorldInput } from '@/lib/sanitize';

interface SetupFormProps {
  playerId: 1 | 2;
  onSubmit: (character: string, world: string) => void;
  isProcessing: boolean;
}

const PRESETS = {
  characters: [
    'A cyberpunk samurai with glowing red eyes',
    'A fierce valkyrie in golden armor',
    'An ancient dragon mage wielding fire',
    'A shadow assassin made of living smoke',
  ],
  worlds: [
    'Neon-lit Tokyo streets at night, rain falling',
    'A floating crystal palace above the clouds',
    'An ancient volcanic arena with lava streams',
    'A frozen wasteland under aurora borealis',
  ],
};

export function SetupForm({ playerId, onSubmit, isProcessing }: SetupFormProps) {
  const [character, setCharacter] = useState('');
  const [world, setWorld] = useState('');
  const isP1 = playerId === 1;

  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (isProcessing) return;
    const charResult = validateCharacterInput(character);
    if (!charResult.valid) { setError(charResult.error || ''); return; }
    const worldResult = validateWorldInput(world);
    if (!worldResult.valid) { setError(worldResult.error || ''); return; }
    setError('');
    onSubmit(sanitizeInput(character, 200), sanitizeInput(world, 200));
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
          <p className="text-white/50 text-xs">Describe your character and world</p>
        </div>

        {/* Character Input */}
        <div className="space-y-1.5">
          <label className="text-white/60 text-xs font-medium">Character</label>
          <input
            type="text"
            value={character}
            onChange={(e) => setCharacter(e.target.value)}
            placeholder="e.g. A cyberpunk samurai with glowing eyes"
            maxLength={200}
            disabled={isProcessing}
            aria-label="Character description"
            className="w-full px-4 py-3 rounded-xl glass text-white text-sm placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
          />
          <div className="flex gap-1.5 flex-wrap">
            {PRESETS.characters.map((p) => (
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
            placeholder="e.g. A volcanic arena at dusk"
            maxLength={200}
            disabled={isProcessing}
            aria-label="World description"
            className="w-full px-4 py-3 rounded-xl glass text-white text-sm placeholder:text-white/30 outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
          />
          <div className="flex gap-1.5 flex-wrap">
            {PRESETS.worlds.map((p) => (
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
