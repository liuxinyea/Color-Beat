import Phaser from 'phaser';
import type { ColorKey } from '@/types';
import { COLOR_HEX } from '@/config/constants';
import { UI_CONFIG, GAME_PLAY_CONFIG } from '@/config/gameConfig';

const textureKeyFor = (color: ColorKey): string => `block-${color}`;

const ensureBlockTexture = (scene: Phaser.Scene, color: ColorKey): void => {
  const key = textureKeyFor(color);
  if (scene.textures.exists(key)) return;

  const size = GAME_PLAY_CONFIG.blockSize;
  const resolution = Math.min(2, Math.max(1, Number((scene.game.config as any).resolution ?? 1)));
  const hiSize = Math.max(1, Math.floor(size * resolution));
  const canvasTex = scene.textures.createCanvas(key, hiSize, hiSize);
  if (!canvasTex) return;
  const ctx = canvasTex.getContext();

  const radius = Math.floor(UI_CONFIG.radius.block * resolution);
  ctx.clearRect(0, 0, hiSize, hiSize);

  const grad = ctx.createLinearGradient(0, 0, hiSize, hiSize);
  grad.addColorStop(0, COLOR_HEX[color]);
  grad.addColorStop(1, '#ffffff');

  ctx.fillStyle = grad;
  ctx.beginPath();
  const r = radius;
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

  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(hiSize * 0.62, hiSize * 0.38, Math.max(1, 6 * resolution), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = 'rgba(0,0,0,0.20)';
  ctx.lineWidth = Math.max(1, Math.floor(2 * resolution));
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
