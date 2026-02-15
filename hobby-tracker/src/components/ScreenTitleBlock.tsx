import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, fonts } from '@/src/constants/theme';

interface ScreenTitleBlockProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function ScreenTitleBlock({
  title,
  subtitle,
  centered = false,
}: ScreenTitleBlockProps) {
  return (
    <View style={[styles.container, centered && styles.centered]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  centered: {
    alignItems: 'center',
  },
  title: {
    ...fonts.title,
    color: colors.text,
  },
  subtitle: {
    ...fonts.body,
    color: colors.textSecondary,
    marginTop: 6,
  },
});
