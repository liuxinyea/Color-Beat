import type Phaser from 'phaser';

export const tweenScale = (
  scene: Phaser.Scene,
  target: object,
  from: number,
  to: number,
  duration: number,
  yoyo = false
): Phaser.Tweens.Tween => {
  return scene.tweens.add({
    targets: target,
    scale: { from, to },
    duration,
    yoyo,
    ease: 'Sine.easeInOut',
  });
};

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
  target: object,
  scale = 1.2,
  duration = 100
): Phaser.Tweens.Tween => {
  return scene.tweens.add({
    targets: target,
    scaleX: scale,
    scaleY: scale * 0.85, // Squish
    duration: duration * 0.6,
    yoyo: true,
    ease: 'Back.easeOut',
    onComplete: () => {
      // Secondary bounce
      scene.tweens.add({
        targets: target,
        scaleX: 1,
        scaleY: 1,
        duration: duration * 1.5,
        ease: 'Elastic.easeOut',
      });
    },
  });
};
