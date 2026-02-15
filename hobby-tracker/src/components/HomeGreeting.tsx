import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, fonts } from '@/src/constants/theme';

interface HomeGreetingProps {
  userName?: string;
}

export default function HomeGreeting({ userName }: HomeGreetingProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.greeting}>Hello, {userName ?? 'there'}! 👋</Text>
      <Text style={styles.subtitle}>Keep your streak alive today. 🔥</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  greeting: {
    ...fonts.title,
    color: colors.text,
  },
  subtitle: {
    ...fonts.body,
    color: colors.textSecondary,
    marginTop: 6,
  },
});
