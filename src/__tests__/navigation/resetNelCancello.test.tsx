/**
 * C88 (contratto android-play): «Reimposta password» aperta da un link mentre è attivo il cancello
 * del profilo. Prima del successo c'è «Annulla», che porta alla radice dell'albero del cancello della
 * sessione ATTIVA (Completa profilo o Ri-consenso). L'indietro di sistema resta assorbito (C31).
 * Il navigatore è quello vero, come in `accountNavigation.test.tsx`.
 */
import React from 'react';
import { BackHandler } from 'react-native';
import { act, cleanup, fireEvent, render } from '@testing-library/react-native';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import type { Session } from '@supabase/supabase-js';

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
jest.mock('@/features/home/screens/HomeScreen', () => () => null);
jest.mock('@/features/about/screens/ChiSiamoScreen', () => () => null);
jest.mock('@/features/social/screens/SeguiciScreen', () => () => null);

const profilo = (id: string) => ({
  id,
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birth_date: '1990-03-25',
  contact_email: `${id}@example.it`,
  nickname: null,
  marketing_consent: false,
  privacy_consent_at: '2026-01-01T00:00:00Z',
  deletion_requested_at: null,
});
/** Collegato con il profilo da completare (manca il telefono): il cancello è Completa profilo. */
const daCompletare = (id: string): AuthState =>
  ({
    status: 'authenticated',
    session: { user: { id, email: `${id}@example.it` } } as unknown as Session,
    profile: { ...profilo(id), phone: null },
    profileLoaded: true,
    needsReConsent: false,
    signOut: jest.fn().mockResolvedValue({ error: null }),
    updatePassword: jest.fn().mockResolvedValue({ error: null }),
    acceptCurrentPolicy: jest.fn().mockResolvedValue({ error: null }),
  }) as unknown as AuthState;
/** Collegato col profilo completo ma con l'informativa da riaccettare: il cancello è Ri-consenso. */
const daRiaccettare = (id: string): AuthState => ({
  ...daCompletare(id),
  profile: profilo(id),
  needsReConsent: true,
});

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
  jest.mocked(useAuth).mockImplementation(() => auth);
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

const app = () => (
  <AllProviders>
    <AppNavigator />
  </AllProviders>
);
const settle = () => act(() => jest.runOnlyPendingTimers());
const systemBack = () => {
  act(() => {
    for (const handler of [...backListeners].reverse()) if (handler()) break;
  });
  settle();
};
/** Il link di recupero: `useAuthDeepLink` stabilisce la sessione e apre la rotta. */
const apriLink = () => {
  act(() => nav.navigate('ResetPassword'));
  settle();
  expect(nav.getCurrentRoute()?.name).toBe('ResetPassword');
};
const annulla = (ui: ReturnType<typeof render>) => {
  const pulsante = ui.queryByRole('button', { name: i18n.t('common.cancel') });
  expect(pulsante).not.toBeNull();
  if (pulsante) fireEvent.press(pulsante);
  settle();
};

// I due passaggi obbligatori del cancello, un montaggio ciascuno.
describe.each([
  ['Completa profilo', daCompletare, 'CompleteProfile'],
  ['Ri-consenso', daRiaccettare, 'ReConsent'],
] as const)('%s', (_nome, stato, radice) => {
  it('reset nel cancello: Annulla torna al passaggio obbligatorio', () => {
    auth = stato('a');
    const ui = render(app());
    settle();
    apriLink();
    // L'indietro di sistema resta assorbito (C31): l'uscita è «Annulla».
    systemBack();
    expect(nav.getCurrentRoute()?.name).toBe('ResetPassword');
    annulla(ui);
    expect(nav.getCurrentRoute()?.name).toBe(radice);
  });
});

it("reset nel cancello col link di un altro account che ha anche lui il cancello: Annulla va alla radice del cancello dell'account collegato", () => {
  // A è dietro Completa profilo; il link è di B, che deve riaccettare l'informativa.
  auth = daCompletare('a');
  const ui = render(app());
  settle();
  apriLink();
  auth = daRiaccettare('b');
  ui.rerender(app());
  settle();
  expect(nav.getCurrentRoute()?.name).toBe('ResetPassword');
  annulla(ui);
  expect(nav.getCurrentRoute()?.name).toBe('ReConsent');
  expect(ui.getByText(i18n.t('auth.consents.reconsentTitle'))).toBeTruthy();
});
