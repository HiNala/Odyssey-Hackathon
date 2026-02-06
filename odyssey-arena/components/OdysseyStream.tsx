'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OdysseyStreamProps {
  mediaStream: MediaStream | null;
  className?: string;
  isActive?: boolean;
}

/**
 * Video component that displays the Odyssey stream.
 * Uses required attributes for proper playback: autoPlay, playsInline, muted
 */
export function OdysseyStream({ 
  mediaStream, 
  className = '',
  isActive = false 
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

  return (
    <div className={cn(
      'relative w-full h-full overflow-hidden rounded-2xl',
      'bg-black/40',
      className
    )}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      {/* Overlay when not active/streaming */}
      {!isActive && !mediaStream && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/40 text-sm text-center">
            <div className="mb-2">
              <svg 
                className="w-8 h-8 mx-auto opacity-50" 
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
            <span>Awaiting stream...</span>
          </div>
        </div>
      )}

      {/* Loading indicator when connecting */}
      {isActive && !mediaStream && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-white/60 text-sm flex items-center gap-2">
            <svg 
              className="w-5 h-5 animate-spin" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Connecting...</span>
          </div>
        </div>
      )}
    </div>
  );
}
