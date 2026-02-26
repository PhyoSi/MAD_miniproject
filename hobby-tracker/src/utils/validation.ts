export function validateSessionDuration(minutes: number): boolean {
  return minutes >= 1 && minutes <= 1440;
}

export function validateSessionDate(dateStr: string): boolean {
  // Parse the YYYY-MM-DD string as local date parts to avoid UTC offset issues
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return false;

  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return false;
  }

  const now = new Date();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (date > todayLocal) return false;

  return true;
}

export function validateHobbyName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50;
}
