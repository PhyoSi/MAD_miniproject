export function validateSessionDuration(minutes: number): boolean {
  return minutes >= 1 && minutes <= 1440;
}

export function validateSessionDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();

  if (Number.isNaN(date.getTime())) return false;
  if (date > today) return false;

  return true;
}

export function validateHobbyName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50;
}
