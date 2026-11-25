import React, { useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTransactions } from '../context/TransactionsContext';
import { createTransaction, updateTransactionWithAccount } from '../firebase/firestore';
import { Direction, Transaction } from '../types';
import { Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { todayString } from '../utils/dateRanges';
import { withTimeout } from '../utils/authErrors';
import DateField from './DateField';
import StatusBanner from './StatusBanner';

interface Props {
  visible: boolean;
  onClose: () => void;
  direction: Direction;
  existingTransaction?: Transaction;
}

type EntryField = 'name' | 'amount';

const SAVE_FAILED_MESSAGE = 'Could not save this entry. Please try again.';

// Firestore error codes -> readable message. Anything else uses the fallback.
function saveErrorMessage(err: unknown): string {
  const code = err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : '';
  if (code === 'unavailable' || code === 'auth/network-request-failed') {
    return 'No connection. Check your network and try again.';
  }
  if (code === 'permission-denied') {
    return 'You do not have permission to save this entry. Try logging in again.';
  }
  if (code === 'auth/timeout') {
    return 'Saving took too long. Check your connection and try again.';
  }
  return SAVE_FAILED_MESSAGE;
}

export default function AddTransactionModal({ visible, onClose, direction, existingTransaction }: Props) {
  const { palette: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { user } = useAuth();
  const { ledgerAccounts } = useTransactions();
  const { showToast } = useToast();
  const isEditing = !!existingTransaction;

  const [date, setDate] = useState(existingTransaction?.date ?? todayString());
  const [amount, setAmount] = useState(existingTransaction ? String(existingTransaction.amount) : '');
  const [name, setName] = useState(existingTransaction?.accountName ?? '');
  const [remarks, setRemarks] = useState(existingTransaction?.remarks ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorFields, setErrorFields] = useState<EntryField[]>([]);
  const [successNote, setSuccessNote] = useState<string | null>(null);
  const inFlight = useRef(false); // blocks a second save before React re-renders

  const suggestions =
    name.trim().length > 0
      ? ledgerAccounts.filter((a) => a.name.toLowerCase().includes(name.trim().toLowerCase())).slice(0, 5)
      : [];

  function clearMessages() {
    setError(null);
    setErrorFields([]);
    setSuccessNote(null);
  }

  function fail(message: string, fields: EntryField[] = []) {
    setSuccessNote(null);
    setError(message);
    setErrorFields(fields);
  }

  function reset() {
    setDate(existingTransaction?.date ?? todayString());
    setAmount(existingTransaction ? String(existingTransaction.amount) : '');
    setName(existingTransaction?.accountName ?? '');
    setRemarks(existingTransaction?.remarks ?? '');
  }

  async function handleSave(addAnother: boolean) {
    if (inFlight.current) return;
    clearMessages();

    const numericAmount = parseFloat(amount);
    if (!name.trim()) return fail('Please enter a name for this entry.', ['name']);
    if (!numericAmount || numericAmount <= 0) return fail('Please enter an amount greater than 0.', ['amount']);
    if (!user) return fail('You are signed out. Please log in again.');

    inFlight.current = true;
    setSaving(true);
    try {
      if (existingTransaction) {
        await withTimeout(
          updateTransactionWithAccount(existingTransaction.id, user.uid, {
            date,
            amount: numericAmount,
            accountName: name,
            remarks,
          })
        );
        showToast('Entry updated');
        onClose();
      } else {
        await withTimeout(
          createTransaction({
            userId: user.uid,
            direction,
            date,
            amount: numericAmount,
            accountName: name,
            remarks,
          })
        );
        if (addAnother) {
          // The form stays open, so the confirmation has to appear inside it.
          setAmount('');
          setName('');
          setRemarks('');
          setSuccessNote('Entry saved. Add the next one.');
        } else {
          // The form closes, so the confirmation appears on the screen behind it.
          reset();
          showToast('Entry saved');
          onClose();
        }
      }
    } catch (e) {
      if (__DEV__) {
        console.warn('[transaction]', {
          context: existingTransaction ? 'update' : 'create',
          code: e && typeof e === 'object' && 'code' in e ? (e as { code: unknown }).code : 'unknown',
          message: e instanceof Error ? e.message : String(e),
        });
      }
      fail(saveErrorMessage(e));
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

  const amountStyle = errorFields.includes('amount') ? [styles.input, styles.inputError] : styles.input;
  const nameStyle = errorFields.includes('name') ? [styles.input, styles.inputError] : styles.input;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</Text>
            <TouchableOpacity
              onPress={() => { reset(); onClose(); }}
              style={styles.closeButton}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={20} color={c.textSecondary} />
            </TouchableOpacity>
          </View>

          {error !== null && (
            <View style={styles.banner}>
              <StatusBanner kind="error" message={error} onDismiss={clearMessages} />
            </View>
          )}
          {successNote !== null && (
            <View style={styles.banner}>
              <StatusBanner kind="success" message={successNote} onDismiss={clearMessages} />
            </View>
          )}

          <View style={[styles.directionBadge, direction === 'credit' ? styles.creditBadge : styles.debitBadge]}>
            <Ionicons
              name={direction === 'credit' ? 'arrow-down' : 'arrow-up'}
              size={14}
              color={direction === 'credit' ? c.credit : c.debit}
            />
            <Text style={[styles.directionText, { color: direction === 'credit' ? c.credit : c.debit }]}>
              {direction === 'credit' ? 'Credit' : 'Debit'}
            </Text>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
          >
            <Text style={styles.label}>Date</Text>
            <DateField value={date} onChange={setDate} />

            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={amountStyle}
              placeholder="Enter amount"
              placeholderTextColor={c.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={(v) => {
                setAmount(v);
                if (error) clearMessages();
              }}
              editable={!saving}
            />

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={nameStyle}
              placeholder="Enter name"
              placeholderTextColor={c.textMuted}
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (error) clearMessages();
              }}
              editable={!saving}
            />
            {suggestions.length > 0 && (
              <View style={styles.suggestions}>
                {suggestions.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.suggestionRow}
                    onPress={() => setName(s.name)}
                    disabled={saving}
                  >
                    <Text style={styles.suggestionText}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Remarks (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Add remarks"
              placeholderTextColor={c.textMuted}
              value={remarks}
              onChangeText={setRemarks}
              editable={!saving}
            />

            <View style={styles.buttonRow}>
              {!isEditing && (
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton, saving && styles.buttonBusy]}
                  onPress={() => handleSave(true)}
                  disabled={saving}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: saving, busy: saving }}
                >
                  <Text style={styles.secondaryButtonText}>Save & Add New</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, saving && styles.buttonBusy]}
                onPress={() => handleSave(false)}
                disabled={saving}
                accessibilityRole="button"
                accessibilityState={{ disabled: saving, busy: saving }}
              >
                {saving ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.primaryButtonText}>Saving...</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryButtonText}>{isEditing ? 'Save Changes' : 'Save'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      maxHeight: '90%',
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      alignSelf: 'center',
      marginBottom: 12,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: { fontSize: 20, fontWeight: '700', color: c.text },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    banner: { marginTop: 12 },
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
    creditBadge: { backgroundColor: c.creditBg },
    debitBadge: { backgroundColor: c.debitBg },
    directionText: { fontWeight: '700', fontSize: 14 },
    label: { marginTop: 14, marginBottom: 6, color: c.textSecondary, fontWeight: '500', fontSize: 13 },
    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      backgroundColor: c.surfaceAlt,
      color: c.text,
    },
    inputError: {
      borderColor: '#DC2626',
      borderWidth: 2,
    },
    suggestions: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      marginTop: 4,
      overflow: 'hidden',
      backgroundColor: c.surface,
    },
    suggestionRow: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    suggestionText: {
      color: c.text,
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
    buttonBusy: { opacity: 0.7 },
    buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    primaryButton: { backgroundColor: c.primary },
    primaryButtonText: { color: '#fff', fontWeight: '700' },
    secondaryButton: { borderWidth: 1.5, borderColor: c.primary, backgroundColor: c.surface },
    secondaryButtonText: { color: c.primary, fontWeight: '700' },
  });
}
