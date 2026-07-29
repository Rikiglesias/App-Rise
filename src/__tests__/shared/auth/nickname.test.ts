import { syncNicknameClaim } from '@/shared/auth/nickname';
import { supabase } from '@/shared/auth/supabaseClient';
import { logError } from '@/shared/utils/logger';

jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: {
    auth: {
      updateUser: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    },
  },
}));

jest.mock('@/shared/utils/logger', () => ({
  logError: jest.fn(),
}));

const updateUser = supabase.auth.updateUser as jest.Mock;

describe('syncNicknameClaim', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateUser.mockResolvedValue({ data: {}, error: null });
  });

  it('scrive la chiave `preferred_username`, non `nickname`', async () => {
    // `nickname` è il nome della NOSTRA colonna; `preferred_username` è l'unica chiave
    // che il server auth legge per costruire il claim OIDC (verificato su
    // GenerateIDToken e OAuthUserInfo). Sbagliarla equivale a non scrivere nulla —
    // e qui, a differenza di `name`, non ci sarebbe nemmeno un ripiego a mascherarlo:
    // il claim sparirebbe in silenzio.
    await expect(syncNicknameClaim('Ciccio')).resolves.toBe(true);
    expect(updateUser).toHaveBeenCalledWith({
      data: { preferred_username: 'Ciccio' },
    });
    // Solo quella chiave: il merge non deve toccare `name` o gli altri metadati.
    expect(updateUser.mock.calls[0][0].data).toEqual({
      preferred_username: 'Ciccio',
    });
  });

  it('taglia gli spazi ai bordi prima di scrivere', async () => {
    await expect(syncNicknameClaim('  Ciccio  ')).resolves.toBe(true);
    expect(updateUser).toHaveBeenCalledWith({
      data: { preferred_username: 'Ciccio' },
    });
  });

  it('svuotare il nickname scrive null, e null RIMUOVE la chiave', async () => {
    // Differenza deliberata rispetto a syncDisplayNameClaim, che con valore vuoto non
    // scrive affatto: qui il vuoto è una scelta legittima dell'utente («non ne voglio
    // uno») e va propagata, altrimenti il claim resterebbe congelato all'ultimo valore
    // e il partner continuerebbe a mostrare un nickname cancellato.
    // Il `null` non è un placeholder: il server fa `delete(u.UserMetaData, key)`
    // quando il valore è nil (verificato in internal/models/user.go).
    await expect(syncNicknameClaim('')).resolves.toBe(true);
    expect(updateUser).toHaveBeenCalledWith({
      data: { preferred_username: null },
    });
  });

  it('tratta come vuoto anche i soli spazi, e null/undefined', async () => {
    await expect(syncNicknameClaim('   ')).resolves.toBe(true);
    await expect(syncNicknameClaim(null)).resolves.toBe(true);
    await expect(syncNicknameClaim(undefined)).resolves.toBe(true);
    for (const call of updateUser.mock.calls) {
      expect(call[0].data).toEqual({ preferred_username: null });
    }
  });

  it('su errore ritorna false e logga a livello ERROR (warn/info sono scartati in prod)', async () => {
    updateUser.mockResolvedValue({ data: null, error: { message: 'boom' } });
    await expect(syncNicknameClaim('Ciccio')).resolves.toBe(false);
    expect(logError).toHaveBeenCalled();
  });

  it('NON propaga un throw: il chiamante ha già salvato il profilo', async () => {
    // Senza il try/catch l'eccezione arriverebbe dopo il salvataggio e prima della
    // navigazione, lasciando l'utente fermo sulla schermata senza spiegazione.
    updateUser.mockRejectedValue(new Error('rete giù'));
    await expect(syncNicknameClaim('Ciccio')).resolves.toBe(false);
    expect(logError).toHaveBeenCalled();
  });
});
