import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  MostLoggedCard,
  OfflineBanner,
  ScreenTitleBlock,
  SessionListSection,
  StatsSummaryRow,
} from '@/src/components';
import { colors } from '@/src/constants/theme';
import { useOnlineStatus } from '@/src/hooks/use-online-status';
import { useHobbyStore } from '@/src/store/hobbyStore';
import { showConfirmation, showMessage } from '@/src/utils/appAlerts';

export default function StatsScreen() {
  const { userId, stats, sessions, loadStats, loadRecentSessions, deleteSession, isLoading } = useHobbyStore();
  const isOnline = useOnlineStatus();

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      loadStats();
      loadRecentSessions(30);
    }, [loadStats, loadRecentSessions, userId])
  );

  const handleDeleteSession = async (sessionId: string) => {
    const confirmed = await showConfirmation(
      'Delete session',
      'Are you sure you want to delete this session?'
    );
    if (!confirmed) return;

    try {
      if (!isOnline) {
        await showMessage('Offline', 'Connect to the internet to delete sessions.');
        return;
      }
      await deleteSession(sessionId);
      await Promise.all([loadStats(), loadRecentSessions(30)]);
    } catch (error) {
      console.error('Error deleting session:', error);
      await showMessage('Error', 'Failed to delete session.');
    }
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
          loadRecentSessions(30);
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
