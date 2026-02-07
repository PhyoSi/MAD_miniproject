import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import NetInfo from '@react-native-community/netinfo';

import OfflineBanner from '@/src/components/OfflineBanner';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import SessionCard from '@/src/components/SessionCard';
import StatCard from '@/src/components/StatCard';
import EmptyState from '@/src/components/EmptyState';
import { colors, fonts } from '@/src/constants/theme';
import { useHobbyStore } from '@/src/store/hobbyStore';
import * as HobbyAPI from '@/src/services/hobbyApi';
import type { HobbyStats, SessionWithHobby } from '@/src/types';

export default function HobbyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId, hobbies } = useHobbyStore();
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

  if (!hobby) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Hobby not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OfflineBanner visible={!isOnline} />
      <View style={styles.header}>
        <Text style={styles.icon}>{hobby.icon}</Text>
        <Text style={styles.title}>{hobby.name}</Text>
      </View>

      {isLoading ? <LoadingSpinner /> : null}

      <View style={styles.statsRow}>
        <StatCard label="Total Hours" value={stats?.totalHours ?? 0} />
        <StatCard label="Sessions" value={stats?.totalSessions ?? 0} />
      </View>
      <View style={styles.statsRow}>
        <StatCard label="Current Streak" value={stats?.currentStreak ?? 0} />
        <StatCard label="Longest Streak" value={stats?.longestStreak ?? 0} />
      </View>

      <Button
        mode="contained"
        style={styles.logButton}
        onPress={() => router.push({ pathname: '/(tabs)/add-session', params: { hobbyId: id } })}
        disabled={!isOnline}>
        Log Session
      </Button>

      <Text style={styles.sectionTitle}>Recent Sessions</Text>
      <FlatList
        contentContainerStyle={styles.list}
        data={sessions}
        keyExtractor={item => item.id}
        ListEmptyComponent={<EmptyState title="No sessions yet" description="Log your first session." />}
        renderItem={({ item }) => <SessionCard session={item} />}
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  logButton: {
    marginVertical: 12,
    backgroundColor: colors.primary,
  },
  sectionTitle: {
    ...fonts.heading,
    color: colors.text,
    marginTop: 8,
  },
  list: {
    paddingVertical: 12,
  },
});
