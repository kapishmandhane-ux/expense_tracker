import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '../../components/glass-card';
import { supabase } from '../../lib/supabase/secure-client';
import { useExpensesQuery, useBudgetsQuery } from '@repo/api';
import { formatCurrency, formatExpenseDate } from '@repo/utils';

export default function MobileHomeScreen() {
  const { data: dbExpenses } = useExpensesQuery(supabase);
  const { data: dbBudgets } = useBudgetsQuery(supabase);

  const expenses = dbExpenses || [];
  const totalSpent = expenses.reduce((acc, e) => acc + Number(e.amount), 0) || 21500;
  const totalBudget = dbBudgets?.reduce((acc, b) => acc + Number(b.monthly_limit), 0) || 50000;
  const remaining = Math.max(0, totalBudget - totalSpent);

  const recentExpenses = expenses.slice(0, 4);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Financial Overview</Text>

      {/* Main Balance Card */}
      <GlassCard style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Month Spend</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(totalSpent)}</Text>
        <Text style={styles.balanceSub}>
          {formatCurrency(remaining)} left of {formatCurrency(totalBudget)} budget
        </Text>
      </GlassCard>

      {/* Recent Feed */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {recentExpenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recent transactions recorded.</Text>
        </View>
      ) : (
        recentExpenses.map((t) => (
          <GlassCard key={t.id} style={styles.txCard}>
            <View style={styles.txRow}>
              <View style={styles.leftCol}>
                <View
                  style={[
                    styles.catBadge,
                    { backgroundColor: t.category?.color || '#64748b' },
                  ]}
                />
                <View>
                  <Text style={styles.txTitle}>{t.note || t.category?.name || 'Expense'}</Text>
                  <Text style={styles.txCat}>
                    {t.category?.name || 'General'} • {formatExpenseDate(t.spent_at)}
                  </Text>
                </View>
              </View>
              <Text style={styles.txAmount}>{formatCurrency(Number(t.amount))}</Text>
            </View>
          </GlassCard>
        ))
      )}
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
  balanceCard: {
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 4,
  },
  balanceSub: {
    fontSize: 12,
    color: '#34d399',
    marginTop: 8,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  txCard: {
    marginBottom: 10,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  catBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  txCat: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
});
