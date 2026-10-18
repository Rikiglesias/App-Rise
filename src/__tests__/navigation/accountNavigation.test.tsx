import React from 'react';
import { BackHandler, StyleSheet } from 'react-native';
import {
  act,
  cleanup,
  fireEvent,
  render,
  within,
} from '@testing-library/react-native';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';

import { AllProviders } from '../helpers/testProviders';
import AppNavigator from '@/navigation/AppNavigator';
import type { RootStackParamList } from '@/navigation/types';
import { useAuth, type AuthState } from '@/shared/auth/AuthContext';
import { useAuthDeepLink } from '@/shared/auth/useAuthDeepLink';
import i18n from '@/locales';

jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/shared/auth/useAuthDeepLink', () => ({
  useAuthDeepLink: jest.fn(),
}));
jest.mock('expo-haptics');
jest.mock('@/navigation/ImpactStackNavigator', () => () => null);
jest.mock('@/features/actions', () => ({ ContributeTabScreen: () => null }));
jest.mock('@/features/home/components/HomeHeaderSection', () => ({
  HomeHeaderSection: () => null,
}));
jest.mock('@/features/home/components/EntraInAzione', () => ({
  EntraInAzione: () => null,
}));
jest.mock('@/features/about/screens/ChiSiamoScreen', () => () => null);
jest.mock('@/features/social/screens/SeguiciScreen', () => () => null);

const mockUseAuth = jest.mocked(useAuth);
const fullProfile = {
  id: 'u1',
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birth_date: '1990-03-25',
  contact_email: 'mario@example.it',
  nickname: null,
  marketing_consent: false,
  privacy_consent_at: '2026-01-01T00:00:00Z',
  deletion_requested_at: null,
};
let nav: NavigationContainerRefWithCurrent<RootStackParamList>;
let auth: AuthState;
let backListeners: (() => boolean | null | undefined)[];

beforeEach(() => {
  jest.useFakeTimers();
  i18n.locale = 'it';
  backListeners = [];
  jest
    .spyOn(BackHandler, 'addEventListener')
    .mockImplementation((_event, handler) => {
      backListeners.push(handler);
      return {
        remove: () => {
          backListeners = backListeners.filter(item => item !== handler);
        },
      };
    });
  auth = {
    status: 'unauthenticated',
    session: null,
    profile: null,
    profileLoaded: false,
    needsReConsent: false,
    signOut: jest.fn().mockResolvedValue({ error: null }),
    acceptCurrentPolicy: jest.fn().mockResolvedValue({ error: null }),
  } as unknown as AuthState;
  mockUseAuth.mockImplementation(() => auth);
  jest.mocked(useAuthDeepLink).mockImplementation(ref => {
    nav = ref;
  });
});
afterEach(() => {
  cleanup();
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const mount = () =>
  render(
    <AllProviders>
      <AppNavigator />
    </AllProviders>
  );
const settle = () => act(() => jest.runOnlyPendingTimers());
const systemBack = () => {
  act(() => {
    // Ordine LIFO di BackHandler, come Android: il primo true consuma l'evento.
    for (const handler of [...backListeners].reverse()) if (handler()) break;
  });
  settle();
};
const signIn = () => {
  auth = {
    ...auth,
    status: 'authenticated',
    profile: fullProfile,
    profileLoaded: true,
  };
};
const openProfile = (ui: ReturnType<typeof mount>) => {
  fireEvent.press(
    ui.getByRole('button', { name: i18n.t('navigation.profile') })
  );
  settle();
  expect(nav.getCurrentRoute()?.name).toBe('ProfileTab');
};

it('scheda Profilo: ospite vede Accesso', () => {
  for (const locale of ['it', 'en']) {
    i18n.locale = locale;
    const ui = mount();
    const tabs = nav.getRootState().routes[0]?.state;
    expect(tabs?.routeNames).toEqual([
      'ImpactTab',
      'HomeTab',
      'InfoTab',
      'ProfileTab',
    ]);
    openProfile(ui);
    expect(ui.getByText(i18n.t('auth.login.title'))).toBeTruthy();
    fireEvent.press(ui.getByText(i18n.t('auth.login.createAccount')));
    settle();
    expect(nav.getCurrentRoute()?.name).toBe('SignUp');
    ui.unmount();
  }
});

it('scheda Profilo: collegato vede Profilo', () => {
  signIn();
  const ui = mount();
  openProfile(ui);
  expect(ui.getByText('Mario Rossi')).toBeTruthy();
  fireEvent.press(ui.getByText(i18n.t('auth.edit.title')));
  settle();
  expect(nav.getCurrentRoute()?.name).toBe('ProfileEdit');
  // Sessione scaduta durante la modifica: nessun modulo privato nella cronologia.
  auth = { ...auth, status: 'unauthenticated', profile: null };
  ui.rerender(
    <AllProviders>
      <AppNavigator />
    </AllProviders>
  );
  settle();
  expect(nav.getCurrentRoute()?.name).toBe('ProfileTab');
  expect(ui.getByText(i18n.t('auth.login.title'))).toBeTruthy();
  expect(nav.getRootState().routes.map(route => route.name)).toEqual(['Home']);
  systemBack();
  expect(nav.getCurrentRoute()?.name).toBe('HomeTab');
  expect(nav.canGoBack()).toBe(false);
});

it('scheda Profilo: Home senza icona profilo', () => {
  const ui = mount();
  const home = ui.getByTestId('home-screen');
  expect(
    within(home).queryByRole('button', { name: i18n.t('navigation.profile') })
  ).toBeNull();
  // Positivo: l'ingresso esiste davvero nella barra e apre il login.
  openProfile(ui);
  expect(ui.getByText(i18n.t('auth.login.title'))).toBeTruthy();
});

it("scheda Profilo: ri-consenso all'avvio", () => {
  signIn();
  auth.needsReConsent = true;
  const ui = mount();
  expect(ui.getByText(i18n.t('auth.consents.reconsentTitle'))).toBeTruthy();
  expect(nav.getCurrentRoute()?.name).toBe('ReConsent');
  expect(ui.queryByTestId('bottom-tab-bar')).toBeNull();
  systemBack();
  expect(nav.getCurrentRoute()?.name).toBe('ReConsent');
  // Avvio già nel cancello: anche su una rotta ausiliaria l'indietro resta vietato.
  act(() => nav.navigate('ResetPassword'));
  settle();
  systemBack();
  expect(nav.getCurrentRoute()?.name).toBe('ResetPassword');
  // Terminato il recupero si torna al ri-consenso, dove si può accettare.
  act(() => nav.navigate('ReConsent'));
  settle();
  auth = { ...auth, needsReConsent: false };
  ui.rerender(
    <AllProviders>
      <AppNavigator />
    </AllProviders>
  );
  expect(ui.getByTestId('bottom-tab-bar')).toBeTruthy();
});

it("scheda Profilo: dal ri-consenso si può uscire dall'account", async () => {
  signIn();
  auth.needsReConsent = true;
  auth.signOut = jest.fn().mockImplementation(() => {
    auth = {
      ...auth,
      status: 'unauthenticated',
      profile: null,
      needsReConsent: false,
    };
    return Promise.resolve({ error: null });
  });
  jest
    .mocked(auth.signOut)
    .mockResolvedValueOnce({ error: 'offline' })
    .mockRejectedValueOnce(new Error('offline'));
  const ui = mount();
  for (let attempt = 0; attempt < 2; attempt++) {
    await act(async () => {
      fireEvent.press(
        ui.getByRole('button', { name: i18n.t('auth.consents.signOut') })
      );
      await Promise.resolve();
    });
    expect(ui.getByText(i18n.t('auth.profile.logoutError'))).toBeTruthy();
    expect(nav.getCurrentRoute()?.name).toBe('ReConsent');
    expect(ui.queryByTestId('bottom-tab-bar')).toBeNull();
  }
  await act(async () => {
    fireEvent.press(
      ui.getByRole('button', { name: i18n.t('auth.consents.signOut') })
    );
    await Promise.resolve();
  });
  expect(auth.signOut).toHaveBeenCalledTimes(3);
  ui.rerender(
    <AllProviders>
      <AppNavigator />
    </AllProviders>
  );
  expect(ui.getByTestId('bottom-tab-bar')).toBeTruthy();
  expect(ui.queryByText(i18n.t('auth.consents.reconsentTitle'))).toBeNull();
  openProfile(ui);
  expect(ui.getByText(i18n.t('auth.login.title'))).toBeTruthy();
});

it.each([
  ['Registrazione', 'SignUp'],
  ['Password dimenticata', 'ForgotPassword'],
  ['Reimposta password dallo stack', 'ResetPassword'],
  ['Modifica profilo', 'ProfileEdit'],
] as const)('indietro visibile: %s', (_title, route) => {
  if (route === 'ProfileEdit') {
    signIn();
    i18n.locale = 'en';
  }
  const backLabel = i18n.t('common.back');
  const ui = mount();
  openProfile(ui);
  act(() => nav.navigate(route));
  settle();
  const back = ui.getByRole('button', { name: backLabel });
  expect(StyleSheet.flatten(back.props.style).minHeight).toBeGreaterThanOrEqual(
    48
  );
  expect(StyleSheet.flatten(back.props.style).minWidth).toBeGreaterThanOrEqual(
    48
  );
  fireEvent.press(back);
  settle();
  expect(nav.getCurrentRoute()?.name).toBe('ProfileTab');
  act(() => nav.navigate(route));
  settle();
  systemBack();
  expect(nav.getCurrentRoute()?.name).toBe('ProfileTab');
  if (route === 'ResetPassword') {
    act(() => nav.navigate('ResetPassword'));
    settle();
    signIn();
    auth.needsReConsent = true;
    ui.rerender(
      <AllProviders>
        <AppNavigator />
      </AllProviders>
    );
    // Un link di recupero già gestito sopravvive all'arrivo tardivo dei consensi.
    expect(nav.getCurrentRoute()?.name).toBe('ResetPassword');
    expect(ui.getByText(i18n.t('auth.reset.title'))).toBeTruthy();
    systemBack();
    expect(nav.getCurrentRoute()?.name).toBe('ResetPassword');
  }
});

it('indietro visibile: assente alla radice della scheda Profilo', () => {
  const ui = mount();
  openProfile(ui);
  expect(ui.queryByRole('button', { name: 'Indietro' })).toBeNull();
  act(() => nav.navigate('SignUp'));
  settle();
  expect(ui.getByRole('button', { name: 'Indietro' })).toBeTruthy();
  systemBack();
  expect(nav.getCurrentRoute()?.name).toBe('ProfileTab');
});

it('indietro visibile: assente nel cancello del profilo', () => {
  const ui = mount();
  openProfile(ui);
  act(() => nav.navigate('SignUp'));
  settle();
  expect(ui.getByRole('button', { name: 'Indietro' })).toBeTruthy();
  signIn();
  auth = {
    ...auth,
    needsReConsent: true,
    profile: { ...fullProfile, phone: null },
  };
  ui.rerender(
    <AllProviders>
      <AppNavigator />
    </AllProviders>
  );
  expect(ui.getByText(i18n.t('auth.consents.reconsentTitle'))).toBeTruthy();
  expect(ui.queryByRole('button', { name: 'Indietro' })).toBeNull();
  auth = { ...auth, needsReConsent: false };
  ui.rerender(
    <AllProviders>
      <AppNavigator />
    </AllProviders>
  );
  expect(ui.getByText(i18n.t('auth.completeProfile.title'))).toBeTruthy();
  expect(ui.queryByRole('button', { name: 'Indietro' })).toBeNull();
  act(() => nav.navigate('ResetPassword'));
  settle();
  expect(ui.getByText(i18n.t('auth.reset.title'))).toBeTruthy();
  expect(ui.queryByRole('button', { name: 'Indietro' })).toBeNull();
  systemBack();
  expect(nav.getCurrentRoute()?.name).toBe('ResetPassword');
});

// Nel cancello indietro e tasto di sistema sono spenti (C31): «Annulla» è l'unica
// uscita da «Elimina account», altrimenti chi la apre per sbaglio resta bloccato.
it('elimina account: dal cancello del profilo Annulla torna indietro', () => {
  signIn();
  auth = { ...auth, profile: { ...fullProfile, phone: null } };
  const ui = mount();
  settle();
  expect(ui.getByText(i18n.t('auth.completeProfile.title'))).toBeTruthy();
  act(() => nav.navigate('DeleteAccount'));
  settle();
  expect(nav.getCurrentRoute()?.name).toBe('DeleteAccount');
  fireEvent.press(ui.getByText(i18n.t('auth.delete.cancel')));
  settle();
  expect(nav.getCurrentRoute()?.name).toBe('CompleteProfile');
});
