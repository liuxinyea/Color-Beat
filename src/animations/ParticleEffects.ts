import type Phaser from 'phaser';

const JELLY_FRAGMENT_KEY = 'jelly-frag';

const ensureFragmentTexture = (scene: Phaser.Scene): void => {
  if (scene.textures.exists(JELLY_FRAGMENT_KEY)) return;
  const g = scene.add.graphics();
  // Create a soft, rounded square fragment
  g.fillStyle(0xffffff, 1);
  g.fillRoundedRect(0, 0, 16, 16, 6);
  // Add a highlight to make it look 3D/wet
  g.fillStyle(0xffffff, 0.4);
  g.fillCircle(5, 5, 3);
  g.generateTexture(JELLY_FRAGMENT_KEY, 16, 16);
  g.destroy();
};

export const createExplosion = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  quality: 'perfect' | 'good' | 'miss' = 'good'
): void => {
  ensureFragmentTexture(scene);

  // Jelly explosion: fewer particles, larger chunks, gravity effect
  const strength = quality === 'perfect' ? 1.2 : quality === 'good' ? 0.9 : 0.6;
  // Reduce count significantly for cleaner look
  const count = quality === 'perfect' ? 8 : quality === 'good' ? 5 : 3;
  
  // 1. Main Jelly Chunks (Physical movement with gravity)
  const manager = scene.add.particles(0, 0, JELLY_FRAGMENT_KEY, {
    x,
    y,
    lifespan: { min: 120, max: 250 },
    speed: { min: 200 * strength, max: 400 * strength },
    angle: { min: 0, max: 360 },
    gravityY: 1000, // Very heavy gravity for instant fall feeling
    scale: { start: quality === 'perfect' ? 1.5 : 1.2, end: 0 },
    rotate: { min: -100, max: 100 },
    quantity: count,
    tint: color,
    alpha: { start: 1, end: 0 },
    blendMode: 'NORMAL',
  });
  manager.setDepth(50);

  // 2. Liquid Splash (Small droplets) - Only for Perfect/Good
  if (quality !== 'miss') {
    const splash = scene.add.particles(0, 0, JELLY_FRAGMENT_KEY, {
      x,
      y,
      lifespan: 150,
      speed: { min: 150, max: 300 },
      scale: { start: 0.5, end: 0 },
      quantity: 4,
      tint: 0xffffff, // White foam/splash
      alpha: { start: 0.6, end: 0 },
      blendMode: 'ADD',
    });
    splash.setDepth(51);
    scene.time.delayedCall(160, () => splash.destroy(), undefined, scene);
  }

  scene.time.delayedCall(300, () => manager.destroy(), undefined, scene);
};

export const createBeatRipple = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  colorHex: number,
  alpha = 0.18
): void => {
  const circle = scene.add.circle(x, y, 10, colorHex, alpha);
  circle.setBlendMode('ADD');
  scene.tweens.add({
    targets: circle,
    radius: 50,
    alpha: 0,
    duration: 520,
    ease: 'Sine.easeOut',
    onComplete: () => circle.destroy(),
  });
};
