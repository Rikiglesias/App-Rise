/**
 * Intestazione delle schede con il pulsante account (C30 e C54 del contratto android-play).
 *
 * Il mock globale di `react-native-safe-area-context` (jest.setup.js) restituisce sempre inset 0:
 * qui `useSafeAreaInsets` è sostituito nel file, altrimenti inset e margini si confronterebbero
 * con zero e passerebbero a vuoto.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { act, cleanup, render, within } from '@testing-library/react-native';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';

import AppNavigator from '@/navigation/AppNavigator';
import type { RootStackParamList } from '@/navigation/types';
import { useAuth, type AuthState } from '@/shared/auth/AuthContext';
import { useAuthDeepLink } from '@/shared/auth/useAuthDeepLink';
import { ThemeProvider } from '@/shared/hooks/useTheme';
import { UniversalThemeProvider } from '@/shared/theme/UniversalTheme';
import i18n from '@/locales';

jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/shared/auth/useAuthDeepLink', () => ({
  useAuthDeepLink: jest.fn(),
}));
jest.mock('expo-haptics');
jest.mock('@/features/home/components/HomeHeaderSection', () => ({
  HomeHeaderSection: () => null,
}));
jest.mock('@/features/home/components/EntraInAzione', () => ({
  EntraInAzione: () => null,
}));
jest.mock('@/features/actions', () => ({ ContributeTabScreen: () => null }));
jest.mock('@/features/impact', () => ({ ImpactTabScreen: () => null }));
jest.mock('@/features/impact/screens/MapModalScreen', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/features/impact/screens/MealsScreen', () => ({
  __esModule: true,
  default: () => null,
}));

// L'oggetto del mock, non una sua copia: `import * as` su un modulo senza __esModule
// ne crea una e lo spy non arriverebbe al componente.
const SafeArea = jest.requireMock<
  typeof import('react-native-safe-area-context')
>('react-native-safe-area-context');
let nav: NavigationContainerRefWithCurrent<RootStackParamList>;
let insets = { top: 24, right: 0, bottom: 0, left: 0 };

beforeEach(() => {
  jest.useFakeTimers();
  i18n.locale = 'it';
  insets = { top: 24, right: 0, bottom: 0, left: 0 };
  jest.spyOn(SafeArea, 'useSafeAreaInsets').mockImplementation(() => insets);
  jest.mocked(useAuth).mockReturnValue({
    status: 'unauthenticated',
    session: null,
    profile: null,
    profileLoaded: false,
    needsReConsent: false,
  } as unknown as AuthState);
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

const app = (theme: 'light' | 'dark' = 'light') => (
  <UniversalThemeProvider initialTheme={theme}>
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  </UniversalThemeProvider>
);
const settle = () => act(() => jest.runOnlyPendingTimers());
const goTo = (move: () => void) => {
  act(move);
  settle();
};
const headerStyle = (ui: ReturnType<typeof render>) =>
  StyleSheet.flatten(ui.getByTestId('tab-header').props.style);

// Rapporto di contrasto WCAG 2.x fra due colori #RRGGBB.
const channel = (hex: string, at: number) => {
  const c = parseInt(hex.slice(at, at + 2), 16) / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string) =>
  0.2126 * channel(hex, 1) +
  0.7152 * channel(hex, 3) +
  0.0722 * channel(hex, 5);
const contrast = (a: string, b: string) => {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

it('account in alto: assente nelle pagine interne', () => {
  const ui = render(app());
  goTo(() => nav.navigate('Home', { screen: 'ImpactTab' }));
  expect(ui.getByTestId('account-header-button')).toBeTruthy();
  goTo(() =>
    nav.navigate('Home', { screen: 'ImpactTab', params: { screen: 'Meals' } })
  );
  expect(nav.getCurrentRoute()?.name).toBe('Meals');
  expect(ui.queryByTestId('account-header-button')).toBeNull();

  goTo(() => nav.navigate('Home', { screen: 'HomeTab' }));
  expect(ui.getByTestId('account-header-button')).toBeTruthy();
  goTo(() => nav.navigate('Account'));
  expect(nav.getCurrentRoute()?.name).toBe('Account');
  expect(ui.queryByTestId('account-header-button')).toBeNull();
});

it("account in alto: inset superiore solo nell'intestazione", () => {
  const ui = render(app());
  expect(nav.getCurrentRoute()?.name).toBe('HomeTab');
  expect(headerStyle(ui).paddingTop).toBe(24);
  expect(ui.getByTestId('home-screen').props.edges).not.toContain('top');
});

it('account in alto: icona leggibile in chiaro e in scuro', () => {
  for (const theme of ['light', 'dark'] as const) {
    const ui = render(app(theme));
    for (const tab of ['ImpactTab', 'HomeTab', 'InfoTab'] as const) {
      goTo(() => nav.navigate('Home', { screen: tab }));
      const background = headerStyle(ui).backgroundColor as string;
      const icon = within(
        ui.getByTestId('account-header-button')
      ).UNSAFE_getByProps({ name: 'account-circle-outline' });
      expect(background).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(contrast(icon.props.color, background)).toBeGreaterThanOrEqual(3);
    }
    ui.unmount();
  }
});

it('rotazione: intestazione delle schede si ridisegna con le nuove dimensioni', () => {
  const ui = render(app());
  expect(headerStyle(ui).paddingRight).toBeLessThan(44);
  // Orizzontale con il notch a destra: il pulsante non deve finirci sotto.
  insets = { top: 0, right: 44, bottom: 0, left: 0 };
  ui.rerender(app());
  settle();
  expect(headerStyle(ui).paddingRight).toBeGreaterThanOrEqual(44);
  expect(headerStyle(ui).paddingTop).toBe(0);
});
