"use client";

import { useState, useCallback } from "react";
import { ArenaBackground } from "@/components/ArenaBackground";
import { PhoneFrame } from "@/components/PhoneFrame";
import { CenterHUD } from "@/components/CenterHUD";
import { PromptInput } from "@/components/PromptInput";
import { OdysseyStream } from "@/components/OdysseyStream";
import { useOdysseyStream } from "@/hooks/useOdysseyStream";
import type { ConnectionStatus } from "@/lib/types";

export default function ArenaPage() {
  const {
    status,
    error,
    mediaStream,
    connect,
    startStream,
    interact,
    endStream,
    disconnect,
  } = useOdysseyStream();

  const [isStreaming, setIsStreaming] = useState(false);
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);

  // Connection handler
  const handleConnect = useCallback(async () => {
    try {
      await connect();
    } catch (err) {
      console.error("Connection failed:", err);
    }
  }, [connect]);

  // Start stream with initial prompt
  const handleStartStream = useCallback(async (prompt: string) => {
    try {
      await startStream(prompt);
      setIsStreaming(true);
    } catch (err) {
      console.error("Start stream failed:", err);
    }
  }, [startStream]);

  // Interact with running stream
  const handleInteract = useCallback(async (prompt: string) => {
    try {
      await interact(prompt);
    } catch (err) {
      console.error("Interaction failed:", err);
    }
  }, [interact]);

  // End current stream
  const handleEndStream = useCallback(async () => {
    try {
      await endStream();
      setIsStreaming(false);
    } catch (err) {
      console.error("End stream failed:", err);
    }
  }, [endStream]);

  // Disconnect completely
  const handleDisconnect = useCallback(() => {
    disconnect();
    setIsStreaming(false);
  }, [disconnect]);

  // Handle prompt submission from the input bar
  const handlePromptSubmit = useCallback(
    async (prompt: string, target: "left" | "right") => {
      const playerId = target === "left" ? 1 : 2;
      setActivePlayer(playerId);
      
      console.log("Prompt submitted:", { prompt, target, playerId });

      // If not connected, connect first
      if (status === "disconnected") {
        await handleConnect();
        return; // User needs to submit again after connecting
      }

      // If connected but not streaming, start the stream
      if (status === "connected" && !isStreaming) {
        await handleStartStream(prompt);
        return;
      }

      // If already streaming, interact with the world
      if (status === "streaming" || isStreaming) {
        await handleInteract(prompt);
      }
    },
    [status, isStreaming, handleConnect, handleStartStream, handleInteract]
  );

  // Get status display text
  const getStatusText = (status: ConnectionStatus): string => {
    switch (status) {
      case "disconnected":
        return "Click arrow + enter prompt to connect";
      case "connecting":
        return "Connecting to Odyssey...";
      case "connected":
        return "Connected - Enter prompt to start streaming";
      case "streaming":
        return "Live streaming - Enter prompts to interact";
      case "error":
        return `Error: ${error || "Unknown error"}`;
      default:
        return "Ready";
    }
  };

  return (
    <ArenaBackground>
      <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white/90 tracking-tight">
            ODYSSEY ARENA
          </h1>
          <p className="text-white/60 text-sm mt-2">
            Live AI Battle Simulation
          </p>
        </div>

        {/* Main Arena Layout */}
        <div className="flex-1 flex items-center justify-center gap-6">
          {/* Player 1 Phone */}
          <PhoneFrame side="left" label={activePlayer === 1 ? "ACTIVE" : undefined}>
            <OdysseyStream 
              mediaStream={activePlayer === 1 ? mediaStream : null}
              isActive={activePlayer === 1 && (status === "connecting" || status === "streaming")}
            />
          </PhoneFrame>

          {/* Center HUD */}
          <div className="flex flex-col gap-4">
            <CenterHUD status={status} error={error} />
            
            {/* Connection Controls */}
            <div className="glass rounded-xl p-4 w-full max-w-md">
              <div className="flex flex-col gap-3">
                {/* Status */}
                <div className="text-center text-sm text-white/70">
                  {getStatusText(status)}
                </div>

                {/* Control Buttons */}
                <div className="flex gap-2 justify-center">
                  {status === "disconnected" && (
                    <button
                      onClick={handleConnect}
                      className="px-4 py-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg text-sm transition"
                    >
                      Connect
                    </button>
                  )}

                  {isStreaming && (
                    <button
                      onClick={handleEndStream}
                      className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-sm transition"
                    >
                      End Stream
                    </button>
                  )}

                  {(status === "connected" || status === "error") && (
                    <button
                      onClick={handleDisconnect}
                      className="px-4 py-2 bg-gray-500/80 hover:bg-gray-500 text-white rounded-lg text-sm transition"
                    >
                      Disconnect
                    </button>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="text-red-400 text-xs text-center">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Player 2 Phone */}
          <PhoneFrame side="right" label={activePlayer === 2 ? "ACTIVE" : undefined}>
            <OdysseyStream 
              mediaStream={activePlayer === 2 ? mediaStream : null}
              isActive={activePlayer === 2 && (status === "connecting" || status === "streaming")}
            />
          </PhoneFrame>
        </div>

        {/* Prompt Input */}
        <div className="mt-8 mb-4">
          <PromptInput onSubmit={handlePromptSubmit} />
        </div>

        {/* Instructions */}
        <div className="text-center text-white/40 text-xs mb-4">
          <p>Use the arrows to select which player screen receives the prompt</p>
          <p>Enter a description to generate a character or world, then interact!</p>
        </div>
      </div>
    </ArenaBackground>
  );
}
