import Phaser from 'phaser';

const getDevicePixelRatio = (): number => {
  if (typeof window === 'undefined') return 1;
  const dpr = window.devicePixelRatio || 1;
  return Math.min(2, Math.max(1, dpr));
};

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: 800,
  height: 450,
  parent: 'game-container',
  backgroundColor: '#000000',
  render: {
    antialias: true,
    roundPixels: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: { width: 400, height: 225 },
    max: { width: 1200, height: 675 },
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
} as unknown as Phaser.Types.Core.GameConfig;

export const GAME_RENDER_RESOLUTION = getDevicePixelRatio();

export const GAME_PLAY_CONFIG = {
  durationSeconds: 60,
  spawnIntervalMs: 900,
  blockSize: 40,
  hitPadHeight: 50,
  score: {
    perfect: 100,
    good: 50,
    miss: -20,
    out: -10,
  },
  judge: {
    perfectPx: 12,
    goodPx: 30,
  },
  speed: {
    slow: 170,
    medium: 230,
    fast: 300,
  },
  adaptive: {
    evaluateAtSeconds: 10,
    lowScore: 250,
    highScore: 550,
    slowFactor: 0.92,
    fastFactor: 1.12,
  },
  beat: {
    intervalMs: 2000,
  },
} as const;

export const UI_CONFIG = {
  radius: {
    panel: 10,
    pad: 15,
    button: 15,
    card: 20,
    block: 10,
  },
  shadow: {
    color: 0x000000,
    alpha: 0.22,
    blur: 6,
    offsetX: 2,
    offsetY: 2,
  },
  text: {
    title: {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    },
    subtitle: {
      fontSize: '14px',
      color: 'rgba(255,255,255,0.7)',
      fontFamily: 'Arial, sans-serif',
    },
    panel: {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    },
    small: {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    },
  },
} as const;
