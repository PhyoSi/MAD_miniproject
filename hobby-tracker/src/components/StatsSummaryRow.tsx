import { StyleSheet, View } from 'react-native';

import SectionLabel from '@/src/components/SectionLabel';
import StatCardsRow from '@/src/components/StatCardsRow';
import type { StatsSummary } from '@/src/types';

interface StatsSummaryRowProps {
  stats: StatsSummary | null;
}

export default function StatsSummaryRow({ stats }: StatsSummaryRowProps) {
  return (
    <View style={styles.wrapper}>
      <SectionLabel style={styles.sectionLabel}>Overview</SectionLabel>
      <StatCardsRow
        items={[
          { label: 'Hobbies', value: stats?.totalHobbies ?? 0 },
          { label: 'Total Hours', value: stats?.totalHours ?? 0 },
          { label: 'Sessions', value: stats?.totalSessions ?? 0 },
        ]}
      />

      <SectionLabel style={styles.sectionLabel}>Activity</SectionLabel>
      <StatCardsRow
        items={[
          { label: 'Avg Session', value: `${stats?.avgSessionMinutes ?? 0} min` },
          { label: 'Best Streak', value: `${stats?.bestStreak ?? 0} days` },
        ]}
      />
      <StatCardsRow
        items={[
          { label: 'This Week', value: `${stats?.thisWeekHours ?? 0} hrs` },
          { label: 'Prev Week', value: `${stats?.prevWeekHours ?? 0} hrs` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  sectionLabel: {
    marginTop: 8,
    marginBottom: 10,
  },
});
