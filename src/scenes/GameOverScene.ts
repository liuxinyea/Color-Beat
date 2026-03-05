import Phaser from 'phaser';
import { UI_TEXT } from '@/config/constants';
import { UI_CONFIG } from '@/config/gameConfig';
import { Button } from '@/components/Button';
import { tweenAlpha } from '@/animations/TweenAnimations';
import { createText } from '@/utils/ui';

import { BaseScene } from './BaseScene';

type AlphaGO = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Alpha;

export class GameOverScene extends BaseScene {
  private overlay!: Phaser.GameObjects.Rectangle;
  private panel!: Phaser.GameObjects.Graphics;
  private title!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private bestText!: Phaser.GameObjects.Text;
  private restartBtn!: Button;
  private mainContainer!: Phaser.GameObjects.Container;

  constructor() {
    super('GameOverScene');
  }

  protected onResize(width: number, height: number, zoom: number): void {
    if (this.overlay) {
      this.overlay.setScale(width / zoom / this.TARGET_WIDTH * 2, height / zoom / this.TARGET_HEIGHT * 2);
    }
  }

  protected layout(): void {
    if (!this.overlay) return;
    const w = this.TARGET_WIDTH;
    const h = this.TARGET_HEIGHT;

    this.overlay.setPosition(w / 2, h / 2);
    this.overlay.setSize(w, h);

    // Reposition elements inside container?
    // The container is at (0,0). Elements are at (w/2, h/2).
    // So we need to update elements' positions.

    this.panel.clear();
    this.panel.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    this.panel.fillRoundedRect(w / 2 - 200, h / 2 - 120, 400, 240, UI_CONFIG.radius.card);

    this.title.setPosition(w / 2, h / 2 - 70);
    this.scoreText.setPosition(w / 2, h / 2 - 10);
    this.bestText.setPosition(w / 2, h / 2 + 28);
    this.restartBtn.container.setPosition(w / 2, h / 2 + 78);
  }

  create(): void {
    super.create();
    const w = this.TARGET_WIDTH;
    const h = this.TARGET_HEIGHT;

    const score = Number(this.registry.get('colorBeat.lastScore') ?? 0);
    const highScore = Number(this.registry.get('colorBeat.highScore') ?? 0);

    this.overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7);
    this.overlay.setDepth(100);

    this.panel = this.add.graphics();
    this.panel.setDepth(101);

    this.title = createText(this, w / 2, h / 2 - 70, UI_TEXT.gameOver, UI_CONFIG.text.title).setOrigin(0.5);
    this.title.setDepth(102);
    this.title.setTintFill(0x4cc9f0, 0x7209b7, 0x7209b7, 0x4cc9f0);

    this.scoreText = createText(this, w / 2, h / 2 - 10, `Score: 0`, UI_CONFIG.text.panel).setOrigin(0.5);
    this.scoreText.setDepth(102);

    this.bestText = createText(this, w / 2, h / 2 + 28, `Best: ${highScore}`, UI_CONFIG.text.subtitle).setOrigin(0.5);
    this.bestText.setDepth(102);
    this.bestText.setAlpha(0.85);

    this.restartBtn = new Button(this, w / 2, h / 2 + 78, {
      width: 160,
      height: 44,
      radius: UI_CONFIG.radius.button,
      fill: 0x3b82f6,
      text: UI_TEXT.restart,
      textStyle: { ...UI_CONFIG.text.small, color: '#ffffff' },
    });
    this.restartBtn.setDepth(103);

    // Initial layout
    this.layout();

    const elements: AlphaGO[] = [this.overlay, this.panel, this.title, this.scoreText, this.bestText, this.restartBtn.container] as AlphaGO[];
    elements.forEach((e) => e.setAlpha(0));

    tweenAlpha(this, this.overlay, 0, 1, 240);
    tweenAlpha(this, this.panel, 0, 1, 240);
    tweenAlpha(this, this.title, 0, 1, 240);
    tweenAlpha(this, this.scoreText, 0, 1, 240);
    tweenAlpha(this, this.bestText, 0, 1, 240);
    tweenAlpha(this, this.restartBtn.container, 0, 1, 240);

    this.mainContainer = this.add.container(0, 0, [this.panel, this.title, this.scoreText, this.bestText, this.restartBtn.container]);
    this.mainContainer.setDepth(101);
    this.mainContainer.setScale(0.82);
    this.tweens.add({
      targets: this.mainContainer,
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
        this.scoreText.setText(`Score: ${v}`);
      },
      onComplete: () => {
        this.scoreText.setText(`Score: ${score}`);
      },
    });

    let closing = false;
    const close = (): void => {
      if (closing) return;
      closing = true;
      elements.forEach((e) => tweenAlpha(this, e, e.alpha, 0, 260));
      this.time.delayedCall(270, () => {
          elements.forEach(e => e.destroy());
          this.mainContainer.destroy(); 
          this.scene.start('GameScene');
      });
    };
    
    this.restartBtn.onClick(close);
    this.input.keyboard?.once('keydown-KeyL', close);
  }
}
