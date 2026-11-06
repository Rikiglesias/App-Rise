// A avvia «Elimina ora»; mentre la cancellazione è in corso entra B da un link. Dopo la
// cancellazione di A, l'uscita dal client e la pulizia dello storage non devono colpire
// B, e la verifica dell'esito non deve leggere l'account di B come se fosse quello di A
// (giro 2 del delta, f2-1). Il client simulato ha una sessione e uno storage veri, che
// cambiano: si controlla chi resta collegato, non quali funzioni sono state chiamate.
// File NUOVO (R27).
import { deleteAccountNow } from '@/shared/auth/accountActions';

type Stato = { sessione: string | null; salvata: string | null };
const mockStato: Stato = { sessione: null, salvata: null };
// Il server: gli account che non esistono più. Il token d'accesso di X è «token-X», e
// `getUser(token)` risponde sull'utente del token, come `GET /user` col JWT.
const mockEliminati = new Set<string>();
type MockOpzioni = { headers?: { Authorization?: string } };
const mockChiChiama = (opzioni?: MockOpzioni): string | null => {
  const auth = opzioni?.headers?.Authorization;
  return auth ? auth.replace(/^Bearer token-/, '') : mockStato.sessione;
};
const mockEsito = {
  invoke: null as { message: string } | null,
  uscita: null as { message: string } | null,
};

jest.mock('@/shared/auth/supabaseClient', () => ({
  rimuoviSessioneSalvata: jest.fn(() => {
    mockStato.salvata = null;
    return Promise.resolve();
  }),
  supabase: {
    auth: {
      getSession: jest.fn(() =>
        Promise.resolve({
          data: {
            session: mockStato.sessione
              ? {
                  user: { id: mockStato.sessione },
                  access_token: `token-${mockStato.sessione}`,
                }
              : null,
          },
          error: null,
        })
      ),
      getUser: jest.fn((token?: string) => {
        const chi = token ? token.replace(/^token-/, '') : mockStato.sessione;
        if (chi === null)
          return Promise.resolve({
            data: { user: null },
            error: { code: 'session_not_found' },
          });
        if (mockEliminati.has(chi))
          return Promise.resolve({
            data: { user: null },
            error: { code: 'user_not_found' },
          });
        return Promise.resolve({ data: { user: { id: chi } }, error: null });
      }),
      signOut: jest.fn(() => {
        if (mockEsito.uscita)
          return Promise.resolve({ error: mockEsito.uscita });
        mockStato.sessione = null;
        mockStato.salvata = null;
        return Promise.resolve({ error: null });
      }),
    },
    functions: {
      // Durante l'attesa della cancellazione di A entra B (link di B aperto sul telefono).
      // Il server cancella l'utente del JWT ricevuto: quello dell'Authorization esplicito,
      // altrimenti quello della sessione al momento della chiamata.
      invoke: jest.fn((_nome: string, opzioni?: MockOpzioni) => {
        const chi = mockChiChiama(opzioni);
        mockStato.sessione = 'B';
        mockStato.salvata = 'B';
        if (!mockEsito.invoke && chi) mockEliminati.add(chi);
        return Promise.resolve({ data: null, error: mockEsito.invoke });
      }),
    },
  },
}));
jest.mock('@/shared/auth/registraErroreAccount', () => ({
  chiaveErroreAccount: jest.fn(() => 'generic'),
  registraErroreAccount: jest.fn(),
  registraEsitoAccount: jest.fn((_nome: string, fn: () => unknown) => fn()),
}));

beforeEach(() => {
  mockStato.sessione = 'A';
  mockStato.salvata = 'A';
  mockEsito.invoke = null;
  mockEsito.uscita = null;
  mockEliminati.clear();
  // Le chiamate registrate dalle spie non passano da un caso all'altro.
  jest.clearAllMocks();
});

it('cancellazione di A riuscita mentre entra B: B resta collegato e salvato', async () => {
  const esito = await deleteAccountNow('A');
  expect(esito.error).toBeNull();
  expect(mockStato.sessione).toBe('B');
  expect(mockStato.salvata).toBe('B');
  // Niente da riallineare: la sessione sul telefono è di B, non di un account eliminato.
  expect(esito.sessioneAncoraSulDispositivo).toBe(false);
});

it('chiamata fallita senza cancellare A mentre entra B: A è ancora presente, si dice «non riuscito»', async () => {
  // Errore NON di rete: con la rete l'errore originale tornerebbe comunque, e il test
  // non distinguerebbe la verifica giusta da quella sbagliata (giro 4, rilievo 3).
  mockEsito.invoke = {
    message: 'Edge Function returned a non-2xx status code',
  };
  const esito = await deleteAccountNow('A');
  // La verifica chiede col token di A: il server risponde su A, non su B che è collegato.
  const client = jest.requireMock('@/shared/auth/supabaseClient') as {
    supabase: { auth: { getUser: jest.Mock } };
  };
  expect(client.supabase.auth.getUser).toHaveBeenCalledWith('token-A');
  expect(esito.error).toBe('Edge Function returned a non-2xx status code');
  expect(mockStato.sessione).toBe('B');
});

// Giro 4, rilievo 1: B entra DOPO la lettura del token di A e PRIMA della chiamata. Il
// server cancella l'utente del JWT: senza il token di A esplicito cancellerebbe B.
it('B entra fra la lettura del token di A e la chiamata: il server cancella A, non B', async () => {
  const client = jest.requireMock('@/shared/auth/supabaseClient') as {
    supabase: {
      auth: { getSession: jest.Mock };
      functions: { invoke: jest.Mock };
    };
  };
  client.supabase.auth.getSession.mockImplementationOnce(() => {
    const letta = {
      data: { session: { user: { id: 'A' }, access_token: 'token-A' } },
      error: null,
    };
    mockStato.sessione = 'B';
    mockStato.salvata = 'B';
    return Promise.resolve(letta);
  });
  const esito = await deleteAccountNow('A');
  expect(client.supabase.functions.invoke).toHaveBeenCalledWith(
    'delete-account',
    expect.objectContaining({
      headers: { Authorization: 'Bearer token-A' },
    })
  );
  expect(mockEliminati.has('A')).toBe(true);
  expect(mockEliminati.has('B')).toBe(false);
  expect(esito.error).toBeNull();
  expect(mockStato.sessione).toBe('B');
});

it('risposta persa DOPO la cancellazione di A mentre entra B: A risulta eliminato, B resta collegato', async () => {
  (
    jest.requireMock('@/shared/auth/supabaseClient') as {
      supabase: { functions: { invoke: jest.Mock } };
    }
  ).supabase.functions.invoke.mockImplementationOnce(() => {
    mockEliminati.add('A');
    mockStato.sessione = 'B';
    mockStato.salvata = 'B';
    return Promise.resolve({
      data: null,
      error: { message: 'Failed to fetch' },
    });
  });
  const esito = await deleteAccountNow('A');
  expect(esito.error).toBeNull();
  expect(esito.sessioneAncoraSulDispositivo).toBe(false);
  expect(mockStato.sessione).toBe('B');
  expect(mockStato.salvata).toBe('B');
});

// Revisione delle correzioni, rilievo 2: la verifica senza token chiedeva su chi era
// collegato ADESSO, e il «user_not_found» di B (eliminato altrove) dichiarava eliminato A.
it('cancellazione di A fallita mentre entra B già eliminato altrove: A NON risulta eliminato', async () => {
  mockEliminati.add('B');
  mockEsito.invoke = {
    message: 'Edge Function returned a non-2xx status code',
  };
  const esito = await deleteAccountNow('A');
  expect(esito.error).toBe('Edge Function returned a non-2xx status code');
  expect(mockStato.sessione).toBe('B');
});

it('token di A non leggibile prima della chiamata: non si cancella nessuno, testo neutro', async () => {
  const client = jest.requireMock('@/shared/auth/supabaseClient') as {
    supabase: {
      auth: { getSession: jest.Mock };
      functions: { invoke: jest.Mock };
    };
  };
  client.supabase.auth.getSession.mockRejectedValueOnce(
    new Error('SecureStore unavailable')
  );
  const esito = await deleteAccountNow('A');
  expect(client.supabase.functions.invoke).not.toHaveBeenCalled();
  expect(mockEliminati.size).toBe(0);
  expect(esito.error).toBe('delete_interrupted');
});

it('uscita fallita e B entra proprio durante l’uscita: lo storage tiene la sessione di B', async () => {
  const client = jest.requireMock('@/shared/auth/supabaseClient') as {
    supabase: {
      functions: { invoke: jest.Mock };
      auth: { signOut: jest.Mock };
    };
  };
  client.supabase.functions.invoke.mockImplementationOnce(() =>
    Promise.resolve({ data: null, error: null })
  );
  client.supabase.auth.signOut.mockImplementationOnce(() => {
    mockStato.sessione = 'B';
    mockStato.salvata = 'B';
    return Promise.resolve({ error: { message: 'network down' } });
  });
  const esito = await deleteAccountNow('A');
  expect(esito.error).toBeNull();
  expect(mockStato.salvata).toBe('B');
  expect(esito.sessioneAncoraSulDispositivo).toBe(false);
});

// Controllo POSITIVO (passava anche prima delle correzioni del cambio account): dice che
// il caso normale resta com'era, non prova la correzione d'identità (revisione, rilievo 4).
it('nessun cambio di account: dopo la cancellazione la sessione di A non resta sul telefono', async () => {
  (
    jest.requireMock('@/shared/auth/supabaseClient') as {
      supabase: { functions: { invoke: jest.Mock } };
    }
  ).supabase.functions.invoke.mockImplementationOnce(() =>
    Promise.resolve({ data: null, error: null })
  );
  const esito = await deleteAccountNow('A');
  expect(esito.error).toBeNull();
  expect(mockStato.sessione).toBeNull();
  expect(mockStato.salvata).toBeNull();
});
