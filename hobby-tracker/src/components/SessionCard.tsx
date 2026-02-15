import { Platform, StyleSheet, View } from 'react-native';
import { Card, IconButton, Text } from 'react-native-paper';

import type { SessionWithHobby } from '@/src/types';
import { colors, fonts } from '@/src/constants/theme';
import { formatDateLabel } from '@/src/utils/dateUtils';

interface SessionCardProps {
  session: SessionWithHobby;
  onDelete?: () => void;
  disabled?: boolean;
}

export default function SessionCard({ session, onDelete, disabled }: SessionCardProps) {
  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content style={styles.row}>
        <Text style={styles.icon}>{session.hobbyIcon}</Text>
        <View style={styles.meta}>
          <Text style={styles.title}>{session.hobbyName}</Text>
          <Text style={styles.caption}>{formatDateLabel(session.date)}</Text>
        </View>
        <Text style={styles.duration}>{session.durationMinutes} min</Text>
        {onDelete ? (
          <Card.Actions>
            <IconButton
              icon="delete-outline"
              size={18}
              iconColor={colors.error}
              disabled={disabled}
              onPress={onDelete}
              style={styles.deleteButton}
            />
          </Card.Actions>
        ) : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: colors.surface,
    ...Platform.select({
      web: { boxShadow: 'none' },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 26,
  },
  meta: {
    flex: 1,
  },
  title: {
    ...fonts.label,
    color: colors.text,
  },
  caption: {
    ...fonts.caption,
  },
  duration: {
    ...fonts.label,
    color: colors.secondary,
  },
  deleteButton: {
    margin: 0,
    marginLeft: 6,
  },
  disabled: {
    opacity: 0.4,
  },
});
