import React from 'react';
import { BackHandler, StyleSheet } from 'react-native';
import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
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
// Le 3 radici delle schede sono vuote: il pulsante account può arrivare solo
// dall'intestazione montata dal navigatore delle schede (C30).
jest.mock('@/navigation/ImpactStackNavigator', () => () => null);
jest.mock('@/features/actions', () => ({ ContributeTabScreen: () => null }));
jest.mock('@/features/home/screens/HomeScreen', () => () => null);
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
const rerender = (ui: ReturnType<typeof mount>) => {
  ui.rerender(
    <AllProviders>
      <AppNavigator />
    </AllProviders>
  );
  settle();
};
const accountButton = (ui: ReturnType<typeof mount>) =>
  ui.getByTestId('account-header-button');
const openAccount = (ui: ReturnType<typeof mount>) => {
  fireEvent.press(accountButton(ui));
  settle();
  expect(nav.getCurrentRoute()?.name).toBe('Account');
};
const rootRoutes = () => nav.getRootState().routes.map(route => route.name);
const expectTouchArea = (
  button: ReturnType<ReturnType<typeof mount>['getByTestId']>
) => {
  const style = StyleSheet.flatten(button.props.style);
  expect(style.minHeight).toBeGreaterThanOrEqual(48);
  expect(style.minWidth).toBeGreaterThanOrEqual(48);
};

it('account in alto: tre schede nella barra', () => {
  mount();
  expect(nav.getRootState().routes[0]?.state?.routeNames).toEqual([
    'ImpactTab',
    'HomeTab',
    'InfoTab',
  ]);
});

it('account in alto: ospite vede Accesso', () => {
  for (const locale of ['it', 'en']) {
    i18n.locale = locale;
    for (const tab of ['ImpactTab', 'HomeTab', 'InfoTab'] as const) {
      const ui = mount();
      act(() => nav.navigate('Home', { screen: tab }));
      settle();
      expect(nav.getCurrentRoute()?.name).toBe(tab);
      expect(accountButton(ui).props.accessibilityLabel).toBe(
        i18n.t('auth.login.title')
      );
      openAccount(ui);
      expect(ui.getByText(i18n.t('auth.login.title'))).toBeTruthy();
      fireEvent.press(ui.getByText(i18n.t('auth.login.createAccount')));
      settle();
      expect(nav.getCurrentRoute()?.name).toBe('SignUp');
      ui.unmount();
    }
  }
});

it('account in alto: collegato vede Profilo', () => {
  const ui = mount();
  openAccount(ui);
  expect(ui.getByText(i18n.t('auth.login.title'))).toBeTruthy();
  // Accesso dalla pagina Account con il profilo completo: il Profilo compare lì.
  signIn();
  rerender(ui);
  expect(nav.getCurrentRoute()?.name).toBe('Account');
  expect(ui.getByText('Mario Rossi')).toBeTruthy();
  expect(rootRoutes()).toEqual(['Home', 'Account']);
  systemBack();
  expect(nav.getCurrentRoute()?.name).toBe('HomeTab');
  expect(accountButton(ui).props.accessibilityLabel).toBe(
    i18n.t('auth.profile.title')
  );
  openAccount(ui);
  fireEvent.press(ui.getByText(i18n.t('auth.edit.title')));
  settle();
  expect(nav.getCurrentRoute()?.name).toBe('ProfileEdit');
  // Sessione scaduta durante la modifica: nessun modulo privato nella cronologia.
  auth = { ...auth, status: 'unauthenticated', profile: null };
  rerender(ui);
  expect(nav.getCurrentRoute()?.name).toBe('Account');
  expect(ui.getByText(i18n.t('auth.login.title'))).toBeTruthy();
  expect(rootRoutes()).toEqual(['Home', 'Account']);
  systemBack();
  expect(nav.getCurrentRoute()?.name).toBe('HomeTab');
  expect(nav.canGoBack()).toBe(false);
});

it("account in alto: ri-consenso all'avvio", () => {
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

it("account in alto: dal ri-consenso si può uscire dall'account", async () => {
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
  openAccount(ui);
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
  openAccount(ui);
  act(() => nav.navigate(route));
  settle();
  const back = ui.getByRole('button', { name: backLabel });
  expectTouchArea(back);
  fireEvent.press(back);
  settle();
  expect(nav.getCurrentRoute()?.name).toBe('Account');
  act(() => nav.navigate(route));
  settle();
  systemBack();
  expect(nav.getCurrentRoute()?.name).toBe('Account');
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

// Accesso e Profilo si aprono sopra le schede: l'indietro riporta alla scheda di
// partenza, che qui NON è la Home (un ritorno fisso alla Home sarebbe sbagliato).
it('indietro visibile: Accesso', () => {
  const ui = mount();
  act(() => nav.navigate('Home', { screen: 'InfoTab' }));
  settle();
  openAccount(ui);
  expect(ui.getByText(i18n.t('auth.login.title'))).toBeTruthy();
  const back = ui.getByRole('button', { name: i18n.t('common.back') });
  expectTouchArea(back);
  fireEvent.press(back);
  settle();
  expect(nav.getCurrentRoute()?.name).toBe('InfoTab');
  openAccount(ui);
  systemBack();
  expect(nav.getCurrentRoute()?.name).toBe('InfoTab');
});

it('indietro visibile: Profilo', () => {
  signIn();
  const ui = mount();
  act(() => nav.navigate('Home', { screen: 'ImpactTab' }));
  settle();
  openAccount(ui);
  expect(ui.getByText('Mario Rossi')).toBeTruthy();
  fireEvent.press(ui.getByRole('button', { name: i18n.t('common.back') }));
  settle();
  expect(nav.getCurrentRoute()?.name).toBe('ImpactTab');
  openAccount(ui);
  systemBack();
  expect(nav.getCurrentRoute()?.name).toBe('ImpactTab');
});

it('indietro visibile: assente nel cancello del profilo', () => {
  const ui = mount();
  openAccount(ui);
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
