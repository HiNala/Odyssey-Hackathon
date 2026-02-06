'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Monitor } from 'lucide-react';
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

  useEffect(() => {
    if (phase === 'battle' && !isDemoMode && !p1.isStreaming && !p2.isStreaming) {
      startBattleStream();
    }
  }, [phase, isDemoMode, p1.isStreaming, p2.isStreaming, startBattleStream]);

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

  const handleBattleAction = useCallback(
    (prompt: string) => {
      submitAction(prompt);
    },
    [submitAction]
  );

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
        <motion.header variants={arenaVariants} className="text-center mb-6">
          <div className="flex items-center justify-center gap-3">
            <img
              src="/logo-white.svg"
              alt="Odyssey Arena"
              className="h-10 w-auto"
            />
          </div>
        </motion.header>

        {/* ─── IDLE PHASE: Welcome Screen ─────────────────────────── */}
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex-1 flex flex-col items-center justify-center gap-6"
            >
              <div className="panel-elevated rounded-2xl p-10 max-w-lg text-center space-y-6">
                <img
                  src="/logo-white.svg"
                  alt="Odyssey Arena"
                  className="h-12 w-auto mx-auto"
                />
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-text-primary tracking-tight">
                    Ready for Battle?
                  </h2>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-sm mx-auto">
                    Create two characters, place them in AI-generated worlds,
                    and watch them clash in real-time through Odyssey&apos;s world
                    model.
                  </p>
                </div>
                {state.connectionError && (
                  <div className="bg-danger/5 border border-danger/15 rounded-lg px-4 py-2.5">
                    <p className="text-danger text-xs">{state.connectionError}</p>
                  </div>
                )}
                <div className="flex flex-col gap-3 items-center pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startGame}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-text-primary text-background font-semibold text-sm transition-colors hover:bg-text-primary/90"
                  >
                    <Play className="w-4 h-4" />
                    Start Game
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startDemoMode}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-text-tertiary hover:text-text-secondary text-xs transition-colors"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    Demo Mode
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
              <div className="w-full max-w-md">
                <SetupForm
                  key={state.setupPlayer}
                  playerId={state.setupPlayer}
                  onSubmit={handleSetupSubmit}
                  isProcessing={isProcessing}
                  usedCharacter={state.setupPlayer === 2 ? p1.character : undefined}
                />
                {/* Progress indicator */}
                <div className="flex justify-center gap-2 mt-5">
                  <div
                    className={`w-8 h-1 rounded-full transition-colors ${p1.isSetupComplete ? 'bg-player1-accent' : 'bg-border'}`}
                  />
                  <div
                    className={`w-8 h-1 rounded-full transition-colors ${p2.isSetupComplete ? 'bg-player2-accent' : 'bg-border'}`}
                  />
                </div>
              </div>

              {isProcessing && !isDemoMode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
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

              {isProcessing && isDemoMode && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="panel rounded-xl px-6 py-3 text-text-secondary text-sm flex items-center gap-3"
                >
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
              className="flex-1 flex flex-col relative"
            >
              {/* Critical Hit Overlay */}
              <AnimatePresence>
                {latestEvent?.impactType === 'critical' && (
                  <motion.div
                    key={`crit-${latestEvent.id}`}
                    initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.3, 1.1, 0.9], rotate: [-8, 2, 0, 0] }}
                    transition={{ duration: 1.5, times: [0, 0.2, 0.5, 1] }}
                    className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
                  >
                    <div className="text-5xl lg:text-7xl font-black text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.7)] tracking-tighter select-none">
                      CRITICAL!
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                      demoMode={isDemoMode}
                      playerName={p1.character || p1.name}
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
                <div className="order-first lg:order-0 w-full lg:w-auto">
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
                      demoMode={isDemoMode}
                      playerName={p2.character || p2.name}
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
              <div className="mt-3 mb-2">
                <ActionButtons
                  onAction={handleBattleAction}
                  disabled={isProcessing}
                  activePlayer={activePlayer}
                  energy={players[activePlayer - 1].stats.energy}
                />
              </div>

              {/* Custom Prompt Input */}
              <div className="mb-2">
                <PromptInput
                  onSubmit={handleBattleAction}
                  disabled={isProcessing || phase !== 'battle'}
                  activePlayer={activePlayer}
                  placeholder={`${players[activePlayer - 1].name}: Type a custom action...`}
                />
              </div>

              {/* Hint */}
              <div className="text-center text-text-muted text-[10px] mb-1 font-mono">
                Use quick actions or type your own. Creative descriptions have bigger impact.
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
              <PhoneFrame side="left" playerName={p1.character || p1.name}>
                <OdysseyStream mediaStream={odyssey.mediaStream} status={odyssey.status} isActive={false} demoMode={isDemoMode} playerName={p1.character || p1.name} />
              </PhoneFrame>
              <div className="order-first lg:order-0 w-full lg:w-auto">
                <CenterHUD state={state} />
              </div>
              <PhoneFrame side="right" playerName={p2.character || p2.name}>
                <OdysseyStream mediaStream={odyssey.mediaStream} status={odyssey.status} isActive={false} demoMode={isDemoMode} playerName={p2.character || p2.name} />
              </PhoneFrame>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      {/* Victory Overlay */}
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
