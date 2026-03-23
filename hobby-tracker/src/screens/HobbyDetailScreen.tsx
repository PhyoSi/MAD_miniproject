import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';

import {
  HobbyDetailHeader,
  HobbyStatsGrid,
  LoadingSpinner,
  OfflineBanner,
  SessionListSection,
} from '@/src/components';
import { ALL_TIME_LOOKBACK_DAYS, MAX_HOBBY_RECENT_SESSIONS } from '@/src/constants/app';
import { colors, fonts } from '@/src/constants/theme';
import { useOnlineStatus } from '@/src/hooks/use-online-status';
import { useHobbyStore } from '@/src/store/hobbyStore';
import * as HobbyAPI from '@/src/services/hobbyApi';
import type { HobbyStats, SessionWithHobby } from '@/src/types';
import { showConfirmation, showMessage } from '@/src/utils/appAlerts';
import { confirmAndDeleteSession } from '@/src/utils/sessionActions';

export default function HobbyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId, hobbies, deleteSession } = useHobbyStore();
  const [stats, setStats] = useState<HobbyStats | null>(null);
  const [sessions, setSessions] = useState<SessionWithHobby[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isOnline = useOnlineStatus();

  const hobby = useMemo(() => hobbies.find(item => item.id === id), [hobbies, id]);

  const hydrate = useCallback(async () => {
    if (!userId || !id) return;
    setIsLoading(true);
    try {
      const [statsResponse, recentSessions] = await Promise.all([
        HobbyAPI.getHobbyStats(id, userId),
        HobbyAPI.getRecentSessions(userId, ALL_TIME_LOOKBACK_DAYS),
      ]);
      setStats(statsResponse);
      setSessions(
        recentSessions
          .filter(session => session.hobbyId === id)
          .slice(0, MAX_HOBBY_RECENT_SESSIONS)
      );
    } catch (error) {
      console.error('Error loading hobby detail:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, userId]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = await showConfirmation(
      'Delete hobby',
      'This will remove the hobby and all its sessions.'
    );
    if (!confirmed) return;

    try {
      if (!isOnline) {
        await showMessage('Offline', 'Connect to the internet to delete hobbies.');
        return;
      }
      await useHobbyStore.getState().deleteHobby(id);
      router.back();
    } catch (error) {
      console.error('Error deleting hobby:', error);
      await showMessage('Error', 'Failed to delete hobby.');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    await confirmAndDeleteSession({
      isOnline,
      deleteSession,
      sessionId,
      onSuccess: hydrate,
    });
  };

  if (!hobby) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundTitle}>Hobby not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <OfflineBanner visible={!isOnline} />
      <HobbyDetailHeader icon={hobby.icon} name={hobby.name} />

      {isLoading ? <LoadingSpinner /> : null}

      <HobbyStatsGrid stats={stats} />

      <Button
        mode="contained"
        style={styles.logButton}
        onPress={() => router.push({ pathname: '/(tabs)/add-session', params: { hobbyId: id } })}
        disabled={!isOnline}>
        Log Session
      </Button>

      <SessionListSection
        title="Recent Sessions"
        sessions={sessions}
        emptyTitle="No sessions yet"
        emptyDescription="Log your first session."
        isOnline={isOnline}
        onDeleteSession={handleDeleteSession}
      />

      <Button mode="outlined" textColor={colors.error} onPress={handleDelete} disabled={!isOnline}>
        Delete Hobby
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  notFoundTitle: {
    ...fonts.title,
    color: colors.text,
  },
  logButton: {
    marginVertical: 12,
    backgroundColor: colors.primary,
  },
});
