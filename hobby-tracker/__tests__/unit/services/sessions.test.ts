const mockAddDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockServerTimestamp = jest.fn(() => 'server-ts');

const mockResolveTargetUserId = jest.fn();
const mockWaitForAuth = jest.fn();

jest.mock('firebase/firestore', () => ({
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  getDocs: jest.fn(),
  limit: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
  serverTimestamp: () => mockServerTimestamp(),
  where: jest.fn(),
}));

jest.mock('@/src/services/hobbyApi.shared', () => ({
  resolveTargetUserId: () => mockResolveTargetUserId(),
  sessionsCollection: 'sessions-collection',
}));

jest.mock('@/src/services/hobbyApi.hobby', () => ({
  getUserHobbies: jest.fn(),
}));

jest.mock('@/src/services/auth', () => ({
  waitForAuth: () => mockWaitForAuth(),
}));

import { createSession, deleteSession } from '@/src/services/hobbyApi.session';

describe('session service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolveTargetUserId.mockResolvedValue('user-123');
    mockWaitForAuth.mockResolvedValue({ uid: 'user-123' });
    mockDoc.mockImplementation((_collection: unknown, id: string) => ({ id }));
  });

  it('createSession (addSession) writes and returns mapped session', async () => {
    mockAddDoc.mockResolvedValue({ id: 'session-1' });
    mockGetDoc.mockResolvedValue({
      id: 'session-1',
      data: () => ({
        userId: 'user-123',
        hobbyId: 'hobby-1',
        date: '2026-04-16',
        durationMinutes: 30,
        createdAt: '2026-04-16T00:00:00.000Z',
      }),
    });

    const session = await createSession('ignored-user', 'hobby-1', '2026-04-16', 30);

    expect(mockAddDoc).toHaveBeenCalledWith('sessions-collection', {
      userId: 'user-123',
      hobbyId: 'hobby-1',
      date: '2026-04-16',
      durationMinutes: 30,
      createdAt: 'server-ts',
    });
    expect(session).toEqual({
      id: 'session-1',
      userId: 'user-123',
      hobbyId: 'hobby-1',
      date: '2026-04-16',
      durationMinutes: 30,
      createdAt: '2026-04-16T00:00:00.000Z',
    });
  });

  it('deleteSession waits for auth and deletes the target session doc', async () => {
    mockDoc.mockImplementation((collectionRef: unknown, id: string) => `${String(collectionRef)}:${id}`);

    await deleteSession('session-77');

    expect(mockWaitForAuth).toHaveBeenCalledTimes(1);
    expect(mockDeleteDoc).toHaveBeenCalledWith('sessions-collection:session-77');
  });
});
