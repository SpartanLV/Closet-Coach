import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { daysSinceIso } from '../utils/date';
import { AppSettings, ClosetState, Occasion, SuggestionFeedbackKind, WardrobeItem } from '../types';
import { sampleItems, sampleWearLogs } from './sampleData';
import { consoleTelemetryService } from './telemetry';

export const storageKeys = {
  wardrobe: 'closetcoach.v1.wardrobe',
  wearLogs: 'closetcoach.v1.wearLogs',
  settings: 'closetcoach.v1.settings',
  feedbackHistory: 'closetcoach.v1.feedbackHistory',
} as const;

const defaultSettings: AppSettings = { city: 'New York, US', calendarPermission: 'unknown', occasionOverride: null, lastContextRefresh: null, lastWeatherSnapshot: null };
export const defaultClosetState: ClosetState = { wardrobe: sampleItems, wearLogs: sampleWearLogs, settings: defaultSettings, feedbackHistory: [] };

type ClosetAction =
  | { type: 'hydrate'; payload: { state: Partial<ClosetState>; nowIso: string } }
  | { type: 'setSettings'; payload: Partial<AppSettings> }
  | { type: 'addWardrobeItem'; payload: { item: WardrobeItem; nowIso: string } }
  | { type: 'updateWardrobeItem'; payload: { item: WardrobeItem; nowIso: string } }
  | { type: 'deleteWardrobeItem'; payload: string }
  | { type: 'logWear'; payload: { outfitItemIds: string[]; occasion: Occasion; weatherLabel: string; timestamp: string } }
  | { type: 'logFeedback'; payload: { outfitId: string; kind: SuggestionFeedbackKind; timestamp: string } };

function normalizeWardrobe(items: WardrobeItem[], now: Date): WardrobeItem[] {
  return items.map((item) => ({ ...item, lastWornDaysAgo: item.lastWornAt ? daysSinceIso(item.lastWornAt, now) : item.lastWornDaysAgo }));
}

export function closetReducer(state: ClosetState, action: ClosetAction): ClosetState {
  if (action.type === 'hydrate') {
    return {
      wardrobe: normalizeWardrobe(action.payload.state.wardrobe ?? state.wardrobe, new Date(action.payload.nowIso)),
      wearLogs: action.payload.state.wearLogs ?? state.wearLogs,
      settings: action.payload.state.settings ? { ...state.settings, ...action.payload.state.settings } : state.settings,
      feedbackHistory: action.payload.state.feedbackHistory ?? state.feedbackHistory,
    };
  }
  if (action.type === 'setSettings') return { ...state, settings: { ...state.settings, ...action.payload } };
  if (action.type === 'addWardrobeItem') return { ...state, wardrobe: normalizeWardrobe([action.payload.item, ...state.wardrobe], new Date(action.payload.nowIso)) };
  if (action.type === 'updateWardrobeItem') return { ...state, wardrobe: normalizeWardrobe(state.wardrobe.map((item) => (item.id === action.payload.item.id ? action.payload.item : item)), new Date(action.payload.nowIso)) };
  if (action.type === 'deleteWardrobeItem') return { ...state, wardrobe: state.wardrobe.filter((item) => item.id !== action.payload) };
  if (action.type === 'logFeedback') {
    return { ...state, feedbackHistory: [{ id: `feedback-${action.payload.timestamp}-${Math.random().toString(36).slice(2, 8)}`, outfitId: action.payload.outfitId, kind: action.payload.kind, timestamp: action.payload.timestamp }, ...state.feedbackHistory].slice(0, 250) };
  }

  const wornIdSet = new Set(action.payload.outfitItemIds);
  const now = new Date(action.payload.timestamp);
  const nextWardrobe = state.wardrobe.map((item) => wornIdSet.has(item.id) ? { ...item, wearCount: item.wearCount + 1, lastWornAt: action.payload.timestamp, lastWornDaysAgo: 0 } : { ...item, lastWornDaysAgo: item.lastWornAt ? daysSinceIso(item.lastWornAt, now) : item.lastWornDaysAgo });
  return { ...state, wardrobe: nextWardrobe, wearLogs: [{ id: `wear-${action.payload.timestamp}-${Math.random().toString(36).slice(2, 8)}`, outfitItemIds: action.payload.outfitItemIds, timestamp: action.payload.timestamp, occasion: action.payload.occasion, weatherLabel: action.payload.weatherLabel }, ...state.wearLogs] };
}

type StoredJsonResult<T> = { ok: true; data: T | null } | { ok: false; reason: 'read_failed' | 'invalid_json' };
async function readStoredJson<T>(key: string): Promise<StoredJsonResult<T>> { try { const raw = await AsyncStorage.getItem(key); if (!raw) return { ok: true, data: null }; try { return { ok: true, data: JSON.parse(raw) as T }; } catch { return { ok: false, reason: 'invalid_json' }; } } catch { return { ok: false, reason: 'read_failed' }; } }

export function useClosetState() {
  const [state, dispatch] = useReducer(closetReducer, defaultClosetState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [hydrationError, setHydrationError] = useState<string | null>(null);
  const [hydrateAttempt, setHydrateAttempt] = useState(0);
  const lastPersistErrorRef = useRef<string | null>(null);

  useEffect(() => { let isMounted = true; const hydrate = async () => {
    setHydrationError(null);
    const [wardrobeResult, wearLogsResult, settingsResult, feedbackResult] = await Promise.all([
      readStoredJson<WardrobeItem[]>(storageKeys.wardrobe), readStoredJson<ClosetState['wearLogs']>(storageKeys.wearLogs), readStoredJson<AppSettings>(storageKeys.settings), readStoredJson<ClosetState['feedbackHistory']>(storageKeys.feedbackHistory),
    ]);
    if (!isMounted) return;
    ([[storageKeys.wardrobe, wardrobeResult],[storageKeys.wearLogs, wearLogsResult],[storageKeys.settings, settingsResult],[storageKeys.feedbackHistory, feedbackResult]] as const).forEach(([key, result]) => { if (!result.ok) consoleTelemetryService.track('storage_hydrate_failed', { key, reason: result.reason }); });
    if ([wardrobeResult, wearLogsResult, settingsResult, feedbackResult].some((r) => !r.ok)) setHydrationError('Some local data could not be loaded. Default data has been restored.');
    dispatch({ type: 'hydrate', payload: { state: { wardrobe: wardrobeResult.ok && wardrobeResult.data ? wardrobeResult.data : defaultClosetState.wardrobe, wearLogs: wearLogsResult.ok && wearLogsResult.data ? wearLogsResult.data : defaultClosetState.wearLogs, settings: settingsResult.ok && settingsResult.data ? settingsResult.data : defaultClosetState.settings, feedbackHistory: feedbackResult.ok && feedbackResult.data ? feedbackResult.data : defaultClosetState.feedbackHistory }, nowIso: new Date().toISOString() } });
    setIsHydrated(true);
  }; void hydrate(); return () => { isMounted = false; }; }, [hydrateAttempt]);

  useEffect(() => { if (!isHydrated) return; const persist = async () => { try { await AsyncStorage.multiSet([[storageKeys.wardrobe, JSON.stringify(state.wardrobe)], [storageKeys.wearLogs, JSON.stringify(state.wearLogs)], [storageKeys.settings, JSON.stringify(state.settings)], [storageKeys.feedbackHistory, JSON.stringify(state.feedbackHistory)]]); } catch (error) { const reason = error instanceof Error ? error.message : 'unknown'; consoleTelemetryService.track('storage_persist_failed', { reason }); if (lastPersistErrorRef.current !== reason) { lastPersistErrorRef.current = reason; setPersistenceError(reason); } } }; void persist(); }, [state, isHydrated]);

  return {
    state, isHydrated, persistenceError, hydrationError,
    addWardrobeItem: useCallback((item: WardrobeItem) => dispatch({ type: 'addWardrobeItem', payload: { item, nowIso: new Date().toISOString() } }), []),
    updateWardrobeItem: useCallback((item: WardrobeItem) => dispatch({ type: 'updateWardrobeItem', payload: { item, nowIso: new Date().toISOString() } }), []),
    deleteWardrobeItem: useCallback((itemId: string) => dispatch({ type: 'deleteWardrobeItem', payload: itemId }), []),
    setSettings: useCallback((settingsPatch: Partial<AppSettings>) => dispatch({ type: 'setSettings', payload: settingsPatch }), []),
    logWear: useCallback((payload: { outfitItemIds: string[]; occasion: Occasion; weatherLabel: string }) => dispatch({ type: 'logWear', payload: { ...payload, timestamp: new Date().toISOString() } }), []),
    logFeedback: useCallback((payload: { outfitId: string; kind: SuggestionFeedbackKind }) => dispatch({ type: 'logFeedback', payload: { ...payload, timestamp: new Date().toISOString() } }), []),
    retryHydration: useCallback(() => { setIsHydrated(false); setHydrationError(null); setHydrateAttempt((x) => x + 1); }, []),
  };
}
