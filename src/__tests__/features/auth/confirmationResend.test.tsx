import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import { fillValidProfileForm } from '../../helpers/profileFormHelpers';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { SignUpScreen } from '@/features/auth/screens/SignUpScreen';
import { supabase } from '@/shared/auth/supabaseClient';
import { buildEmailConfirmRedirectTo } from '@/shared/auth/authRedirect';
import i18n from '@/locales';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn(), canGoBack: () => false }),
}));

const resend = jest.fn();
const email = 'mario@example.test';
const button = (): string => i18n.t('auth.resend.submit');
const renderScreen = (screen: React.ReactElement) =>
  render(<AllProviders>{screen}</AllProviders>);

const unconfirmedLogin = async () => {
  (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
    error: { message: 'Email not confirmed' },
  });
  const ui = renderScreen(<LoginScreen />);
  fireEvent.changeText(ui.getByLabelText(i18n.t('auth.login.email')), email);
  fireEvent.changeText(
    ui.getByLabelText(i18n.t('auth.login.password')),
    'Abcd123!'
  );
  fireEvent.press(
    ui.getByRole('button', { name: i18n.t('auth.login.submit') })
  );
  await ui.findByText(i18n.t('auth.errors.email_not_confirmed'));
  return ui;
};

beforeEach(() => {
  i18n.locale = 'it';
  resend.mockReset().mockResolvedValue({ error: null });
  Object.assign(supabase.auth, { resend });
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
  i18n.locale = 'it';
});

// La registrazione reale mostra il rinvio; il secondo invio usa il redirect PKCE.
it('rinvio conferma: dopo la registrazione', async () => {
  jest.useFakeTimers();
  const ui = renderScreen(<SignUpScreen />);
  fillValidProfileForm(
    ui.getByLabelText,
    () => ui.getAllByRole('checkbox')[0],
    ui.getByTestId
  );
  fireEvent.changeText(ui.getByLabelText('Email'), email);
  fireEvent.changeText(ui.getByLabelText('Password'), 'Abcd123!');
  fireEvent.changeText(ui.getByLabelText('Conferma password'), 'Abcd123!');
  fireEvent.press(ui.getByRole('button', { name: 'Registrati' }));
  await ui.findByText(i18n.t('auth.signup.checkEmail'));
  expect(supabase.auth.signUp).toHaveBeenCalledWith(
    expect.objectContaining({ email })
  );
  expect(ui.getByRole('button', { name: button() })).toBeTruthy();
  await act(async () => {
    await jest.advanceTimersByTimeAsync(60000);
  });
  fireEvent.press(ui.getByRole('button', { name: button() }));
  await ui.findByText(i18n.t('auth.resend.sent'));
  expect(resend).toHaveBeenCalledWith({
    type: 'signup',
    email,
    options: { emailRedirectTo: buildEmailConfirmRedirectTo() },
  });
});

// Il rinvio compare solo per l'indirizzo che ha ricevuto email_not_confirmed.
it('rinvio conferma: su email non confermata', async () => {
  const ui = await unconfirmedLogin();
  fireEvent.press(ui.getByRole('button', { name: button() }));
  await ui.findByText(i18n.t('auth.resend.sent'));
  expect(resend).toHaveBeenCalledWith({
    type: 'signup',
    email,
    options: { emailRedirectTo: buildEmailConfirmRedirectTo() },
  });
  fireEvent.changeText(ui.getByLabelText('Email'), 'altro@example.test');
  expect(ui.queryByRole('button', { name: button() })).toBeNull();
});

// Prova negativa prima della scadenza e positiva esattamente a 60 secondi.
it('rinvio conferma: attesa di 60 s', async () => {
  const ui = await unconfirmedLogin();
  jest.useFakeTimers();
  await act(async () => {
    fireEvent.press(ui.getByRole('button', { name: button() }));
    await Promise.resolve();
  });
  expect(ui.getByText(i18n.t('auth.resend.sent'))).toBeTruthy();
  fireEvent.press(ui.getByRole('button', { name: button() }));
  expect(resend).toHaveBeenCalledTimes(1);
  await act(async () => {
    await jest.advanceTimersByTimeAsync(59999);
  });
  fireEvent.press(ui.getByRole('button', { name: button() }));
  expect(resend).toHaveBeenCalledTimes(1);
  await act(async () => {
    await jest.advanceTimersByTimeAsync(1);
  });
  fireEvent.press(ui.getByRole('button', { name: button() }));
  await waitFor(() => expect(resend).toHaveBeenCalledTimes(2));
});

// Il codice Supabase conta anche quando il messaggio non contiene "rate limit".
it('rinvio conferma: limite del server tradotto', async () => {
  i18n.locale = 'en';
  resend.mockResolvedValueOnce({
    error: {
      code: 'over_email_send_rate_limit',
      status: 429,
      message:
        'For security purposes, you can only request this after 60 seconds.',
    },
  });
  const ui = await unconfirmedLogin();
  fireEvent.press(ui.getByRole('button', { name: button() }));
  expect(await ui.findByText(i18n.t('auth.errors.rate_limited'))).toBeTruthy();
  expect(resend).toHaveBeenCalledTimes(1);
  expect(ui.queryByText(i18n.t('auth.resend.sent'))).toBeNull();
});
