import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { router } from 'expo-router';

import { colors, fonts } from '@/src/constants/theme';
import { useHobbyStore } from '@/src/store/hobbyStore';
import { validateHobbyName } from '@/src/utils/validation';

export default function WelcomeScreen() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
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
      await createUser(name.trim(), location.trim());
      Alert.alert('Welcome!', 'Your profile is ready.');
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Failed to create user. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to HobbyIt</Text>
      <Text style={styles.subtitle}>Track your practice time and streaks.</Text>

      <TextInput
        mode="outlined"
        label="Name"
        placeholder="Your name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Location"
        placeholder="City or campus"
        value={location}
        onChangeText={setLocation}
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
  title: {
    ...fonts.title,
    color: colors.text,
  },
  subtitle: {
    ...fonts.body,
    marginTop: 8,
    marginBottom: 24,
    color: colors.textSecondary,
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
