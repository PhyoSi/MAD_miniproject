import StatCardsRow from '@/src/components/StatCardsRow';
import type { HobbyStats } from '@/src/types';

interface HobbyStatsGridProps {
  stats: HobbyStats | null;
}

export default function HobbyStatsGrid({ stats }: HobbyStatsGridProps) {
  return (
    <>
      <StatCardsRow
        items={[
          { label: 'Total Hours', value: stats?.totalHours ?? 0 },
          { label: 'Sessions', value: stats?.totalSessions ?? 0 },
        ]}
      />
      <StatCardsRow
        items={[
          { label: 'Current Streak', value: stats?.currentStreak ?? 0 },
          { label: 'Longest Streak', value: stats?.longestStreak ?? 0 },
        ]}
      />
    </>
  );
}
