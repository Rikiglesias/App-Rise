// A avvia «Elimina ora»; mentre la cancellazione è in corso entra B da un link. Dopo la
// cancellazione di A, l'uscita dal client e la pulizia dello storage non devono colpire
// B, e la verifica dell'esito non deve leggere l'account di B come se fosse quello di A
// (giro 2 del delta, f2-1). Il client simulato ha una sessione e uno storage veri, che
// cambiano: si controlla chi resta collegato, non quali funzioni sono state chiamate.
// File NUOVO (R27).
import { deleteAccountNow } from '@/shared/auth/accountActions';

type Stato = { sessione: string | null; salvata: string | null };
const mockStato: Stato = { sessione: null, salvata: null };
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
              ? { user: { id: mockStato.sessione } }
              : null,
          },
          error: null,
        })
      ),
      getUser: jest.fn(() =>
        Promise.resolve(
          mockStato.sessione
            ? { data: { user: { id: mockStato.sessione } }, error: null }
            : { data: { user: null }, error: { code: 'session_not_found' } }
        )
      ),
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
});

it('cancellazione di A riuscita mentre entra B: B resta collegato e salvato', async () => {
  const esito = await deleteAccountNow('A');
  expect(esito.error).toBeNull();
  expect(mockStato.sessione).toBe('B');
  expect(mockStato.salvata).toBe('B');
  // Niente da riallineare: la sessione sul telefono è di B, non di un account eliminato.
  expect(esito.sessioneAncoraSulDispositivo).toBe(false);
});

it('risposta persa e nel frattempo è entrato B: l’esito di A resta incerto, non «non riuscito»', async () => {
  mockEsito.invoke = { message: 'Failed to fetch' };
  const esito = await deleteAccountNow('A');
  // getUser risponde con B: non dice niente su A. «Presente» farebbe credere ad A che il
  // suo account esista ancora; il testo giusto è quello neutro che chiede di riprovare.
  expect(esito.error).toBe('delete_interrupted');
  expect(mockStato.sessione).toBe('B');
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
