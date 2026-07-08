import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
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
  const [search, setSearch] = useState('');

  const range = filter === 'custom' ? customRange : getDateRange(filter);

  const filtered = useMemo(() => {
    let list = transactions.filter((t) => isWithinRange(t.date, range));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) =>
        t.accountName.toLowerCase().includes(q) ||
        (t.remarks && t.remarks.toLowerCase().includes(q))
      );
    }
    return list;
  }, [transactions, range, search]);

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
      <Text style={styles.title}>Transactions</Text>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginLeft: 14 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or remarks..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={{ marginRight: 10 }}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

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
          <Ionicons name="add-circle" size={18} color={colors.credit} />
          <Text style={[styles.actionText, { color: colors.credit }]}>Credit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.debitButton]} onPress={() => setModalDirection('debit')}>
          <Ionicons name="remove-circle" size={18} color={colors.debit} />
          <Text style={[styles.actionText, { color: colors.debit }]}>Debit</Text>
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
  container: { flex: 1, backgroundColor: colors.background, paddingBottom: 20, paddingTop: 12 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
    marginTop: 8,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
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
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  creditButton: {
    backgroundColor: colors.creditBg,
    borderWidth: 1,
    borderColor: '#C3EDDA',
  },
  debitButton: {
    backgroundColor: colors.debitBg,
    borderWidth: 1,
    borderColor: '#F5C6C6',
  },
  actionText: { fontWeight: '700', fontSize: 14 },
});
