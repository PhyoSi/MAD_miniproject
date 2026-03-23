import { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  MostLoggedCard,
  OfflineBanner,
  ScreenTitleBlock,
  SessionListSection,
  StatsSummaryRow,
} from '@/src/components';
import { DEFAULT_RECENT_DAYS } from '@/src/constants/app';
import { colors } from '@/src/constants/theme';
import { useOnlineStatus } from '@/src/hooks/use-online-status';
import { useHobbyStore } from '@/src/store/hobbyStore';
import { confirmAndDeleteSession } from '@/src/utils/sessionActions';

export default function StatsScreen() {
  const { userId, stats, sessions, loadStats, loadRecentSessions, deleteSession, isLoading } = useHobbyStore();
  const isOnline = useOnlineStatus();

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      loadStats();
      loadRecentSessions(DEFAULT_RECENT_DAYS);
    }, [loadStats, loadRecentSessions, userId])
  );

  const handleDeleteSession = async (sessionId: string) => {
    await confirmAndDeleteSession({
      isOnline,
      deleteSession,
      sessionId,
      onSuccess: async () => {
        await Promise.all([loadStats(), loadRecentSessions(DEFAULT_RECENT_DAYS)]);
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <OfflineBanner visible={!isOnline} />
      <ScreenTitleBlock title="Your stats" />

      <StatsSummaryRow stats={stats} />

      <MostLoggedCard mostPracticedHobby={stats?.mostPracticedHobby ?? null} />

      <SessionListSection
        title="Recent sessions"
        sessions={sessions}
        emptyTitle="No sessions"
        emptyDescription="Log a session to see stats here."
        isOnline={isOnline}
        onDeleteSession={handleDeleteSession}
        refreshing={isLoading}
        onRefresh={() => {
          loadStats();
          loadRecentSessions(DEFAULT_RECENT_DAYS);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
});
