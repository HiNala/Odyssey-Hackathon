'use client';

import { memo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Video, Wifi, AlertTriangle, Swords, Loader2 } from 'lucide-react';
import type { ConnectionStatus } from '@/lib/types';

interface OdysseyStreamProps {
  mediaStream: MediaStream | null;
  status?: ConnectionStatus;
  className?: string;
  isActive?: boolean;
  demoMode?: boolean;
  playerName?: string;
}

/**
 * OdysseyStream — Video display for live AI stream.
 * Clean status indicators. No emojis. Design-token consistent.
 */
export const OdysseyStream = memo(function OdysseyStream({
  mediaStream,
  status = 'disconnected',
  className = '',
  isActive = false,
  demoMode = false,
}: OdysseyStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && mediaStream) {
      video.srcObject = mediaStream;
      video.play().catch((err) => {
        console.warn('Video autoplay was prevented:', err);
      });
    }
    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [mediaStream]);

  const isShowingVideo = mediaStream && (status === 'streaming' || status === 'connected');

  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden rounded-xl',
        'bg-background/60',
        className
      )}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-label="Live AI-generated video stream"
        className={cn(
          'w-full h-full object-cover transition-opacity duration-500',
          isShowingVideo ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Status overlays */}
      <AnimatePresence>
        {!isShowingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          >
            {/* Demo mode */}
            {demoMode && (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-fill-subtle border border-stroke-subtle flex items-center justify-center mx-auto">
                  <Swords className="w-5 h-5 text-text-muted" />
                </div>
                <span className="text-[11px] text-text-muted font-medium tracking-wide uppercase">Demo Mode</span>
              </div>
            )}

            {/* Disconnected / idle */}
            {!demoMode && (status === 'disconnected' || (!isActive && !mediaStream)) && (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-fill-subtle border border-stroke-subtle flex items-center justify-center mx-auto">
                  <Video className="w-5 h-5 text-text-muted" />
                </div>
                <span className="text-[11px] text-text-muted">Awaiting stream</span>
              </div>
            )}

            {/* Connecting */}
            {!demoMode && (status === 'connecting' || status === 'authenticating' || status === 'reconnecting') && (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-fill-subtle border border-stroke-subtle flex items-center justify-center mx-auto">
                  <Loader2 className="w-5 h-5 text-text-secondary animate-spin" />
                </div>
                <StatusBadge
                  text={
                    status === 'authenticating'
                      ? 'Authenticating'
                      : status === 'reconnecting'
                        ? 'Reconnecting'
                        : 'Connecting'
                  }
                  color="blue"
                />
              </div>
            )}

            {/* Connected, starting stream */}
            {!demoMode && status === 'connected' && isActive && !mediaStream && (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-fill-subtle border border-stroke-subtle flex items-center justify-center mx-auto">
                  <Wifi className="w-5 h-5 text-success/60 animate-pulse-subtle" />
                </div>
                <StatusBadge text="Starting stream" color="emerald" />
              </div>
            )}

            {/* Error */}
            {!demoMode && (status === 'error' || status === 'failed') && (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-5 h-5 text-danger/70" />
                </div>
                <StatusBadge
                  text={status === 'failed' ? 'Connection Failed' : 'Error'}
                  color="red"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live indicator */}
      <AnimatePresence>
        {isShowingVideo && status === 'streaming' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-3 right-3"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-overlay-light backdrop-blur-sm border border-stroke-subtle">
              <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse-subtle" />
              <span className="text-[10px] text-text-secondary font-medium tracking-wider uppercase">Live</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

function StatusBadge({ text, color }: { text: string; color: 'blue' | 'emerald' | 'red' }) {
  const colors = {
    blue: 'text-info/70',
    emerald: 'text-success/70',
    red: 'text-danger/70',
  };

  return (
    <span className={cn('text-[10px] font-medium tracking-wide', colors[color])}>
      {text}
    </span>
  );
}
