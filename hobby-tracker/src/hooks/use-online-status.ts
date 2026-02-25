import { useEffect, useState } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

function isStateOnline(state: NetInfoState): boolean {
  const connected = state.isConnected;
  const reachable = state.isInternetReachable;

  if (connected === false || reachable === false) {
    return false;
  }

  return true;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(isStateOnline(state));
    });

    NetInfo.fetch().then(state => {
      setIsOnline(isStateOnline(state));
    });

    return () => unsubscribe();
  }, []);

  return isOnline;
}
