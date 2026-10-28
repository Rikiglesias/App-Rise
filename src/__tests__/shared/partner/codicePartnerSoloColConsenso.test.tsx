import { renderHook, act } from '@testing-library/react-native';

import { usePartnerExit } from '@/shared/partner/usePartnerExit';
import { useAuth } from '@/shared/auth/AuthContext';
import type { ConsentState } from '@/shared/auth/useConsentState';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { getOrCreatePartnerRef } from '@/shared/partner/partnerRefService';
import {
  hasSeenPartnerDisclosure,
  hasOptedOutOfPrefill,
  markPartnerDisclosureSeen,
  setPrefillOptOut,
} from '@/shared/partner/disclosureFlag';

// C91: il codice verso i partner (`rise_ref`, `utm_content`) parte solo col consenso
// all'informativa `ok`. Servizio del codice e flag finti; costruzione degli indirizzi vera.
jest.mock('@/shared/auth/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/shared/hooks/useLinkHandler', () => ({
  useLinkHandler: jest.fn(),
}));
jest.mock('@/shared/partner/partnerRefService', () => ({
  getOrCreatePartnerRef: jest.fn(),
  utenteDellaSessione: jest.fn(() => Promise.resolve('u1')),
}));
jest.mock('@/shared/partner/disclosureFlag', () => ({
  hasSeenPartnerDisclosure: jest.fn(),
  markPartnerDisclosureSeen: jest.fn(),
  hasOptedOutOfPrefill: jest.fn(),
  setPrefillOptOut: jest.fn(),
}));

const SHOP_URL = 'https://x.letsdonation.com/charity/ecommerce';
const openLink = jest.fn();
const refreshConsent = jest.fn();

/** Utente collegato col profilo; `dopo` è l'esito della ri-verifica del consenso. */
const collegato = (stato: ConsentState, dopo: ConsentState = stato): void => {
  refreshConsent.mockResolvedValue(dopo);
  jest.mocked(useAuth).mockReturnValue({
    session: { user: { id: 'u1', email: 'mario@gmail.com' } },
    profile: {
      id: 'u1',
      first_name: 'Mario',
      last_name: 'Rossi',
      contact_email: null,
    },
    refreshProfile: jest.fn().mockResolvedValue(null),
    consentState: stato,
    refreshConsent,
    needsReConsent: stato === 'needed',
  } as unknown as ReturnType<typeof useAuth>);
};

// Due modi di «non verificato»: da riaccettare, e ignoto anche dopo la ri-verifica.
const NON_VERIFICATO: ConsentState[] = ['needed', 'unknown'];

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useLinkHandler).mockReturnValue({
    openLink,
    isLoading: null,
  } as unknown as ReturnType<typeof useLinkHandler>);
  jest
    .mocked(getOrCreatePartnerRef)
    .mockImplementation(partner =>
      Promise.resolve(partner === 'donorbox' ? 'DREF' : 'LREF')
    );
  jest.mocked(hasSeenPartnerDisclosure).mockResolvedValue(true);
  jest.mocked(markPartnerDisclosureSeen).mockResolvedValue(undefined);
  jest.mocked(hasOptedOutOfPrefill).mockResolvedValue(false);
  jest.mocked(setPrefillOptOut).mockResolvedValue(undefined);
});

const indirizzoAperto = (): string => openLink.mock.calls[0]?.[0] as string;

it("Let's Donation: consenso non verificato → nessun codice", async () => {
  for (const stato of NON_VERIFICATO) {
    openLink.mockClear();
    jest.mocked(getOrCreatePartnerRef).mockClear();
    collegato(stato);
    const { result, unmount } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openLetsDonationExit(SHOP_URL, 'shop');
    });
    expect(openLink).toHaveBeenCalledTimes(1);
    expect(indirizzoAperto()).toBe(SHOP_URL);
    // Senza consenso il codice non si crea nemmeno.
    expect(getOrCreatePartnerRef).not.toHaveBeenCalled();
    unmount();
  }
});

it("Let's Donation: consenso ignoto ma ri-verifica OK → codice presente (ri-verifica chiamata)", async () => {
  collegato('unknown', 'ok');
  const { result } = renderHook(() => usePartnerExit());
  await act(async () => {
    await result.current.openLetsDonationExit(SHOP_URL, 'shop');
  });
  expect(refreshConsent).toHaveBeenCalledTimes(1);
  expect(indirizzoAperto()).toBe(`${SHOP_URL}?rise_ref=LREF`);
});

it('Donorbox: consenso non verificato → nessun utm_content', async () => {
  for (const stato of NON_VERIFICATO) {
    openLink.mockClear();
    jest.mocked(getOrCreatePartnerRef).mockClear();
    collegato(stato);
    const { result, unmount } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });
    expect(openLink).toHaveBeenCalledTimes(1);
    expect(indirizzoAperto()).not.toContain('utm_content');
    expect(indirizzoAperto()).not.toContain('first_name');
    expect(getOrCreatePartnerRef).not.toHaveBeenCalled();
    unmount();
  }
});

it('Donorbox: continua senza i miei dati → codice sì, nome ed email no', async () => {
  collegato('ok');
  jest.mocked(hasSeenPartnerDisclosure).mockResolvedValue(false);
  const { result } = renderHook(() => usePartnerExit());
  await act(async () => {
    await result.current.openDonation();
  });
  expect(result.current.donorboxDisclosureVisible).toBe(true);
  await act(async () => {
    await result.current.confirmDonorboxDisclosure(false);
  });
  const url = indirizzoAperto();
  expect(url).toContain('utm_content=DREF');
  expect(url).not.toContain('first_name');
  expect(url).not.toContain('last_name');
  expect(url).not.toContain('email=');
});
