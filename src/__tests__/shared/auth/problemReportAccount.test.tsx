import { act, renderHook, waitFor } from '@testing-library/react-native';

import { AuthProvider, useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';
import type { ProfileInput } from '@/shared/auth/types';
import { logger } from '@/shared/utils/logger';

const email = 'persona@example.test';
const profile: ProfileInput = {
  first_name: 'Mario',
  last_name: 'Rossi',
  phone: '+393331234567',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  birth_date: '1990-01-01',
  privacy_consent: true,
  marketing_consent: false,
};
const failure = {
  name: 'AuthApiError',
  code: 'invalid_credentials',
  status: 400,
  message: 'Invalid login credentials',
};
const exchange = jest.fn();
const invoke = jest.fn();
const resend = jest.fn();
type Branch = {
  title: string;
  context: string;
  sdk: jest.Mock;
  run: (auth: AuthState) => Promise<unknown>;
};
const branches: Branch[] = [
  {
    title: 'Accesso',
    context: 'Accesso',
    sdk: supabase.auth.signInWithPassword as jest.Mock,
    run: auth => auth.signIn(email, 'Password1!'),
  },
  {
    title: 'Registrazione',
    context: 'Registrazione',
    sdk: supabase.auth.signUp as jest.Mock,
    run: auth => auth.signUp(email, 'Password1!', profile),
  },
  {
    title: 'Password dimenticata',
    context: 'PasswordDimenticata',
    sdk: supabase.auth.resetPasswordForEmail as jest.Mock,
    run: auth => auth.resetPassword(email),
  },
  {
    title: 'Reimposta password',
    context: 'ReimpostaPassword',
    sdk: supabase.auth.updateUser as jest.Mock,
    run: auth => auth.updatePassword('Password2!'),
  },
  {
    title: 'Cambio email',
    context: 'CambioEmail',
    sdk: supabase.auth.updateUser as jest.Mock,
    run: auth => auth.updateEmail('nuova@example.test'),
  },
  {
    title: 'Link di accesso',
    context: 'LinkAccesso',
    sdk: exchange,
    run: auth =>
      auth.completeEmailConfirmFromUrl('rahitalia://confirm-email?code=c55'),
  },
  {
    title: 'Elimina account',
    context: 'EliminaAccount',
    sdk: invoke,
    run: auth => auth.deleteAccountNow(),
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(supabase.auth, { exchangeCodeForSession: exchange, resend });
  Object.assign(supabase, { functions: { invoke } });
  logger.clearLogs();
});

afterEach(() => logger.clearLogs());

const mount = async () => {
  const ui = renderHook(useAuth, { wrapper: AuthProvider });
  await waitFor(() => expect(ui.result.current.status).toBe('unauthenticated'));
  logger.clearLogs();
  return ui;
};

const expectDiagnostic = (context: string) => {
  expect(logger.getLogs()).toEqual([
    expect.objectContaining({
      level: 'error',
      context,
      data: {
        name: failure.name,
        code: failure.code,
        status: failure.status,
        chiave: 'invalid_credentials',
      },
    }),
  ]);
};

// C55: i titoli generati coincidono con il contratto. Provider e logger reali;
// soltanto il confine SDK risponde con un errore o rigetta la richiesta.
it.each(branches)(
  'segnala un problema: errore registrato da $title',
  async branch => {
    for (const mode of ['resolved', 'rejected'] as const) {
      branch.sdk.mockReset();
      if (mode === 'resolved')
        branch.sdk.mockResolvedValueOnce({
          data: { session: null },
          error: failure,
        });
      else branch.sdk.mockRejectedValueOnce(failure);
      const ui = await mount();
      let result: unknown;
      let thrown: unknown;
      await act(async () => {
        try {
          result = await branch.run(ui.result.current);
        } catch (error) {
          thrown = error;
        }
      });
      expect(branch.sdk).toHaveBeenCalledTimes(1);
      expectDiagnostic(branch.context);
      if (branch.context === 'LinkAccesso') {
        expect(result).toEqual({ ok: false });
        expect(thrown).toBeUndefined();
      } else if (mode === 'rejected') expect(thrown).toBe(failure);
      else expect(result).toEqual({ error: failure.message });
      ui.unmount();
    }

    // Controllo positivo del percorso riuscito: l'assenza di errori non basta da sola.
    branch.sdk
      .mockReset()
      .mockResolvedValue({ data: { session: {} }, error: null });
    const ui = await mount();
    await act(async () => {
      const result = await branch.run(ui.result.current);
      expect(result).toEqual(
        branch.context === 'LinkAccesso'
          ? { ok: true }
          : expect.objectContaining({ error: null })
      );
    });
    expect(branch.sdk).toHaveBeenCalledTimes(1);
    expect(logger.getLogs()).toEqual([]);
    ui.unmount();
  }
);

it('B3a: il rinvio conferma registra risposta e rifiuto nel buffer reale', async () => {
  for (const mode of ['resolved', 'rejected'] as const) {
    resend.mockReset();
    if (mode === 'resolved') resend.mockResolvedValueOnce({ error: failure });
    else resend.mockRejectedValueOnce(failure);
    const ui = await mount();
    await act(async () => {
      if (mode === 'resolved')
        await expect(
          ui.result.current.resendConfirmation(email)
        ).resolves.toEqual({ error: failure });
      else
        await expect(ui.result.current.resendConfirmation(email)).rejects.toBe(
          failure
        );
    });
    expect(resend).toHaveBeenCalledTimes(1);
    expectDiagnostic('RinvioConferma');
    ui.unmount();
  }
});
