import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';
import { AllProviders } from '../../helpers/testProviders';
import { ProfileEditScreen } from '@/features/auth/screens/ProfileEditScreen';
import { useAuth, type AuthState } from '@/shared/auth/AuthContext';
import type { Profile } from '@/shared/auth/types';

// «Modifica profilo» legata all'utente (C97) anche DOPO le attese del salvataggio, e
// una rilettura del profilo superata (C90: restituisce null) non vale come profilo.
const mockPopTo = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    popTo: mockPopTo,
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => false,
    getState: () => ({ routeNames: ['Account', 'ProfileEdit'] }),
  }),
}));
jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: {
    rpc: jest.fn().mockResolvedValue({ data: true, error: null }),
    auth: { updateUser: jest.fn() },
  },
}));

const profiloDi = (id: string, nome: string): Profile => ({
  id,
  first_name: nome,
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birth_date: '1990-01-01',
  contact_email: `${id}@contatto.test`,
  nickname: null,
  privacy_consent_at: '2026-01-01T00:00:00Z',
  marketing_consent: false,
  deletion_requested_at: null,
});

const updateProfile = jest.fn();
const updateEmail = jest.fn();
const refreshProfile = jest.fn();
const statoDi = (id: string, extra: Partial<AuthState> = {}) =>
  ({
    status: 'authenticated',
    session: { user: { id, email: `${id}@account.test` } } as Session,
    profile: profiloDi(id, id === 'A' ? 'Anna' : 'Bruno'),
    profileLoaded: true,
    profileError: null,
    refreshProfile,
    updateProfile,
    updateEmail,
    ...extra,
  }) as unknown as AuthState;

const apri = () =>
  render(
    <AllProviders>
      <ProfileEditScreen />
    </AllProviders>
  );

beforeEach(() => {
  jest.clearAllMocks();
  updateEmail.mockResolvedValue({ error: null });
});

it("modifica profilo: sessione di B arrivata mentre il profilo di A si salva, l'email non si chiede sull'account B", async () => {
  let finisci!: (r: { error: null }) => void;
  updateProfile.mockReturnValue(new Promise(r => (finisci = r)));
  jest.mocked(useAuth).mockReturnValue(statoDi('A'));
  const ui = apri();
  fireEvent.changeText(ui.getByLabelText('Nome'), 'Annalisa');
  fireEvent.changeText(ui.getByLabelText('Email'), 'nuova-a@account.test');
  fireEvent.press(ui.getByRole('button', { name: 'Salva modifiche' }));
  expect(updateProfile).toHaveBeenCalledTimes(1);

  // Il link di B cambia la sessione mentre il salvataggio di A è in rete.
  jest.mocked(useAuth).mockReturnValue(statoDi('B'));
  ui.rerender(
    <AllProviders>
      <ProfileEditScreen />
    </AllProviders>
  );
  await act(async () => {
    finisci({ error: null });
    // Lascia girare la continuazione del salvataggio dopo `updateProfile`.
    await Promise.resolve();
  });
  expect(updateEmail).not.toHaveBeenCalled();
});

it('modifica profilo: sessione rimasta di A, dopo il profilo si chiede anche il cambio email', async () => {
  updateProfile.mockResolvedValue({ error: null });
  jest.mocked(useAuth).mockReturnValue(statoDi('A'));
  const ui = apri();
  fireEvent.changeText(ui.getByLabelText('Nome'), 'Annalisa');
  fireEvent.changeText(ui.getByLabelText('Email'), 'nuova-a@account.test');
  fireEvent.press(ui.getByRole('button', { name: 'Salva modifiche' }));
  await waitFor(() =>
    expect(updateEmail).toHaveBeenCalledWith('nuova-a@account.test')
  );
});

it('modifica profilo: rilettura del profilo superata (null), non si salva niente e si chiede di riprovare', async () => {
  refreshProfile.mockResolvedValue(null);
  jest
    .mocked(useAuth)
    .mockReturnValue(statoDi('A', { profileError: 'lettura fallita' }));
  const ui = apri();
  fireEvent.changeText(ui.getByLabelText('Nome'), 'Annalisa');
  fireEvent.press(ui.getByRole('button', { name: 'Salva modifiche' }));
  await waitFor(() => expect(refreshProfile).toHaveBeenCalledTimes(1));
  await act(async () => {});
  expect(updateProfile).not.toHaveBeenCalled();
  expect(ui.getByText('Aggiornamento non riuscito. Riprova.')).toBeTruthy();
});
