/**
 * Test del flag "schermata onesta già vista" sul path NATIVO (SecureStore),
 * che è quello di produzione (iOS/Android). Il jest preset RN imposta
 * Platform.OS = 'ios', quindi le funzioni prendono il ramo SecureStore.
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import {
  hasSeenPartnerDisclosure,
  markPartnerDisclosureSeen,
  hasOptedOutOfPrefill,
  setPrefillOptOut,
} from '@/shared/partner/disclosureFlag';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockGet = SecureStore.getItemAsync as jest.Mock;
const mockSet = SecureStore.setItemAsync as jest.Mock;

describe('disclosureFlag (path nativo SecureStore)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hasSeen è false quando lo storage è vuoto', async () => {
    mockGet.mockResolvedValue(null);
    await expect(hasSeenPartnerDisclosure('user-1')).resolves.toBe(false);
  });

  it('hasSeen è true quando il flag vale "1"', async () => {
    mockGet.mockResolvedValue('1');
    await expect(hasSeenPartnerDisclosure('user-1')).resolves.toBe(true);
  });

  it('mark scrive "1" sotto una chiave scopata per utente', async () => {
    mockSet.mockResolvedValue(undefined);
    await markPartnerDisclosureSeen('user-42');
    expect(mockSet).toHaveBeenCalledWith(
      'partner_disclosure_seen_v2_user-42',
      '1'
    );
  });

  it('senza userId usa la chiave condivisa (ospite)', async () => {
    mockGet.mockResolvedValue(null);
    await hasSeenPartnerDisclosure();
    expect(mockGet).toHaveBeenCalledWith('partner_disclosure_seen_v2');
  });

  it('chiavi distinte per utenti distinti (il flag di uno non copre l altro)', async () => {
    mockGet.mockResolvedValue(null);
    await hasSeenPartnerDisclosure('a');
    await hasSeenPartnerDisclosure('b');
    expect(mockGet).toHaveBeenNthCalledWith(1, 'partner_disclosure_seen_v2_a');
    expect(mockGet).toHaveBeenNthCalledWith(2, 'partner_disclosure_seen_v2_b');
  });

  it('fail-open in lettura: errore storage → false (mostra l avviso)', async () => {
    mockGet.mockRejectedValue(new Error('keychain unavailable'));
    await expect(hasSeenPartnerDisclosure('user-1')).resolves.toBe(false);
  });

  it('mark inghiotte gli errori di scrittura senza propagare', async () => {
    mockSet.mockRejectedValue(new Error('keychain unavailable'));
    await expect(markPartnerDisclosureSeen('user-1')).resolves.toBeUndefined();
  });
});

describe('disclosureFlag — errori della rinuncia', () => {
  afterEach(() => jest.restoreAllMocks());

  it('una lettura nativa fallita protegge i dati anche se l avviso era visto', async () => {
    mockGet.mockRejectedValue(new Error('keychain unavailable'));
    await expect(hasOptedOutOfPrefill('user-1')).resolves.toBe(true);
  });

  it('una scrittura nativa fallita propaga l errore al chiamante', async () => {
    const error = new Error('keychain unavailable');
    mockSet.mockRejectedValue(error);
    await expect(setPrefillOptOut('user-1', true)).rejects.toBe(error);
  });

  it('la lettura web fallita protegge i dati', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const descriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'localStorage'
    );
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get: () => {
        throw new Error('storage denied');
      },
    });
    try {
      await expect(hasOptedOutOfPrefill('user-1')).resolves.toBe(true);
    } finally {
      if (descriptor)
        Object.defineProperty(globalThis, 'localStorage', descriptor);
      else Reflect.deleteProperty(globalThis, 'localStorage');
    }
  });

  it('senza storage web protegge i dati e non dichiara salvata la scelta', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const descriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'localStorage'
    );
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: undefined,
    });
    try {
      await expect(hasOptedOutOfPrefill('user-1')).resolves.toBe(true);
      await expect(setPrefillOptOut('user-1', true)).rejects.toThrow();
    } finally {
      if (descriptor)
        Object.defineProperty(globalThis, 'localStorage', descriptor);
      else Reflect.deleteProperty(globalThis, 'localStorage');
    }
  });
});
