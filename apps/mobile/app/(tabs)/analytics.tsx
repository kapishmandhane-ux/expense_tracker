import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '../../components/glass-card';
import { supabase } from '../../lib/supabase/secure-client';
import { useExpensesQuery, useCategoriesQuery } from '@repo/api';
import { calculateCategorySummaries, formatCurrency } from '@repo/utils';

const PRESET_CATEGORIES = [
  { id: 'cat-1', user_id: 'user-demo', name: 'Food & Dining', color: '#f97316', icon: 'utensils', is_system: true, created_at: '' },
  { id: 'cat-2', user_id: 'user-demo', name: 'Groceries', color: '#10b981', icon: 'shopping-cart', is_system: true, created_at: '' },
  { id: 'cat-3', user_id: 'user-demo', name: 'Transportation', color: '#3b82f6', icon: 'car', is_system: true, created_at: '' },
  { id: 'cat-4', user_id: 'user-demo', name: 'Bills & Utilities', color: '#8b5cf6', icon: 'receipt', is_system: true, created_at: '' },
  { id: 'cat-5', user_id: 'user-demo', name: 'Entertainment', color: '#ec4899', icon: 'film', is_system: true, created_at: '' },
  { id: 'cat-6', user_id: 'user-demo', name: 'Shopping', color: '#eab308', icon: 'shopping-bag', is_system: true, created_at: '' },
];

export default function MobileAnalyticsScreen() {
  const { data: dbExpenses } = useExpensesQuery(supabase);
  const { data: dbCategories } = useCategoriesQuery(supabase);

  const expenses = dbExpenses || [];
  const categories = dbCategories && dbCategories.length > 0 ? dbCategories : PRESET_CATEGORIES;

  const totalSpent = expenses.reduce((acc: number, e: any) => acc + Number(e.amount), 0) || 21500;
  const summaries = calculateCategorySummaries(expenses, categories);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Spending Analytics</Text>

      <GlassCard style={styles.heroCard}>
        <Text style={styles.heroLabel}>Total Monthly Outflow</Text>
        <Text style={styles.heroAmount}>{formatCurrency(totalSpent)}</Text>
        <Text style={styles.heroSub}>Across all active categories</Text>
      </GlassCard>

      <Text style={styles.sectionTitle}>Category Proportion</Text>
      {summaries.map((b: any) => (
        <GlassCard key={b.category_id} style={styles.catCard}>
          <View style={styles.catRow}>
            <View style={styles.catInfo}>
              <View style={[styles.dot, { backgroundColor: b.category_color }]} />
              <Text style={styles.catText}>{b.category_name}</Text>
            </View>
            <View style={styles.catValues}>
              <Text style={styles.catAmount}>{formatCurrency(b.total_amount)}</Text>
              <Text style={styles.catPct}>{b.percentage}%</Text>
            </View>
          </View>
          <View style={styles.barBackground}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.min(100, b.percentage)}%`, backgroundColor: b.category_color },
              ]}
            />
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
    paddingTop: 55,
    paddingBottom: 100,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  heroCard: {
    marginBottom: 24,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    marginTop: 6,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 17,
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
    marginBottom: 8,
  },
  catInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  barBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});
