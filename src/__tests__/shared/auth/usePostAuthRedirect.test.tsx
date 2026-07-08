import React from 'react';
import { render } from '@testing-library/react-native';

import { usePostAuthRedirect } from '@/shared/auth/usePostAuthRedirect';
import { useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import type { Profile } from '@/shared/auth/types';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@/shared/auth/AuthContext', () => ({ useAuth: jest.fn() }));
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Solo i 5 campi che l'hook legge; il resto di AuthState non è pertinente qui.
type NavState = Pick<
  AuthState,
  'status' | 'profileLoaded' | 'profile' | 'needsReConsent' | 'reConsentLoaded'
>;
const setAuth = (s: NavState): void => {
  mockUseAuth.mockReturnValue(s as unknown as AuthState);
};

const PROFILE: Profile = {
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
};

const Harness: React.FC = () => {
  usePostAuthRedirect();
  return null;
};

// Rende prima lo stato "login mostrato" (unauthenticated) poi lo stato target:
// così wasUnauthRef registra la transizione avvenuta SU questa schermata.
const renderTransition = (target: NavState) => {
  setAuth({
    status: 'unauthenticated',
    profileLoaded: false,
    profile: null,
    needsReConsent: false,
    reConsentLoaded: false,
  });
  const view = render(<Harness />);
  setAuth(target);
  view.rerender(<Harness />);
  return view;
};

describe('usePostAuthRedirect', () => {
  beforeEach(() => jest.clearAllMocks());

  it('profilo completo (re-consenso risolto, non dovuto) → Home', () => {
    renderTransition({
      status: 'authenticated',
      profileLoaded: true,
      profile: PROFILE,
      needsReConsent: false,
      reConsentLoaded: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });

  it('nessun profilo (social 1ª volta) → CompleteProfile', () => {
    renderTransition({
      status: 'authenticated',
      profileLoaded: true,
      profile: null,
      needsReConsent: false,
      reConsentLoaded: false,
    });
    expect(mockNavigate).toHaveBeenCalledWith('CompleteProfile');
  });

  it('profilo con re-consenso DOVUTO → NON redirige (gate GDPR inline)', () => {
    renderTransition({
      status: 'authenticated',
      profileLoaded: true,
      profile: PROFILE,
      needsReConsent: true,
      reConsentLoaded: true,
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('profilo completo ma re-consenso NON ancora risolto → attende (no redirect)', () => {
    renderTransition({
      status: 'authenticated',
      profileLoaded: true,
      profile: PROFILE,
      needsReConsent: false,
      reConsentLoaded: false,
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('profilo non ancora determinato (profileLoaded=false) → attende', () => {
    renderTransition({
      status: 'authenticated',
      profileLoaded: false,
      profile: null,
      needsReConsent: false,
      reConsentLoaded: false,
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('utente GIÀ autenticato all’apertura (nessuna transizione) → NON redirige', () => {
    // Apertura del profilo dall’avatar: mai passato da unauthenticated su questa
    // schermata → il profilo resta visualizzabile, niente redirect.
    setAuth({
      status: 'authenticated',
      profileLoaded: true,
      profile: PROFILE,
      needsReConsent: false,
      reConsentLoaded: true,
    });
    render(<Harness />);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
