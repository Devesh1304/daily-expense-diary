import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { colors } from '../theme/colors';
import { formatINR } from '../utils/currency';
import { formatDisplayDate } from '../utils/dateRanges';

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowColon}>:</Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

export default function TransactionDetailModal({ transaction, onClose, onEdit, onDelete }: Props) {
  if (!transaction) return null;

  return (
    <Modal visible={!!transaction} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Transaction Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.detailBox}>
            <DetailRow
              label="Type"
              value={transaction.direction === 'credit' ? 'Credit' : 'Debit'}
              valueColor={transaction.direction === 'credit' ? colors.credit : colors.debit}
            />
            <DetailRow label="Date" value={formatDisplayDate(transaction.date)} />
            <DetailRow label="Amount" value={formatINR(transaction.amount, 2)} />
            <DetailRow label="Name" value={transaction.accountName} />
            <DetailRow label="Remarks" value={transaction.remarks || '-'} />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.editButton]} onPress={onEdit}>
              <Ionicons name="create-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={onDelete}>
              <Ionicons name="trash-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  detailBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { width: 90, color: colors.textMuted, fontSize: 14 },
  rowColon: { width: 14, color: colors.textMuted, fontSize: 14 },
  rowValue: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '500' },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: { backgroundColor: colors.primary },
  deleteButton: { backgroundColor: colors.debit },
  buttonText: { color: '#fff', fontWeight: '700' },
});
