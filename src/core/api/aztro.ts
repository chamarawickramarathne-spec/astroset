const AZTRO_BASE = 'https://aztro.sameerkumar.website';

export interface AztroHoroscope {
  sign: string;
  dateRange: string;
  currentDate: string;
  description: string;
  compatibility: string;
  mood: string;
  color: string;
  luckyNumber: string;
  luckyTime: string;
}

export async function getAztroHoroscope(
  sign: string,
  timeframe: 'today' | 'tomorrow' | 'yesterday' = 'today'
): Promise<AztroHoroscope> {
  const params = new URLSearchParams({
    sign: sign.toLowerCase(),
    timeframe,
  });

  const response = await fetch(`${AZTRO_BASE}?${params}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to fetch aztro horoscope');

  const data = await response.json();
  return {
    sign: data.sign || sign,
    dateRange: data.date_range || '',
    currentDate: data.current_date || '',
    description: data.description || '',
    compatibility: data.compatibility || '',
    mood: data.mood || '',
    color: data.color || '',
    luckyNumber: data.lucky_number || '',
    luckyTime: data.lucky_time || '',
  };
}
