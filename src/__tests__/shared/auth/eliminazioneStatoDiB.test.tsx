// A elimina l'account; durante l'attesa arriva l'accesso di B (link aperto sul telefono).
// Se il client non sa dire chi è collegato (lettura vuota), la cancellazione procede come
// per l'account eliminato e segnala «sessione ancora sul dispositivo»: lo stato dell'app
// però è già di B e non va azzerato (giro 2 del delta, f2-1). File NUOVO (R27).
import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';

import { AuthProvider, useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';

type Ascoltatore = (evento: string, sessione: unknown) => void;

jest.mock('@/shared/auth/supabaseClient', () => {
  const single = jest.fn(() => Promise.resolve({ data: null, error: null }));
  const order = jest.fn(() => Promise.resolve({ data: [], error: null }));
  const eqSelect = jest.fn(() => ({ single, order }));
  const select = jest.fn(() => ({ eq: eqSelect }));
  return {
    rimuoviSessioneSalvata: jest.fn(() => Promise.resolve()),
    supabase: {
      auth: {
        getSession: jest.fn(() =>
          Promise.resolve({ data: { session: null }, error: null })
        ),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        })),
        signOut: jest.fn(() =>
          Promise.resolve({ error: { message: 'network down' } })
        ),
      },
      from: jest.fn(() => ({ select, eq: eqSelect, single })),
      functions: { invoke: jest.fn() },
    },
  };
});

const sessioneDi = (id: string) => ({ user: { id, email: `${id}@r.it` } });

let authRef: AuthState | undefined;
const Capture: React.FC = () => {
  authRef = useAuth();
  return <Text>{authRef.status}</Text>;
};

it('cancellazione di A con B entrato nell’attesa: l’app resta su B, non torna ospite', async () => {
  const { getByText } = render(
    <AuthProvider>
      <Capture />
    </AuthProvider>
  );
  await waitFor(() => getByText('unauthenticated'));
  const ascolta = (supabase.auth.onAuthStateChange as jest.Mock).mock
    .calls[0]?.[0] as Ascoltatore;
  act(() => ascolta('SIGNED_IN', sessioneDi('A')));
  await waitFor(() => getByText('authenticated'));

  // Al via la sessione è di A, col suo token: la cancellazione parte con quello.
  (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
    data: { session: { ...sessioneDi('A'), access_token: 'token-A' } },
    error: null,
  });
  (supabase.functions.invoke as jest.Mock).mockImplementationOnce(() => {
    ascolta('SIGNED_IN', sessioneDi('B'));
    return Promise.resolve({ data: { ok: true }, error: null });
  });
  await act(async () => {
    const esito = await authRef?.deleteAccountNow();
    expect(esito?.error).toBeNull();
  });

  expect(authRef?.status).toBe('authenticated');
  expect(authRef?.session?.user.id).toBe('B');
});
