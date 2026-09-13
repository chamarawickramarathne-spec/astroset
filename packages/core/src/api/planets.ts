import { Body, GeoVector, Ecliptic, SearchMoonPhase, SearchLunarApsis, NextLunarApsis, ApsisKind } from 'astronomy-engine';
import type { PlanetPosition, MoonEvent, PlanetaryEvent } from '../types/astrology';

const SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const BODIES: { body: Body; name: string; glyph: string }[] = [
  { body: Body.Sun, name: 'Sun', glyph: '☉' },
  { body: Body.Moon, name: 'Moon', glyph: '☽' },
  { body: Body.Mercury, name: 'Mercury', glyph: '☿' },
  { body: Body.Venus, name: 'Venus', glyph: '♀' },
  { body: Body.Mars, name: 'Mars', glyph: '♂' },
  { body: Body.Jupiter, name: 'Jupiter', glyph: '♃' },
  { body: Body.Saturn, name: 'Saturn', glyph: '♄' },
  { body: Body.Uranus, name: 'Uranus', glyph: '♅' },
  { body: Body.Neptune, name: 'Neptune', glyph: '♆' },
  { body: Body.Pluto, name: 'Pluto', glyph: '♇' },
];

function eclipticLongitude(body: Body, date: Date): number {
  const vector = GeoVector(body, date, true);
  const ecl = Ecliptic(vector);
  let lon = ecl.elon;
  if (lon < 0) lon += 360;
  return lon;
}

function normalizeDelta(delta: number): number {
  let d = delta;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

export function getPlanetaryPositions(date: Date = new Date()): PlanetPosition[] {
  const later = new Date(date.getTime() + 6 * 60 * 60 * 1000);

  return BODIES.map(({ body, name, glyph }) => {
    const lon = eclipticLongitude(body, date);
    const lonLater = eclipticLongitude(body, later);

    const signIndex = Math.floor(lon / 30) % 12;

    return {
      planet: name,
      glyph,
      sign: SIGNS[signIndex],
      degreeInSign: Math.round((lon % 30) * 10) / 10,
      longitude: Math.round(lon * 100) / 100,
      retrograde: normalizeDelta(lonLater - lon) < 0 && name !== 'Sun' && name !== 'Moon',
    };
  });
}

const MOON_PHASES: { lon: number; type: MoonEvent['type']; label: string; emoji: string }[] = [
  { lon: 0, type: 'new_moon', label: 'New Moon', emoji: '🌑' },
  { lon: 90, type: 'first_quarter', label: 'First Quarter', emoji: '🌓' },
  { lon: 180, type: 'full_moon', label: 'Full Moon', emoji: '🌕' },
  { lon: 270, type: 'last_quarter', label: 'Last Quarter', emoji: '🌗' },
];

export function getUpcomingMoonEvents(days = 30): MoonEvent[] {
  const now = new Date();
  const horizon = now.getTime() + days * 24 * 60 * 60 * 1000;
  const events: MoonEvent[] = [];

  for (const phase of MOON_PHASES) {
    const time = SearchMoonPhase(phase.lon, now, days + 5);
    if (time && time.date.getTime() <= horizon) {
      events.push({
        type: phase.type,
        label: phase.label,
        emoji: phase.emoji,
        date: time.date.toISOString(),
      });
    }
  }

  try {
    let apsis = SearchLunarApsis(now);
    for (let i = 0; i < 6; i++) {
      if (apsis.time.date.getTime() > horizon) break;
      const isPerigee = apsis.kind === ApsisKind.Pericenter;
      events.push({
        type: isPerigee ? 'perigee' : 'apogee',
        label: isPerigee ? 'Perigee (closest)' : 'Apogee (farthest)',
        emoji: isPerigee ? '📍' : '🔭',
        date: apsis.time.date.toISOString(),
        detail: `${Math.round(apsis.dist_km).toLocaleString()} km from Earth`,
      });
      apsis = NextLunarApsis(apsis);
    }
  } catch {
    // apsis search is best-effort; phase events are already collected
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export function getUpcomingPlanetaryEvents(days = 30): PlanetaryEvent[] {
  const now = new Date();
  const horizon = now.getTime() + days * 24 * 60 * 60 * 1000;
  const STEP_MS = 12 * 60 * 60 * 1000;
  const events: PlanetaryEvent[] = [];

  for (const { body, name, glyph } of BODIES) {
    if (body === Body.Sun || body === Body.Moon) continue;

    let prevLon = eclipticLongitude(body, now);
    const pastLon = eclipticLongitude(body, new Date(now.getTime() - STEP_MS));
    let prevDirection = Math.sign(normalizeDelta(prevLon - pastLon));

    for (let t = now.getTime() + STEP_MS; t <= horizon; t += STEP_MS) {
      const date = new Date(t);
      const lon = eclipticLongitude(body, date);
      const direction = Math.sign(normalizeDelta(lon - prevLon));

      if (direction !== 0 && prevDirection !== 0 && direction !== prevDirection) {
        events.push({
          planet: name,
          glyph,
          type: direction < 0 ? 'retrograde_start' : 'retrograde_end',
          label: direction < 0 ? `${name} turns retrograde` : `${name} turns direct`,
          date: date.toISOString(),
        });
      }

      if (Math.floor(lon / 30) !== Math.floor(prevLon / 30)) {
        const newSign = SIGNS[Math.floor(lon / 30) % 12];
        events.push({
          planet: name,
          glyph,
          type: 'sign_ingress',
          label: `${name} enters ${newSign}`,
          date: date.toISOString(),
        });
      }

      if (direction !== 0) prevDirection = direction;
      prevLon = lon;
    }
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}
