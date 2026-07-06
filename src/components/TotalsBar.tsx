import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { formatINR } from '../utils/currency';

interface Props {
  creditTotal: number;
  debitTotal: number;
  closingBalance: number;
}

export default function TotalsBar({ creditTotal, debitTotal, closingBalance }: Props) {
  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.label}>Credit: {formatINR(creditTotal, 2)}</Text>
        <Text style={styles.label}>Debit: {formatINR(debitTotal, 2)}</Text>
      </View>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Closing Balance: {formatINR(closingBalance, 2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  label: { fontWeight: '600', color: colors.text },
  banner: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bannerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
