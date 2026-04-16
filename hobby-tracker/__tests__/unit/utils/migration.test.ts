const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockQuery = jest.fn();
const mockUpdateDoc = jest.fn();
const mockWhere = jest.fn();

const mockWaitForAuth = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  doc: (...args: unknown[]) => mockDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  where: (...args: unknown[]) => mockWhere(...args),
}));

jest.mock('@/src/config/firebase', () => ({
  db: 'db-instance',
}));

jest.mock('@/src/services/auth', () => ({
  waitForAuth: () => mockWaitForAuth(),
}));

import { backfillAuthorId } from '@/src/utils/migration';

describe('backfillAuthorId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWaitForAuth.mockResolvedValue({ uid: 'user-42' });
    mockCollection.mockImplementation((_db: unknown, name: string) => `${String(name)}-collection`);
    mockWhere.mockImplementation((field: string, op: string, value: string) => ({ field, op, value }));
    mockQuery.mockImplementation((...parts: unknown[]) => parts);
    mockDoc.mockImplementation((_db: unknown, collectionName: string, id: string) => `${String(collectionName)}/${String(id)}`);
  });

  it('updates only legacy session docs that are missing authorId', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ userId: 'user-42' }) },
        { id: 's2', data: () => ({ userId: 'user-42', authorId: 'user-42' }) },
      ],
    });

    await backfillAuthorId();

    expect(mockGetDocs).toHaveBeenCalledTimes(1);
    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    expect(mockUpdateDoc).toHaveBeenCalledWith('sessions/s1', { authorId: 'user-42' });
  });

  it('does nothing when no legacy docs need migration', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [{ id: 's2', data: () => ({ userId: 'user-42', authorId: 'user-42' }) }],
    });

    await backfillAuthorId();

    expect(mockUpdateDoc).not.toHaveBeenCalled();
  });
});
