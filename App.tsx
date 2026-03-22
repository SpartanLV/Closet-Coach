import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FeatureCard } from './src/components/FeatureCard';
import { SectionCard } from './src/components/SectionCard';
import { useClosetState } from './src/data/closetState';
import {
  expoCalendarService,
  getCalendarPermissionStatus,
  requestCalendarPermission,
} from './src/data/calendarService';
import {
  getSeasonTemperatureRange,
  rankOutfits,
  swapCandidateItem,
} from './src/data/recommendationEngine';
import { openMeteoWeatherService } from './src/data/weatherService';
import { colors, spacing } from './src/theme/tokens';
import {
  categoryOptions,
  occasionOptions,
  Occasion,
  OutfitCandidate,
  seasonOptions,
  Season,
  WardrobeCategory,
  WardrobeItem,
} from './src/types';

const tabs = ['Today', 'Wardrobe', 'Insights'] as const;
type Tab = (typeof tabs)[number];

type WardrobeFormState = {
  name: string;
  color: string;
  category: WardrobeCategory;
  season: Season;
  occasionTags: Occasion[];
};

const emptyForm: WardrobeFormState = {
  name: '',
  color: '',
  category: 'Top',
  season: 'All-season',
  occasionTags: ['Casual'],
};

function formatDaysAgo(days: number): string {
  if (days >= 999) {
    return 'Never';
  }
  if (days === 0) {
    return 'Today';
  }
  return `${days}d ago`;
}

function makeItemId(): string {
  return `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Today');
  const [form, setForm] = useState<WardrobeFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarEventTitle, setCalendarEventTitle] = useState<string | null>(null);
  const [calendarOccasion, setCalendarOccasion] = useState<Occasion | null>(null);

  const {
    state,
    isHydrated,
    addWardrobeItem,
    updateWardrobeItem,
    deleteWardrobeItem,
    setSettings,
    logWear,
  } = useClosetState();
  const { wardrobe, wearLogs, settings } = state;

  const resolvedOccasion = settings.occasionOverride ?? calendarOccasion ?? 'Casual';
  const temperatureBucket = settings.lastWeatherSnapshot?.temperatureBucket ?? null;
  const temperatureLabel = settings.lastWeatherSnapshot?.weatherLabel ?? 'No weather context';

  const ranked = useMemo(
    () =>
      rankOutfits({
        items: wardrobe,
        occasion: resolvedOccasion,
        temperatureBucket,
        temperatureLabel,
      }),
    [wardrobe, resolvedOccasion, temperatureBucket, temperatureLabel],
  );

  const [suggestions, setSuggestions] = useState<OutfitCandidate[]>([]);

  useEffect(() => {
    setSuggestions(ranked);
  }, [ranked]);

  const refreshWeather = useCallback(async () => {
    setWeatherLoading(true);
    const context = await openMeteoWeatherService.getContext(settings.city);
    setWeatherLoading(false);

    if (!context) {
      setStatus('Weather unavailable, using wardrobe-only fallback.');
      return;
    }

    setSettings({
      city: context.city,
      lastWeatherSnapshot: context,
      lastContextRefresh: new Date().toISOString(),
    });
    setStatus(`Weather updated for ${context.city}.`);
  }, [settings.city, setSettings]);

  const syncCalendar = useCallback(
    async (requestAccess: boolean) => {
      setCalendarLoading(true);
      const permission = requestAccess
        ? await requestCalendarPermission()
        : await getCalendarPermissionStatus();
      setSettings({
        calendarPermission: permission,
        lastContextRefresh: new Date().toISOString(),
      });

      if (permission !== 'granted') {
        setCalendarLoading(false);
        setCalendarEventTitle(null);
        setCalendarOccasion(null);
        if (permission === 'denied') {
          setStatus('Calendar denied, continuing with manual occasion.');
        }
        return;
      }

      const next = await expoCalendarService.getNextOccasion();
      setCalendarLoading(false);
      if (!next) {
        setCalendarEventTitle(null);
        setCalendarOccasion(null);
        setStatus('No upcoming event found in 24 hours.');
        return;
      }

      setCalendarEventTitle(next.eventTitle);
      setCalendarOccasion(next.occasion);
      setStatus(`Calendar synced from "${next.eventTitle}".`);
    },
    [setSettings],
  );

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    void refreshWeather();
    void syncCalendar(false);
  }, [isHydrated, refreshWeather, syncCalendar]);

  const missing = useMemo(() => {
    const required: WardrobeCategory[] = ['Top', 'Bottom', 'Shoes'];
    return required.filter((category) => !wardrobe.some((item) => item.category === category));
  }, [wardrobe]);

  const onboarding = [
    { label: `${Math.min(wardrobe.length, 5)} / 5 starter items`, done: wardrobe.length >= 5 },
    { label: settings.lastWeatherSnapshot ? 'Weather connected' : 'Connect weather', done: Boolean(settings.lastWeatherSnapshot) },
    { label: wearLogs.length > 0 ? 'First wear logged' : 'Log first wear', done: wearLogs.length > 0 },
  ];

  const toggleFormOccasion = (occasion: Occasion) => {
    setForm((current) => {
      const selected = current.occasionTags.includes(occasion);
      const next = selected
        ? current.occasionTags.filter((tag) => tag !== occasion)
        : [...current.occasionTags, occasion];
      return { ...current, occasionTags: next.length ? next : ['Casual'] };
    });
  };

  const saveItem = () => {
    if (!form.name.trim()) {
      setStatus('Item name is required.');
      return;
    }

    if (editingId) {
      const existing = wardrobe.find((item) => item.id === editingId);
      if (!existing) {
        return;
      }
      updateWardrobeItem({
        ...existing,
        name: form.name.trim(),
        color: form.color.trim() || 'Unknown',
        category: form.category,
        season: form.season,
        occasionTags: form.occasionTags,
        temperatureRange: getSeasonTemperatureRange(form.season),
      });
      setStatus('Item updated.');
      setEditingId(null);
    } else {
      addWardrobeItem({
        id: makeItemId(),
        name: form.name.trim(),
        color: form.color.trim() || 'Unknown',
        category: form.category,
        season: form.season,
        occasionTags: form.occasionTags,
        temperatureRange: getSeasonTemperatureRange(form.season),
        wearCount: 0,
        lastWornDaysAgo: 999,
        lastWornAt: null,
      });
      setStatus('Item added.');
    }

    setForm(emptyForm);
  };

  const editItem = (item: WardrobeItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      color: item.color,
      category: item.category,
      season: item.season,
      occasionTags: item.occasionTags.length ? item.occasionTags : ['Casual'],
    });
  };

  const wearCandidate = (candidate: OutfitCandidate) => {
    logWear({
      outfitItemIds: candidate.itemIds,
      occasion: resolvedOccasion,
      weatherLabel: temperatureLabel,
    });
    setStatus('Wear logged.');
  };

  const swap = (candidateId: string, category: WardrobeCategory) => {
    setSuggestions((current) =>
      current.map((candidate) => {
        if (candidate.id !== candidateId) {
          return candidate;
        }
        return (
          swapCandidateItem({
            candidate,
            items: wardrobe,
            category,
            occasion: resolvedOccasion,
            temperatureBucket,
            temperatureLabel,
          }) ?? candidate
        );
      }),
    );
  };

  const insights = useMemo(() => {
    const dormant = wardrobe.filter((item) => item.lastWornDaysAgo >= 14).length;
    const neverWorn = wardrobe.filter((item) => item.lastWornDaysAgo >= 999).length;
    const top = wardrobe.slice().sort((a, b) => b.wearCount - a.wearCount)[0];
    return {
      dormant,
      neverWorn,
      topLabel: top ? `${top.name} (${top.wearCount})` : 'N/A',
    };
  }, [wardrobe]);

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.subtle}>Loading local closet data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.eyebrow}>ClosetCoach Core Loop v1</Text>
          <Text style={styles.title}>Interactive outfit planning</Text>
          <Text style={styles.subtle}>Live weather, optional calendar, local persistence, and wear analytics.</Text>
        </View>

        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {status ? <Text style={styles.status}>{status}</Text> : null}

        {activeTab === 'Today' ? (
          <>
            <SectionCard title="Onboarding" subtitle="Progress toward first value">
              {onboarding.map((item) => (
                <Text key={item.label} style={styles.line}>
                  {item.done ? '•' : '○'} {item.label}
                </Text>
              ))}
            </SectionCard>

            <SectionCard title="Context" subtitle="Weather + calendar inputs">
              <TextInput
                value={settings.city}
                onChangeText={(text) => setSettings({ city: text })}
                placeholder="City (e.g. New York, US)"
                style={styles.input}
              />
              <View style={styles.row}>
                <TouchableOpacity style={styles.button} onPress={refreshWeather}>
                  <Text style={styles.buttonText}>{weatherLoading ? 'Refreshing...' : 'Refresh weather'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondary} onPress={() => syncCalendar(true)}>
                  <Text style={styles.secondaryText}>{calendarLoading ? 'Syncing...' : 'Sync calendar'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.line}>Weather: {temperatureLabel}</Text>
              <Text style={styles.line}>Calendar: {settings.calendarPermission}{calendarEventTitle ? ` · ${calendarEventTitle}` : ''}</Text>
            </SectionCard>

            <SectionCard title="Occasion override" subtitle="Auto from calendar, editable anytime">
              <View style={styles.wrap}>
                <TouchableOpacity
                  style={[styles.tag, settings.occasionOverride === null && styles.tagActive]}
                  onPress={() => setSettings({ occasionOverride: null })}
                >
                  <Text style={[styles.tagText, settings.occasionOverride === null && styles.tagTextActive]}>Auto</Text>
                </TouchableOpacity>
                {occasionOptions.map((occasion) => (
                  <TouchableOpacity
                    key={occasion}
                    style={[styles.tag, settings.occasionOverride === occasion && styles.tagActive]}
                    onPress={() => setSettings({ occasionOverride: occasion })}
                  >
                    <Text style={[styles.tagText, settings.occasionOverride === occasion && styles.tagTextActive]}>{occasion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.line}>Using: {resolvedOccasion}</Text>
            </SectionCard>

            <View style={styles.grid}>
              <FeatureCard label="Suggestions" value={`${suggestions.length}`} helper="Top 3 ranked outfits" />
              <FeatureCard label="Wear logs" value={`${wearLogs.length}`} helper="Persisted locally" />
            </View>

            {missing.length ? (
              <SectionCard title="Missing categories" subtitle="Add these to unlock ranking">
                {missing.map((category) => (
                  <Text key={category} style={styles.line}>• {category}</Text>
                ))}
              </SectionCard>
            ) : null}

            {suggestions.map((candidate, index) => {
              const items = candidate.itemIds
                .map((itemId) => wardrobe.find((item) => item.id === itemId))
                .filter((item): item is WardrobeItem => Boolean(item));

              return (
                <SectionCard
                  key={candidate.id}
                  title={`Outfit ${index + 1}`}
                  subtitle={`${candidate.temperatureLabel} · ${candidate.occasion} · score ${candidate.score.toFixed(1)}`}
                >
                  {items.map((item) => (
                    <Text key={item.id} style={styles.line}>
                      {item.category}: {item.name} ({item.color}) · {formatDaysAgo(item.lastWornDaysAgo)}
                    </Text>
                  ))}
                  <View style={styles.wrap}>
                    {(['Top', 'Bottom', 'Shoes', 'Outerwear'] as WardrobeCategory[]).map((category) => (
                      <TouchableOpacity key={`${candidate.id}-${category}`} style={styles.secondary} onPress={() => swap(candidate.id, category)}>
                        <Text style={styles.secondaryText}>Swap {category}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.button} onPress={() => wearCandidate(candidate)}>
                    <Text style={styles.buttonText}>Wear this</Text>
                  </TouchableOpacity>
                </SectionCard>
              );
            })}
          </>
        ) : null}

        {activeTab === 'Wardrobe' ? (
          <>
            <SectionCard title={editingId ? 'Edit item' : 'Add item'} subtitle="Capture and tag wardrobe metadata">
              <TextInput
                value={form.name}
                onChangeText={(text) => setForm((current) => ({ ...current, name: text }))}
                placeholder="Item name"
                style={styles.input}
              />
              <TextInput
                value={form.color}
                onChangeText={(text) => setForm((current) => ({ ...current, color: text }))}
                placeholder="Color"
                style={styles.input}
              />
              <View style={styles.wrap}>
                {categoryOptions.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.tag, form.category === category && styles.tagActive]}
                    onPress={() => setForm((current) => ({ ...current, category }))}
                  >
                    <Text style={[styles.tagText, form.category === category && styles.tagTextActive]}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.wrap}>
                {seasonOptions.map((season) => (
                  <TouchableOpacity
                    key={season}
                    style={[styles.tag, form.season === season && styles.tagActive]}
                    onPress={() => setForm((current) => ({ ...current, season }))}
                  >
                    <Text style={[styles.tagText, form.season === season && styles.tagTextActive]}>{season}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.wrap}>
                {occasionOptions.map((occasion) => {
                  const selected = form.occasionTags.includes(occasion);
                  return (
                    <TouchableOpacity
                      key={occasion}
                      style={[styles.tag, selected && styles.tagActive]}
                      onPress={() => toggleFormOccasion(occasion)}
                    >
                      <Text style={[styles.tagText, selected && styles.tagTextActive]}>{occasion}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.row}>
                <TouchableOpacity style={styles.button} onPress={saveItem}>
                  <Text style={styles.buttonText}>{editingId ? 'Save' : 'Add item'}</Text>
                </TouchableOpacity>
                {editingId ? (
                  <TouchableOpacity style={styles.secondary} onPress={() => { setEditingId(null); setForm(emptyForm); }}>
                    <Text style={styles.secondaryText}>Cancel</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </SectionCard>

            <SectionCard title="Wardrobe inventory" subtitle={`${wardrobe.length} items persisted locally`}>
              {wardrobe.map((item) => (
                <View key={item.id} style={styles.inventory}>
                  <Text style={styles.line}>{item.name} · {item.category} · {item.color}</Text>
                  <Text style={styles.subtle}>Tags: {item.occasionTags.join(', ')} · wears {item.wearCount} · {formatDaysAgo(item.lastWornDaysAgo)}</Text>
                  <View style={styles.row}>
                    <TouchableOpacity style={styles.secondary} onPress={() => editItem(item)}>
                      <Text style={styles.secondaryText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondary} onPress={() => deleteWardrobeItem(item.id)}>
                      <Text style={styles.secondaryText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </SectionCard>
          </>
        ) : null}

        {activeTab === 'Insights' ? (
          <>
            <View style={styles.grid}>
              <FeatureCard label="Dormant" value={`${insights.dormant}`} helper="14+ days since wear" />
              <FeatureCard label="Never worn" value={`${insights.neverWorn}`} helper="Needs first use" />
            </View>
            <SectionCard title="Top item" subtitle="Highest wear count">
              <Text style={styles.line}>{insights.topLabel}</Text>
            </SectionCard>
            <SectionCard title="Wear history" subtitle="Recent persisted wear logs">
              {wearLogs.length ? wearLogs.slice(0, 10).map((log) => (
                <Text key={log.id} style={styles.line}>
                  {new Date(log.timestamp).toLocaleDateString()} · {log.occasion} · {log.weatherLabel} · {log.outfitItemIds.length} items
                </Text>
              )) : <Text style={styles.subtle}>No wear logs yet.</Text>}
            </SectionCard>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  eyebrow: { color: colors.primary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  subtle: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  status: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, padding: 6, gap: spacing.xs },
  tab: { flex: 1, alignItems: 'center', borderRadius: 10, paddingVertical: spacing.sm },
  tabActive: { backgroundColor: colors.primary },
  tabLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  tabLabelActive: { color: colors.white },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  line: { color: colors.text, fontSize: 14, lineHeight: 20 },
  grid: { flexDirection: 'row', gap: spacing.md },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    color: colors.text,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  secondary: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  secondaryText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  tagActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  tagText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  tagTextActive: { color: colors.primary },
  inventory: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.sm,
    gap: spacing.xs,
  },
});
