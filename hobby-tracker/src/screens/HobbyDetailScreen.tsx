import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';

import {
  HobbyDetailHeader,
  HobbyStatsGrid,
  LoadingSpinner,
  OfflineBanner,
  SessionListSection,
} from '@/src/components';
import { colors, fonts } from '@/src/constants/theme';
import { useHobbyStore } from '@/src/store/hobbyStore';
import * as HobbyAPI from '@/src/services/hobbyApi';
import type { HobbyStats, SessionWithHobby } from '@/src/types';

export default function HobbyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId, hobbies, deleteSession } = useHobbyStore();
  const [stats, setStats] = useState<HobbyStats | null>(null);
  const [sessions, setSessions] = useState<SessionWithHobby[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  const hobby = useMemo(() => hobbies.find(item => item.id === id), [hobbies, id]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  const hydrate = useCallback(async () => {
    if (!userId || !id) return;
    setIsLoading(true);
    try {
      const [statsResponse, recentSessions] = await Promise.all([
        HobbyAPI.getHobbyStats(id, userId),
        HobbyAPI.getRecentSessions(userId, 3650),
      ]);
      setStats(statsResponse);
      setSessions(recentSessions.filter(session => session.hobbyId === id).slice(0, 10));
    } catch (error) {
      console.error('Error loading hobby detail:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, userId]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleDelete = () => {
    if (!id) return;
    Alert.alert('Delete hobby', 'This will remove the hobby and all its sessions.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (!isOnline) {
              Alert.alert('Offline', 'Connect to the internet to delete hobbies.');
              return;
            }
            await useHobbyStore.getState().deleteHobby(id);
            router.back();
          } catch (error) {
            console.error('Error deleting hobby:', error);
            Alert.alert('Error', 'Failed to delete hobby.');
          }
        },
      },
    ]);
  };

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
            await hydrate();
          } catch (error) {
            console.error('Error deleting session:', error);
            Alert.alert('Error', 'Failed to delete session.');
          }
        },
      },
    ]);
  };

  if (!hobby) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundTitle}>Hobby not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
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
