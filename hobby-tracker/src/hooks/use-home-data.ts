import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import * as HobbyAPI from '@/src/services/hobbyApi';
import { useHobbyStore } from '@/src/store/hobbyStore';
import type { Hobby } from '@/src/types';

export function useHomeData() {
  const { userId, hobbies, loadHobbies, setUser } = useHobbyStore();
  const [hobbyStatsById, setHobbyStatsById] = useState<Record<string, Hobby>>({});

  const loadUserProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const userProfile = await HobbyAPI.getUserProfile(userId);
      setUser(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [setUser, userId]);

  const loadHobbyStats = useCallback(async () => {
    if (!userId || hobbies.length === 0) return;
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

      const nextStatsById = statsEntries.reduce<Record<string, Hobby>>((acc, hobby) => {
        acc[hobby.id] = hobby;
        return acc;
      }, {});

      setHobbyStatsById(nextStatsById);
    } catch (error) {
      console.error('Error loading hobby stats:', error);
    }
  }, [hobbies, userId]);

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
      loadHobbies();
    }, [loadUserProfile, loadHobbies])
  );

  useEffect(() => {
    loadHobbyStats();
  }, [loadHobbyStats]);

  const enrichedHobbies = useMemo(
    () => hobbies.map(hobby => hobbyStatsById[hobby.id] ?? hobby),
    [hobbies, hobbyStatsById]
  );

  const refreshHobbies = useCallback(async () => {
    await loadHobbies();
  }, [loadHobbies]);

  return {
    enrichedHobbies,
    refreshHobbies,
  };
}
