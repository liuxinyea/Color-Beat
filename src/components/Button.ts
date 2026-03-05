import Phaser from 'phaser';
// import { tweenPop, tweenScale } from '@/animations/TweenAnimations';
import { createText } from '@/utils/ui';

type ButtonOptions = {
  width: number;
  height: number;
  radius: number;
  fill: number;
  fillAlpha?: number;
  text: string;
  textStyle: Phaser.Types.GameObjects.Text.TextStyle;
};

export class Button {
  readonly container: Phaser.GameObjects.Container;
  private readonly bg: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private readonly width: number;
  private readonly height: number;
  private readonly radius: number;
  private readonly fill: number;
  private readonly fillAlpha: number;

  constructor(scene: Phaser.Scene, x: number, y: number, options: ButtonOptions) {
    this.width = options.width;
    this.height = options.height;
    this.radius = options.radius;
    this.fill = options.fill;
    this.fillAlpha = options.fillAlpha ?? 1;

    this.bg = scene.add.graphics();
    this.drawBg();

    this.label = createText(scene, 0, 0, options.text, options.textStyle).setOrigin(0.5);

    this.container = scene.add.container(x, y, [this.bg, this.label]);
    this.container.setSize(this.width, this.height);

    // Use Zone for reliable hit area in Container
    const hitZone = scene.add.zone(0, 0, this.width, this.height);
    hitZone.setOrigin(0.5);
    this.container.add(hitZone);
    hitZone.setInteractive({ useHandCursor: true });

    hitZone.on('pointerover', () => {
      // tweenScale(scene, this.container, this.container.scale, 1.05, 100, false);
      // Scaling container inside its own event handler might be tricky if it affects hit area?
      // But we are using a child Zone now, so scaling container scales zone too.
      // Let's keep effect simple.
      this.container.setScale(1.05);
    });
    hitZone.on('pointerout', () => {
      this.container.setScale(1.0);
    });
    hitZone.on('pointerdown', () => {
      this.container.setScale(0.95);
    });
    hitZone.on('pointerup', () => {
      this.container.setScale(1.0);
      if (this.clickHandler) this.clickHandler();
    });
  }
  
  private clickHandler: (() => void) | null = null;

  setText(text: string): void {
    this.label.setText(text);
  }

  onClick(handler: () => void): void {
    this.clickHandler = handler;
  }

  setDepth(depth: number): void {
    this.container.setDepth(depth);
  }

  destroy(): void {
    this.container.destroy(true);
  }

  private drawBg(): void {
    this.bg.clear();
    const w = this.width;
    const h = this.height;
    const r = this.radius;

    // 1. Shadow (Ambient)
    this.bg.fillStyle(0x000000, 0.2);
    this.bg.fillRoundedRect(-w / 2 + 2, -h / 2 + 4, w, h, r);

    // 2. Base (Jelly Body)
    this.bg.fillStyle(this.fill, this.fillAlpha);
    this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);

    // 3. Inner Shadow (Soft depth)
    // Graphics masking is tricky for inner shadow in simple shapes, 
    // so we simulate it with a slightly darker stroke or overlay
    this.bg.lineStyle(2, 0x000000, 0.1);
    this.bg.strokeRoundedRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, r);

    // 4. Top Highlight (Glossy)
    this.bg.fillStyle(0xffffff, 0.25);
    this.bg.fillEllipse(0, -h * 0.3, w * 0.8, h * 0.35);

    // 5. Bottom Rim Light
    this.bg.fillStyle(0xffffff, 0.15);
    this.bg.fillEllipse(0, h * 0.35, w * 0.6, h * 0.15);
  }
}
