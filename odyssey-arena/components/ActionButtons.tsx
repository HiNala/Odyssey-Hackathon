'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type ActionType = 'attack' | 'defend' | 'special' | 'taunt';

interface ActionConfig {
  type: ActionType;
  label: string;
  /**
   * Prompt sent to scoring engine for stat calculation.
   * Uses action verbs which are fine for the text-based scoring system.
   */
  prompt: string;
  description: string;
  energyCost: number;
}

/**
 * Quick-action presets for battle.
 *
 * IMPORTANT: These prompts go to the scoring engine (text analysis + Gemini),
 * NOT directly to Odyssey. The `buildActionPrompt()` in prompt-templates.ts
 * converts them to state descriptions before sending to Odyssey's interact().
 */
const ACTIONS: ActionConfig[] = [
  {
    type: 'attack',
    label: 'Attack',
    prompt: 'strikes with a powerful devastating blow, landing a crushing hit',
    description: 'Deal damage',
    energyCost: 10,
  },
  {
    type: 'defend',
    label: 'Defend',
    prompt: 'defends with a fortified shield stance, guard tightened and absorbing impact',
    description: 'Boost defense',
    energyCost: 7,
  },
  {
    type: 'special',
    label: 'Special',
    prompt: 'unleashes a devastating ultimate signature power with incredible cosmic force',
    description: 'High risk/reward',
    energyCost: 25,
  },
  {
    type: 'taunt',
    label: 'Taunt',
    prompt: 'taunts the opponent with an intimidating display of overwhelming dominance',
    description: 'Drain energy',
    energyCost: 5,
  },
];

interface ActionButtonsProps {
  onAction: (prompt: string) => void;
  disabled?: boolean;
  activePlayer: 1 | 2;
  energy: number;
}

export function ActionButtons({
  onAction,
  disabled = false,
  activePlayer,
  energy,
}: ActionButtonsProps) {
  const isP1 = activePlayer === 1;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        {ACTIONS.map((action) => {
          const canAfford = energy >= action.energyCost;
          const isDisabled = disabled || !canAfford;

          return (
            <motion.button
              key={action.type}
              whileHover={isDisabled ? {} : { scale: 1.02 }}
              whileTap={isDisabled ? {} : { scale: 0.95 }}
              onClick={() => onAction(action.prompt)}
              disabled={isDisabled}
              aria-label={`${action.label}: ${action.description} (${action.energyCost} energy)`}
              className={cn(
                'flex-1 glass rounded-xl px-3 py-2.5 min-h-[72px] flex flex-col items-center gap-0.5 transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
                'disabled:opacity-30 disabled:cursor-not-allowed',
                !isDisabled && (isP1
                  ? 'hover:bg-player1-accent/15 hover:ring-1 hover:ring-player1-accent/30'
                  : 'hover:bg-player2-accent/15 hover:ring-1 hover:ring-player2-accent/30'),
              )}
            >
              <ActionIcon type={action.type} accent={isP1 ? 'player1' : 'player2'} />
              <span
                className={cn(
                  'text-[11px] font-semibold',
                  isP1 ? 'text-player1-accent' : 'text-player2-accent'
                )}
              >
                {action.label}
              </span>
              <span className="text-[9px] text-white/40">{action.energyCost} NRG</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function ActionIcon({
  type,
  accent,
}: {
  type: ActionType;
  accent: 'player1' | 'player2';
}) {
  const color =
    accent === 'player1' ? 'text-player1-accent/80' : 'text-player2-accent/80';

  if (type === 'attack') {
    return (
      <svg className={cn('w-5 h-5', color)} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeWidth={1.6} strokeLinecap="round" d="M4 20L20 4" />
        <path strokeWidth={1.6} strokeLinecap="round" d="M8 4h4l8 8v4" />
        <path strokeWidth={1.6} strokeLinecap="round" d="M4 16l4 4" />
      </svg>
    );
  }

  if (type === 'defend') {
    return (
      <svg className={cn('w-5 h-5', color)} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeWidth={1.6} strokeLinecap="round" d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3Z" />
      </svg>
    );
  }

  if (type === 'special') {
    return (
      <svg className={cn('w-5 h-5', color)} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeWidth={1.6} strokeLinecap="round" d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
      </svg>
    );
  }

  return (
    <svg className={cn('w-5 h-5', color)} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth={1.6} strokeLinecap="round" d="M5 12c2 2 4 3 7 3s5-1 7-3" />
      <path strokeWidth={1.6} strokeLinecap="round" d="M8 9c.5-1 1.5-1.5 2.5-1.5S12.5 8 13 9" />
      <path strokeWidth={1.6} strokeLinecap="round" d="M6 7l2-2" />
      <path strokeWidth={1.6} strokeLinecap="round" d="M18 7l-2-2" />
    </svg>
  );
}
