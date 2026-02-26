import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import EmptyState from '@/src/components/EmptyState';
import SessionCard from '@/src/components/SessionCard';
import { colors, fonts } from '@/src/constants/theme';
import type { SessionWithHobby } from '@/src/types';

interface SessionListSectionProps {
  title: string;
  sessions: SessionWithHobby[];
  emptyTitle: string;
  emptyDescription: string;
  isOnline: boolean;
  onDeleteSession?: (sessionId: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function SessionListSection({
  title,
  sessions,
  emptyTitle,
  emptyDescription,
  isOnline,
  onDeleteSession,
}: SessionListSectionProps) {
  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.list}>
        {sessions.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          sessions.map(item => (
            <SessionCard
              key={item.id}
              session={item}
              onDelete={onDeleteSession ? () => onDeleteSession(item.id) : undefined}
              disabled={!isOnline}
            />
          ))
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...fonts.heading,
    color: colors.text,
    marginTop: 8,
  },
  list: {
    paddingVertical: 12,
  },
});
