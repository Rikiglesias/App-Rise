// C87 (contratto android-play, R27-R29): l'email dell'account in «Modifica profilo» quando un
// cambio è già in attesa di conferma. File NUOVO (regola R27): la controprova lo carica alla
// base 13fa640, quindi qui si importa solo ciò che esiste già là.
import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { ProfileEditScreen } from '@/features/auth/screens/ProfileEditScreen';
import { useAuth, type AuthState } from '@/shared/auth/AuthContext';
import { buildEmailChangeRedirectTo } from '@/shared/auth/authRedirect';
import { supabase } from '@/shared/auth/supabaseClient';
import type { Profile } from '@/shared/auth/types';
import i18n from '@/locales';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => false,
  }),
}));
jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: { auth: { resend: jest.fn() } },
}));

const profile: Profile = {
  id: 'u1',
  first_name: 'Mario',
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
};

const sessione = (email: string, newEmail: string | null): Session =>
  ({
    user: { id: 'u1', email, new_email: newEmail, identities: [] },
  }) as unknown as Session;

let updateProfile: jest.Mock;
let updateEmail: jest.Mock;
const authCon = (session: Session): AuthState =>
  ({
    status: 'authenticated',
    session,
    profile,
    profileError: null,
    refreshProfile: jest.fn().mockResolvedValue(profile),
    updateProfile,
    updateEmail,
  }) as unknown as AuthState;

const wrap = (ui: React.ReactElement) =>
  render(<AllProviders>{ui}</AllProviders>);
const flush = () =>
  act(async () => {
    await Promise.resolve();
  });

beforeEach(() => {
  jest.clearAllMocks();
  i18n.locale = 'it';
  jest
    .spyOn(AccessibilityInfo, 'announceForAccessibility')
    .mockImplementation(() => undefined);
  updateProfile = jest.fn().mockResolvedValue({ error: null });
  updateEmail = jest.fn().mockResolvedValue({ error: null });
  jest.mocked(supabase.auth.resend).mockReset();
});
afterEach(() => jest.restoreAllMocks());

const salvaTelefono = async (ui: ReturnType<typeof wrap>) => {
  fireEvent.changeText(ui.getByLabelText('Telefono'), '+393339998877');
  fireEvent.press(ui.getByText('Salva modifiche'));
  await waitFor(() =>
    expect(updateProfile).toHaveBeenCalledWith({ phone: '+393339998877' })
  );
  await flush();
};

it('profilo: cambio email già in attesa non si rimanda salvando altro', async () => {
  jest
    .mocked(useAuth)
    .mockReturnValue(authCon(sessione('old@r.it', 'new@r.it')));
  const ui = wrap(<ProfileEditScreen />);
  // Il campo tiene ancora l'indirizzo scritto per il cambio che ora è in attesa.
  fireEvent.changeText(ui.getByLabelText('Email'), 'new@r.it');
  await salvaTelefono(ui);
  expect(updateEmail).not.toHaveBeenCalled();
});

it("profilo: confermata la nuova email, il campo segue l'account e Salva non chiama updateEmail", async () => {
  jest
    .mocked(useAuth)
    .mockReturnValue(authCon(sessione('old@r.it', 'new@r.it')));
  const ui = wrap(<ProfileEditScreen />);
  expect(ui.getByDisplayValue('old@r.it')).toBeTruthy();

  // Conferma arrivata dalle due caselle: la sessione ha l'indirizzo nuovo e nessuno in attesa.
  jest.mocked(useAuth).mockReturnValue(authCon(sessione('new@r.it', null)));
  ui.rerender(
    <AllProviders>
      <ProfileEditScreen />
    </AllProviders>
  );
  expect(ui.queryByDisplayValue('new@r.it')).not.toBeNull();
  expect(ui.queryByDisplayValue('old@r.it')).toBeNull();

  fireEvent.press(ui.getByText('Salva modifiche'));
  await ui.findByText(i18n.t('auth.edit.success'));
  expect(updateEmail).not.toHaveBeenCalled();
});

it('profilo: email in attesa scritta con le maiuscole, salvare altro non la rimanda', async () => {
  jest
    .mocked(useAuth)
    .mockReturnValue(authCon(sessione('old@r.it', 'new@r.it')));
  const ui = wrap(<ProfileEditScreen />);
  fireEvent.changeText(ui.getByLabelText('Email'), ' New@R.it ');
  await salvaTelefono(ui);
  expect(updateEmail).not.toHaveBeenCalled();
});

it("profilo: Rimanda il link chiama resend email_change con l'email dell'account", async () => {
  jest
    .mocked(supabase.auth.resend)
    .mockResolvedValue({ data: {}, error: null } as never);
  jest
    .mocked(useAuth)
    .mockReturnValue(authCon(sessione('old@r.it', 'new@r.it')));
  const ui = wrap(<ProfileEditScreen />);
  expect(ui.queryByText('Rimanda il link')).not.toBeNull();
  // Com'è davvero dopo un cambio: il campo tiene l'indirizzo in attesa. Il rinvio non lo
  // deve usare: il server cerca l'utente con l'email attuale.
  fireEvent.changeText(ui.getByLabelText('Email'), 'new@r.it');

  fireEvent.press(ui.getByText('Rimanda il link'));
  await waitFor(() => expect(supabase.auth.resend).toHaveBeenCalledTimes(1));
  expect(supabase.auth.resend).toHaveBeenCalledWith({
    type: 'email_change',
    email: 'old@r.it',
    options: { emailRedirectTo: buildEmailChangeRedirectTo() },
  });
  await ui.findByText(i18n.t('auth.edit.resendSent'));
  expect(updateEmail).not.toHaveBeenCalled();
});

it("profilo: Rimanda il link troppo presto → errore annunciato con l'attesa", async () => {
  // Risposta del server quando il link è stato chiesto da poco (GoTrue, 429).
  jest.mocked(supabase.auth.resend).mockResolvedValue({
    data: {},
    error: {
      name: 'AuthApiError',
      status: 429,
      code: 'over_email_send_rate_limit',
      message:
        'For security purposes, you can only request this after 42 seconds.',
    },
  } as never);
  jest
    .mocked(useAuth)
    .mockReturnValue(authCon(sessione('old@r.it', 'new@r.it')));
  const ui = wrap(<ProfileEditScreen />);
  expect(ui.queryByText('Rimanda il link')).not.toBeNull();

  fireEvent.press(ui.getByText('Rimanda il link'));
  const testo = i18n.t('auth.errors.rate_limited');
  await waitFor(() =>
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      testo
    )
  );
  expect(ui.getByRole('alert', { name: testo })).toBeTruthy();
  // L'attesa a schermo, come per il rinvio della conferma della registrazione.
  expect(ui.getByText(/Puoi chiedere un nuovo invio tra \d+ s\./)).toBeTruthy();
  expect(ui.queryByText(i18n.t('auth.edit.resendSent'))).toBeNull();
});

it('profilo: Rimanda il link, doppio tocco → una sola richiesta', async () => {
  let rispondi!: (r: unknown) => void;
  jest.mocked(supabase.auth.resend).mockImplementation(
    () =>
      new Promise(resolve => {
        rispondi = resolve;
      }) as never
  );
  jest
    .mocked(useAuth)
    .mockReturnValue(authCon(sessione('old@r.it', 'new@r.it')));
  const ui = wrap(<ProfileEditScreen />);
  expect(ui.queryByText('Rimanda il link')).not.toBeNull();

  // Durante l'invio il pulsante mostra la rotella: si tocca per etichetta, lo stesso due volte.
  fireEvent.press(ui.getByLabelText('Rimanda il link'));
  fireEvent.press(ui.getByLabelText('Rimanda il link'));
  await waitFor(() => expect(supabase.auth.resend).toHaveBeenCalled());
  await act(async () => {
    rispondi({ data: {}, error: null });
    await Promise.resolve();
  });
  expect(supabase.auth.resend).toHaveBeenCalledTimes(1);
});

it('profilo: dopo il salvataggio della nuova email Rimanda il link aspetta', async () => {
  jest
    .mocked(supabase.auth.resend)
    .mockResolvedValue({ data: {}, error: null } as never);
  jest.mocked(useAuth).mockReturnValue(authCon(sessione('old@r.it', null)));
  const ui = wrap(<ProfileEditScreen />);
  fireEvent.changeText(ui.getByLabelText('Email'), 'new@r.it');
  fireEvent.press(ui.getByText('Salva modifiche'));
  await waitFor(() => expect(updateEmail).toHaveBeenCalledWith('new@r.it'));
  await flush();

  // Il server ha appena mandato le mail: la sessione ora ha il cambio in attesa.
  jest
    .mocked(useAuth)
    .mockReturnValue(authCon(sessione('old@r.it', 'new@r.it')));
  ui.rerender(
    <AllProviders>
      <ProfileEditScreen />
    </AllProviders>
  );
  expect(ui.queryByText('Rimanda il link')).not.toBeNull();
  expect(ui.getByText(/Puoi chiedere un nuovo invio tra \d+ s\./)).toBeTruthy();
  fireEvent.press(ui.getByText('Rimanda il link'));
  await flush();
  expect(supabase.auth.resend).not.toHaveBeenCalled();
});
