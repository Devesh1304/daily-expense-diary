import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { formatINR } from '../utils/currency';

interface Props {
  creditTotal: number;
  debitTotal: number;
  closingBalance: number;
}

export default function TotalsBar({ creditTotal, debitTotal, closingBalance }: Props) {
  const { palette: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Credit</Text>
          <Text style={[styles.totalValue, { color: c.credit }]}>{formatINR(creditTotal, 2)}</Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Debit</Text>
          <Text style={[styles.totalValue, { color: c.debit }]}>{formatINR(debitTotal, 2)}</Text>
        </View>
      </View>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Closing Balance: {formatINR(closingBalance, 2)}</Text>
      </View>
    </View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: c.surface,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    totalItem: { alignItems: 'center' },
    totalLabel: { fontSize: 12, color: c.textMuted, marginBottom: 2 },
    totalValue: { fontWeight: '700', fontSize: 15 },
    banner: {
      backgroundColor: c.primary,
      paddingVertical: 14,
      alignItems: 'center',
    },
    bannerText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 15,
    },
  });
}
