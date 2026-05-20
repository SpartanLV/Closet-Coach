import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { sampleItems, sampleWearLogs } from './sampleData';
import { daysSinceIso } from '../utils/date';
import { AppSettings, ClosetState, Occasion, WardrobeItem } from '../types';
import { consoleTelemetryService } from './telemetry';

export const storageKeys = {
  wardrobe: 'closetcoach.v1.wardrobe',
  wearLogs: 'closetcoach.v1.wearLogs',
  settings: 'closetcoach.v1.settings',
} as const;

const defaultSettings: AppSettings = {
  city: 'New York, US',
  calendarPermission: 'unknown',
  occasionOverride: null,
  lastContextRefresh: null,
  lastWeatherSnapshot: null,
};

export const defaultClosetState: ClosetState = {
  wardrobe: sampleItems,
  wearLogs: sampleWearLogs,
  settings: defaultSettings,
};

export type ClosetAction =
  | {
      type: 'hydrate';
      payload: {
        state: Partial<ClosetState>;
        nowIso: string;
      };
    }
  | { type: 'setSettings'; payload: Partial<AppSettings> }
  | {
      type: 'addWardrobeItem';
      payload: {
        item: WardrobeItem;
        nowIso: string;
      };
    }
  | {
      type: 'updateWardrobeItem';
      payload: {
        item: WardrobeItem;
        nowIso: string;
      };
    }
  | { type: 'deleteWardrobeItem'; payload: string }
  | {
      type: 'logWear';
      payload: {
        outfitItemIds: string[];
        occasion: Occasion;
        weatherLabel: string;
        timestamp: string;
      };
    };

function normalizeWardrobe(items: WardrobeItem[], now: Date): WardrobeItem[] {
  return items.map((item) => {
    const lastWornDaysAgo = item.lastWornAt ? daysSinceIso(item.lastWornAt, now) : item.lastWornDaysAgo;
    return {
      ...item,
      lastWornDaysAgo,
    };
  });
}

export function closetReducer(state: ClosetState, action: ClosetAction): ClosetState {
  if (action.type === 'hydrate') {
    const nextWardrobe = action.payload.state.wardrobe ?? state.wardrobe;
    const nextWearLogs = action.payload.state.wearLogs ?? state.wearLogs;
    const nextSettings = action.payload.state.settings
      ? { ...state.settings, ...action.payload.state.settings }
      : state.settings;

    return {
      wardrobe: normalizeWardrobe(nextWardrobe, new Date(action.payload.nowIso)),
      wearLogs: nextWearLogs,
      settings: nextSettings,
    };
  }

  if (action.type === 'setSettings') {
    return {
      ...state,
      settings: {
        ...state.settings,
        ...action.payload,
      },
    };
  }

  if (action.type === 'addWardrobeItem') {
    return {
      ...state,
      wardrobe: normalizeWardrobe([action.payload.item, ...state.wardrobe], new Date(action.payload.nowIso)),
    };
  }

  if (action.type === 'updateWardrobeItem') {
    return {
      ...state,
      wardrobe: normalizeWardrobe(
        state.wardrobe.map((item) => (item.id === action.payload.item.id ? action.payload.item : item)),
        new Date(action.payload.nowIso),
      ),
    };
  }

  if (action.type === 'deleteWardrobeItem') {
    const nextWardrobe = state.wardrobe.filter((item) => item.id !== action.payload);
    return {
      ...state,
      wardrobe: nextWardrobe,
    };
  }

  const timestamp = action.payload.timestamp;
  const wornIdSet = new Set(action.payload.outfitItemIds);
  const now = new Date(timestamp);
  const nextWardrobe = state.wardrobe.map((item) => {
    if (!wornIdSet.has(item.id)) {
      const lastWornDaysAgo = item.lastWornAt ? daysSinceIso(item.lastWornAt, now) : item.lastWornDaysAgo;
      return {
        ...item,
        lastWornDaysAgo,
      };
    }
    return {
      ...item,
      wearCount: item.wearCount + 1,
      lastWornAt: timestamp,
      lastWornDaysAgo: 0,
    };
  });

  return {
    ...state,
    wardrobe: nextWardrobe,
    wearLogs: [
      {
        id: `wear-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
        outfitItemIds: action.payload.outfitItemIds,
        timestamp,
        occasion: action.payload.occasion,
        weatherLabel: action.payload.weatherLabel,
      },
      ...state.wearLogs,
    ],
  };
}

type StoredJsonResult<T> =
  | { ok: true; data: T | null }
  | { ok: false; reason: 'read_failed' | 'invalid_json' };

async function readStoredJson<T>(key: string): Promise<StoredJsonResult<T>> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return { ok: true, data: null };
    }

    try {
      return { ok: true, data: JSON.parse(raw) as T };
    } catch {
      return { ok: false, reason: 'invalid_json' };
    }
  } catch {
    return { ok: false, reason: 'read_failed' };
  }
}

export function useClosetState() {
  const [state, dispatch] = useReducer(closetReducer, defaultClosetState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [hydrationError, setHydrationError] = useState<string | null>(null);
  const [hydrateAttempt, setHydrateAttempt] = useState(0);
  const lastPersistErrorRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const hydrate = async () => {
      setHydrationError(null);
      const [wardrobeResult, wearLogsResult, settingsResult] = await Promise.all([
        readStoredJson<WardrobeItem[]>(storageKeys.wardrobe),
        readStoredJson<ClosetState['wearLogs']>(storageKeys.wearLogs),
        readStoredJson<AppSettings>(storageKeys.settings),
      ]);

      if (!isMounted) {
        return;
      }

      const failures = [
        [storageKeys.wardrobe, wardrobeResult],
        [storageKeys.wearLogs, wearLogsResult],
        [storageKeys.settings, settingsResult],
      ] as const;

      failures.forEach(([key, result]) => {
        if (!result.ok) {
          consoleTelemetryService.track('storage_hydrate_failed', { key, reason: result.reason });
        }
      });

      const hasFailure = failures.some(([, result]) => !result.ok);
      if (hasFailure) {
        setHydrationError('Some local data could not be loaded. Default data has been restored.');
      }

      dispatch({
        type: 'hydrate',
        payload: {
          state: {
            wardrobe: wardrobeResult.ok && wardrobeResult.data ? wardrobeResult.data : defaultClosetState.wardrobe,
            wearLogs: wearLogsResult.ok && wearLogsResult.data ? wearLogsResult.data : defaultClosetState.wearLogs,
            settings: settingsResult.ok && settingsResult.data ? settingsResult.data : defaultClosetState.settings,
          },
          nowIso: new Date().toISOString(),
        },
      });
      setIsHydrated(true);
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [hydrateAttempt]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const persist = async () => {
      try {
        await AsyncStorage.multiSet([
          [storageKeys.wardrobe, JSON.stringify(state.wardrobe)],
          [storageKeys.wearLogs, JSON.stringify(state.wearLogs)],
          [storageKeys.settings, JSON.stringify(state.settings)],
        ]);
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'unknown';
        consoleTelemetryService.track('storage_persist_failed', { reason });
        if (lastPersistErrorRef.current !== reason) {
          lastPersistErrorRef.current = reason;
          setPersistenceError(reason);
        }
      }
    };

    void persist();
  }, [state, isHydrated]);

  const addWardrobeItem = useCallback((item: WardrobeItem) => {
    dispatch({
      type: 'addWardrobeItem',
      payload: {
        item,
        nowIso: new Date().toISOString(),
      },
    });
  }, []);

  const updateWardrobeItem = useCallback((item: WardrobeItem) => {
    dispatch({
      type: 'updateWardrobeItem',
      payload: {
        item,
        nowIso: new Date().toISOString(),
      },
    });
  }, []);

  const deleteWardrobeItem = useCallback((itemId: string) => {
    dispatch({ type: 'deleteWardrobeItem', payload: itemId });
  }, []);

  const setSettings = useCallback((settingsPatch: Partial<AppSettings>) => {
    dispatch({ type: 'setSettings', payload: settingsPatch });
  }, []);

  const retryHydration = useCallback(() => {
    setIsHydrated(false);
    setHydrationError(null);
    setHydrateAttempt((current) => current + 1);
  }, []);

  const logWear = useCallback(
    (payload: { outfitItemIds: string[]; occasion: Occasion; weatherLabel: string }) => {
      dispatch({
        type: 'logWear',
        payload: {
          ...payload,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [],
  );

  return {
    state,
    isHydrated,
    persistenceError,
    addWardrobeItem,
    updateWardrobeItem,
    deleteWardrobeItem,
    setSettings,
    logWear,
    hydrationError,
    retryHydration,
  };
}
