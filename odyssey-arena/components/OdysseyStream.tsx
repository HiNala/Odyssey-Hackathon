'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ConnectionStatus } from '@/lib/types';

interface OdysseyStreamProps {
  mediaStream: MediaStream | null;
  status?: ConnectionStatus;
  className?: string;
  isActive?: boolean;
}

/**
 * Video component that displays the Odyssey stream.
 * Shows status-aware overlays for connection states.
 * Uses required attributes for proper playback: autoPlay, playsInline, muted
 */
export function OdysseyStream({
  mediaStream,
  status = 'disconnected',
  className = '',
  isActive = false,
}: OdysseyStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && mediaStream) {
      video.srcObject = mediaStream;

      // Ensure video plays when stream is assigned
      video.play().catch((err) => {
        console.warn('Video autoplay was prevented:', err);
      });
    }

    // Cleanup: remove stream when component unmounts or stream changes
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
        'relative w-full h-full overflow-hidden rounded-2xl',
        'bg-black/40',
        className
      )}
    >
      {/* Video Element — always in DOM for smooth transitions */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          'w-full h-full object-cover transition-opacity duration-500',
          isShowingVideo ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Status Overlays */}
      <AnimatePresence>
        {!isShowingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          >
            {/* Disconnected / Idle */}
            {(status === 'disconnected' || (!isActive && !mediaStream)) && (
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-white/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-white/40 text-xs">Awaiting stream...</span>
              </div>
            )}

            {/* Connecting / Authenticating */}
            {(status === 'connecting' || status === 'authenticating' || status === 'reconnecting') && (
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-3 border-white/20 border-t-white/70 rounded-full animate-spin mx-auto" />
                <StatusBadge
                  text={
                    status === 'authenticating'
                      ? 'Authenticating...'
                      : status === 'reconnecting'
                        ? 'Reconnecting...'
                        : 'Connecting...'
                  }
                  color="blue"
                />
              </div>
            )}

            {/* Connected but not streaming yet */}
            {status === 'connected' && isActive && !mediaStream && (
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-3 border-white/20 border-t-emerald-400 rounded-full animate-spin mx-auto" />
                <StatusBadge text="Starting stream..." color="emerald" />
              </div>
            )}

            {/* Error State */}
            {(status === 'error' || status === 'failed') && (
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
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

      {/* Live badge when streaming */}
      <AnimatePresence>
        {isShowingVideo && status === 'streaming' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-3 right-3"
          >
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-white/80 font-medium">LIVE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Small status badge component */
function StatusBadge({ text, color }: { text: string; color: 'blue' | 'emerald' | 'red' }) {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    red: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  return (
    <span
      className={cn(
        'inline-block px-3 py-1 rounded-full text-[10px] font-medium border',
        colors[color]
      )}
    >
      {text}
    </span>
  );
}
