import { Body, Illumination, SearchMoonPhase } from 'astronomy-engine';
import { PanchangData, MoonPhase } from '../types/astrology';

const KUNDLIT_BASE = 'https://kundlit.com/api/astro';

async function fetchPanchanga(
  date: string,
  latitude: number,
  longitude: number,
  timezone: string
): Promise<Record<string, unknown>> {
  const response = await fetch(`${KUNDLIT_BASE}/panchanga`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date,
      latitude,
      longitude,
      timezone,
    }),
  });
  if (!response.ok) throw new Error('Failed to fetch Vedic panchang');
  return response.json();
}

function kaalRange(kaal: unknown): string {
  if (!kaal || typeof kaal !== 'object') return 'N/A';
  const k = kaal as { start_time?: string; end_time?: string };
  return k.start_time ? `${k.start_time} - ${k.end_time}` : 'N/A';
}

export async function getVedicPanchang(
  date: string,
  latitude: number,
  longitude: number,
  timezone: string
): Promise<PanchangData> {
  const data = await fetchPanchanga(date, latitude, longitude, timezone);

  const tithiObj = data.tithi as { name?: string; paksha?: string } | undefined;
  const tithi = tithiObj?.name || 'N/A';
  const paksha = tithiObj?.paksha || '';
  const tithiLabel = paksha ? `${paksha} ${tithi}` : tithi;

  const nakshatra = data.nakshatra as { name?: string } | undefined;
  const karana = data.karana as { name?: string } | undefined;
  const vaara = data.vaara as { name?: string } | undefined;

  return {
    tithi: tithiLabel,
    nakshatra: nakshatra?.name || 'N/A',
    karana: karana?.name || 'N/A',
    vara: vaara?.name || 'N/A',
    sunrise: (data.sun_rise as string) || 'N/A',
    sunset: (data.sun_set as string) || 'N/A',
    moonrise: (data.moon_rise as string) || 'N/A',
    moonset: (data.moon_set as string) || 'N/A',
    rahuKaal: kaalRange(data.rahu_kaal),
    yamagandaKaal: kaalRange(data.yamaganda_kaal),
    gulikaKaal: kaalRange(data.gulika_kaal),
  };
}

function moonEmojiFromTithi(phase: string): string {
  const phaseLower = phase.toLowerCase();
  if (phaseLower.includes('amavasya')) return '🌑';
  if (phaseLower.includes('purnima')) return '🌕';
  if (phaseLower.includes('pratipada') || phaseLower.includes('dwitiya')) return '🌒';
  if (phaseLower.includes('tritiya') || phaseLower.includes('chaturthi')) return '🌓';
  if (phaseLower.includes('panchami') || phaseLower.includes('shashthi')) return '🌔';
  if (phaseLower.includes('saptami') || phaseLower.includes('ashtami') || phaseLower.includes('navami')) return '🌕';
  if (phaseLower.includes('dashami') || phaseLower.includes('ekadashi') || phaseLower.includes('dvadashi') || phaseLower.includes('dwadashi')) return '🌖';
  if (phaseLower.includes('trayodashi') || phaseLower.includes('chaturdashi')) return '🌗';
  return '🌑';
}

/** Exact illumination fraction and age (days since last new moon) via astronomy-engine. */
export function computeMoonMetrics(date: Date = new Date()): { illumination: number; age: number } {
  const info = Illumination(Body.Moon, date);
  const illumination = Math.round(info.phase_fraction * 1000) / 10;

  const lookback = new Date(date.getTime() - 35 * 24 * 60 * 60 * 1000);
  let lastNew = SearchMoonPhase(0, lookback, 40);
  if (!lastNew) {
    return { illumination, age: 0 };
  }
  while (true) {
    const next = SearchMoonPhase(0, new Date(lastNew.date.getTime() + 60_000), 35);
    if (!next || next.date.getTime() > date.getTime()) break;
    lastNew = next;
  }
  const ageMs = date.getTime() - lastNew.date.getTime();
  const age = Math.max(0, Math.round((ageMs / (24 * 60 * 60 * 1000)) * 10) / 10);
  return { illumination, age };
}

export async function getMoonPhase(
  date: string,
  latitude: number,
  longitude: number,
  timezone: string
): Promise<MoonPhase> {
  const data = await fetchPanchanga(date, latitude, longitude, timezone);
  const tithiObj = data.tithi as { name?: string } | undefined;
  const phase = tithiObj?.name || 'Unknown';
  const metrics = computeMoonMetrics(new Date());

  return {
    phase,
    illumination: metrics.illumination,
    age: metrics.age,
    emoji: moonEmojiFromTithi(phase),
  };
}
