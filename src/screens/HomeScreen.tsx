import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionsContext';
import { colors } from '../theme/colors';
import { formatINR } from '../utils/currency';
import { getDateRange, isWithinRange, formatDisplayDate } from '../utils/dateRanges';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function HomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const { transactions } = useTransactions();

  const { cashBalance, monthCredit, monthDebit, recentTxns } = useMemo(() => {
    const credit = transactions.filter((t) => t.direction === 'credit').reduce((s, t) => s + t.amount, 0);
    const debit = transactions.filter((t) => t.direction === 'debit').reduce((s, t) => s + t.amount, 0);
    const monthRange = getDateRange('month');
    const inMonth = transactions.filter((t) => isWithinRange(t.date, monthRange));
    const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
    return {
      cashBalance: credit - debit,
      monthCredit: inMonth.filter((t) => t.direction === 'credit').reduce((s, t) => s + t.amount, 0),
      monthDebit: inMonth.filter((t) => t.direction === 'debit').reduce((s, t) => s + t.amount, 0),
      recentTxns: sorted.slice(0, 5),
    };
  }, [transactions]);

  const maxBar = Math.max(monthCredit, monthDebit, 1);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{user?.displayName || user?.email}</Text>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.balanceCard}
          onPress={() => navigation.navigate('Transactions')}
          activeOpacity={0.8}
        >
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceValue}>{formatINR(cashBalance, 2)}</Text>
          <Text style={styles.balanceHint}>Tap to view transactions</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <View style={styles.barCard}>
            <View style={styles.barRow}>
              <View style={styles.barLabelRow}>
                <View style={[styles.barDot, { backgroundColor: colors.credit }]} />
                <Text style={styles.barLabel}>Credit</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, styles.barCredit, { width: `${(monthCredit / maxBar) * 100}%` }]} />
              </View>
              <Text style={styles.barAmount}>{formatINR(monthCredit, 2)}</Text>
            </View>
            <View style={styles.barRow}>
              <View style={styles.barLabelRow}>
                <View style={[styles.barDot, { backgroundColor: colors.debit }]} />
                <Text style={styles.barLabel}>Debit</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, styles.barDebit, { width: `${(monthDebit / maxBar) * 100}%` }]} />
              </View>
              <Text style={styles.barAmount}>{formatINR(monthDebit, 2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickButton} onPress={() => navigation.navigate('Transactions')}>
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.quickButtonText}>Add Entry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickButton, styles.quickButtonOutline]} onPress={() => navigation.navigate('Account')}>
            <Ionicons name="swap-horizontal-outline" size={20} color={colors.primary} />
            <Text style={[styles.quickButtonText, styles.quickButtonOutlineText]}>View Account</Text>
          </TouchableOpacity>
        </View>

        {recentTxns.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <View style={styles.recentCard}>
              {recentTxns.map((t, i) => (
                <View key={t.id} style={[styles.recentRow, i < recentTxns.length - 1 && styles.recentRowBorder]}>
                  <View style={[styles.recentIcon, t.direction === 'credit' ? styles.recentIconCredit : styles.recentIconDebit]}>
                    <Ionicons
                      name={t.direction === 'credit' ? 'arrow-down' : 'arrow-up'}
                      size={16}
                      color={t.direction === 'credit' ? colors.credit : colors.debit}
                    />
                  </View>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentName} numberOfLines={1}>{t.accountName}</Text>
                    <Text style={styles.recentDate}>{formatDisplayDate(t.date)}</Text>
                  </View>
                  <Text style={[styles.recentAmount, t.direction === 'credit' ? styles.recentCredit : styles.recentDebit]}>
                    {t.direction === 'credit' ? '+' : '-'}{formatINR(t.amount)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingBottom: 20, paddingTop: 12 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  greeting: { color: colors.textMuted, fontSize: 14 },
  name: { color: colors.text, fontSize: 22, fontWeight: '700', marginTop: 2 },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    marginHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  balanceValue: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 8 },
  balanceHint: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 8 },
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  barCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 65,
  },
  barDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  barLabel: { fontSize: 13, color: colors.textSecondary },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 4, minWidth: 4 },
  barCredit: { backgroundColor: colors.credit },
  barDebit: { backgroundColor: colors.debit },
  barAmount: { fontSize: 13, fontWeight: '600', color: colors.text, width: 80, textAlign: 'right' },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  quickButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  quickButtonOutline: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
  },
  quickButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  quickButtonOutlineText: { color: colors.primary },
  recentCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  recentRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentIconCredit: { backgroundColor: colors.creditBg },
  recentIconDebit: { backgroundColor: colors.debitBg },
  recentInfo: { flex: 1 },
  recentName: { fontSize: 14, fontWeight: '600', color: colors.text },
  recentDate: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  recentAmount: { fontSize: 14, fontWeight: '700' },
  recentCredit: { color: colors.credit },
  recentDebit: { color: colors.debit },
});
