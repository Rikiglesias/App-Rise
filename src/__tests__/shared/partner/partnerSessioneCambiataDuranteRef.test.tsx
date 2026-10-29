import { renderHook, act } from '@testing-library/react-native';

import { usePartnerExit } from '@/shared/partner/usePartnerExit';
import { useAuth } from '@/shared/auth/AuthContext';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { supabase } from '@/shared/auth/supabaseClient';

// Gemello di partnerSessioneCambiata: là la sessione è già di B prima della lettura
// del riferimento; qui è ancora di A al controllo del servizio e diventa di B MENTRE il
// riferimento viaggia in rete. Il riferimento torna non nullo, e l'uscita non deve
// fidarsi del controllo fatto prima dell'attesa.
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
jest.mock('@/shared/auth/supabaseClient', () => {
  const maybeSingle = jest.fn(() =>
    Promise.resolve({ data: { ref: 'REF-A' }, error: null })
  );
  const eqActive = jest.fn(() => ({ maybeSingle }));
  const eqPartner = jest.fn(() => ({ eq: eqActive }));
  const select = jest.fn(() => ({ eq: eqPartner }));
  return {
    supabase: {
      auth: { getSession: jest.fn() },
      from: jest.fn(() => ({ select })),
    },
  };
});

const mockOpenLink = jest.fn();
const getSession = supabase.auth.getSession as jest.Mock;
const sessioneDi = (id: string) => ({
  data: { session: { user: { id, email: `${id}@r.it` } } },
});

beforeEach(() => {
  jest.clearAllMocks();
  (useLinkHandler as jest.Mock).mockReturnValue({
    openLink: mockOpenLink,
    isLoading: null,
  });
  (useAuth as jest.Mock).mockReturnValue({
    session: { user: { id: 'A', email: 'A@r.it' } },
    profile: { id: 'A', first_name: 'Anna', last_name: 'Rossi' },
    refreshProfile: jest.fn().mockResolvedValue(null),
    consentState: 'ok',
    refreshConsent: jest.fn().mockResolvedValue('ok'),
    needsReConsent: false,
  });
  // Il servizio vede A; la domanda dopo la lettura del riferimento trova già B.
  getSession
    .mockResolvedValueOnce(sessioneDi('A'))
    .mockResolvedValue(sessioneDi('B'));
});

it('uscita donazione: sessione diventata di B mentre il riferimento era in rete, nessun link si apre', async () => {
  const { result } = renderHook(() => usePartnerExit());
  await act(async () => {
    await result.current.openDonation();
  });
  expect(mockOpenLink).not.toHaveBeenCalled();
});

it("uscita Let's Donation: sessione diventata di B mentre il riferimento era in rete, nessun link si apre", async () => {
  const { result } = renderHook(() => usePartnerExit());
  await act(async () => {
    await result.current.openLetsDonationExit(
      'https://x.letsdonation.com/charity/ecommerce',
      'shop'
    );
  });
  expect(mockOpenLink).not.toHaveBeenCalled();
});

it('sessione rimasta di A: il link parte col riferimento di A', async () => {
  getSession.mockReset().mockResolvedValue(sessioneDi('A'));
  const { result } = renderHook(() => usePartnerExit());
  await act(async () => {
    await result.current.openDonation();
  });
  expect(mockOpenLink).toHaveBeenCalledTimes(1);
  expect(mockOpenLink.mock.calls[0][0]).toContain('REF-A');
});
