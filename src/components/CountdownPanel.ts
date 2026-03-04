import Phaser from 'phaser';
import { tweenPop } from '@/animations/TweenAnimations';
import { UI_CONFIG } from '@/config/gameConfig';

export class CountdownPanel {
  readonly container: Phaser.GameObjects.Container;
  private readonly bg: Phaser.GameObjects.Graphics;
  private readonly text: Phaser.GameObjects.Text;
  private timeLeft = 0;
  private blinkTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.bg = scene.add.graphics();
    this.bg.fillStyle(0xffffff, 0.1);
    this.bg.fillRoundedRect(0, 0, 180, 50, UI_CONFIG.radius.panel);

    this.text = scene.add.text(170, 25, `Time: ${this.timeLeft}`, UI_CONFIG.text.panel).setOrigin(1, 0.5);

    this.container = scene.add.container(x, y, [this.bg, this.text]);
    this.container.setSize(180, 50);
  }

  setTime(scene: Phaser.Scene, seconds: number): void {
    this.timeLeft = seconds;
    this.text.setText(`Time: ${this.timeLeft}`);
    tweenPop(scene, this.text, 1.15, 180);

    if (this.timeLeft <= 10) {
      this.text.setTint(0xff4d4d);
      if (!this.blinkTween) {
        this.blinkTween = scene.tweens.add({
          targets: this.container,
          alpha: { from: 0.55, to: 1 },
          duration: 500,
          yoyo: true,
          loop: -1,
        });
      }
    } else {
      this.text.clearTint();
      this.blinkTween?.stop();
      this.blinkTween = null;
      this.container.setAlpha(1);
    }
  }

  destroy(): void {
    this.blinkTween?.stop();
    this.container.destroy(true);
  }
}

