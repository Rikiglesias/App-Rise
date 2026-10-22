/**
 * C54 (contratto android-play): barra delle schede, le tre schede e le schermate dell'account si
 * ridisegnano con la finestra nuova senza riavvio. Oracolo e finestre in `helpers/cambioFinestra`.
 * L'intestazione delle schede ha il suo test in `TabHeader.test.tsx` (margine destro e inset).
 */
import React from 'react';
import { act } from '@testing-library/react-native';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';

import {
  provaCambioFinestra,
  ripristinaFinestra,
} from '../helpers/cambioFinestra';
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

let nav: NavigationContainerRefWithCurrent<RootStackParamList>;

beforeEach(() => {
  jest.useFakeTimers();
  i18n.locale = 'it';
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
  ripristinaFinestra();
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const app = () => (
  <UniversalThemeProvider initialTheme="light">
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  </UniversalThemeProvider>
);
const settle = () => act(() => jest.runOnlyPendingTimers());
const apri = (move?: () => void) => () => {
  if (move) act(move);
  settle();
};

it('rotazione: barra delle schede si ridisegna con le nuove dimensioni', () => {
  provaCambioFinestra({
    elemento: app,
    apri: apri(),
    assesta: settle,
    testID: 'bottom-tab-bar',
  });
});

it('rotazione: Home si ridisegna con le nuove dimensioni', () => {
  provaCambioFinestra({
    elemento: app,
    apri: apri(),
    assesta: settle,
    testID: 'home-screen',
  });
});

it('rotazione: Impatto si ridisegna con le nuove dimensioni', () => {
  provaCambioFinestra({
    elemento: app,
    apri: apri(() => nav.navigate('Home', { screen: 'ImpactTab' })),
    assesta: settle,
    testID: 'impact-tab-screen',
  });
});

it('rotazione: Azioni si ridisegna con le nuove dimensioni', () => {
  provaCambioFinestra({
    elemento: app,
    apri: apri(() => nav.navigate('Home', { screen: 'InfoTab' })),
    assesta: settle,
    testID: 'contribute-tab-screen',
  });
});

it("rotazione: schermate dell'account si ridisegna con le nuove dimensioni", () => {
  // Tutte usano lo stesso impianto (`AuthScreen`); da ospite si aprono queste tre.
  for (const pagina of ['Account', 'SignUp', 'ForgotPassword'] as const) {
    provaCambioFinestra({
      elemento: app,
      apri: apri(() => nav.navigate(pagina)),
      assesta: settle,
      testID: 'auth-content',
    });
  }
});
