// C92 (giro valido del delta 1, f2-3): l'avviso Donorbox dichiara il codice collegato
// all'account, che parte anche senza nome ed email. Chi aveva rinunciato ai propri dati prima
// del testo nuovo non l'ha mai letto, quindi lo vede una volta. File NUOVO (R27).
import { act, renderHook } from '@testing-library/react-native';

import { usePartnerExit } from '@/shared/partner/usePartnerExit';
import {
  hasOptedOutOfPrefill,
  hasSeenPartnerDisclosure,
} from '@/shared/partner/disclosureFlag';
import { useAuth } from '@/shared/auth/AuthContext';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { getOrCreatePartnerRef } from '@/shared/partner/partnerRefService';

jest.mock('@/shared/auth/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/shared/hooks/useLinkHandler', () => ({
  useLinkHandler: jest.fn(),
}));
jest.mock('@/shared/partner/disclosureFlag', () => ({
  hasSeenPartnerDisclosure: jest.fn(),
  markPartnerDisclosureSeen: jest.fn().mockResolvedValue(undefined),
  hasOptedOutOfPrefill: jest.fn(),
  setPrefillOptOut: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/shared/partner/partnerRefService', () => ({
  getOrCreatePartnerRef: jest.fn(),
  utenteDellaSessione: jest.fn().mockResolvedValue('A'),
}));

const mockOpenLink = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useLinkHandler as jest.Mock).mockReturnValue({
    openLink: mockOpenLink,
    isLoading: null,
  });
  (useAuth as jest.Mock).mockReturnValue({
    session: { user: { id: 'A', email: 'a@r.it' } },
    profile: {
      id: 'A',
      first_name: 'Anna',
      last_name: 'Rossi',
      contact_email: 'a@r.it',
    },
    refreshProfile: jest.fn().mockResolvedValue(null),
    consentState: 'ok',
    refreshConsent: jest.fn().mockResolvedValue('ok'),
    needsReConsent: false,
  });
  jest.mocked(hasSeenPartnerDisclosure).mockResolvedValue(false);
  jest.mocked(hasOptedOutOfPrefill).mockResolvedValue(true);
  jest.mocked(getOrCreatePartnerRef).mockResolvedValue('REF-A');
});

const apriConRinuncia = async () => {
  const hook = renderHook(() => usePartnerExit());
  await act(async () => {
    await hook.result.current.openDonation();
  });
  return hook;
};

it('avviso Donorbox: chi aveva rinunciato ai dati vede il testo nuovo, il codice non parte in silenzio', async () => {
  const { result } = await apriConRinuncia();
  expect(result.current.donorboxDisclosureVisible).toBe(true);
  expect(mockOpenLink).not.toHaveBeenCalled();
});

it('avviso Donorbox: «Continua senza i miei dati» apre col codice e senza nome né email', async () => {
  const { result } = await apriConRinuncia();
  await act(async () => {
    await result.current.confirmDonorboxDisclosure(false);
  });
  const indirizzo = String(mockOpenLink.mock.calls[0]?.[0]);
  expect(indirizzo).toContain('utm_content=REF-A');
  expect(indirizzo).not.toContain('Anna');
  expect(indirizzo).not.toContain('email=');
});

it('avviso Donorbox: chi ci ripensa e sceglie «Continua» manda i dati annunciati', async () => {
  const { result } = await apriConRinuncia();
  await act(async () => {
    await result.current.confirmDonorboxDisclosure(true);
  });
  expect(String(mockOpenLink.mock.calls[0]?.[0])).toContain('first_name=Anna');
});

it('avviso Donorbox: rinuncia e nessun codice, niente da dichiarare e si apre subito', async () => {
  jest.mocked(getOrCreatePartnerRef).mockResolvedValue(null);
  const { result } = await apriConRinuncia();
  expect(result.current.donorboxDisclosureVisible).toBe(false);
  expect(mockOpenLink).toHaveBeenCalledTimes(1);
});
