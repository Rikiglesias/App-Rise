// C91 (giro valido del delta 1, abc-2, f2-2, g-1, arch-1): l'accettazione di A che torna quando
// è già entrato B non dice niente su B. Non deve segnarlo consenziente, né far scartare la
// lettura che avrebbe scoperto che il suo consenso manca. File NUOVO (R27).
import React from 'react';
import { Text } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';

import { AuthProvider, useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';

type Storia = { data: unknown[]; error: null };
const mockStorie: ((r: Storia) => void)[] = [];
let mockFinisciAccettazione: (r: { error: null }) => void = () => {};
let mockCambioSessione: (evento: string, sessione: unknown) => void = () => {};

jest.mock('@/shared/auth/supabaseClient', () => {
  const profili = {
    select: () => ({
      eq: () => ({
        single: () =>
          Promise.resolve({
            data: null,
            error: { code: 'PGRST116', message: 'no rows' },
          }),
      }),
    }),
  };
  const consensi = {
    select: () => ({
      eq: () => ({
        order: () =>
          new Promise(resolve => {
            mockStorie.push(resolve);
          }),
      }),
    }),
    insert: () =>
      new Promise(resolve => {
        mockFinisciAccettazione = resolve;
      }),
  };
  const versioni = {
    select: () => ({
      eq: () => ({
        single: () =>
          Promise.resolve({ data: { is_material: true }, error: null }),
      }),
    }),
  };
  return {
    supabase: {
      auth: {
        getSession: jest.fn(() =>
          Promise.resolve({
            data: { session: { user: { id: 'A', email: 'a@r.it' } } },
            error: null,
          })
        ),
        onAuthStateChange: jest.fn(cb => {
          mockCambioSessione = cb;
          return { data: { subscription: { unsubscribe: jest.fn() } } };
        }),
      },
      from: (tabella: string) =>
        tabella === 'profiles'
          ? profili
          : tabella === 'consent_events'
            ? consensi
            : versioni,
    },
  };
});

const giriDiPromesse = async () => {
  for (let giro = 0; giro < 20; giro += 1) await Promise.resolve();
};

let authRef: AuthState | undefined;
const Capture: React.FC = () => {
  authRef = useAuth();
  return <Text>{authRef.status}</Text>;
};
const auth = (): AuthState => {
  if (!authRef) throw new Error('authRef non inizializzato');
  return authRef;
};

const rispondiStoria = (indice: number) =>
  act(async () => {
    mockStorie[indice]?.({ data: [], error: null });
    await giriDiPromesse();
  });

/** A è nel cancello del riconsenso e tocca «Accetto»: la scrittura resta in rete. */
const accettazioneDiAInCorso = async () => {
  render(
    <AuthProvider>
      <Capture />
    </AuthProvider>
  );
  await waitFor(() => expect(mockStorie).toHaveLength(1));
  await rispondiStoria(0);
  expect(auth().needsReConsent).toBe(true);
  let accettazione!: ReturnType<AuthState['acceptCurrentPolicy']>;
  act(() => {
    accettazione = auth().acceptCurrentPolicy();
  });
  return { accettazione };
};

beforeEach(() => {
  mockStorie.length = 0;
  authRef = undefined;
});

it('consensi: accettazione di A tornata dopo l’ingresso di B, B resta da chiedere', async () => {
  const { accettazione } = await accettazioneDiAInCorso();

  // Il link di B cambia la sessione: parte la verifica del SUO consenso.
  act(() =>
    mockCambioSessione('SIGNED_IN', { user: { id: 'B', email: 'b@r.it' } })
  );
  await waitFor(() => expect(mockStorie).toHaveLength(2));

  await act(async () => {
    mockFinisciAccettazione({ error: null });
    await accettazione;
  });
  await rispondiStoria(1);

  expect(auth().consentState).toBe('needed');
  expect(auth().needsReConsent).toBe(true);
});

it('consensi: accettazione di A con A ancora collegato, il cancello si apre', async () => {
  const { accettazione } = await accettazioneDiAInCorso();
  await act(async () => {
    mockFinisciAccettazione({ error: null });
    await accettazione;
  });
  expect(auth().consentState).toBe('ok');
  expect(auth().needsReConsent).toBe(false);
});
