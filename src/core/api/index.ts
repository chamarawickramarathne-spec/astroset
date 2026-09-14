import { getVedicPanchang, getMoonPhase } from './vedastro';
import { getSkyEvents, getMoonPhaseCosmyDay, getDailyHoroscope } from './cosmyday';
import { getSolarData } from './noaa';
import { getWeatherForecast } from './openmeteo';
import { getPlanetaryPositions, getUpcomingMoonEvents, getUpcomingPlanetaryEvents } from './planets';

import type { AstrologyData } from '../types/astrology';
import type { SolarData } from '../types/solar';
import type { WeatherData } from '../types/weather';

export interface DailyData {
  astrology: AstrologyData;
  solar: SolarData;
  weather: WeatherData;
  fetchedAt: string;
}

export async function fetchDailyData(
  latitude: number,
  longitude: number,
  zodiacSign: string
): Promise<DailyData> {
  const today = new Date().toISOString().split('T')[0];

  // Weather first so its auto-resolved IANA timezone can drive panchanga times.
  // Horoscope + solar run in parallel with weather (location-independent / independent).
  const [horoscope, solarData, weatherData] = await Promise.all([
    getDailyHoroscope(zodiacSign).catch(() => null),
    getSolarData().catch(() => null),
    getWeatherForecast(latitude, longitude).catch(() => null),
  ]);

  const timezone = weatherData?.timezone;
  const [panchang, moonPhase] = timezone
    ? await Promise.all([
        getVedicPanchang(today, latitude, longitude, timezone).catch(() => null),
        getMoonPhase(today, latitude, longitude, timezone).catch(() => null),
      ])
    : [null, null];

  return {
    astrology: {
      panchang: panchang || undefined,
      moonPhase: moonPhase || undefined,
      horoscope: horoscope
        ? {
            sign: horoscope.sign,
            date: horoscope.date,
            description: horoscope.description,
            luckyNumber: horoscope.luckyNumber,
            luckyColor: horoscope.luckyColor,
            mood: horoscope.mood,
          }
        : undefined,
      planetaryPositions: getPlanetaryPositions(),
      moonEvents: getUpcomingMoonEvents(30),
      planetaryEvents: getUpcomingPlanetaryEvents(30),
    },
    solar: solarData || {
      flares: [],
      storms: [],
      solarWind: { speed: 0, density: 0, temperature: 0, bz: null, timestamp: '' },
      kpIndex: { timestamp: '', value: 0, severity: 'Unknown' },
      aurora: { kpIndex: 0, visibilityLatitude: 0, probability: 0 },
      events: [],
      xrayFlux: [],
    },
    weather: weatherData || {
      location: '',
      latitude,
      longitude,
      daily: [],
      timezone: 'UTC',
    },
    fetchedAt: new Date().toISOString(),
  };
}

export { getVedicPanchang, getMoonPhase, computeMoonMetrics } from './vedastro';
export { getSkyEvents, getMoonPhaseCosmyDay, getDailyHoroscope } from './cosmyday';
export * from './noaa';
export { getWeatherForecast, getHourlyForecast } from './openmeteo';
export {
  getPlanetaryPositions,
  getUpcomingMoonEvents,
  getUpcomingPlanetaryEvents,
} from './planets';
export { getSchumannData } from './schumann';
