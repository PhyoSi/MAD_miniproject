import { useEffect } from 'react';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { MD3DarkTheme, Provider as PaperProvider } from 'react-native-paper';

import { colors } from '@/src/constants/theme';
import { useHobbyStore } from '@/src/store/hobbyStore';
import AlertProvider from '@/src/components/AlertProvider';
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

  const navigationTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  const paperTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: colors.primary,
      background: colors.background,
      surface: colors.surface,
      surfaceVariant: colors.surface,
      onSurface: colors.text,
      onSurfaceVariant: colors.textSecondary,
      outline: colors.border,
      error: colors.error,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <AlertProvider>
        <ThemeProvider value={navigationTheme}>
          <Stack>
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-hobby"
            options={{
              presentation: 'modal',
              title: 'Add Hobby',
              ...(Platform.OS === 'web' && { headerLeft: () => <WebBackButton /> }),
            }}
          />
          <Stack.Screen
            name="hobby/[id]"
            options={{
              title: 'Hobby Details',
              ...(Platform.OS === 'web' && { headerLeft: () => <WebBackButton /> }),
            }}
          />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </AlertProvider>
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
