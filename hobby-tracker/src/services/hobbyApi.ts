import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { db } from '@/src/config/firebase';
import type { Hobby, HobbyStats, Session, SessionWithHobby, StatsSummary, User } from '@/src/types';
import { calculateLongestStreak, calculateStreak } from '@/src/utils/dateUtils';

const usersCollection = collection(db, 'users');
const hobbiesCollection = collection(db, 'hobbies');
const sessionsCollection = collection(db, 'sessions');

function toIsoString(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return new Date().toISOString();
}

function mapUser(id: string, data: Record<string, unknown>): User {
  return {
    user_id: id,
    name: (data.name as string) ?? '',
    location: (data.location as string) ?? '',
    created_at: toIsoString(data.created_at),
    hobbies: (data.hobbies as string[]) ?? [],
  };
}

function mapHobby(id: string, data: Record<string, unknown>): Hobby {
  return {
    id,
    userId: (data.userId as string) ?? '',
    name: (data.name as string) ?? '',
    icon: (data.icon as string) ?? '🎯',
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

function mapSession(id: string, data: Record<string, unknown>): Session {
  return {
    id,
    userId: (data.userId as string) ?? '',
    hobbyId: (data.hobbyId as string) ?? '',
    date: (data.date as string) ?? '',
    durationMinutes: (data.durationMinutes as number) ?? 0,
    createdAt: toIsoString(data.createdAt),
  };
}

export async function createUser(name: string, location: string): Promise<User> {
  const userRef = await addDoc(usersCollection, {
    name,
    location,
    created_at: serverTimestamp(),
    hobbies: [],
  });

  const userSnapshot = await getDoc(userRef);
  return mapUser(userSnapshot.id, userSnapshot.data() ?? {});
}

export async function getUserProfile(userId: string): Promise<User> {
  const userSnapshot = await getDoc(doc(usersCollection, userId));
  if (!userSnapshot.exists()) {
    throw new Error('User not found');
  }
  return mapUser(userSnapshot.id, userSnapshot.data());
}

export async function getUserHobbies(userId: string): Promise<Hobby[]> {
  const hobbiesQuery = query(hobbiesCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(hobbiesQuery);
  return snapshot.docs.map(docSnap => mapHobby(docSnap.id, docSnap.data()));
}

export async function createHobby(userId: string, name: string, icon: string): Promise<Hobby> {
  const now = serverTimestamp();
  const hobbyRef = await addDoc(hobbiesCollection, {
    userId,
    name,
    icon,
    createdAt: now,
    updatedAt: now,
  });

  await updateDoc(doc(usersCollection, userId), {
    hobbies: arrayUnion(hobbyRef.id),
  });

  const hobbySnapshot = await getDoc(hobbyRef);
  return mapHobby(hobbySnapshot.id, hobbySnapshot.data() ?? {});
}

export async function deleteHobby(hobbyId: string, userId: string): Promise<void> {
  const sessionsQuery = query(
    sessionsCollection,
    where('hobbyId', '==', hobbyId),
    where('userId', '==', userId)
  );
  const sessionsSnapshot = await getDocs(sessionsQuery);

  const batch = writeBatch(db);
  sessionsSnapshot.forEach(docSnap => {
    batch.delete(docSnap.ref);
  });

  batch.update(doc(usersCollection, userId), {
    hobbies: arrayRemove(hobbyId),
  });

  batch.delete(doc(hobbiesCollection, hobbyId));
  await batch.commit();
}

export async function createSession(
  userId: string,
  hobbyId: string,
  date: string,
  durationMinutes: number
): Promise<Session> {
  const sessionRef = await addDoc(sessionsCollection, {
    userId,
    hobbyId,
    date,
    durationMinutes,
    createdAt: serverTimestamp(),
  });

  const sessionSnapshot = await getDoc(sessionRef);
  return mapSession(sessionSnapshot.id, sessionSnapshot.data() ?? {});
}

export async function getRecentSessions(userId: string, days = 30): Promise<SessionWithHobby[]> {
  const hobbies = await getUserHobbies(userId);
  const hobbyMap = new Map(hobbies.map(hobby => [hobby.id, hobby]));

  const sessionsQuery = query(
    sessionsCollection,
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(200)
  );

  const snapshot = await getDocs(sessionsQuery);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return snapshot.docs
    .map(docSnap => mapSession(docSnap.id, docSnap.data()))
    .filter(session => new Date(session.date) >= cutoff)
    .map(session => {
      const hobby = hobbyMap.get(session.hobbyId);
      return {
        ...session,
        hobbyName: hobby?.name ?? 'Unknown',
        hobbyIcon: hobby?.icon ?? '🎯',
      };
    });
}

export async function deleteSession(sessionId: string): Promise<void> {
  await deleteDoc(doc(sessionsCollection, sessionId));
}

export async function getHobbyStats(hobbyId: string, userId: string): Promise<HobbyStats> {
  const sessionsQuery = query(
    sessionsCollection,
    where('userId', '==', userId),
    where('hobbyId', '==', hobbyId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(sessionsQuery);

  const sessions = snapshot.docs.map(docSnap => mapSession(docSnap.id, docSnap.data()));
  const totalSessions = sessions.length;
  const totalHours = sessions.reduce((sum, session) => sum + session.durationMinutes / 60, 0);
  const dates = sessions.map(session => session.date);

  return {
    totalHours: Number(totalHours.toFixed(2)),
    totalSessions,
    currentStreak: calculateStreak(dates),
    longestStreak: calculateLongestStreak(dates),
  };
}

export async function getStatsSummary(userId: string): Promise<StatsSummary> {
  const hobbies = await getUserHobbies(userId);
  const sessions = await getRecentSessions(userId, 3650);

  const totalHours = sessions.reduce((sum, session) => sum + session.durationMinutes / 60, 0);
  const totalSessions = sessions.length;

  const hoursByHobby = new Map<string, number>();
  sessions.forEach(session => {
    hoursByHobby.set(session.hobbyId, (hoursByHobby.get(session.hobbyId) ?? 0) + session.durationMinutes / 60);
  });

  let mostPracticed: StatsSummary['mostPracticedHobby'] = null;
  hoursByHobby.forEach((hours, hobbyId) => {
    const hobby = hobbies.find(item => item.id === hobbyId);
    if (!hobby) return;
    if (!mostPracticed || hours > mostPracticed.hours) {
      mostPracticed = {
        id: hobby.id,
        name: hobby.name,
        icon: hobby.icon,
        hours: Number(hours.toFixed(2)),
      };
    }
  });

  return {
    totalHobbies: hobbies.length,
    totalHours: Number(totalHours.toFixed(2)),
    totalSessions,
    mostPracticedHobby: mostPracticed,
  };
}
