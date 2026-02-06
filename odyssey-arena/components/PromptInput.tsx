'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type PromptInputProps = {
  onSubmit?: (prompt: string, target: 'left' | 'right') => void
}

export function PromptInput({ onSubmit }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [activeTarget, setActiveTarget] = useState<'left' | 'right' | null>(null)

  const handleSubmit = (target: 'left' | 'right') => {
    if (!prompt.trim()) return
    onSubmit?.(prompt, target)
    setPrompt('')
    setActiveTarget(null)
  }


  return (
    <div className="glass rounded-full p-2 flex items-center gap-2 max-w-2xl mx-auto">
      {/* Left Arrow */}
      <button
        onClick={() => handleSubmit('left')}
        className={cn(
          "flex-shrink-0 w-12 h-12 rounded-full",
          "flex items-center justify-center",
          "transition-all duration-200",
          "hover:scale-110 active:scale-95",
          activeTarget === 'left'
            ? "bg-player1-accent text-white"
            : "bg-white/10 text-white/60 hover:bg-white/20"
        )}
        aria-label="Send to Player 1"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Input */}
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onFocus={() => setActiveTarget(null)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && activeTarget) {
            handleSubmit(activeTarget)
          }
        }}
        placeholder="Enter your action..."
        className={cn(
          "flex-1 bg-transparent border-none outline-none",
          "text-white placeholder:text-white/40",
          "text-base px-4"
        )}
      />

      {/* Right Arrow */}
      <button
        onClick={() => handleSubmit('right')}
        className={cn(
          "flex-shrink-0 w-12 h-12 rounded-full",
          "flex items-center justify-center",
          "transition-all duration-200",
          "hover:scale-110 active:scale-95",
          activeTarget === 'right'
            ? "bg-player2-accent text-white"
            : "bg-white/10 text-white/60 hover:bg-white/20"
        )}
        aria-label="Send to Player 2"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
