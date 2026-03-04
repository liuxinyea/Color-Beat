export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const pickRandom = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
