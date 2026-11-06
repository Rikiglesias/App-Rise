import type { AuthError, Session } from '@supabase/supabase-js';

import { deleteAccountNow } from '@/shared/auth/accountActions';
import { supabase } from '@/shared/auth/supabaseClient';
import { authStorage } from '@/shared/auth/authStorage';

// Client VERO (quello globale di jest.setup.js è finto): la chiave con cui si toglie
// la sessione deve essere quella che la libreria usa davvero per salvarla, altrimenti
// la rimozione andrebbe a vuoto e la sessione dell'account eliminato resterebbe.
jest.unmock('@/shared/auth/supabaseClient');
jest.mock('@/shared/auth/authStorage', () => ({
  authStorage: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
  },
}));

it("cancellazione riuscita e uscita fallita: la sessione si toglie dallo storage dell'app", async () => {
  // `functions` è un getter che crea un client nuovo a ogni accesso: si spia il prototipo.
  const funzioni = Object.getPrototypeOf(supabase.functions) as {
    invoke: (...args: unknown[]) => Promise<unknown>;
  };
  const invoke = jest
    .spyOn(funzioni, 'invoke')
    .mockResolvedValue({ data: { ok: true }, error: null });
  const signOut = jest.spyOn(supabase.auth, 'signOut').mockResolvedValue({
    error: {
      name: 'AuthRetryableFetchError',
      message: 'Network request failed',
    } as unknown as AuthError,
  });
  // L'avvio del client legge e può ripulire lo storage per conto suo: si parte dopo.
  await supabase.auth.getSession();
  (authStorage.removeItem as jest.Mock).mockClear();
  // Sessione di chi elimina: la cancellazione parte solo col suo token.
  const sessione = jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
    data: {
      session: { user: { id: 'u1' }, access_token: 'token-u1' } as Session,
    },
    error: null,
  });
  const chiaveDellaLibreria = (
    supabase.auth as unknown as { storageKey: string }
  ).storageKey;

  try {
    const esito = await deleteAccountNow('u1');

    expect(esito.error).toBeNull();
    expect(chiaveDellaLibreria).toMatch(/^sb-.+-auth-token$/);
    expect(authStorage.removeItem).toHaveBeenCalledWith(chiaveDellaLibreria);
  } finally {
    invoke.mockRestore();
    signOut.mockRestore();
    sessione.mockRestore();
  }
});
