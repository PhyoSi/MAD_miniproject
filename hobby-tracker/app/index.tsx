import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { signInAnon } from '../src/services/auth';
import { backfillAuthorId } from '../src/utils/migration';

export default function Index() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    signInAnon()
      .then(() => backfillAuthorId())
      .then(() => setAuthReady(true));
  }, []);

  if (!authReady) return null;

  return <Redirect href="/splash" />;
}

