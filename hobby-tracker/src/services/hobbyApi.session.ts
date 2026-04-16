import { addDoc, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, where } from 'firebase/firestore';

import { DEFAULT_RECENT_DAYS, MAX_RECENT_SESSIONS_QUERY } from '@/src/constants/app';
import { waitForAuth } from '@/src/services/auth';
import { getUserHobbies } from '@/src/services/hobbyApi.hobby';
import { mapSessionsWithHobby } from '@/src/services/hobbyApi.stats';
import { resolveTargetUserId, sessionsCollection } from '@/src/services/hobbyApi.shared';
import { mapSession } from '@/src/services/hobbyApi.transformers';
import type { Session, SessionWithHobby } from '@/src/types';

export async function createSession(
  _userId: string,
  hobbyId: string,
  date: string,
  durationMinutes: number
): Promise<Session> {
  const ownerUserId = await resolveTargetUserId();

  const sessionRef = await addDoc(sessionsCollection, {
    userId: ownerUserId,
    hobbyId,
    date,
    durationMinutes,
    createdAt: serverTimestamp(),
  });

  const sessionSnapshot = await getDoc(sessionRef);
  return mapSession(sessionSnapshot.id, sessionSnapshot.data() ?? {});
}

export async function getRecentSessions(
  _userId: string,
  days = DEFAULT_RECENT_DAYS
): Promise<SessionWithHobby[]> {
  const ownerUserId = await resolveTargetUserId();

  const hobbies = await getUserHobbies(ownerUserId);
  const hobbyById = new Map(hobbies.map(hobby => [hobby.id, hobby]));

  const sessionsQuery = query(
    sessionsCollection,
    where('userId', '==', ownerUserId),
    orderBy('date', 'desc'),
    limit(MAX_RECENT_SESSIONS_QUERY)
  );

  const snapshot = await getDocs(sessionsQuery);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const filteredSessions = snapshot.docs
    .map(docSnap => mapSession(docSnap.id, docSnap.data()))
    .filter(session => new Date(session.date) >= cutoff);

  return mapSessionsWithHobby(filteredSessions, hobbyById);
}

export async function deleteSession(sessionId: string): Promise<void> {
  await waitForAuth();

  await deleteDoc(doc(sessionsCollection, sessionId));
}
