import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

import { AddHobbyFab, HomeGreeting, HobbyListSection, LoadingSpinner, OfflineBanner } from '@/src/components';
import { colors } from '@/src/constants/theme';
import { useOnlineStatus } from '@/src/hooks/use-online-status';
import { useHobbyStore } from '@/src/store/hobbyStore';
import * as HobbyAPI from '@/src/services/hobbyApi';
import type { Hobby } from '@/src/types';
import { showMessage } from '@/src/utils/appAlerts';

export default function HomeScreen() {
  const { user, userId, hobbies, isLoading, loadHobbies, setUser } = useHobbyStore();
  const isOnline = useOnlineStatus();
  const [statsMap, setStatsMap] = useState<Record<string, Hobby>>({});

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
      void showMessage('Offline', 'Connect to the internet to add hobbies.');
      return;
    }
    router.push('/add-hobby');
  };

  return (
    <View style={styles.container}>
      <OfflineBanner visible={!isOnline} />
      <HomeGreeting userName={user?.name} />

      {isLoading && hobbies.length === 0 ? <LoadingSpinner /> : null}

      <HobbyListSection
        hobbies={data}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onOpenHobby={hobbyId => router.push({ pathname: '/hobby/[id]', params: { id: hobbyId } })}
      />

      <AddHobbyFab onPress={handleAddHobby} disabled={!isOnline} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
