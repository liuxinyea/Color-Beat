import Phaser from 'phaser';
import { tweenPop, tweenScale } from '@/animations/TweenAnimations';

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

    this.label = scene.add.text(0, 0, options.text, options.textStyle).setOrigin(0.5);

    this.container = scene.add.container(x, y, [this.bg, this.label]);
    this.container.setSize(this.width, this.height);

    const hit = new Phaser.Geom.Rectangle(-this.width / 2, -this.height / 2, this.width, this.height);
    this.container.setInteractive(hit, Phaser.Geom.Rectangle.Contains);

    this.container.on('pointerover', () => {
      tweenScale(scene, this.container, this.container.scale, 1.05, 100, false);
    });
    this.container.on('pointerout', () => {
      tweenScale(scene, this.container, this.container.scale, 1.0, 100, false);
    });
    this.container.on('pointerdown', () => {
      tweenPop(scene, this.container, 0.95, 100);
    });
  }

  setText(text: string): void {
    this.label.setText(text);
  }

  onClick(handler: () => void): void {
    this.container.on('pointerup', () => handler());
  }

  setDepth(depth: number): void {
    this.container.setDepth(depth);
  }

  destroy(): void {
    this.container.destroy(true);
  }

  private drawBg(): void {
    this.bg.clear();
    this.bg.fillStyle(this.fill, this.fillAlpha);
    this.bg.fillRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, this.radius);
  }
}
