import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, colorForLetter } from '../theme/colors';
import { formatINR } from '../utils/currency';

interface Props {
  name: string;
  balance: number;
  credit: number;
  debit: number;
  onPress: () => void;
}

export default function LedgerAccountRow({ name, balance, credit, debit, onPress }: Props) {
  const letter = name.trim().charAt(0).toUpperCase() || '?';
  const positive = balance >= 0;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: colorForLetter(letter) }]}>
        <Text style={styles.avatarText}>{letter}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.subtext}>
          Cr: {formatINR(credit)}  |  Dr: {formatINR(debit)}
        </Text>
      </View>
      <Text style={[styles.balance, positive ? styles.positive : styles.negative]}>
        {positive ? '' : '-'}{formatINR(Math.abs(balance), 2)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginHorizontal: 12,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  subtext: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  balance: { fontWeight: '700', fontSize: 15 },
  positive: { color: colors.credit },
  negative: { color: colors.debit },
});
