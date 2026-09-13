import {
  SolarFlare,
  GeomagneticStorm,
  SolarWindData,
  KpIndex,
  AuroraForecast,
  SolarEvent,
  SolarData,
  XrayFluxPoint,
} from '../types/solar';
import { getNasaSolarFlares } from './nasa';

const NOAA_BASE = 'https://services.swpc.noaa.gov';
const GOES_XRAY_7DAY = `${NOAA_BASE}/json/goes/primary/xrays-7-day.json`;

interface DetectedFlare {
  beginTime: string;
  peakTime: string;
  endTime: string;
  peakFlux: number;
}

async function fetchGoesXray(): Promise<{ series: XrayFluxPoint[]; chartPoints: XrayFluxPoint[] }> {
  const response = await fetch(GOES_XRAY_7DAY);
  if (!response.ok) throw new Error('Failed to fetch GOES X-ray flux');

  const data = await response.json();
  const series: XrayFluxPoint[] = (Array.isArray(data) ? data : [])
    .filter((s: { energy?: string }) => s.energy === '0.1-0.8nm')
    .map((s: { time_tag: string; observed_flux: number }) => ({
      timestamp: s.time_tag,
      flux: s.observed_flux,
    }));

  const chartPoints = series.filter((_, i) => i % 15 === 0);
  return { series, chartPoints };
}

export function classifyFlare(peakFlux: number): { class: SolarFlare['class']; magnitude: string } {
  const round1 = (n: number) => Math.round(n * 10) / 10;
  if (peakFlux >= 1e-4) return { class: 'X', magnitude: `X${round1(peakFlux / 1e-4)}` };
  if (peakFlux >= 1e-5) return { class: 'M', magnitude: `M${round1(peakFlux / 1e-5)}` };
  if (peakFlux >= 1e-6) return { class: 'C', magnitude: `C${round1(peakFlux / 1e-6)}` };
  if (peakFlux >= 1e-7) return { class: 'B', magnitude: `B${round1(peakFlux / 1e-7)}` };
  return { class: 'A', magnitude: `A${round1(peakFlux / 1e-8)}` };
}

export function detectFlares(series: XrayFluxPoint[], minPeakFlux = 1e-6): DetectedFlare[] {
  const flares: DetectedFlare[] = [];
  let beginIdx = -1;
  let peakIdx = -1;
  let quietSamples = 0;

  for (let i = 0; i < series.length; i++) {
    const flux = series[i].flux;

    if (beginIdx === -1) {
      if (flux >= minPeakFlux) {
        beginIdx = i;
        peakIdx = i;
        quietSamples = 0;
      }
      continue;
    }

    if (flux > series[peakIdx].flux) {
      peakIdx = i;
      quietSamples = 0;
    } else if (flux < series[peakIdx].flux / 2) {
      quietSamples++;
      if (quietSamples >= 20) {
        flares.push({
          beginTime: series[beginIdx].timestamp,
          peakTime: series[peakIdx].timestamp,
          endTime: series[i].timestamp,
          peakFlux: series[peakIdx].flux,
        });
        beginIdx = -1;
        peakIdx = -1;
        quietSamples = 0;
      }
    } else {
      quietSamples = 0;
    }
  }

  if (beginIdx !== -1 && peakIdx !== -1) {
    flares.push({
      beginTime: series[beginIdx].timestamp,
      peakTime: series[peakIdx].timestamp,
      endTime: series[series.length - 1].timestamp,
      peakFlux: series[peakIdx].flux,
    });
  }

  return flares.filter((f) => f.peakFlux >= minPeakFlux);
}

function detectedToSolarFlare(f: DetectedFlare): SolarFlare {
  const { class: flareClass, magnitude } = classifyFlare(f.peakFlux);
  return {
    id: `goes-${f.peakTime}`,
    class: flareClass,
    magnitude,
    peakTime: f.peakTime,
    beginTime: f.beginTime,
    endTime: f.endTime,
  };
}

async function getNasaFlaresFallback(): Promise<SolarFlare[]> {
  try {
    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    const nasaFlares = await getNasaSolarFlares(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    );
    return nasaFlares.map((f) => ({
      id: f.flrID,
      class: f.classType.charAt(0) as SolarFlare['class'],
      sourceLocation: f.sourceLocation || undefined,
      peakTime: f.peakTime,
      beginTime: f.beginTime,
      endTime: f.endTime,
    }));
  } catch {
    return [];
  }
}

export async function getXrayFlux(): Promise<XrayFluxPoint[]> {
  const { chartPoints } = await fetchGoesXray();
  return chartPoints;
}

export async function getSolarFlares(): Promise<SolarFlare[]> {
  try {
    const { series } = await fetchGoesXray();
    const detected = detectFlares(series).map(detectedToSolarFlare);
    if (detected.length > 0) return detected;
  } catch {
    // GOES feed unavailable - fall through to NASA DONKI
  }
  return getNasaFlaresFallback();
}

export async function getGeomagneticStorms(): Promise<GeomagneticStorm[]> {
  const response = await fetch(`${NOAA_BASE}/products/noaa-planetary-k-index.json`);
  if (!response.ok) throw new Error('Failed to fetch Kp index');

  const data = await response.json();
  const storms: GeomagneticStorm[] = [];

  if (Array.isArray(data)) {
    for (const item of data) {
      const kpValue = item.Kp ?? item.kp_index ?? 0;
      if (kpValue >= 5) {
        let severity: 'G1' | 'G2' | 'G3' | 'G4' | 'G5' = 'G1';
        if (kpValue >= 9) severity = 'G5';
        else if (kpValue >= 8) severity = 'G4';
        else if (kpValue >= 7) severity = 'G3';
        else if (kpValue >= 6) severity = 'G2';

        storms.push({
          id: `storm-${item.time_tag}`,
          startTime: item.time_tag,
          kpIndex: kpValue,
          severity,
        });
      }
    }
  }
  return storms;
}

/** NOAA RTSW JSON arrays are newest-first; never assume ascending order. */
function newestByTimeTag<T extends { time_tag?: string }>(rows: T[]): T | null {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  let best = rows[0];
  let bestMs = Date.parse(best.time_tag || '') || 0;
  for (let i = 1; i < rows.length; i++) {
    const ms = Date.parse(rows[i].time_tag || '') || 0;
    if (ms > bestMs) {
      best = rows[i];
      bestMs = ms;
    }
  }
  return best;
}

export async function getSolarWind(): Promise<SolarWindData> {
  const [windRes, magRes] = await Promise.all([
    fetch(`${NOAA_BASE}/json/rtsw/rtsw_wind_1m.json`),
    fetch(`${NOAA_BASE}/json/rtsw/rtsw_mag_1m.json`),
  ]);
  if (!windRes.ok) throw new Error('Failed to fetch solar wind');

  const windData = await windRes.json();
  const latest = newestByTimeTag(Array.isArray(windData) ? windData : []);

  let bz: number | null = null;
  if (magRes.ok) {
    const magData = await magRes.json();
    const latestMag = newestByTimeTag(Array.isArray(magData) ? magData : []);
    if (latestMag && typeof (latestMag as { bz_gsm?: number }).bz_gsm === 'number') {
      bz = (latestMag as { bz_gsm: number }).bz_gsm;
    }
  }

  return {
    speed: latest?.proton_speed || 0,
    density: latest?.proton_density || 0,
    temperature: latest?.proton_temperature || 0,
    bz,
    timestamp: latest?.time_tag || new Date().toISOString(),
  };
}

export async function getKpIndex(): Promise<KpIndex> {
  const response = await fetch(`${NOAA_BASE}/products/noaa-planetary-k-index.json`);
  if (!response.ok) throw new Error('Failed to fetch Kp index');

  const data = await response.json();
  const latest = Array.isArray(data) ? data[data.length - 1] : null;
  const value = latest?.Kp ?? latest?.kp_index ?? 0;

  let severity = 'Quiet';
  if (value >= 9) severity = 'Extreme Storm';
  else if (value >= 7) severity = 'Severe Storm';
  else if (value >= 5) severity = 'Moderate Storm';
  else if (value >= 4) severity = 'Active';
  else if (value >= 3) severity = 'Unsettled';
  else if (value >= 2) severity = 'Low';

  return {
    timestamp: latest?.time_tag || new Date().toISOString(),
    value,
    severity,
  };
}

export async function getAuroraForecast(): Promise<AuroraForecast> {
  const kp = await getKpIndex();
  const visibilityLatitude = 67 - (kp.value * 3);

  return {
    kpIndex: kp.value,
    visibilityLatitude: Math.max(50, visibilityLatitude),
    probability: Math.min(100, kp.value * 12),
  };
}

export async function getSolarEvents(): Promise<SolarEvent[]> {
  const events: SolarEvent[] = [];
  const flares = await getSolarFlares();
  const storms = await getGeomagneticStorms();
  const kp = await getKpIndex();

  for (const flare of flares.slice(-5)) {
    let severity: 'low' | 'medium' | 'high' | 'extreme' = 'low';
    if (flare.class === 'X') severity = 'extreme';
    else if (flare.class === 'M') severity = 'high';
    else if (flare.class === 'C') severity = 'medium';

    events.push({
      type: 'solar_flare',
      message: `${flare.class}-class solar flare detected from ${flare.sourceLocation}`,
      timestamp: flare.peakTime,
      severity,
    });
  }

  for (const storm of storms.slice(-3)) {
    events.push({
      type: 'geomagnetic_storm',
      message: `Geomagnetic storm ${storm.severity} with Kp index ${storm.kpIndex}`,
      timestamp: storm.startTime,
      severity: storm.kpIndex >= 7 ? 'extreme' : storm.kpIndex >= 5 ? 'high' : 'medium',
    });
  }

  if (kp.value >= 5) {
    events.push({
      type: 'aurora',
      message: `Aurora visible at latitudes above ${Math.round(67 - kp.value * 3)}°`,
      timestamp: new Date().toISOString(),
      severity: 'medium',
    });
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getSolarData(): Promise<SolarData> {
  const [goesResult, storms, solarWind, kpIndex, aurora, events] = await Promise.all([
    fetchGoesXray(),
    getGeomagneticStorms(),
    getSolarWind(),
    getKpIndex(),
    getAuroraForecast(),
    getSolarEvents(),
  ]);

  let flares = detectFlares(goesResult.series).map(detectedToSolarFlare);
  if (flares.length === 0) {
    flares = await getNasaFlaresFallback();
  }

  return {
    flares,
    storms,
    solarWind,
    kpIndex,
    aurora,
    events,
    xrayFlux: goesResult.chartPoints,
  };
}
