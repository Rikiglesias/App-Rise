// C97 (giro valido del delta 1, abc-1, f2-1, f1-1): l'ingresso di B può smontare la schermata
// di A, per esempio passando fra cancello e app. Una conferma rimasta aperta o un salvataggio
// in corso continuano a vivere fuori dalla schermata e non devono agire su B. File NUOVO (R27).
import React from 'react';
import { Alert } from 'react-native';
import type { AlertButton } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { DeleteAccountScreen } from '@/features/auth/screens/DeleteAccountScreen';
import { ProfileEditScreen } from '@/features/auth/screens/ProfileEditScreen';
import { useAuth, type AuthState } from '@/shared/auth/AuthContext';
import type { Profile } from '@/shared/auth/types';
import itLocale from '@/locales/it';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    popTo: jest.fn(),
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => false,
    getState: () => ({ routeNames: ['Account', 'ProfileEdit'] }),
  }),
}));
jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: {
    rpc: jest.fn().mockResolvedValue({ data: true, error: null }),
    auth: { updateUser: jest.fn() },
  },
}));

const profiloDiA: Profile = {
  id: 'A',
  first_name: 'Anna',
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birth_date: '1990-01-01',
  contact_email: 'A@contatto.test',
  nickname: null,
  privacy_consent_at: '2026-01-01T00:00:00Z',
  marketing_consent: false,
  deletion_requested_at: null,
};

const updateProfile = jest.fn();
const updateEmail = jest.fn();
const deleteAccountNow = jest.fn();
let collegato: string | null = 'A';
const statoDiA = {
  status: 'authenticated',
  session: { user: { id: 'A', email: 'A@account.test' } } as Session,
  profile: profiloDiA,
  profileLoaded: true,
  profileError: null,
  needsReConsent: false,
  refreshProfile: jest.fn(),
  updateProfile,
  updateEmail,
  deleteAccountNow,
  scheduleDeletion: jest.fn(),
  signOut: jest.fn(),
  utenteCollegato: () => collegato,
} as unknown as AuthState;

/** Il salvataggio di A resta in rete; poi la schermata si smonta. */
const salvataggioInCorsoESchermataSmontata = async () => {
  let finisci!: (r: { error: null }) => void;
  updateProfile.mockReturnValue(new Promise(r => (finisci = r)));
  const ui = render(
    <AllProviders>
      <ProfileEditScreen />
    </AllProviders>
  );
  fireEvent.changeText(ui.getByLabelText('Nome'), 'Annalisa');
  fireEvent.changeText(ui.getByLabelText('Email'), 'nuova-a@account.test');
  fireEvent.press(ui.getByRole('button', { name: 'Salva modifiche' }));
  await waitFor(() => expect(updateProfile).toHaveBeenCalledTimes(1));
  ui.unmount();
  return finisci;
};

let alertSpy: jest.SpyInstance;
const conferme: AlertButton[][] = [];
beforeEach(() => {
  jest.clearAllMocks();
  conferme.length = 0;
  alertSpy = jest
    .spyOn(Alert, 'alert')
    .mockImplementation((_titolo, _testo, pulsanti) => {
      if (pulsanti) conferme.push(pulsanti);
    });
  jest.mocked(useAuth).mockReturnValue(statoDiA);
  updateEmail.mockResolvedValue({ error: null });
  deleteAccountNow.mockResolvedValue({ error: null });
  collegato = 'A';
});
afterEach(() => alertSpy.mockRestore());

it('elimina account: conferma rimasta aperta, schermata smontata ed entra B, B non si cancella', async () => {
  const ui = render(
    <AllProviders>
      <DeleteAccountScreen />
    </AllProviders>
  );
  fireEvent.press(ui.getByText(itLocale.auth.delete.now));
  const conferma = conferme.at(-1)?.find(b => b.style === 'destructive');

  ui.unmount();
  collegato = 'B';
  await act(async () => {
    conferma?.onPress?.();
    await new Promise(resolve => setImmediate(resolve));
  });

  expect(deleteAccountNow).not.toHaveBeenCalled();
});

it('modifica profilo: salvataggio in corso, schermata smontata ed entra B, nessun cambio email su B', async () => {
  const finisci = await salvataggioInCorsoESchermataSmontata();
  collegato = 'B';
  await act(async () => {
    finisci({ error: null });
    await new Promise(resolve => setImmediate(resolve));
  });
  expect(updateEmail).not.toHaveBeenCalled();
});

it('modifica profilo: A esce mentre salva e resta collegato, il cambio email non si perde', async () => {
  const finisci = await salvataggioInCorsoESchermataSmontata();
  await act(async () => {
    finisci({ error: null });
    await new Promise(resolve => setImmediate(resolve));
  });
  expect(updateEmail).toHaveBeenCalledWith('nuova-a@account.test');
});
