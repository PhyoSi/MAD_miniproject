import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { DEFAULT_RECENT_DAYS } from '@/src/constants/app';
import * as HobbyAPI from '@/src/services/hobbyApi';
import type { Hobby, SessionWithHobby, StatsSummary, User } from '@/src/types';

const USER_ID_KEY = 'hobbyit.userId';

interface HobbyStore {
  user: User | null;
  userId: string | null;
  hobbies: Hobby[];
  sessions: SessionWithHobby[];
  stats: StatsSummary | null;
  isLoading: boolean;
  error: string | null;

  setUser: (user: User) => void;
  loadUserId: () => Promise<string | null>;
  createUser: (name: string) => Promise<User>;

  loadHobbies: () => Promise<void>;
  addHobby: (name: string, icon: string) => Promise<Hobby>;
  deleteHobby: (hobbyId: string) => Promise<void>;

  loadRecentSessions: (days?: number) => Promise<void>;
  addSession: (hobbyId: string, date: string, durationMinutes: number) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;

  loadStats: () => Promise<void>;
}

export const useHobbyStore = create<HobbyStore>((set, get) => {
  const runStoreAction = async <T>(
    contextLabel: string,
    errorMessage: string,
    action: () => Promise<T>,
    shouldRethrow = false
  ): Promise<T | undefined> => {
    try {
      set({ isLoading: true, error: null });
      const result = await action();
      set({ isLoading: false });
      return result;
    } catch (error) {
      console.error(`${contextLabel}:`, error);
      set({ error: errorMessage, isLoading: false });
      if (shouldRethrow) {
        throw error;
      }
      return undefined;
    }
  };

  return {
    user: null,
    userId: null,
    hobbies: [],
    sessions: [],
    stats: null,
    isLoading: false,
    error: null,

    setUser: (user: User) => set({ user, userId: user.user_id }),

    loadUserId: async () => {
      const storedId = await AsyncStorage.getItem(USER_ID_KEY);
      set({ userId: storedId });
      return storedId;
    },

    createUser: async (name: string) => {
      const createdUser = await runStoreAction(
        'Error creating user',
        'Failed to create user.',
        async () => {
          const nextUser = await HobbyAPI.createUser(name);
          await AsyncStorage.setItem(USER_ID_KEY, nextUser.user_id);
          set({ user: nextUser, userId: nextUser.user_id });
          return nextUser;
        },
        true
      );

      if (!createdUser) {
        throw new Error('Failed to create user.');
      }

      return createdUser;
    },

    loadHobbies: async () => {
      const userId = get().userId;
      if (!userId) return;

      await runStoreAction('Error loading hobbies', 'Failed to load hobbies.', async () => {
        const hobbies = await HobbyAPI.getUserHobbies(userId);
        set({ hobbies });
      });
    },

    addHobby: async (name: string, icon: string) => {
      const userId = get().userId;
      if (!userId) throw new Error('Missing user');

      const createdHobby = await runStoreAction(
        'Error adding hobby',
        'Failed to add hobby.',
        async () => {
          const nextHobby = await HobbyAPI.createHobby(userId, name, icon);
          set(state => ({ hobbies: [nextHobby, ...state.hobbies] }));
          return nextHobby;
        },
        true
      );

      if (!createdHobby) {
        throw new Error('Failed to add hobby.');
      }

      return createdHobby;
    },

    deleteHobby: async (hobbyId: string) => {
      const userId = get().userId;
      if (!userId) return;

      await runStoreAction(
        'Error deleting hobby',
        'Failed to delete hobby.',
        async () => {
          await HobbyAPI.deleteHobby(hobbyId, userId);
          set(state => ({ hobbies: state.hobbies.filter(hobby => hobby.id !== hobbyId) }));
        },
        true
      );
    },

    loadRecentSessions: async (days = DEFAULT_RECENT_DAYS) => {
      const userId = get().userId;
      if (!userId) return;

      await runStoreAction('Error loading sessions', 'Failed to load sessions.', async () => {
        const sessions = await HobbyAPI.getRecentSessions(userId, days);
        set({ sessions });
      });
    },

    addSession: async (hobbyId: string, date: string, durationMinutes: number) => {
      const userId = get().userId;
      if (!userId) throw new Error('Missing user');

      await runStoreAction(
        'Error adding session',
        'Failed to add session.',
        async () => {
          await HobbyAPI.createSession(userId, hobbyId, date, durationMinutes);
        },
        true
      );
    },

    deleteSession: async (sessionId: string) => {
      await runStoreAction(
        'Error deleting session',
        'Failed to delete session.',
        async () => {
          await HobbyAPI.deleteSession(sessionId);
          set(state => ({ sessions: state.sessions.filter(session => session.id !== sessionId) }));
        },
        true
      );
    },

    loadStats: async () => {
      const userId = get().userId;
      if (!userId) return;

      await runStoreAction('Error loading stats', 'Failed to load stats.', async () => {
        const stats = await HobbyAPI.getStatsSummary(userId);
        set({ stats });
      });
    },
  };
});
