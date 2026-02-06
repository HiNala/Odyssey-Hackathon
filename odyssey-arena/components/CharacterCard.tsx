import { cn } from '@/lib/utils'
import type { Character } from '@/lib/types'

type CharacterCardProps = {
  character: Character
  side: 'left' | 'right'
  isActive?: boolean
}

export function CharacterCard({ character, side, isActive }: CharacterCardProps) {
  const accentColor = side === 'left' ? 'player1-accent' : 'player2-accent'

  return (
    <div className={cn(
      "glass rounded-xl p-4 space-y-3 transition-all duration-300",
      isActive && "ring-2 ring-white/50 shadow-lg"
    )}>
      {/* Name + Archetype */}
      <div>
        <div className={cn(
          "font-bold text-lg",
          `text-${accentColor}`
        )}>
          {character.name}
        </div>
        <div className="text-white/60 text-sm">
          {character.archetype}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <StatBar 
          label="Power" 
          value={character.stats.power} 
          color={accentColor}
          isHP
        />
        <StatBar 
          label="Defense" 
          value={character.stats.defense} 
          color={accentColor} 
        />
        <StatBar 
          label="Energy" 
          value={character.stats.energy} 
          color={accentColor} 
        />
      </div>
    </div>
  )
}

function StatBar({ 
  label, 
  value, 
  color,
  isHP = false 
}: { 
  label: string
  value: number
  color: string
  isHP?: boolean
}) {
  // Color based on value
  const getBarColor = () => {
    if (!isHP) return `bg-${color}`
    if (value > 66) return 'bg-green-500'
    if (value > 33) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div>
      <div className="flex justify-between text-xs text-white/60 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn(
            getBarColor(),
            "rounded-full h-full transition-all duration-500 ease-out"
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
