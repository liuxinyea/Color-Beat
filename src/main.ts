import Phaser from 'phaser';
import { GAME_CONFIG, GAME_RENDER_RESOLUTION } from '@/config/gameConfig';
import { PreloaderScene } from '@/scenes/PreloaderScene';
import { GuideScene } from '@/scenes/GuideScene';
import { GameOverScene } from '@/scenes/GameOverScene';
import { GameScene } from '@/scenes/GameScene';
import { pokiLoadingFinished, pokiLoadingStart } from '@/utils/poki';

pokiLoadingStart();

const game = new Phaser.Game({
  ...GAME_CONFIG,
  resolution: GAME_RENDER_RESOLUTION,
  scene: [PreloaderScene, GuideScene, GameScene, GameOverScene],
} as unknown as Phaser.Types.Core.GameConfig);

game.events.once(Phaser.Core.Events.READY, () => {
  pokiLoadingFinished();
});
