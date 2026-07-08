import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionsContext';
import { colors } from '../theme/colors';
import { formatINR } from '../utils/currency';
import LedgerAccountRow from '../components/LedgerAccountRow';

export default function LedgerScreen({ navigation }: any) {
  const { transactions, ledgerAccounts } = useTransactions();
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    let accounts = ledgerAccounts;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      accounts = accounts.filter((a) => a.name.toLowerCase().includes(q));
    }
    return accounts
      .map((account) => {
        const accountTxns = transactions.filter((t) => t.accountId === account.id);
        const credit = accountTxns.filter((t) => t.direction === 'credit').reduce((s, t) => s + t.amount, 0);
        const debit = accountTxns.filter((t) => t.direction === 'debit').reduce((s, t) => s + t.amount, 0);
        return { account, balance: credit - debit, credit, debit };
      })
      .sort((a, b) => a.account.name.localeCompare(b.account.name));
  }, [ledgerAccounts, transactions, search]);

  const totalBalance = rows.reduce((s, r) => s + r.balance, 0);
  const totalPositive = rows.filter((r) => r.balance > 0).reduce((s, r) => s + r.balance, 0);
  const totalNegative = rows.filter((r) => r.balance < 0).reduce((s, r) => s + Math.abs(r.balance), 0);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <Text style={styles.title}>Account</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>You'll Get</Text>
            <Text style={[styles.summaryValue, { color: colors.credit }]}>{formatINR(totalPositive, 2)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>You'll Give</Text>
            <Text style={[styles.summaryValue, { color: colors.debit }]}>{formatINR(totalNegative, 2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginLeft: 14 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search accounts..."
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

      <FlatList
        data={rows}
        keyExtractor={(item) => item.account.id}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 12 }}
        renderItem={({ item }) => (
          <LedgerAccountRow
            name={item.account.name}
            balance={item.balance}
            credit={item.credit}
            debit={item.debit}
            onPress={() => navigation.navigate('LedgerDetail', { accountId: item.account.id, accountName: item.account.name })}
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
    marginTop: 12,
    marginBottom: 8,
  },
  summaryCard: {
    marginHorizontal: 12,
    marginBottom: 10,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 36, backgroundColor: colors.border },
  summaryLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '700' },
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
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
});
