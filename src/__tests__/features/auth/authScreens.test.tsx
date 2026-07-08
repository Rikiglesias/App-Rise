import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { SignUpScreen } from '@/features/auth/screens/SignUpScreen';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { ProfileScreen } from '@/features/auth/screens/ProfileScreen';
import { CompleteProfileScreen } from '@/features/auth/screens/CompleteProfileScreen';
import { ResetPasswordScreen } from '@/features/auth/screens/ResetPasswordScreen';
import { supabase } from '@/shared/auth/supabaseClient';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

const wrap = (ui: React.ReactElement) =>
  render(<AllProviders>{ui}</AllProviders>);

describe('Auth screens', () => {
  it('SignUp: render + mostra errori su submit con campi vuoti', () => {
    const { getByText, queryAllByText } = wrap(<SignUpScreen />);
    expect(getByText('Crea account')).toBeTruthy();
    fireEvent.press(getByText('Registrati'));
    expect(queryAllByText('Campo obbligatorio').length).toBeGreaterThan(0);
  });

  it('Login: render', () => {
    const { getAllByText } = wrap(<LoginScreen />);
    expect(getAllByText('Accedi').length).toBeGreaterThan(0);
  });

  it('ForgotPassword: render', () => {
    const { getByText } = wrap(<ForgotPasswordScreen />);
    expect(getByText('Recupera password')).toBeTruthy();
  });

  it('ForgotPassword: mostra il link "Torna al Login"', () => {
    const { getByText } = wrap(<ForgotPasswordScreen />);
    expect(getByText('Torna al Login')).toBeTruthy();
  });

  it('Login: schermata unica con titolo "Area Donatori" + bottone social', () => {
    const { getByText } = wrap(<LoginScreen />);
    expect(getByText('Area Donatori')).toBeTruthy();
    expect(getByText('Continua con Google')).toBeTruthy();
  });

  it('CompleteProfile: render + errori su submit vuoto', () => {
    const { getByText, queryAllByText } = wrap(<CompleteProfileScreen />);
    expect(getByText('Completa il profilo')).toBeTruthy();
    fireEvent.press(getByText('Salva e continua'));
    expect(queryAllByText('Campo obbligatorio').length).toBeGreaterThan(0);
  });

  it('Profile: senza sessione mostra il login (Area Donatori)', async () => {
    const { findByText } = wrap(<ProfileScreen />);
    expect(await findByText('Area Donatori')).toBeTruthy();
  });

  it('ResetPassword: render', () => {
    const { getByText } = wrap(<ResetPasswordScreen />);
    expect(getByText('Imposta nuova password')).toBeTruthy();
  });

  it('ResetPassword: password non coincidenti mostra errore', async () => {
    const { getByText, getByLabelText, findByText } = wrap(
      <ResetPasswordScreen />
    );
    fireEvent.changeText(getByLabelText('Nuova password'), 'Abcd123!');
    fireEvent.changeText(getByLabelText('Conferma password'), 'Abcd999!');
    fireEvent.press(getByText('Salva password'));
    expect(await findByText('Le password non coincidono')).toBeTruthy();
  });

  it('ResetPassword: submit valido aggiorna la password e mostra il successo', async () => {
    (supabase.auth.updateUser as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
      error: null,
    });
    const { getByText, getByLabelText, findByText } = wrap(
      <ResetPasswordScreen />
    );
    fireEvent.changeText(getByLabelText('Nuova password'), 'Abcd123!');
    fireEvent.changeText(getByLabelText('Conferma password'), 'Abcd123!');
    fireEvent.press(getByText('Salva password'));
    // FormSuccess antepone un glifo check ✓ al messaggio → match su sottostringa.
    expect(
      await findByText(/Password aggiornata\. Ora puoi accedere/)
    ).toBeTruthy();
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'Abcd123!',
    });
  });

  it('ForgotPassword: su errore mostra l’errore e NON il messaggio di invio', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
      error: { message: 'rate-limit' },
    });
    const { getByText, getByLabelText, findByText, queryByText } = wrap(
      <ForgotPasswordScreen />
    );
    fireEvent.changeText(getByLabelText('Email'), 'mario@rossi.it');
    fireEvent.press(getByText('Invia link di reset'));
    expect(
      await findByText('Invio non riuscito. Riprova tra poco.')
    ).toBeTruthy();
    expect(
      queryByText(
        'Se l’email esiste, riceverai un link per reimpostare la password.'
      )
    ).toBeNull();
  });

  it('Login: credenziali errate → messaggio specifico (non generico)', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    });
    const { getByRole, getByLabelText, findByText } = wrap(<LoginScreen />);
    fireEvent.changeText(getByLabelText('Email'), 'mario@rossi.it');
    fireEvent.changeText(getByLabelText('Password'), 'abcd1234');
    fireEvent.press(getByRole('button', { name: 'Accedi' }));
    expect(await findByText('Email o password non corretti')).toBeTruthy();
  });

  it('Login: l’email è trimmata prima di signIn (finding 313)', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'u1' } } },
      error: null,
    });
    const { getByRole, getByLabelText } = wrap(<LoginScreen />);
    fireEvent.changeText(getByLabelText('Email'), '  mario@rossi.it  ');
    fireEvent.changeText(getByLabelText('Password'), 'abcd1234');
    fireEvent.press(getByRole('button', { name: 'Accedi' }));
    await waitFor(() =>
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'mario@rossi.it',
        password: 'abcd1234',
      })
    );
  });

  it('Login: errore social (≠ cancelled) mostra un messaggio', async () => {
    (supabase.auth.signInWithIdToken as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'network blip' },
    });
    const { getByText, findByText } = wrap(<LoginScreen />);
    fireEvent.press(getByText('Continua con Google'));
    expect(
      await findByText('Si è verificato un errore. Riprova.')
    ).toBeTruthy();
  });
});
