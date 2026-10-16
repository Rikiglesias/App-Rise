import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';

import { AllProviders } from '../../helpers/testProviders';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '@/features/auth/screens/ResetPasswordScreen';
import { supabase } from '@/shared/auth/supabaseClient';
import { authStorage } from '@/shared/auth/authStorage';
import i18n from '@/locales';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const wrap = (screen: React.ReactElement) =>
  render(<AllProviders>{screen}</AllProviders>);

const fillLogin = (ui: ReturnType<typeof wrap>): void => {
  fireEvent.changeText(ui.getByLabelText('Email'), 'mario@example.test');
  fireEvent.changeText(ui.getByLabelText('Password'), 'Abcd123!');
};

const fillReset = (ui: ReturnType<typeof wrap>): void => {
  fireEvent.changeText(ui.getByLabelText('Nuova password'), 'Abcd123!');
  fireEvent.changeText(ui.getByLabelText('Conferma password'), 'Abcd123!');
};

describe('accesso robusto:', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([
    { failure: 'rete', error: new Error('Network request failed') },
    {
      failure: 'timeout',
      error: Object.assign(new Error('Aborted'), { name: 'AbortError' }),
    },
  ])(
    // Titolo esatto del contratto (C25): errore mostrato e nuovo tentativo possibile, rete e timeout.
    'Accesso rete',
    async ({ error }) => {
      (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValueOnce(
        error
      );
      const ui = wrap(<LoginScreen />);
      fillLogin(ui);

      fireEvent.press(ui.getByRole('button', { name: 'Accedi' }));

      expect(await ui.findByText(i18n.t('auth.errors.network'))).toBeTruthy();
      expect(ui.getByRole('button', { name: 'Accedi' })).toBeEnabled();
      await act(async () => {
        fireEvent.press(ui.getByRole('button', { name: 'Accedi' }));
        await Promise.resolve();
      });
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledTimes(2);
    }
  );

  // Un rifiuto di SecureStore termina il caricamento.
  it('Accesso salvataggio sicuro', async () => {
    (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(
      new Error('Keychain write denied')
    );
    (supabase.auth.signInWithPassword as jest.Mock).mockImplementationOnce(
      async () => {
        await authStorage.setItem('test-session', 'fixture-session');
        return { data: { session: null }, error: null };
      }
    );
    const ui = wrap(<LoginScreen />);
    fillLogin(ui);

    fireEvent.press(ui.getByRole('button', { name: 'Accedi' }));

    expect(await ui.findByText(i18n.t('auth.errors.generic'))).toBeTruthy();
    expect(ui.getByRole('button', { name: 'Accedi' })).toBeEnabled();
    expect(SecureStore.setItemAsync).toHaveBeenCalled();
  });

  // Resta sul form, mostra l’errore e permette di riprovare.
  it('Password dimenticata rete', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockRejectedValueOnce(
      new Error('Network request failed')
    );
    const ui = wrap(<ForgotPasswordScreen />);
    fireEvent.changeText(ui.getByLabelText('Email'), 'mario@example.test');

    fireEvent.press(ui.getByRole('button', { name: 'Invia link di reset' }));

    expect(await ui.findByText(i18n.t('auth.errors.network'))).toBeTruthy();
    expect(ui.queryByText(i18n.t('auth.forgot.sent'))).toBeNull();
    expect(
      ui.getByRole('button', { name: 'Invia link di reset' })
    ).toBeEnabled();
  });

  // Resta sul form, mostra l’errore e permette di riprovare.
  it('Reimposta password rete', async () => {
    (supabase.auth.updateUser as jest.Mock).mockRejectedValueOnce(
      new Error('Network request failed')
    );
    const ui = wrap(<ResetPasswordScreen />);
    fillReset(ui);

    fireEvent.press(ui.getByRole('button', { name: 'Salva password' }));

    expect(await ui.findByText(i18n.t('auth.errors.network'))).toBeTruthy();
    expect(ui.queryByText(i18n.t('auth.reset.success'))).toBeNull();
    expect(ui.getByRole('button', { name: 'Salva password' })).toBeEnabled();
  });

  // Conserva il codice del server e mostra la spiegazione specifica.
  it.each(['same_password', 'weak_password'])('%s', async code => {
    (supabase.auth.updateUser as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { code, message: 'Server rejected the update' },
    });
    const ui = wrap(<ResetPasswordScreen />);
    fillReset(ui);

    fireEvent.press(ui.getByRole('button', { name: 'Salva password' }));

    expect(await ui.findByText(i18n.t(`auth.errors.${code}`))).toBeTruthy();
    expect(ui.queryByText(i18n.t('auth.errors.generic'))).toBeNull();
    expect(ui.queryByText(i18n.t('auth.reset.success'))).toBeNull();
    expect(ui.getByRole('button', { name: 'Salva password' })).toBeEnabled();
  });

  it('Reimposta password conserva il messaggio per codici server non mappati', async () => {
    (supabase.auth.updateUser as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: { code: 'over_request_rate_limit', message: 'Too many requests' },
    });
    const ui = wrap(<ResetPasswordScreen />);
    fillReset(ui);

    fireEvent.press(ui.getByRole('button', { name: 'Salva password' }));

    expect(
      await ui.findByText(i18n.t('auth.errors.rate_limited'))
    ).toBeTruthy();
    expect(ui.queryByText(i18n.t('auth.errors.generic'))).toBeNull();
    expect(ui.getByRole('button', { name: 'Salva password' })).toBeEnabled();
  });
});
