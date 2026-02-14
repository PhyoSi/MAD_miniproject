import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';

import { colors } from '@/src/constants/theme';
import '@/src/utils/suppressWebWarnings';

export default function RootLayout() {
  const paperTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: colors.primary,
      background: colors.background,
      surface: colors.surface,
      error: colors.error,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-hobby"
            options={{ presentation: 'modal', title: 'Add Hobby' }}
          />
          <Stack.Screen name="hobby/[id]" options={{ title: 'Hobby Details' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}
