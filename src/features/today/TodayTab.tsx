import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FeatureCard } from '../../components/FeatureCard';
import { SectionCard } from '../../components/SectionCard';
import { Occasion, OutfitCandidate, WardrobeCategory, WardrobeItem, occasionOptions } from '../../types';

export function TodayTab(props: any) {
  const { styles, onboarding, cityDraft, setCityDraft, refreshWeather, weatherLoading, syncCalendar, calendarLoading, temperatureLabel, settings, calendarEventTitle, resolvedOccasion, setSettings, suggestions, wearLogs, missing, wardrobe, swap, wearCandidate, formatDaysAgo } = props;
  return <>
    <SectionCard title="Onboarding" subtitle="Progress toward first value">{onboarding.map((item: any) => <Text key={item.label} style={styles.line}>{item.done ? '•' : '○'} {item.label}</Text>)}</SectionCard>
    <SectionCard title="Context" subtitle="Weather + calendar inputs">
      <TextInput value={cityDraft} onChangeText={setCityDraft} placeholder="City (e.g. New York, US)" style={styles.input} />
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={() => { void refreshWeather(); }}><Text style={styles.buttonText}>{weatherLoading ? 'Refreshing...' : 'Refresh weather'}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => syncCalendar(true)}><Text style={styles.secondaryText}>{calendarLoading ? 'Syncing...' : 'Sync calendar'}</Text></TouchableOpacity>
      </View>
      <Text style={styles.line}>Weather: {temperatureLabel}</Text>
      <Text style={styles.line}>Calendar: {settings.calendarPermission}{calendarEventTitle ? ` · ${calendarEventTitle}` : ''}</Text>
    </SectionCard>
    <SectionCard title="Occasion override" subtitle="Auto from calendar, editable anytime"><View style={styles.wrap}><TouchableOpacity style={[styles.tag, settings.occasionOverride === null && styles.tagActive]} onPress={() => setSettings({ occasionOverride: null })}><Text style={[styles.tagText, settings.occasionOverride === null && styles.tagTextActive]}>Auto</Text></TouchableOpacity>{occasionOptions.map((occasion) => <TouchableOpacity key={occasion} style={[styles.tag, settings.occasionOverride === occasion && styles.tagActive]} onPress={() => setSettings({ occasionOverride: occasion })}><Text style={[styles.tagText, settings.occasionOverride === occasion && styles.tagTextActive]}>{occasion}</Text></TouchableOpacity>)}</View><Text style={styles.line}>Using: {resolvedOccasion}</Text></SectionCard>
    <View style={styles.grid}><FeatureCard label="Suggestions" value={`${suggestions.length}`} helper="Top 3 ranked outfits" /><FeatureCard label="Wear logs" value={`${wearLogs.length}`} helper="Persisted locally" /></View>
    {missing.length ? <SectionCard title="Missing categories" subtitle="Add these to unlock ranking">{missing.map((category: string) => <Text key={category} style={styles.line}>• {category}</Text>)}</SectionCard> : null}
    {suggestions.map((candidate: OutfitCandidate, index: number) => { const items = candidate.itemIds.map((itemId) => wardrobe.find((item: WardrobeItem) => item.id === itemId)).filter((item: WardrobeItem | undefined): item is WardrobeItem => Boolean(item)); return <SectionCard key={candidate.id} title={`Outfit ${index + 1}`} subtitle={`${candidate.temperatureLabel} · ${candidate.occasion} · score ${candidate.score.toFixed(1)}`}>{items.map((item) => <Text key={item.id} style={styles.line}>{item.category}: {item.name} ({item.color}) · {formatDaysAgo(item.lastWornDaysAgo)}</Text>)}<View style={styles.wrap}>{(['Top','Bottom','Shoes','Outerwear'] as WardrobeCategory[]).map((category) => <TouchableOpacity key={`${candidate.id}-${category}`} style={styles.secondary} onPress={() => swap(candidate.id, category)}><Text style={styles.secondaryText}>Swap {category}</Text></TouchableOpacity>)}</View><TouchableOpacity style={styles.button} onPress={() => wearCandidate(candidate)}><Text style={styles.buttonText}>Wear this</Text></TouchableOpacity></SectionCard>; })}
  </>;
}
