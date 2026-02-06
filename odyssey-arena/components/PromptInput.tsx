'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { promptBarVariants } from '@/lib/animations';
import { sanitizeInput } from '@/lib/sanitize';
import { ArrowRight } from 'lucide-react';

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
  const isP1 = activePlayer === 1;

  const handleSubmit = () => {
    const sanitized = sanitizeInput(prompt);
    if (!sanitized || disabled) return;
    onSubmit(sanitized);
    setPrompt('');
  };

  return (
    <motion.div
      variants={promptBarVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-2xl mx-auto"
    >
      <div
        className={cn(
          'rounded-2xl p-1.5 flex items-center gap-2',
          'border border-border bg-surface transition-all duration-200',
          'focus-within:border-stroke-muted',
          disabled && 'opacity-40',
        )}
      >
        {/* Player indicator */}
        <div
          className={cn(
            'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold tracking-wider',
            isP1
              ? 'bg-player1-muted text-player1-accent border border-player1-accent/20'
              : 'bg-player2-muted text-player2-accent border border-player2-accent/20',
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
          className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted text-sm px-2 disabled:cursor-not-allowed"
        />

        <motion.button
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          onClick={handleSubmit}
          disabled={disabled || !prompt.trim()}
          className={cn(
            'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
            'disabled:opacity-20 disabled:cursor-not-allowed',
            isP1
              ? 'bg-player1-accent text-background hover:bg-player1-accent/80'
              : 'bg-player2-accent text-text-primary hover:bg-player2-accent/80',
          )}
          aria-label="Submit action"
        >
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  );
}
