import type { Hobby, Session, User } from '@/src/types';

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

export function mapUser(id: string, userDoc: Record<string, unknown>): User {
  return {
    user_id: id,
    name: (userDoc.name as string) ?? '',
    created_at: toIsoString(userDoc.created_at),
    hobbies: (userDoc.hobbies as string[]) ?? [],
  };
}

export function mapHobby(id: string, hobbyDoc: Record<string, unknown>): Hobby {
  return {
    id,
    userId: (hobbyDoc.userId as string) ?? '',
    name: (hobbyDoc.name as string) ?? '',
    icon: (hobbyDoc.icon as string) ?? '🎯',
    createdAt: toIsoString(hobbyDoc.createdAt),
    updatedAt: toIsoString(hobbyDoc.updatedAt),
  };
}

export function mapSession(id: string, sessionDoc: Record<string, unknown>): Session {
  return {
    id,
    userId: (sessionDoc.userId as string) ?? '',
    hobbyId: (sessionDoc.hobbyId as string) ?? '',
    date: (sessionDoc.date as string) ?? '',
    durationMinutes: (sessionDoc.durationMinutes as number) ?? 0,
    createdAt: toIsoString(sessionDoc.createdAt),
  };
}
