import { renderHook, act } from '@testing-library/react-native';

import { usePartnerExit } from '@/shared/partner/usePartnerExit';
import { useAuth } from '@/shared/auth/AuthContext';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { getOrCreatePartnerRef } from '@/shared/partner/partnerRefService';
import {
  hasSeenPartnerDisclosure,
  markPartnerDisclosureSeen,
} from '@/shared/partner/disclosureFlag';

// Auth, link handler, service e flag mockati; partnerUrls/partnerEmail restano REALI
// (puri, già testati) così le asserzioni sull'URL costruito sono significative.
jest.mock('@/shared/auth/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/shared/hooks/useLinkHandler', () => ({
  useLinkHandler: jest.fn(),
}));
jest.mock('@/shared/partner/partnerRefService', () => ({
  getOrCreatePartnerRef: jest.fn(),
}));
jest.mock('@/shared/partner/disclosureFlag', () => ({
  hasSeenPartnerDisclosure: jest.fn(),
  markPartnerDisclosureSeen: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockUseLinkHandler = useLinkHandler as jest.Mock;
const mockGetOrCreate = getOrCreatePartnerRef as jest.Mock;
const mockHasSeen = hasSeenPartnerDisclosure as jest.Mock;
const mockMarkSeen = markPartnerDisclosureSeen as jest.Mock;
const mockOpenLink = jest.fn();

const SHOP_URL = 'https://x.letsdonation.com/charity/ecommerce';

const setAuth = (over: {
  userId?: string | null;
  email?: string | null;
  firstName?: string;
  lastName?: string;
  contactEmail?: string | null;
}) => {
  mockUseAuth.mockReturnValue({
    session: over.userId
      ? { user: { id: over.userId, email: over.email ?? null } }
      : null,
    profile: over.userId
      ? {
          first_name: over.firstName ?? 'Mario',
          last_name: over.lastName ?? 'Rossi',
          contact_email: over.contactEmail ?? null,
        }
      : null,
  });
};

describe('usePartnerExit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLinkHandler.mockReturnValue({
      openLink: mockOpenLink,
      isLoading: null,
    });
    mockMarkSeen.mockResolvedValue(undefined);
  });

  it('openDonation → Donorbox con ref in utm_content e prefill anagrafico', async () => {
    setAuth({ userId: 'u1', email: 'mario@gmail.com' });
    mockGetOrCreate.mockResolvedValue('DREF');

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });

    expect(mockGetOrCreate).toHaveBeenCalledWith('donorbox');
    const [url, key] = mockOpenLink.mock.calls[0];
    expect(url).toContain('donorbox.org/dona-ora-rah');
    expect(url).toContain('utm_content=DREF');
    expect(url).toContain('first_name=Mario');
    expect(url).toContain('last_name=Rossi');
    expect(url).toContain('email=mario%40gmail.com');
    expect(key).toBe('donation');
  });

  it('openDonation: email Apple relay NON precompilata', async () => {
    setAuth({ userId: 'u1', email: 'abc@privaterelay.appleid.com' });
    mockGetOrCreate.mockResolvedValue('DREF');

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });

    const [url] = mockOpenLink.mock.calls[0];
    expect(url).not.toContain('email=');
    expect(url).toContain('utm_content=DREF');
  });

  it('openDonation ospite (no ref) → URL senza utm_content, apre comunque', async () => {
    setAuth({ userId: null });
    mockGetOrCreate.mockResolvedValue(null);

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openDonation();
    });

    const [url] = mockOpenLink.mock.calls[0];
    expect(url).not.toContain('utm_content');
    expect(url).not.toContain('email=');
  });

  it('Let s Donation MAI vista → mostra la schermata onesta, non esce ancora', async () => {
    setAuth({ userId: 'u1', email: 'a@b.it' });
    mockHasSeen.mockResolvedValue(false);

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openLetsDonationExit(SHOP_URL, 'shop');
    });

    expect(result.current.disclosureVisible).toBe(true);
    expect(mockOpenLink).not.toHaveBeenCalled();
    expect(mockGetOrCreate).not.toHaveBeenCalled();
  });

  it('Let s Donation GIÀ vista → esce dritto col rise_ref', async () => {
    setAuth({ userId: 'u1', email: 'a@b.it' });
    mockHasSeen.mockResolvedValue(true);
    mockGetOrCreate.mockResolvedValue('LREF');

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openLetsDonationExit(SHOP_URL, 'shop');
    });

    expect(result.current.disclosureVisible).toBe(false);
    expect(mockGetOrCreate).toHaveBeenCalledWith('letsdonation');
    const [url, key] = mockOpenLink.mock.calls[0];
    expect(url).toBe(`${SHOP_URL}?rise_ref=LREF`);
    expect(key).toBe('shop');
  });

  it('confirmDisclosure → memorizza e prosegue l uscita in sospeso', async () => {
    setAuth({ userId: 'u1', email: 'a@b.it' });
    mockHasSeen.mockResolvedValue(false);
    mockGetOrCreate.mockResolvedValue('LREF');

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openLetsDonationExit(SHOP_URL, 'shop');
    });
    await act(async () => {
      await result.current.confirmDisclosure();
    });

    expect(mockMarkSeen).toHaveBeenCalledWith('u1');
    expect(result.current.disclosureVisible).toBe(false);
    const [url] = mockOpenLink.mock.calls[0];
    expect(url).toBe(`${SHOP_URL}?rise_ref=LREF`);
  });

  it('cancelDisclosure → nasconde e NON esce', async () => {
    setAuth({ userId: 'u1', email: 'a@b.it' });
    mockHasSeen.mockResolvedValue(false);

    const { result } = renderHook(() => usePartnerExit());
    await act(async () => {
      await result.current.openLetsDonationExit(SHOP_URL, 'shop');
    });
    act(() => {
      result.current.cancelDisclosure();
    });

    expect(result.current.disclosureVisible).toBe(false);
    expect(mockOpenLink).not.toHaveBeenCalled();
  });
});
