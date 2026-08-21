import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../../components/glass-card';
import { supabase } from '../../lib/supabase/secure-client';
import { useExpensesQuery, useCategoriesQuery, useExpenseMutations } from '@repo/api';
import { formatCurrency, formatExpenseDate } from '@repo/utils';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI' },
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'debit_card', label: 'Debit Card' },
  { id: 'cash', label: 'Cash' },
  { id: 'net_banking', label: 'Net Banking' },
  { id: 'other', label: 'Other' },
];

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: expenses, isLoading: isExpensesLoading } = useExpensesQuery(supabase);
  const { data: categories } = useCategoriesQuery(supabase);
  const { updateExpense, deleteExpense } = useExpenseMutations(supabase);

  const expense = expenses?.find((e: any) => e.id === id);

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('upi');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setAmount(String(expense.amount));
      setNote(expense.note || '');
      setCategoryId(expense.category_id || null);
      setPaymentMethod(expense.payment_method || 'upi');
    }
  }, [expense]);

  const currentCategory = categories?.find((c: any) => c.id === categoryId);

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount.');
      return;
    }

    if (!id) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    setIsSaving(true);
    try {
      await updateExpense.mutateAsync({
        id,
        amount: numAmount,
        category_id: categoryId || undefined,
        note: note.trim() || undefined,
        payment_method: paymentMethod as any,
      });

      router.back();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Unable to update transaction.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;

    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to permanently delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {}

            try {
              await deleteExpense.mutateAsync(id);
              router.back();
            } catch (err: any) {
              Alert.alert('Delete Failed', err.message || 'Could not delete transaction.');
            }
          },
        },
      ]
    );
  };

  if (isExpensesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading transaction...</Text>
      </View>
    );
  }

  if (!expense && !isExpensesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorHeader}>Transaction Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Top Navigation */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              router.back();
            }}
          >
            <Text style={styles.headerButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Edit Transaction</Text>
          <TouchableOpacity
            style={[styles.headerButton, styles.deleteHeaderBtn]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteHeaderText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Card */}
        <GlassCard style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View
              style={[
                styles.categoryDot,
                { backgroundColor: currentCategory?.color || '#64748b' },
              ]}
            />
            <Text style={styles.heroCategory}>
              {currentCategory?.name || 'General Expense'}
            </Text>
          </View>

          <View style={styles.amountInputRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#64748b"
            />
          </View>

          {expense?.spent_at && (
            <Text style={styles.spentAtDate}>
              Recorded on {formatExpenseDate(expense.spent_at)}
            </Text>
          )}
        </GlassCard>

        {/* Note Input */}
        <Text style={styles.sectionLabel}>Note / Merchant Description</Text>
        <GlassCard style={styles.inputCard}>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="What was this expense for?"
            placeholderTextColor="#64748b"
            multiline
          />
        </GlassCard>

        {/* Category Selection */}
        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.chipsGrid}>
          {categories?.map((cat: any) => {
            const isSelected = categoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setCategoryId(cat.id);
                }}
                style={[
                  styles.chip,
                  isSelected && {
                    backgroundColor: cat.color,
                    borderColor: cat.color,
                  },
                ]}
              >
                <View
                  style={[
                    styles.chipDot,
                    { backgroundColor: isSelected ? '#ffffff' : cat.color },
                  ]}
                />
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionLabel}>Payment Mode</Text>
        <View style={styles.chipsGrid}>
          {PAYMENT_METHODS.map((pm) => {
            const isSelected = paymentMethod === pm.id;
            return (
              <TouchableOpacity
                key={pm.id}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setPaymentMethod(pm.id);
                }}
                style={[
                  styles.chip,
                  isSelected && styles.payChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {pm.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* Secondary Delete Button */}
        <TouchableOpacity style={styles.bottomDeleteBtn} onPress={handleDelete}>
          <Text style={styles.bottomDeleteText}>Delete Transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#07090E',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#07090E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  errorHeader: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  headerButtonText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteHeaderBtn: {
    paddingHorizontal: 6,
  },
  deleteHeaderText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
  screenTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  heroCard: {
    marginBottom: 24,
    alignItems: 'center',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  heroCategory: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '900',
    color: '#6366f1',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 38,
    fontWeight: '900',
    color: '#ffffff',
    minWidth: 100,
    textAlign: 'center',
  },
  spentAtDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 10,
  },
  inputCard: {
    marginBottom: 16,
  },
  noteInput: {
    color: '#ffffff',
    fontSize: 15,
    minHeight: 48,
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  payChipSelected: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  saveBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomDeleteBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bottomDeleteText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
