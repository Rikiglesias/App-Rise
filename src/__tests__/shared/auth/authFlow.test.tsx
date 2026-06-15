import React, { useCallback } from 'react';
import { Text } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

let mockAuthCallback: ((event: string, session: unknown) => void) | null = null;
const mockSession = { user: { id: 'u1', email: 'mario@rossi.it' } };
const mockProfile = {
  id: 'u1',
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  birth_date: '2000-01-01',
  privacy_consent_at: '2026-06-15T00:00:00Z',
  marketing_consent: false,
};

jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: jest.fn((cb: (e: string, s: unknown) => void) => {
        mockAuthCallback = cb;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
      signInWithPassword: jest.fn(() => {
        mockAuthCallback?.('SIGNED_IN', mockSession);
        return Promise.resolve({ data: { session: mockSession }, error: null });
      }),
      signOut: jest.fn(() => {
        mockAuthCallback?.('SIGNED_OUT', null);
        return Promise.resolve({ error: null });
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: mockProfile, error: null })),
    })),
  },
}));

// eslint-disable-next-line import/first
import { AuthProvider, useAuth } from '@/shared/auth/AuthContext';

const Probe: React.FC = () => {
  const { status, profile, signIn, signOut } = useAuth();
  const doSignIn = useCallback(() => {
    void signIn('mario@rossi.it', 'abcd1234');
  }, [signIn]);
  const doSignOut = useCallback(() => {
    void signOut();
  }, [signOut]);
  return (
    <>
      <Text testID="status">{status}</Text>
      <Text testID="name">{profile?.first_name ?? '-'}</Text>
      <Text testID="signin" onPress={doSignIn}>
        signin
      </Text>
      <Text testID="signout" onPress={doSignOut}>
        signout
      </Text>
    </>
  );
};

describe('Auth flow integration', () => {
  it('signIn porta a authenticated + profilo; signOut torna a unauthenticated', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await waitFor(() =>
      expect(getByTestId('status').props.children).toBe('unauthenticated')
    );

    fireEvent.press(getByTestId('signin'));
    await waitFor(() =>
      expect(getByTestId('status').props.children).toBe('authenticated')
    );
    await waitFor(() =>
      expect(getByTestId('name').props.children).toBe('Mario')
    );

    fireEvent.press(getByTestId('signout'));
    await waitFor(() =>
      expect(getByTestId('status').props.children).toBe('unauthenticated')
    );
  });
});
