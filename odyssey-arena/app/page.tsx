'use client';

import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { ArenaBackground } from '@/components/ArenaBackground';
import { PhoneFrame } from '@/components/PhoneFrame';
import { OdysseyStream } from '@/components/OdysseyStream';
import { CenterHUD } from '@/components/CenterHUD';
import { PromptInput } from '@/components/PromptInput';
import { SetupForm } from '@/components/SetupForm';
import { VictoryOverlay } from '@/components/VictoryOverlay';
import { useGameFlow } from '@/hooks/useGameFlow';
import { arenaVariants, shakeVariants } from '@/lib/animations';

export default function ArenaPage() {
  const {
    state,
    odyssey,
    startGame,
    submitCharacter,
    submitAction,
    resetGame,
    startBattleStream,
  } = useGameFlow();

  const { phase, players, activePlayer, winner, isProcessing } = state;
  const [p1, p2] = players;
  const shakeControls = useAnimationControls();

  // Start battle stream when entering battle phase
  useEffect(() => {
    if (phase === 'battle' && !p1.isStreaming && !p2.isStreaming) {
      startBattleStream();
    }
  }, [phase, p1.isStreaming, p2.isStreaming, startBattleStream]);

  // Trigger shake on critical/strong events
  const latestEvent = state.eventLog[state.eventLog.length - 1];
  useEffect(() => {
    if (!latestEvent) return;
    if (latestEvent.impactType === 'critical') {
      shakeControls.start('shakeHard');
    } else if (latestEvent.impactType === 'strong') {
      shakeControls.start('shake');
    }
  }, [latestEvent, shakeControls]);

  // Handle battle action submission
  const handleBattleAction = useCallback(
    (prompt: string) => {
      submitAction(prompt);
    },
    [submitAction]
  );

  // Handle character setup submission
  const handleSetupSubmit = useCallback(
    (character: string, world: string) => {
      submitCharacter(state.setupPlayer, character, world);
    },
    [submitCharacter, state.setupPlayer]
  );

  return (
    <ArenaBackground>
      <motion.div
        variants={arenaVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-6 h-screen flex flex-col"
      >
        {/* Header */}
        <motion.div variants={arenaVariants} className="text-center mb-4">
          <h1 className="text-3xl font-bold text-white/90 tracking-tight">
            ODYSSEY ARENA
          </h1>
          <p className="text-white/50 text-xs mt-1">
            Live AI Battle Simulation
          </p>
        </motion.div>

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
                <div className="text-5xl">⚔️</div>
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition-colors text-sm"
                >
                  Start Game
                </motion.button>
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
              className="flex-1 flex items-center justify-center gap-6"
            >
              {/* Player 1 Phone */}
              <PhoneFrame
                side="left"
                playerName={p1.name}
                isActive={state.setupPlayer === 1}
              >
                <OdysseyStream
                  mediaStream={state.setupPlayer === 1 ? odyssey.mediaStream : null}
                  isActive={state.setupPlayer === 1 && isProcessing}
                />
              </PhoneFrame>

              {/* Center: Setup Form */}
              <div className="w-full max-w-md">
                <SetupForm
                  playerId={state.setupPlayer}
                  onSubmit={handleSetupSubmit}
                  isProcessing={isProcessing}
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

              {/* Player 2 Phone */}
              <PhoneFrame
                side="right"
                playerName={p2.name}
                isActive={state.setupPlayer === 2}
              >
                <OdysseyStream
                  mediaStream={state.setupPlayer === 2 ? odyssey.mediaStream : null}
                  isActive={state.setupPlayer === 2 && isProcessing}
                />
              </PhoneFrame>
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
              <motion.div
                variants={shakeVariants}
                animate={shakeControls}
                initial="idle"
                className="flex-1 flex items-center justify-center gap-6"
              >
                {/* Player 1 Phone */}
                <PhoneFrame
                  side="left"
                  playerName={p1.character || p1.name}
                  isActive={activePlayer === 1}
                >
                  <OdysseyStream
                    mediaStream={odyssey.mediaStream}
                    isActive={odyssey.status === 'streaming' || odyssey.status === 'connecting'}
                  />
                </PhoneFrame>

                {/* Center HUD */}
                <CenterHUD state={state} />

                {/* Player 2 Phone */}
                <PhoneFrame
                  side="right"
                  playerName={p2.character || p2.name}
                  isActive={activePlayer === 2}
                >
                  <OdysseyStream
                    mediaStream={odyssey.mediaStream}
                    isActive={odyssey.status === 'streaming' || odyssey.status === 'connecting'}
                  />
                </PhoneFrame>
              </motion.div>

              {/* Prompt Input */}
              <div className="mt-4 mb-2">
                <PromptInput
                  onSubmit={handleBattleAction}
                  disabled={isProcessing || phase !== 'battle'}
                  activePlayer={activePlayer}
                  placeholder={`${players[activePlayer - 1].name}: Describe your action...`}
                />
              </div>

              {/* Hint */}
              <div className="text-center text-white/30 text-[10px] mb-2">
                Type an action and press Enter. Be creative — dramatic actions have bigger impact!
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
              className="flex-1 flex items-center justify-center gap-6"
            >
              {/* Show final state behind overlay */}
              <PhoneFrame side="left" playerName={p1.character || p1.name}>
                <OdysseyStream mediaStream={null} isActive={false} />
              </PhoneFrame>
              <CenterHUD state={state} />
              <PhoneFrame side="right" playerName={p2.character || p2.name}>
                <OdysseyStream mediaStream={null} isActive={false} />
              </PhoneFrame>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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
