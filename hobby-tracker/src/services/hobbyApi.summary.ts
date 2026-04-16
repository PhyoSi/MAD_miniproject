import { getDocs, orderBy, query, where } from 'firebase/firestore';

import { ALL_TIME_LOOKBACK_DAYS, TWO_DECIMAL_PLACES } from '@/src/constants/app';
import { getUserHobbies } from '@/src/services/hobbyApi.hobby';
import { getRecentSessions } from '@/src/services/hobbyApi.session';
import {
  calculateAverageSessionMinutes,
  calculateBestStreak,
  calculateHobbyStatsFromSessions,
  calculateMostPracticedHobby,
  calculateWeekHours,
  roundTo,
  sumSessionHours,
} from '@/src/services/hobbyApi.stats';
import { resolveTargetUserId, sessionsCollection } from '@/src/services/hobbyApi.shared';
import { mapSession } from '@/src/services/hobbyApi.transformers';
import type { HobbyStats, StatsSummary } from '@/src/types';

export async function getHobbyStats(hobbyId: string, _userId: string): Promise<HobbyStats> {
  const ownerUserId = await resolveTargetUserId();

  const sessionsQuery = query(
    sessionsCollection,
    where('userId', '==', ownerUserId),
    where('hobbyId', '==', hobbyId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(sessionsQuery);

  const sessions = snapshot.docs.map(docSnap => mapSession(docSnap.id, docSnap.data()));
  return calculateHobbyStatsFromSessions(sessions);
}

export async function getStatsSummary(userId: string): Promise<StatsSummary> {
  const hobbies = await getUserHobbies(userId);
  const sessions = await getRecentSessions(userId, ALL_TIME_LOOKBACK_DAYS);
  const totalHours = sumSessionHours(sessions);
  const totalSessions = sessions.length;
  const avgSessionMinutes = calculateAverageSessionMinutes(sessions);
  const bestStreak = calculateBestStreak(sessions);
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
