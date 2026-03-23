import { showConfirmation, showMessage } from '@/src/utils/appAlerts';

interface ConfirmAndDeleteSessionOptions {
  isOnline: boolean;
  deleteSession: (sessionId: string) => Promise<void>;
  sessionId: string;
  onSuccess?: () => Promise<void> | void;
}

export async function confirmAndDeleteSession({
  isOnline,
  deleteSession,
  sessionId,
  onSuccess,
}: ConfirmAndDeleteSessionOptions): Promise<void> {
  const confirmed = await showConfirmation(
    'Delete session',
    'Are you sure you want to delete this session?'
  );
  if (!confirmed) return;

  if (!isOnline) {
    await showMessage('Offline', 'Connect to the internet to delete sessions.');
    return;
  }

  try {
    await deleteSession(sessionId);
    await onSuccess?.();
  } catch (error) {
    console.error('Error deleting session:', error);
    await showMessage('Error', 'Failed to delete session.');
  }
}
