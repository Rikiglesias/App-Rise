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
      invoke: jest.fn(() => {
        mockStato.sessione = 'B';
        mockStato.salvata = 'B';
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
  mockEsito.invoke = { message: 'Failed to fetch' };
  const esito = await deleteAccountNow('A');
  // La verifica chiede col token di A: il server risponde su A, non su B che è collegato.
  expect(esito.error).toBe('Failed to fetch');
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

it('token di A non leggibile prima della chiamata: esito non attribuibile, testo neutro', async () => {
  const client = jest.requireMock('@/shared/auth/supabaseClient') as {
    supabase: { auth: { getSession: jest.Mock } };
  };
  client.supabase.auth.getSession.mockRejectedValueOnce(
    new Error('SecureStore unavailable')
  );
  mockEliminati.add('B');
  mockEsito.invoke = {
    message: 'Edge Function returned a non-2xx status code',
  };
  const esito = await deleteAccountNow('A');
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
