'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { createCharacter } from '@/lib/game-logic'
import type { Character } from '@/lib/types'

type CharacterFormProps = {
  side: 'left' | 'right'
  onSave: (character: Character) => void
  initialCharacter?: Character | null
}

export function CharacterForm({ side, onSave, initialCharacter }: CharacterFormProps) {
  const [name, setName] = useState(initialCharacter?.name ?? '')
  const [archetype, setArchetype] = useState(initialCharacter?.archetype ?? '')
  const [description, setDescription] = useState(initialCharacter?.description ?? '')

  const accentColor = side === 'left' ? 'player1-accent' : 'player2-accent'

  const handleSave = () => {
    if (!name || !archetype || !description) {
      alert('Please fill in all fields')
      return
    }

    const character = createCharacter(name, archetype, description)
    onSave(character)
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <h3 className={cn(
        "text-lg font-semibold text-center",
        `text-${accentColor}`
      )}>
        {side === 'left' ? 'Player 1' : 'Player 2'}
      </h3>

      <div className="flex-1 space-y-4 overflow-y-auto">
        <div>
          <label className="block text-white/70 text-sm mb-1">Character Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Aether Knight"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-1">Archetype</label>
          <input
            type="text"
            value={archetype}
            onChange={(e) => setArchetype(e.target.value)}
            placeholder="e.g., Cyber Samurai, Shadow Mage"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-1">Full Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., A cybernetic dragon knight wielding plasma weapons, covered in glowing armor with energy crackling around them"
            rows={5}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
          />
          <p className="text-xs text-white/50 mt-1">
            Be detailed and visual - this generates the world!
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        className={cn(
          "w-full py-3 rounded-lg font-medium transition-all",
          `bg-${accentColor} text-white hover:opacity-90 active:scale-95`
        )}
      >
        Save Character
      </button>
    </div>
  )
}
