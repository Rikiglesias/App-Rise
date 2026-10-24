import React from 'react';
import { AccessibilityInfo, Alert } from 'react-native';
import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { fillValidProfileForm } from '../../helpers/profileFormHelpers';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { SignUpScreen } from '@/features/auth/screens/SignUpScreen';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@/features/auth/screens/ResetPasswordScreen';
import { CompleteProfileScreen } from '@/features/auth/screens/CompleteProfileScreen';
import { ProfileEditScreen } from '@/features/auth/screens/ProfileEditScreen';
import { DeleteAccountScreen } from '@/features/auth/screens/DeleteAccountScreen';
import { ReConsentScreen } from '@/features/auth/screens/ReConsentScreen';
import { ProfileScreen } from '@/features/auth/screens/ProfileScreen';
import { ConfirmationResend } from '@/features/auth/components/ConfirmationResend';
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
jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: {
    from: () => ({ upsert: (...args: unknown[]) => mockUpsert(...args) }),
  },
}));
jest.mock('@/shared/auth/deletionPolicy', () => ({
  ...jest.requireActual('@/shared/auth/deletionPolicy'),
  CANCELLAZIONE_PROGRAMMATA_ATTIVA: true,
}));

const mockUpsert = jest.fn();
const failed = () =>
  jest.fn().mockResolvedValue({ error: 'Network request failed' });
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
const wrap = (screen: React.ReactElement) =>
  render(<AllProviders>{screen}</AllProviders>);
const networkMessage = () => i18n.t('auth.errors.network');

beforeEach(() => {
  jest.clearAllMocks();
  i18n.locale = 'it';
  jest
    .spyOn(AccessibilityInfo, 'announceForAccessibility')
    .mockImplementation(() => undefined);
  auth = {
    status: 'authenticated',
    session: {
      user: { id: 'u1', email: 'mario@example.test', identities: [] },
    } as unknown as Session,
    profile,
    profileLoaded: true,
    profileError: null,
    needsReConsent: false,
    signIn: failed(),
    signUp: failed(),
    resetPassword: failed(),
    updatePassword: failed(),
    updateProfile: failed(),
    updateEmail: failed(),
    deleteAccountNow: failed(),
    signOut: failed(),
    acceptCurrentPolicy: failed(),
    resendConfirmation: failed(),
    cancelScheduledDeletion: failed(),
    setMarketingConsent: failed(),
    exportData: jest
      .fn()
      .mockRejectedValue(new Error('Network request failed')),
    confirmationRetryAt: {},
    refreshProfile: jest.fn().mockResolvedValue(profile),
  } as unknown as AuthState;
  jest.mocked(useAuth).mockImplementation(() => auth);
  mockUpsert
    .mockReset()
    .mockResolvedValue({ error: { message: 'Network request failed' } });
});
afterEach(() => jest.restoreAllMocks());

const expectAnnounced = async (
  ui: ReturnType<typeof wrap>,
  text = networkMessage()
) => {
  await ui.findByText(text);
  await waitFor(() =>
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      text
    )
  );
  const alert = ui.getByRole('alert', { name: text });
  expect(within(alert).getByText(text)).toBeTruthy();
  expect(alert.props.accessibilityLiveRegion).toBeUndefined();
};
const fillLogin = (ui: ReturnType<typeof wrap>) => {
  fireEvent.changeText(ui.getByLabelText('Email'), 'mario@example.test');
  fireEvent.changeText(ui.getByLabelText('Password'), 'Abcd123!');
};

it("errore d'invio annunciato: Accesso", async () => {
  const ui = wrap(<LoginScreen />);
  fillLogin(ui);
  fireEvent.press(ui.getByRole('button', { name: 'Accedi' }));
  await expectAnnounced(ui);
  expect(auth.signIn).toHaveBeenCalledTimes(1);
});

it("errore d'invio annunciato: Registrazione", async () => {
  const ui = wrap(<SignUpScreen />);
  fillValidProfileForm(
    ui.getByLabelText,
    () => ui.getAllByRole('checkbox')[0],
    ui.getByTestId
  );
  fillLogin(ui);
  fireEvent.changeText(ui.getByLabelText('Conferma password'), 'Abcd123!');
  fireEvent.press(ui.getByRole('button', { name: 'Registrati' }));
  await expectAnnounced(ui);
  expect(auth.signUp).toHaveBeenCalledTimes(1);
});

it("errore d'invio annunciato: Password dimenticata", async () => {
  const ui = wrap(<ForgotPasswordScreen />);
  fireEvent.changeText(ui.getByLabelText('Email'), 'mario@example.test');
  fireEvent.press(ui.getByText('Invia link di reset'));
  await expectAnnounced(ui);
  expect(auth.resetPassword).toHaveBeenCalledTimes(1);
});

it("errore d'invio annunciato: Reimposta password", async () => {
  const ui = wrap(<ResetPasswordScreen />);
  fireEvent.changeText(ui.getByLabelText('Nuova password'), 'Abcd123!');
  fireEvent.changeText(ui.getByLabelText('Conferma password'), 'Abcd123!');
  fireEvent.press(ui.getByText('Salva password'));
  await expectAnnounced(ui);
  expect(auth.updatePassword).toHaveBeenCalledTimes(1);
});

it("errore d'invio annunciato: Completa profilo", async () => {
  const ui = wrap(<CompleteProfileScreen />);
  fireEvent.press(ui.getByText('Salva e continua'));
  await expectAnnounced(ui);
  expect(mockUpsert).toHaveBeenCalledTimes(1);
});

it("errore d'invio annunciato: Modifica profilo", async () => {
  const ui = wrap(<ProfileEditScreen />);
  fireEvent.changeText(ui.getByLabelText('Nome'), 'Maria');
  fireEvent.press(ui.getByText('Salva modifiche'));
  await expectAnnounced(ui);
  expect(auth.updateProfile).toHaveBeenCalledWith({ first_name: 'Maria' });
});

it("errore d'invio annunciato: Elimina account", async () => {
  jest.spyOn(Alert, 'alert').mockImplementation((_title, _body, buttons) => {
    buttons?.find(button => button.style === 'destructive')?.onPress?.();
  });
  const ui = wrap(<DeleteAccountScreen />);
  fireEvent.press(ui.getByText('Elimina subito'));
  await expectAnnounced(ui);
  expect(auth.deleteAccountNow).toHaveBeenCalledTimes(1);
});

it("errore d'invio annunciato: Ri-consenso", async () => {
  const ui = wrap(<ReConsentScreen />);
  fireEvent.press(ui.getByText(i18n.t('auth.consents.reconsentAccept')));
  await expectAnnounced(ui);
  expect(auth.acceptCurrentPolicy).toHaveBeenCalledTimes(1);
});

it("errore d'invio annunciato: Profilo", async () => {
  const ui = wrap(<ProfileScreen />);
  fireEvent.press(ui.getByText(i18n.t('auth.profile.logout')));
  await expectAnnounced(ui);
  expect(auth.signOut).toHaveBeenCalledTimes(1);
});

it("errore d'invio annunciato: Reinvio conferma", async () => {
  const ui = wrap(<ConfirmationResend email="mario@example.test" />);
  fireEvent.press(ui.getByText(i18n.t('auth.resend.submit')));
  await expectAnnounced(ui);
  expect(auth.resendConfirmation).toHaveBeenCalledTimes(1);
});

it("errore d'invio annunciato: stesso errore due volte, due annunci", async () => {
  const ui = wrap(<LoginScreen />);
  fillLogin(ui);
  for (let attempt = 1; attempt <= 2; attempt++) {
    // Il batch include anche la risposta immediata: non dipende da un render intermedio vuoto.
    await act(async () => {
      fireEvent.press(ui.getByRole('button', { name: 'Accedi' }));
      await Promise.resolve();
    });
    await expectAnnounced(ui);
    expect(auth.signIn).toHaveBeenCalledTimes(attempt);
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(
      attempt
    );
  }
});

it.each([
  ['completamento: uscita', CompleteProfileScreen, 'auth.profile.logout'],
  ['ri-consenso: uscita', ReConsentScreen, 'auth.consents.signOut'],
  ['profilo: esportazione', ProfileScreen, 'auth.privacy.exportCta'],
  [
    'profilo: annullamento cancellazione',
    ProfileScreen,
    'auth.delete.bannerCancel',
  ],
] as const)('annuncio azione secondaria: %s', async (_name, Screen, label) => {
  auth.profile = {
    ...profile,
    deletion_requested_at: '2026-10-24T00:00:00Z',
  };
  if (Screen === CompleteProfileScreen) auth.profile = null;
  const ui = wrap(<Screen />);
  fireEvent.press(ui.getByText(i18n.t(label)));
  await expectAnnounced(ui);
});

it('annuncio azione secondaria: profilo, consenso marketing', async () => {
  const ui = wrap(<ProfileScreen />);
  fireEvent(ui.getByRole('switch'), 'valueChange', true);
  await expectAnnounced(ui);
  expect(auth.setMarketingConsent).toHaveBeenCalledWith(true);
});

it.each([
  ['signOut', 'auth.profile.logout'],
  ['exportData', 'auth.privacy.exportCta'],
  ['cancelScheduledDeletion', 'auth.delete.bannerCancel'],
  ['setMarketingConsent', 'auth.consents.marketing'],
] as const)('annunci concorrenti: Profilo %s', async (method, label) => {
  const failures: ((error: Error) => void)[] = [];
  auth[method] = jest.fn(
    () => new Promise<never>((_resolve, reject) => failures.push(reject))
  );
  auth.profile = { ...profile, deletion_requested_at: '2026-10-24T00:00:00Z' };
  const ui = wrap(<ProfileScreen />);
  for (let attempt = 0; attempt < 2; attempt++) {
    if (method === 'setMarketingConsent')
      fireEvent(ui.getByRole('switch'), 'valueChange', true);
    else fireEvent.press(ui.getByText(i18n.t(label)));
  }
  expect(auth[method]).toHaveBeenCalledTimes(2);
  for (let attempt = 0; attempt < 2; attempt++) {
    await act(async () => {
      const reject = failures[attempt];
      if (!reject) throw new Error('Manca la richiesta attesa');
      reject(new Error('Network request failed'));
      await Promise.resolve();
    });
    await expectAnnounced(ui);
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(
      attempt + 1
    );
  }
});

it('annunci concorrenti: due fallimenti nello stesso batch', async () => {
  const failures: ((error: Error) => void)[] = [];
  auth.signOut = jest.fn(
    () => new Promise<never>((_resolve, reject) => failures.push(reject))
  );
  const ui = wrap(<ProfileScreen />);
  fireEvent.press(ui.getByText(i18n.t('auth.profile.logout')));
  fireEvent.press(ui.getByText(i18n.t('auth.profile.logout')));
  expect(auth.signOut).toHaveBeenCalledTimes(2);
  await act(async () => {
    failures.forEach(reject => reject(new Error('Network request failed')));
    await Promise.resolve();
  });
  await expectAnnounced(ui);
  expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledTimes(2);
});
