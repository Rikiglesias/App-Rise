import React from 'react';
import { Alert } from 'react-native';
import type { AlertButton } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { ProfileEditScreen } from '@/features/auth/screens/ProfileEditScreen';
import { DeleteAccountScreen } from '@/features/auth/screens/DeleteAccountScreen';
import { useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import type { Profile } from '@/shared/auth/types';
import itLocale from '@/locales/it';

// «Modifica profilo» ed «Elimina account» appartengono a chi le ha aperte: un link
// di un altro account aperto mentre sono a schermo cambia la sessione senza logout,
// e da lì un «Salva» o una conferma rimasta aperta agirebbero sull'account nuovo.
const mockPopTo = jest.fn();
let mockRotte: string[] = [];
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => false,
    popTo: mockPopTo,
    getState: () => ({ routeNames: mockRotte }),
  }),
}));

jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const sessione = (id: string, email: string): Session =>
  ({ user: { id, email, identities: [] } }) as unknown as Session;

const profilo = (id: string, nome: string): Profile => ({
  id,
  first_name: nome,
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birth_date: '1990-01-01',
  privacy_consent_at: '2026-01-01T00:00:00.000Z',
  marketing_consent: false,
  deletion_requested_at: null,
  contact_email: `${id}@contatto.it`,
  nickname: null,
});

const makeAuth = (over: Partial<AuthState>): AuthState =>
  ({
    status: 'authenticated',
    profileLoaded: true,
    signOut: jest.fn().mockResolvedValue({ error: null }),
    refreshProfile: jest.fn(),
    updateProfile: jest.fn().mockResolvedValue({ error: null }),
    updateEmail: jest.fn().mockResolvedValue({ error: null }),
    deleteAccountNow: jest.fn().mockResolvedValue({ error: null }),
    scheduleDeletion: jest.fn().mockResolvedValue({ error: null }),
    needsReConsent: false,
    ...over,
  }) as AuthState;

const comeA = (over: Partial<AuthState> = {}) =>
  makeAuth({
    session: sessione('A', 'a@r.it'),
    profile: profilo('A', 'Anna'),
    ...over,
  });
const comeB = (over: Partial<AuthState> = {}) =>
  makeAuth({
    session: sessione('B', 'b@r.it'),
    profile: profilo('B', 'Bruno'),
    ...over,
  });

const conProvider = (ui: React.ReactElement) => (
  <AllProviders>{ui}</AllProviders>
);

/** Tiene da parte i pulsanti dell'ultima conferma, senza premerli: la persona la lascia aperta. */
const conferme: AlertButton[][] = [];
const premiConfermaRimastaAperta = async () => {
  const distruttivo = conferme.at(-1)?.find(b => b.style === 'destructive');
  await act(async () => {
    distruttivo?.onPress?.();
    await Promise.resolve();
  });
};

let alertSpy: jest.SpyInstance;
beforeEach(() => {
  jest.clearAllMocks();
  conferme.length = 0;
  alertSpy = jest
    .spyOn(Alert, 'alert')
    .mockImplementation((_titolo, _testo, pulsanti) => {
      if (pulsanti) conferme.push(pulsanti);
    });
});
afterEach(() => alertSpy.mockRestore());

it('modifica profilo: al cambio di account i dati del precedente non si salvano sul nuovo', async () => {
  mockRotte = ['Home', 'Account', 'ProfileEdit', 'DeleteAccount'];
  const updateProfile = jest.fn().mockResolvedValue({ error: null });
  const updateEmail = jest.fn().mockResolvedValue({ error: null });
  mockUseAuth.mockReturnValue(comeA({ updateProfile, updateEmail }));
  const { getByText, rerender } = render(conProvider(<ProfileEditScreen />));

  mockUseAuth.mockReturnValue(comeB({ updateProfile, updateEmail }));
  rerender(conProvider(<ProfileEditScreen />));
  await act(async () => {
    fireEvent.press(getByText(itLocale.auth.edit.save));
    await Promise.resolve();
  });

  expect(updateProfile).not.toHaveBeenCalled();
  expect(updateEmail).not.toHaveBeenCalled();
  expect(mockPopTo).toHaveBeenCalledWith('Account');
});

it('elimina account: al cambio di account la schermata si chiude e non cancella', async () => {
  mockRotte = ['Home', 'Account', 'ProfileEdit', 'DeleteAccount'];
  const deleteAccountNow = jest.fn().mockResolvedValue({ error: null });
  mockUseAuth.mockReturnValue(comeA({ deleteAccountNow }));
  const { getByText, rerender } = render(conProvider(<DeleteAccountScreen />));
  // A apre la conferma e la lascia lì; nel frattempo arriva la sessione di B.
  fireEvent.press(getByText(itLocale.auth.delete.now));

  mockUseAuth.mockReturnValue(comeB({ deleteAccountNow }));
  rerender(conProvider(<DeleteAccountScreen />));
  await premiConfermaRimastaAperta();

  expect(deleteAccountNow).not.toHaveBeenCalled();
  expect(mockPopTo).toHaveBeenCalledWith('Account');
});

it('elimina account nel cancello: al cambio di account si torna al passaggio obbligatorio e non si cancella', async () => {
  // Il cancello non ha `Account`: la sua radice è il passaggio obbligatorio.
  mockRotte = ['CompleteProfile', 'DeleteAccount', 'ResetPassword'];
  const deleteAccountNow = jest.fn().mockResolvedValue({ error: null });
  mockUseAuth.mockReturnValue(comeA({ deleteAccountNow, profile: null }));
  const { getByText, rerender } = render(conProvider(<DeleteAccountScreen />));
  fireEvent.press(getByText(itLocale.auth.delete.now));

  mockUseAuth.mockReturnValue(comeB({ deleteAccountNow, profile: null }));
  rerender(conProvider(<DeleteAccountScreen />));
  await premiConfermaRimastaAperta();

  expect(deleteAccountNow).not.toHaveBeenCalled();
  expect(mockPopTo).toHaveBeenCalledWith('CompleteProfile');
  expect(mockPopTo).not.toHaveBeenCalledWith('Account');
});
