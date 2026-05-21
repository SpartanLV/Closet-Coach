import React from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { FeatureCard } from '../../components/FeatureCard';
import { SectionCard } from '../../components/SectionCard';
import { WearLog } from '../../types';

type InsightStyles = {
  grid: StyleProp<ViewStyle>;
  line: StyleProp<TextStyle>;
  subtle: StyleProp<TextStyle>;
};

type InsightsSummary = {
  dormant: number;
  neverWorn: number;
  topLabel: string;
};

export type InsightsTabProps = {
  styles: InsightStyles;
  insights: InsightsSummary;
  wearLogs: WearLog[];
};

export function InsightsTab({ styles, insights, wearLogs }: InsightsTabProps) {
  return <>
    <View style={styles.grid}><FeatureCard label="Dormant" value={`${insights.dormant}`} helper="14+ days since wear" /><FeatureCard label="Never worn" value={`${insights.neverWorn}`} helper="Needs first use" /></View>
    <SectionCard title="Top item" subtitle="Highest wear count"><Text style={styles.line}>{insights.topLabel}</Text></SectionCard>
    <SectionCard title="Wear history" subtitle="Recent persisted wear logs">{wearLogs.length ? wearLogs.slice(0, 10).map((log) => <Text key={log.id} style={styles.line}>{new Date(log.timestamp).toLocaleDateString()} · {log.occasion} · {log.weatherLabel} · {log.outfitItemIds.length} items</Text>) : <Text style={styles.subtle}>No wear logs yet.</Text>}</SectionCard>
  </>;
}
