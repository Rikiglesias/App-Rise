/**
 * C93 (contratto android-play): un invio bloccato dalla validazione fa partire UN annuncio, il primo
 * errore nell'ordine in cui i campi stanno a schermo, anche se uguale a quello del tentativo prima.
 * I sei campi (`AuthInput`, `AuthPhoneField`, `AuthDateField`, `AuthCountryField`, `AuthCityField`,
 * `AuthConsentCheckbox`) non annunciano da sé e il contenitore del loro errore non ha live region.
 * Il suggerimento del nickname resta annunciato una volta e perde la live region `polite`.
 * Ogni modulo che usa quei campi compare almeno una volta.
 */
import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { fillValidProfileForm } from '../../helpers/profileFormHelpers';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { SignUpScreen } from '@/features/auth/screens/SignUpScreen';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@/features/auth/screens/ResetPasswordScreen';
import { CompleteProfileScreen } from '@/features/auth/screens/CompleteProfileScreen';
import { ProfileEditScreen } from '@/features/auth/screens/ProfileEditScreen';
import { useAuth, type AuthState } from '@/shared/auth/AuthContext';
import type { Profile } from '@/shared/auth/types';
import i18n from '@/locales';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => true,
  }),
}));
jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
// `rpc` è la `nickname_disponibile` della 0018: libero, salvo dove il test lo vuole occupato.
jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: {
    from: () => ({ upsert: (...args: unknown[]) => mockUpsert(...args) }),
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

const mockUpsert = jest.fn();
const mockRpc = jest.fn();
const profile: Profile = {
  id: 'u1',
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birth_date: '1990-01-01',
  privacy_consent_at: '2026-01-01T00:00:00Z',
  marketing_consent: false,
  deletion_requested_at: null,
  contact_email: 'mario@example.test',
  nickname: null,
};
let auth: AuthState;
const ok = () => jest.fn().mockResolvedValue({ error: null });
const wrap = (screen: React.ReactElement) =>
  render(<AllProviders>{screen}</AllProviders>);
type Ui = ReturnType<typeof wrap>;
type Nodo = ReturnType<Ui['getByText']>;
const annuncio = () => jest.mocked(AccessibilityInfo.announceForAccessibility);
const msg = (key: string): string => i18n.t(`auth.errors.${key}`);

beforeEach(() => {
  jest.clearAllMocks();
  i18n.locale = 'it';
  jest
    .spyOn(AccessibilityInfo, 'announceForAccessibility')
    .mockImplementation(() => undefined);
  mockUpsert.mockReset().mockResolvedValue({ error: null });
  mockRpc.mockReset().mockResolvedValue({ data: true, error: null });
  auth = {
    status: 'authenticated',
    session: {
      user: { id: 'u1', email: 'mario@example.test', identities: [] },
    } as unknown as Session,
    profile,
    profileLoaded: true,
    profileError: null,
    needsReConsent: false,
    signIn: ok(),
    signUp: ok(),
    resetPassword: ok(),
    updatePassword: ok(),
    updateProfile: ok(),
    updateEmail: ok(),
    signOut: ok(),
    confirmationRetryAt: {},
    refreshProfile: jest.fn().mockResolvedValue(profile),
  } as unknown as AuthState;
  jest.mocked(useAuth).mockImplementation(() => auth);
});
afterEach(() => jest.restoreAllMocks());

/** Il testo e ogni suo antenato senza live region: l'unico annuncio è quello del modulo. */
const senzaLiveRegion = (nodo: Nodo): void => {
  for (let n: Nodo | null = nodo; n; n = n.parent)
    expect(n.props.accessibilityLiveRegion).toBeUndefined();
};
/** Dopo un invio bloccato: l'errore è a schermo senza live region ed è l'unico annuncio. */
const annunciatoUnaVolta = async (ui: Ui, testo: string): Promise<void> => {
  senzaLiveRegion(await ui.findByText(testo));
  expect(annuncio()).toHaveBeenCalledTimes(1);
  expect(annuncio()).toHaveBeenCalledWith(testo);
};
const compilaRegistrazione = (ui: Ui, consenso = true): void => {
  fillValidProfileForm(
    ui.getByLabelText,
    () => ui.getAllByRole('checkbox')[0],
    ui.getByTestId,
    { consent: consenso }
  );
  fireEvent.changeText(ui.getByLabelText('Email'), 'mario@example.test');
  fireEvent.changeText(ui.getByLabelText('Password'), 'Abcd123!');
  fireEvent.changeText(ui.getByLabelText('Conferma password'), 'Abcd123!');
};
const registrati = (ui: Ui): void =>
  fireEvent.press(ui.getByRole('button', { name: 'Registrati' }));

it("errore di campo annunciato all'invio: AuthInput", async () => {
  // I tre moduli fatti di soli AuthInput. Accesso vuoto: email e password in errore, si
  // annuncia l'email (prima a schermo). Nuova password: debole e diversa dalla conferma.
  let ui = wrap(<LoginScreen />);
  fireEvent.press(ui.getByRole('button', { name: 'Accedi' }));
  await annunciatoUnaVolta(ui, msg('email_invalid'));
  expect(auth.signIn).not.toHaveBeenCalled();
  ui.unmount();

  annuncio().mockClear();
  ui = wrap(<ForgotPasswordScreen />);
  fireEvent.press(ui.getByText('Invia link di reset'));
  await annunciatoUnaVolta(ui, msg('email_invalid'));
  expect(auth.resetPassword).not.toHaveBeenCalled();
  ui.unmount();

  annuncio().mockClear();
  ui = wrap(<ResetPasswordScreen />);
  fireEvent.changeText(ui.getByLabelText('Nuova password'), 'abc');
  fireEvent.press(ui.getByText('Salva password'));
  await annunciatoUnaVolta(ui, msg('password_weak'));
  expect(ui.getByText(msg('password_mismatch'))).toBeTruthy();
  expect(auth.updatePassword).not.toHaveBeenCalled();
});

it("errore di campo annunciato all'invio: AuthPhoneField", async () => {
  const ui = wrap(<SignUpScreen />);
  compilaRegistrazione(ui);
  fireEvent.changeText(ui.getByLabelText('Telefono'), '12');
  registrati(ui);
  await annunciatoUnaVolta(ui, msg('phone_invalid'));
  expect(auth.signUp).not.toHaveBeenCalled();
});

it("errore di campo annunciato all'invio: AuthDateField", async () => {
  // Completamento di un profilo senza data di nascita: è l'unico campo che manca.
  auth.profile = { ...profile, birth_date: null } as unknown as Profile;
  const ui = wrap(<CompleteProfileScreen />);
  fireEvent.press(ui.getByText('Salva e continua'));
  await annunciatoUnaVolta(ui, msg('date_invalid'));
  expect(mockUpsert).not.toHaveBeenCalled();
});

it("errore di campo annunciato all'invio: AuthCountryField", async () => {
  // Profilo nato con il paese vuoto: «Modifica profilo» lo apre così e lo pretende. Il
  // paese resta vuoto: prima il prefisso del telefono lo faceva diventare Brasile.
  auth.profile = { ...profile, country: '', province: null };
  const ui = wrap(<ProfileEditScreen />);
  expect(ui.getByTestId('country-field').props.accessibilityValue).toEqual({
    text: '',
  });
  fireEvent.press(ui.getByText('Salva modifiche'));
  await annunciatoUnaVolta(ui, msg('required'));
  expect(auth.updateProfile).not.toHaveBeenCalled();
});

it("errore di campo annunciato all'invio: AuthCityField", async () => {
  // Paese estero: svuotare la città non tocca la provincia, l'errore resta uno.
  auth.profile = { ...profile, country: 'FR', city: 'Parigi', province: null };
  const ui = wrap(<ProfileEditScreen />);
  fireEvent.changeText(ui.getByLabelText('Città'), '');
  fireEvent.press(ui.getByText('Salva modifiche'));
  await annunciatoUnaVolta(ui, msg('required'));
  expect(auth.updateProfile).not.toHaveBeenCalled();
});

it("errore di campo annunciato all'invio: AuthConsentCheckbox", async () => {
  const ui = wrap(<SignUpScreen />);
  compilaRegistrazione(ui, false);
  registrati(ui);
  await annunciatoUnaVolta(ui, msg('required'));
  expect(auth.signUp).not.toHaveBeenCalled();
});

it('errore di campo: stesso errore due volte, due annunci', async () => {
  const ui = wrap(<LoginScreen />);
  fireEvent.changeText(ui.getByLabelText('Password'), 'Abcd123!');
  for (let volta = 1; volta <= 2; volta++) {
    // `act` asincrono: il secondo tocco parte quando il primo invio è chiuso.
    await act(async () => {
      fireEvent.press(ui.getByRole('button', { name: 'Accedi' }));
      await Promise.resolve();
    });
    expect(annuncio()).toHaveBeenCalledTimes(volta);
    expect(annuncio()).toHaveBeenLastCalledWith(msg('email_invalid'));
  }
  senzaLiveRegion(ui.getByText(msg('email_invalid')));
  expect(auth.signIn).not.toHaveBeenCalled();
});

it("più errori: si annuncia il primo nell'ordine del modulo", async () => {
  // In entrambi i moduli il nickname sta sopra l'email, mentre la validazione lo controlla
  // per ultimo: annunciare il primo errore TROVATO darebbe l'email.
  let ui = wrap(<SignUpScreen />);
  compilaRegistrazione(ui);
  fireEvent.changeText(ui.getByLabelText('Nickname (facoltativo)'), 'a');
  fireEvent.changeText(ui.getByLabelText('Email'), 'mario@');
  registrati(ui);
  await annunciatoUnaVolta(ui, msg('nickname_length'));
  expect(ui.getByText(msg('email_invalid'))).toBeTruthy();
  expect(auth.signUp).not.toHaveBeenCalled();
  ui.unmount();

  annuncio().mockClear();
  ui = wrap(<CompleteProfileScreen />);
  fireEvent.changeText(ui.getByLabelText('Nickname (facoltativo)'), 'a');
  fireEvent.changeText(ui.getByLabelText('Email di contatto'), 'mario@');
  fireEvent.press(ui.getByText('Salva e continua'));
  await annunciatoUnaVolta(ui, msg('nickname_length'));
  expect(ui.getByText(msg('email_invalid'))).toBeTruthy();
  expect(mockUpsert).not.toHaveBeenCalled();
});

it('suggerimento nickname annunciato una volta, senza live region', async () => {
  mockRpc.mockResolvedValue({ data: false, error: null });
  const ui = wrap(<SignUpScreen />);
  fireEvent.changeText(ui.getByLabelText('Nickname (facoltativo)'), 'occupato');
  // Il verdetto arriva dopo l'attesa del campo (450 ms): si aspetta lui, non un tempo.
  const suggerimento = await ui.findByText(
    msg('nickname_taken'),
    {},
    { timeout: 3000 }
  );
  await waitFor(() => expect(annuncio()).toHaveBeenCalledTimes(1));
  expect(annuncio()).toHaveBeenCalledWith(msg('nickname_taken'));
  senzaLiveRegion(suggerimento);
});
