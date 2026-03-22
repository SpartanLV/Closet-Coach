import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { sampleItems, sampleWearLogs } from './sampleData';
import { daysSinceIso } from '../utils/date';
import { AppSettings, ClosetState, Occasion, WardrobeItem } from '../types';

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
  | { type: 'hydrate'; payload: Partial<ClosetState> }
  | { type: 'setSettings'; payload: Partial<AppSettings> }
  | { type: 'addWardrobeItem'; payload: WardrobeItem }
  | { type: 'updateWardrobeItem'; payload: WardrobeItem }
  | { type: 'deleteWardrobeItem'; payload: string }
  | {
      type: 'logWear';
      payload: {
        outfitItemIds: string[];
        occasion: Occasion;
        weatherLabel: string;
        timestamp?: string;
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
    const nextWardrobe = action.payload.wardrobe ?? state.wardrobe;
    const nextWearLogs = action.payload.wearLogs ?? state.wearLogs;
    const nextSettings = action.payload.settings
      ? { ...state.settings, ...action.payload.settings }
      : state.settings;

    return {
      wardrobe: normalizeWardrobe(nextWardrobe, new Date()),
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
      wardrobe: normalizeWardrobe([action.payload, ...state.wardrobe], new Date()),
    };
  }

  if (action.type === 'updateWardrobeItem') {
    return {
      ...state,
      wardrobe: normalizeWardrobe(
        state.wardrobe.map((item) => (item.id === action.payload.id ? action.payload : item)),
        new Date(),
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

  const timestamp = action.payload.timestamp ?? new Date().toISOString();
  const wornIdSet = new Set(action.payload.outfitItemIds);
  const nextWardrobe = state.wardrobe.map((item) => {
    if (!wornIdSet.has(item.id)) {
      const lastWornDaysAgo = item.lastWornAt ? daysSinceIso(item.lastWornAt, new Date(timestamp)) : item.lastWornDaysAgo;
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

async function readStoredJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function useClosetState() {
  const [state, dispatch] = useReducer(closetReducer, defaultClosetState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const hydrate = async () => {
      const [wardrobe, wearLogs, settings] = await Promise.all([
        readStoredJson<WardrobeItem[]>(storageKeys.wardrobe),
        readStoredJson<ClosetState['wearLogs']>(storageKeys.wearLogs),
        readStoredJson<AppSettings>(storageKeys.settings),
      ]);

      if (!isMounted) {
        return;
      }

      dispatch({
        type: 'hydrate',
        payload: {
          wardrobe: wardrobe ?? defaultClosetState.wardrobe,
          wearLogs: wearLogs ?? defaultClosetState.wearLogs,
          settings: settings ?? defaultClosetState.settings,
        },
      });
      setIsHydrated(true);
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void AsyncStorage.multiSet([
      [storageKeys.wardrobe, JSON.stringify(state.wardrobe)],
      [storageKeys.wearLogs, JSON.stringify(state.wearLogs)],
      [storageKeys.settings, JSON.stringify(state.settings)],
    ]);
  }, [state, isHydrated]);

  const addWardrobeItem = useCallback((item: WardrobeItem) => {
    dispatch({ type: 'addWardrobeItem', payload: item });
  }, []);

  const updateWardrobeItem = useCallback((item: WardrobeItem) => {
    dispatch({ type: 'updateWardrobeItem', payload: item });
  }, []);

  const deleteWardrobeItem = useCallback((itemId: string) => {
    dispatch({ type: 'deleteWardrobeItem', payload: itemId });
  }, []);

  const setSettings = useCallback((settingsPatch: Partial<AppSettings>) => {
    dispatch({ type: 'setSettings', payload: settingsPatch });
  }, []);

  const logWear = useCallback(
    (payload: { outfitItemIds: string[]; occasion: Occasion; weatherLabel: string }) => {
      dispatch({ type: 'logWear', payload });
    },
    [],
  );

  return {
    state,
    isHydrated,
    addWardrobeItem,
    updateWardrobeItem,
    deleteWardrobeItem,
    setSettings,
    logWear,
  };
}
