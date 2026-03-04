import Phaser from 'phaser';

const getDevicePixelRatio = (): number => {
  if (typeof window === 'undefined') return 1;
  const dpr = window.devicePixelRatio || 1;
  return Math.max(1, dpr);
};

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: 1920, // Base width for HD
  height: 1080, // Base height for HD
  parent: 'game-container',
  backgroundColor: '#000000',
  render: {
    antialias: true,
    antialiasGL: true,
    pixelArt: false,
    roundPixels: false,
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.NO_CENTER,
    width: '100%',
    height: '100%',
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
  blockSize: 100, // Scaled for HD (was 40)
  hitPadHeight: 120, // Scaled for HD (was 50)
  score: {
    perfect: 100,
    good: 50,
    miss: -20,
    out: -10,
  },
  judge: {
    perfectPx: 30, // Scaled for HD (was 12)
    goodPx: 75, // Scaled for HD (was 30)
  },
  speed: {
    slow: 400, // Scaled for HD (was 170)
    medium: 550, // Scaled for HD (was 230)
    fast: 720, // Scaled for HD (was 300)
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
    panel: 24, // Scaled for HD (was 10)
    pad: 36, // Scaled for HD (was 15)
    button: 36, // Scaled for HD (was 15)
    card: 48, // Scaled for HD (was 20)
    block: 24, // Scaled for HD (was 10)
  },
  shadow: {
    color: 0x000000,
    alpha: 0.22,
    blur: 14, // Scaled for HD (was 6)
    offsetX: 5, // Scaled for HD (was 2)
    offsetY: 5, // Scaled for HD (was 2)
  },
  text: {
    title: {
      fontSize: '86px', // Scaled for HD (was 36px)
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    },
    subtitle: {
      fontSize: '34px', // Scaled for HD (was 14px)
      color: 'rgba(255,255,255,0.7)',
      fontFamily: 'Arial, sans-serif',
    },
    panel: {
      fontSize: '58px', // Scaled for HD (was 24px)
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    },
    small: {
      fontSize: '43px', // Scaled for HD (was 18px)
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    },
  },
} as const;
