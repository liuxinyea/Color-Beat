import Phaser from 'phaser';

/**
 * A base scene that handles resizing logic for the "Ultimate Resolution" approach.
 * It uses Phaser's Scale.RESIZE mode but maintains a virtual viewport of 800x450.
 * The Main Camera is zoomed and centered to fit the content within the window,
 * ensuring 1:1 pixel mapping for vector graphics and text.
 */
export class BaseScene extends Phaser.Scene {
  protected readonly TARGET_WIDTH = 800;
  protected readonly TARGET_HEIGHT = 450;
  private resizeListener: ((gameSize: Phaser.Structs.Size) => void) | null = null;

  constructor(key: string) {
    super(key);
  }

  create(): void {
    // Initial setup
    this.handleResize(this.scale.gameSize);

    // Listen for resize events
    this.resizeListener = (gameSize: Phaser.Structs.Size) => this.handleResize(gameSize);
    this.scale.on('resize', this.resizeListener);

    this.events.on('shutdown', this.shutdown, this);
  }

  protected handleResize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;
    const height = gameSize.height;

    // Calculate zoom to fit the target area (800x450) into the current window
    // consistently like Scale.FIT but with native resolution
    const zoomX = width / this.TARGET_WIDTH;
    const zoomY = height / this.TARGET_HEIGHT;
    const zoom = Math.min(zoomX, zoomY);

    this.cameras.main.setZoom(zoom);
    this.cameras.main.centerOn(this.TARGET_WIDTH / 2, this.TARGET_HEIGHT / 2);

    // If there's a background that needs to cover the full screen, derived scenes
    // should handle it or we can expose a hook here.
    this.onResize(width, height, zoom);
  }

  /**
   * Hook for derived scenes to handle specific resize logic (e.g. background)
   */
  protected onResize(_width: number, _height: number, _zoom: number): void {
    // To be overridden
  }

  // Cleanup
  shutdown(): void {
    if (this.resizeListener) {
      this.scale.off('resize', this.resizeListener);
    }
  }
}
