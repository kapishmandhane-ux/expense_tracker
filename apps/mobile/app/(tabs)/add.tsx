import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CustomNumpad } from '../../components/keypad/custom-numpad';
import { GlassCard } from '../../components/glass-card';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../lib/supabase/secure-client';
import { useExpenseMutations, useCategoriesQuery } from '@repo/api';
import { getCurrencySymbol } from '@repo/utils';

const PRESET_CATEGORIES = [
  { id: 'cat-1', name: 'Food', fullName: 'Food & Dining', color: '#f97316' },
  { id: 'cat-2', name: 'Groceries', fullName: 'Groceries', color: '#10b981' },
  { id: 'cat-3', name: 'Travel', fullName: 'Transportation', color: '#3b82f6' },
  { id: 'cat-4', name: 'Bills', fullName: 'Bills & Utilities', color: '#8b5cf6' },
  { id: 'cat-5', name: 'Shopping', fullName: 'Shopping', color: '#eab308' },
  { id: 'cat-6', name: 'Entertainment', fullName: 'Entertainment', color: '#ec4899' },
];

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI' },
  { id: 'credit_card', label: 'Card' },
  { id: 'cash', label: 'Cash' },
];

export default function MobileAddExpenseScreen() {
  const router = useRouter();
  const { data: dbCategories } = useCategoriesQuery(supabase);
  const { createExpense } = useExpenseMutations(supabase);

  const categories = useMemo(() => {
    if (dbCategories && dbCategories.length > 0) {
      return dbCategories.map((c: any) => ({
        id: c.id,
        name: c.name,
        fullName: c.name,
        color: c.color || '#64748b',
      }));
    }
    return PRESET_CATEGORIES;
  }, [dbCategories]);

  const [amount, setAmount] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || PRESET_CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'credit_card' | 'cash'>('upi');

  const symbol = getCurrencySymbol('INR');

  const handleKeyPress = (key: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (amount === '0' && key !== '.') {
      setAmount(key);
    } else {
      if (key === '.' && amount.includes('.')) return;
      if (amount.length > 8) return;
      setAmount(amount + key);
    }
  };

  const handleDelete = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    if (amount.length <= 1) {
      setAmount('0');
    } else {
      setAmount(amount.slice(0, -1));
    }
  };

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const chosenCat = selectedCategory || categories[0] || PRESET_CATEGORIES[0];

    // Trigger mutation
    createExpense.mutate({
      amount: numAmount,
      category_id: chosenCat.id,
      payment_method: paymentMethod as any,
      note: chosenCat.fullName || chosenCat.name,
      spent_at: new Date().toISOString(),
    });

    // Reset and navigate to expenses tab
    setAmount('0');
    router.replace('/(tabs)/expenses' as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quick Expense</Text>

      <GlassCard style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount</Text>
        <Text style={styles.amountValue}>{symbol}{amount}</Text>
      </GlassCard>

      {/* Category Pills */}
      <View style={styles.catGrid}>
        {categories.slice(0, 8).map((c: any) => {
          const isSelected = selectedCategory?.id === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => {
                try {
                  Haptics.selectionAsync();
                } catch {}
                setSelectedCategory(c);
              }}
              style={[
                styles.catPill,
                isSelected && { backgroundColor: c.color, borderColor: c.color },
              ]}
            >
              <Text
                style={[
                  styles.catText,
                  isSelected && { color: '#ffffff', fontWeight: '800' },
                ]}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Payment Method Pills */}
      <View style={styles.paymentRow}>
        {PAYMENT_METHODS.map((pm) => {
          const isSelected = paymentMethod === pm.id;
          return (
            <TouchableOpacity
              key={pm.id}
              onPress={() => {
                try {
                  Haptics.selectionAsync();
                } catch {}
                setPaymentMethod(pm.id as any);
              }}
              style={[
                styles.payPill,
                isSelected && styles.payPillSelected,
              ]}
            >
              <Text
                style={[
                  styles.payText,
                  isSelected && styles.payTextSelected,
                ]}
              >
                {pm.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <CustomNumpad
        onKeyPress={handleKeyPress}
        onDelete={handleDelete}
        onSubmit={handleSave}
      />

      <TouchableOpacity onPress={handleSave} style={styles.saveButton} activeOpacity={0.8}>
        <Text style={styles.saveText}>Save Transaction</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090E',
    paddingTop: 50,
    justifyContent: 'space-between',
    paddingBottom: 85,
  },
  header: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    paddingHorizontal: 20,
  },
  amountCard: {
    marginHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 12,
  },
  amountLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountValue: {
    fontSize: 38,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  catText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  payPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  payPillSelected: {
    backgroundColor: '#6366f1',
  },
  payText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  payTextSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  saveButton: {
    marginHorizontal: 20,
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
