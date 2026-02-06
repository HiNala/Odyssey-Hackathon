'use client'

import { cn } from '@/lib/utils'

type ActionButtonsProps = {
  side: 'left' | 'right'
  disabled?: boolean
  onAction: (action: string, type: 'attack' | 'defend' | 'special' | 'taunt') => void
}

export function ActionButtons({ side, disabled, onAction }: ActionButtonsProps) {
  const accentColor = side === 'left' ? 'player1-accent' : 'player2-accent'
  
  const actions = [
    { label: '⚔️ Attack', action: 'is striking with force', type: 'attack' as const },
    { label: '🛡 Defend', action: 'is bracing defensively', type: 'defend' as const },
    { label: '✨ Special', action: 'is unleashing signature power', type: 'special' as const },
    { label: '😤 Taunt', action: 'is taunting aggressively', type: 'taunt' as const },
  ]
  
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map(({ label, action, type }) => (
        <button
          key={type}
          onClick={() => onAction(action, type)}
          disabled={disabled}
          className={cn(
            "glass rounded-lg px-3 py-2 text-sm font-medium transition-all",
            "hover:bg-white/20 active:scale-95",
            `text-${accentColor}`,
            disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
