import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';

import { HobbyIconPicker, OfflineBanner, ScreenTitleBlock } from '@/src/components';
import { useHobbyStore } from '@/src/store/hobbyStore';
import { validateHobbyName } from '@/src/utils/validation';
import { colors, HOBBY_ICONS } from '@/src/constants/theme';

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
      <ScreenTitleBlock title="Add a new hobby" />

      <TextInput
        mode="outlined"
        label="Hobby name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <HobbyIconPicker selectedIcon={selectedIcon} onSelectIcon={setSelectedIcon} />

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
  input: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.primary,
  },
});
