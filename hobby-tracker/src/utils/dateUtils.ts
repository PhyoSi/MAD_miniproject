const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

export function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const uniqueDates = Array.from(new Set(dates));
  const sortedDates = uniqueDates.sort().reverse();

  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let checkDate = toDateOnly(today);

  for (const dateStr of sortedDates) {
    const sessionDate = toDateOnly(dateStr);
    const daysDiff = Math.floor((checkDate.getTime() - sessionDate.getTime()) / MS_PER_DAY);

    if (daysDiff <= 1) {
      streak += 1;
      checkDate = sessionDate;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateLongestStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const uniqueDates = Array.from(new Set(dates)).sort();
  let longest = 1;
  let current = 1;

  for (let index = 1; index < uniqueDates.length; index += 1) {
    const previousDate = toDateOnly(uniqueDates[index - 1]);
    const currentDate = toDateOnly(uniqueDates[index]);
    const daysDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / MS_PER_DAY);

    if (daysDiff === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else if (daysDiff > 1) {
      current = 1;
    }
  }

  return longest;
}

export function formatDateLabel(dateStr: string): string {
  const date = toDateOnly(dateStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function toIsoDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}
