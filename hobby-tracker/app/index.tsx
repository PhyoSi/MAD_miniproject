import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { signInAnon } from '../src/services/auth';
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

  if (!isReadyToRedirect) return null;

  return <Redirect href="/splash" />;
}

