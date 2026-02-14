import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { router } from 'expo-router';

import HobbyCard from '@/src/components/HobbyCard';
import LoadingSpinner from '@/src/components/LoadingSpinner';
import EmptyState from '@/src/components/EmptyState';
import OfflineBanner from '@/src/components/OfflineBanner';
import { colors, fonts } from '@/src/constants/theme';
import { useHobbyStore } from '@/src/store/hobbyStore';
import * as HobbyAPI from '@/src/services/hobbyApi';
import type { Hobby } from '@/src/types';

export default function HomeScreen() {
  const { user, userId, hobbies, isLoading, loadHobbies, setUser } = useHobbyStore();
  const [isOnline, setIsOnline] = useState(true);
  const [statsMap, setStatsMap] = useState<Record<string, Hobby>>({});

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  const hydrateUser = useCallback(async () => {
    if (!userId) return;
    try {
      const profile = await HobbyAPI.getUserProfile(userId);
      setUser(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [setUser, userId]);

  const hydrateHobbies = useCallback(async () => {
    await loadHobbies();
  }, [loadHobbies]);

  const hydrateStats = useCallback(async () => {
    if (!userId) return;
    try {
      const statsEntries = await Promise.all(
        hobbies.map(async hobby => {
          const stats = await HobbyAPI.getHobbyStats(hobby.id, userId);
          return {
            ...hobby,
            totalHours: stats.totalHours,
            totalSessions: stats.totalSessions,
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak,
          };
        })
      );
      const map: Record<string, Hobby> = {};
      statsEntries.forEach(hobby => {
        map[hobby.id] = hobby;
      });
      setStatsMap(map);
    } catch (error) {
      console.error('Error loading hobby stats:', error);
    }
  }, [hobbies, userId]);

  useFocusEffect(
    useCallback(() => {
      hydrateUser();
      hydrateHobbies();
    }, [hydrateUser, hydrateHobbies])
  );

  useEffect(() => {
    if (hobbies.length > 0) {
      hydrateStats();
    }
  }, [hobbies, hydrateStats]);

  const data = useMemo(() => {
    return hobbies.map(hobby => statsMap[hobby.id] ?? hobby);
  }, [hobbies, statsMap]);

  const handleRefresh = async () => {
    await hydrateHobbies();
  };

  const handleAddHobby = () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Connect to the internet to add hobbies.');
      return;
    }
    router.push('/add-hobby');
  };

  return (
    <View style={styles.container}>
      <OfflineBanner visible={!isOnline} />
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name ?? 'there'}! 👋</Text>
        <Text style={styles.subtitle}>Keep your streak alive today.</Text>
      </View>

      {isLoading && hobbies.length === 0 ? <LoadingSpinner /> : null}

      <FlatList
        contentContainerStyle={styles.list}
        data={data}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <EmptyState
            title="No hobbies yet"
            description="Add your first hobby to start tracking progress."
          />
        }
        renderItem={({ item }) => (
          <HobbyCard
            hobby={item}
            onPress={() => router.push({ pathname: '/hobby/[id]', params: { id: item.id } })}
          />
        )}
      />

      <Pressable
        style={[styles.fab, !isOnline && styles.fabDisabled]}
        onPress={handleAddHobby}
        disabled={!isOnline}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  greeting: {
    ...fonts.title,
    color: colors.text,
  },
  subtitle: {
    ...fonts.body,
    color: colors.textSecondary,
    marginTop: 6,
  },
  list: {
    padding: 20,
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabDisabled: {
    opacity: 0.5,
  },
});
