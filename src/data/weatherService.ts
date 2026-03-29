import {
  ServiceError,
  TemperatureBucket,
  WeatherContext,
  WeatherContextResult,
  WeatherService,
} from '../types';
import { fetchJsonWithRetry } from '../utils/network';

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

function mapFetchErrorToServiceError(reason: 'network' | 'timeout' | 'upstream'): ServiceError {
  if (reason === 'timeout') {
    return {
      code: 'timeout',
      message: 'Weather request timed out. Please try again.',
      retryable: true,
    };
  }
  if (reason === 'upstream') {
    return {
      code: 'upstream_error',
      message: 'Weather provider is temporarily unavailable.',
      retryable: true,
    };
  }
  return {
    code: 'network_error',
    message: 'Could not connect to weather service.',
    retryable: true,
  };
}

export const openMeteoWeatherService: WeatherService = {
  async getContextResult(city: string): Promise<WeatherContextResult> {
    const trimmedCity = city.trim();
    if (!trimmedCity) {
      return {
        ok: false,
        error: {
          code: 'invalid_input',
          message: 'Please provide a city name.',
          retryable: false,
        },
      };
    }

    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmedCity)}&count=1&language=en&format=json`;
    const geocodeResult = await fetchJsonWithRetry<GeocodeResponse>({
      url: geocodeUrl,
      timeoutMs: 5000,
      retries: 1,
    });
    if (!geocodeResult.ok) {
      return { ok: false, error: mapFetchErrorToServiceError(geocodeResult.reason) };
    }

    const firstResult = geocodeResult.data.results?.[0];
    if (!firstResult) {
      return {
        ok: false,
        error: {
          code: 'not_found',
          message: 'City not found. Try a nearby major city.',
          retryable: false,
        },
      };
    }

    const forecastUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${firstResult.latitude}&longitude=${firstResult.longitude}` +
      '&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto';
    const forecastResult = await fetchJsonWithRetry<ForecastResponse>({
      url: forecastUrl,
      timeoutMs: 5000,
      retries: 1,
    });
    if (!forecastResult.ok) {
      return { ok: false, error: mapFetchErrorToServiceError(forecastResult.reason) };
    }

    const current = forecastResult.data.current;
    if (!current) {
      return {
        ok: false,
        error: {
          code: 'upstream_error',
          message: 'Weather data is unavailable right now.',
          retryable: true,
        },
      };
    }

    const temperatureF = celsiusToFahrenheit(current.temperature_2m);
    const weatherText = mapWeatherCodeLabel(current.weather_code);
    const cityLabel = firstResult.country ? `${firstResult.name}, ${firstResult.country}` : firstResult.name;

    return {
      ok: true,
      context: {
        city: cityLabel,
        temperatureC: current.temperature_2m,
        temperatureF,
        temperatureBucket: mapTemperatureBucket(current.temperature_2m),
        weatherCode: current.weather_code,
        weatherLabel: `${Math.round(temperatureF)}°F · ${weatherText}`,
        fetchedAt: new Date().toISOString(),
      },
    };
  },
  async getContext(city: string): Promise<WeatherContext | null> {
    const result = await this.getContextResult(city);
    return result.ok ? result.context : null;
  },
};
