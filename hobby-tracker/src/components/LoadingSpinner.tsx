import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/src/constants/theme';

export default function LoadingSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator animating color={colors.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
