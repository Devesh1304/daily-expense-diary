import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Palette } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

export interface PillOption<T extends string> {
  key: T;
  label: string;
}

interface Props<T extends string> {
  options: PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function FilterPills<T extends string>({ options, value, onChange }: Props<T>) {
  const { palette: c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[styles.pill, active && styles.pillActive]}
            onPress={() => onChange(opt.key)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    row: {
      flexGrow: 0,
      paddingHorizontal: 12,
      marginBottom: 8,
    },
    pill: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.pillBorder,
      borderRadius: 20,
      paddingHorizontal: 18,
      paddingVertical: 8,
      marginRight: 8,
    },
    pillActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    label: {
      color: c.textSecondary,
      fontWeight: '500',
    },
    labelActive: {
      color: '#fff',
    },
  });
}
