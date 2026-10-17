import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { fillValidProfileForm } from '../../helpers/profileFormHelpers';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { SignUpScreen } from '@/features/auth/screens/SignUpScreen';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@/features/auth/screens/ResetPasswordScreen';
import { ProfileScreen } from '@/features/auth/screens/ProfileScreen';
import { supabase } from '@/shared/auth/supabaseClient';
import i18n from '@/locales';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockNavigate,
    canGoBack: () => false,
  }),
}));

const renderScreen = (screen: React.ReactElement) =>
  render(<AllProviders>{screen}</AllProviders>);
const offline = (): TypeError => new TypeError('Network request failed');
const retry = async (ui: ReturnType<typeof renderScreen>) => {
  expect(await ui.findByText(i18n.t('auth.errors.network'))).toBeTruthy();
  await act(async () => {
    fireEvent.press(ui.getByRole('button', { name: i18n.t('common.retry') }));
    await Promise.resolve();
  });
  expect(mockNavigate).not.toHaveBeenCalled();
};

beforeEach(() => {
  jest.clearAllMocks();
  i18n.locale = 'it';
});
afterEach(() => {
  i18n.locale = 'it';
});

// La schermata vera ripete l'accesso mantenendo le credenziali del modulo.
it('account offline: Accesso', async () => {
  (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValueOnce(
    offline()
  );
  const ui = renderScreen(<LoginScreen />);
  fireEvent.changeText(ui.getByLabelText('Email'), 'mario@example.test');
  fireEvent.changeText(ui.getByLabelText('Password'), 'Abcd123!');
  fireEvent.press(ui.getByRole('button', { name: 'Accedi' }));
  await retry(ui);
  expect(supabase.auth.signInWithPassword).toHaveBeenCalledTimes(2);
  expect((supabase.auth.signInWithPassword as jest.Mock).mock.calls[1]).toEqual(
    (supabase.auth.signInWithPassword as jest.Mock).mock.calls[0]
  );
  expect(ui.queryByText(i18n.t('auth.errors.network'))).toBeNull();
});

// Form completo: il retry arriva a signUp e mostra la conferma, senza navigare.
it('account offline: Registrazione', async () => {
  (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
    error: offline(),
  });
  const ui = renderScreen(<SignUpScreen />);
  fillValidProfileForm(
    ui.getByLabelText,
    () => ui.getAllByRole('checkbox')[0],
    ui.getByTestId
  );
  fireEvent.changeText(ui.getByLabelText('Email'), 'mario@example.test');
  fireEvent.changeText(ui.getByLabelText('Password'), 'Abcd123!');
  fireEvent.changeText(ui.getByLabelText('Conferma password'), 'Abcd123!');
  fireEvent.press(ui.getByRole('button', { name: 'Registrati' }));
  await retry(ui);
  expect(await ui.findByText(i18n.t('auth.signup.checkEmail'))).toBeTruthy();
  expect(supabase.auth.signUp).toHaveBeenCalledTimes(2);
  expect((supabase.auth.signUp as jest.Mock).mock.calls[1]).toEqual(
    (supabase.auth.signUp as jest.Mock).mock.calls[0]
  );
});

// Verifica anche l'inglese: testo rete e azione provengono dal locale attivo.
it('account offline: Password dimenticata', async () => {
  i18n.locale = 'en';
  (supabase.auth.resetPasswordForEmail as jest.Mock).mockRejectedValueOnce(
    offline()
  );
  const ui = renderScreen(<ForgotPasswordScreen />);
  fireEvent.changeText(
    ui.getByLabelText(i18n.t('auth.forgot.email')),
    'mario@example.test'
  );
  fireEvent.press(
    ui.getByRole('button', { name: i18n.t('auth.forgot.submit') })
  );
  await retry(ui);
  expect(await ui.findByText(i18n.t('auth.forgot.sent'))).toBeTruthy();
  expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledTimes(2);
});

// Ripete updateUser con la stessa password, non il percorso di navigazione finale.
it('account offline: Reimposta password', async () => {
  (supabase.auth.updateUser as jest.Mock).mockResolvedValueOnce({
    error: offline(),
  });
  const ui = renderScreen(<ResetPasswordScreen />);
  fireEvent.changeText(ui.getByLabelText('Nuova password'), 'Abcd123!');
  fireEvent.changeText(ui.getByLabelText('Conferma password'), 'Abcd123!');
  fireEvent.press(ui.getByRole('button', { name: 'Salva password' }));
  await retry(ui);
  expect(await ui.findByText(i18n.t('auth.reset.success'))).toBeTruthy();
  expect(supabase.auth.updateUser).toHaveBeenCalledTimes(2);
  expect(supabase.auth.updateUser).toHaveBeenLastCalledWith({
    password: 'Abcd123!',
  });
});

// Una lettura fallita non equivale a profilo assente: il retry legge e mostra i dati.
it('account offline: Profilo', async () => {
  const profile = {
    id: 'u1',
    first_name: 'Mario',
    last_name: 'Rossi',
    country: 'IT',
  };
  const readProfile = jest
    .fn()
    .mockRejectedValueOnce(offline())
    .mockResolvedValue({ data: profile, error: null });
  (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
    data: {
      session: { user: { id: 'u1', email: 'mario@example.test' } },
    },
  });
  const from = jest.spyOn(supabase, 'from').mockImplementation(((
    table: string
  ) => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single:
      table === 'profiles'
        ? readProfile
        : jest
            .fn()
            .mockResolvedValue({ data: { is_material: false }, error: null }),
    order: jest.fn().mockResolvedValue({ data: [], error: null }),
  })) as unknown as typeof supabase.from);
  try {
    const ui = renderScreen(<ProfileScreen />);
    await retry(ui);
    await waitFor(() => expect(readProfile).toHaveBeenCalledTimes(2));
    expect(await ui.findByText('Mario Rossi')).toBeTruthy();
    expect(ui.queryByText(i18n.t('auth.errors.network'))).toBeNull();
  } finally {
    from.mockRestore();
  }
});
