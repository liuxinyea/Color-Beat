import type Phaser from 'phaser';

export const tweenScale = (
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  from: number,
  to: number,
  durationMs: number,
  loop = false
): Phaser.Tweens.Tween =>
  scene.tweens.add({
    targets: target,
    scale: { from, to },
    duration: durationMs,
    ease: 'Power1',
    loop: loop ? -1 : 0,
    yoyo: loop,
  });

export const tweenAlpha = (
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  from: number,
  to: number,
  durationMs: number
): Phaser.Tweens.Tween =>
  scene.tweens.add({
    targets: target,
    alpha: { from, to },
    duration: durationMs,
    ease: 'Power1',
  });

export const tweenMove = (
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject & { setPosition: (x: number, y: number) => unknown },
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  durationMs: number
): Phaser.Tweens.Tween => {
  target.setPosition(fromX, fromY);
  return scene.tweens.add({
    targets: target,
    x: toX,
    y: toY,
    duration: durationMs,
    ease: 'Power1',
  });
};

export const tweenPop = (
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
  peakScale = 1.2,
  durationMs = 200
): Phaser.Tweens.Tween =>
  scene.tweens.add({
    targets: target,
    scale: { from: 1, to: peakScale },
    duration: Math.floor(durationMs / 2),
    yoyo: true,
    ease: 'Power1',
  });
