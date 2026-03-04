import type { ColorKey } from '@/types';

export const COLOR_KEYS: ColorKey[] = ['red', 'green', 'blue', 'yellow'];

export const COLOR_HEX: Record<ColorKey, string> = {
  red: '#ff4d4d',
  green: '#34d399',
  blue: '#60a5fa',
  yellow: '#fbbf24',
};

export const COLOR_INT: Record<ColorKey, number> = {
  red: 0xff4d4d,
  green: 0x34d399,
  blue: 0x60a5fa,
  yellow: 0xfbbf24,
};

export const KEY_MAP: Record<ColorKey, string> = {
  red: 'Q',
  green: 'W',
  blue: 'E',
  yellow: 'R',
};

export const KEY_CODE_MAP: Record<ColorKey, string> = {
  red: 'KeyQ',
  green: 'KeyW',
  blue: 'KeyE',
  yellow: 'KeyR',
};

export const UI_TEXT = {
  title: 'Color Beat',
  subtitle: 'Tap the Color, Follow the Beat',
  guideTitle: 'How to Play',
  guideLine1: 'Press Q/W/E/R to match colors',
  guideLine2: 'On mobile: tap the color pads',
  skip: 'Skip',
  gameOver: 'Game Over!',
  restart: 'Restart',
  score: 'Score',
  time: 'Time',
  best: 'Best',
} as const;
