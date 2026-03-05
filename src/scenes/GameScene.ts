import Phaser from 'phaser';
import { CountdownPanel } from '@/components/CountdownPanel';
import { ScorePanel } from '@/components/ScorePanel';
import { GAME_PLAY_CONFIG, UI_CONFIG } from '@/config/gameConfig';
import { COLOR_INT, COLOR_KEYS, KEY_CODE_MAP, KEY_MAP, UI_TEXT } from '@/config/constants';
import type { ColorKey } from '@/types';
import { createBeatRipple, createExplosion } from '@/animations/ParticleEffects';
import { showHitFeedback } from '@/animations/FeedbackEffects';
import { tweenMove, tweenScale } from '@/animations/TweenAnimations';
import { playSound } from '@/utils/audio';
import { pickRandom } from '@/utils/helper';
import { getStorageNumber, setStorageNumber } from '@/utils/storage';
import { pokiGameplayStart, pokiGameplayStop } from '@/utils/poki';
import { spawnColorBlock, type SpawnedBlock } from '@/components/ColorBlock';
import { createText } from '@/utils/ui';
import { BaseScene } from './BaseScene';

type Pad = {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  x: number;
  y: number;
  width: number;
  height: number;
};

export class GameScene extends BaseScene {
  private score = 0;
  private combo = 0;
  private timeLeft = GAME_PLAY_CONFIG.durationSeconds;
  private scorePanel!: ScorePanel;
  private countdownPanel!: CountdownPanel;
  private blocks!: Phaser.Physics.Arcade.Group;
  private pads!: Record<ColorKey, Pad>;
  private closing = false;
  private adaptiveFactor = 1;
  private beatIntensity = 0.4;
  private highScore = 0;
  private background!: Phaser.GameObjects.Graphics;
  private headerTitle!: Phaser.GameObjects.Text;
  private headerSubtitle!: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  protected onResize(width: number, height: number, zoom: number): void {
    if (this.background) {
      // Manually resize background to cover full screen, since it's just a gradient rect
      // We scale it inversely to zoom so it looks "fixed" in screen space but still rendered in world space
      const w = width / zoom;
      const h = height / zoom;
      this.background.clear();
      this.background.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
      // Center the background relative to the camera center (TARGET_WIDTH/2, TARGET_HEIGHT/2)
      // Top-left in world space would be:
      const worldX = (this.TARGET_WIDTH - w) / 2;
      const worldY = (this.TARGET_HEIGHT - h) / 2;
      this.background.fillRect(worldX, worldY, w, h);
    }
  }

  protected layout(): void {
    if (!this.pads) return;

    // 1. Header
    const w = this.TARGET_WIDTH;
    this.headerTitle.setX(w / 2);
    this.headerSubtitle.setX(w / 2);

    // 2. Panels
    this.countdownPanel.container.setX(w - 200);

    // 3. Pads & Blocks
    this.recreatePads(false);
  }

  create(): void {
    super.create();
    pokiGameplayStart();

    this.closing = false;
    this.score = 0;
    this.combo = 0;
    this.timeLeft = GAME_PLAY_CONFIG.durationSeconds;
    this.closing = false;
    this.adaptiveFactor = 1;
    this.beatIntensity = 0.4;
    this.highScore = getStorageNumber('colorBeat.highScore', 0);

    this.createBackground();
    this.createHeader();
    this.createPanels();
    this.recreatePads();

    this.blocks = this.physics.add.group({ allowGravity: false });

    this.setupInput();
    this.setupTimers();
    this.setupBeat();
  }

  update(): void {
    if (this.closing) return;
    const h = this.TARGET_HEIGHT;
    const outY = h + 70;

    this.blocks.children.each((child: Phaser.GameObjects.GameObject) => {
      const block = child as SpawnedBlock;
      const matched = Boolean(block.getData('matched'));
      if (!matched && block.y >= outY) {
        block.destroy();
        this.applyScore(GAME_PLAY_CONFIG.score.out, 'minus');
        this.combo = 0;
      }
      return null;
    });
  }

  private createBackground(): void {
    const w = this.TARGET_WIDTH;
    const h = this.TARGET_HEIGHT;
    this.background = this.add.graphics();
    this.background.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    this.background.fillRect(0, 0, w, h);

    this.tweens.add({
      targets: this.background,
      y: { from: 0, to: -18 },
      duration: 10000,
      yoyo: true,
      loop: -1,
      ease: 'Sine.easeInOut',
    });

    const mask = this.add.graphics();
    mask.fillGradientStyle(0xffffff, 0xffffff, 0xffffff, 0xffffff, 1);
    mask.fillRect(0, h - 140, w, 140);
    mask.setAlpha(0.06);

    this.background.setDepth(0);
    mask.setDepth(1);
  }

  private createHeader(): void {
    const w = this.TARGET_WIDTH;
    this.headerTitle = createText(this, w / 2, 22, UI_TEXT.title, UI_CONFIG.text.title).setOrigin(0.5);
    this.headerTitle.setTintFill(0x4cc9f0, 0x7209b7, 0x7209b7, 0x4cc9f0);
    tweenScale(this, this.headerTitle, 1, 1.05, 2000, true);

    this.headerSubtitle = createText(this, w / 2, 52, UI_TEXT.subtitle, UI_CONFIG.text.subtitle).setOrigin(0.5);
    this.headerSubtitle.setAlpha(0.85);

    const fromY = -40;
    const toY = this.headerTitle.y;
    this.headerTitle.setY(fromY);
    this.tweens.add({
      targets: this.headerTitle,
      y: toY,
      duration: 500,
      ease: 'Power1',
    });
  }

  private createPanels(): void {
    const w = this.TARGET_WIDTH;
    this.scorePanel = new ScorePanel(this, 20, 20);
    this.countdownPanel = new CountdownPanel(this, w - 200, 20);

    // Score panel enters from left
    this.scorePanel.container.setPosition(-220, 20);
    tweenMove(this, this.scorePanel.container, -220, 20, 20, 20, 500);

    // Countdown panel enters from right
    this.countdownPanel.container.setPosition(w + 220, 20);
    tweenMove(this, this.countdownPanel.container, w + 220, 20, w - 200, 20, 500);

    this.scorePanel.setScore(this, this.score, 'none');
    this.countdownPanel.setTime(this, this.timeLeft);
  }

  private recreatePads(animate: boolean = true): void {
    if (this.pads) {
      Object.values(this.pads).forEach((p) => p.container.destroy());
    }

    const w = this.TARGET_WIDTH;
    const h = this.TARGET_HEIGHT;
    const padH = GAME_PLAY_CONFIG.hitPadHeight;
    const gap = 10;
    // Calculate precise pad width
    const padW = Math.floor((w - gap * 5) / 4);
    
    // Calculate total width used by pads and gaps
    const totalWidth = 4 * padW + 5 * gap;
    // Calculate left offset to center the group perfectly
    const startX = (w - totalWidth) / 2 + gap + padW / 2;

    const isMobile = w < 600;
    const bottomMargin = isMobile ? 48 : 18;
    const y = h - padH / 2 - bottomMargin;

    const pads = {} as Record<ColorKey, Pad>;

    COLOR_KEYS.forEach((color, idx) => {
      const x = startX + idx * (padW + gap);
      const bg = this.add.graphics();
      const r = UI_CONFIG.radius.pad;
      
      // 1. Shadow (Depth)
      bg.fillStyle(0x000000, 0.25);
      bg.fillRoundedRect(-padW / 2 + 2, -padH / 2 + 4, padW, padH, r);

      // 2. Base (Color)
      bg.fillStyle(COLOR_INT[color], 0.85);
      bg.fillRoundedRect(-padW / 2, -padH / 2, padW, padH, r);

      // 3. Inner Shadow (Concave feel)
      bg.lineStyle(2, 0x000000, 0.15);
      bg.strokeRoundedRect(-padW / 2 + 1, -padH / 2 + 1, padW - 2, padH - 2, r);

      // 4. Glossy Highlight
      bg.fillStyle(0xffffff, 0.2);
      bg.fillEllipse(0, -padH * 0.3, padW * 0.8, padH * 0.35);

      const label = createText(this, 0, 0, isMobile ? '' : KEY_MAP[color], { ...UI_CONFIG.text.small, color: '#ffffff' }).setOrigin(0.5);

      const container = this.add.container(x, y, [bg, label]);
      container.setSize(padW, padH);

      // Create a significantly larger hit area for mobile responsiveness
      // 1. Width: Extend to the midpoint of gaps on both sides (padW + gap)
      // 2. Height: Extend from well above the pad (for early taps) to well below the screen bottom
      const hitW = padW + gap;
      
      // Top relative to container center (-padH/2 is top edge). 
      // Go 1.5x pad height above top edge.
      const topOffset = -padH / 2 - padH * 1.5; 
      
      // Bottom relative to container center (padH/2 is bottom edge).
      // Go all the way to bottom of screen (padH/2 + bottomMargin) plus extra buffer.
      const bottomOffset = padH / 2 + bottomMargin + 50;

      const hitH = bottomOffset - topOffset;
      const hitY = topOffset; // Rectangle(x, y, w, h) where x,y is top-left relative to container
      
      const hit = new Phaser.Geom.Rectangle(-hitW / 2, hitY, hitW, hitH);
      container.setInteractive(hit, Phaser.Geom.Rectangle.Contains);

      // Debug: Visualize Hit Area
      // const debug = this.add.graphics();
      // debug.lineStyle(2, 0x00ff00, 0.5);
      // debug.strokeRect(-hitW / 2, hitY, hitW, hitH);
      // container.add(debug);

      this.tweens.add({
        targets: container,
        alpha: { from: 0.8, to: 0.92 },
        duration: 2000,
        yoyo: true,
        loop: -1,
        ease: 'Sine.easeInOut',
      });

      container.on('pointerdown', () => this.handleInput(color));

      pads[color] = { container, bg, label, x, y, width: padW, height: padH };
    });

    this.pads = pads;

    if (animate) {
      this.tweens.add({
        targets: Object.values(pads).map((p) => p.container),
        y: { from: y + 80, to: y },
        alpha: { from: 0, to: 1 },
        duration: 500,
        ease: 'Power1',
        stagger: 40,
      });
    }

    // Update existing blocks position if any
    if (this.blocks) {
      this.blocks.children.each((child) => {
        const block = child as SpawnedBlock;
        if (block.active && block.colorKey && this.pads[block.colorKey]) {
           const newPad = this.pads[block.colorKey];
           block.x = newPad.x + Phaser.Math.Between(-6, 6);
        }
        return null;
      });
    }
  }

  private setupInput(): void {
    this.input.keyboard?.on('keydown', (ev: KeyboardEvent) => {
      if (this.closing) return;
      const code = ev.code;
      const color = (Object.keys(KEY_CODE_MAP) as ColorKey[]).find((c) => KEY_CODE_MAP[c] === code);
      if (!color) return;
      this.handleInput(color);
    });
  }

  private setupTimers(): void {
    this.time.addEvent({
      delay: GAME_PLAY_CONFIG.spawnIntervalMs,
      loop: true,
      callback: () => this.spawnBlock(),
    });

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.closing) return;
        this.timeLeft -= 1;
        this.countdownPanel.setTime(this, this.timeLeft);

        if (this.timeLeft === GAME_PLAY_CONFIG.durationSeconds - GAME_PLAY_CONFIG.adaptive.evaluateAtSeconds) {
          this.evaluateAdaptive();
        }

        if (this.timeLeft <= 0) {
          this.endGame();
        }
      },
    });
  }

  private setupBeat(): void {
    this.time.addEvent({
      delay: GAME_PLAY_CONFIG.beat.intervalMs,
      loop: true,
      callback: () => {
        if (this.closing) return;
        const w = this.TARGET_WIDTH;
        const h = this.TARGET_HEIGHT;
        const x = Phaser.Math.Between(Math.floor(w * 0.2), Math.floor(w * 0.8));
        const y = Phaser.Math.Between(Math.floor(h * 0.2), Math.floor(h * 0.6));
        const color = COLOR_INT[pickRandom(COLOR_KEYS)];
        createBeatRipple(this, x, y, color, 0.14 + 0.08 * this.beatIntensity);
        playSound('beat', this.beatIntensity);
        this.beatIntensity = Math.max(0.35, this.beatIntensity * 0.9);
      },
    });
  }

  private spawnBlock(): void {
    if (this.closing) return;
    const color = pickRandom(COLOR_KEYS);
    const pad = this.pads[color];
    const x = pad.x + Phaser.Math.Between(-6, 6);
    const y = -40;

    const elapsed = GAME_PLAY_CONFIG.durationSeconds - this.timeLeft;
    const baseSpeed =
      elapsed < 20 ? GAME_PLAY_CONFIG.speed.slow : elapsed < 40 ? GAME_PLAY_CONFIG.speed.medium : GAME_PLAY_CONFIG.speed.fast;

    const speed = Math.floor(baseSpeed * this.adaptiveFactor);
    spawnColorBlock(this, this.blocks, color, x, y, speed);
  }

  private handleInput(color: ColorKey): void {
    if (this.closing) return;
    this.flashPad(color);

    const target = this.findBestMatch(color);
    const pad = this.pads[color];
    
    if (!target) {
      playSound('miss', 0.8);
      this.applyScore(GAME_PLAY_CONFIG.score.miss, 'minus');
      this.combo = 0;
      showHitFeedback(this, pad.x, pad.y - 40, 'miss');
      return;
    }

    const dy = Math.abs(target.y - pad.y);
    if (dy <= GAME_PLAY_CONFIG.judge.perfectPx) {
      this.onHit(target, color, 'perfect');
      return;
    }
    if (dy <= GAME_PLAY_CONFIG.judge.goodPx) {
      this.onHit(target, color, 'good');
      return;
    }

    playSound('miss', 0.8);
    this.applyScore(GAME_PLAY_CONFIG.score.miss, 'minus');
    this.combo = 0;
    showHitFeedback(this, target.x, target.y, 'miss');
  }

  private findBestMatch(color: ColorKey): SpawnedBlock | null {
    const pad = this.pads[color];
    let best: SpawnedBlock | null = null;
    let bestDy = Number.POSITIVE_INFINITY;

    this.blocks.children.each((child) => {
      const block = child as SpawnedBlock;
      const matched = Boolean(block.getData('matched'));
      if (matched) return null;
      if (block.colorKey !== color) return null;
      const dy = Math.abs(block.y - pad.y);
      if (dy > GAME_PLAY_CONFIG.judge.goodPx) return null;
      if (dy < bestDy) {
        bestDy = dy;
        best = block;
      }
      return null;
    });

    return best;
  }

  private onHit(block: SpawnedBlock, color: ColorKey, quality: 'perfect' | 'good'): void {
    block.setData('matched', true);
    const pad = this.pads[color];

    const base = quality === 'perfect' ? GAME_PLAY_CONFIG.score.perfect : GAME_PLAY_CONFIG.score.good;
    const nextCombo = quality === 'perfect' ? this.combo + 1 : 0;
    this.combo = nextCombo;
    const mult = 1 + Math.min(2, Math.floor(this.combo / 6)) * 0.5;
    const delta = Math.round(base * mult);

    this.applyScore(delta, 'plus');
    this.beatIntensity = Math.min(1, this.beatIntensity + (quality === 'perfect' ? 0.18 : 0.12));

    if (quality === 'perfect') {
      playSound('perfect', 1);
      this.cameras.main.shake(120, 0.005);
    } else {
      playSound('good', 0.95);
      this.cameras.main.shake(80, 0.002);
    }

    createExplosion(this, block.x, block.y, COLOR_INT[color], quality);
    showHitFeedback(this, block.x, block.y, quality);

    this.tweens.add({
      targets: block,
      scale: { from: block.scale, to: 0 },
      duration: 180,
      ease: 'Power1',
      onComplete: () => block.destroy(),
    });

    if (delta >= 300) {
      const flash = this.add.rectangle(this.TARGET_WIDTH / 2, this.TARGET_HEIGHT / 2, this.TARGET_WIDTH, this.TARGET_HEIGHT, COLOR_INT[color], 0.24);
      flash.setDepth(60);
      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 220,
        ease: 'Power1',
        onComplete: () => flash.destroy(),
      });
    }

    const glow = this.add.graphics();
    glow.lineStyle(4, COLOR_INT[color], 0.65);
    glow.strokeRoundedRect(pad.x - pad.width / 2 - 6, pad.y - pad.height / 2 - 6, pad.width + 12, pad.height + 12, UI_CONFIG.radius.pad);
    glow.setDepth(30);
    this.tweens.add({
      targets: glow,
      alpha: 0,
      duration: 280,
      ease: 'Power1',
      onComplete: () => glow.destroy(),
    });
  }

  private flashPad(color: ColorKey): void {
    const pad = this.pads[color];
    this.tweens.add({
      targets: pad.container,
      scale: { from: 1.05, to: 1 },
      duration: 110,
      ease: 'Power1',
    });
    this.tweens.add({
      targets: pad.container,
      alpha: { from: 1, to: 0.92 },
      duration: 160,
      ease: 'Power1',
    });
  }

  private evaluateAdaptive(): void {
    if (this.score <= GAME_PLAY_CONFIG.adaptive.lowScore) {
      this.adaptiveFactor = GAME_PLAY_CONFIG.adaptive.slowFactor;
      return;
    }
    if (this.score >= GAME_PLAY_CONFIG.adaptive.highScore) {
      this.adaptiveFactor = GAME_PLAY_CONFIG.adaptive.fastFactor;
      return;
    }
    this.adaptiveFactor = 1;
  }

  private applyScore(delta: number, flash: 'plus' | 'minus' | 'none'): void {
    this.score = Math.max(0, this.score + delta);
    this.scorePanel.setScore(this, this.score, flash);
  }

  private endGame(): void {
    if (this.closing) return;
    this.closing = true;
    pokiGameplayStop();

    const nextHigh = Math.max(this.highScore, this.score);
    if (nextHigh !== this.highScore) setStorageNumber('colorBeat.highScore', nextHigh);

    this.registry.set('colorBeat.lastScore', this.score);
    this.registry.set('colorBeat.highScore', nextHigh);

    const fade = this.add.rectangle(this.TARGET_WIDTH / 2, this.TARGET_HEIGHT / 2, this.TARGET_WIDTH, this.TARGET_HEIGHT, 0x000000, 0);
    fade.setDepth(200);
    this.tweens.add({
      targets: fade,
      alpha: 1,
      duration: 260,
      ease: 'Power1',
      onComplete: () => {
        fade.destroy();
        this.scene.start('GameOverScene');
      },
    });
  }
}
