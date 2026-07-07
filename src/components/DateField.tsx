import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';
import { formatDisplayDate } from '../utils/dateRanges';

interface Props {
  value: string; // 'YYYY-MM-DD'
  onChange: (value: string) => void;
}

export default function DateField({ value, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View>
      <TouchableOpacity style={styles.field} onPress={() => setShowPicker(true)}>
        <Text style={styles.text}>{formatDisplayDate(value)}</Text>
        <Ionicons name="calendar-outline" size={20} color={colors.text} />
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={new Date(value)}
          mode="date"
          display="default"
          onChange={(_: any, selected?: Date) => {
            setShowPicker(false);
            if (selected) {
              const y = selected.getFullYear();
              const m = String(selected.getMonth() + 1).padStart(2, '0');
              const d = String(selected.getDate()).padStart(2, '0');
              onChange(`${y}-${m}-${d}`);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.background,
  },
  text: { fontSize: 15, color: colors.text },
});
