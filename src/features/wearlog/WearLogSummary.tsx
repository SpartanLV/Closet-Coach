import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SectionCard } from '../../components/SectionCard';
import { colors, spacing } from '../../theme/tokens';
import { WardrobeItem, WearLog } from '../../types';

type WearLogSummaryProps = {
  items: WardrobeItem[];
  wearLogs: WearLog[];
};

export function WearLogSummary({ items, wearLogs }: WearLogSummaryProps) {
  const dormantItems = useMemo(() => items.filter((item) => item.lastWornDaysAgo >= 10).length, [items]);

  return (
    <SectionCard title="Wear insights" subtitle="Retention and wardrobe optimization signals for the MVP.">
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{wearLogs.length}</Text>
          <Text style={styles.metricLabel}>Recent logs</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{dormantItems}</Text>
          <Text style={styles.metricLabel}>Needs rewear</Text>
        </View>
      </View>
      {items.map((item) => (
        <Text key={item.id} style={styles.itemLine}>
          {item.name}: last worn {item.lastWornDaysAgo} days ago
        </Text>
      ))}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: 20,
    padding: spacing.md,
    gap: 4,
  },
  metricValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 13,
  },
  itemLine: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
