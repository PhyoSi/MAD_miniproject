import {
  MINUTES_PER_HOUR,
  ONE_DECIMAL_PLACES,
  TWO_DECIMAL_PLACES,
  WEEK_DAYS,
} from '@/src/constants/app';
import type { Hobby, HobbyStats, Session, SessionWithHobby, StatsSummary } from '@/src/types';
import { calculateLongestStreak, calculateStreak } from '@/src/utils/dateUtils';

export function roundTo(value: number, decimalPlaces: number): number {
  return Number(value.toFixed(decimalPlaces));
}

export function sumSessionHours(sessions: Session[]): number {
  return sessions.reduce((sum, session) => sum + session.durationMinutes / MINUTES_PER_HOUR, 0);
}

export function mapSessionsWithHobby(
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

export function calculateAverageSessionMinutes(sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  return Math.round(totalMinutes / sessions.length);
}

export function calculateWeekHours(
  sessions: Session[]
): Pick<StatsSummary, 'thisWeekHours' | 'prevWeekHours'> {
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

export function calculateMostPracticedHobby(
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

export function calculateHobbyStatsFromSessions(sessions: Session[]): HobbyStats {
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

export function calculateBestStreak(sessions: Session[]): number {
  return calculateLongestStreak(sessions.map(session => session.date));
}
