export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

const memoryStore = new Map<string, string>();

export const memoryStorage: StorageAdapter = {
  async getItem(key) {
    return memoryStore.get(key) ?? null;
  },
  async setItem(key, value) {
    memoryStore.set(key, value);
  },
};

let activeStorage: StorageAdapter = memoryStorage;

export function configureStorage(adapter: StorageAdapter): void {
  activeStorage = adapter;
}

export function getActiveStorage(): StorageAdapter {
  return activeStorage;
}

export interface CachedResult<T> {
  data: T;
  fromCache: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<CachedResult<T>> {
  try {
    const data = await fetcher();
    try {
      const entry: CacheEntry<T> = { data, timestamp: Date.now() };
      await activeStorage.setItem(key, JSON.stringify(entry));
    } catch {
      // storage write failure must not discard fresh network data
    }
    return { data, fromCache: false };
  } catch (err) {
    let raw: string | null = null;
    try {
      raw = await activeStorage.getItem(key);
    } catch {
      raw = null;
    }
    if (raw === null) {
      throw err;
    }
    let entry: CacheEntry<T>;
    try {
      entry = JSON.parse(raw) as CacheEntry<T>;
    } catch {
      throw err;
    }
    return { data: entry.data, fromCache: true };
  }
}
