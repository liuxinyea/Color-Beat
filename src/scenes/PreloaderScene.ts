import Phaser from 'phaser';
import { createText } from '@/utils/ui';
import { UI_CONFIG } from '@/config/gameConfig';
// @ts-ignore
import musicUrl from '@/assets/music/HookSounds.mp3';

export class PreloaderScene extends Phaser.Scene {
  constructor() {
    super('PreloaderScene');
  }

  preload(): void {
    const w = this.scale.width;
    const h = this.scale.height;

    // const text = createText(this, w / 2, h / 2, 'Loading...', UI_CONFIG.text.title).setOrigin(0.5);
    createText(this, w / 2, h / 2, 'Loading...', UI_CONFIG.text.title).setOrigin(0.5);
    
    // Progress bar
    const barW = 300;
    const barH = 20;
    const barBg = this.add.graphics();
    barBg.fillStyle(0xffffff, 0.2);
    barBg.fillRoundedRect(w / 2 - barW / 2, h / 2 + 40, barW, barH, 10);

    const barFill = this.add.graphics();

    this.load.on('progress', (value: number) => {
      barFill.clear();
      barFill.fillStyle(0x3b82f6, 1);
      barFill.fillRoundedRect(w / 2 - barW / 2, h / 2 + 40, barW * value, barH, 10);
    });

    this.load.audio('music', musicUrl);
  }

  create(): void {
    this.scene.start('GuideScene');
  }
}
