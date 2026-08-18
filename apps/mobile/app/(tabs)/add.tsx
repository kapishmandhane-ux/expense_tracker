import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { CustomNumpad } from '../../components/keypad/custom-numpad';
import { GlassCard } from '../../components/glass-card';
import { useRouter } from 'expo-router';

const CATEGORIES = [
  { name: 'Food', color: '#f97316' },
  { name: 'Groceries', color: '#10b981' },
  { name: 'Travel', color: '#3b82f6' },
  { name: 'Bills', color: '#8b5cf6' },
  { name: 'Shopping', color: '#eab308' },
  { name: 'Fun', color: '#ec4899' },
];

export default function MobileAddExpenseScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState('Food');

  const handleKeyPress = (key: string) => {
    if (amount === '0' && key !== '.') {
      setAmount(key);
    } else {
      if (key === '.' && amount.includes('.')) return;
      if (amount.length > 8) return;
      setAmount(amount + key);
    }
  };

  const handleDelete = () => {
    if (amount.length <= 1) {
      setAmount('0');
    } else {
      setAmount(amount.slice(0, -1));
    }
  };

  const handleSave = () => {
    // Navigate back to history
    router.replace('/(tabs)/expenses');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quick Expense</Text>

      <GlassCard style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount</Text>
        <Text style={styles.amountValue}>₹{amount}</Text>
      </GlassCard>

      {/* Category Pills */}
      <View style={styles.catGrid}>
        {CATEGORIES.map((c) => {
          const isSelected = selectedCategory === c.name;
          return (
            <TouchableOpacity
              key={c.name}
              onPress={() => setSelectedCategory(c.name)}
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

      <CustomNumpad
        onKeyPress={handleKeyPress}
        onDelete={handleDelete}
        onSubmit={handleSave}
      />

      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <Text style={styles.saveText}>Save Transaction</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090E',
    paddingTop: 60,
    justifyContent: 'space-between',
    paddingBottom: 90,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    paddingHorizontal: 20,
  },
  amountCard: {
    marginHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 16,
  },
  amountLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  amountValue: {
    fontSize: 40,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 4,
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
    paddingVertical: 8,
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
  saveButton: {
    marginHorizontal: 20,
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
