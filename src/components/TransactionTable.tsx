import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { colors } from '../theme/colors';
import { formatINR } from '../utils/currency';
import { formatDisplayDate } from '../utils/dateRanges';
import ConfirmDialog from './ConfirmDialog';
import TransactionDetailModal from './TransactionDetailModal';
import AddTransactionModal from './AddTransactionModal';

export type SortKey = 'date' | 'accountName' | 'credit' | 'debit';

interface Props {
  transactions: Transaction[];
  sortKey: SortKey;
  sortDir: 'asc' | 'desc';
  onSortChange: (key: SortKey) => void;
  onDelete?: (t: Transaction) => void;
}

const COLUMNS: { key: SortKey; label: string; flex: number }[] = [
  { key: 'date', label: 'Date', flex: 1.1 },
  { key: 'accountName', label: 'Name', flex: 1.3 },
  { key: 'credit', label: 'Credit', flex: 1 },
  { key: 'debit', label: 'Debit', flex: 1 },
];

export default function TransactionTable({ transactions, sortKey, sortDir, onSortChange, onDelete }: Props) {
  const [viewing, setViewing] = useState<Transaction | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {COLUMNS.map((col) => (
          <TouchableOpacity
            key={col.key}
            style={[styles.headerCell, { flex: col.flex }]}
            onPress={() => onSortChange(col.key)}
          >
            <Text style={styles.headerText}>{col.label}</Text>
            <Ionicons
              name={sortKey === col.key ? (sortDir === 'asc' ? 'chevron-up' : 'chevron-down') : 'swap-vertical'}
              size={14}
              color={colors.textMuted}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.row, index % 2 === 1 && styles.rowAlt]}
            onPress={() => setViewing(item)}
          >
            <Text style={[styles.cell, { flex: 1.1 }]}>{formatDisplayDate(item.date)}</Text>
            <Text style={[styles.cell, { flex: 1.3 }]} numberOfLines={1}>{item.accountName}</Text>
            <Text style={[styles.cell, styles.amountCell, styles.credit, { flex: 1 }]}>
              {item.direction === 'credit' ? formatINR(item.amount) : '-'}
            </Text>
            <Text style={[styles.cell, styles.amountCell, styles.debit, { flex: 1 }]}>
              {item.direction === 'debit' ? formatINR(item.amount) : '-'}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No entries in this range yet.</Text>
        }
      />

      <TransactionDetailModal
        transaction={viewing}
        onClose={() => setViewing(null)}
        onEdit={() => {
          setEditing(viewing);
          setViewing(null);
        }}
        onDelete={() => {
          setPendingDelete(viewing);
          setViewing(null);
        }}
      />

      {editing && (
        <AddTransactionModal
          visible={!!editing}
          onClose={() => setEditing(null)}
          direction={editing.direction}
          existingTransaction={editing}
        />
      )}

      <ConfirmDialog
        visible={!!pendingDelete}
        title="Delete entry"
        message={pendingDelete ? `Delete ${pendingDelete.accountName} - ${formatINR(pendingDelete.amount)}?` : undefined}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) onDelete?.(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCell: { flexDirection: 'row', alignItems: 'center' },
  headerText: { fontWeight: '600', color: colors.text },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowAlt: { backgroundColor: colors.surface },
  cell: { color: colors.text, fontSize: 14 },
  amountCell: { textAlign: 'right' },
  credit: { color: colors.credit },
  debit: { color: colors.debit },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 40,
  },
});
