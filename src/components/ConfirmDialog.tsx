import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ visible, title, message, confirmLabel = 'Delete', onConfirm, onCancel }: Props) {
  const { palette: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 20,
      width: '100%',
      maxWidth: 360,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    title: { color: c.text, fontSize: 17, fontWeight: '700', marginBottom: 8 },
    message: { color: c.textSecondary, fontSize: 14, marginBottom: 20, lineHeight: 20 },
    buttonRow: { flexDirection: 'row', gap: 12 },
    button: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    cancelButton: { borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceAlt },
    cancelText: { color: c.textSecondary, fontWeight: '600' },
    confirmButton: { backgroundColor: c.debit },
    confirmText: { color: '#fff', fontWeight: '700' },
  });
}
