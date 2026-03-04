type SoundKind = 'perfect' | 'good' | 'miss' | 'beat';

let ctx: AudioContext | null = null;

const ensureContext = (): AudioContext | null => {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => undefined);
    }
    return ctx;
  } catch {
    return null;
  }
};

export const playSound = (kind: SoundKind, intensity = 1): void => {
  const audioCtx = ensureContext();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  const volume = Math.min(1, Math.max(0, intensity));
  const baseGain =
    kind === 'perfect' ? 0.06 : kind === 'good' ? 0.045 : kind === 'beat' ? 0.025 : 0.04;

  const freq =
    kind === 'perfect'
      ? 660
      : kind === 'good'
        ? 520
        : kind === 'beat'
          ? 220
          : 170;

  osc.type = kind === 'beat' ? 'sine' : 'triangle';
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, baseGain * volume), now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.2);
};
