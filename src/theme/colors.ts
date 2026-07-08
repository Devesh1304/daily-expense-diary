export const colors = {
  primary: '#2E7D5B',
  primaryLight: '#E8F5EE',
  primaryGradientStart: '#2E7D5B',
  primaryGradientEnd: '#1B5E3F',
  credit: '#1B9E5A',
  creditBg: '#E6F9EF',
  debit: '#E04848',
  debitBg: '#FDE8E8',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F2F5',
  border: '#E5E9EF',
  text: '#1A1D21',
  textSecondary: '#4A5568',
  textMuted: '#8896A6',
  pillBorder: '#D1D9E6',
  shadow: '#000',
};

export const avatarPalette = [
  '#2E7D5B', '#4A90D9', '#E85D75', '#7ED321', '#9B59B6',
  '#F39C12', '#16A085', '#D35400', '#3498DB', '#C0392B',
];

export function colorForLetter(letter: string): string {
  const code = letter.toUpperCase().charCodeAt(0) || 0;
  return avatarPalette[code % avatarPalette.length];
}
