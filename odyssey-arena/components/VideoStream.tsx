'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { ConnectionStatus } from '@/lib/types'

type VideoStreamProps = {
  mediaStream: MediaStream | null
  status: ConnectionStatus
  className?: string
}

export function VideoStream({ mediaStream, status, className }: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Attach MediaStream to video element
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream
      console.log('📹 MediaStream attached to video element')
    }
  }, [mediaStream])

  return (
    <div className={cn(
      "relative w-full h-full rounded-2xl overflow-hidden bg-black/20",
      className
    )}>
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-label="Live AI-generated battle stream"
        className="w-full h-full object-cover"
      />

      {/* Status Overlay */}
      {status !== 'streaming' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="text-center space-y-2">
            {status === 'disconnected' && (
              <div className="text-white/60 text-sm">Not Connected</div>
            )}
            {(status === 'connecting' || status === 'authenticating') && (
              <>
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                <div className="text-white/60 text-sm">Connecting...</div>
              </>
            )}
            {status === 'connected' && (
              <div className="text-white/60 text-sm">Ready to Stream</div>
            )}
            {(status === 'error' || status === 'failed') && (
              <div className="text-red-400 text-sm">Connection Error</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
