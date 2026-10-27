import { renderHook, act } from '@testing-library/react-native';

import { usePartnerExit } from '@/shared/partner/usePartnerExit';
import { useAuth } from '@/shared/auth/AuthContext';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { supabase } from '@/shared/auth/supabaseClient';

// Il servizio dei riferimenti è quello VERO: la finestra sta proprio fra lui e il
// render. Un link di B apre la sessione di B nel client, ma il render è ancora di A
// (profilo di A in mano): un riferimento di B accanto ai dati di A partirebbe verso
// il partner. Si esce senza aprire niente; il tocco successivo parte con B.
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
    Promise.resolve({ data: { ref: 'REF-B' }, error: null })
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

const statoDi = (id: string, nome: string) => ({
  session: { user: { id, email: `${id}@r.it` } },
  profile: {
    id,
    first_name: nome,
    last_name: 'Rossi',
    contact_email: null,
  },
  refreshProfile: jest.fn().mockResolvedValue(null),
  consentState: 'ok',
  refreshConsent: jest.fn().mockResolvedValue('ok'),
  needsReConsent: false,
});

beforeEach(() => {
  jest.clearAllMocks();
  (useLinkHandler as jest.Mock).mockReturnValue({
    openLink: mockOpenLink,
    isLoading: null,
  });
});

it('sessione già di B mentre il render è ancora di A: nessun link si apre', async () => {
  (useAuth as jest.Mock).mockReturnValue(statoDi('A', 'Anna'));
  getSession.mockResolvedValue({
    data: { session: { user: { id: 'B', email: 'B@r.it' } } },
  });
  const { result, rerender } = renderHook(() => usePartnerExit());

  await act(async () => {
    await result.current.openDonation();
    await result.current.openLetsDonationExit(
      'https://x.letsdonation.com/charity/ecommerce',
      'shop'
    );
  });
  expect(mockOpenLink).not.toHaveBeenCalled();

  // Arrivato il render di B, il tocco successivo apre con l'account nuovo.
  (useAuth as jest.Mock).mockReturnValue(statoDi('B', 'Bruno'));
  rerender({});
  await act(async () => {
    await result.current.openDonation();
  });
  expect(mockOpenLink).toHaveBeenCalledTimes(1);
  const [url] = mockOpenLink.mock.calls[0] as [string];
  expect(url).toContain('REF-B');
  expect(url).not.toContain('Anna');
});
