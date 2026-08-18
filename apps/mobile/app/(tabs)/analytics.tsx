import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '../../components/glass-card';

export default function MobileAnalyticsScreen() {
  const breakdown = [
    { cat: 'Food & Dining', amount: '₹6,850', pct: '32%', color: '#f97316' },
    { cat: 'Groceries', amount: '₹5,400', pct: '25%', color: '#10b981' },
    { cat: 'Utilities', amount: '₹4,200', pct: '20%', color: '#8b5cf6' },
    { cat: 'Travel', amount: '₹3,200', pct: '15%', color: '#3b82f6' },
    { cat: 'Entertainment', amount: '₹1,100', pct: '5%', color: '#ec4899' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Spending Analytics</Text>

      <GlassCard style={styles.heroCard}>
        <Text style={styles.heroLabel}>Total Monthly Outflow</Text>
        <Text style={styles.heroAmount}>₹21,500.00</Text>
        <Text style={styles.heroSub}>↓ 12.4% vs previous month</Text>
      </GlassCard>

      <Text style={styles.sectionTitle}>Category Proportion</Text>
      {breakdown.map((b) => (
        <GlassCard key={b.cat} style={styles.catCard}>
          <View style={styles.catRow}>
            <View style={styles.catInfo}>
              <View style={[styles.dot, { backgroundColor: b.color }]} />
              <Text style={styles.catText}>{b.cat}</Text>
            </View>
            <View style={styles.catValues}>
              <Text style={styles.catAmount}>{b.amount}</Text>
              <Text style={styles.catPct}>{b.pct}</Text>
            </View>
          </View>
        </GlassCard>
      ))}
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
  heroCard: {
    marginBottom: 24,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  heroAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 4,
  },
  heroSub: {
    fontSize: 12,
    color: '#34d399',
    marginTop: 8,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  catCard: {
    marginBottom: 10,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  catValues: {
    alignItems: 'flex-end',
  },
  catAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  catPct: {
    fontSize: 11,
    color: '#94a3b8',
  },
});
