import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
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

import {
  ALL_TIME_LOOKBACK_DAYS,
  DEFAULT_RECENT_DAYS,
  MAX_RECENT_SESSIONS_QUERY,
  MINUTES_PER_HOUR,
  ONE_DECIMAL_PLACES,
  TWO_DECIMAL_PLACES,
  WEEK_DAYS,
} from '@/src/constants/app';
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

function roundTo(value: number, decimalPlaces: number): number {
  return Number(value.toFixed(decimalPlaces));
}

function sumSessionHours(sessions: Session[]): number {
  return sessions.reduce((sum, session) => sum + session.durationMinutes / MINUTES_PER_HOUR, 0);
}

function mapSessionsWithHobby(
  sessions: Session[],
  hobbyById: Map<string, Hobby>
): SessionWithHobby[] {
  return sessions.map(session => {
    const hobby = hobbyById.get(session.hobbyId);
    return {
      ...session,
      hobbyName: hobby?.name ?? 'Unknown',
      hobbyIcon: hobby?.icon ?? '🎯',
    };
  });
}

function calculateAverageSessionMinutes(sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  return Math.round(totalMinutes / sessions.length);
}

function calculateWeekHours(sessions: Session[]): Pick<StatsSummary, 'thisWeekHours' | 'prevWeekHours'> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = todayStart.getDay();
  const thisWeekStart = new Date(todayStart);
  thisWeekStart.setDate(todayStart.getDate() - dayOfWeek);

  const prevWeekStart = new Date(thisWeekStart);
  prevWeekStart.setDate(thisWeekStart.getDate() - WEEK_DAYS);

  let thisWeekHours = 0;
  let prevWeekHours = 0;

  sessions.forEach(session => {
    const sessionDate = new Date(`${session.date}T00:00:00`);
    if (sessionDate >= thisWeekStart) {
      thisWeekHours += session.durationMinutes / MINUTES_PER_HOUR;
      return;
    }
    if (sessionDate >= prevWeekStart) {
      prevWeekHours += session.durationMinutes / MINUTES_PER_HOUR;
    }
  });

  return {
    thisWeekHours: roundTo(thisWeekHours, ONE_DECIMAL_PLACES),
    prevWeekHours: roundTo(prevWeekHours, ONE_DECIMAL_PLACES),
  };
}

function calculateMostPracticedHobby(
  hobbies: Hobby[],
  sessions: Session[]
): StatsSummary['mostPracticedHobby'] {
  const hoursByHobbyId = new Map<string, number>();

  sessions.forEach(session => {
    const currentHours = hoursByHobbyId.get(session.hobbyId) ?? 0;
    hoursByHobbyId.set(session.hobbyId, currentHours + session.durationMinutes / MINUTES_PER_HOUR);
  });

  let mostPracticed: StatsSummary['mostPracticedHobby'] = null;
  hoursByHobbyId.forEach((hours, hobbyId) => {
    const hobby = hobbies.find(item => item.id === hobbyId);
    if (!hobby) return;
    if (!mostPracticed || hours > mostPracticed.hours) {
      mostPracticed = {
        id: hobby.id,
        name: hobby.name,
        icon: hobby.icon,
        hours: roundTo(hours, TWO_DECIMAL_PLACES),
      };
    }
  });

  return mostPracticed;
}

function mapUser(id: string, userDoc: Record<string, unknown>): User {
  return {
    user_id: id,
    name: (userDoc.name as string) ?? '',
    created_at: toIsoString(userDoc.created_at),
    hobbies: (userDoc.hobbies as string[]) ?? [],
  };
}

function mapHobby(id: string, hobbyDoc: Record<string, unknown>): Hobby {
  return {
    id,
    userId: (hobbyDoc.userId as string) ?? '',
    name: (hobbyDoc.name as string) ?? '',
    icon: (hobbyDoc.icon as string) ?? '🎯',
    createdAt: toIsoString(hobbyDoc.createdAt),
    updatedAt: toIsoString(hobbyDoc.updatedAt),
  };
}

function mapSession(id: string, sessionDoc: Record<string, unknown>): Session {
  return {
    id,
    userId: (sessionDoc.userId as string) ?? '',
    hobbyId: (sessionDoc.hobbyId as string) ?? '',
    date: (sessionDoc.date as string) ?? '',
    durationMinutes: (sessionDoc.durationMinutes as number) ?? 0,
    createdAt: toIsoString(sessionDoc.createdAt),
  };
}

export async function createUser(name: string): Promise<User> {
  const userRef = await addDoc(usersCollection, {
    name,
    created_at: serverTimestamp(),
    hobbies: [],
  });

  const userSnapshot = await getDoc(userRef);
  return mapUser(userSnapshot.id, userSnapshot.data() ?? {});
}

export async function getUserProfile(userId: string): Promise<User> {
  const userRef = doc(usersCollection, userId);
  const userSnapshot = await getDoc(userRef);
  if (!userSnapshot.exists()) {
    throw new Error('User not found');
  }

  const userDoc = userSnapshot.data();
  if ('location' in userDoc) {
    await updateDoc(userRef, {
      location: deleteField(),
    });
  }

  return mapUser(userSnapshot.id, userDoc);
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

export async function getRecentSessions(
  userId: string,
  days = DEFAULT_RECENT_DAYS
): Promise<SessionWithHobby[]> {
  const hobbies = await getUserHobbies(userId);
  const hobbyById = new Map(hobbies.map(hobby => [hobby.id, hobby]));

  const sessionsQuery = query(
    sessionsCollection,
    where('userId', '==', userId),
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
  const totalHours = sumSessionHours(sessions);
  const dates = sessions.map(session => session.date);

  return {
    totalHours: roundTo(totalHours, TWO_DECIMAL_PLACES),
    totalSessions,
    currentStreak: calculateStreak(dates),
    longestStreak: calculateLongestStreak(dates),
  };
}

export async function getStatsSummary(userId: string): Promise<StatsSummary> {
  const hobbies = await getUserHobbies(userId);
  const sessions = await getRecentSessions(userId, ALL_TIME_LOOKBACK_DAYS);
  const totalHours = sumSessionHours(sessions);
  const totalSessions = sessions.length;
  const avgSessionMinutes = calculateAverageSessionMinutes(sessions);
  const bestStreak = calculateLongestStreak(sessions.map(session => session.date));
  const { thisWeekHours, prevWeekHours } = calculateWeekHours(sessions);
  const mostPracticedHobby = calculateMostPracticedHobby(hobbies, sessions);

  return {
    totalHobbies: hobbies.length,
    totalHours: roundTo(totalHours, TWO_DECIMAL_PLACES),
    totalSessions,
    avgSessionMinutes,
    bestStreak,
    thisWeekHours,
    prevWeekHours,
    mostPracticedHobby,
  };
}
