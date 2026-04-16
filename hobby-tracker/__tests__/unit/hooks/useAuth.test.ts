import { act, renderHook } from '@testing-library/react-native';

const mockOnAuthReady = jest.fn();

jest.mock('@/src/services/auth', () => ({
  onAuthReady: (...args: unknown[]) => mockOnAuthReady(...args),
}));

import { useAuth } from '@/src/hooks/useAuth';

describe('useAuth hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts loading then updates with authenticated user', () => {
    const unsubscribeMock = jest.fn();
    let callback: ((user: { uid: string } | null) => void) | undefined;

    mockOnAuthReady.mockImplementation(cb => {
      callback = cb;
      return unsubscribeMock;
    });

    const { result, unmount } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();

    act(() => {
      callback?.({ uid: 'hook-user' });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual({ uid: 'hook-user' });

    unmount();
    expect(unsubscribeMock).toHaveBeenCalled();
  });
});
