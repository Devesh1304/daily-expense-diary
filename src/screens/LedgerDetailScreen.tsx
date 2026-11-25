import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionsContext';
import { deleteTransaction } from '../firebase/firestore';
import { Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import TransactionTable, { SortKey } from '../components/TransactionTable';
import TotalsBar from '../components/TotalsBar';

export default function LedgerDetailScreen({ route, navigation }: any) {
  const { palette: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
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
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={c.text} />
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

function makeStyles(c: Palette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background, paddingBottom: 20, paddingTop: 20 },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: c.topBar,
      borderBottomWidth: 1,
      borderBottomColor: c.topBarBorder,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 1,
    },
    title: { fontSize: 20, fontWeight: '700', color: c.text },
  });
}
