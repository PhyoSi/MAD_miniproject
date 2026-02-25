import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/src/constants/theme';

interface AddHobbyFabProps {
  disabled: boolean;
  onPress: () => void;
}

export default function AddHobbyFab({ disabled, onPress }: AddHobbyFabProps) {
  return (
    <Pressable style={[styles.fab, disabled && styles.fabDisabled]} onPress={onPress} disabled={disabled}>
      {Platform.OS === 'web' ? (
        <Text style={styles.webPlus}>＋</Text>
      ) : (
        <Ionicons name="add" size={28} color="#FFFFFF" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabDisabled: {
    opacity: 0.5,
  },
  webPlus: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 28,
  },
});
