import React from 'react';
import { Text, Share } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';

import { AuthProvider, useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';

jest.mock('@/shared/auth/supabaseClient', () => {
  const single = jest.fn(() => Promise.resolve({ data: null, error: null }));
  const eqSelect = jest.fn(() => ({ single }));
  const select = jest.fn(() => ({ eq: eqSelect }));
  const eqUpdate = jest.fn(() => Promise.resolve({ error: null }));
  const update = jest.fn(() => ({ eq: eqUpdate }));
  return {
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
      from: jest.fn(() => ({ select, eq: eqSelect, single, update })),
      functions: {
        invoke: jest.fn(() => Promise.resolve({ data: { ok: true }, error: null })),
      },
    },
  };
});

let authRef: AuthState | undefined;
const Capture: React.FC = () => {
  authRef = useAuth();
  return <Text>{authRef.status}</Text>;
};
const getAuth = (): AuthState => {
  if (!authRef) throw new Error('authRef non inizializzato');
  return authRef;
};

const renderAuth = () =>
  render(
    <AuthProvider>
      <Capture />
    </AuthProvider>
  );

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authRef = undefined;
  });

  it('parte in loading e passa a unauthenticated senza sessione', async () => {
    const { getByText } = renderAuth();
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

  it('deleteAccountNow invoca la Edge Function e fa signOut', async () => {
    const { getByText } = renderAuth();
    await waitFor(() => getByText('unauthenticated'));
    await act(async () => {
      const res = await getAuth().deleteAccountNow();
      expect(res.error).toBeNull();
    });
    expect(supabase.functions.invoke).toHaveBeenCalledWith('delete-account', {
      body: {},
    });
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('deleteAccountNow inoltra appleAuthCode alla Edge Function', async () => {
    const { getByText } = renderAuth();
    await waitFor(() => getByText('unauthenticated'));
    await act(async () => {
      await getAuth().deleteAccountNow('apple-code-123');
    });
    expect(supabase.functions.invoke).toHaveBeenCalledWith('delete-account', {
      body: { appleAuthCode: 'apple-code-123' },
    });
  });

  it('scheduleDeletion imposta deletion_requested_at; cancel lo azzera', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'u1', email: 'm@r.it' } } },
    });
    const updateMock = (supabase.from('profiles') as unknown as {
      update: jest.Mock;
    }).update;
    const { getByText } = renderAuth();
    await waitFor(() => getByText('authenticated'));

    await act(async () => {
      await getAuth().scheduleDeletion();
    });
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ deletion_requested_at: expect.any(String) })
    );

    await act(async () => {
      await getAuth().cancelScheduledDeletion();
    });
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ deletion_requested_at: null })
    );
  });

  it('exportData apre il share-sheet quando c\'è una sessione', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'u1', email: 'm@r.it', identities: [] } } },
    });
    const spy = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: 'sharedAction' } as never);
    const { getByText } = renderAuth();
    await waitFor(() => getByText('authenticated'));
    await act(async () => {
      await getAuth().exportData();
    });
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
