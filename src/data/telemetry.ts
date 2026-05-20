export type TelemetryEventMap = {
  suggestion_viewed: {
    outfit_id: string;
    score: number;
    suggestion_count: number;
  };
  suggestion_swapped: {
    outfit_id: string;
    category: string;
  };
  wear_logged: {
    outfit_id: string;
    item_count: number;
    occasion: string;
  };
  weather_refresh_failed: {
    city: string;
    reason: string;
  };
  calendar_sync_failed: {
    request_access: boolean;
    reason: string;
  };
  storage_persist_failed: {
    reason: string;
  };
  storage_hydrate_failed: {
    key: string;
    reason: string;
  };
};

export type TelemetryEventName = keyof TelemetryEventMap;

export interface TelemetryService {
  track<E extends TelemetryEventName>(event: E, payload: TelemetryEventMap[E]): void;
}

export const consoleTelemetryService: TelemetryService = {
  track(event, payload) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    // eslint-disable-next-line no-console
    console.log('[telemetry]', event, {
      ...payload,
      trackedAt: new Date().toISOString(),
    });
  },
};
