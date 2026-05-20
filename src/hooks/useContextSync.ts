import { useCallback, useEffect, useRef, useState } from 'react';
import { expoCalendarService, getCalendarPermissionStatus, requestCalendarPermission } from '../data/calendarService';
import { consoleTelemetryService } from '../data/telemetry';
import { openMeteoWeatherService } from '../data/weatherService';
import { AppSettings, Occasion } from '../types';

export function useContextSync(params: {
  isHydrated: boolean;
  cityDraft: string;
  settings: AppSettings;
  setSettings: (patch: Partial<AppSettings>) => void;
}) {
  const { isHydrated, cityDraft, settings, setSettings } = params;
  const [status, setStatus] = useState('');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarEventTitle, setCalendarEventTitle] = useState<string | null>(null);
  const [calendarOccasion, setCalendarOccasion] = useState<Occasion | null>(null);
  const weatherRequestInFlight = useRef(false);
  const calendarRequestInFlight = useRef(false);
  const hasBootstrappedContext = useRef(false);

  const refreshWeather = useCallback(async (cityOverride?: string) => {
    if (weatherRequestInFlight.current) return;
    const requestedCity = (cityOverride ?? cityDraft).trim();
    if (!requestedCity) {
      setStatus('Please enter a city before refreshing weather.');
      return;
    }
    weatherRequestInFlight.current = true;
    setWeatherLoading(true);
    try {
      const result = await openMeteoWeatherService.getContextResult(requestedCity);
      if (!result.ok) {
        const staleSuffix = settings.lastWeatherSnapshot
          ? ` Keeping last weather from ${new Date(settings.lastWeatherSnapshot.fetchedAt).toLocaleTimeString()}.`
          : '';
        setStatus(`${result.error.message} Using wardrobe-only fallback.${staleSuffix}`);
        return;
      }
      setSettings({ city: result.context.city, lastWeatherSnapshot: result.context, lastContextRefresh: new Date().toISOString() });
      setStatus(`Weather updated for ${result.context.city}.`);
    } catch (error) {
      consoleTelemetryService.track('weather_refresh_failed', { city: requestedCity, reason: error instanceof Error ? error.message : 'unknown' });
      setStatus('Weather unavailable, using wardrobe-only fallback.');
    } finally {
      setWeatherLoading(false);
      weatherRequestInFlight.current = false;
    }
  }, [cityDraft, setSettings, settings.lastWeatherSnapshot]);

  const syncCalendar = useCallback(async (requestAccess: boolean) => {
    if (calendarRequestInFlight.current) return;
    calendarRequestInFlight.current = true;
    setCalendarLoading(true);
    try {
      const permission = requestAccess ? await requestCalendarPermission() : await getCalendarPermissionStatus();
      setSettings({ calendarPermission: permission, lastContextRefresh: new Date().toISOString() });
      if (permission !== 'granted') {
        setCalendarEventTitle(null);
        setCalendarOccasion(null);
        if (permission === 'denied') setStatus('Calendar denied, continuing with manual occasion.');
        return;
      }
      const next = await expoCalendarService.getNextOccasion();
      if (!next) {
        setCalendarEventTitle(null);
        setCalendarOccasion(null);
        setStatus('No upcoming event found in 24 hours.');
        return;
      }
      setCalendarEventTitle(next.eventTitle);
      setCalendarOccasion(next.occasion);
      setStatus(`Calendar synced from "${next.eventTitle}".`);
    } catch (error) {
      consoleTelemetryService.track('calendar_sync_failed', { request_access: requestAccess, reason: error instanceof Error ? error.message : 'unknown' });
      setCalendarEventTitle(null);
      setCalendarOccasion(null);
      setStatus('Calendar unavailable, continuing with manual occasion.');
    } finally {
      calendarRequestInFlight.current = false;
      setCalendarLoading(false);
    }
  }, [setSettings]);

  useEffect(() => {
    if (!isHydrated || hasBootstrappedContext.current) return;
    hasBootstrappedContext.current = true;
    void refreshWeather(settings.city);
    void syncCalendar(false);
  }, [isHydrated, refreshWeather, settings.city, syncCalendar]);

  return { status, setStatus, weatherLoading, calendarLoading, calendarEventTitle, calendarOccasion, refreshWeather, syncCalendar };
}
