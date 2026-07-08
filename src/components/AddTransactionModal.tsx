import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionsContext';
import { createTransaction, updateTransactionWithAccount } from '../firebase/firestore';
import { Direction, Transaction } from '../types';
import { colors } from '../theme/colors';
import { todayString } from '../utils/dateRanges';
import DateField from './DateField';

interface Props {
  visible: boolean;
  onClose: () => void;
  direction: Direction;
  existingTransaction?: Transaction;
}

export default function AddTransactionModal({ visible, onClose, direction, existingTransaction }: Props) {
  const { user } = useAuth();
  const { ledgerAccounts } = useTransactions();
  const isEditing = !!existingTransaction;

  const [date, setDate] = useState(existingTransaction?.date ?? todayString());
  const [amount, setAmount] = useState(existingTransaction ? String(existingTransaction.amount) : '');
  const [name, setName] = useState(existingTransaction?.accountName ?? '');
  const [remarks, setRemarks] = useState(existingTransaction?.remarks ?? '');
  const [saving, setSaving] = useState(false);

  const suggestions =
    name.trim().length > 0
      ? ledgerAccounts.filter((a) => a.name.toLowerCase().includes(name.trim().toLowerCase())).slice(0, 5)
      : [];

  function reset() {
    setDate(existingTransaction?.date ?? todayString());
    setAmount(existingTransaction ? String(existingTransaction.amount) : '');
    setName(existingTransaction?.accountName ?? '');
    setRemarks(existingTransaction?.remarks ?? '');
  }

  async function handleSave(addAnother: boolean) {
    const numericAmount = parseFloat(amount);
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter a name for this entry.');
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert('Invalid amount', 'Please enter an amount greater than 0.');
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      if (existingTransaction) {
        await updateTransactionWithAccount(existingTransaction.id, user.uid, {
          date,
          amount: numericAmount,
          accountName: name,
          remarks,
        });
        onClose();
      } else {
        await createTransaction({
          userId: user.uid,
          direction,
          date,
          amount: numericAmount,
          accountName: name,
          remarks,
        });
        if (addAnother) {
          setAmount('');
          setName('');
          setRemarks('');
        } else {
          reset();
          onClose();
        }
      }
    } catch (e: any) {
      Alert.alert('Save failed', e.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          style={styles.sheet}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</Text>
            <TouchableOpacity onPress={() => { reset(); onClose(); }} style={styles.closeButton}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={[styles.directionBadge, direction === 'credit' ? styles.creditBadge : styles.debitBadge]}>
            <Ionicons
              name={direction === 'credit' ? 'arrow-down' : 'arrow-up'}
              size={14}
              color={direction === 'credit' ? colors.credit : colors.debit}
            />
            <Text style={[styles.directionText, { color: direction === 'credit' ? colors.credit : colors.debit }]}>
              {direction === 'credit' ? 'Credit' : 'Debit'}
            </Text>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Date</Text>
            <DateField value={date} onChange={setDate} />

            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
            {suggestions.length > 0 && (
              <View style={styles.suggestions}>
                {suggestions.map((s) => (
                  <TouchableOpacity key={s.id} style={styles.suggestionRow} onPress={() => setName(s.name)}>
                    <Text style={styles.suggestionText}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Remarks (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Add remarks"
              placeholderTextColor={colors.textMuted}
              value={remarks}
              onChangeText={setRemarks}
            />

            <View style={styles.buttonRow}>
              {!isEditing && (
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => handleSave(true)}
                  disabled={saving}
                >
                  <Text style={styles.secondaryButtonText}>Save & Add New</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => handleSave(false)}
                disabled={saving}
              >
                <Text style={styles.primaryButtonText}>{isEditing ? 'Save Changes' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginVertical: 10,
    gap: 4,
  },
  creditBadge: { backgroundColor: colors.creditBg },
  debitBadge: { backgroundColor: colors.debitBg },
  directionText: { fontWeight: '700', fontSize: 14 },
  label: { marginTop: 14, marginBottom: 6, color: colors.textSecondary, fontWeight: '500', fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
  },
  suggestions: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  suggestionRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    color: colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButton: { backgroundColor: colors.primary },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.surface },
  secondaryButtonText: { color: colors.primary, fontWeight: '700' },
});
