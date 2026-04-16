import { collection } from 'firebase/firestore';

import { db } from '@/src/config/firebase';
import { waitForAuth } from '@/src/services/auth';

export const usersCollection = collection(db, 'users');
export const hobbiesCollection = collection(db, 'hobbies');
export const sessionsCollection = collection(db, 'sessions');

export async function getAuthenticatedUserId(): Promise<string> {
  const user = await waitForAuth();
  return user.uid;
}

export async function resolveTargetUserId(): Promise<string> {
  return getAuthenticatedUserId();
}
