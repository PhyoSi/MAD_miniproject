import { useEffect } from 'react';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';

import { colors } from '@/src/constants/theme';
import { useHobbyStore } from '@/src/store/hobbyStore';
import '@/src/utils/suppressWebWarnings';

function WebBackButton() {
  if (Platform.OS !== 'web') return null;

  return (
    <Pressable onPress={() => router.back()} style={styles.webBackButton}>
      <Text style={styles.webBackText}>← Back</Text>
    </Pressable>
  );
}

export default function RootLayout() {
  const loadUserId = useHobbyStore(state => state.loadUserId);
  const pathname = usePathname();

  useEffect(() => {
    loadUserId();
  }, [loadUserId]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const activeElement = document.activeElement;
    if (activeElement && activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  }, [pathname]);

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
            options={{
              presentation: 'modal',
              title: 'Add Hobby',
              headerLeft: () => <WebBackButton />,
            }}
          />
          <Stack.Screen
            name="hobby/[id]"
            options={{
              title: 'Hobby Details',
              headerLeft: () => <WebBackButton />,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  webBackButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  webBackText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
