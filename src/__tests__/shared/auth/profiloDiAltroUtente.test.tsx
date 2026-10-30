// C90 (giro valido del delta 1, f1-2): il salvataggio di A che finisce dopo l'ingresso di B
// rilegge il profilo di A. Quella rilettura non riguarda più nessuno e non deve scartare la
// lettura di B, altrimenti B resta sulla rotella senza dati né errore. File NUOVO (R27).
import React from 'react';
import { Text } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';

import { AuthProvider, useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import type { Profile } from '@/shared/auth/types';

type Risposta = { data: Profile | null; error: unknown };
const mockLetture: ((r: Risposta) => void)[] = [];
let mockFinisciSalvataggio: (r: { error: null }) => void = () => {};
let mockCambioSessione: (evento: string, sessione: unknown) => void = () => {};

jest.mock('@/shared/auth/supabaseClient', () => {
  const profili = {
    select: () => ({
      eq: () => ({
        single: () =>
          new Promise(resolve => {
            mockLetture.push(resolve);
          }),
      }),
    }),
    update: () => ({
      eq: () =>
        new Promise(resolve => {
          mockFinisciSalvataggio = resolve;
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
            data: { session: { user: { id: 'A', email: 'a@r.it' } } },
            error: null,
          })
        ),
        onAuthStateChange: jest.fn(cb => {
          mockCambioSessione = cb;
          return { data: { subscription: { unsubscribe: jest.fn() } } };
        }),
      },
      from: (tabella: string) => (tabella === 'profiles' ? profili : altro),
    },
  };
});

const profiloDi = (id: string, firstName: string): Profile => ({
  id,
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
  contact_email: `${id}@r.it`,
  nickname: null,
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

const rispondi = (indice: number, r: Risposta) =>
  act(async () => {
    mockLetture[indice]?.(r);
    await giriDiPromesse();
  });

beforeEach(() => {
  mockLetture.length = 0;
  authRef = undefined;
});

it('profilo: salvataggio di A finito dopo l’ingresso di B, B non resta sulla rotella', async () => {
  render(
    <AuthProvider>
      <Capture />
    </AuthProvider>
  );
  await waitFor(() => expect(mockLetture).toHaveLength(1));
  await rispondi(0, { data: profiloDi('A', 'Anna'), error: null });

  let salvataggio!: ReturnType<AuthState['updateProfile']>;
  act(() => {
    salvataggio = auth().updateProfile({ city: 'Bologna' });
  });

  // Il link di B parte mentre il salvataggio di A è in rete: lettura del profilo di B.
  act(() =>
    mockCambioSessione('SIGNED_IN', { user: { id: 'B', email: 'b@r.it' } })
  );
  await waitFor(() => expect(mockLetture).toHaveLength(2));

  await act(async () => {
    mockFinisciSalvataggio({ error: null });
    await giriDiPromesse();
  });
  await rispondi(1, { data: profiloDi('B', 'Bruno'), error: null });
  // Se è partita, la rilettura di A risponde per ultima: non deve cambiare niente.
  await rispondi(2, { data: profiloDi('A', 'Anna'), error: null });
  await act(async () => {
    await salvataggio;
  });

  expect(auth().profileLoaded).toBe(true);
  expect(auth().profile?.id).toBe('B');
});
