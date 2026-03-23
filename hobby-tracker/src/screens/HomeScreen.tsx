import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { AddHobbyFab, HomeGreeting, HobbyListSection, LoadingSpinner, OfflineBanner } from '@/src/components';
import { colors } from '@/src/constants/theme';
import { useHomeData } from '@/src/hooks/use-home-data';
import { useOnlineStatus } from '@/src/hooks/use-online-status';
import { useHobbyStore } from '@/src/store/hobbyStore';
import { showMessage } from '@/src/utils/appAlerts';

export default function HomeScreen() {
  const { user, hobbies, isLoading } = useHobbyStore();
  const { enrichedHobbies, refreshHobbies } = useHomeData();
  const isOnline = useOnlineStatus();

  const handleRefresh = async () => {
    await refreshHobbies();
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
        hobbies={enrichedHobbies}
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
