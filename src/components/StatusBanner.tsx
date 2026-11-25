import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  kind: 'error' | 'success';
  message: string;
  onDismiss: () => void;
}

// High-contrast banner (white text on solid colour) that stays until dismissed.
export default function StatusBanner({ kind, message, onDismiss }: Props) {
  const isError = kind === 'error';

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[styles.banner, isError ? styles.error : styles.success]}
    >
      <Ionicons name={isError ? 'alert-circle' : 'checkmark-circle'} size={20} color="#FFFFFF" />
      <Text style={styles.text}>{message}</Text>
      <TouchableOpacity
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss message"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  error: { backgroundColor: '#B91C1C' },
  success: { backgroundColor: '#047857' },
  text: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '600', lineHeight: 20 },
});
