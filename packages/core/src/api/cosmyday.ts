import { MoonPhase } from '../types/astrology';

const COSMYDAY_BASE = 'https://api.cosmyday.com';

export interface SkyEvent {
  type: string;
  title: string;
  description: string;
  date: string;
  sign?: string;
}

export async function getSkyEvents(): Promise<SkyEvent[]> {
  const response = await fetch(`${COSMYDAY_BASE}/events/upcoming`);
  if (!response.ok) throw new Error('Failed to fetch sky events');

  const data = await response.json();
  return data.events || [];
}

export async function getMoonPhaseCosmyDay(): Promise<MoonPhase> {
  const response = await fetch(`${COSMYDAY_BASE}/content/moon`);
  if (!response.ok) throw new Error('Failed to fetch moon phase');

  const data = await response.json();
  return {
    phase: data.phase || 'Unknown',
    illumination: data.illumination || 0,
    age: data.age || 0,
    emoji: data.emoji || '🌑',
  };
}

export async function getDailyHoroscope(sign: string): Promise<{
  sign: string;
  date: string;
  description: string;
  luckyNumber?: number;
  luckyColor?: string;
  mood?: string;
}> {
  const response = await fetch(`${COSMYDAY_BASE}/content/daily/${sign.toLowerCase()}`);
  if (!response.ok) throw new Error('Failed to fetch daily horoscope');

  const data = await response.json();
  const description = data.content || data.description || data.horoscope;
  if (!description || typeof description !== 'string') {
    throw new Error('Horoscope response contained no content');
  }

  return {
    sign: data.sign || sign,
    date: data.date || new Date().toISOString().split('T')[0],
    description,
    luckyNumber: data.lucky_number,
    luckyColor: data.lucky_color,
    mood: data.mood,
  };
}
