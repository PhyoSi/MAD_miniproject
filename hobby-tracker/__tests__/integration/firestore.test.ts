jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  arrayRemove: jest.fn(),
  arrayUnion: jest.fn(),
  collection: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  limit: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
  serverTimestamp: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  where: jest.fn(),
  writeBatch: jest.fn(),
}));

jest.mock('../../src/config/firebase', () => ({
  db: 'db-instance',
}));

jest.mock('@/src/services/auth', () => ({
  waitForAuth: jest.fn(),
}));

import * as Firestore from 'firebase/firestore';

import * as HobbyAPI from '@/src/services/hobbyApi';
import { waitForAuth } from '@/src/services/auth';

describe('Firestore integration flow', () => {
  const mockFirestore = Firestore as unknown as Record<string, jest.Mock>;
  const mockWaitForAuth = waitForAuth as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockWaitForAuth.mockResolvedValue({ uid: 'integration-user' });

    mockFirestore.serverTimestamp.mockReturnValue('server-ts');
    mockFirestore.arrayUnion.mockImplementation((value: string) => ({ op: 'arrayUnion', value }));

    mockFirestore.collection.mockImplementation((_db, name) => `${String(name)}-collection`);
    mockFirestore.where.mockImplementation((field, op, value) => ({ field, op, value }));
    mockFirestore.orderBy.mockImplementation((field, direction) => ({ field, direction }));
    mockFirestore.limit.mockImplementation((value: number) => ({ limit: value }));
    mockFirestore.query.mockImplementation((...parts) => parts);
    mockFirestore.doc.mockImplementation((collectionName, id) => `${String(collectionName)}/${String(id)}`);
  });

  it('writes a hobby and reads recent sessions with hobby metadata', async () => {
    mockFirestore.addDoc.mockResolvedValue({ id: 'hobby-1' });
    mockFirestore.getDoc.mockResolvedValueOnce({
      id: 'hobby-1',
      data: () => ({
        userId: 'integration-user',
        name: 'Guitar',
        icon: '🎸',
        createdAt: '2026-04-16T00:00:00.000Z',
        updatedAt: '2026-04-16T00:00:00.000Z',
      }),
    });

    mockFirestore.getDocs
      .mockResolvedValueOnce({
        docs: [
          {
            id: 'hobby-1',
            data: () => ({
              userId: 'integration-user',
              name: 'Guitar',
              icon: '🎸',
              createdAt: '2026-04-16T00:00:00.000Z',
              updatedAt: '2026-04-16T00:00:00.000Z',
            }),
          },
        ],
      })
      .mockResolvedValueOnce({
        docs: [
          {
            id: 'session-1',
            data: () => ({
              userId: 'integration-user',
              hobbyId: 'hobby-1',
              date: '2026-04-16',
              durationMinutes: 45,
              createdAt: '2026-04-16T00:00:00.000Z',
            }),
          },
        ],
      });

    const createdHobby = await HobbyAPI.createHobby('unused', 'Guitar', '🎸');

    expect(mockFirestore.addDoc).toHaveBeenCalledTimes(1);
    expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
      expect.stringContaining('/integration-user'),
      {
        hobbies: { op: 'arrayUnion', value: 'hobby-1' },
      }
    );
    expect(createdHobby.name).toBe('Guitar');

    const sessions = await HobbyAPI.getRecentSessions('unused', 36500);

    expect(sessions).toEqual([
      {
        id: 'session-1',
        userId: 'integration-user',
        hobbyId: 'hobby-1',
        date: '2026-04-16',
        durationMinutes: 45,
        createdAt: '2026-04-16T00:00:00.000Z',
        hobbyName: 'Guitar',
        hobbyIcon: '🎸',
      },
    ]);
  });
});
