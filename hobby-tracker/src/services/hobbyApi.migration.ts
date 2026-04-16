import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import { hobbiesCollection, sessionsCollection, usersCollection } from './hobbyApi.shared';

export async function migrateLegacyUserData(
  legacyUserId: string,
  authenticatedUserId: string
): Promise<void> {
  if (!legacyUserId || legacyUserId === authenticatedUserId) {
    return;
  }

  const legacyUserRef = doc(usersCollection, legacyUserId);
  const authenticatedUserRef = doc(usersCollection, authenticatedUserId);

  let legacyUserSnapshot;
  let authenticatedUserSnapshot;

  try {
    [legacyUserSnapshot, authenticatedUserSnapshot] = await Promise.all([
      getDoc(legacyUserRef),
      getDoc(authenticatedUserRef),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes('insufficient permissions')) {
      return;
    }
    throw error;
  }

  if (!legacyUserSnapshot.exists()) {
    return;
  }

  const legacyUserDoc = legacyUserSnapshot.data();
  const authenticatedUserDoc = authenticatedUserSnapshot.exists()
    ? authenticatedUserSnapshot.data()
    : null;

  const legacyHobbiesSnapshot = await getDocs(
    query(hobbiesCollection, where('userId', '==', legacyUserId))
  );
  const legacySessionsSnapshot = await getDocs(
    query(sessionsCollection, where('userId', '==', legacyUserId))
  );

  for (const hobbySnapshot of legacyHobbiesSnapshot.docs) {
    await updateDoc(hobbySnapshot.ref, {
      userId: authenticatedUserId,
      updatedAt: serverTimestamp(),
    });
  }

  for (const sessionSnapshot of legacySessionsSnapshot.docs) {
    await updateDoc(sessionSnapshot.ref, {
      userId: authenticatedUserId,
    });
  }

  const legacyHobbyIds = legacyHobbiesSnapshot.docs.map(snapshot => snapshot.id);
  const existingAuthHobbyIds = Array.isArray(authenticatedUserDoc?.hobbies)
    ? (authenticatedUserDoc?.hobbies as string[])
    : [];
  const legacyUserHobbyIds = Array.isArray(legacyUserDoc.hobbies)
    ? (legacyUserDoc.hobbies as string[])
    : [];

  const mergedHobbyIds = Array.from(
    new Set([...existingAuthHobbyIds, ...legacyUserHobbyIds, ...legacyHobbyIds])
  );
  const authName = typeof authenticatedUserDoc?.name === 'string' ? authenticatedUserDoc.name : '';
  const legacyName = typeof legacyUserDoc.name === 'string' ? legacyUserDoc.name : '';

  await setDoc(
    authenticatedUserRef,
    {
      name: authName || legacyName,
      created_at: authenticatedUserDoc?.created_at ?? legacyUserDoc.created_at ?? serverTimestamp(),
      hobbies: mergedHobbyIds,
      migratedFrom: legacyUserId,
      migratedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await deleteDoc(legacyUserRef);
}
