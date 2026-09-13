import {
  DailyForecast,
  HourlyForecast,
  WeatherAlert,
  WeatherData,
} from '../types/weather';

const OPENMETEO_BASE = 'https://api.open-meteo.com/v1/forecast';

export async function getWeatherForecast(
  latitude: number,
  longitude: number,
  days: number = 7
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'weathercode',
      'precipitation_probability_max',
      'precipitation_sum',
      'windspeed_10m_max',
      'winddirection_10m_dominant',
      'relative_humidity_2m_max',
      'uv_index_max',
      'sunrise',
      'sunset',
    ].join(','),
    timezone: 'auto',
    forecast_days: days.toString(),
  });

  const response = await fetch(`${OPENMETEO_BASE}?${params}`);
  if (!response.ok) throw new Error('Failed to fetch weather forecast');

  const data = await response.json();

  const daily: DailyForecast[] = [];
  if (data.daily) {
    for (let i = 0; i < data.daily.time.length; i++) {
      daily.push({
        date: data.daily.time[i],
        maxTemp: data.daily.temperature_2m_max[i],
        minTemp: data.daily.temperature_2m_min[i],
        tempUnit: data.daily_units?.temperature_2m_max || '°C',
        weatherCode: data.daily.weathercode[i],
        weatherDescription: getWeatherDescription(data.daily.weathercode[i]),
        precipitationChance: data.daily.precipitation_probability_max[i] || 0,
        precipitationSum: data.daily.precipitation_sum[i] || 0,
        windSpeed: data.daily.windspeed_10m_max[i] || 0,
        windDirection: data.daily.winddirection_10m_dominant[i] || 0,
        humidity: data.daily.relative_humidity_2m_max[i] || 0,
        uvIndex: data.daily.uv_index_max[i] || 0,
        sunrise: data.daily.sunrise[i],
        sunset: data.daily.sunset[i],
      });
    }
  }

  return {
    location: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
    latitude,
    longitude,
    daily,
    timezone: data.timezone || 'UTC',
  };
}

export async function getHourlyForecast(
  latitude: number,
  longitude: number
): Promise<HourlyForecast[]> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    hourly: [
      'temperature_2m',
      'weathercode',
      'precipitation_probability',
      'windspeed_10m',
      'relative_humidity_2m',
    ].join(','),
    timezone: 'auto',
    forecast_days: '1',
  });

  const response = await fetch(`${OPENMETEO_BASE}?${params}`);
  if (!response.ok) throw new Error('Failed to fetch hourly forecast');

  const data = await response.json();
  const hourly: HourlyForecast[] = [];

  if (data.hourly) {
    for (let i = 0; i < data.hourly.time.length; i++) {
      hourly.push({
        time: data.hourly.time[i],
        temperature: data.hourly.temperature_2m[i],
        weatherCode: data.hourly.weathercode[i],
        precipitationChance: data.hourly.precipitation_probability[i] || 0,
        windSpeed: data.hourly.windspeed_10m[i] || 0,
        humidity: data.hourly.relative_humidity_2m[i] || 0,
      });
    }
  }

  return hourly;
}

function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return descriptions[code] || 'Unknown';
}
