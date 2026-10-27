import React from 'react';
import { Text } from 'react-native';
import { render, waitFor, act } from '@testing-library/react-native';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import { AuthProvider, useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';

// Cancellazione riuscita ma uscita locale fallita: la libreria salta la rimozione
// della sessione (GoTrueClient `_signOut`), quindi nessun SIGNED_OUT arriverà mai.
// Tocca all'app tornare ospite. Che la sessione si tolga dallo storage, con la
// chiave che la libreria usa davvero, lo prova `sessioneToltaDalloStorage.test.ts`.
const mockProfileSingle = jest.fn();
const mockRimuovi = jest.fn();
jest.mock('@/shared/auth/supabaseClient', () => {
  const eq = jest.fn(() => ({
    single: () => mockProfileSingle(),
    order: jest.fn(() => Promise.resolve({ data: [], error: null })),
  }));
  const select = jest.fn(() => ({ eq }));
  return {
    rimuoviSessioneSalvata: () => mockRimuovi(),
    supabase: {
      auth: {
        getSession: jest.fn(),
        onAuthStateChange: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({ select, eq })),
      functions: { invoke: jest.fn() },
    },
  };
});
const auth = supabase.auth as unknown as {
  getSession: jest.Mock;
  onAuthStateChange: jest.Mock;
  signOut: jest.Mock;
};
const invoke = supabase.functions.invoke as jest.Mock;

const sessioneA = {
  access_token: 'token-a',
  user: { id: 'A', email: 'a@r.it' },
} as unknown as Session;
const profiloA = { id: 'A', first_name: 'Anna', last_name: 'Rossi' };

let emetti: (evento: AuthChangeEvent, s: Session | null) => void = () =>
  undefined;
let authRef: AuthState | undefined;
const Capture: React.FC = () => {
  authRef = useAuth();
  return (
    <Text>
      {`${authRef.status}|${authRef.session?.user.id ?? '-'}|${authRef.profile?.first_name ?? '-'}`}
    </Text>
  );
};
const montaConA = async () => {
  const schermo = render(
    <AuthProvider>
      <Capture />
    </AuthProvider>
  );
  await waitFor(() => schermo.getByText('authenticated|A|Anna'));
  return schermo;
};
const eliminaConUscitaFallita = async () => {
  await act(async () => {
    const esito = await authRef?.deleteAccountNow();
    expect(esito?.error).toBeNull();
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  authRef = undefined;
  auth.getSession.mockResolvedValue({ data: { session: sessioneA } });
  auth.onAuthStateChange.mockImplementation(cb => {
    emetti = cb;
    return { data: { subscription: { unsubscribe: jest.fn() } } };
  });
  auth.signOut.mockResolvedValue({
    error: {
      name: 'AuthRetryableFetchError',
      message: 'Network request failed',
    },
  });
  invoke.mockResolvedValue({ data: { ok: true }, error: null });
  mockRimuovi.mockResolvedValue(undefined);
  mockProfileSingle.mockResolvedValue({ data: profiloA, error: null });
});

it("cancellazione riuscita e uscita fallita: l'app torna ospite", async () => {
  const { getByText, queryByText } = await montaConA();

  await eliminaConUscitaFallita();

  expect(getByText('unauthenticated|-|-')).toBeTruthy();
  expect(queryByText(/Anna/)).toBeNull();
});

it("rimozione dallo storage fallita: l'app resta ospite in questo avvio", async () => {
  mockRimuovi.mockRejectedValue(new Error('SecureStore unavailable'));
  const { getByText } = await montaConA();

  await eliminaConUscitaFallita();
  // La sessione rimasta nello storage continua a vivere nel client: un suo rinnovo
  // non deve riportare dentro l'account appena eliminato.
  await act(async () => {
    emetti('TOKEN_REFRESHED', sessioneA);
    await Promise.resolve();
  });

  expect(getByText('unauthenticated|-|-')).toBeTruthy();
});

it('riavvio senza rete dopo cancellazione: nessun dato del profilo', async () => {
  // Al riavvio la sessione dell'account eliminato è ancora nello storage e la rete
  // non c'è: il profilo non è salvato sul telefono, quindi non c'è niente da mostrare.
  // postgrest-js non rigetta sulla rete che manca: restituisce l'errore.
  mockProfileSingle.mockResolvedValue({
    data: null,
    error: { message: 'TypeError: Network request failed', code: '' },
  });
  const { getByText, queryByText } = render(
    <AuthProvider>
      <Capture />
    </AuthProvider>
  );

  await waitFor(() => getByText('authenticated|A|-'));
  await act(async () => {
    await Promise.resolve();
  });
  expect(queryByText(/Anna/)).toBeNull();
  expect(authRef?.profile).toBeNull();
});
