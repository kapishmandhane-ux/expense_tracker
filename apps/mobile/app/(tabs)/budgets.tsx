import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '../../components/glass-card';

export default function MobileBudgetsScreen() {
  const budgets = [
    { cat: 'Food & Dining', spent: 6850, limit: 12000, color: '#f97316' },
    { cat: 'Groceries', spent: 5400, limit: 8000, color: '#10b981' },
    { cat: 'Travel', spent: 3200, limit: 5000, color: '#3b82f6' },
    { cat: 'Utilities', spent: 4200, limit: 6000, color: '#8b5cf6' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Budget Thresholds</Text>

      {budgets.map((b) => {
        const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
        return (
          <GlassCard key={b.cat} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.catTitle}>{b.cat}</Text>
              <Text style={styles.pct}>{pct}%</Text>
            </View>
            <View style={styles.barBackground}>
              <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: b.color }]} />
            </View>
            <Text style={styles.details}>
              ₹{b.spent.toLocaleString()} / ₹{b.limit.toLocaleString()}
            </Text>
          </GlassCard>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090E',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  card: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  catTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  pct: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38bdf8',
  },
  barBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  details: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
  },
});
