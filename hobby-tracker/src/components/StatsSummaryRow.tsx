import StatCardsRow from '@/src/components/StatCardsRow';
import type { StatsSummary } from '@/src/types';

interface StatsSummaryRowProps {
  stats: StatsSummary | null;
}

export default function StatsSummaryRow({ stats }: StatsSummaryRowProps) {
  return (
    <StatCardsRow
      items={[
        { label: 'Hobbies', value: stats?.totalHobbies ?? 0 },
        { label: 'Hours', value: stats?.totalHours ?? 0 },
        { label: 'Sessions', value: stats?.totalSessions ?? 0 },
      ]}
    />
  );
}
