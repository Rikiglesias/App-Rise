import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { DeleteAccountScreen } from '@/features/auth/screens/DeleteAccountScreen';
import { useAuth } from '@/shared/auth/AuthContext';
import type { AuthState } from '@/shared/auth/AuthContext';
import { deleteAccountNow } from '@/shared/auth/accountActions';
import { supabase } from '@/shared/auth/supabaseClient';
import itLocale from '@/locales/it';

// La risposta di `delete-account` può perdersi DOPO che la cancellazione è riuscita
// (timeout, rete che cade, 5xx del proxy): l'esito si chiede di nuovo al server con
// `auth.getUser`, invece di dire «errore» per un account che non esiste più.
jest.mock('@/shared/auth/supabaseClient', () => ({
  rimuoviSessioneSalvata: jest.fn(() => Promise.resolve()),
  supabase: {
    auth: {
      getUser: jest.fn(),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    functions: { invoke: jest.fn() },
  },
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    canGoBack: () => false,
    popTo: jest.fn(),
    getState: () => ({ routeNames: ['Home', 'Account', 'DeleteAccount'] }),
  }),
}));
jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const invoke = supabase.functions.invoke as jest.Mock;
const getUser = supabase.auth.getUser as jest.Mock;
const signOut = supabase.auth.signOut as jest.Mock;

const erroreFunzione = (status: number) => ({
  data: null,
  error: {
    name: 'FunctionsHttpError',
    message: 'Edge Function returned a non-2xx status code',
    context: { status },
  },
});
const utenteEliminato = {
  data: { user: null },
  error: {
    name: 'AuthApiError',
    code: 'user_not_found',
    status: 403,
    message: 'User from sub claim in JWT does not exist',
  },
};
const utentePresente = { data: { user: { id: 'u1' } }, error: null };
const verificaImpossibile = {
  data: { user: null },
  error: {
    name: 'AuthRetryableFetchError',
    message: 'Network request failed',
    status: 0,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  signOut.mockResolvedValue({ error: null });
});

it('cancellazione: errore ma account già eliminato → riuscita e uscita', async () => {
  invoke.mockResolvedValueOnce(erroreFunzione(500));
  getUser.mockResolvedValueOnce(utenteEliminato);

  const esito = await deleteAccountNow();

  expect(esito.error).toBeNull();
  expect(signOut).toHaveBeenCalledWith({ scope: 'local' });
});

it('cancellazione: errore e account presente → errore (riconciliazione chiamata)', async () => {
  invoke.mockResolvedValueOnce(erroreFunzione(500));
  getUser.mockResolvedValueOnce(utentePresente);

  const esito = await deleteAccountNow();

  expect(getUser).toHaveBeenCalledTimes(1);
  expect(esito.error).toBe('Edge Function returned a non-2xx status code');
  expect(signOut).not.toHaveBeenCalled();
});

it('cancellazione: errore e verifica impossibile → esito incerto con cosa fare', async () => {
  // La risposta arriva quando la schermata non c'è più (l'app può essere già
  // diventata ospite): il messaggio deve arrivare lo stesso.
  let rispondi: (valore: unknown) => void = () => undefined;
  invoke.mockReturnValueOnce(
    new Promise(resolve => {
      rispondi = resolve;
    })
  );
  getUser.mockResolvedValueOnce(verificaImpossibile);
  (useAuth as jest.Mock).mockReturnValue({
    status: 'authenticated',
    session: { user: { id: 'u1', email: 'm@r.it' } } as unknown as Session,
    deleteAccountNow,
    scheduleDeletion: jest.fn(),
  } as Partial<AuthState>);
  const alertSpy = jest
    .spyOn(Alert, 'alert')
    .mockImplementation((_titolo, _testo, pulsanti) => {
      pulsanti?.find(b => b.style === 'destructive')?.onPress?.();
    });
  try {
    const { getByText, unmount } = render(
      <AllProviders>
        <DeleteAccountScreen />
      </AllProviders>
    );
    fireEvent.press(getByText(itLocale.auth.delete.now));
    unmount();
    await act(async () => {
      rispondi(erroreFunzione(504));
      await new Promise(r => setTimeout(r, 0));
    });

    const testo = (itLocale.auth.delete as Record<string, unknown>)
      .esitoIncerto;
    expect(typeof testo).toBe('string');
    expect(testo).not.toBe(itLocale.auth.delete.error);
    expect(alertSpy).toHaveBeenCalledWith(itLocale.auth.delete.title, testo);
    expect(signOut).not.toHaveBeenCalled();
  } finally {
    alertSpy.mockRestore();
  }
});

it('cancellazione: secondo tentativo dopo una riuscita → riuscita', async () => {
  // Il primo tentativo ha cancellato ma la risposta si è persa; il secondo trova
  // l'utente già sparito e la funzione risponde 401.
  invoke.mockResolvedValueOnce(erroreFunzione(401));
  getUser.mockResolvedValueOnce(utenteEliminato);

  const esito = await deleteAccountNow();

  expect(esito.error).toBeNull();
  expect(signOut).toHaveBeenCalledWith({ scope: 'local' });
});

it('cancellazione: la chiamata rigetta → riconciliata come un errore', async () => {
  invoke.mockRejectedValueOnce(new Error('boom'));
  getUser.mockResolvedValueOnce(utentePresente);

  await expect(deleteAccountNow()).resolves.toEqual({ error: 'boom' });
  expect(getUser).toHaveBeenCalledTimes(1);
});
