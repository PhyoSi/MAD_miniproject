import { StyleSheet, View } from 'react-native';

import StatCard from '@/src/components/StatCard';

interface StatCardsRowItem {
  label: string;
  value: number;
}

interface StatCardsRowProps {
  items: StatCardsRowItem[];
}

export default function StatCardsRow({ items }: StatCardsRowProps) {
  return (
    <View style={styles.row}>
      {items.map(item => (
        <StatCard key={item.label} label={item.label} value={item.value} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
});
