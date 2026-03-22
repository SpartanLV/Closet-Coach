import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FeatureCard } from './src/components/FeatureCard';
import { SectionCard } from './src/components/SectionCard';
import { DailySuggestion } from './src/features/outfits/DailySuggestion';
import { OnboardingChecklist } from './src/features/onboarding/OnboardingChecklist';
import { WardrobeSummary } from './src/features/wardrobe/WardrobeSummary';
import { WearLogSummary } from './src/features/wearlog/WearLogSummary';
import { sampleItems, sampleSuggestions, sampleWearLogs } from './src/data/sampleData';
import { colors, spacing } from './src/theme/tokens';

const tabs = ['Today', 'Wardrobe', 'Insights'] as const;
type Tab = (typeof tabs)[number];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Today');

  const acceptanceRate = useMemo(() => {
    const accepted = sampleSuggestions.filter((suggestion) => suggestion.accepted).length;
    return Math.round((accepted / sampleSuggestions.length) * 100);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>ClosetCoach MVP</Text>
          <Text style={styles.title}>AI outfit planning for Android and iOS.</Text>
          <Text style={styles.subtitle}>
            A cross-platform foundation for wardrobe capture, daily outfit suggestions,
            and wear analytics.
          </Text>
        </View>

        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              accessibilityRole="button"
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            >
              <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'Today' ? (
          <>
            <OnboardingChecklist />
            <DailySuggestion suggestion={sampleSuggestions[0]} />
            <View style={styles.grid}>
              <FeatureCard label="Weather-aware" value="72°F · clear" helper="Morning meeting ready" />
              <FeatureCard label="Acceptance" value={`${acceptanceRate}%`} helper="Targeting 50%+ for beta" />
            </View>
          </>
        ) : null}

        {activeTab === 'Wardrobe' ? (
          <>
            <WardrobeSummary items={sampleItems} />
            <SectionCard title="Capture flow" subtitle="Planned MVP ingestion pipeline">
              <Text style={styles.bullet}>• Camera or gallery upload</Text>
              <Text style={styles.bullet}>• AI auto-tag draft for category, color, season, occasion</Text>
              <Text style={styles.bullet}>• Quick user confirmation before save</Text>
            </SectionCard>
          </>
        ) : null}

        {activeTab === 'Insights' ? (
          <>
            <WearLogSummary items={sampleItems} wearLogs={sampleWearLogs} />
            <SectionCard title="Roadmap alignment" subtitle="What this scaffold is prepared to support next">
              <Text style={styles.bullet}>• Calendar-aware outfit ranking</Text>
              <Text style={styles.bullet}>• Trip packing lists</Text>
              <Text style={styles.bullet}>• Subscription gating and personalization</Text>
            </SectionCard>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  hero: {
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 6,
    gap: spacing.xs,
  },
  tabButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.white,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  bullet: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
});
