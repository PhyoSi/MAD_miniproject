jest.mock('firebase/auth', () => ({
  signInAnonymously: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('../../src/config/firebase', () => ({
  auth: { currentUser: null as { uid: string } | null },
}));

import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

import { onAuthReady, waitForAuth } from '@/src/services/auth';

describe('Auth integration flow', () => {
  const mockSignInAnonymously = signInAnonymously as jest.Mock;
  const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;
  const { auth: mockAuth } = jest.requireMock('../../src/config/firebase') as {
    auth: { currentUser: { uid: string } | null };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.currentUser = null;
  });

  it('waitForAuth signs in anonymously then resolves when user appears', async () => {
    const unsubscribeMock = jest.fn();
    let listener: ((user: { uid: string } | null) => void) | undefined;

    mockSignInAnonymously.mockResolvedValue({ user: { uid: 'auth-user' } });
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      listener = cb;
      return unsubscribeMock;
    });

    const authPromise = waitForAuth();

    listener?.(null);
    await Promise.resolve();
    expect(mockSignInAnonymously).toHaveBeenCalledWith(mockAuth);

    const signedInUser = { uid: 'auth-user' };
    listener?.(signedInUser);

    await expect(authPromise).resolves.toEqual(signedInUser);
    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('onAuthReady provides an end-to-end auth subscription', () => {
    const unsubscribeMock = jest.fn();
    mockOnAuthStateChanged.mockReturnValue(unsubscribeMock);

    const callback = jest.fn();
    const unsubscribe = onAuthReady(callback);

    expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuth, callback);
    expect(unsubscribe).toBe(unsubscribeMock);
  });
});
