import {
  buildDisplayName,
  syncDisplayNameClaim,
} from '@/shared/auth/displayName';
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

describe('buildDisplayName', () => {
  beforeEach(() => jest.clearAllMocks());

  it('compone nome e cognome con un solo spazio', () => {
    expect(buildDisplayName('Mario', 'Rossi')).toBe('Mario Rossi');
  });

  it('tollera spazi e parti mancanti senza lasciare spazi appesi', () => {
    expect(buildDisplayName('  Mario  ', '')).toBe('Mario');
    expect(buildDisplayName('', ' Rossi ')).toBe('Rossi');
    expect(buildDisplayName(null, undefined)).toBe('');
  });
});

describe('syncDisplayNameClaim', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateUser.mockResolvedValue({ data: {}, error: null });
  });

  it('scrive la chiave `name` (non `full_name`) in user_metadata', async () => {
    // La chiave è quella che il server auth legge per il claim OIDC `name`:
    // sbagliarla equivale a non scrivere nulla, e il claim ripiegherebbe sull'email.
    await expect(syncDisplayNameClaim('Mario', 'Rossi')).resolves.toBe(true);
    expect(updateUser).toHaveBeenCalledWith({ data: { name: 'Mario Rossi' } });
    // Solo `name`: nessun'altra chiave, così il merge non sovrascrive altro.
    expect(updateUser.mock.calls[0][0].data).toEqual({ name: 'Mario Rossi' });
  });

  it('con nome vuoto non scrive nulla', async () => {
    // Scrivere '' equivale ad assente per il server auth (che poi userebbe l'email):
    // meglio non toccare il metadato.
    await expect(syncDisplayNameClaim('  ', null)).resolves.toBe(false);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('su errore ritorna false e logga a livello ERROR (warn/info sono scartati in prod)', async () => {
    updateUser.mockResolvedValue({ data: null, error: { message: 'boom' } });
    await expect(syncDisplayNameClaim('Mario', 'Rossi')).resolves.toBe(false);
    expect(logError).toHaveBeenCalled();
  });

  it('NON propaga un throw: il chiamante ha già salvato il profilo', async () => {
    // Senza il try/catch l'eccezione arriverebbe dopo il salvataggio e prima della
    // navigazione, lasciando l'utente fermo sulla schermata senza spiegazione.
    updateUser.mockRejectedValue(new Error('rete giù'));
    await expect(syncDisplayNameClaim('Mario', 'Rossi')).resolves.toBe(false);
    expect(logError).toHaveBeenCalled();
  });
});
