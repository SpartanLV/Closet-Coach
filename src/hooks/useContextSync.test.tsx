import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useContextSync } from './useContextSync';
import { AppSettings } from '../types';

const mockGetContextResult = jest.fn();
const mockPermissionStatus = jest.fn();
const mockRequestPermission = jest.fn();
const mockGetNextOccasion = jest.fn();

jest.mock('../data/weatherService', () => ({
  openMeteoWeatherService: {
    getContextResult: (...args: unknown[]) => mockGetContextResult(...args),
  },
}));

jest.mock('../data/calendarService', () => ({
  getCalendarPermissionStatus: (...args: unknown[]) => mockPermissionStatus(...args),
  requestCalendarPermission: (...args: unknown[]) => mockRequestPermission(...args),
  expoCalendarService: {
    getNextOccasion: (...args: unknown[]) => mockGetNextOccasion(...args),
  },
}));

const baseSettings: AppSettings = {
  city: 'New York, US',
  calendarPermission: 'unknown',
  occasionOverride: null,
  lastContextRefresh: null,
  lastWeatherSnapshot: null,
};

function TestHarness(props: { isHydrated: boolean; cityDraft: string; settings: AppSettings; setSettings: (patch: Partial<AppSettings>) => void; onState: (value: ReturnType<typeof useContextSync>) => void; }) {
  const value = useContextSync(props);
  props.onState(value);
  return null;
}

describe('useContextSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetContextResult.mockResolvedValue({ ok: true, context: { city: 'New York, US', temperatureC: 11, temperatureF: 52, temperatureBucket: 'mild', weatherCode: 1, weatherLabel: '52°F · Mostly clear', fetchedAt: '2026-03-22T00:00:00.000Z' } });
    mockPermissionStatus.mockResolvedValue('denied');
    mockRequestPermission.mockResolvedValue('denied');
    mockGetNextOccasion.mockResolvedValue(null);
  });

  it('bootstraps weather and calendar once after hydration', async () => {
    const setSettings = jest.fn();
    let snapshot: ReturnType<typeof useContextSync> | null = null;

    await act(async () => {
      renderer.create(<TestHarness isHydrated cityDraft="New York, US" settings={baseSettings} setSettings={setSettings} onState={(value) => { snapshot = value; }} />);
    });
    await act(async () => Promise.resolve());

    expect(mockGetContextResult).toHaveBeenCalledTimes(1);
    expect(mockPermissionStatus).toHaveBeenCalledTimes(1);
    expect(snapshot).not.toBeNull();
  });

  it('shows required-city status when manual refresh has empty city', async () => {
    const setSettings = jest.fn();
    let snapshot: ReturnType<typeof useContextSync> | null = null;

    await act(async () => {
      renderer.create(<TestHarness isHydrated cityDraft="" settings={baseSettings} setSettings={setSettings} onState={(value) => { snapshot = value; }} />);
    });

    await act(async () => {
      await snapshot?.refreshWeather('   ');
    });

    expect(snapshot).not.toBeNull();
    expect(snapshot!.status).toBe('Please enter a city before refreshing weather.');
  });
});
