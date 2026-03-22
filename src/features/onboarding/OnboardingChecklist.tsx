import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SectionCard } from '../../components/SectionCard';
import { colors, spacing } from '../../theme/tokens';

const steps = [
  { label: 'Style quiz completed', status: 'done' },
  { label: '4 / 5 starter items added', status: 'active' },
  { label: 'Enable weather when ready', status: 'upcoming' },
];

export function OnboardingChecklist() {
  return (
    <SectionCard title="Onboarding progress" subtitle="Designed to get users to first value in under 3 minutes.">
      {steps.map((step) => (
        <View key={step.label} style={styles.row}>
          <View
            style={[
              styles.dot,
              step.status === 'done' && styles.dotDone,
              step.status === 'active' && styles.dotActive,
            ]}
          />
          <Text style={styles.label}>{step.label}</Text>
        </View>
      ))}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  dotDone: {
    backgroundColor: colors.success,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
