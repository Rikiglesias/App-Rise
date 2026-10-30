// C85, revisione del delta 1 (abc-3, g-2, arch-3 e chiusura di C85): gemello di
// partnerSessioneCambiataDuranteRef. Là la sessione cambia mentre il riferimento è in rete; qui
// mentre si legge o si scrive lo storage del telefono, DOPO quel controllo. L'indirizzo è di A e
// non deve aprirsi con la sessione di B. File NUOVO (R27).
import { renderHook, act } from '@testing-library/react-native';

import { usePartnerExit } from '@/shared/partner/usePartnerExit';
import { useAuth } from '@/shared/auth/AuthContext';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { supabase } from '@/shared/auth/supabaseClient';
import {
  hasOptedOutOfPrefill,
  hasSeenPartnerDisclosure,
  markPartnerDisclosureSeen,
  setPrefillOptOut,
} from '@/shared/partner/disclosureFlag';

jest.mock('@/shared/auth/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/shared/hooks/useLinkHandler', () => ({
  useLinkHandler: jest.fn(),
}));
jest.mock('@/shared/partner/disclosureFlag', () => ({
  hasSeenPartnerDisclosure: jest.fn(),
  markPartnerDisclosureSeen: jest.fn(),
  hasOptedOutOfPrefill: jest.fn(),
  setPrefillOptOut: jest.fn(),
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
const entraB = () => getSession.mockResolvedValue(sessioneDi('B'));

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
  getSession.mockResolvedValue(sessioneDi('A'));
  jest.mocked(hasSeenPartnerDisclosure).mockResolvedValue(true);
  jest.mocked(hasOptedOutOfPrefill).mockResolvedValue(false);
  jest.mocked(markPartnerDisclosureSeen).mockResolvedValue(undefined);
  jest.mocked(setPrefillOptOut).mockResolvedValue(undefined);
});

it('uscita donazione: sessione diventata di B mentre si legge la rinuncia, nessun link si apre', async () => {
  jest.mocked(hasOptedOutOfPrefill).mockImplementation(() => {
    entraB();
    return Promise.resolve(false);
  });
  const { result } = renderHook(() => usePartnerExit());
  await act(async () => {
    await result.current.openDonation();
  });
  expect(mockOpenLink).not.toHaveBeenCalled();
});

it("uscita donazione: sessione diventata di B mentre si legge l'avviso visto, nessun avviso e nessun link", async () => {
  jest.mocked(hasSeenPartnerDisclosure).mockImplementation(() => {
    entraB();
    return Promise.resolve(false);
  });
  const { result } = renderHook(() => usePartnerExit());
  await act(async () => {
    await result.current.openDonation();
  });
  expect(result.current.donorboxDisclosureVisible).toBe(false);
  expect(mockOpenLink).not.toHaveBeenCalled();
});

it('conferma Donorbox: sessione diventata di B mentre si salva la scelta, nessun link si apre', async () => {
  jest.mocked(hasSeenPartnerDisclosure).mockResolvedValue(false);
  const { result } = renderHook(() => usePartnerExit());
  await act(async () => {
    await result.current.openDonation();
  });
  expect(result.current.donorboxDisclosureVisible).toBe(true);

  jest.mocked(setPrefillOptOut).mockImplementation(() => {
    entraB();
    return Promise.resolve();
  });
  await act(async () => {
    await result.current.confirmDonorboxDisclosure(true);
  });

  expect(mockOpenLink).not.toHaveBeenCalled();
});

it('conferma Donorbox: sessione rimasta di A, il link parte coi dati di A', async () => {
  jest.mocked(hasSeenPartnerDisclosure).mockResolvedValue(false);
  const { result } = renderHook(() => usePartnerExit());
  await act(async () => {
    await result.current.openDonation();
  });

  await act(async () => {
    await result.current.confirmDonorboxDisclosure(true);
  });

  expect(mockOpenLink).toHaveBeenCalledTimes(1);
  expect(mockOpenLink.mock.calls[0][0]).toContain('REF-A');
  expect(mockOpenLink.mock.calls[0][0]).toContain('first_name=Anna');
});
