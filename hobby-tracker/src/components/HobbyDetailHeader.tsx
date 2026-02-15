import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, fonts } from '@/src/constants/theme';

interface HobbyDetailHeaderProps {
  icon: string;
  name: string;
}

export default function HobbyDetailHeader({ icon, name }: HobbyDetailHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    ...fonts.title,
    color: colors.text,
    marginTop: 8,
  },
});
