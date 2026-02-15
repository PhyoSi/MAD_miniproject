import { useEffect } from 'react';
import { router } from 'expo-router';

import { SplashBranding } from '@/src/components';
import { useHobbyStore } from '@/src/store/hobbyStore';

export default function SplashScreen() {
  const loadUserId = useHobbyStore(state => state.loadUserId);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const storedId = await loadUserId();
      if (storedId) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/welcome');
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [loadUserId]);

  return (
    <SplashBranding />
  );
}
