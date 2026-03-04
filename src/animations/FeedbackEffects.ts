import Phaser from 'phaser';
import { createText } from '@/utils/ui';

export const showHitFeedback = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  quality: 'perfect' | 'good' | 'miss'
): void => {
  let text = '';
  let color = '#ffffff';
  let scale = 1;

  switch (quality) {
    case 'perfect':
      text = 'PERFECT!';
      color = '#FFD700'; // Gold
      scale = 1.5;
      break;
    case 'good':
      text = 'GOOD';
      color = '#FFFFFF';
      scale = 1.0;
      break;
    case 'miss':
      text = 'MISS';
      color = '#FF4D4D';
      scale = 0.8;
      break;
  }

  const feedback = createText(scene, x, y - 100, text, {
    fontSize: '58px', // Scaled for HD (was 24px)
    fontFamily: 'Arial Black, sans-serif',
    color: color,
    stroke: '#000000',
    strokeThickness: 10, // Scaled for HD (was 4)
  }).setOrigin(0.5);

  feedback.setScale(0);
  feedback.setDepth(100);

  // Animation based on quality
  if (quality === 'perfect') {
    // Pop in
    scene.tweens.add({
      targets: feedback,
      scale: { from: 0, to: scale },
      y: y - 150, // Scaled
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Hold then fade out
        scene.tweens.add({
          targets: feedback,
          alpha: 0,
          y: y - 80,
          duration: 400,
          delay: 300, // Hold for 300ms
          ease: 'Power1',
          onComplete: () => feedback.destroy(),
        });
      },
    });
  } else {
    // Pop in
    scene.tweens.add({
      targets: feedback,
      scale: { from: 0, to: scale },
      y: y - 50,
      duration: 150,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Hold then fade out
        scene.tweens.add({
          targets: feedback,
          alpha: 0,
          y: y - 65,
          duration: 300,
          delay: 200, // Hold for 200ms
          ease: 'Power1',
          onComplete: () => feedback.destroy(),
        });
      },
    });
  }
};
