import { TemperatureBucket, WeatherContext, WeatherService } from '../types';

type GeocodeResponse = {
  results?: Array<{
    name: string;
    country?: string;
    latitude: number;
    longitude: number;
  }>;
};

type ForecastResponse = {
  current?: {
    temperature_2m: number;
    weather_code: number;
  };
};

const weatherCodeLabels: Record<number, string> = {
  0: 'Clear',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Cloudy',
  45: 'Fog',
  48: 'Rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Heavy showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm',
  99: 'Severe thunderstorm',
};

export function mapTemperatureBucket(temperatureC: number): TemperatureBucket {
  if (temperatureC < 10) {
    return 'cold';
  }
  if (temperatureC <= 22) {
    return 'mild';
  }
  return 'warm';
}

export function celsiusToFahrenheit(temperatureC: number): number {
  return (temperatureC * 9) / 5 + 32;
}

function mapWeatherCodeLabel(code: number): string {
  return weatherCodeLabels[code] ?? 'Variable';
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export const openMeteoWeatherService: WeatherService = {
  async getContext(city: string): Promise<WeatherContext | null> {
    const trimmedCity = city.trim();
    if (!trimmedCity) {
      return null;
    }

    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmedCity)}&count=1&language=en&format=json`;
    const geocode = await fetchJson<GeocodeResponse>(geocodeUrl);
    const firstResult = geocode?.results?.[0];
    if (!firstResult) {
      return null;
    }

    const forecastUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${firstResult.latitude}&longitude=${firstResult.longitude}` +
      '&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto';
    const forecast = await fetchJson<ForecastResponse>(forecastUrl);
    const current = forecast?.current;
    if (!current) {
      return null;
    }

    const temperatureF = celsiusToFahrenheit(current.temperature_2m);
    const weatherText = mapWeatherCodeLabel(current.weather_code);
    const cityLabel = firstResult.country ? `${firstResult.name}, ${firstResult.country}` : firstResult.name;

    return {
      city: cityLabel,
      temperatureC: current.temperature_2m,
      temperatureF,
      temperatureBucket: mapTemperatureBucket(current.temperature_2m),
      weatherCode: current.weather_code,
      weatherLabel: `${Math.round(temperatureF)}°F · ${weatherText}`,
      fetchedAt: new Date().toISOString(),
    };
  },
};

