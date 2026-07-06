import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionsContext';
import { colors } from '../theme/colors';
import { formatINR } from '../utils/currency';
import { getDateRange, isWithinRange } from '../utils/dateRanges';

export default function HomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const { transactions } = useTransactions();

  const { cashBalance, monthCredit, monthDebit } = useMemo(() => {
    const credit = transactions.filter((t) => t.direction === 'credit').reduce((s, t) => s + t.amount, 0);
    const debit = transactions.filter((t) => t.direction === 'debit').reduce((s, t) => s + t.amount, 0);
    const monthRange = getDateRange('month');
    const inMonth = transactions.filter((t) => isWithinRange(t.date, monthRange));
    return {
      cashBalance: credit - debit,
      monthCredit: inMonth.filter((t) => t.direction === 'credit').reduce((s, t) => s + t.amount, 0),
      monthDebit: inMonth.filter((t) => t.direction === 'debit').reduce((s, t) => s + t.amount, 0),
    };
  }, [transactions]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.name}>{user?.displayName || user?.email}</Text>
          </View>
          <TouchableOpacity onPress={signOut}>
            <Ionicons name="log-out-outline" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardRow}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Cash')}>
            <Ionicons name="cash-outline" size={22} color={colors.primary} />
            <Text style={styles.cardLabel}>Cash Balance</Text>
            <Text style={styles.cardValue}>{formatINR(cashBalance, 2)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>This Month</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryCredit}>Credit: {formatINR(monthCredit, 2)}</Text>
            <Text style={styles.summaryDebit}>Debit: {formatINR(monthDebit, 2)}</Text>
          </View>
        </View>

        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickButton} onPress={() => navigation.navigate('Cash')}>
            <Text style={styles.quickButtonText}>Add Cash Entry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickButton} onPress={() => navigation.navigate('Ledger')}>
            <Text style={styles.quickButtonText}>View Ledger</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  greeting: { color: colors.textMuted, fontSize: 14 },
  name: { color: colors.text, fontSize: 20, fontWeight: '700' },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  cardLabel: { color: colors.textMuted, marginTop: 8 },
  cardValue: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 4 },
  summaryCard: {
    marginTop: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  summaryTitle: { color: colors.text, fontWeight: '700', marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryCredit: { color: colors.credit, fontWeight: '600' },
  summaryDebit: { color: colors.debit, fontWeight: '600' },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  quickButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickButtonText: { color: '#fff', fontWeight: '700' },
});
