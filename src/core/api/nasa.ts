const NASA_BASE = 'https://api.nasa.gov/DONKI';
const API_KEY = 'DEMO_KEY';

export interface NasaSolarFlare {
  flrID: string;
  instruments: { instrument: { displayName: string } }[];
  beginTime: string;
  peakTime: string;
  endTime: string;
  classType: string;
  sourceLocation: string;
  activeRegionNum: number;
}

export interface NasaCme {
  cmeID: string;
  startTime: string;
  sourceLocation: string;
  instruments: { instrument: { displayName: string } }[];
  cmeAnalyses: {
    time21_5: string;
    longitude: number;
    latitude: number;
    speed: number;
    type: string;
  }[];
}

export interface NasaGeomagneticStorm {
  gstID: string;
  startTime: string;
  allKpIndex: {
    kpIndex: number;
    observedTime: string;
  }[];
}

export async function getNasaSolarFlares(
  startDate?: string,
  endDate?: string
): Promise<NasaSolarFlare[]> {
  const params = new URLSearchParams({
    api_key: API_KEY,
  });
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);

  const response = await fetch(`${NASA_BASE}/FLR?${params}`);
  if (!response.ok) throw new Error('Failed to fetch NASA solar flares');

  return response.json();
}

export async function getNasaCmes(
  startDate?: string,
  endDate?: string
): Promise<NasaCme[]> {
  const params = new URLSearchParams({
    api_key: API_KEY,
  });
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);

  const response = await fetch(`${NASA_BASE}/CME?${params}`);
  if (!response.ok) throw new Error('Failed to fetch NASA CMEs');

  return response.json();
}

export async function getNasaGeomagneticStorms(
  startDate?: string,
  endDate?: string
): Promise<NasaGeomagneticStorm[]> {
  const params = new URLSearchParams({
    api_key: API_KEY,
  });
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);

  const response = await fetch(`${NASA_BASE}/GST?${params}`);
  if (!response.ok) throw new Error('Failed to fetch NASA geomagnetic storms');

  return response.json();
}

export async function getNasaNotifications(type: 'all' | 'FLR' | 'CME' | 'GST' = 'all') {
  const params = new URLSearchParams({
    type,
    api_key: API_KEY,
  });

  const response = await fetch(`${NASA_BASE}/notifications?${params}`);
  if (!response.ok) throw new Error('Failed to fetch NASA notifications');

  return response.json();
}
