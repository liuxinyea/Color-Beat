import Phaser from 'phaser';
import { UI_TEXT, COLOR_KEYS, COLOR_INT, KEY_MAP } from '@/config/constants';
import { UI_CONFIG } from '@/config/gameConfig';
import { tweenAlpha, tweenMove, tweenScale } from '@/animations/TweenAnimations';
import { Button } from '@/components/Button';
import { createText } from '@/utils/ui';

import { BaseScene } from './BaseScene';

type AlphaGO = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Alpha;

export class GuideScene extends BaseScene {
  private overlay!: Phaser.GameObjects.Rectangle;

  constructor() {
    super('GuideScene');
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

    this.overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6);
    this.overlay.setDepth(100);

    const panel = this.add.graphics();
    panel.fillStyle(0xffffff, 1);
    panel.fillRoundedRect(w / 2 - 220, h / 2 - 140, 440, 280, UI_CONFIG.radius.card);
    panel.setDepth(101);

    const title = createText(this, w / 2, h / 2 - 95, UI_TEXT.guideTitle, UI_CONFIG.text.title).setOrigin(0.5);
    title.setDepth(102);
    title.setScale(0.85);

    const line1 = createText(this, w / 2, h / 2 - 38, UI_TEXT.guideLine1, UI_CONFIG.text.small).setOrigin(0.5);
    line1.setDepth(102);
    line1.setColor('#111827');

    const line2 = createText(this, w / 2, h / 2 - 10, UI_TEXT.guideLine2, UI_CONFIG.text.small).setOrigin(0.5);
    line2.setDepth(102);
    line2.setColor('#111827');

    const pads = this.add.container(w / 2, h / 2 + 52);
    pads.setDepth(102);

    const isMobile = w < 600;
    const padW = 76;
    const padH = 44;
    const gap = 10;

    COLOR_KEYS.forEach((c, idx) => {
      const g = this.add.graphics();
      g.fillStyle(COLOR_INT[c], 0.9);
      const x = (idx - 1.5) * (padW + gap);
      g.fillRoundedRect(x - padW / 2, -padH / 2, padW, padH, UI_CONFIG.radius.pad);
      pads.add(g);

      if (!isMobile) {
        const t = createText(this, x, 0, KEY_MAP[c], { ...UI_CONFIG.text.small, color: '#ffffff' }).setOrigin(0.5);
        pads.add(t);
      }
    });

    const skipBtn = new Button(this, w / 2 + 155, h / 2 + 105, {
      width: 120,
      height: 40,
      radius: UI_CONFIG.radius.button,
      fill: 0x3b82f6,
      text: UI_TEXT.skip,
      textStyle: { ...UI_CONFIG.text.small, color: '#ffffff' },
    });
    skipBtn.setDepth(103);

    const elements: AlphaGO[] = [this.overlay, panel, title, line1, line2, pads, skipBtn.container] as AlphaGO[];
    elements.forEach((e) => e.setAlpha(0));

    tweenAlpha(this, this.overlay, 0, 1, 300);
    tweenAlpha(this, panel, 0, 1, 300);
    tweenAlpha(this, title, 0, 1, 300);
    tweenAlpha(this, line1, 0, 1, 300);
    tweenAlpha(this, line2, 0, 1, 300);
    tweenAlpha(this, pads, 0, 1, 300);
    tweenAlpha(this, skipBtn.container, 0, 1, 300);
    tweenScale(this, title, 0.85, 1, 300, false);
    tweenMove(this, pads, w / 2, h / 2 + 70, w / 2, h / 2 + 52, 260);

    let closing = false;
    const close = (): void => {
      if (closing) return;
      closing = true;
      elements.forEach((e) => tweenAlpha(this, e, e.alpha, 0, 260));
      this.time.delayedCall(
        270,
        () => {
          elements.forEach((e) => e.destroy());
          skipBtn.destroy();
          this.scene.start('GameScene');
        },
        undefined,
        this
      );
    };

    skipBtn.onClick(close);

    const flashIndex = { value: 0 };
    this.time.addEvent({
      delay: 450,
      loop: true,
      callback: () => {
        const i = flashIndex.value % COLOR_KEYS.length;
        flashIndex.value += 1;
        const child = pads.list[i * (isMobile ? 1 : 2)] as Phaser.GameObjects.Graphics | undefined;
        if (!child) return;
        this.tweens.add({
          targets: child,
          alpha: { from: 0.65, to: 1 },
          duration: 150,
          yoyo: true,
          ease: 'Power1',
        });
      },
    });

    this.time.delayedCall(3000, close, undefined, this);
  }
}
