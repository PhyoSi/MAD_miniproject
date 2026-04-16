jest.mock('firebase/auth', () => ({
  signInAnonymously: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('../../../src/config/firebase', () => ({
  auth: { currentUser: null as { uid: string } | null },
}));

import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

import { onAuthReady, signInAnon, waitForAuth } from '@/src/services/auth';

describe('auth service', () => {
  const mockSignInAnonymously = signInAnonymously as jest.Mock;
  const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;
  const { auth: mockAuth } = jest.requireMock('../../../src/config/firebase') as {
    auth: { currentUser: { uid: string } | null };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.currentUser = null;
  });

  it('signInAnon resolves immediately when user already exists', async () => {
    mockAuth.currentUser = { uid: 'existing-user' };

    await signInAnon();

    expect(mockSignInAnonymously).not.toHaveBeenCalled();
  });

  it('signInAnon deduplicates concurrent requests', async () => {
    let resolveSignIn: ((value?: void | PromiseLike<void>) => void) | undefined;
    mockSignInAnonymously.mockReturnValue(
      new Promise<void>(resolve => {
        resolveSignIn = resolve;
      })
    );

    const p1 = signInAnon();
    const p2 = signInAnon();

    expect(mockSignInAnonymously).toHaveBeenCalledTimes(1);

    if (!resolveSignIn) {
      throw new Error('Expected resolveSignIn to be assigned');
    }
    resolveSignIn();
    await Promise.all([p1, p2]);
  });

  it('waitForAuth resolves with current user if already authenticated', async () => {
    mockAuth.currentUser = { uid: 'ready-user' };

    await expect(waitForAuth()).resolves.toEqual({ uid: 'ready-user' });
    expect(mockOnAuthStateChanged).not.toHaveBeenCalled();
  });

  it('waitForAuth resolves when auth listener receives a user', async () => {
    const unsubscribeMock = jest.fn();
    let listener: ((user: { uid: string } | null) => void) | undefined;

    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      listener = cb;
      return unsubscribeMock;
    });

    const authPromise = waitForAuth();
    listener?.({ uid: 'listener-user' });

    await expect(authPromise).resolves.toEqual({ uid: 'listener-user' });
    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('waitForAuth rejects when anonymous sign-in fails', async () => {
    const unsubscribeMock = jest.fn();

    mockSignInAnonymously.mockRejectedValue(new Error('sign-in failed'));
    mockOnAuthStateChanged.mockImplementation((_auth, cb) => {
      cb(null);
      return unsubscribeMock;
    });

    await expect(waitForAuth()).rejects.toThrow('sign-in failed');
    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('onAuthReady forwards callback to firebase auth listener', () => {
    const unsubscribeMock = jest.fn();
    mockOnAuthStateChanged.mockReturnValue(unsubscribeMock);

    const callback = jest.fn();
    const unsubscribe = onAuthReady(callback);

    expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuth, callback);
    expect(unsubscribe).toBe(unsubscribeMock);
  });
});
