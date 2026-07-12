import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (format: 'pdf' | 'excel') => void;
}

export default function ExportMenu({ visible, onClose, onSelect }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.card}>
          <Text style={styles.title}>Export Transactions</Text>
          <Text style={styles.subtitle}>Choose format to share via WhatsApp, email, etc.</Text>

          <TouchableOpacity style={styles.option} onPress={() => onSelect('pdf')}>
            <View style={[styles.iconCircle, { backgroundColor: '#FDE8E8' }]}>
              <Ionicons name="document-text-outline" size={22} color="#E04848" />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>PDF Report</Text>
              <Text style={styles.optionDesc}>Formatted report with totals</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={() => onSelect('excel')}>
            <View style={[styles.iconCircle, { backgroundColor: '#E6F9EF' }]}>
              <Ionicons name="grid-outline" size={22} color="#1B9E5A" />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Excel Spreadsheet</Text>
              <Text style={styles.optionDesc}>Editable .xlsx with all data</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 16 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  optionTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  optionDesc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
});
