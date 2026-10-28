import { renderHook, act } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';

import { usePartnerExit } from '@/shared/partner/usePartnerExit';
import { useAuth } from '@/shared/auth/AuthContext';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';

// C92: gli avvisi ora nominano il codice collegato all'account. Chi aveva letto il testo
// vecchio ha in memoria le chiavi `_v1`: deve rivedere il testo nuovo. Flag VERI, storage
// finto (il preset di Jest è `ios`, quindi il ramo SecureStore).
jest.mock('@/shared/auth/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/shared/hooks/useLinkHandler', () => ({
  useLinkHandler: jest.fn(),
}));
jest.mock('@/shared/partner/partnerRefService', () => ({
  getOrCreatePartnerRef: jest.fn((partner: string) =>
    Promise.resolve(partner === 'donorbox' ? 'DREF' : 'LREF')
  ),
  utenteDellaSessione: jest.fn(() => Promise.resolve('u1')),
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const SHOP_URL = 'https://x.letsdonation.com/charity/ecommerce';
const openLink = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  const visti = new Map([
    ['partner_disclosure_seen_v1_u1', '1'],
    ['donorbox_disclosure_seen_v1_u1', '1'],
  ]);
  jest
    .mocked(SecureStore.getItemAsync)
    .mockImplementation(k => Promise.resolve(visti.get(k) ?? null));
  jest.mocked(SecureStore.setItemAsync).mockImplementation((k, v) => {
    visti.set(k, v);
    return Promise.resolve();
  });
  jest.mocked(useLinkHandler).mockReturnValue({
    openLink,
    isLoading: null,
  } as unknown as ReturnType<typeof useLinkHandler>);
  jest.mocked(useAuth).mockReturnValue({
    session: { user: { id: 'u1', email: 'mario@gmail.com' } },
    profile: {
      id: 'u1',
      first_name: 'Mario',
      last_name: 'Rossi',
      contact_email: null,
    },
    refreshProfile: jest.fn().mockResolvedValue(null),
    consentState: 'ok',
    refreshConsent: jest.fn().mockResolvedValue('ok'),
    needsReConsent: false,
  } as unknown as ReturnType<typeof useAuth>);
});

it('avviso partner: testo nuovo mostrato anche a chi aveva visto il vecchio', async () => {
  const { result } = renderHook(() => usePartnerExit());

  await act(async () => {
    await result.current.openLetsDonationExit(SHOP_URL, 'shop');
  });
  expect(result.current.disclosureVisible).toBe(true);
  expect(openLink).not.toHaveBeenCalled();
  act(() => result.current.cancelDisclosure());

  await act(async () => {
    await result.current.openDonation();
  });
  expect(result.current.donorboxDisclosureVisible).toBe(true);
  expect(openLink).not.toHaveBeenCalled();

  // Letto il testo nuovo, alla volta dopo si va dritti.
  await act(async () => {
    await result.current.confirmDonorboxDisclosure(true);
  });
  openLink.mockClear();
  await act(async () => {
    await result.current.openDonation();
  });
  expect(result.current.donorboxDisclosureVisible).toBe(false);
  expect(openLink).toHaveBeenCalledTimes(1);
});
