import React from 'react';
import { render } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import AppNavigator from '@/navigation/AppNavigator';
import { useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import type { Profile } from '@/shared/auth/types';

/**
 * Il cancello del profilo (F-P7, decisione A4): chi ha fatto l'accesso e non ha finito
 * di dare i propri dati non vede l'app, vede il passaggio di completamento.
 *
 * Qui si prova la parte che DECIDE, cioè quale albero viene montato: è lì che vive la
 * scelta nostra. I due alberi sono sostituiti da segnaposto, così il test parla del
 * cancello e non dei dettagli interni di React Navigation. Quali rotte esistono dietro
 * il cancello è provato a parte, sul navigatore VERO (`profileGateRoutes.test.tsx`).
 */
jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/shared/auth/useAuthDeepLink', () => ({
  useAuthDeepLink: jest.fn(),
}));

jest.mock('@/navigation/MainStackNavigator', () => {
  const { Text } = jest.requireActual('react-native');
  const React_ = jest.requireActual('react');
  return {
    __esModule: true,
    default: () => React_.createElement(Text, null, 'APP-INTERA'),
  };
});

jest.mock('@/navigation/ProfileGateNavigator', () => {
  const { Text } = jest.requireActual('react-native');
  const React_ = jest.requireActual('react');
  return {
    __esModule: true,
    default: () => React_.createElement(Text, null, 'CANCELLO'),
  };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const completeProfile: Profile = {
  id: 'u1',
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+391234567',
  city: 'Milano',
  province: 'MI',
  country: 'IT',
  birth_date: '1990-01-01',
  privacy_consent_at: '2026-01-01T00:00:00Z',
  marketing_consent: false,
  deletion_requested_at: null,
  contact_email: 'mario@example.it',
};

const makeAuth = (over: Partial<AuthState>): AuthState =>
  ({
    status: 'authenticated',
    session: { user: { id: 'u1', email: 'mario@example.it' } } as Session,
    profile: null,
    profileLoaded: false,
    signOut: jest.fn(),
    needsReConsent: false,
    ...over,
  }) as AuthState;

const renderApp = (auth: Partial<AuthState>) => {
  mockUseAuth.mockReturnValue(makeAuth(auth));
  return render(<AppNavigator />);
};

describe('cancello del profilo — quale albero viene montato', () => {
  it('sbarra la strada a chi è autenticato e non ha ancora un profilo (stato «absent»)', () => {
    // `profileLoaded: true` + `profile: null` = assenza CONFERMATA dal server (PGRST116).
    // È lo stato in cui si trovano oggi i due account veri.
    const { getByText } = renderApp({ profileLoaded: true, profile: null });
    expect(getByText('CANCELLO')).toBeTruthy();
  });

  it('sbarra la strada al profilo incompleto (manca il telefono)', () => {
    const { getByText } = renderApp({
      profileLoaded: true,
      profile: { ...completeProfile, phone: null },
    });
    expect(getByText('CANCELLO')).toBeTruthy();
  });

  it('sbarra la strada al profilo senza città', () => {
    const { getByText } = renderApp({
      profileLoaded: true,
      profile: { ...completeProfile, city: null },
    });
    expect(getByText('CANCELLO')).toBeTruthy();
  });

  it('sbarra la strada al profilo italiano senza provincia', () => {
    const { getByText } = renderApp({
      profileLoaded: true,
      profile: { ...completeProfile, province: null },
    });
    expect(getByText('CANCELLO')).toBeTruthy();
  });

  it('NON pretende la provincia da un profilo estero', () => {
    // Per i paesi esteri il trigger scrive `null` per costruzione: pretenderla sarebbe
    // un cancello che non si può aprire.
    const { getByText } = renderApp({
      profileLoaded: true,
      profile: { ...completeProfile, country: 'FR', province: null },
    });
    expect(getByText('APP-INTERA')).toBeTruthy();
  });

  it('sbarra la strada al profilo senza mail di contatto', () => {
    const { getByText } = renderApp({
      profileLoaded: true,
      profile: { ...completeProfile, contact_email: null },
    });
    expect(getByText('CANCELLO')).toBeTruthy();
  });

  it('lascia passare il profilo completo', () => {
    const { getByText } = renderApp({
      profileLoaded: true,
      profile: completeProfile,
    });
    expect(getByText('APP-INTERA')).toBeTruthy();
  });

  it('NON sbarra la strada all’ospite: da ospite si dona senza account', () => {
    // È l'unica strada in cui il denaro passa senza registrazione: un cancello davanti
    // all'app la ucciderebbe. Il cancello sta DOPO l'accesso, mai prima.
    const { getByText } = renderApp({
      status: 'unauthenticated',
      session: null,
      profileLoaded: false,
      profile: null,
    });
    expect(getByText('APP-INTERA')).toBeTruthy();
  });

  it('NON sbarra la strada mentre il profilo è ancora ignoto (avvio, o rete giù)', () => {
    // `profileLoaded: false` è anche lo stato dopo un errore di rete: `AuthContext` lo
    // alza solo sull'assenza confermata. Bloccare qui chiuderebbe fuori dall'app chi ha
    // il profilo a posto solo perché è caduta la connessione.
    const { getByText } = renderApp({ profileLoaded: false, profile: null });
    expect(getByText('APP-INTERA')).toBeTruthy();
  });

  it('restituisce l’app appena il profilo diventa completo, senza navigazioni a mano', () => {
    mockUseAuth.mockReturnValue(
      makeAuth({ profileLoaded: true, profile: null })
    );
    const { getByText, rerender } = render(<AppNavigator />);
    expect(getByText('CANCELLO')).toBeTruthy();

    mockUseAuth.mockReturnValue(
      makeAuth({ profileLoaded: true, profile: completeProfile })
    );
    rerender(<AppNavigator />);
    expect(getByText('APP-INTERA')).toBeTruthy();
  });
});
