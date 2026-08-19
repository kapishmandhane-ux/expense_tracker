import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { GlassCard } from '../../components/glass-card';
import { supabase } from '../../lib/supabase/secure-client';
import { useExpensesQuery, useExpenseMutations } from '@repo/api';
import { formatCurrency, formatExpenseDate } from '@repo/utils';
import * as Haptics from 'expo-haptics';

const FALLBACK_ITEMS = [
  { id: '1', title: 'Whole Foods Market', amount: 2450.0, date: '2026-08-19T10:30:00Z', cat: 'Groceries', color: '#10b981' },
  { id: '2', title: 'Starbucks Coffee', amount: 480.0, date: '2026-08-19T08:15:00Z', cat: 'Food & Dining', color: '#f97316' },
  { id: '3', title: 'Uber Premier', amount: 620.0, date: '2026-08-18T21:40:00Z', cat: 'Transportation', color: '#3b82f6' },
  { id: '4', title: 'Broadband & Power', amount: 3200.0, date: '2026-08-17T14:00:00Z', cat: 'Bills & Utilities', color: '#8b5cf6' },
  { id: '5', title: 'IMAX Cinema', amount: 1100.0, date: '2026-08-16T19:00:00Z', cat: 'Entertainment', color: '#ec4899' },
];

export default function MobileExpensesScreen() {
  const { data: dbExpenses, isLoading, refetch } = useExpensesQuery(supabase);
  const { deleteExpense } = useExpenseMutations(supabase);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await refetch();
    setRefreshing(false);
  };

  const expenses = dbExpenses && dbExpenses.length > 0
    ? dbExpenses.map((e) => ({
        id: e.id,
        title: e.note || e.category?.name || 'Expense',
        amount: Number(e.amount),
        date: e.spent_at,
        cat: e.category?.name || 'General',
        color: e.category?.color || '#64748b',
      }))
    : FALLBACK_ITEMS;

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to remove "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {}
            deleteExpense.mutate(id);
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#6366f1"
          colors={['#6366f1']}
        />
      }
    >
      <View style={styles.headerRow}>
        <Text style={styles.header}>Expense History</Text>
        <Text style={styles.recordCount}>{expenses.length} records</Text>
      </View>

      {expenses.map((it) => (
        <TouchableOpacity
          key={it.id}
          onLongPress={() => handleDelete(it.id, it.title)}
          activeOpacity={0.8}
        >
          <GlassCard style={styles.card}>
            <View style={styles.row}>
              <View style={styles.leftCol}>
                <View style={[styles.catBadge, { backgroundColor: it.color }]} />
                <View>
                  <Text style={styles.title} numberOfLines={1}>
                    {it.title}
                  </Text>
                  <Text style={styles.subtitle}>
                    {it.cat} • {formatExpenseDate(it.date)}
                  </Text>
                </View>
              </View>
              <Text style={styles.amount}>{formatCurrency(it.amount)}</Text>
            </View>
          </GlassCard>
        </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  recordCount: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  card: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  catBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
});
