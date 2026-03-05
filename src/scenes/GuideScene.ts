import Phaser from 'phaser';
import { UI_TEXT, COLOR_KEYS, COLOR_INT, KEY_MAP } from '@/config/constants';
import { UI_CONFIG } from '@/config/gameConfig';
import { tweenAlpha, tweenScale } from '@/animations/TweenAnimations';
import { Button } from '@/components/Button';
import { createText } from '@/utils/ui';

import { BaseScene } from './BaseScene';

type AlphaGO = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Alpha;

export class GuideScene extends BaseScene {
  private overlay!: Phaser.GameObjects.Rectangle;
  private panel!: Phaser.GameObjects.Graphics;
  private title!: Phaser.GameObjects.Text;
  private line1!: Phaser.GameObjects.Text;
  private line2!: Phaser.GameObjects.Text;
  private padsContainer!: Phaser.GameObjects.Container;
  private skipBtn!: Button;

  constructor() {
    super('GuideScene');
  }

  protected onResize(width: number, height: number, zoom: number): void {
    if (this.overlay) {
      // Scale overlay to cover the full window (inverse of camera zoom)
      this.overlay.setScale(width / zoom / this.TARGET_WIDTH * 2, height / zoom / this.TARGET_HEIGHT * 2);
    }
  }

  protected layout(): void {
    if (!this.overlay) return;
    const w = this.TARGET_WIDTH;
    const h = this.TARGET_HEIGHT;

    this.overlay.setPosition(w / 2, h / 2);
    this.overlay.setSize(w, h); // Also update size to match new target size? Or just rely on scale?
    // Scale is handled in onResize, position in layout.

    // Reposition panel
    this.panel.clear();
    this.panel.fillStyle(0xffffff, 1);
    this.panel.fillRoundedRect(w / 2 - 220, h / 2 - 140, 440, 280, UI_CONFIG.radius.card);

    // Reposition text
    this.title.setPosition(w / 2, h / 2 - 95);
    this.line1.setPosition(w / 2, h / 2 - 38);
    this.line2.setPosition(w / 2, h / 2 - 10);

    // Reposition pads container
    this.padsContainer.setPosition(w / 2, h / 2 + 52);

    // Recreate pads inside container if needed?
    // Pads are drawn relative to (0,0) of container.
    // The container is centered.
    // Pads width/spacing is fixed?
    // Existing code:
    // const isMobile = w < 600;
    // const padW = 76; const gap = 10;
    // If w changes (landscape <-> portrait), isMobile changes.
    // We should re-draw pads.
    this.padsContainer.removeAll(true);
    const isMobile = w < 600;
    const padW = 76;
    const padH = 44;
    const gap = 10;

    COLOR_KEYS.forEach((c, idx) => {
      const g = this.add.graphics();
      g.fillStyle(COLOR_INT[c], 0.9);
      const x = (idx - 1.5) * (padW + gap);
      g.fillRoundedRect(x - padW / 2, -padH / 2, padW, padH, UI_CONFIG.radius.pad);
      this.padsContainer.add(g);

      if (!isMobile) {
        const t = createText(this, x, 0, KEY_MAP[c], { ...UI_CONFIG.text.small, color: '#ffffff' }).setOrigin(0.5);
        this.padsContainer.add(t);
      }
    });

    // Reposition button
    this.skipBtn.container.setPosition(w / 2 + 155, h / 2 + 105);
  }

  create(): void {
    super.create();
    const w = this.TARGET_WIDTH;
    const h = this.TARGET_HEIGHT;

    this.overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6);
    this.overlay.setDepth(100);

    this.panel = this.add.graphics();
    this.panel.setDepth(101);

    this.title = createText(this, w / 2, h / 2 - 95, UI_TEXT.guideTitle, UI_CONFIG.text.title).setOrigin(0.5);
    this.title.setDepth(102);
    this.title.setScale(0.85);

    this.line1 = createText(this, w / 2, h / 2 - 38, UI_TEXT.guideLine1, UI_CONFIG.text.small).setOrigin(0.5);
    this.line1.setDepth(102);
    this.line1.setColor('#111827');

    this.line2 = createText(this, w / 2, h / 2 - 10, UI_TEXT.guideLine2, UI_CONFIG.text.small).setOrigin(0.5);
    this.line2.setDepth(102);
    this.line2.setColor('#111827');

    this.padsContainer = this.add.container(w / 2, h / 2 + 52);
    this.padsContainer.setDepth(102);

    this.skipBtn = new Button(this, w / 2 + 155, h / 2 + 105, {
      width: 120,
      height: 40,
      radius: UI_CONFIG.radius.button,
      fill: 0x3b82f6,
      text: UI_TEXT.skip,
      textStyle: { ...UI_CONFIG.text.small, color: '#ffffff' },
    });
    this.skipBtn.setDepth(103);

    // Initial layout
    this.layout();

    const elements: AlphaGO[] = [this.overlay, this.panel, this.title, this.line1, this.line2, this.padsContainer, this.skipBtn.container] as AlphaGO[];
    elements.forEach((e) => e.setAlpha(0));

    tweenAlpha(this, this.overlay, 0, 1, 300);
    tweenAlpha(this, this.panel, 0, 1, 300);
    tweenAlpha(this, this.title, 0, 1, 300);
    tweenAlpha(this, this.line1, 0, 1, 300);
    tweenAlpha(this, this.line2, 0, 1, 300);
    tweenAlpha(this, this.padsContainer, 0, 1, 300);
    tweenAlpha(this, this.skipBtn.container, 0, 1, 300);
    tweenScale(this, this.title, 0.85, 1, 300, false);

    let closing = false;
    const close = (): void => {
      if (closing) return;
      closing = true;
      elements.forEach((e) => tweenAlpha(this, e, e.alpha, 0, 260));
      this.time.delayedCall(
        270,
        () => {
          elements.forEach((e) => e.destroy());
          this.skipBtn.destroy();
          this.scene.start('GameScene');
        },
        undefined,
        this
      );
    };

    this.skipBtn.onClick(close);

    const flashIndex = { value: 0 };
    this.time.addEvent({
      delay: 450,
      loop: true,
      callback: () => {
        const i = flashIndex.value % COLOR_KEYS.length;
        flashIndex.value += 1;
        const isMobile = this.TARGET_WIDTH < 600;
        const child = this.padsContainer.list[i * (isMobile ? 1 : 2)] as Phaser.GameObjects.Graphics | undefined;
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
