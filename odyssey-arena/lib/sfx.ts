'use client';

import { useCallback, useRef } from 'react';

type SfxName = 'click' | 'attack' | 'defend' | 'special' | 'crit' | 'victory';

type TonePreset = {
  frequency: number;
  duration: number;
  type: OscillatorType;
  gain: number;
};

const PRESETS: Record<SfxName, TonePreset> = {
  click: { frequency: 820, duration: 0.05, type: 'square', gain: 0.03 },
  attack: { frequency: 220, duration: 0.12, type: 'sawtooth', gain: 0.06 },
  defend: { frequency: 340, duration: 0.1, type: 'triangle', gain: 0.05 },
  special: { frequency: 520, duration: 0.18, type: 'sawtooth', gain: 0.07 },
  crit: { frequency: 740, duration: 0.16, type: 'square', gain: 0.08 },
  victory: { frequency: 440, duration: 0.25, type: 'triangle', gain: 0.06 },
};

function playTone(ctx: AudioContext, preset: TonePreset) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = preset.type;
  osc.frequency.value = preset.frequency;
  gain.gain.value = preset.gain;

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(preset.gain, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration);
  osc.start(now);
  osc.stop(now + preset.duration);
}

export function useSfx() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback((name: SfxName) => {
    const ctx = getContext();
    if (!ctx) return;
    const preset = PRESETS[name];
    playTone(ctx, preset);
  }, [getContext]);

  const playClick = useCallback(() => play('click'), [play]);
  const playAttack = useCallback(() => play('attack'), [play]);
  const playDefend = useCallback(() => play('defend'), [play]);
  const playSpecial = useCallback(() => play('special'), [play]);
  const playCrit = useCallback(() => play('crit'), [play]);
  const playVictory = useCallback(() => play('victory'), [play]);

  return {
    playClick,
    playAttack,
    playDefend,
    playSpecial,
    playCrit,
    playVictory,
  };
}
