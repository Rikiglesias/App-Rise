import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { DeleteAccountScreen } from '@/features/auth/screens/DeleteAccountScreen';
import { ProfileScreen } from '@/features/auth/screens/ProfileScreen';
import { useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import type { Profile } from '@/shared/auth/types';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const makeAuth = (over: Partial<AuthState> = {}): AuthState =>
  ({
    status: 'authenticated',
    session: {
      user: { id: 'u1', email: 'm@r.it', identities: [] },
    } as unknown as Session,
    profile: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    signInWithApple: jest.fn(),
    signInWithGoogle: jest.fn(),
    refreshProfile: jest.fn(),
    deleteAccountNow: jest.fn(),
    scheduleDeletion: jest.fn(),
    cancelScheduledDeletion: jest.fn(),
    exportData: jest.fn(),
    ...over,
  }) as AuthState;

const profileWithDeletion: Profile = {
  id: 'u1',
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  birth_date: '1990-01-01',
  privacy_consent_at: '2026-01-01T00:00:00.000Z',
  marketing_consent: false,
  deletion_requested_at: '2026-06-15T00:00:00.000Z',
};

const wrap = (ui: React.ReactElement) =>
  render(<AllProviders>{ui}</AllProviders>);

describe('DeleteAccountScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('mostra le due opzioni di eliminazione', () => {
    mockUseAuth.mockReturnValue(makeAuth());
    const { getByText } = wrap(<DeleteAccountScreen />);
    expect(getByText('Elimina subito')).toBeTruthy();
    expect(getByText('Elimina tra 30 giorni')).toBeTruthy();
  });

  it('senza conferma dell’Alert NON elimina (doppia conferma)', () => {
    const deleteAccountNow = jest.fn();
    mockUseAuth.mockReturnValue(makeAuth({ deleteAccountNow }));
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation(() => undefined);
    const { getByText } = wrap(<DeleteAccountScreen />);
    fireEvent.press(getByText('Elimina subito'));
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(deleteAccountNow).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});

describe('ProfileScreen (autenticato)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('mostra le CTA esporta dati ed elimina account', () => {
    mockUseAuth.mockReturnValue(makeAuth());
    const { getByText } = wrap(<ProfileScreen />);
    expect(getByText('Esporta i miei dati')).toBeTruthy();
    expect(getByText('Elimina account')).toBeTruthy();
  });

  it('mostra il banner di cancellazione programmata con annulla', () => {
    mockUseAuth.mockReturnValue(makeAuth({ profile: profileWithDeletion }));
    const { getByText } = wrap(<ProfileScreen />);
    expect(getByText('Annulla eliminazione')).toBeTruthy();
  });
});
