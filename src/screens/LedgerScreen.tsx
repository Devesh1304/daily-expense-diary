import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionsContext';
import { useAuth } from '../context/AuthContext';
import { deleteLedgerAccount } from '../firebase/firestore';
import { Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { formatINR } from '../utils/currency';
import LedgerAccountRow from '../components/LedgerAccountRow';
import ConfirmDialog from '../components/ConfirmDialog';

export default function LedgerScreen({ navigation }: any) {
  const { palette: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { user } = useAuth();
  const { transactions, ledgerAccounts } = useTransactions();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

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
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Account</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>You'll Get</Text>
            <Text style={[styles.summaryValue, { color: c.credit }]}>{formatINR(totalPositive, 2)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>You'll Give</Text>
            <Text style={[styles.summaryValue, { color: c.debit }]}>{formatINR(totalNegative, 2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={c.textMuted} style={{ marginLeft: 14 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search accounts..."
          placeholderTextColor={c.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={{ marginRight: 10 }}>
            <Ionicons name="close-circle" size={18} color={c.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.account.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 12 }}
        renderItem={({ item }) => (
          <LedgerAccountRow
            name={item.account.name}
            balance={item.balance}
            credit={item.credit}
            debit={item.debit}
            onPress={() => navigation.navigate('LedgerDetail', { accountId: item.account.id, accountName: item.account.name })}
            onDelete={() => setDeleteTarget({ id: item.account.id, name: item.account.name })}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No accounts yet — add a transaction to create one.</Text>}
      />
      {deleteTarget && (
        <ConfirmDialog
          visible={!!deleteTarget}
          title={`Delete "${deleteTarget.name}"?`}
          message="This will permanently delete this account and all its transactions."
          onConfirm={() => {
            if (user) deleteLedgerAccount(deleteTarget.id, user.uid);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background, paddingBottom: 20, paddingTop: 20 },
    topBar: {
      backgroundColor: c.topBar,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.topBarBorder,
      marginBottom: 8,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
      color: c.text,
    },
    summaryCard: {
      marginHorizontal: 12,
      marginBottom: 10,
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    summaryRow: { flexDirection: 'row', alignItems: 'center' },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryDivider: { width: 1, height: 36, backgroundColor: c.border },
    summaryLabel: { fontSize: 12, color: c.textMuted, marginBottom: 4 },
    summaryValue: { fontSize: 18, fontWeight: '700' },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 12,
      marginHorizontal: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: c.border,
    },
    searchInput: {
      flex: 1,
      paddingHorizontal: 10,
      paddingVertical: 10,
      fontSize: 14,
      color: c.text,
    },
    empty: { textAlign: 'center', color: c.textMuted, marginTop: 40 },
  });
}
