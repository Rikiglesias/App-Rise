import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { ProfileEditScreen } from '@/features/auth/screens/ProfileEditScreen';
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
      user: { id: 'u1', email: 'old@r.it', identities: [] },
    } as unknown as Session,
    profile: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    signInWithApple: jest.fn(),
    signInWithGoogle: jest.fn(),
    refreshProfile: jest.fn(),
    updateProfile: jest.fn().mockResolvedValue({ error: null }),
    updateEmail: jest.fn().mockResolvedValue({ error: null }),
    deleteAccountNow: jest.fn(),
    scheduleDeletion: jest.fn(),
    cancelScheduledDeletion: jest.fn(),
    exportData: jest.fn(),
    recordConsent: jest.fn(),
    setMarketingConsent: jest.fn(),
    getConsentHistory: jest.fn(),
    needsReConsent: false,
    acceptCurrentPolicy: jest.fn(),
    ...over,
  }) as AuthState;

const profile: Profile = {
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

const wrap = (ui: React.ReactElement) =>
  render(<AllProviders>{ui}</AllProviders>);

describe('ProfileEditScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('pre-popola il form coi valori del profilo', () => {
    mockUseAuth.mockReturnValue(makeAuth({ profile }));
    const { getByDisplayValue } = wrap(<ProfileEditScreen />);
    expect(getByDisplayValue('Mario')).toBeTruthy();
    expect(getByDisplayValue('Rossi')).toBeTruthy();
    expect(getByDisplayValue('old@r.it')).toBeTruthy();
    expect(getByDisplayValue('+393331234567')).toBeTruthy();
  });

  it('mostra il campo Paese (valore dal profilo)', () => {
    mockUseAuth.mockReturnValue(makeAuth({ profile }));
    const { getByText } = wrap(<ProfileEditScreen />);
    expect(getByText('Paese')).toBeTruthy();
  });

  it('telefono invalido → errore e updateProfile NON chiamato', () => {
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(makeAuth({ profile, updateProfile }));
    const { getByLabelText, getByText, queryByText } = wrap(
      <ProfileEditScreen />
    );
    fireEvent.changeText(getByLabelText('Telefono'), 'abc');
    fireEvent.press(getByText('Salva modifiche'));
    expect(queryByText('Telefono non valido (es. +39...)')).toBeTruthy();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('salva SOLO i campi cambiati (telefono)', async () => {
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    const updateEmail = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(
      makeAuth({ profile, updateProfile, updateEmail })
    );
    const { getByLabelText, getByText, findByText } = wrap(
      <ProfileEditScreen />
    );
    fireEvent.changeText(getByLabelText('Telefono'), '+393339998877');
    fireEvent.press(getByText('Salva modifiche'));
    await findByText('Profilo aggiornato.');
    expect(updateProfile).toHaveBeenCalledWith({ phone: '+393339998877' });
    expect(updateEmail).not.toHaveBeenCalled();
  });

  it('cambio email → updateEmail chiamato + nota doppia conferma', async () => {
    const updateProfile = jest.fn().mockResolvedValue({ error: null });
    const updateEmail = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(
      makeAuth({ profile, updateProfile, updateEmail })
    );
    const { getByLabelText, getByText, findByText } = wrap(
      <ProfileEditScreen />
    );
    fireEvent.changeText(getByLabelText('Email'), 'new@r.it');
    fireEvent.press(getByText('Salva modifiche'));
    await findByText(/entrambe le caselle/i);
    expect(updateEmail).toHaveBeenCalledWith('new@r.it');
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('S8: mostra il banner email-in-attesa da session.user.new_email', () => {
    mockUseAuth.mockReturnValue(
      makeAuth({
        profile,
        session: {
          user: {
            id: 'u1',
            email: 'old@r.it',
            new_email: 'pending@r.it',
            identities: [],
          },
        } as unknown as Session,
      })
    );
    const { getByText } = wrap(<ProfileEditScreen />);
    expect(getByText(/pending@r.it/)).toBeTruthy();
  });

  it('S8: senza new_email nessun banner pending', () => {
    mockUseAuth.mockReturnValue(makeAuth({ profile }));
    const { queryByText } = wrap(<ProfileEditScreen />);
    expect(queryByText(/in attesa di conferma/i)).toBeNull();
  });

  it('S12: errore updateProfile → messaggio errore e updateEmail NON chiamato', async () => {
    const updateProfile = jest.fn().mockResolvedValue({ error: 'boom' });
    const updateEmail = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(
      makeAuth({ profile, updateProfile, updateEmail })
    );
    const { getByLabelText, getByText, findByText } = wrap(
      <ProfileEditScreen />
    );
    fireEvent.changeText(getByLabelText('Telefono'), '+393339998877');
    fireEvent.press(getByText('Salva modifiche'));
    await findByText('Aggiornamento non riuscito. Riprova.');
    expect(updateEmail).not.toHaveBeenCalled();
  });
});
