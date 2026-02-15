import { FlatList, RefreshControl, StyleSheet } from 'react-native';

import EmptyState from '@/src/components/EmptyState';
import HobbyCard from '@/src/components/HobbyCard';
import type { Hobby } from '@/src/types';

interface HobbyListSectionProps {
  hobbies: Hobby[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenHobby: (hobbyId: string) => void;
}

export default function HobbyListSection({
  hobbies,
  isLoading,
  onRefresh,
  onOpenHobby,
}: HobbyListSectionProps) {
  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={hobbies}
      keyExtractor={item => item.id}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <EmptyState
          title="No hobbies yet"
          description="Add your first hobby to start tracking progress."
        />
      }
      renderItem={({ item }) => <HobbyCard hobby={item} onPress={() => onOpenHobby(item.id)} />}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 20,
    paddingBottom: 80,
  },
});
