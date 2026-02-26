import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, fonts, HOBBY_ICONS } from '@/src/constants/theme';

interface HobbyIconPickerProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
}

export default function HobbyIconPicker({ selectedIcon, onSelectIcon }: HobbyIconPickerProps) {
  return (
    <>
      <Text style={styles.label}>Choose an icon</Text>
      <FlatList
        data={HOBBY_ICONS}
        numColumns={4}
        keyExtractor={item => item}
        contentContainerStyle={styles.iconGrid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.iconButton, item === selectedIcon && styles.iconButtonActive]}
            onPress={() => onSelectIcon(item)}>
            <Text style={styles.icon}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    ...fonts.label,
    color: colors.text,
    marginBottom: 8,
  },
  iconGrid: {
    gap: 12,
    paddingBottom: 24,
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    margin: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  iconButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  icon: {
    fontSize: 28,
  },
});
