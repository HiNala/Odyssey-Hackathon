'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArenaBackground } from '@/components/ArenaBackground';
import { PhoneFrame } from '@/components/PhoneFrame';
import { OdysseyStream } from '@/components/OdysseyStream';
import { CenterHUD } from '@/components/CenterHUD';
import { PromptInput } from '@/components/PromptInput';
import { ActionButtons } from '@/components/ActionButtons';
import { SetupForm } from '@/components/SetupForm';
import { VictoryOverlay } from '@/components/VictoryOverlay';
import { DamagePopup } from '@/components/DamagePopup';
import { useGameFlow } from '@/hooks/useGameFlow';
import { arenaVariants } from '@/lib/animations';

export default function ArenaPage() {
  const {
    state,
    odyssey,
    isDemoMode,
    startGame,
    startDemoMode,
    submitCharacter,
    submitAction,
    resetGame,
    startBattleStream,
  } = useGameFlow();

  const { phase, players, activePlayer, winner, isProcessing } = state;
  const [p1, p2] = players;
  // Start battle stream when entering battle phase (skip in demo mode)
  useEffect(() => {
    if (phase === 'battle' && !isDemoMode && !p1.isStreaming && !p2.isStreaming) {
      startBattleStream();
    }
  }, [phase, isDemoMode, p1.isStreaming, p2.isStreaming, startBattleStream]);

  // Compute damage popup data from latest event
  const latestEvent = state.eventLog[state.eventLog.length - 1];
  const damagePopup = useMemo(() => {
    if (!latestEvent) return { p1: null, p2: null, key: '' };
    const p1m = latestEvent.statChanges.player1?.momentum ?? 0;
    const p2m = latestEvent.statChanges.player2?.momentum ?? 0;
    return {
      p1: p1m !== 0 ? p1m : null,
      p2: p2m !== 0 ? p2m : null,
      key: latestEvent.id,
      impact: latestEvent.impactType,
    };
  }, [latestEvent]);

  // Handle battle action submission
  const handleBattleAction = useCallback(
    (prompt: string) => {
      submitAction(prompt);
    },
    [submitAction]
  );

  // Handle character setup submission (with optional image for image-to-video)
  const handleSetupSubmit = useCallback(
    (character: string, world: string, image?: File) => {
      submitCharacter(state.setupPlayer, character, world, image);
    },
    [submitCharacter, state.setupPlayer]
  );

  return (
    <ArenaBackground>
      <motion.main
        variants={arenaVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-6 h-screen flex flex-col"
        role="main"
        aria-label="Odyssey Arena"
      >
        {/* Header */}
        <motion.header variants={arenaVariants} className="text-center mb-4">
          <div className="flex items-center justify-center gap-3">
            <img
              src="/logo.svg"
              alt="Odyssey Arena"
              className="h-10 w-auto opacity-90"
            />
          </div>
          <p className="text-white/50 text-xs mt-1">
            Live AI Battle Simulation
          </p>
        </motion.header>

        {/* ─── IDLE PHASE: Welcome Screen ─────────────────────────── */}
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center gap-6"
            >
              <div className="glass rounded-3xl p-10 max-w-lg text-center space-y-6">
                <img
                  src="/logo.svg"
                  alt="Odyssey Arena"
                  className="h-20 w-auto mx-auto opacity-90"
                />
                <h2 className="text-2xl font-bold text-white/90">
                  Ready for Battle?
                </h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  Create two characters, place them in AI-generated worlds,
                  and watch them clash in real-time through Odyssey&apos;s world
                  model. No pre-rendered animations — every frame is generated live.
                </p>
                {state.connectionError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                    <p className="text-red-400 text-xs">{state.connectionError}</p>
                  </div>
                )}
                <div className="flex flex-col gap-3 items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    className="px-8 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition-colors text-sm"
                  >
                    Start Game
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startDemoMode}
                    className="px-6 py-2 rounded-lg text-white/40 hover:text-white/60 text-xs transition-colors"
                  >
                    Demo Mode (no API)
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── SETUP PHASE ──────────────────────────────────────── */}
          {phase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 overflow-y-auto"
            >
              {/* Setup Form (center stage) */}
              <div className="w-full max-w-md">
                <SetupForm
                  key={state.setupPlayer}
                  playerId={state.setupPlayer}
                  onSubmit={handleSetupSubmit}
                  isProcessing={isProcessing}
                  usedCharacter={state.setupPlayer === 2 ? p1.character : undefined}
                />
                {/* Progress indicator */}
                <div className="flex justify-center gap-2 mt-4">
                  <div
                    className={`w-3 h-3 rounded-full ${p1.isSetupComplete ? 'bg-player1-accent' : 'bg-white/20'}`}
                  />
                  <div
                    className={`w-3 h-3 rounded-full ${p2.isSetupComplete ? 'bg-player2-accent' : 'bg-white/20'}`}
                  />
                </div>
              </div>

              {/* Preview phone: only show when generating a preview stream */}
              {isProcessing && !isDemoMode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-64 h-80"
                >
                  <PhoneFrame
                    side={state.setupPlayer === 1 ? 'left' : 'right'}
                    playerName={state.setupPlayer === 1 ? p1.name : p2.name}
                    isActive
                  >
                    <OdysseyStream
                      mediaStream={odyssey.mediaStream}
                      status={odyssey.status}
                      isActive
                    />
                  </PhoneFrame>
                </motion.div>
              )}

              {/* Demo mode processing indicator */}
              {isProcessing && isDemoMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-xl px-6 py-3 text-white/60 text-sm flex items-center gap-3"
                >
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating world preview...
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ─── BATTLE PHASE ─────────────────────────────────────── */}
          {phase === 'battle' && (
            <motion.div
              key="battle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <motion.div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)_minmax(0,1fr)] items-center gap-4 lg:gap-6">
                {/* Player 1 Phone */}
                <div className="relative lg:justify-self-end">
                  <PhoneFrame
                    side="left"
                    playerName={p1.character || p1.name}
                    isActive={activePlayer === 1}
                  >
                    <OdysseyStream
                      mediaStream={odyssey.mediaStream}
                      status={odyssey.status}
                      isActive={odyssey.status === 'streaming' || odyssey.status === 'connecting'}
                    />
                  </PhoneFrame>
                  <DamagePopup
                    value={damagePopup.p1}
                    side="left"
                    impact={damagePopup.impact}
                    eventKey={damagePopup.key}
                  />
                </div>

                {/* Center HUD */}
                <div className="order-first lg:order-none w-full lg:w-auto">
                  <CenterHUD state={state} />
                </div>

                {/* Player 2 Phone */}
                <div className="relative lg:justify-self-start">
                  <PhoneFrame
                    side="right"
                    playerName={p2.character || p2.name}
                    isActive={activePlayer === 2}
                  >
                    <OdysseyStream
                      mediaStream={odyssey.mediaStream}
                      status={odyssey.status}
                      isActive={odyssey.status === 'streaming' || odyssey.status === 'connecting'}
                    />
                  </PhoneFrame>
                  <DamagePopup
                    value={damagePopup.p2}
                    side="right"
                    impact={damagePopup.impact}
                    eventKey={damagePopup.key}
                  />
                </div>
              </motion.div>

              {/* Quick Action Buttons */}
              <div className="mt-3 mb-1.5">
                <ActionButtons
                  onAction={handleBattleAction}
                  disabled={isProcessing}
                  activePlayer={activePlayer}
                  energy={players[activePlayer - 1].stats.energy}
                />
              </div>

              {/* Custom Prompt Input */}
              <div className="mb-1.5">
                <PromptInput
                  onSubmit={handleBattleAction}
                  disabled={isProcessing || phase !== 'battle'}
                  activePlayer={activePlayer}
                  placeholder={`${players[activePlayer - 1].name}: Or type a custom action...`}
                />
              </div>

              {/* Hint */}
              <div className="text-center text-white/30 text-[10px] mb-1">
                Use quick actions above or type your own. Creative descriptions have bigger impact!
              </div>
            </motion.div>
          )}

          {/* ─── VICTORY PHASE ────────────────────────────────────── */}
          {phase === 'victory' && (
            <motion.div
              key="victory-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 overflow-auto"
            >
              {/* Show final state behind overlay */}
              <PhoneFrame side="left" playerName={p1.character || p1.name}>
                <OdysseyStream mediaStream={odyssey.mediaStream} status={odyssey.status} isActive={false} />
              </PhoneFrame>
              <div className="order-first lg:order-0 w-full lg:w-auto">
                <CenterHUD state={state} />
              </div>
              <PhoneFrame side="right" playerName={p2.character || p2.name}>
                <OdysseyStream mediaStream={odyssey.mediaStream} status={odyssey.status} isActive={false} />
              </PhoneFrame>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      {/* Victory Overlay (rendered outside main flow) */}
      <AnimatePresence>
        {phase === 'victory' && winner !== null && (
          <VictoryOverlay
            winner={players[winner - 1]}
            loser={players[winner === 1 ? 1 : 0]}
            onPlayAgain={resetGame}
          />
        )}
      </AnimatePresence>
    </ArenaBackground>
  );
}
