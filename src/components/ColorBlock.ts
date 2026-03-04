import Phaser from 'phaser';
import type { ColorKey } from '@/types';
import { COLOR_HEX } from '@/config/constants';
import { UI_CONFIG, GAME_PLAY_CONFIG } from '@/config/gameConfig';

const textureKeyFor = (color: ColorKey): string => `block-${color}`;

const ensureBlockTexture = (scene: Phaser.Scene, color: ColorKey): void => {
  const key = textureKeyFor(color);
  if (scene.textures.exists(key)) return;

  const size = GAME_PLAY_CONFIG.blockSize;
  const resolution = Math.min(6, Math.max(1, Number((scene.game.config as any).resolution ?? 1)));
  const hiSize = Math.max(1, Math.floor(size * resolution));
  const canvasTex = scene.textures.createCanvas(key, hiSize, hiSize);
  if (!canvasTex) return;
  const ctx = canvasTex.getContext();

  const radius = Math.floor(UI_CONFIG.radius.block * resolution);
  ctx.clearRect(0, 0, hiSize, hiSize);

  // 1. Base Gradient (Jelly Body)
  const grad = ctx.createLinearGradient(0, 0, 0, hiSize);
  grad.addColorStop(0, COLOR_HEX[color]);
  grad.addColorStop(1, '#ffffff'); // Slightly lighter at bottom for depth

  ctx.fillStyle = grad;
  ctx.beginPath();
  const r = radius;
  // Rounded rect path
  ctx.moveTo(r, 0);
  ctx.lineTo(hiSize - r, 0);
  ctx.quadraticCurveTo(hiSize, 0, hiSize, r);
  ctx.lineTo(hiSize, hiSize - r);
  ctx.quadraticCurveTo(hiSize, hiSize, hiSize - r, hiSize);
  ctx.lineTo(r, hiSize);
  ctx.quadraticCurveTo(0, hiSize, 0, hiSize - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // 2. Inner Shadow (Soft ambient occlusion)
  ctx.save();
  ctx.clip();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 8 * resolution;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 4 * resolution;
  ctx.stroke();
  ctx.restore();

  // 3. Top Highlight (Glossy reflection)
  const highlightGrad = ctx.createLinearGradient(0, 0, 0, hiSize * 0.5);
  highlightGrad.addColorStop(0, 'rgba(255,255,255,0.7)');
  highlightGrad.addColorStop(1, 'rgba(255,255,255,0)');
  
  ctx.fillStyle = highlightGrad;
  ctx.beginPath();
  ctx.ellipse(hiSize * 0.5, hiSize * 0.2, hiSize * 0.35, hiSize * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4. Bottom Rim Light (Bounce light)
  ctx.save();
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(hiSize * 0.5, hiSize * 0.9, hiSize * 0.3, hiSize * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 5. Border
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = Math.max(1, Math.floor(1.5 * resolution));
  ctx.stroke();

  canvasTex.refresh();
};

export type SpawnedBlock = Phaser.Physics.Arcade.Image & { colorKey: ColorKey; bornAtMs: number };

export const spawnColorBlock = (
  scene: Phaser.Scene,
  group: Phaser.Physics.Arcade.Group,
  color: ColorKey,
  x: number,
  y: number,
  speed: number
): SpawnedBlock => {
  ensureBlockTexture(scene, color);
  const block = group.create(x, y, textureKeyFor(color)) as SpawnedBlock;
  block.colorKey = color;
  block.bornAtMs = scene.time.now;
  block.setDepth(10);
  block.setVelocity(0, speed);
  block.setAngularVelocity(45);
  block.setDataEnabled();
  block.setData('colorKey', color);
  block.setData('matched', false);
  block.setDisplaySize(GAME_PLAY_CONFIG.blockSize, GAME_PLAY_CONFIG.blockSize);
  block.setAlpha(0);
  scene.tweens.add({
    targets: block,
    alpha: 1,
    duration: 180,
    ease: 'Power1',
  });
  scene.tweens.add({
    targets: block,
    scale: { from: 0.8, to: 1 },
    duration: 180,
    ease: 'Power1',
  });
  return block;
};
