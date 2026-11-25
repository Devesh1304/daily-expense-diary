import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (format: 'pdf' | 'excel') => void;
}

export default function ExportMenu({ visible, onClose, onSelect }: Props) {
  const { palette: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.card}>
          <Text style={styles.title}>Export Transactions</Text>
          <Text style={styles.subtitle}>Choose format to share via WhatsApp, email, etc.</Text>

          <TouchableOpacity style={styles.option} onPress={() => onSelect('pdf')}>
            <View style={[styles.iconCircle, { backgroundColor: c.debitBg }]}>
              <Ionicons name="document-text-outline" size={22} color={c.debit} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>PDF Report</Text>
              <Text style={styles.optionDesc}>Formatted report with totals</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => onSelect('excel')}>
            <View style={[styles.iconCircle, { backgroundColor: c.creditBg }]}>
              <Ionicons name="grid-outline" size={22} color={c.credit} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Excel Spreadsheet</Text>
              <Text style={styles.optionDesc}>Editable .xlsx with all data</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
      borderRadius: 20,
      padding: 20,
      width: '100%',
      maxWidth: 360,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    title: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 4 },
    subtitle: { fontSize: 13, color: c.textMuted, marginBottom: 16 },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    iconCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    optionInfo: { flex: 1 },
    optionTitle: { fontSize: 15, fontWeight: '600', color: c.text },
    optionDesc: { fontSize: 12, color: c.textMuted, marginTop: 2 },
    cancelBtn: {
      marginTop: 12,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 12,
      backgroundColor: c.surfaceAlt,
    },
    cancelText: { fontSize: 15, fontWeight: '600', color: c.textSecondary },
  });
}
