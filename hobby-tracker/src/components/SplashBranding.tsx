import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, fonts } from '@/src/constants/theme';

export default function SplashBranding() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🎯</Text>
      <Text style={styles.title}>HobbyIt</Text>
      <ActivityIndicator animating size="large" color={colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  logo: {
    fontSize: 64,
  },
  title: {
    ...fonts.title,
    marginTop: 12,
    color: colors.text,
  },
  spinner: {
    marginTop: 24,
  },
});
