const memoryStore = new Map<string, string>();

export const getStorageNumber = (key: string, fallback: number): number => {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    const raw = memoryStore.get(key);
    if (!raw) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }
};

export const setStorageNumber = (key: string, value: number): void => {
  const raw = String(value);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    memoryStore.set(key, raw);
  }
};
