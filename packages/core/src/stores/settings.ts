import { getActiveStorage } from '../cache';

export interface UserSettings {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  zodiacSign: string;
  notificationsEnabled: boolean;
  notificationTime: string;
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_SETTINGS: UserSettings = {
  latitude: 6.9271,
  longitude: 79.8612,
  city: 'Colombo',
  country: 'Sri Lanka',
  zodiacSign: 'aries',
  notificationsEnabled: true,
  notificationTime: '07:00',
  theme: 'system',
};

const SETTINGS_STORAGE_KEY = 'astroset:settings';

let settings: UserSettings = { ...DEFAULT_SETTINGS };
let settingsRevision = 0;

export function getSettings(): UserSettings {
  return { ...settings };
}

/** Bumps whenever settings are saved; screens can reload when this changes. */
export function getSettingsRevision(): number {
  return settingsRevision;
}

function bumpSettingsRevision(): void {
  settingsRevision += 1;
}

export function updateSettings(partial: Partial<UserSettings>): UserSettings {
  settings = { ...settings, ...partial };
  bumpSettingsRevision();
  return { ...settings };
}

export async function saveSettings(partial: Partial<UserSettings>): Promise<UserSettings> {
  settings = { ...settings, ...partial };
  await getActiveStorage().setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  bumpSettingsRevision();
  return { ...settings };
}

export async function loadSettings(): Promise<UserSettings> {
  const raw = await getActiveStorage().getItem(SETTINGS_STORAGE_KEY);
  if (raw !== null) {
    const stored = JSON.parse(raw) as Partial<UserSettings>;
    settings = { ...DEFAULT_SETTINGS, ...stored };
  }
  return { ...settings };
}

export function resetSettings(): UserSettings {
  settings = { ...DEFAULT_SETTINGS };
  bumpSettingsRevision();
  return { ...settings };
}
