type PokiSDK = {
  gameLoadingStart?: () => void;
  gameLoadingFinished?: () => void;
  gameplayStart?: () => void;
  gameplayStop?: () => void;
};

const getPoki = (): PokiSDK | null => {
  const w = window as unknown as { PokiSDK?: PokiSDK };
  return w.PokiSDK ?? null;
};

export const pokiLoadingStart = (): void => {
  try {
    getPoki()?.gameLoadingStart?.();
  } catch {
    return;
  }
};

export const pokiLoadingFinished = (): void => {
  try {
    getPoki()?.gameLoadingFinished?.();
  } catch {
    return;
  }
};

export const pokiGameplayStart = (): void => {
  try {
    getPoki()?.gameplayStart?.();
  } catch {
    return;
  }
};

export const pokiGameplayStop = (): void => {
  try {
    getPoki()?.gameplayStop?.();
  } catch {
    return;
  }
};
