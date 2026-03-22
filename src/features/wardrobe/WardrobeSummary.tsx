import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SectionCard } from '../../components/SectionCard';
import { colors, spacing } from '../../theme/tokens';
import { WardrobeItem } from '../../types';

type WardrobeSummaryProps = {
  items: WardrobeItem[];
};

export function WardrobeSummary({ items }: WardrobeSummaryProps) {
  return (
    <SectionCard title="Wardrobe snapshot" subtitle={`${items.length} digitized items in this starter closet`}>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.itemInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.category} · {item.color} · {item.season}
            </Text>
          </View>
          <View style={styles.metricPill}>
            <Text style={styles.metricText}>{item.wearCount} wears</Text>
          </View>
        </View>
      ))}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
  },
  metricPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  metricText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
