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
import { createTransaction } from '../firebase/firestore';
import { Direction } from '../types';
import { colors } from '../theme/colors';
import { todayString } from '../utils/dateRanges';
import DateField from './DateField';

interface Props {
  visible: boolean;
  onClose: () => void;
  direction: Direction;
}

export default function AddTransactionModal({ visible, onClose, direction }: Props) {
  const { user } = useAuth();
  const { ledgerAccounts } = useTransactions();

  const [date, setDate] = useState(todayString());
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  const suggestions =
    name.trim().length > 0
      ? ledgerAccounts.filter((a) => a.name.toLowerCase().includes(name.trim().toLowerCase())).slice(0, 5)
      : [];

  function reset() {
    setDate(todayString());
    setAmount('');
    setName('');
    setRemarks('');
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
          <View style={styles.headerRow}>
            <Text style={styles.title}>Add Transaction</Text>
            <TouchableOpacity onPress={() => { reset(); onClose(); }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.directionLabel, direction === 'credit' ? styles.credit : styles.debit]}>
            {direction === 'credit' ? 'Credit' : 'Debit'}
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Date</Text>
            <DateField value={date} onChange={setDate} />

            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
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
              placeholder="Remarks (Optional)"
              placeholderTextColor={colors.textMuted}
              value={remarks}
              onChangeText={setRemarks}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => handleSave(true)}
                disabled={saving}
              >
                <Text style={styles.secondaryButtonText}>Save & Add New</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={() => handleSave(false)}
                disabled={saving}
              >
                <Text style={styles.primaryButtonText}>Save</Text>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  directionLabel: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    marginVertical: 8,
  },
  credit: { color: colors.credit },
  debit: { color: colors.debit },
  label: { marginTop: 14, marginBottom: 6, color: colors.text, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    backgroundColor: colors.background,
    color: colors.text,
  },
  suggestions: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
    backgroundColor: colors.background,
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
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButton: { backgroundColor: colors.primary },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  secondaryButtonText: { color: colors.text, fontWeight: '700' },
});
