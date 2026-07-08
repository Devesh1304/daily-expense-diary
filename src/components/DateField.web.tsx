import React from 'react';
import { View, StyleSheet } from 'react-native';
// @ts-ignore -- unstable_createElement is a react-native-web escape hatch for raw DOM elements
import { unstable_createElement } from 'react-native-web';
import { colors } from '../theme/colors';

interface Props {
  value: string; // 'YYYY-MM-DD'
  onChange: (value: string) => void;
}

// Real browser <input type="date"> gives a native calendar picker with no
// focus-trap/scroll quirks — far more reliable inside a Modal than a plain
// text field paired with react-native-web's Modal focus trap.
export default function DateField({ value, onChange }: Props) {
  return (
    <View style={styles.field}>
      {unstable_createElement('input', {
        type: 'date',
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
        style: styles.nativeInput,
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  nativeInput: {
    borderWidth: 0,
    outlineStyle: 'none',
    backgroundColor: 'transparent',
    color: colors.text,
    fontSize: 15,
    width: '100%',
    fontFamily: 'inherit',
    colorScheme: 'light',
  } as any,
});
