import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '../../components/glass-card';

export default function MobileHomeScreen() {
  const transactions = [
    { id: '1', title: 'Whole Foods Market', amount: '₹2,450.00', category: 'Groceries' },
    { id: '2', title: 'Starbucks Coffee', amount: '₹480.00', category: 'Food & Dining' },
    { id: '3', title: 'Uber Premier', amount: '₹620.00', category: 'Transportation' },
    { id: '4', title: 'Broadband Bill', amount: '₹1,499.00', category: 'Utilities' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>August Overview</Text>

      {/* Main Balance Card */}
      <GlassCard style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Month Spend</Text>
        <Text style={styles.balanceAmount}>₹21,500.00</Text>
        <Text style={styles.balanceSub}>₹28,500 left of ₹50,000 budget</Text>
      </GlassCard>

      {/* Recent Feed */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {transactions.map((t) => (
        <GlassCard key={t.id} style={styles.txCard}>
          <View style={styles.txRow}>
            <View>
              <Text style={styles.txTitle}>{t.title}</Text>
              <Text style={styles.txCat}>{t.category}</Text>
            </View>
            <Text style={styles.txAmount}>{t.amount}</Text>
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
  balanceCard: {
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  txCard: {
    marginBottom: 10,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  txCat: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
});
