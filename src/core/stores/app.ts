import type { DailyData } from '../api';
import type { UserSettings } from './settings';

export interface AppState {
  data: DailyData | null;
  loading: boolean;
  error: string | null;
  lastFetch: string | null;
}

let state: AppState = {
  data: null,
  loading: false,
  error: null,
  lastFetch: null,
};

type StateListener = (state: AppState) => void;
const listeners: Set<StateListener> = new Set();

function notify() {
  for (const listener of listeners) {
    listener({ ...state });
  }
}

export function getState(): AppState {
  return { ...state };
}

export function subscribe(listener: StateListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setLoading(loading: boolean): void {
  state = { ...state, loading };
  notify();
}

export function setData(data: DailyData): void {
  state = { ...state, data, loading: false, error: null, lastFetch: new Date().toISOString() };
  notify();
}

export function setError(error: string): void {
  state = { ...state, error, loading: false };
  notify();
}

export async function loadDailyData(settings: UserSettings): Promise<void> {
  setLoading(true);
  try {
    const { fetchDailyData: fetchFn } = await import('../api');
    const data = await fetchFn(settings.latitude, settings.longitude, settings.zodiacSign);
    setData(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to fetch data');
  }
}
