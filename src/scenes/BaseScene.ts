import Phaser from 'phaser';

/**
 * A base scene that handles resizing logic for the "Ultimate Resolution" approach.
 * It uses Phaser's Scale.RESIZE mode but maintains a virtual viewport of 800x450.
 * The Main Camera is zoomed and centered to fit the content within the window,
 * ensuring 1:1 pixel mapping for vector graphics and text.
 */
export class BaseScene extends Phaser.Scene {
  protected TARGET_WIDTH = 800;
  protected TARGET_HEIGHT = 450;
  private resizeListener: ((gameSize: Phaser.Structs.Size) => void) | null = null;
  private isResizing = false;

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
    if (this.isResizing) return;
    this.isResizing = true;

    const width = gameSize.width;
    const height = gameSize.height;

    // Update target resolution based on orientation
    // Note: We don't set fixed TARGET_WIDTH/HEIGHT here anymore, we calculate them below.
    
    // Strategy: Fix the short dimension, expand the long dimension.
    // E.g. in Landscape, fix Height=450, let Width expand > 800.
    // In Portrait, fix Width=450, let Height expand > 800.
    
    // Let's implement "Fixed Height" for Landscape and "Fixed Width" for Portrait logic.
    let zoom = 1;
    if (height > width) {
      // Portrait: Fix Width to 450 (or whatever base width)
      const baseWidth = 450;
      zoom = width / baseWidth;
      this.TARGET_WIDTH = baseWidth;
      this.TARGET_HEIGHT = height / zoom;
    } else {
      // Landscape: Fix Height to 450
      const baseHeight = 450;
      zoom = height / baseHeight;
      this.TARGET_HEIGHT = baseHeight;
      this.TARGET_WIDTH = width / zoom;
    }

    this.cameras.main.setZoom(zoom);
    this.cameras.main.centerOn(this.TARGET_WIDTH / 2, this.TARGET_HEIGHT / 2);

    // Refresh scale manager safely
    this.scale.refresh();

    // If there's a background that needs to cover the full screen, derived scenes
    // should handle it or we can expose a hook here.
    this.onResize(width, height, zoom);
    
    // Trigger layout update
    this.layout();

    this.isResizing = false;
  }

  /**
   * Hook for derived scenes to handle specific resize logic (e.g. background)
   */
  protected onResize(_width: number, _height: number, _zoom: number): void {
    // To be overridden
  }

  /**
   * Hook for derived scenes to reposition elements
   */
  protected layout(): void {
    // To be overridden
  }

  // Cleanup
  shutdown(): void {
    if (this.resizeListener) {
      this.scale.off('resize', this.resizeListener);
    }
  }
}
