import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, colorForLetter } from '../theme/colors';
import { formatINR } from '../utils/currency';

interface Props {
  name: string;
  balance: number;
  onPress: () => void;
  onMenuPress: () => void;
}

export default function LedgerAccountRow({ name, balance, onPress, onMenuPress }: Props) {
  const letter = name.trim().charAt(0).toUpperCase() || '?';
  const positive = balance >= 0;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={[styles.avatar, { backgroundColor: colorForLetter(letter) }]}>
        <Text style={styles.avatarText}>{letter}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      <Text style={[styles.balance, positive ? styles.positive : styles.negative]}>
        {positive ? '' : '-'}{formatINR(Math.abs(balance), 2)}
      </Text>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: '700' },
  name: { flex: 1, fontSize: 15, color: colors.text },
  balance: { fontWeight: '600', marginRight: 8 },
  positive: { color: colors.credit },
  negative: { color: colors.debit },
  menuButton: { padding: 4 },
});
