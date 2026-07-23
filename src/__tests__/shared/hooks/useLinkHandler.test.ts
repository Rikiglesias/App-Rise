import { renderHook, act } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';

import { useLinkHandler } from '../../../shared/hooks/useLinkHandler';
import { RISE_URLS, SOCIAL_URLS } from '../../../shared/constants/urls';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('useLinkHandler', () => {
  it('should return link handler object', () => {
    const { result } = renderHook(() => useLinkHandler());

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });

  it('should have openLink method', () => {
    const { result } = renderHook(() => useLinkHandler());

    expect(result.current.openLink).toBeDefined();
  });

  it('should have openWebsiteLink method', () => {
    const { result } = renderHook(() => useLinkHandler());

    expect(result.current.openWebsiteLink).toBeDefined();
  });

  it('should return valid handler with multiple link methods', () => {
    const { result } = renderHook(() => useLinkHandler());

    expect(result.current).toHaveProperty('openLink');
    expect(result.current).toHaveProperty('openWebsiteLink');
  });
});

// Sentinella della trappola-classe «URL cambiato senza allowlist» (bug reale:
// pulsanti rotti SOLO in produzione perché __DEV__ bypassa il controllo).
// Qui si esercita il ramo di produzione: ogni URL che l'app può aprire DEVE
// passare l'allowlist, e un dominio estraneo DEVE essere bloccato.
describe('allowlist di produzione (__DEV__ = false)', () => {
  const globaleDev = globalThis as unknown as { __DEV__: boolean };
  let devOriginale: boolean;
  let openURLSpy: jest.SpyInstance;

  beforeAll(() => {
    devOriginale = globaleDev.__DEV__;
    globaleDev.__DEV__ = false;
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    openURLSpy = jest
      .spyOn(Linking, 'openURL')
      .mockResolvedValue(undefined as never);
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterAll(() => {
    globaleDev.__DEV__ = devOriginale;
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    // Spy creati una volta in beforeAll: qui si azzera solo la cronologia
    // (restore+rispy su metodi di prototype riusa lo spy e accumula chiamate).
    jest.clearAllMocks();
  });

  it('ogni URL ufficiale (RISE_URLS + SOCIAL_URLS) passa l’allowlist', async () => {
    const { result } = renderHook(() => useLinkHandler());
    const urls = [...Object.values(RISE_URLS), ...Object.values(SOCIAL_URLS)];

    for (const url of urls) {
      await act(async () => {
        const esito = await result.current.openLink(url, 'test');
        expect(esito.success).toBe(true);
      });
      expect(openURLSpy).toHaveBeenCalledWith(url);
    }
  });

  it('donorbox.org è consentito (embed donazioni, F1.7)', async () => {
    const { result } = renderHook(() => useLinkHandler());
    const url = 'https://donorbox.org/embed/dona-ora-rah';

    await act(async () => {
      const esito = await result.current.openLink(url, 'test');
      expect(esito.success).toBe(true);
    });
    expect(openURLSpy).toHaveBeenCalledWith(url);
  });

  it('un dominio fuori allowlist è bloccato, con alert e senza uscita', async () => {
    const { result } = renderHook(() => useLinkHandler());

    await act(async () => {
      const esito = await result.current.openLink(
        'https://evil.example.com/phishing',
        'test'
      );
      expect(esito.success).toBe(false);
    });
    expect(openURLSpy).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalled();
  });
});
