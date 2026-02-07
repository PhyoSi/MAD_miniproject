import { Platform, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import type { Hobby } from '@/src/types';
import { colors, fonts } from '@/src/constants/theme';

interface HobbyCardProps {
  hobby: Hobby;
  onPress?: () => void;
}

export default function HobbyCard({ hobby, onPress }: HobbyCardProps) {
  return (
    <Card style={styles.card} onPress={onPress} mode="outlined">
      <Card.Content>
        <View style={styles.row}>
          <Text style={styles.icon}>{hobby.icon}</Text>
          <View style={styles.meta}>
            <Text style={styles.name}>{hobby.name}</Text>
            <Text style={styles.caption}>
              {hobby.totalHours?.toFixed(1) ?? '0.0'} hrs • {hobby.currentStreak ?? 0} day streak
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    ...Platform.select({
      web: { boxShadow: 'none' },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 32,
  },
  meta: {
    flex: 1,
  },
  name: {
    ...fonts.heading,
    color: colors.text,
  },
  caption: {
    ...fonts.caption,
    marginTop: 4,
  },
});
