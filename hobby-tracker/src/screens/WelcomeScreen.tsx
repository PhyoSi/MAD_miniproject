import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { router } from 'expo-router';

import { ScreenTitleBlock } from '@/src/components';
import { colors } from '@/src/constants/theme';
import { useHobbyStore } from '@/src/store/hobbyStore';
import { validateHobbyName } from '@/src/utils/validation';

export default function WelcomeScreen() {
  const [name, setName] = useState('');
  const isLoading = useHobbyStore(state => state.isLoading);
  const userId = useHobbyStore(state => state.userId);
  const createUser = useHobbyStore(state => state.createUser);

  useEffect(() => {
    if (userId) {
      router.replace('/(tabs)/home');
    }
  }, [userId]);

  const handleSubmit = async () => {
    if (!validateHobbyName(name)) {
      Alert.alert('Invalid name', 'Please enter at least 2 characters.');
      return;
    }

    try {
      await createUser(name.trim());
      Alert.alert('Welcome!', 'Your profile is ready.');
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create user. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenTitleBlock title="Welcome to HobbyIt" subtitle="Track your practice time and streaks." />

      <TextInput
        mode="outlined"
        label="Name"
        placeholder="Your name"
        nativeID="welcome-name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Button mode="contained" onPress={handleSubmit} loading={isLoading} style={styles.button}>
        Get Started
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
    backgroundColor: colors.primary,
  },
});
