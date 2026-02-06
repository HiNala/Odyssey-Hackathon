'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { ArenaBackground } from '@/components/ArenaBackground';
import { PhoneFrame } from '@/components/PhoneFrame';
import { OdysseyStream } from '@/components/OdysseyStream';
import { CenterHUD } from '@/components/CenterHUD';
import { PromptInput } from '@/components/PromptInput';
import { ActionButtons } from '@/components/ActionButtons';
import { SetupForm } from '@/components/SetupForm';
import { VictoryOverlay } from '@/components/VictoryOverlay';
import { DamagePopup } from '@/components/DamagePopup';
import { BattleOverlays } from '@/components/BattleOverlays';
import { TransformationOverlay } from '@/components/TransformationOverlay';
import { EvolutionIndicator } from '@/components/EvolutionIndicator';
import { AutoDemo } from '@/components/AutoDemo';
import { useGameFlow } from '@/hooks/useGameFlow';
import { arenaVariants } from '@/lib/animations';
import { User } from 'lucide-react';

export default function ArenaPage() {
  const [showIntro, setShowIntro] = useState(true);
  const {
    state,
    dispatch,
    odyssey,
    startGame,
    startDemoMode,
    submitCharacter,
    submitAction,
    resetGame,
    rematch,
    startBattleStream,
    transformationData,
    clearTransformation,
  } = useGameFlow();

  const { phase, players, activePlayer, winner, isProcessing } = state;
  const [p1, p2] = players;

  // Player name state (local until game starts)
  const [p1Name, setP1Name] = useState('Player 1');
  const [p2Name, setP2Name] = useState('Player 2');

  // Sync names to game state when starting
  const handleStartGame = useCallback(() => {
    if (p1Name.trim()) dispatch({ type: 'SET_PLAYER_NAME', player: 1, name: p1Name.trim() });
    if (p2Name.trim()) dispatch({ type: 'SET_PLAYER_NAME', player: 2, name: p2Name.trim() });
    startGame();
  }, [p1Name, p2Name, dispatch, startGame]);

  const handleStartDemo = useCallback(() => {
    if (p1Name.trim()) dispatch({ type: 'SET_PLAYER_NAME', player: 1, name: p1Name.trim() });
    if (p2Name.trim()) dispatch({ type: 'SET_PLAYER_NAME', player: 2, name: p2Name.trim() });
    startDemoMode();
  }, [p1Name, p2Name, dispatch, startDemoMode]);

  useEffect(() => {
    if (phase === 'battle' && !p1.isStreaming && !p2.isStreaming) {
      startBattleStream();
    }
  }, [phase, p1.isStreaming, p2.isStreaming, startBattleStream]);

  // Screen shake on impact
  const shakeControls = useAnimationControls();
  const prevEventCount = useRef(state.eventLog.length);
  const latestEvent = state.eventLog[state.eventLog.length - 1];

  useEffect(() => {
    if (state.eventLog.length > prevEventCount.current && latestEvent) {
      const impact = latestEvent.impactType;
      if (impact === 'critical') {
        shakeControls.start({
          x: [0, -12, 10, -8, 6, -3, 0],
          transition: { duration: 0.5 },
        });
      } else if (impact === 'strong') {
        shakeControls.start({
          x: [0, -6, 6, -4, 4, 0],
          transition: { duration: 0.35 },
        });
      } else if (impact === 'normal') {
        shakeControls.start({
          x: [0, -3, 3, -2, 0],
          transition: { duration: 0.25 },
        });
      }
    }
    prevEventCount.current = state.eventLog.length;
  }, [state.eventLog.length, latestEvent, shakeControls]);

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
        {/* Header — clean, minimal */}
        <motion.header variants={arenaVariants} className="text-center mb-6">
          <div className="flex items-center justify-center gap-3">
            <img
              src="/logo.svg"
              alt="Odyssey Arena"
              className="h-10 w-auto"
            />
          </div>
        </motion.header>

        {/* ─── IDLE: Welcome ──────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex-1 flex flex-col items-center justify-center gap-6"
            >
              <div className="rounded-2xl border border-border bg-surface p-10 max-w-lg text-center space-y-8">
                <div className="space-y-6">
                  <img
                    src="/logo.svg"
                    alt="Odyssey Arena"
                    className="h-14 w-auto mx-auto"
                  />
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold text-text-primary tracking-tight">
                      Ready for Battle?
                    </h2>
                    <p className="text-text-secondary text-sm leading-relaxed max-w-sm mx-auto">
                      Create two characters, place them in AI-generated worlds,
                      and watch them clash in real-time through Odyssey&apos;s world
                      model. No pre-rendered video -- every frame is generated live.
                    </p>
                  </div>
                </div>

                {/* Player name inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-muted uppercase tracking-widest flex items-center justify-center gap-1">
                      <User className="w-3 h-3" /> Player 1
                    </label>
                    <input
                      type="text"
                      value={p1Name}
                      onChange={(e) => setP1Name(e.target.value)}
                      placeholder="Player 1"
                      maxLength={16}
                      className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-player1-accent/40 transition-all text-center"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-text-muted uppercase tracking-widest flex items-center justify-center gap-1">
                      <User className="w-3 h-3" /> Player 2
                    </label>
                    <input
                      type="text"
                      value={p2Name}
                      onChange={(e) => setP2Name(e.target.value)}
                      placeholder="Player 2"
                      maxLength={16}
                      className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-player2-accent/40 transition-all text-center"
                    />
                  </div>
                </div>

                {state.connectionError && (
                  <div className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-2">
                    <p className="text-danger/80 text-xs">{state.connectionError}</p>
                  </div>
                )}

                <div className="flex flex-col gap-3 items-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartGame}
                    className="w-full max-w-xs px-8 py-3 rounded-xl bg-white text-background font-semibold text-sm transition-all hover:bg-white/90"
                  >
                    Start Game
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleStartDemo}
                    className="px-6 py-2 rounded-xl text-text-muted hover:text-text-secondary text-xs transition-colors"
                  >
                    Demo Mode (no API key required)
                  </motion.button>
                </div>

                {/* Attribution */}
                <div className="pt-2 border-t border-border-subtle">
                  <p className="text-text-muted/60 text-[10px] tracking-wide">
                    Powered by Odyssey-2 Pro World Model &middot; Google Gemini
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── SETUP ────────────────────────────────────────── */}
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
                {/* Progress dots */}
                <div className="flex justify-center gap-2 mt-5">
                  <div
                    className={`w-2 h-2 rounded-full transition-colors ${p1.isSetupComplete ? 'bg-player1-accent' : 'bg-white/8'}`}
                  />
                  <div
                    className={`w-2 h-2 rounded-full transition-colors ${p2.isSetupComplete ? 'bg-player2-accent' : 'bg-white/8'}`}
                  />
                </div>
              </div>

              {/* Preview stream */}
              {isProcessing && (
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
            </motion.div>
          )}

          {/* ─── BATTLE ───────────────────────────────────────── */}
          {phase === 'battle' && (
            <motion.div
              key="battle"
              initial={{ opacity: 0 }}
              animate={shakeControls}
              style={{ opacity: 1 }}
              className="flex-1 flex flex-col relative"
            >
              {/* Critical Hit Overlay */}
              <AnimatePresence>
                {latestEvent?.impactType === 'critical' && (
                  <motion.div
                    key={`crit-${latestEvent.id}`}
                    initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.5, 1.2, 0.9], rotate: [-8, 4, -2, 0] }}
                    transition={{ duration: 1.5, times: [0, 0.15, 0.5, 1] }}
                    className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
                  >
                    <div className="text-6xl lg:text-8xl font-black text-red-500 drop-shadow-[0_0_50px_rgba(239,68,68,0.8)] tracking-tighter select-none">
                      CRITICAL!
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spectacle Overlays: Combo counter, commentary */}
              <BattleOverlays state={state} />

              <motion.div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)_minmax(0,1fr)] items-center gap-4 lg:gap-6">
                {/* Player 1 */}
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
                    <EvolutionIndicator level={p1.evolutionLevel} side="left" compact />
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

                {/* Player 2 */}
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
                    <EvolutionIndicator level={p2.evolutionLevel} side="right" compact />
                  </PhoneFrame>
                  <DamagePopup
                    value={damagePopup.p2}
                    side="right"
                    impact={damagePopup.impact}
                    eventKey={damagePopup.key}
                  />
                </div>
              </motion.div>

              {/* Action buttons */}
              <div className="mt-3 mb-2">
                <ActionButtons
                  onAction={handleBattleAction}
                  disabled={isProcessing}
                  activePlayer={activePlayer}
                  energy={players[activePlayer - 1].stats.energy}
                />
              </div>

              {/* Prompt input */}
              <div className="mb-2">
                <PromptInput
                  onSubmit={handleBattleAction}
                  disabled={isProcessing || phase !== 'battle'}
                  activePlayer={activePlayer}
                  placeholder={`${players[activePlayer - 1].name}: Type a custom action...`}
                />
              </div>

              {/* Hint */}
              <div className="text-center text-text-muted text-[10px] mb-1">
                Use quick actions above or type your own. Creative descriptions have bigger impact.
              </div>
            </motion.div>
          )}

          {/* ─── VICTORY ──────────────────────────────────────── */}
          {phase === 'victory' && (
            <motion.div
              key="victory-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)_minmax(0,1fr)] items-center gap-4 lg:gap-6">
                <div className="relative lg:justify-self-end">
                  <PhoneFrame side="left" playerName={p1.character || p1.name}>
                    <OdysseyStream mediaStream={odyssey.mediaStream} status={odyssey.status} isActive={false} />
                  </PhoneFrame>
                </div>
                <div className="order-first lg:order-0 w-full lg:w-auto">
                  <CenterHUD state={state} />
                </div>
                <div className="relative lg:justify-self-start">
                  <PhoneFrame side="right" playerName={p2.character || p2.name}>
                    <OdysseyStream mediaStream={odyssey.mediaStream} status={odyssey.status} isActive={false} />
                  </PhoneFrame>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      {/* Victory overlay */}
      <AnimatePresence>
        {phase === 'victory' && winner !== null && (
          <VictoryOverlay
            winner={players[winner - 1]}
            loser={players[winner === 1 ? 1 : 0]}
            onPlayAgain={resetGame}
            onRematch={rematch}
            turnCount={state.turnCount}
            battleStats={state.battleStats}
          />
        )}
      </AnimatePresence>

      {/* Transformation overlay (evolution / devolution) */}
      <AnimatePresence>
        {transformationData && (
          <TransformationOverlay
            characterName={transformationData.characterName}
            fromLevel={transformationData.fromLevel}
            toLevel={transformationData.toLevel}
            onComplete={clearTransformation}
          />
        )}
      </AnimatePresence>

      {/* Auto-playing intro for judges / first impressions */}
      {showIntro && <AutoDemo onComplete={() => setShowIntro(false)} />}
    </ArenaBackground>
  );
}
