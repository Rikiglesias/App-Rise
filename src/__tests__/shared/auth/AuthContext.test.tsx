import React from 'react';
import { Text } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';

import { AuthProvider, useAuth } from '@/shared/auth/AuthContext';

jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithPassword: jest.fn(() =>
        Promise.resolve({ data: { session: {} }, error: null })
      ),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));

const Probe: React.FC = () => {
  const { status } = useAuth();
  return <Text>{status}</Text>;
};

describe('AuthContext', () => {
  it('parte in loading e passa a unauthenticated senza sessione', async () => {
    const { getByText } = render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await waitFor(() => getByText('unauthenticated'));
  });

  it('useAuth fuori dal provider lancia', () => {
    const Orphan: React.FC = () => {
      useAuth();
      return null;
    };
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Orphan />)).toThrow(
      'useAuth must be used within AuthProvider'
    );
    spy.mockRestore();
  });
});
