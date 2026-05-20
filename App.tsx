import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useClosetState } from './src/data/closetState';
import { getSeasonTemperatureRange, rankOutfits, swapCandidateItem } from './src/data/recommendationEngine';
import { consoleTelemetryService } from './src/data/telemetry';
import { TodayTab } from './src/features/today/TodayTab';
import { WardrobeTab } from './src/features/wardrobe/WardrobeTab';
import { InsightsTab } from './src/features/insights/InsightsTab';
import { useContextSync } from './src/hooks/useContextSync';
import { colors, spacing } from './src/theme/tokens';
import { Occasion, OutfitCandidate, Season, WardrobeCategory, WardrobeItem } from './src/types';

const tabs = ['Today', 'Wardrobe', 'Insights'] as const;
type Tab = (typeof tabs)[number];

type WardrobeFormState = { name: string; color: string; category: WardrobeCategory; season: Season; occasionTags: Occasion[] };
const emptyForm: WardrobeFormState = { name: '', color: '', category: 'Top', season: 'All-season', occasionTags: ['Casual'] };
const formatDaysAgo = (days: number) => (days >= 999 ? 'Never' : days === 0 ? 'Today' : `${days}d ago`);
const makeItemId = () => `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Today');
  const [form, setForm] = useState<WardrobeFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { state, isHydrated, addWardrobeItem, updateWardrobeItem, deleteWardrobeItem, setSettings, logWear, persistenceError, hydrationError, retryHydration } = useClosetState();
  const { wardrobe, wearLogs, settings } = state;
  const [cityDraft, setCityDraft] = useState(settings.city);

  const { status, setStatus, weatherLoading, calendarLoading, calendarEventTitle, calendarOccasion, refreshWeather, syncCalendar } = useContextSync({ isHydrated, cityDraft, settings, setSettings });

  const resolvedOccasion = settings.occasionOverride ?? calendarOccasion ?? 'Casual';
  const temperatureBucket = settings.lastWeatherSnapshot?.temperatureBucket ?? null;
  const temperatureLabel = settings.lastWeatherSnapshot?.weatherLabel ?? 'No weather context';
  const ranked = useMemo(() => rankOutfits({ items: wardrobe, occasion: resolvedOccasion, temperatureBucket, temperatureLabel }), [wardrobe, resolvedOccasion, temperatureBucket, temperatureLabel]);
  const [suggestions, setSuggestions] = useState<OutfitCandidate[]>([]);
  useEffect(() => setSuggestions(ranked), [ranked]);
  useEffect(() => { if (isHydrated) setCityDraft(settings.city); }, [isHydrated, settings.city]);

  const missing = useMemo(() => (['Top', 'Bottom', 'Shoes'] as WardrobeCategory[]).filter((category) => !wardrobe.some((item) => item.category === category)), [wardrobe]);
  const onboarding = [
    { label: `${Math.min(wardrobe.length, 5)} / 5 starter items`, done: wardrobe.length >= 5 },
    { label: settings.lastWeatherSnapshot ? 'Weather connected' : 'Connect weather', done: Boolean(settings.lastWeatherSnapshot) },
    { label: wearLogs.length > 0 ? 'First wear logged' : 'Log first wear', done: wearLogs.length > 0 },
  ];

  const toggleFormOccasion = (occasion: Occasion) => setForm((current) => ({ ...current, occasionTags: current.occasionTags.includes(occasion) ? current.occasionTags.filter((tag) => tag !== occasion) || ['Casual'] : [...current.occasionTags, occasion] }));
  const saveItem = () => {
    if (!form.name.trim()) return setStatus('Item name is required.');
    if (editingId) {
      const existing = wardrobe.find((item) => item.id === editingId); if (!existing) return;
      updateWardrobeItem({ ...existing, name: form.name.trim(), color: form.color.trim() || 'Unknown', category: form.category, season: form.season, occasionTags: form.occasionTags, temperatureRange: getSeasonTemperatureRange(form.season) });
      setStatus('Item updated.'); setEditingId(null);
    } else {
      addWardrobeItem({ id: makeItemId(), name: form.name.trim(), color: form.color.trim() || 'Unknown', category: form.category, season: form.season, occasionTags: form.occasionTags, temperatureRange: getSeasonTemperatureRange(form.season), wearCount: 0, lastWornDaysAgo: 999, lastWornAt: null });
      setStatus('Item added.');
    }
    setForm(emptyForm);
  };

  const wearCandidate = (candidate: OutfitCandidate) => {
    logWear({ outfitItemIds: candidate.itemIds, occasion: resolvedOccasion, weatherLabel: temperatureLabel });
    consoleTelemetryService.track('wear_logged', { outfit_id: candidate.id, item_count: candidate.itemIds.length, occasion: resolvedOccasion });
    setStatus('Wear logged.');
  };
  const swap = (candidateId: string, category: WardrobeCategory) => {
    setSuggestions((current) => current.map((candidate) => candidate.id !== candidateId ? candidate : (swapCandidateItem({ candidate, items: wardrobe, category, occasion: resolvedOccasion, temperatureBucket, temperatureLabel }) ?? candidate)));
    consoleTelemetryService.track('suggestion_swapped', { outfit_id: candidateId, category });
  };
  useEffect(() => { if (suggestions[0]) consoleTelemetryService.track('suggestion_viewed', { outfit_id: suggestions[0].id, score: Number(suggestions[0].score.toFixed(1)), suggestion_count: suggestions.length }); }, [suggestions]);

  const insights = useMemo(() => ({ dormant: wardrobe.filter((item) => item.lastWornDaysAgo >= 14).length, neverWorn: wardrobe.filter((item) => item.lastWornDaysAgo >= 999).length, topLabel: wardrobe.slice().sort((a, b) => b.wearCount - a.wearCount)[0] ? `${wardrobe.slice().sort((a, b) => b.wearCount - a.wearCount)[0].name} (${wardrobe.slice().sort((a, b) => b.wearCount - a.wearCount)[0].wearCount})` : 'N/A' }), [wardrobe]);

  if (!isHydrated) return <SafeAreaView style={styles.safeArea}><StatusBar style="dark" /><View style={styles.center}><ActivityIndicator color={colors.primary} /><Text style={styles.subtle}>Loading local closet data...</Text></View></SafeAreaView>;

  return <SafeAreaView style={styles.safeArea}><StatusBar style="dark" /><ScrollView contentContainerStyle={styles.container}><View><Text style={styles.eyebrow}>ClosetCoach Core Loop v1</Text><Text style={styles.title}>Interactive outfit planning</Text><Text style={styles.subtle}>Live weather, optional calendar, local persistence, and wear analytics.</Text></View><View style={styles.tabs}>{tabs.map((tab) => <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && styles.tabActive]}><Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>{tab}</Text></TouchableOpacity>)}</View>{status ? <Text style={styles.status}>{status}</Text> : null}{persistenceError ? <Text style={styles.warningStatus}>Storage warning: {persistenceError}</Text> : null}{hydrationError ? <View style={styles.inventory}><Text style={styles.warningStatus}>{hydrationError}</Text><TouchableOpacity style={styles.secondary} onPress={retryHydration}><Text style={styles.secondaryText}>Retry hydration</Text></TouchableOpacity></View> : null}
    {activeTab === 'Today' ? <TodayTab styles={styles} onboarding={onboarding} cityDraft={cityDraft} setCityDraft={setCityDraft} refreshWeather={refreshWeather} weatherLoading={weatherLoading} syncCalendar={syncCalendar} calendarLoading={calendarLoading} temperatureLabel={temperatureLabel} settings={settings} calendarEventTitle={calendarEventTitle} resolvedOccasion={resolvedOccasion} setSettings={setSettings} suggestions={suggestions} wearLogs={wearLogs} missing={missing} wardrobe={wardrobe} swap={swap} wearCandidate={wearCandidate} formatDaysAgo={formatDaysAgo} /> : null}
    {activeTab === 'Wardrobe' ? <WardrobeTab styles={styles} editingId={editingId} form={form} setForm={setForm} toggleFormOccasion={toggleFormOccasion} saveItem={saveItem} setEditingId={setEditingId} emptyForm={emptyForm} wardrobe={wardrobe} editItem={(item: WardrobeItem) => { setEditingId(item.id); setForm({ name: item.name, color: item.color, category: item.category, season: item.season, occasionTags: item.occasionTags.length ? item.occasionTags : ['Casual'] }); }} deleteWardrobeItem={deleteWardrobeItem} formatDaysAgo={formatDaysAgo} /> : null}
    {activeTab === 'Insights' ? <InsightsTab styles={styles} insights={insights} wearLogs={wearLogs} /> : null}
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: colors.background }, container: { padding: spacing.lg, gap: spacing.lg }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm }, eyebrow: { color: colors.primary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase' }, title: { color: colors.text, fontSize: 30, fontWeight: '800' }, subtle: { color: colors.muted, fontSize: 14, lineHeight: 20 }, status: { color: colors.primary, fontSize: 13, fontWeight: '700' }, warningStatus: { color: '#9a6700', backgroundColor: '#fff4d6', borderColor: '#f2cc60', borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 13, fontWeight: '600' }, tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, padding: 6, gap: spacing.xs }, tab: { flex: 1, alignItems: 'center', borderRadius: 10, paddingVertical: spacing.sm }, tabActive: { backgroundColor: colors.primary }, tabLabel: { color: colors.text, fontSize: 14, fontWeight: '600' }, tabLabelActive: { color: colors.white }, row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }, wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }, line: { color: colors.text, fontSize: 14, lineHeight: 20 }, grid: { flexDirection: 'row', gap: spacing.md }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.white, color: colors.text, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, fontSize: 14 }, button: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }, buttonText: { color: colors.white, fontSize: 13, fontWeight: '700' }, secondary: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.white, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm }, secondaryText: { color: colors.text, fontSize: 12, fontWeight: '700' }, tag: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, backgroundColor: colors.white, paddingHorizontal: spacing.sm, paddingVertical: 6 }, tagActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft }, tagText: { color: colors.text, fontSize: 12, fontWeight: '600' }, tagTextActive: { color: colors.primary }, inventory: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.sm, gap: spacing.xs } });
