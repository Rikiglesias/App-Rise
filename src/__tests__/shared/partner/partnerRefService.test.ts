import { supabase } from '@/shared/auth/supabaseClient';
import { getOrCreatePartnerRef } from '@/shared/partner/partnerRefService';
import { logError, logInfo, logWarn } from '@/shared/utils/logger';

// Mock del logger: gli assert sul LIVELLO distinguono i rami (atteso=info,
// inatteso=error) — senza questo il test resterebbe vacuo rispetto al fix.
jest.mock('@/shared/utils/logger', () => ({
  logInfo: jest.fn(),
  logWarn: jest.fn(),
  logError: jest.fn(),
}));

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

const mockLogInfo = logInfo as jest.Mock;
const mockLogWarn = logWarn as jest.Mock;
const mockLogError = logError as jest.Mock;

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
    // race risolta felicemente: nessun errore inatteso deve finire nei log.
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('race 23505 ma re-select vuoto (rollback/replica-lag) → null + logInfo, non logError', async () => {
    withSession();
    maybeSingle
      .mockResolvedValueOnce({ data: null, error: null }) // 1a select: niente
      .mockResolvedValueOnce({ data: null, error: null }); // re-select: ancora niente
    single.mockResolvedValue({ data: null, error: { code: '23505' } });
    await expect(getOrCreatePartnerRef('donorbox')).resolves.toBeNull();
    expect(maybeSingle).toHaveBeenCalledTimes(2);
    expect(mockLogInfo).toHaveBeenCalledWith(
      'race 23505 senza ref visibile al re-select',
      'partnerRefService'
    );
    expect(mockLogError).not.toHaveBeenCalled();
  });

  it('errore inatteso (RLS 42501) → null + logError (raggiunge i log di prod), mai logInfo', async () => {
    withSession();
    maybeSingle.mockResolvedValue({ data: null, error: null });
    single.mockResolvedValue({ data: null, error: { code: '42501' } });
    await expect(getOrCreatePartnerRef('donorbox')).resolves.toBeNull();
    expect(mockLogError).toHaveBeenCalledWith(
      'creazione ref fallita (inatteso)',
      'partnerRefService',
      { code: '42501' }
    );
    expect(mockLogInfo).not.toHaveBeenCalled();
  });

  it('utente senza profilo: FK violation 23503 → null + logInfo, mai logError/logWarn (no-op atteso)', async () => {
    withSession();
    maybeSingle.mockResolvedValue({ data: null, error: null });
    single.mockResolvedValue({ data: null, error: { code: '23503' } });
    await expect(getOrCreatePartnerRef('donorbox')).resolves.toBeNull();
    // 23503 non è un race: la select gira una sola volta (lo step iniziale), mai un re-select.
    expect(maybeSingle).toHaveBeenCalledTimes(1);
    // il DELTA del fix: 23503 → logInfo (atteso), MAI il logError dell'inatteso.
    expect(mockLogInfo).toHaveBeenCalledWith(
      'ref non creato: utente senza profilo',
      'partnerRefService'
    );
    expect(mockLogError).not.toHaveBeenCalled();
    expect(mockLogWarn).not.toHaveBeenCalled();
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
