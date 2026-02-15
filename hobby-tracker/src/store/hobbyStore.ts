import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

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

export const useHobbyStore = create<HobbyStore>((set, get) => ({
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
    try {
      set({ isLoading: true, error: null });
      const user = await HobbyAPI.createUser(name);
      await AsyncStorage.setItem(USER_ID_KEY, user.user_id);
      set({ user, userId: user.user_id, isLoading: false });
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      set({ error: 'Failed to create user.', isLoading: false });
      throw error;
    }
  },

  loadHobbies: async () => {
    const userId = get().userId;
    if (!userId) return;
    try {
      set({ isLoading: true, error: null });
      const hobbies = await HobbyAPI.getUserHobbies(userId);
      set({ hobbies, isLoading: false });
    } catch (error) {
      console.error('Error loading hobbies:', error);
      set({ error: 'Failed to load hobbies.', isLoading: false });
    }
  },

  addHobby: async (name: string, icon: string) => {
    const userId = get().userId;
    if (!userId) throw new Error('Missing user');
    try {
      set({ isLoading: true, error: null });
      const hobby = await HobbyAPI.createHobby(userId, name, icon);
      set(state => ({ hobbies: [hobby, ...state.hobbies], isLoading: false }));
      return hobby;
    } catch (error) {
      console.error('Error adding hobby:', error);
      set({ error: 'Failed to add hobby.', isLoading: false });
      throw error;
    }
  },

  deleteHobby: async (hobbyId: string) => {
    const userId = get().userId;
    if (!userId) return;
    try {
      set({ isLoading: true, error: null });
      await HobbyAPI.deleteHobby(hobbyId, userId);
      set(state => ({ hobbies: state.hobbies.filter(hobby => hobby.id !== hobbyId), isLoading: false }));
    } catch (error) {
      console.error('Error deleting hobby:', error);
      set({ error: 'Failed to delete hobby.', isLoading: false });
      throw error;
    }
  },

  loadRecentSessions: async (days = 30) => {
    const userId = get().userId;
    if (!userId) return;
    try {
      set({ isLoading: true, error: null });
      const sessions = await HobbyAPI.getRecentSessions(userId, days);
      set({ sessions, isLoading: false });
    } catch (error) {
      console.error('Error loading sessions:', error);
      set({ error: 'Failed to load sessions.', isLoading: false });
    }
  },

  addSession: async (hobbyId: string, date: string, durationMinutes: number) => {
    const userId = get().userId;
    if (!userId) throw new Error('Missing user');
    try {
      set({ isLoading: true, error: null });
      await HobbyAPI.createSession(userId, hobbyId, date, durationMinutes);
      set({ isLoading: false });
    } catch (error) {
      console.error('Error adding session:', error);
      set({ error: 'Failed to add session.', isLoading: false });
      throw error;
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      set({ isLoading: true, error: null });
      await HobbyAPI.deleteSession(sessionId);
      set(state => ({ sessions: state.sessions.filter(session => session.id !== sessionId), isLoading: false }));
    } catch (error) {
      console.error('Error deleting session:', error);
      set({ error: 'Failed to delete session.', isLoading: false });
      throw error;
    }
  },

  loadStats: async () => {
    const userId = get().userId;
    if (!userId) return;
    try {
      set({ isLoading: true, error: null });
      const stats = await HobbyAPI.getStatsSummary(userId);
      set({ stats, isLoading: false });
    } catch (error) {
      console.error('Error loading stats:', error);
      set({ error: 'Failed to load stats.', isLoading: false });
    }
  },
}));
