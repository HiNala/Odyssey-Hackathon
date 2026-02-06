'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type ActionType = 'attack' | 'defend' | 'special' | 'taunt';

interface ActionConfig {
  type: ActionType;
  label: string;
  icon: string;
  prompt: string;
  description: string;
  energyCost: number;
}

const ACTIONS: ActionConfig[] = [
  {
    type: 'attack',
    label: 'Attack',
    icon: '\u2694\uFE0F',
    prompt: 'strikes with powerful force, landing a devastating blow',
    description: 'Deal damage',
    energyCost: 10,
  },
  {
    type: 'defend',
    label: 'Defend',
    icon: '\uD83D\uDEE1\uFE0F',
    prompt: 'braces into a defensive stance, shields raised and guard tightened',
    description: 'Boost defense',
    energyCost: 7,
  },
  {
    type: 'special',
    label: 'Special',
    icon: '\u2728',
    prompt: 'unleashes a devastating ultimate signature power attack with incredible force',
    description: 'High risk/reward',
    energyCost: 25,
  },
  {
    type: 'taunt',
    label: 'Taunt',
    icon: '\uD83D\uDE24',
    prompt: 'taunts the opponent with an intimidating display of dominance',
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
              whileHover={isDisabled ? {} : { scale: 1.05, y: -2 }}
              whileTap={isDisabled ? {} : { scale: 0.95 }}
              onClick={() => onAction(action.prompt)}
              disabled={isDisabled}
              aria-label={`${action.label}: ${action.description} (${action.energyCost} energy)`}
              className={cn(
                'flex-1 glass rounded-xl px-3 py-2.5 flex flex-col items-center gap-0.5 transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
                'disabled:opacity-30 disabled:cursor-not-allowed',
                !isDisabled && (isP1
                  ? 'hover:bg-player1-accent/15 hover:ring-1 hover:ring-player1-accent/30'
                  : 'hover:bg-player2-accent/15 hover:ring-1 hover:ring-player2-accent/30'),
              )}
            >
              <span className="text-lg leading-none">{action.icon}</span>
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
