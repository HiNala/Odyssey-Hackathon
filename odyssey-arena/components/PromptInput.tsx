'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { promptBarVariants } from '@/lib/animations';
import { sanitizeInput } from '@/lib/sanitize';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  activePlayer?: 1 | 2;
  placeholder?: string;
}

export function PromptInput({
  onSubmit,
  disabled = false,
  activePlayer = 1,
  placeholder = 'Describe your action...',
}: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    const sanitized = sanitizeInput(prompt);
    if (!sanitized || disabled) return;
    onSubmit(sanitized);
    setPrompt('');
  };

  const accentClass =
    activePlayer === 1
      ? 'ring-player1-accent/40 focus-within:ring-player1-accent/60'
      : 'ring-player2-accent/40 focus-within:ring-player2-accent/60';

  return (
    <motion.div
      variants={promptBarVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl mx-auto"
    >
      <div
        className={cn(
          'glass rounded-full p-2 flex items-center gap-2 ring-1 transition-all',
          accentClass,
          disabled && 'opacity-50',
        )}
      >
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold',
            activePlayer === 1
              ? 'bg-player1-accent/20 text-player1-accent'
              : 'bg-player2-accent/20 text-player2-accent',
          )}
        >
          P{activePlayer}
        </div>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          placeholder={placeholder}
          maxLength={500}
          disabled={disabled}
          aria-label="Enter battle action"
          className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-sm px-2 disabled:cursor-not-allowed"
        />

        <motion.button
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          onClick={handleSubmit}
          disabled={disabled || !prompt.trim()}
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all',
            'disabled:opacity-30 disabled:cursor-not-allowed',
            activePlayer === 1
              ? 'bg-player1-accent text-black hover:bg-player1-accent/80'
              : 'bg-player2-accent text-white hover:bg-player2-accent/80',
          )}
          aria-label="Submit action"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}
