export const colors = {
  primary: '#818CF8',        // indigo-400 – 5.7:1 on background
  secondary: '#34D399',      // emerald-400 – 7.3:1 on background
  accent: '#FBBF24',         // amber-400
  background: '#111827',     // gray-900
  surface: '#1F2937',        // gray-800
  error: '#F87171',          // red-400 – 5.0:1 on background
  text: '#F9FAFB',           // gray-50 – 15.4:1 on background
  textSecondary: '#9CA3AF',  // gray-400 – 5.5:1 on background
  border: '#374151',         // gray-700
  warning: '#FBBF24',        // amber-400
  primaryContainer: '#312E81', // indigo-900 – selected/active tint
};

export const fonts = {
  title: { fontSize: 28, fontWeight: 'bold' as const },
  heading: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: 'normal' as const },
  caption: { fontSize: 14, color: '#9CA3AF' },  // matches textSecondary
  label: { fontSize: 16, fontWeight: '600' as const },
};

export const HOBBY_ICONS = [
  '🎸', '🎨', '💪', '📚', '🏃‍♂️', '🍳',
  '🎮', '📷', '✍️', '🧘', '⚽', '🎹',
];
