export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  tempUnit: string;
  weatherCode: number;
  weatherDescription: string;
  precipitationChance: number;
  precipitationSum: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
  precipitationChance: number;
  windSpeed: number;
  humidity: number;
}

export interface WeatherAlert {
  type: string;
  severity: string;
  title: string;
  description: string;
  start: string;
  end: string;
}

export interface WeatherData {
  location: string;
  latitude: number;
  longitude: number;
  daily: DailyForecast[];
  hourly?: HourlyForecast[];
  alerts?: WeatherAlert[];
  timezone: string;
}
