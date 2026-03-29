import { openMeteoWeatherService } from './weatherService';

describe('openMeteoWeatherService.getContextResult', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns invalid_input for blank city', async () => {
    const result = await openMeteoWeatherService.getContextResult('  ');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('invalid_input');
    }
  });

  it('returns not_found when geocode has no results', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);

    const result = await openMeteoWeatherService.getContextResult('Nowhere');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('not_found');
    }
  });

  it('returns context on successful geocode + forecast', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [{ name: 'Austin', country: 'US', latitude: 30.2, longitude: -97.7 }] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ current: { temperature_2m: 25, weather_code: 1 } }),
      } as Response);

    const result = await openMeteoWeatherService.getContextResult('Austin');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.context.city).toBe('Austin, US');
      expect(result.context.temperatureBucket).toBe('warm');
    }
  });
});
