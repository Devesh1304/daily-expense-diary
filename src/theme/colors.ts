export const colors = {
  primary: '#2C6B54',
  primaryDark: '#1F4E3D',
  credit: '#8FD9BE',
  debit: '#E8A6A0',
  background: '#12241F',
  surface: '#1B362E',
  surfaceAlt: '#20402F',
  border: '#2A423B',
  text: '#EAF6F0',
  textMuted: '#7FBBA6',
  pillBorder: '#2A423B',
  buttonOutlineText: '#EAF6F0',
};

export const avatarPalette = [
  '#2C6B54', '#4A90D9', '#E85D75', '#7ED321', '#9B59B6',
  '#F39C12', '#16A085', '#D35400', '#8FD9BE', '#C0392B',
];

export function colorForLetter(letter: string): string {
  const code = letter.toUpperCase().charCodeAt(0) || 0;
  return avatarPalette[code % avatarPalette.length];
}
