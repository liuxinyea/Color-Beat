import Phaser from 'phaser';
import { tweenPop } from '@/animations/TweenAnimations';
import { UI_CONFIG } from '@/config/gameConfig';

export class ScorePanel {
  readonly container: Phaser.GameObjects.Container;
  private readonly bg: Phaser.GameObjects.Graphics;
  private readonly text: Phaser.GameObjects.Text;
  private score = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.bg = scene.add.graphics();
    this.bg.fillStyle(0xffffff, 0.1);
    this.bg.fillRoundedRect(0, 0, 180, 50, UI_CONFIG.radius.panel);

    this.text = scene.add.text(10, 25, `Score: ${this.score}`, UI_CONFIG.text.panel).setOrigin(0, 0.5);

    this.container = scene.add.container(x, y, [this.bg, this.text]);
    this.container.setSize(180, 50);
  }

  setScore(scene: Phaser.Scene, score: number, flash: 'plus' | 'minus' | 'none'): void {
    this.score = score;
    this.text.setText(`Score: ${this.score}`);
    tweenPop(scene, this.text, 1.2, 200);
    if (flash === 'plus') {
      this.text.setTint(0x34d399);
      scene.time.delayedCall(120, () => this.text.clearTint(), undefined, scene);
    }
    if (flash === 'minus') {
      this.text.setTint(0xff4d4d);
      scene.time.delayedCall(120, () => this.text.clearTint(), undefined, scene);
    }
  }

  destroy(): void {
    this.container.destroy(true);
  }
}

