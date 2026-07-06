import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionsContext';
import { deleteTransaction } from '../firebase/firestore';
import { DateFilter, DateRange } from '../types';
import { colors } from '../theme/colors';
import { getDateRange, isWithinRange } from '../utils/dateRanges';
import FilterPills, { PillOption } from '../components/FilterPills';
import DateField from '../components/DateField';
import TransactionTable, { SortKey } from '../components/TransactionTable';
import TotalsBar from '../components/TotalsBar';
import AddTransactionModal from '../components/AddTransactionModal';

const FILTER_OPTIONS: PillOption<DateFilter>[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'custom', label: 'Custom' },
];

export default function CashScreen() {
  const { transactions } = useTransactions();
  const [filter, setFilter] = useState<DateFilter>('month');
  const [customRange, setCustomRange] = useState<DateRange>(getDateRange('month'));
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [modalDirection, setModalDirection] = useState<'credit' | 'debit' | null>(null);

  const range = filter === 'custom' ? customRange : getDateRange(filter);

  const filtered = useMemo(() => {
    return transactions.filter((t) => isWithinRange(t.date, range));
  }, [transactions, range]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = a.date.localeCompare(b.date);
      else if (sortKey === 'accountName') cmp = a.accountName.localeCompare(b.accountName);
      else if (sortKey === 'credit') {
        const av = a.direction === 'credit' ? a.amount : -1;
        const bv = b.direction === 'credit' ? b.amount : -1;
        cmp = av - bv;
      } else if (sortKey === 'debit') {
        const av = a.direction === 'debit' ? a.amount : -1;
        const bv = b.direction === 'debit' ? b.amount : -1;
        cmp = av - bv;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const creditTotal = filtered.filter((t) => t.direction === 'credit').reduce((s, t) => s + t.amount, 0);
  const debitTotal = filtered.filter((t) => t.direction === 'debit').reduce((s, t) => s + t.amount, 0);
  const closingBalance = creditTotal - debitTotal;

  function handleSortChange(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Cash</Text>

      <FilterPills options={FILTER_OPTIONS} value={filter} onChange={setFilter} />

      {filter === 'custom' && (
        <View style={styles.customRow}>
          <View style={styles.customField}>
            <DateField value={customRange.start} onChange={(v) => setCustomRange((r) => ({ ...r, start: v }))} />
          </View>
          <View style={styles.customField}>
            <DateField value={customRange.end} onChange={(v) => setCustomRange((r) => ({ ...r, end: v }))} />
          </View>
        </View>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionButton, styles.creditButton]} onPress={() => setModalDirection('credit')}>
          <Ionicons name="add" size={18} color={colors.text} />
          <Text style={styles.actionText}>Credit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.debitButton]} onPress={() => setModalDirection('debit')}>
          <Ionicons name="remove" size={18} color={colors.text} />
          <Text style={styles.actionText}>Debit</Text>
        </TouchableOpacity>
      </View>

      <TransactionTable
        transactions={sorted}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        onDelete={(t) => deleteTransaction(t.id)}
      />

      <TotalsBar creditTotal={creditTotal} debitTotal={debitTotal} closingBalance={closingBalance} />

      {modalDirection && (
        <AddTransactionModal
          visible={!!modalDirection}
          onClose={() => setModalDirection(null)}
          direction={modalDirection}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
    marginVertical: 12,
  },
  customRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  customField: { flex: 1 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.pillBorder,
    borderRadius: 24,
    paddingVertical: 12,
    gap: 6,
  },
  creditButton: {},
  debitButton: {},
  actionText: { fontWeight: '600', color: colors.text },
});
