import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '../../components/glass-card';
import { supabase } from '../../lib/supabase/secure-client';
import { useBudgetsQuery, useExpensesQuery, useCategoriesQuery } from '@repo/api';
import { formatCurrency, getCurrentMonthKey } from '@repo/utils';

const FALLBACK_BUDGETS = [
  { cat: 'Food & Dining', spent: 6850, limit: 12000, color: '#f97316' },
  { cat: 'Groceries', spent: 5400, limit: 8000, color: '#10b981' },
  { cat: 'Transportation', spent: 3200, limit: 5000, color: '#3b82f6' },
  { cat: 'Bills & Utilities', spent: 4200, limit: 6000, color: '#8b5cf6' },
  { cat: 'Shopping', spent: 9800, limit: 10000, color: '#eab308' },
];

export default function MobileBudgetsScreen() {
  const currentMonth = getCurrentMonthKey();
  const { data: dbBudgets } = useBudgetsQuery(supabase, currentMonth);
  const { data: dbExpenses } = useExpensesQuery(supabase);
  const { data: dbCategories } = useCategoriesQuery(supabase);

  const budgets = useMemo(() => {
    if (dbBudgets && dbBudgets.length > 0 && dbExpenses) {
      return dbBudgets.map((b: any) => {
        const cat = (dbCategories || []).find((c: any) => c.id === b.category_id);
        const spent = dbExpenses
          .filter((e: any) => e.category_id === b.category_id)
          .reduce((sum: number, cur: any) => sum + Number(cur.amount), 0);
        return {
          cat: cat?.name || 'Category',
          spent,
          limit: Number(b.monthly_limit),
          color: cat?.color || '#6366f1',
        };
      });
    }
    return FALLBACK_BUDGETS;
  }, [dbBudgets, dbExpenses, dbCategories]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Budget Thresholds</Text>

      {budgets.map((b) => {
        const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
        const isOver = b.spent > b.limit;
        const isNear = b.spent >= b.limit * 0.8 && !isOver;

        return (
          <GlassCard key={b.cat} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.catTitle}>{b.cat}</Text>
              <Text
                style={[
                  styles.pct,
                  isOver ? { color: '#f43f5e' } : isNear ? { color: '#f59e0b' } : undefined,
                ]}
              >
                {pct}%
              </Text>
            </View>
            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${pct}%`,
                    backgroundColor: isOver ? '#f43f5e' : isNear ? '#f59e0b' : b.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.details}>
              {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
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
    paddingTop: 55,
    paddingBottom: 100,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    fontWeight: '600',
  },
});
