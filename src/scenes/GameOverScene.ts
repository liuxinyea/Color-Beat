import Phaser from 'phaser';
import { UI_TEXT } from '@/config/constants';
import { UI_CONFIG } from '@/config/gameConfig';
import { Button } from '@/components/Button';
import { tweenAlpha } from '@/animations/TweenAnimations';
import { createText } from '@/utils/ui';
import { sdk } from '@/utils/sdk';

import { BaseScene } from './BaseScene';

type AlphaGO = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Alpha;

export class GameOverScene extends BaseScene {
  private overlay!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('GameOverScene');
  }

  protected onResize(width: number, height: number, zoom: number): void {
    if (this.overlay) {
      // Scale overlay to cover the full window (inverse of camera zoom)
      this.overlay.setScale(width / zoom / this.TARGET_WIDTH * 2, height / zoom / this.TARGET_HEIGHT * 2);
    }
  }

  create(): void {
    super.create();
    const w = this.TARGET_WIDTH;
    const h = this.TARGET_HEIGHT;

    const score = Number(this.registry.get('colorBeat.lastScore') ?? 0);
    const highScore = Number(this.registry.get('colorBeat.highScore') ?? 0);

    this.overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7);
    this.overlay.setDepth(100);

    const panel = this.add.graphics();
    panel.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    panel.fillRoundedRect(w / 2 - 480, h / 2 - 288, 960, 768, UI_CONFIG.radius.card); // Scaled
    panel.setDepth(101);

    const title = createText(this, w / 2, h / 2 - 168, UI_TEXT.gameOver, UI_CONFIG.text.title).setOrigin(0.5); // Scaled
    title.setDepth(102);
    title.setTintFill(0x4cc9f0, 0x7209b7, 0x7209b7, 0x4cc9f0);

    const scoreText = createText(this, w / 2, h / 2 - 24, `Score: 0`, UI_CONFIG.text.panel).setOrigin(0.5); // Scaled
    scoreText.setDepth(102);

    const bestText = createText(this, w / 2, h / 2 + 67, `Best: ${highScore}`, UI_CONFIG.text.subtitle).setOrigin(0.5); // Scaled
    bestText.setDepth(102);
    bestText.setAlpha(0.85);

    const continueBtn = new Button(this, w / 2, h / 2 + 156, { // Scaled
      width: 672, // Scaled
      height: 106, // Scaled
      radius: UI_CONFIG.radius.button,
      fill: 0xf59e0b, // Amber for ad/continue
      text: UI_TEXT.continue,
      textStyle: { ...UI_CONFIG.text.small, color: '#ffffff', fontSize: '48px' }, // Scaled font
    });
    continueBtn.setDepth(103);

    const restartBtn = new Button(this, w / 2, h / 2 + 300, { // Scaled
      width: 384, // Scaled
      height: 96, // Scaled
      radius: UI_CONFIG.radius.button,
      fill: 0x3b82f6,
      text: UI_TEXT.restart,
      textStyle: { ...UI_CONFIG.text.small, color: '#ffffff' },
    });
    restartBtn.setDepth(103);

    // Removed the second fillRoundedRect call since we did it above correctly

    const elements: AlphaGO[] = [this.overlay, panel, title, scoreText, bestText, restartBtn.container, continueBtn.container] as AlphaGO[];
    elements.forEach((e) => e.setAlpha(0));

    tweenAlpha(this, this.overlay, 0, 1, 240);
    tweenAlpha(this, panel, 0, 1, 240);
    tweenAlpha(this, title, 0, 1, 240);
    tweenAlpha(this, scoreText, 0, 1, 240);
    tweenAlpha(this, bestText, 0, 1, 240);
    tweenAlpha(this, restartBtn.container, 0, 1, 240);
    tweenAlpha(this, continueBtn.container, 0, 1, 240);

    const container = this.add.container(0, 0, [panel, title, scoreText, bestText, restartBtn.container, continueBtn.container]);
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
    const close = (resume = false): void => {
      if (closing) return;
      closing = true;
      elements.forEach((e) => tweenAlpha(this, e, e.alpha, 0, 260));
      this.time.delayedCall(
        270,
        () => {
          elements.forEach((e) => e.destroy());
          restartBtn.destroy();
          continueBtn.destroy();
          this.scene.start('GameScene', { resume });
        },
        undefined,
        this
      );
    };

    restartBtn.onClick(() => close(false));
    
    continueBtn.onClick(() => {
      sdk.requestRewardedAd({
        adFinished: () => close(true),
        adError: (e) => {
          console.error(e);
          // Fallback: just restart if ad fails? Or do nothing?
          // For now, let's treat error as "no ad available" and just restart normally to be safe, 
          // or maybe we should just alert the user. 
          // Let's just log it and do nothing to let them try again or click restart.
        }
      });
    });

    this.input.keyboard?.once('keydown-KeyL', () => close(false));
  }
}
