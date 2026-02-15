import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { colors, fonts } from '@/src/constants/theme';
import type { StatsSummary } from '@/src/types';

interface MostLoggedCardProps {
  mostPracticedHobby: StatsSummary['mostPracticedHobby'];
}

export default function MostLoggedCard({ mostPracticedHobby }: MostLoggedCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Most Logged Hobby</Text>
      {mostPracticedHobby ? (
        <Text style={styles.mostText}>
          {mostPracticedHobby.icon} {mostPracticedHobby.name} • {mostPracticedHobby.hours.toFixed(1)} hrs
        </Text>
      ) : (
        <Text style={styles.caption}>Log sessions to see your top hobby.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
});
