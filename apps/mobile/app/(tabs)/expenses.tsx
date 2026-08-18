import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '../../components/glass-card';

export default function MobileExpensesScreen() {
  const items = [
    { id: '1', title: 'Whole Foods Market', amount: '₹2,450.00', date: 'Aug 19', cat: 'Groceries' },
    { id: '2', title: 'Starbucks Coffee', amount: '₹480.00', date: 'Aug 19', cat: 'Food' },
    { id: '3', title: 'Uber Premier', amount: '₹620.00', date: 'Aug 18', cat: 'Travel' },
    { id: '4', title: 'Broadband Bill', amount: '₹1,499.00', date: 'Aug 17', cat: 'Utilities' },
    { id: '5', title: 'IMAX Cinema', amount: '₹1,100.00', date: 'Aug 16', cat: 'Fun' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Expense History</Text>
      {items.map((it) => (
        <GlassCard key={it.id} style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.title}>{it.title}</Text>
              <Text style={styles.subtitle}>{it.cat} • {it.date}</Text>
            </View>
            <Text style={styles.amount}>{it.amount}</Text>
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
  card: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
