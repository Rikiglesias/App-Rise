import { supabase } from '@/shared/auth/supabaseClient';
import { getOrCreatePartnerRef } from '@/shared/partner/partnerRefService';

// Mock del client supabase: builder fluente condiviso (select/insert/eq → builder;
// maybeSingle/single = terminali configurabili per test).
jest.mock('@/shared/auth/supabaseClient', () => {
  const builder = {
    select: jest.fn(),
    insert: jest.fn(),
    eq: jest.fn(),
    maybeSingle: jest.fn(),
    single: jest.fn(),
  };
  builder.select.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  return {
    supabase: {
      from: jest.fn(() => builder),
      auth: { getSession: jest.fn() },
      __builder: builder,
    },
  };
});

const mockedSupabase = supabase as unknown as {
  from: jest.Mock;
  auth: { getSession: jest.Mock };
  __builder: {
    select: jest.Mock;
    insert: jest.Mock;
    eq: jest.Mock;
    maybeSingle: jest.Mock;
    single: jest.Mock;
  };
};
const getSession = mockedSupabase.auth.getSession;
const builder = mockedSupabase.__builder;
const insert = builder.insert;
const maybeSingle = builder.maybeSingle;
const single = builder.single;

const withSession = () =>
  getSession.mockResolvedValue({
    data: { session: { user: { id: 'user-1' } } },
  });

describe('getOrCreatePartnerRef', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // clearAllMocks azzera i mock.calls ma preserva i mockReturnValue del chaining.
  });

  it('ospite (nessuna sessione) → null, nessuna query al DB', async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    await expect(getOrCreatePartnerRef('donorbox')).resolves.toBeNull();
    expect(mockedSupabase.from).not.toHaveBeenCalled();
  });

  it('ritorna il ref attivo esistente senza inserire', async () => {
    withSession();
    maybeSingle.mockResolvedValue({ data: { ref: 'EXISTING' }, error: null });
    await expect(getOrCreatePartnerRef('donorbox')).resolves.toBe('EXISTING');
    expect(insert).not.toHaveBeenCalled();
  });

  it('crea un nuovo ref quando non esiste (ref dal default server-side)', async () => {
    withSession();
    maybeSingle.mockResolvedValue({ data: null, error: null });
    single.mockResolvedValue({ data: { ref: 'NEW-REF' }, error: null });
    await expect(getOrCreatePartnerRef('letsdonation')).resolves.toBe(
      'NEW-REF'
    );
    expect(insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      partner: 'letsdonation',
    });
  });

  it('race: insert fallisce con unique_violation → ri-legge il ref esistente', async () => {
    withSession();
    maybeSingle
      .mockResolvedValueOnce({ data: null, error: null }) // 1a select: niente
      .mockResolvedValueOnce({ data: { ref: 'RACED' }, error: null }); // re-select
    single.mockResolvedValue({ data: null, error: { code: '23505' } });
    await expect(getOrCreatePartnerRef('donorbox')).resolves.toBe('RACED');
  });

  it('errore non-unique in creazione → null (l app degrada, apre senza ref)', async () => {
    withSession();
    maybeSingle.mockResolvedValue({ data: null, error: null });
    single.mockResolvedValue({ data: null, error: { code: '42501' } });
    await expect(getOrCreatePartnerRef('donorbox')).resolves.toBeNull();
  });

  it('errore in select iniziale → prova comunque a creare', async () => {
    withSession();
    maybeSingle.mockResolvedValue({ data: null, error: { code: 'XX' } });
    single.mockResolvedValue({ data: { ref: 'NEW-AFTER-ERR' }, error: null });
    await expect(getOrCreatePartnerRef('donorbox')).resolves.toBe(
      'NEW-AFTER-ERR'
    );
  });
});
