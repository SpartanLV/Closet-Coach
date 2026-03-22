import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SectionCard } from '../../components/SectionCard';
import { colors, spacing } from '../../theme/tokens';
import { OutfitSuggestion } from '../../types';

type DailySuggestionProps = {
  suggestion: OutfitSuggestion;
};

export function DailySuggestion({ suggestion }: DailySuggestionProps) {
  return (
    <SectionCard title="Today’s top look" subtitle={`${suggestion.temperatureLabel} · ${suggestion.occasion}`}>
      <Text style={styles.title}>{suggestion.title}</Text>
      <View style={styles.tagRow}>
        {suggestion.items.map((item) => (
          <View key={item} style={styles.tag}>
            <Text style={styles.tagLabel}>{item}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.rationale}>{suggestion.rationale}</Text>
      <View style={styles.footer}>
        <View style={[styles.badge, suggestion.accepted ? styles.badgeAccepted : styles.badgePending]}>
          <Text style={styles.badgeLabel}>{suggestion.accepted ? 'Accepted' : 'Needs review'}</Text>
        </View>
        <Text style={styles.meta}>Rule-based scoring v1</Text>
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  tagLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  rationale: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  badgeAccepted: {
    backgroundColor: '#DDF7EB',
  },
  badgePending: {
    backgroundColor: '#FFF1D9',
  },
  badgeLabel: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 12,
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
  },
});
