export interface User {
  user_id: string;
  name: string;
  location: string;
  created_at: string;
  hobbies: string[];
}

export interface Hobby {
  id: string;
  userId: string;
  name: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  totalHours?: number;
  totalSessions?: number;
  currentStreak?: number;
  longestStreak?: number;
}

export interface Session {
  id: string;
  userId: string;
  hobbyId: string;
  date: string;
  durationMinutes: number;
  createdAt: string;
}

export interface SessionWithHobby extends Session {
  hobbyName: string;
  hobbyIcon: string;
}

export interface StatsSummary {
  totalHobbies: number;
  totalHours: number;
  totalSessions: number;
  mostPracticedHobby: {
    id: string;
    name: string;
    icon: string;
    hours: number;
  } | null;
}

export interface HobbyStats {
  totalHours: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
}
