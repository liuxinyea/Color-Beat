import Phaser from 'phaser';
import { GAME_CONFIG, GAME_RENDER_RESOLUTION } from '@/config/gameConfig';
import { GuideScene } from '@/scenes/GuideScene';
import { GameOverScene } from '@/scenes/GameOverScene';
import { GameScene } from '@/scenes/GameScene';
import { pokiLoadingFinished, pokiLoadingStart } from '@/utils/poki';
import { sdk } from '@/utils/sdk';

pokiLoadingStart();
sdk.init();

const game = new Phaser.Game({
  ...GAME_CONFIG,
  resolution: GAME_RENDER_RESOLUTION,
  scene: [GuideScene, GameScene, GameOverScene],
} as unknown as Phaser.Types.Core.GameConfig);

game.events.once(Phaser.Core.Events.READY, () => {
  pokiLoadingFinished();
});
