import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';
import { AllProviders } from '../../helpers/testProviders';
import { ResetPasswordScreen } from '@/features/auth/screens/ResetPasswordScreen';
import { AuthBackDisabledContext } from '@/features/auth/components/AuthBackButton';
import { useAuth, type AuthState } from '@/shared/auth/AuthContext';

// «Annulla» nel cancello (C88) mentre la password nuova è già partita: uscire adesso
// lascerebbe la richiesta in volo, e la password cambierebbe dopo un «Annulla» che
// la persona ha creduto riuscito.
const mockPopTo = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    popTo: mockPopTo,
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => false,
    getState: () => ({ routeNames: ['CompleteProfile', 'ResetPassword'] }),
  }),
}));
jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: { auth: { updateUser: jest.fn() } },
}));

const updatePassword = jest.fn();

const apri = () => {
  jest.mocked(useAuth).mockReturnValue({
    status: 'authenticated',
    session: { user: { id: 'u1', email: 'mario@example.test' } } as Session,
    profile: null,
    profileLoaded: true,
    updatePassword,
  } as unknown as AuthState);
  return render(
    <AllProviders>
      <AuthBackDisabledContext.Provider value>
        <ResetPasswordScreen />
      </AuthBackDisabledContext.Provider>
    </AllProviders>
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  // La richiesta resta in volo per tutto il test.
  updatePassword.mockReturnValue(new Promise(() => {}));
});

it('reset nel cancello: Annulla prima del salvataggio torna al passaggio obbligatorio', () => {
  const ui = apri();
  fireEvent.press(ui.getByRole('button', { name: 'Annulla' }));
  expect(mockPopTo).toHaveBeenCalledWith('CompleteProfile');
});

it('reset nel cancello: Annulla spento mentre la password nuova è in volo', () => {
  const ui = apri();
  fireEvent.changeText(ui.getByLabelText('Nuova password'), 'Abcd123!');
  fireEvent.changeText(ui.getByLabelText('Conferma password'), 'Abcd123!');
  fireEvent.press(ui.getByRole('button', { name: 'Salva password' }));
  expect(updatePassword).toHaveBeenCalledTimes(1);

  const annulla = ui.getByRole('button', { name: 'Annulla' });
  expect(annulla).toBeDisabled();
  fireEvent.press(annulla);
  expect(mockPopTo).not.toHaveBeenCalled();
});
