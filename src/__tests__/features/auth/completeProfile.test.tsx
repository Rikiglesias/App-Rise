import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { CompleteProfileScreen } from '@/features/auth/screens/CompleteProfileScreen';
import { useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/shared/auth/supabaseClient', () => {
  const upsert = jest.fn(() => Promise.resolve({ error: null }));
  return { supabase: { from: jest.fn(() => ({ upsert })) } };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const makeAuth = (over: Partial<AuthState> = {}): AuthState =>
  ({
    status: 'authenticated',
    session: { user: { id: 'u1', email: 'm@r.it' } } as unknown as Session,
    profile: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    signInWithApple: jest.fn(),
    signInWithGoogle: jest.fn(),
    refreshProfile: jest.fn(),
    updateProfile: jest.fn(),
    updateEmail: jest.fn(),
    deleteAccountNow: jest.fn(),
    scheduleDeletion: jest.fn(),
    cancelScheduledDeletion: jest.fn(),
    exportData: jest.fn(),
    recordConsent: jest.fn().mockResolvedValue({ error: null }),
    setMarketingConsent: jest.fn(),
    getConsentHistory: jest.fn(),
    needsReConsent: false,
    acceptCurrentPolicy: jest.fn(),
    ...over,
  }) as AuthState;

const fillValidForm = (
  getByLabelText: (t: string) => unknown,
  getByRole: (r: string) => unknown,
  getByTestId: (t: string) => unknown
): void => {
  const set = (label: string, value: string): void =>
    fireEvent.changeText(getByLabelText(label) as never, value);
  set('Nome', 'Mario');
  set('Cognome', 'Rossi');
  set('Telefono', '3331234567');
  set('Città', 'Roma');
  set('Provincia', 'RM');
  // Data di nascita via date picker: apre il campo e conferma (mock → 1990-01-01).
  fireEvent.press(getByLabelText('Data di nascita') as never);
  fireEvent.press(getByTestId('date-picker') as never);
  fireEvent.press(getByRole('checkbox') as never); // consenso privacy
};

describe('CompleteProfileScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('al completamento fa upsert profilo e registra il consenso privacy (Art.7)', async () => {
    const recordConsent = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(makeAuth({ recordConsent }));
    const upsert = (
      supabase.from('profiles') as unknown as {
        upsert: jest.Mock;
      }
    ).upsert;

    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() =>
      expect(recordConsent).toHaveBeenCalledWith('privacy_notice', 'granted')
    );
    expect(upsert).toHaveBeenCalled();
  });

  it('S10: upsert NON ri-stampa marketing_consent (preserva la cache del consenso)', async () => {
    mockUseAuth.mockReturnValue(makeAuth());
    const upsert = (
      supabase.from('profiles') as unknown as { upsert: jest.Mock }
    ).upsert;
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(upsert).toHaveBeenCalled());
    expect(upsert).toHaveBeenCalledWith(
      expect.not.objectContaining({ marketing_consent: expect.anything() })
    );
  });

  it('S10: errore upsert → NON registra il consenso (recordConsent non chiamato)', async () => {
    const recordConsent = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(makeAuth({ recordConsent }));
    const upsert = (
      supabase.from('profiles') as unknown as { upsert: jest.Mock }
    ).upsert;
    upsert.mockResolvedValueOnce({ error: { message: 'boom' } });
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(upsert).toHaveBeenCalled());
    expect(recordConsent).not.toHaveBeenCalled();
  });
});
