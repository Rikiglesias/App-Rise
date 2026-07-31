import {
  syncNicknameClaim,
  isNicknameAvailable,
  isNicknameConflict,
} from '@/shared/auth/nickname';
import { supabase } from '@/shared/auth/supabaseClient';
import { logError } from '@/shared/utils/logger';

jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: {
    auth: {
      updateUser: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    },
    rpc: jest.fn(() => Promise.resolve({ data: true, error: null })),
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

const rpc = supabase.rpc as unknown as jest.Mock;

describe('isNicknameAvailable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    rpc.mockResolvedValue({ data: true, error: null });
  });

  it('chiama la funzione del database col nome e il parametro giusti', async () => {
    // Il nome della RPC e quello del parametro sono un contratto con la migration 0018:
    // sbagliarne uno non dà un errore di compilazione, dà un controllo che non funziona.
    await expect(isNicknameAvailable('Mario')).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith('nickname_disponibile', {
      p_nickname: 'Mario',
    });
  });

  it('taglia gli spazi ai bordi prima di chiedere', async () => {
    await isNicknameAvailable('  Mario  ');
    expect(rpc).toHaveBeenCalledWith('nickname_disponibile', {
      p_nickname: 'Mario',
    });
  });

  it('«occupato» è false, non un errore', async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    await expect(isNicknameAvailable('Mario')).resolves.toBe(false);
  });

  it('un nickname vuoto è disponibile SENZA disturbare il server', async () => {
    await expect(isNicknameAvailable('')).resolves.toBe(true);
    await expect(isNicknameAvailable('   ')).resolves.toBe(true);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('errore del server → null («non so»), MAI false', async () => {
    // La distinzione è tutto il punto: `false` manda la persona a cambiare un nickname
    // che magari è liberissimo, e lo fa proprio quando la rete è già in difficoltà.
    rpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    await expect(isNicknameAvailable('Mario')).resolves.toBeNull();
    expect(logError).toHaveBeenCalled();
  });

  it('un throw (rete giù) → null, e non propaga', async () => {
    rpc.mockRejectedValue(new Error('rete giù'));
    await expect(isNicknameAvailable('Mario')).resolves.toBeNull();
    expect(logError).toHaveBeenCalled();
  });

  it('una risposta di tipo inatteso → null, non «occupato»', async () => {
    // Se la firma della RPC cambiasse e tornasse altro, un cast implicito renderebbe
    // «occupato» qualunque valore falsy — un errore mostrato senza alcun motivo.
    rpc.mockResolvedValue({ data: undefined, error: null });
    await expect(isNicknameAvailable('Mario')).resolves.toBeNull();
    rpc.mockResolvedValue({ data: { unexpected: 1 }, error: null });
    await expect(isNicknameAvailable('Mario')).resolves.toBeNull();
  });
});

describe('isNicknameConflict', () => {
  it('riconosce la violazione dell’indice unico del nickname', () => {
    expect(
      isNicknameConflict(
        'duplicate key value violates unique constraint "profiles_nickname_unico"'
      )
    ).toBe(true);
  });

  it('NON scambia per «nickname occupato» la violazione di un altro vincolo', () => {
    // Un 23505 su un altro indice manderebbe la persona a cambiare il nickname mentre
    // il guasto vero — quello che ha davvero impedito il salvataggio — resta nascosto.
    expect(
      isNicknameConflict(
        'duplicate key value violates unique constraint "profiles_pkey"'
      )
    ).toBe(false);
    expect(isNicknameConflict('new row violates check constraint')).toBe(false);
    expect(isNicknameConflict(null)).toBe(false);
    expect(isNicknameConflict('')).toBe(false);
  });
});
