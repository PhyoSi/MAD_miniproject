import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { signInAnon } from '../src/services/auth';
import LandingScreen from '../src/screens/LandingScreen';
import { backfillAuthorId } from '../src/utils/migration';

export default function Index() {
  const [isReadyToRedirect, setIsReadyToRedirect] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        await signInAnon();
      } catch (error) {
        console.error('Startup auth failed:', error);
      }

      try {
        await backfillAuthorId();
      } catch (error) {
        console.warn('Startup migration skipped:', error);
      } finally {
        if (isMounted) {
          setIsReadyToRedirect(true);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  if (Platform.OS === 'web') {
    return (
      <LandingScreen
        isLaunching={!isReadyToRedirect}
        onLaunch={() => {
          router.replace('/splash');
        }}
      />
    );
  }

  if (!isReadyToRedirect) return null;

  return <Redirect href="/splash" />;
}

