import React from 'react';
import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';

import { AllProviders } from '../helpers/testProviders';
import AppNavigator from '@/navigation/AppNavigator';
import type { RootStackParamList } from '@/navigation/types';
import { useAuth, type AuthState } from '@/shared/auth/AuthContext';
import { useAuthDeepLink } from '@/shared/auth/useAuthDeepLink';
import i18n from '@/locales';

const mockListeners = new Set<(event: { url: string }) => void>();
const mockGetInitialURL = jest.fn<Promise<string | null>, []>();
const mockSubscribe = (
  _type: string,
  listener: (event: { url: string }) => void
) => {
  mockListeners.add(listener);
  return { remove: () => mockListeners.delete(listener) };
};
jest.mock('expo-linking', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    createURL: (path: string) => `rahitalia://${path}`,
    getInitialURL: () => mockGetInitialURL(),
    addEventListener: (...args: Parameters<typeof mockSubscribe>) =>
      mockSubscribe(...args),
    // Stessa semantica di Expo: due stringhe identiche non causano un render.
    useURL: () => {
      const [url, setUrl] = React.useState<string | null>(null);
      React.useEffect(() => {
        void mockGetInitialURL().then(setUrl);
        const sub = mockSubscribe('url', event => setUrl(event.url));
        return () => {
          sub.remove();
        };
      }, []);
      return url;
    },
  };
});
jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/shared/auth/useAuthDeepLink', () => ({
  useAuthDeepLink: jest.fn(),
}));
jest.mock('expo-haptics');
// Stesso montaggio di accountNavigation: navigator e schermate auth reali.
jest.mock('@/navigation/ImpactStackNavigator', () => () => null);
jest.mock('@/features/actions', () => ({ ContributeTabScreen: () => null }));
jest.mock('@/features/home/screens/HomeScreen', () => () => null);
jest.mock('@/features/about/screens/ChiSiamoScreen', () => () => null);
jest.mock('@/features/social/screens/SeguiciScreen', () => () => null);

const realUseAuthDeepLink = jest.requireActual<
  typeof import('@/shared/auth/useAuthDeepLink')
>('@/shared/auth/useAuthDeepLink').useAuthDeepLink;
const recovery = jest.fn();
const updatePassword = jest.fn();
let nav: NavigationContainerRefWithCurrent<RootStackParamList>;

beforeEach(() => {
  jest.useFakeTimers();
  i18n.locale = 'it';
  mockListeners.clear();
  mockGetInitialURL.mockReset().mockResolvedValue(null);
  recovery.mockReset().mockResolvedValue({ ok: true });
  updatePassword.mockReset().mockResolvedValue({ error: null });
  jest.mocked(useAuth).mockReturnValue({
    status: 'unauthenticated',
    session: null,
    profile: null,
    profileLoaded: false,
    needsReConsent: false,
    completeRecoveryFromUrl: recovery,
    completeEmailConfirmFromUrl: jest.fn(),
    updatePassword,
  } as unknown as AuthState);
  jest.mocked(useAuthDeepLink).mockImplementation(ref => {
    nav = ref;
    realUseAuthDeepLink(ref);
  });
});
afterEach(() => {
  cleanup();
  jest.clearAllTimers();
  jest.useRealTimers();
});

const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
  act(() => jest.runOnlyPendingTimers());
};
const mount = async () => {
  const ui = render(
    <AllProviders>
      <AppNavigator />
    </AllProviders>
  );
  await settle();
  return ui;
};
const routes = () => nav.getRootState().routes.map(route => route.name);
const openLink = async (url: string) => {
  act(() => mockListeners.forEach(listener => listener({ url })));
  await settle();
};
const finishReset = async (ui: Awaited<ReturnType<typeof mount>>) => {
  fireEvent.changeText(ui.getByLabelText('Nuova password'), 'Abcd123!');
  fireEvent.changeText(ui.getByLabelText('Conferma password'), 'Abcd123!');
  fireEvent.press(ui.getByText('Salva password'));
  await settle();
  expect(updatePassword).toHaveBeenCalledWith('Abcd123!');
  fireEvent.press(ui.getByText('Continua'));
  await settle();
};

describe('recupero dalla pagina Account', () => {
  it('reset concluso: indietro non torna al reset', async () => {
    const ui = await mount();
    fireEvent.press(ui.getByTestId('account-header-button'));
    await settle();
    expect(routes()).toEqual(['Home', 'Account']);
    await openLink('rahitalia://reset-password?code=account');
    expect(routes()).toEqual(['Home', 'Account', 'ResetPassword']);
    await finishReset(ui);
    expect(routes()).not.toContain('ResetPassword');
    expect(routes()).toEqual(['Home']);
  });
});

describe('recupero da avvio a freddo', () => {
  it('reset concluso: indietro non torna al reset', async () => {
    mockGetInitialURL.mockResolvedValue('rahitalia://reset-password?code=cold');
    const ui = await mount();
    expect(routes()).toEqual(['Home', 'ResetPassword']);
    expect(nav.canGoBack()).toBe(true);
    await finishReset(ui);
    expect(routes()).not.toContain('ResetPassword');
    expect(routes()).toEqual(['Home']);
  });
});

it('secondo link di recupero: una sola Reimposta password in pila', async () => {
  await mount();
  await openLink('rahitalia://reset-password?code=first');
  expect(routes()).toEqual(['Home', 'ResetPassword']);
  // La persona lascia il primo reset in cronologia prima di aprire l'altra email.
  act(() => nav.navigate('Account'));
  await settle();
  expect(routes()).toEqual(['Home', 'ResetPassword', 'Account']);
  await openLink('rahitalia://reset-password?code=second');
  expect(recovery).toHaveBeenCalledTimes(2);
  expect(routes().filter(name => name === 'ResetPassword')).toHaveLength(1);
  expect(routes()).toEqual(['Home', 'ResetPassword']);
  expect(nav.canGoBack()).toBe(true);
});
