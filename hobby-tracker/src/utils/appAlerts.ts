import { getAlertAPI } from '@/src/components/AlertProvider';

export async function showMessage(title: string, message: string): Promise<void> {
  const api = getAlertAPI();
  if (api) {
    // Use snackbar for brief messages, dialog for errors
    const isError = /error|fail|invalid|offline|missing/i.test(title);
    if (isError) {
      api.showSnackbar(`${title}: ${message}`, 'error');
    } else {
      api.showSnackbar(`${title}: ${message}`, 'success');
    }
    return;
  }

  // Fallback before provider mounts
  const { Alert, Platform } = require('react-native');
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export async function showConfirmation(title: string, message: string): Promise<boolean> {
  const api = getAlertAPI();
  if (api) {
    return api.showDialog({
      title,
      message,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      destructive: true,
    });
  }

  // Fallback before provider mounts
  const { Alert, Platform } = require('react-native');
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.confirm(`${title}\n\n${message}`);
  }

  return new Promise(resolve => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
