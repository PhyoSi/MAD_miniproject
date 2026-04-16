import { deleteField, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import { migrateLegacyUserData } from '@/src/services/hobbyApi.migration';
import { getAuthenticatedUserId, usersCollection } from '@/src/services/hobbyApi.shared';
import { mapUser } from '@/src/services/hobbyApi.transformers';
import type { User } from '@/src/types';

export async function createUser(name: string): Promise<User> {
  const authenticatedUserId = await getAuthenticatedUserId();
  const userRef = doc(usersCollection, authenticatedUserId);

  await setDoc(
    userRef,
    {
      name,
      created_at: serverTimestamp(),
      hobbies: [],
    },
    { merge: true }
  );

  const userSnapshot = await getDoc(userRef);
  return mapUser(userSnapshot.id, userSnapshot.data() ?? {});
}

export async function getUserProfile(userId: string): Promise<User> {
  const authenticatedUserId = await getAuthenticatedUserId();

  if (userId && userId.trim().length > 0 && userId !== authenticatedUserId) {
    try {
      await migrateLegacyUserData(userId, authenticatedUserId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.toLowerCase().includes('insufficient permissions')) {
        throw error;
      }
    }
  }

  const authUserRef = doc(usersCollection, authenticatedUserId);
  let userSnapshot = await getDoc(authUserRef);
  if (!userSnapshot.exists()) {
    await setDoc(
      authUserRef,
      {
        name: '',
        created_at: serverTimestamp(),
        hobbies: [],
      },
      { merge: true }
    );

    userSnapshot = await getDoc(authUserRef);
  }

  if (!userSnapshot.exists()) {
    throw new Error('Failed to initialize user profile');
  }

  const userDoc = userSnapshot.data();
  if ('location' in userDoc) {
    await updateDoc(authUserRef, {
      location: deleteField(),
    });
  }

  return mapUser(userSnapshot.id, userDoc);
}
