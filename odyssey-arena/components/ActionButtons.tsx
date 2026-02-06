'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sword, Shield, Sparkles, Volume2 } from 'lucide-react';

export type ActionType = 'attack' | 'defend' | 'special' | 'taunt';

interface ActionConfig {
  type: ActionType;
  label: string;
  prompt: string;
  description: string;
  energyCost: number;
  icon: typeof Sword;
}

const ACTIONS: ActionConfig[] = [
  {
    type: 'attack',
    label: 'Attack',
    prompt: 'strikes with a powerful devastating blow, landing a crushing hit',
    description: 'Deal damage',
    energyCost: 10,
    icon: Sword,
  },
  {
    type: 'defend',
    label: 'Defend',
    prompt: 'defends with a fortified shield stance, guard tightened and absorbing impact',
    description: 'Boost defense',
    energyCost: 7,
    icon: Shield,
  },
  {
    type: 'special',
    label: 'Special',
    prompt: 'unleashes a devastating ultimate signature power with incredible cosmic force',
    description: 'High risk/reward',
    energyCost: 25,
    icon: Sparkles,
  },
  {
    type: 'taunt',
    label: 'Taunt',
    prompt: 'taunts the opponent with an intimidating display of overwhelming dominance',
    description: 'Drain energy',
    energyCost: 5,
    icon: Volume2,
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
          const Icon = action.icon;

          return (
            <motion.button
              key={action.type}
              whileHover={isDisabled ? {} : { scale: 1.02 }}
              whileTap={isDisabled ? {} : { scale: 0.97 }}
              onClick={() => onAction(action.prompt)}
              disabled={isDisabled}
              aria-label={`${action.label}: ${action.description} (${action.energyCost} energy)`}
              className={cn(
                'flex-1 rounded-xl px-3 py-2.5 min-h-[68px]',
                'flex flex-col items-center gap-1',
                'border border-border bg-surface-raised',
                'transition-all duration-200',
                'disabled:opacity-25 disabled:cursor-not-allowed',
                !isDisabled && isP1 && 'hover:border-player1-accent/30 hover:bg-player1-muted',
                !isDisabled && !isP1 && 'hover:border-player2-accent/30 hover:bg-player2-muted',
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4',
                  isP1 ? 'text-player1-accent/70' : 'text-player2-accent/70'
                )}
                strokeWidth={1.5}
              />
              <span
                className={cn(
                  'text-[11px] font-semibold',
                  isP1 ? 'text-player1-accent/90' : 'text-player2-accent/90'
                )}
              >
                {action.label}
              </span>
              <span className="text-[9px] text-text-muted">{action.energyCost} NRG</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
