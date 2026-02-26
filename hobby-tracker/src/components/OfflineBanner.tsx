import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors } from '@/src/constants/theme';

interface OfflineBannerProps {
  visible: boolean;
}

export default function OfflineBanner({ visible }: OfflineBannerProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>⚠️ You&apos;re offline - showing saved data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.warning,
  },
  text: {
    color: '#111827',
    textAlign: 'center',
  },
});
