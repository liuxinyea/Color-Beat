import type Phaser from 'phaser';

const DOT_TEXTURE_KEY = 'dot-1px';

const ensureDotTexture = (scene: Phaser.Scene): void => {
  if (scene.textures.exists(DOT_TEXTURE_KEY)) return;
  const g = scene.add.graphics();
  g.fillStyle(0xffffff, 1);
  g.fillRect(0, 0, 2, 2);
  g.generateTexture(DOT_TEXTURE_KEY, 2, 2);
  g.destroy();
};

export const createExplosion = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  strength = 1
): void => {
  ensureDotTexture(scene);
  const manager = scene.add.particles(0, 0, DOT_TEXTURE_KEY, {
    x,
    y,
    lifespan: { min: 180, max: 320 },
    speed: { min: 60 * strength, max: 130 * strength },
    scale: { start: 2.2, end: 0 },
    quantity: 10,
    tint: color,
    alpha: { start: 0.9, end: 0 },
    blendMode: 'ADD',
  });
  scene.time.delayedCall(360, () => manager.destroy(), undefined, scene);
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
