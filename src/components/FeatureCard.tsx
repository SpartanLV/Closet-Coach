import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

type FeatureCardProps = {
  label: string;
  value: string;
  helper: string;
};

export function FeatureCard({ label, value, helper }: FeatureCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.helper}>{helper}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: 20,
    padding: spacing.md,
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 22,
    lineHeight: 28,
    color: colors.text,
    fontWeight: '800',
  },
  helper: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
});
