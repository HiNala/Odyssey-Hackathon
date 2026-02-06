import { cn } from '@/lib/utils'
import type { ConnectionStatus } from '@/lib/types'

type CenterHUDProps = {
  events?: Array<{ actor: 'left' | 'right'; text: string }>
  status?: ConnectionStatus
  error?: string | null
}

export function CenterHUD({ events = [], status = 'disconnected', error }: CenterHUDProps) {
  const statusLabel: Record<ConnectionStatus, string> = {
    disconnected: 'Disconnected',
    authenticating: 'Authenticating...',
    connecting: 'Connecting to Odyssey...',
    reconnecting: 'Reconnecting...',
    connected: 'Connected — Ready to battle',
    streaming: '⚔️ Battle in progress',
    failed: 'Connection failed',
    error: 'Connection error',
  }
  const currentStatusLabel = statusLabel[status] || 'Unknown'

  const statusColorMap: Record<ConnectionStatus, string> = {
    disconnected: 'text-white/40',
    authenticating: 'text-yellow-300/70',
    connecting: 'text-yellow-300/70',
    reconnecting: 'text-yellow-300/70',
    connected: 'text-emerald-400/80',
    streaming: 'text-emerald-300',
    failed: 'text-red-400/80',
    error: 'text-red-400/80',
  }
  const statusColor = statusColorMap[status] || 'text-white/40'

  return (
    <div className="glass rounded-2xl p-6 w-full max-w-md h-[600px] flex flex-col gap-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white/90 mb-2 tracking-wider">ARENA</h2>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-player1-accent animate-pulse" />
            <span className="text-sm text-white/70">Player 1</span>
          </div>
          <span className="text-white/50 font-bold">VS</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">Player 2</span>
            <div className="w-3 h-3 rounded-full bg-player2-accent animate-pulse" />
          </div>
        </div>
      </div>

      {/* Points / Stats Area */}
      <div className="glass rounded-xl p-4 flex justify-between items-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-player1-accent">100</div>
          <div className="text-xs text-white/60">HP</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="text-white/30 text-lg">⚔️</div>
          <div className="text-xs text-white/40">ROUND 1</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-player2-accent">100</div>
          <div className="text-xs text-white/60">HP</div>
        </div>
      </div>

      {/* Event Log */}
      <div className="flex-1 glass rounded-xl p-4 overflow-y-auto">
        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="text-white/40 text-sm italic text-center py-8">
              Send a prompt to begin the battle...
            </div>
          ) : (
            events.map((event, i) => (
              <div
                key={i}
                className={cn(
                  "text-sm px-3 py-2 rounded-lg",
                  event.actor === 'left'
                    ? "bg-player1-accent/10 text-player1-light border-l-2 border-player1-accent/40"
                    : "bg-player2-accent/10 text-player2-light border-l-2 border-player2-accent/40"
                )}
              >
                {event.text}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <p className="text-red-400/90 text-xs truncate">{error}</p>
        </div>
      )}

      {/* Status */}
      <div className={cn("text-center text-xs transition-colors duration-300", statusColor)}>
        {currentStatusLabel}
      </div>
    </div>
  )
}
