import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { CompleteProfileScreen } from '@/features/auth/screens/CompleteProfileScreen';
import { useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';

const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: mockGoBack }),
}));

jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// La creazione profilo social è ora una singola RPC atomica (profilo + consenso Art.7 nella
// stessa transazione, finding 236/241): niente più .from('profiles').upsert + recordConsent.
jest.mock('@/shared/auth/supabaseClient', () => {
  const rpc = jest.fn(() => Promise.resolve({ error: null }));
  return { supabase: { rpc } };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const rpcMock = (supabase as unknown as { rpc: jest.Mock }).rpc;

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
  // Città via autocomplete: digita e seleziona il primo comune suggerito
  // (la selezione auto-compila la provincia, qui Roma → RM).
  set('Città', 'Roma');
  fireEvent.press(getByTestId('city-option-0') as never);
  // Data di nascita via date picker: apre il campo e conferma (mock → 1990-01-01).
  fireEvent.press(getByLabelText('Data di nascita') as never);
  fireEvent.press(getByTestId('date-picker') as never);
  fireEvent.press(getByRole('checkbox') as never); // consenso privacy
};

describe('CompleteProfileScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('al completamento chiama la RPC atomica profilo+consenso (Art.7), senza recordConsent client', async () => {
    const recordConsent = jest.fn().mockResolvedValue({ error: null });
    mockUseAuth.mockReturnValue(makeAuth({ recordConsent }));

    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() =>
      expect(rpcMock).toHaveBeenCalledWith(
        'complete_social_profile',
        expect.objectContaining({ p_first_name: 'Mario', p_last_name: 'Rossi' })
      )
    );
    // Il consenso è dentro la transazione dell'RPC: nessun secondo round-trip client.
    expect(recordConsent).not.toHaveBeenCalled();
    await waitFor(() => expect(mockGoBack).toHaveBeenCalled());
  });

  it('mostra il campo Paese e la RPC include country (default IT)', async () => {
    mockUseAuth.mockReturnValue(makeAuth());
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    expect(getByText('Paese')).toBeTruthy();
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(rpcMock).toHaveBeenCalled());
    expect(rpcMock).toHaveBeenCalledWith(
      'complete_social_profile',
      expect.objectContaining({ p_country: 'IT' })
    );
  });

  it('S10: la RPC NON riceve marketing_consent (preserva la cache del consenso)', async () => {
    mockUseAuth.mockReturnValue(makeAuth());
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(rpcMock).toHaveBeenCalled());
    const [, payload] = rpcMock.mock.calls[0];
    expect(payload).toEqual(
      expect.not.objectContaining({ marketing_consent: expect.anything() })
    );
    expect(payload).toEqual(
      expect.not.objectContaining({ p_marketing_consent: expect.anything() })
    );
  });

  it('errore RPC → mostra errore e NON naviga via (nessuno stato parziale)', async () => {
    mockUseAuth.mockReturnValue(makeAuth());
    rpcMock.mockResolvedValueOnce({ error: { message: 'boom' } });
    const { getByLabelText, getByText, getByRole, getByTestId } = render(
      <AllProviders>
        <CompleteProfileScreen />
      </AllProviders>
    );
    fillValidForm(getByLabelText, getByRole, getByTestId);
    fireEvent.press(getByText('Salva e continua'));

    await waitFor(() => expect(rpcMock).toHaveBeenCalled());
    // Atomico: RPC fallita → niente commit parziale, resta sulla schermata (no goBack).
    expect(mockGoBack).not.toHaveBeenCalled();
  });
});
