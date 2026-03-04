import Phaser from 'phaser';
import { UI_TEXT } from '@/config/constants';
import { UI_CONFIG } from '@/config/gameConfig';
import { Button } from '@/components/Button';
import { tweenAlpha } from '@/animations/TweenAnimations';

type AlphaGO = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Alpha;

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(): void {
    const w = this.scale.width;
    const h = this.scale.height;

    const score = Number(this.registry.get('colorBeat.lastScore') ?? 0);
    const highScore = Number(this.registry.get('colorBeat.highScore') ?? 0);

    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7);
    overlay.setDepth(100);

    const panel = this.add.graphics();
    panel.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    panel.fillRoundedRect(w / 2 - 200, h / 2 - 120, 400, 240, UI_CONFIG.radius.card);
    panel.setDepth(101);

    const title = this.add.text(w / 2, h / 2 - 70, UI_TEXT.gameOver, UI_CONFIG.text.title).setOrigin(0.5);
    title.setDepth(102);
    title.setTintFill(0x4cc9f0, 0x7209b7, 0x7209b7, 0x4cc9f0);

    const scoreText = this.add.text(w / 2, h / 2 - 10, `Score: 0`, UI_CONFIG.text.panel).setOrigin(0.5);
    scoreText.setDepth(102);

    const bestText = this.add.text(w / 2, h / 2 + 28, `Best: ${highScore}`, UI_CONFIG.text.subtitle).setOrigin(0.5);
    bestText.setDepth(102);
    bestText.setAlpha(0.85);

    const restartBtn = new Button(this, w / 2, h / 2 + 78, {
      width: 160,
      height: 44,
      radius: UI_CONFIG.radius.button,
      fill: 0x3b82f6,
      text: UI_TEXT.restart,
      textStyle: { ...UI_CONFIG.text.small, color: '#ffffff' },
    });
    restartBtn.setDepth(103);

    const elements: AlphaGO[] = [overlay, panel, title, scoreText, bestText, restartBtn.container] as AlphaGO[];
    elements.forEach((e) => e.setAlpha(0));

    tweenAlpha(this, overlay, 0, 1, 240);
    tweenAlpha(this, panel, 0, 1, 240);
    tweenAlpha(this, title, 0, 1, 240);
    tweenAlpha(this, scoreText, 0, 1, 240);
    tweenAlpha(this, bestText, 0, 1, 240);
    tweenAlpha(this, restartBtn.container, 0, 1, 240);

    const container = this.add.container(0, 0, [panel, title, scoreText, bestText, restartBtn.container]);
    container.setDepth(101);
    container.setScale(0.82);
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    this.tweens.addCounter({
      from: 0,
      to: score,
      duration: 500,
      ease: 'Power1',
      onUpdate: (tw: Phaser.Tweens.Tween) => {
        const v = Math.floor(tw.getValue());
        scoreText.setText(`Score: ${v}`);
      },
      onComplete: () => {
        scoreText.setText(`Score: ${score}`);
      },
    });

    let closing = false;
    const close = (): void => {
      if (closing) return;
      closing = true;
      elements.forEach((e) => tweenAlpha(this, e, e.alpha, 0, 260));
      this.time.delayedCall(
        270,
        () => {
          elements.forEach((e) => e.destroy());
          restartBtn.destroy();
          this.scene.start('GameScene');
        },
        undefined,
        this
      );
    };

    restartBtn.onClick(close);

    this.input.keyboard?.once('keydown-KeyL', close);
  }
}
