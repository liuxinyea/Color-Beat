declare global {
  interface Window {
    CrazyGames: {
      SDK: {
        init: () => Promise<void>;
        game: {
          gameplayStart: () => void;
          gameplayStop: () => void;
          happytime: () => void;
        };
        ad: {
          requestAd: (type: 'midgame' | 'rewarded', callbacks?: {
            adStarted?: () => void;
            adFinished?: () => void;
            adError?: (error: unknown) => void;
          }) => void;
        };
      };
    };
  }
}

export class CrazyGamesSDK {
  private static instance: CrazyGamesSDK;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): CrazyGamesSDK {
    if (!CrazyGamesSDK.instance) {
      CrazyGamesSDK.instance = new CrazyGamesSDK();
    }
    return CrazyGamesSDK.instance;
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    try {
      if (window.CrazyGames?.SDK) {
        await window.CrazyGames.SDK.init();
        this.isInitialized = true;
        console.log('CrazyGames SDK initialized');
      } else {
        console.warn('CrazyGames SDK not found in window');
      }
    } catch (error) {
      console.error('Failed to initialize CrazyGames SDK:', error);
    }
  }

  public gameplayStart(): void {
    if (!this.isInitialized) return;
    try {
      window.CrazyGames.SDK.game.gameplayStart();
    } catch (e) {
      console.warn('SDK Error:', e);
    }
  }

  public gameplayStop(): void {
    if (!this.isInitialized) return;
    try {
      window.CrazyGames.SDK.game.gameplayStop();
    } catch (e) {
      console.warn('SDK Error:', e);
    }
  }

  public happyTime(): void {
    if (!this.isInitialized) return;
    try {
      window.CrazyGames.SDK.game.happytime();
    } catch (e) {
      console.warn('SDK Error:', e);
    }
  }

  public requestMidgameAd(callbacks?: { adStarted?: () => void; adFinished?: () => void; adError?: (error: unknown) => void }): void {
    if (!this.isInitialized) {
      callbacks?.adFinished?.();
      return;
    }
    window.CrazyGames.SDK.ad.requestAd('midgame', {
      adStarted: () => {
        console.log('Ad started');
        callbacks?.adStarted?.();
      },
      adFinished: () => {
        console.log('Ad finished');
        callbacks?.adFinished?.();
      },
      adError: (error) => {
        console.warn('Ad error:', error);
        callbacks?.adError?.(error);
      },
    });
  }

  public requestRewardedAd(callbacks?: { adStarted?: () => void; adFinished?: () => void; adError?: (error: unknown) => void }): void {
    if (!this.isInitialized) {
      callbacks?.adError?.('SDK not initialized');
      return;
    }
    window.CrazyGames.SDK.ad.requestAd('rewarded', {
      adStarted: () => {
        console.log('Rewarded Ad started');
        callbacks?.adStarted?.();
      },
      adFinished: () => {
        console.log('Rewarded Ad finished');
        callbacks?.adFinished?.();
      },
      adError: (error) => {
        console.warn('Rewarded Ad error:', error);
        callbacks?.adError?.(error);
      },
    });
  }
}

export const sdk = CrazyGamesSDK.getInstance();
