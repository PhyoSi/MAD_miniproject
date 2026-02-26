import { Platform, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { colors, fonts } from '@/src/constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.surface,
    ...Platform.select({
      web: { boxShadow: 'none' },
    }),
  },
  content: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  value: {
    ...fonts.heading,
    color: colors.primary,
  },
  label: {
    ...fonts.caption,
    marginTop: 6,
  },
});
