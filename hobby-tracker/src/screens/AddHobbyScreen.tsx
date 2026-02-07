import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';

import { colors, fonts, HOBBY_ICONS } from '@/src/constants/theme';
import { useHobbyStore } from '@/src/store/hobbyStore';
import { validateHobbyName } from '@/src/utils/validation';
import OfflineBanner from '@/src/components/OfflineBanner';

export default function AddHobbyScreen() {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(HOBBY_ICONS[0]);
  const [isOnline, setIsOnline] = useState(true);
  const { addHobby, isLoading } = useHobbyStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!validateHobbyName(name)) {
      Alert.alert('Invalid name', 'Hobby name must be 2-50 characters.');
      return;
    }
    if (!isOnline) {
      Alert.alert('Offline', 'Connect to the internet to add hobbies.');
      return;
    }

    try {
      await addHobby(name.trim(), selectedIcon);
      Alert.alert('Success', 'Hobby created!');
      router.back();
    } catch (error) {
      console.error('Error creating hobby:', error);
      Alert.alert('Error', 'Failed to create hobby. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <OfflineBanner visible={!isOnline} />
      <Text style={styles.title}>Add a new hobby</Text>

      <TextInput
        mode="outlined"
        label="Hobby name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Text style={styles.label}>Choose an icon</Text>
      <FlatList
        data={HOBBY_ICONS}
        numColumns={4}
        keyExtractor={item => item}
        contentContainerStyle={styles.iconGrid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.iconButton, item === selectedIcon && styles.iconButtonActive]}
            onPress={() => setSelectedIcon(item)}>
            <Text style={styles.icon}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <Button mode="contained" onPress={handleSave} loading={isLoading} style={styles.button}>
        Save Hobby
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    ...fonts.title,
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    ...fonts.label,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.surface,
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
    backgroundColor: '#EEF2FF',
  },
  icon: {
    fontSize: 28,
  },
  button: {
    backgroundColor: colors.primary,
  },
});
