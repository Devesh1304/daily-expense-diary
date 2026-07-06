import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Alert } from 'react-native';
import { useTransactions } from '../context/TransactionsContext';
import { updateLedgerAccountCategory } from '../firebase/firestore';
import { LedgerCategory } from '../types';
import { colors } from '../theme/colors';
import FilterPills, { PillOption } from '../components/FilterPills';
import LedgerAccountRow from '../components/LedgerAccountRow';

type CategoryFilter = 'all' | LedgerCategory;

const FILTER_OPTIONS: PillOption<CategoryFilter>[] = [
  { key: 'all', label: 'All' },
  { key: 'customer', label: 'Customer' },
  { key: 'supplier', label: 'Supplier' },
  { key: 'bank', label: 'Bank' },
];

const CATEGORY_CHOICES: LedgerCategory[] = ['customer', 'supplier', 'bank', 'other'];

export default function LedgerScreen({ navigation }: any) {
  const { transactions, ledgerAccounts } = useTransactions();
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const rows = useMemo(() => {
    return ledgerAccounts
      .filter((a) => filter === 'all' || a.category === filter)
      .map((account) => {
        const accountTxns = transactions.filter((t) => t.accountId === account.id);
        const credit = accountTxns.filter((t) => t.direction === 'credit').reduce((s, t) => s + t.amount, 0);
        const debit = accountTxns.filter((t) => t.direction === 'debit').reduce((s, t) => s + t.amount, 0);
        return { account, balance: credit - debit };
      })
      .sort((a, b) => a.account.name.localeCompare(b.account.name));
  }, [ledgerAccounts, transactions, filter]);

  function handleMenuPress(accountId: string, currentCategory: LedgerCategory) {
    Alert.alert(
      'Set category',
      undefined,
      CATEGORY_CHOICES.map((c) => ({
        text: c.charAt(0).toUpperCase() + c.slice(1) + (c === currentCategory ? ' (current)' : ''),
        onPress: () => updateLedgerAccountCategory(accountId, c),
      })).concat([{ text: 'Cancel', onPress: () => {}, style: 'cancel' } as any])
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ledger</Text>
      <FilterPills options={FILTER_OPTIONS} value={filter} onChange={setFilter} />

      <FlatList
        data={rows}
        keyExtractor={(item) => item.account.id}
        contentContainerStyle={{ paddingTop: 8 }}
        renderItem={({ item }) => (
          <LedgerAccountRow
            name={item.account.name}
            balance={item.balance}
            onPress={() => navigation.navigate('LedgerDetail', { accountId: item.account.id, accountName: item.account.name })}
            onMenuPress={() => handleMenuPress(item.account.id, item.account.category)}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No accounts yet — add a transaction to create one.</Text>}
      />
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
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
});
