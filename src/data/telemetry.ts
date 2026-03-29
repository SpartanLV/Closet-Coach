export type TelemetryEventName =
  | 'suggestion_viewed'
  | 'suggestion_swapped'
  | 'wear_logged'
  | 'weather_refresh_failed'
  | 'calendar_sync_failed'
  | 'storage_persist_failed';

export type TelemetryPayload = Record<string, string | number | boolean | null | undefined>;

export interface TelemetryService {
  track(event: TelemetryEventName, payload?: TelemetryPayload): void;
}

export const consoleTelemetryService: TelemetryService = {
  track(event, payload = {}) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    // Replace with analytics SDK integration in a future phase.
    // eslint-disable-next-line no-console
    console.log(`[telemetry] ${event}`, payload);
  },
};
