export interface SolarFlare {
  id: string;
  class: 'A' | 'B' | 'C' | 'M' | 'X';
  magnitude?: string;
  sourceLocation?: string;
  peakTime: string;
  beginTime: string;
  endTime: string;
}

export interface XrayFluxPoint {
  timestamp: string;
  flux: number;
}

export interface GeomagneticStorm {
  id: string;
  startTime: string;
  kpIndex: number;
  severity: 'G1' | 'G2' | 'G3' | 'G4' | 'G5';
}

export interface SolarWindData {
  speed: number;
  density: number;
  temperature: number;
  /** GSM Bz from RTSW magnetometer; null when mag feed unavailable */
  bz: number | null;
  timestamp: string;
}

export interface KpIndex {
  timestamp: string;
  value: number;
  severity: string;
}

export interface AuroraForecast {
  kpIndex: number;
  visibilityLatitude: number;
  probability: number;
}

export interface SolarEvent {
  type: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'extreme';
}

export interface SolarData {
  flares: SolarFlare[];
  storms: GeomagneticStorm[];
  solarWind: SolarWindData;
  kpIndex: KpIndex;
  aurora: AuroraForecast;
  events: SolarEvent[];
  xrayFlux: XrayFluxPoint[];
}

export interface SchumannData {
  activityIndex?: number;
  activityLabel?: string;
  schumannIndex?: number;
  frequencyHz?: number;
  kpLabel?: string;
  summary?: string;
  spectrogramUri?: string;
  updatedAt?: string;
}
