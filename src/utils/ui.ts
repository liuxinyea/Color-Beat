import Phaser from 'phaser';
import { GAME_RENDER_RESOLUTION } from '@/config/gameConfig';

/**
 * Creates a Text object with high resolution setting based on device pixel ratio.
 * This ensures text remains crisp on high-DPI screens.
 */
export const createText = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string | string[],
  style: Phaser.Types.GameObjects.Text.TextStyle
): Phaser.GameObjects.Text => {
  const t = scene.add.text(x, y, text, style);
  // Increase resolution for sharper text rendering
  // Add a small buffer (e.g., 1.5x) if DPR is 1 to reduce anti-aliasing artifacts on low-res screens too
  const res = Math.max(1.5, GAME_RENDER_RESOLUTION);
  t.setResolution(res);
  return t;
};
