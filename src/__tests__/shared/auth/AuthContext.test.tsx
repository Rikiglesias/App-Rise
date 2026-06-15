import React from 'react';
import { Text, Share } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';

import { AuthProvider, useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';

jest.mock('@/shared/auth/supabaseClient', () => {
  const single = jest.fn(() => Promise.resolve({ data: null, error: null }));
  const order = jest.fn(() => Promise.resolve({ data: [], error: null }));
  const eqSelect = jest.fn(() => ({ single, order }));
  const select = jest.fn(() => ({ eq: eqSelect }));
  const eqUpdate = jest.fn(() => Promise.resolve({ error: null }));
  const update = jest.fn(() => ({ eq: eqUpdate }));
  const insert = jest.fn(() => Promise.resolve({ error: null }));
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
        updateUser: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        signUp: jest.fn(() =>
          Promise.resolve({ data: { user: { id: 'u1' } }, error: null })
        ),
      },
      from: jest.fn(() => ({ select, eq: eqSelect, single, update, insert })),
      functions: {
        invoke: jest.fn(() =>
          Promise.resolve({ data: { ok: true }, error: null })
        ),
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
    const spy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
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
    const updateMock = (
      supabase.from('profiles') as unknown as {
        update: jest.Mock;
      }
    ).update;
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

  it('setMarketingConsent: inserisce evento marketing + aggiorna la cache', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'u1' } } },
    });
    const api = supabase.from('consent_events') as unknown as {
      insert: jest.Mock;
      update: jest.Mock;
    };
    const { getByText } = renderAuth();
    await waitFor(() => getByText('authenticated'));
    await act(async () => {
      await getAuth().setMarketingConsent(true);
    });
    expect(api.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        purpose: 'marketing',
        action: 'granted',
        user_id: 'u1',
      })
    );
    expect(api.update).toHaveBeenCalledWith(
      expect.objectContaining({ marketing_consent: true })
    );
  });

  it('S12: deleteAccountNow su errore Edge ritorna l’errore e NON fa signOut', async () => {
    const { getByText } = renderAuth();
    await waitFor(() => getByText('unauthenticated'));
    (supabase.functions.invoke as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { message: 'boom' },
    });
    await act(async () => {
      const res = await getAuth().deleteAccountNow();
      expect(res.error).toBe('boom');
    });
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it('S12: scheduleDeletion su errore update ritorna l’errore', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'u1' } } },
    });
    const eqUpdate = (
      supabase.from('profiles') as unknown as { update: jest.Mock }
    ).update().eq as jest.Mock;
    eqUpdate.mockResolvedValueOnce({ error: { message: 'boom' } });
    const { getByText } = renderAuth();
    await waitFor(() => getByText('authenticated'));
    await act(async () => {
      const res = await getAuth().scheduleDeletion();
      expect(res.error).toBe('boom');
    });
  });

  it('S12: setMarketingConsent — errore insert evento → NON tocca la cache', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'u1' } } },
    });
    const api = supabase.from('consent_events') as unknown as {
      insert: jest.Mock;
    };
    const updateMock = (
      supabase.from('profiles') as unknown as { update: jest.Mock }
    ).update;
    const { getByText } = renderAuth();
    await waitFor(() => getByText('authenticated'));
    updateMock.mockClear();
    api.insert.mockResolvedValueOnce({ error: { message: 'ev-fail' } });
    await act(async () => {
      const res = await getAuth().setMarketingConsent(true);
      expect(res.error).toBe('ev-fail');
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('S12: setMarketingConsent — insert ok ma errore cache → ritorna l’errore cache', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'u1' } } },
    });
    const eqUpdate = (
      supabase.from('profiles') as unknown as { update: jest.Mock }
    ).update().eq as jest.Mock;
    eqUpdate.mockResolvedValueOnce({ error: { message: 'cache-fail' } });
    const { getByText } = renderAuth();
    await waitFor(() => getByText('authenticated'));
    await act(async () => {
      const res = await getAuth().setMarketingConsent(true);
      expect(res.error).toBe('cache-fail');
    });
  });

  it('S12: acceptCurrentPolicy ok → needsReConsent torna false', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'u1' } } },
    });
    const { getByText } = renderAuth();
    await waitFor(() => getByText('authenticated'));
    await act(async () => {
      const res = await getAuth().acceptCurrentPolicy();
      expect(res.error).toBeNull();
    });
    expect(getAuth().needsReConsent).toBe(false);
  });

  it('S12: acceptCurrentPolicy su errore recordConsent ritorna l’errore', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'u1' } } },
    });
    const api = supabase.from('consent_events') as unknown as {
      insert: jest.Mock;
    };
    const { getByText } = renderAuth();
    await waitFor(() => getByText('authenticated'));
    api.insert.mockResolvedValueOnce({ error: { message: 'rec-fail' } });
    await act(async () => {
      const res = await getAuth().acceptCurrentPolicy();
      expect(res.error).toBe('rec-fail');
    });
  });
});

describe('AuthContext — update/signup/consenso', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authRef = undefined;
  });

  it('updateProfile aggiorna SOLO i campi passati (whitelist, no upsert)', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'u1' } } },
    });
    const updateMock = (
      supabase.from('profiles') as unknown as {
        update: jest.Mock;
      }
    ).update;
    const { getByText } = renderAuth();
    await waitFor(() => getByText('authenticated'));
    await act(async () => {
      const res = await getAuth().updateProfile({ phone: '+393331112233' });
      expect(res.error).toBeNull();
    });
    expect(updateMock).toHaveBeenCalledWith({ phone: '+393331112233' });
    // whitelist: nessun altro campo (es. first_name) finisce nell'update
    expect(updateMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ first_name: expect.anything() })
    );
  });

  it('updateProfile senza campi non chiama update', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'u1' } } },
    });
    const updateMock = (
      supabase.from('profiles') as unknown as {
        update: jest.Mock;
      }
    ).update;
    const { getByText } = renderAuth();
    await waitFor(() => getByText('authenticated'));
    await act(async () => {
      const res = await getAuth().updateProfile({});
      expect(res.error).toBeNull();
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('updateEmail chiama auth.updateUser con la nuova email', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'u1', email: 'old@r.it' } } },
    });
    const { getByText } = renderAuth();
    await waitFor(() => getByText('authenticated'));
    await act(async () => {
      const res = await getAuth().updateEmail('new@r.it');
      expect(res.error).toBeNull();
    });
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      email: 'new@r.it',
    });
  });

  it('refreshProfile non lancia se la fetch del profilo fallisce', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'u1' } } },
    });
    const single = (
      supabase.from('profiles') as unknown as {
        select: () => { eq: () => { single: jest.Mock } };
      }
    )
      .select()
      .eq().single;
    single.mockResolvedValue({ data: null, error: { code: 'NETWORK' } });
    const { getByText } = renderAuth();
    await waitFor(() => getByText('authenticated'));
    await act(async () => {
      await expect(getAuth().refreshProfile()).resolves.toBeUndefined();
    });
    // ripristina il default (clearAllMocks NON resetta le implementazioni)
    single.mockResolvedValue({ data: null, error: null });
  });

  it('signUp passa i dati profilo via options.data e NON inserisce profiles client-side', async () => {
    const { getByText } = renderAuth();
    await waitFor(() => getByText('unauthenticated'));
    const insertMock = (
      supabase.from('profiles') as unknown as {
        insert: jest.Mock;
      }
    ).insert;
    await act(async () => {
      const res = await getAuth().signUp('a@b.it', 'password1', {
        first_name: 'Mario',
        last_name: 'Rossi',
        phone: '+393331234567',
        city: 'Roma',
        province: 'RM',
        birth_date: '1990-01-01',
        privacy_consent: true,
        marketing_consent: true,
      });
      expect(res.error).toBeNull();
    });
    expect(supabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'a@b.it',
        password: 'password1',
        options: {
          data: expect.objectContaining({
            first_name: 'Mario',
            birth_date: '1990-01-01',
            marketing_consent: true,
          }),
        },
      })
    );
    // Il profilo lo crea il trigger server-side: nessun insert client-side.
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('getConsentHistory ritorna null su errore di fetch (≠ [])', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'u1' } } },
    });
    const orderMock = (
      supabase.from('consent_events') as unknown as {
        select: () => { eq: () => { order: jest.Mock } };
      }
    )
      .select()
      .eq().order;
    orderMock.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const { getByText } = renderAuth();
    await waitFor(() => getByText('authenticated'));
    await act(async () => {
      const h = await getAuth().getConsentHistory();
      expect(h).toBeNull();
    });
    // ripristina il default (clearAllMocks non resetta le implementazioni)
    orderMock.mockResolvedValue({ data: [], error: null });
  });

  it("exportData apre il share-sheet quando c'è una sessione", async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: {
        session: { user: { id: 'u1', email: 'm@r.it', identities: [] } },
      },
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
