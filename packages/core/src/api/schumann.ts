import type { SchumannData } from '../types/solar';

const RESONANCE_ONE_URL = 'https://resonanceone.app/api/now';
const TOMSK_SPECTROGRAM_URL = 'https://sos70.ru/provider.php?file=shm.jpg';

interface ResonanceOneResponse {
  activity_index?: number;
  activity_index_label?: string;
  schumann_index?: number;
  schumann_frequency_hz?: number;
  kp_label?: string;
  summary?: string;
  updated_at?: string;
}

const BASE64_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bytesToBase64(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const hasB2 = i + 1 < bytes.length;
    const hasB3 = i + 2 < bytes.length;
    result += BASE64_TABLE[b1 >> 2];
    result += BASE64_TABLE[((b1 & 0x03) << 4) | (hasB2 ? bytes[i + 1] >> 4 : 0)];
    result += hasB2 ? BASE64_TABLE[((bytes[i + 1] & 0x0f) << 2) | (hasB3 ? bytes[i + 2] >> 6 : 0)] : '=';
    result += hasB3 ? BASE64_TABLE[bytes[i + 2] & 0x3f] : '=';
  }
  return result;
}

async function fetchResonanceOneStats(): Promise<Partial<SchumannData>> {
  const response = await fetch(RESONANCE_ONE_URL);
  if (!response.ok) throw new Error(`ResonanceOne request failed (${response.status})`);
  const data = (await response.json()) as ResonanceOneResponse;
  return {
    activityIndex: typeof data.activity_index === 'number' ? data.activity_index : undefined,
    activityLabel: data.activity_index_label,
    schumannIndex: typeof data.schumann_index === 'number' ? data.schumann_index : undefined,
    frequencyHz: typeof data.schumann_frequency_hz === 'number' ? data.schumann_frequency_hz : undefined,
    kpLabel: data.kp_label,
    summary: data.summary,
    updatedAt: data.updated_at,
  };
}

async function fetchTomskSpectrogram(): Promise<string> {
  const response = await fetch(TOMSK_SPECTROGRAM_URL);
  if (!response.ok) throw new Error(`Tomsk spectrogram request failed (${response.status})`);
  const buffer = await response.arrayBuffer();
  const magic = new Uint8Array(buffer.slice(0, 2));
  if (magic[0] !== 0xff || magic[1] !== 0xd8) {
    throw new Error('Tomsk endpoint did not return a JPEG image');
  }
  return `data:image/jpeg;base64,${bytesToBase64(new Uint8Array(buffer))}`;
}

export async function getSchumannData(): Promise<SchumannData> {
  const [statsResult, spectrogramResult] = await Promise.allSettled([
    fetchResonanceOneStats(),
    fetchTomskSpectrogram(),
  ]);

  if (statsResult.status === 'rejected' && spectrogramResult.status === 'rejected') {
    throw statsResult.reason instanceof Error
      ? statsResult.reason
      : new Error('Failed to load Schumann resonance data');
  }

  const stats = statsResult.status === 'fulfilled' ? statsResult.value : {};
  const spectrogramUri =
    spectrogramResult.status === 'fulfilled' ? spectrogramResult.value : undefined;

  return { ...stats, spectrogramUri };
}
