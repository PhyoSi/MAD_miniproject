import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

import {
  MostLoggedCard,
  OfflineBanner,
  ScreenTitleBlock,
  SessionListSection,
  StatsSummaryRow,
} from '@/src/components';
import { colors } from '@/src/constants/theme';
import { useHobbyStore } from '@/src/store/hobbyStore';

export default function StatsScreen() {
  const { stats, sessions, loadStats, loadRecentSessions, deleteSession, isLoading } = useHobbyStore();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
      loadRecentSessions(30);
    }, [loadStats, loadRecentSessions])
  );

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert('Delete session', 'Are you sure you want to delete this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (!isOnline) {
              Alert.alert('Offline', 'Connect to the internet to delete sessions.');
              return;
            }
            await deleteSession(sessionId);
            await Promise.all([loadStats(), loadRecentSessions(30)]);
          } catch (error) {
            console.error('Error deleting session:', error);
            Alert.alert('Error', 'Failed to delete session.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
});
