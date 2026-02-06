'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { victoryOverlayVariants } from '@/lib/animations';
import { Trophy, RotateCcw, Swords, Flame, Zap, Shield, Users } from 'lucide-react';
import { getEvolutionMeta } from '@/lib/evolution';
import type { PlayerState, BattleStats } from '@/types/game';

interface VictoryOverlayProps {
  winner: PlayerState;
  loser: PlayerState;
  onPlayAgain: () => void;
  onRematch?: () => void;
  turnCount?: number;
  battleStats?: BattleStats;
}

export function VictoryOverlay({
  winner,
  loser,
  onPlayAgain,
  onRematch,
  turnCount,
  battleStats,
}: VictoryOverlayProps) {
  const isP1 = winner.id === 1;
  const winnerKey = isP1 ? 'player1' : 'player2';
  const loserKey = isP1 ? 'player2' : 'player1';

  // Determine victory type
  const loserMomentum = loser.stats.momentum;
  const winnerMomentum = winner.stats.momentum;
  const victoryType =
    loserMomentum <= 0 && winnerMomentum >= 90
      ? 'FLAWLESS VICTORY'
      : winnerMomentum <= 30
        ? 'COMEBACK VICTORY'
        : turnCount != null && turnCount <= 5
          ? 'DOMINATION'
          : 'VICTORY';

  const victoryColor =
    victoryType === 'FLAWLESS VICTORY'
      ? 'text-yellow-400'
      : victoryType === 'COMEBACK VICTORY'
        ? 'text-emerald-400'
        : victoryType === 'DOMINATION'
          ? 'text-red-400'
          : isP1
            ? 'text-player1-accent'
            : 'text-player2-accent';

  return (
    <motion.div
      variants={victoryOverlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-xl"
    >
      <div className="max-w-lg w-full mx-4 space-y-5">
        {/* Crown + Victory Title */}
        <motion.div
          initial={{ y: -60, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center space-y-3"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className={cn(
              'w-20 h-20 rounded-2xl flex items-center justify-center mx-auto',
              isP1 ? 'bg-player1-muted border border-player1-accent/20' : 'bg-player2-muted border border-player2-accent/20'
            )}
          >
            <Trophy
              className={cn('w-10 h-10', isP1 ? 'text-player1-accent' : 'text-player2-accent')}
              strokeWidth={1.5}
            />
          </motion.div>
          <h1 className={cn('text-4xl lg:text-5xl font-black tracking-tighter', victoryColor)}>
            {victoryType}
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-text-primary font-semibold"
          >
            {winner.name} Wins!
          </motion.p>
          <p className="text-text-muted text-xs">
            {winner.character}
            {winner.evolutionLevel !== 0 && (
              <span className="ml-1.5">
                {getEvolutionMeta(winner.evolutionLevel).indicator}{' '}
                <span className={getEvolutionMeta(winner.evolutionLevel).color}>
                  {getEvolutionMeta(winner.evolutionLevel).name}
                </span>
              </span>
            )}
          </p>
          {turnCount != null && turnCount > 0 && (
            <p className="text-text-muted/60 text-[10px] tracking-widest uppercase">
              Decided in {turnCount} {turnCount === 1 ? 'turn' : 'turns'}
            </p>
          )}
        </motion.div>

        {/* Battle Stats Card */}
        {battleStats && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 180, damping: 18 }}
            className="rounded-2xl border border-border bg-surface p-5 space-y-4"
          >
            <div className="text-center text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Battle Report
            </div>
            <div className="grid grid-cols-3 gap-2">
              {/* Column headers */}
              <div className="text-right text-[10px] font-medium text-text-muted">
                {winner.name}
              </div>
              <div />
              <div className="text-left text-[10px] font-medium text-text-muted">
                {loser.name}
              </div>

              {/* Total Damage */}
              <BattleStatRow
                leftValue={battleStats.totalDamageDealt[winnerKey]}
                label="Damage"
                icon={<Swords className="w-3 h-3" />}
                rightValue={battleStats.totalDamageDealt[loserKey]}
                winnerSide="left"
              />

              {/* Critical Hits */}
              <BattleStatRow
                leftValue={battleStats.criticalHits[winnerKey]}
                label="Crits"
                icon={<Flame className="w-3 h-3" />}
                rightValue={battleStats.criticalHits[loserKey]}
                winnerSide={
                  battleStats.criticalHits[winnerKey] >= battleStats.criticalHits[loserKey]
                    ? 'left'
                    : 'right'
                }
              />

              {/* Max Combo */}
              <BattleStatRow
                leftValue={battleStats.maxCombo[winnerKey]}
                label="Max Combo"
                icon={<Zap className="w-3 h-3" />}
                rightValue={battleStats.maxCombo[loserKey]}
                winnerSide={
                  battleStats.maxCombo[winnerKey] >= battleStats.maxCombo[loserKey]
                    ? 'left'
                    : 'right'
                }
              />

              {/* Status Effects */}
              <div className="text-right text-sm font-bold text-text-primary tabular-nums">
                {battleStats.statusEffectsApplied}
              </div>
              <div className="flex items-center justify-center gap-1 text-text-muted/60">
                <Shield className="w-3 h-3" />
                <span className="text-[9px]">Effects</span>
              </div>
              <div className="text-left text-sm font-bold text-text-muted tabular-nums">
                —
              </div>
            </div>
          </motion.div>
        )}

        {/* Final Player Stats */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 180, damping: 18 }}
          className="grid grid-cols-2 gap-3"
        >
          <StatCard label={winner.name} stats={winner.stats} accent={isP1 ? 'player1' : 'player2'} isWinner />
          <StatCard label={loser.name} stats={loser.stats} accent={isP1 ? 'player2' : 'player1'} />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex items-center justify-center gap-3"
        >
          {onRematch && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onRematch}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-background font-bold text-sm transition-all hover:bg-white/90 shadow-lg shadow-white/10"
            >
              <Swords className="w-4 h-4" strokeWidth={2} />
              Rematch
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPlayAgain}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-surface-raised hover:bg-fill-subtle text-text-secondary hover:text-text-primary font-medium text-sm transition-all"
          >
            <Users className="w-4 h-4" strokeWidth={1.5} />
            New Characters
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── Battle Stat Row ─────────────────────────────────────────────── */

function BattleStatRow({
  leftValue,
  label,
  icon,
  rightValue,
  winnerSide,
}: {
  leftValue: number;
  label: string;
  icon: React.ReactNode;
  rightValue: number;
  winnerSide: 'left' | 'right';
}) {
  return (
    <>
      <div
        className={cn(
          'text-right text-sm font-bold tabular-nums',
          winnerSide === 'left' ? 'text-text-primary' : 'text-text-muted'
        )}
      >
        {leftValue}
      </div>
      <div className="flex items-center justify-center gap-1 text-text-muted/60">
        {icon}
        <span className="text-[9px]">{label}</span>
      </div>
      <div
        className={cn(
          'text-left text-sm font-bold tabular-nums',
          winnerSide === 'right' ? 'text-text-primary' : 'text-text-muted'
        )}
      >
        {rightValue}
      </div>
    </>
  );
}

/* ─── Stat Card ───────────────────────────────────────────────────── */

function StatCard({
  label,
  stats,
  accent,
  isWinner = false,
}: {
  label: string;
  stats: { momentum: number; power: number; defense: number; energy: number };
  accent: 'player1' | 'player2';
  isWinner?: boolean;
}) {
  const isP1 = accent === 'player1';
  return (
    <div
      className={cn(
        'rounded-xl border bg-surface-raised p-3 space-y-1.5',
        isWinner
          ? isP1
            ? 'border-player1-accent/20'
            : 'border-player2-accent/20'
          : 'border-border'
      )}
    >
      <div className={cn('text-xs font-medium', isP1 ? 'text-player1-accent/80' : 'text-player2-accent/80')}>
        {label}
        {isWinner && <span className="ml-1.5 text-[9px] text-yellow-400/80">★</span>}
      </div>
      <div className="grid grid-cols-2 gap-1 text-[10px] text-text-muted tabular-nums">
        <div>
          MTM <span className="text-text-secondary">{stats.momentum}</span>
        </div>
        <div>
          PWR <span className="text-text-secondary">{stats.power}</span>
        </div>
        <div>
          DEF <span className="text-text-secondary">{stats.defense}</span>
        </div>
        <div>
          NRG <span className="text-text-secondary">{stats.energy}</span>
        </div>
      </div>
    </div>
  );
}
