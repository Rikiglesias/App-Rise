// C90 (contratto android-play, R27-R29): letture del profilo che tornano fuori ordine. Ogni
// risposta superata da una lettura più recente si scarta. File NUOVO (regola R27).
import React from 'react';
import { Text } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';

import { AuthProvider, useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import type { Profile } from '@/shared/auth/types';

type Risposta = { data: Profile | null; error: unknown };
const mockRisposte: ((r: Risposta) => void)[] = [];

jest.mock('@/shared/auth/supabaseClient', () => {
  // Il profilo risponde quando lo dice il test; le altre tabelle subito.
  const profilo = {
    select: () => ({
      eq: () => ({
        single: () =>
          new Promise(resolve => {
            mockRisposte.push(resolve);
          }),
      }),
    }),
  };
  const altro = {
    select: () => ({
      eq: () => ({
        single: () =>
          Promise.resolve({ data: { is_material: true }, error: null }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  };
  return {
    supabase: {
      auth: {
        getSession: jest.fn(() =>
          Promise.resolve({
            data: { session: { user: { id: 'u1', email: 'mario@r.it' } } },
            error: null,
          })
        ),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        })),
      },
      from: (tabella: string) => (tabella === 'profiles' ? profilo : altro),
    },
  };
});

const profiloDi = (firstName: string): Profile => ({
  id: 'u1',
  first_name: firstName,
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birth_date: '1990-01-01',
  privacy_consent_at: '2026-01-01T00:00:00.000Z',
  marketing_consent: false,
  deletion_requested_at: null,
  contact_email: 'mario@r.it',
  nickname: null,
});
const VECCHIO = profiloDi('Vecchio');
const NUOVO = profiloDi('Nuovo');

let authRef: AuthState | undefined;
const Capture: React.FC = () => {
  authRef = useAuth();
  return <Text>{authRef.status}</Text>;
};
const auth = (): AuthState => {
  if (!authRef) throw new Error('authRef non inizializzato');
  return authRef;
};

/** Monta il provider con la lettura iniziale ancora in volo e ne fa partire una seconda. */
const dueLetture = async () => {
  const ui = render(
    <AuthProvider>
      <Capture />
    </AuthProvider>
  );
  await waitFor(() => expect(mockRisposte).toHaveLength(1));
  let seconda!: Promise<Profile | null>;
  act(() => {
    seconda = auth().refreshProfile();
  });
  expect(mockRisposte).toHaveLength(2);
  return { ui, seconda };
};
const rispondi = (indice: number, r: Risposta) =>
  act(async () => {
    mockRisposte[indice]?.(r);
    await Promise.resolve();
  });

beforeEach(() => {
  mockRisposte.length = 0;
  authRef = undefined;
});

it('profilo: una risposta vecchia arrivata dopo una nuova non sovrascrive', async () => {
  await dueLetture();
  await rispondi(1, { data: NUOVO, error: null });
  expect(auth().profile?.first_name).toBe('Nuovo');
  await rispondi(0, { data: VECCHIO, error: null });
  expect(auth().profile?.first_name).toBe('Nuovo');
});

it('profilo: un "nessun profilo" vecchio dopo uno nuovo non toglie il profilo', async () => {
  await dueLetture();
  await rispondi(1, { data: NUOVO, error: null });
  await rispondi(0, {
    data: null,
    error: { code: 'PGRST116', message: 'no rows' },
  });
  expect(auth().profile?.first_name).toBe('Nuovo');
  expect(auth().profileLoaded).toBe(true);
});

it('profilo: un errore vecchio dopo un successo non mostra errore', async () => {
  await dueLetture();
  await rispondi(1, { data: NUOVO, error: null });
  await rispondi(0, {
    data: null,
    error: { code: '', message: 'Network request failed' },
  });
  expect(auth().profileError).toBeNull();
  expect(auth().profile?.first_name).toBe('Nuovo');
});

it('profilo: la risposta vecchia restituisce null', async () => {
  render(
    <AuthProvider>
      <Capture />
    </AuthProvider>
  );
  await waitFor(() => expect(mockRisposte).toHaveLength(1));
  await rispondi(0, { data: VECCHIO, error: null });

  let vecchia!: Promise<Profile | null>;
  let nuova!: Promise<Profile | null>;
  act(() => {
    vecchia = auth().refreshProfile();
    nuova = auth().refreshProfile();
  });
  expect(mockRisposte).toHaveLength(3);
  await rispondi(2, { data: NUOVO, error: null });
  await rispondi(1, { data: VECCHIO, error: null });

  await expect(nuova).resolves.toEqual(NUOVO);
  await expect(vecchia).resolves.toBeNull();
  expect(auth().profile?.first_name).toBe('Nuovo');
});
