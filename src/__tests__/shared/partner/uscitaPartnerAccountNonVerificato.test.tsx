// Token scaduto e rinnovo fallito per un momento: `getSession()` risponde «nessuna
// sessione» CON un errore. Non è un cambio di account: la persona è ancora collegata.
// Prima Dona e Shop si fermavano in silenzio (nessun browser, nessun messaggio); ora
// compare un messaggio e il tocco successivo riprova (giro 2 del delta, f2-2).
// Servizio partner VERO, client simulato. File NUOVO (R27).
import { Alert } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';

import { usePartnerExit } from '@/shared/partner/usePartnerExit';
import { useAuth } from '@/shared/auth/AuthContext';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { supabase } from '@/shared/auth/supabaseClient';
import i18n from '@/locales';
import itLocale from '@/locales/it';
import enLocale from '@/locales/en';

jest.mock('@/shared/auth/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/shared/hooks/useLinkHandler', () => ({
  useLinkHandler: jest.fn(),
}));
jest.mock('@/shared/partner/disclosureFlag', () => ({
  hasSeenPartnerDisclosure: jest.fn().mockResolvedValue(true),
  markPartnerDisclosureSeen: jest.fn().mockResolvedValue(undefined),
  hasOptedOutOfPrefill: jest.fn().mockResolvedValue(false),
  setPrefillOptOut: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: {
    auth: { getSession: jest.fn() },
    from: jest.fn(),
  },
}));

const mockOpenLink = jest.fn();
const collegataA = { data: { session: { user: { id: 'A' } } }, error: null };
const rinnovoFallito = {
  data: { session: null },
  error: { name: 'AuthRetryableFetchError', message: 'Network request failed' },
};
const SHOP = 'https://letsdonation.example/shop';

beforeEach(() => {
  jest.clearAllMocks();
  (useLinkHandler as jest.Mock).mockReturnValue({
    openLink: mockOpenLink,
    isLoading: null,
  });
  (useAuth as jest.Mock).mockReturnValue({
    session: { user: { id: 'A', email: 'a@r.it' } },
    profile: null,
    refreshProfile: jest.fn().mockResolvedValue(null),
    consentState: 'ok',
    refreshConsent: jest.fn().mockResolvedValue('ok'),
    needsReConsent: false,
  });
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  (supabase.auth.getSession as jest.Mock).mockResolvedValue(rinnovoFallito);
  // Il codice del partner passa dal database: riga già esistente per A.
  (supabase.from as jest.Mock).mockReturnValue({
    select: () => ({
      eq: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: () =>
              Promise.resolve({ data: { ref: 'REF-A' }, error: null }),
          }),
        }),
      }),
    }),
  });
});

// La lingua dei test è quella attiva: si confronta con la sua traduzione.
const messaggio = i18n.t('partner.sessioneNonVerificata');

// Nei dizionari, non attraverso `i18n.t`: col fallback attivo una chiave italiana
// mancante uscirebbe in inglese e il test passerebbe lo stesso (revisione, rilievo 6).
it('il messaggio c’è in italiano e in inglese, ed è diverso nelle due lingue', () => {
  const it_ = itLocale.partner.sessioneNonVerificata;
  const en_ = enLocale.partner.sessioneNonVerificata;
  expect(typeof it_).toBe('string');
  expect(typeof en_).toBe('string');
  expect(it_.trim()).not.toBe('');
  expect(en_.trim()).not.toBe('');
  expect(it_).not.toBe(en_);
});

it('Dona con l’account non verificabile: niente uscita in silenzio, compare il messaggio', async () => {
  const { result } = renderHook(() => usePartnerExit());
  await act(async () => {
    await result.current.openDonation();
  });
  expect(mockOpenLink).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledWith(expect.any(String), messaggio);
  expect(result.current.isExiting).toBe(false);
});

it('Shop con l’account non verificabile: compare il messaggio', async () => {
  const { result } = renderHook(() => usePartnerExit());
  await act(async () => {
    await result.current.openLetsDonationExit(SHOP, 'shop');
  });
  expect(mockOpenLink).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledWith(expect.any(String), messaggio);
});

it('lettura della sessione che rigetta (storage): compare lo stesso messaggio', async () => {
  (supabase.auth.getSession as jest.Mock).mockRejectedValue(
    new Error('SecureStore unavailable')
  );
  const { result } = renderHook(() => usePartnerExit());
  await act(async () => {
    await result.current.openLetsDonationExit(SHOP, 'shop');
  });
  expect(mockOpenLink).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledWith(expect.any(String), messaggio);
});

it('il tocco dopo, col rinnovo riuscito, esce davvero col codice di A', async () => {
  const { result } = renderHook(() => usePartnerExit());
  await act(async () => {
    await result.current.openLetsDonationExit(SHOP, 'shop');
  });
  // Primo tocco: niente uscita e il messaggio (revisione, rilievo 4: senza queste due
  // righe il test passava anche alla base, dove il primo tocco taceva).
  expect(mockOpenLink).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledWith(expect.any(String), messaggio);
  (supabase.auth.getSession as jest.Mock).mockResolvedValue(collegataA);
  await act(async () => {
    await result.current.openLetsDonationExit(SHOP, 'shop');
  });
  expect(mockOpenLink).toHaveBeenCalledTimes(1);
  expect(String(mockOpenLink.mock.calls[0]?.[0])).toContain('REF-A');
});
