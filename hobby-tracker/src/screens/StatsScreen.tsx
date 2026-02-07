import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

import EmptyState from '@/src/components/EmptyState';
import OfflineBanner from '@/src/components/OfflineBanner';
import SessionCard from '@/src/components/SessionCard';
import StatCard from '@/src/components/StatCard';
import { colors, fonts } from '@/src/constants/theme';
import { useHobbyStore } from '@/src/store/hobbyStore';

export default function StatsScreen() {
  const { stats, sessions, loadStats, loadRecentSessions, isLoading } = useHobbyStore();
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

  return (
    <View style={styles.container}>
      <OfflineBanner visible={!isOnline} />
      <Text style={styles.title}>Your stats</Text>

      <View style={styles.summaryRow}>
        <StatCard label="Hobbies" value={stats?.totalHobbies ?? 0} />
        <StatCard label="Hours" value={stats?.totalHours ?? 0} />
        <StatCard label="Sessions" value={stats?.totalSessions ?? 0} />
      </View>

      <View style={styles.mostPracticed}>
        <Text style={styles.sectionLabel}>Most Practiced</Text>
        {stats?.mostPracticedHobby ? (
          <Text style={styles.mostText}>
            {stats.mostPracticedHobby.icon} {stats.mostPracticedHobby.name} •{' '}
            {stats.mostPracticedHobby.hours.toFixed(1)} hrs
          </Text>
        ) : (
          <Text style={styles.caption}>Log sessions to see your top hobby.</Text>
        )}
      </View>

      <Text style={styles.sectionLabel}>Recent sessions</Text>
      <FlatList
        contentContainerStyle={styles.list}
        data={sessions}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <EmptyState title="No sessions" description="Log a session to see stats here." />
        }
        renderItem={({ item }) => <SessionCard session={item} disabled={!isOnline} />}
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
  title: {
    ...fonts.title,
    color: colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  mostPracticed: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionLabel: {
    ...fonts.label,
    color: colors.text,
  },
  mostText: {
    ...fonts.body,
    color: colors.text,
    marginTop: 8,
  },
  caption: {
    ...fonts.caption,
  },
  list: {
    paddingVertical: 12,
  },
});
