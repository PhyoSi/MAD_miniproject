import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, fonts } from '@/src/constants/theme';

interface Hobby {
  id: string;
  name: string;
  icon: string;
}

interface HobbySelectorProps {
  hobbies: Hobby[];
  selectedHobbyId: string | null;
  onSelectHobby: (hobbyId: string) => void;
  label?: string;
}

export default function HobbySelector({
  hobbies,
  selectedHobbyId,
  onSelectHobby,
  label = 'Choose hobby',
}: HobbySelectorProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <FlatList
        data={hobbies}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const selected = selectedHobbyId === item.id;
          return (
            <TouchableOpacity
              style={[styles.item, selected && styles.itemSelected]}
              onPress={() => onSelectHobby(item.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${item.name} ${item.icon}`}>
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={styles.name}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...fonts.label,
    color: colors.text,
    marginTop: 16,
  },
  list: {
    gap: 10,
    paddingVertical: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 10,
  },
  itemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  icon: {
    fontSize: 22,
  },
  name: {
    ...fonts.body,
    color: colors.text,
  },
});