export interface PanchangData {
  tithi: string;
  nakshatra: string;
  karana: string;
  vara: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rahuKaal: string;
  yamagandaKaal: string;
  gulikaKaal: string;
}

export interface WesternTransit {
  planet: string;
  sign: string;
  degree: number;
  retrograde: boolean;
  house?: number;
  aspect?: string;
}

export interface DailyHoroscope {
  sign: string;
  date: string;
  description: string;
  luckyNumber?: number;
  luckyColor?: string;
  mood?: string;
  compatibility?: string;
}

export interface MoonPhase {
  phase: string;
  illumination: number;
  age: number;
  emoji: string;
}

export interface PlanetPosition {
  planet: string;
  glyph: string;
  sign: string;
  degreeInSign: number;
  longitude: number;
  retrograde: boolean;
}

export interface MoonEvent {
  type: 'new_moon' | 'first_quarter' | 'full_moon' | 'last_quarter' | 'perigee' | 'apogee';
  label: string;
  emoji: string;
  date: string;
  detail?: string;
}

export interface PlanetaryEvent {
  planet: string;
  glyph: string;
  type: 'retrograde_start' | 'retrograde_end' | 'sign_ingress';
  label: string;
  date: string;
}

export interface AstrologyData {
  panchang?: PanchangData;
  transits?: WesternTransit[];
  horoscope?: DailyHoroscope;
  moonPhase?: MoonPhase;
  planetaryPositions?: PlanetPosition[];
  moonEvents?: MoonEvent[];
  planetaryEvents?: PlanetaryEvent[];
}
