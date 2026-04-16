import {
  addDoc,
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { db } from '@/src/config/firebase';
import { hobbiesCollection, resolveTargetUserId, sessionsCollection, usersCollection } from '@/src/services/hobbyApi.shared';
import { mapHobby } from '@/src/services/hobbyApi.transformers';
import type { Hobby } from '@/src/types';

export async function getUserHobbies(_userId: string): Promise<Hobby[]> {
  const targetUserId = await resolveTargetUserId();

  const hobbiesQuery = query(
    hobbiesCollection,
    where('userId', '==', targetUserId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(hobbiesQuery);
  return snapshot.docs.map(docSnap => mapHobby(docSnap.id, docSnap.data()));
}

export async function createHobby(_userId: string, name: string, icon: string): Promise<Hobby> {
  const ownerUserId = await resolveTargetUserId();

  const now = serverTimestamp();
  const hobbyRef = await addDoc(hobbiesCollection, {
    userId: ownerUserId,
    name,
    icon,
    createdAt: now,
    updatedAt: now,
  });

  await updateDoc(doc(usersCollection, ownerUserId), {
    hobbies: arrayUnion(hobbyRef.id),
  });

  const hobbySnapshot = await getDoc(hobbyRef);
  return mapHobby(hobbySnapshot.id, hobbySnapshot.data() ?? {});
}

export async function deleteHobby(hobbyId: string, _userId: string): Promise<void> {
  const ownerUserId = await resolveTargetUserId();

  const sessionsQuery = query(
    sessionsCollection,
    where('hobbyId', '==', hobbyId),
    where('userId', '==', ownerUserId)
  );
  const sessionsSnapshot = await getDocs(sessionsQuery);

  const batch = writeBatch(db);
  sessionsSnapshot.forEach(docSnap => {
    batch.delete(docSnap.ref);
  });

  batch.update(doc(usersCollection, ownerUserId), {
    hobbies: arrayRemove(hobbyId),
  });

  batch.delete(doc(hobbiesCollection, hobbyId));
  await batch.commit();
}
