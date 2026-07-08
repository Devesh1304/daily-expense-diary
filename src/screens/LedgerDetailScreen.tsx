import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionsContext';
import { deleteTransaction } from '../firebase/firestore';
import { colors } from '../theme/colors';
import TransactionTable, { SortKey } from '../components/TransactionTable';
import TotalsBar from '../components/TotalsBar';

export default function LedgerDetailScreen({ route, navigation }: any) {
  const { accountId, accountName } = route.params;
  const { transactions } = useTransactions();
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const accountTxns = useMemo(
    () => transactions.filter((t) => t.accountId === accountId),
    [transactions, accountId]
  );

  const sorted = useMemo(() => {
    const list = [...accountTxns];
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
  }, [accountTxns, sortKey, sortDir]);

  const creditTotal = accountTxns.filter((t) => t.direction === 'credit').reduce((s, t) => s + t.amount, 0);
  const debitTotal = accountTxns.filter((t) => t.direction === 'debit').reduce((s, t) => s + t.amount, 0);

  function handleSortChange(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{accountName}</Text>
        <View style={{ width: 36 }} />
      </View>

      <TransactionTable
        transactions={sorted}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        onDelete={(t) => deleteTransaction(t.id)}
      />

      <TotalsBar creditTotal={creditTotal} debitTotal={debitTotal} closingBalance={creditTotal - debitTotal} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingBottom: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
});
