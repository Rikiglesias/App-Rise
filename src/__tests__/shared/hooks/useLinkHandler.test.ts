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

// `react-native` espone Linking leggendo `.default` del modulo interno:
// senza l'interop ESM l'import da 'react-native' resta undefined.
jest.mock('react-native/Libraries/Linking/Linking', () => {
  const linkingMock = {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
  };
  return { __esModule: true, default: linkingMock, ...linkingMock };
});

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

/**
 * L'allowlist di domini è attiva SOLO in produzione (`if (__DEV__) return true`),
 * quindi ogni regressione qui è invisibile in sviluppo e colpisce solo le build
 * di store (bug reale: tel/mailto bloccati solo in produzione). Sentinella della
 * trappola-classe «URL cambiato senza allowlist»: ogni URL che l'app può aprire
 * DEVE passare, un dominio o schema estraneo DEVE essere bloccato.
 */
describe('useLinkHandler — allowlist in produzione (__DEV__ = false)', () => {
  // `__DEV__` è iniettato dal runtime RN: non è nei tipi di globalThis.
  const globalWithDev = global as typeof globalThis & { __DEV__: boolean };
  const originalDev = globalWithDev.__DEV__;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    globalWithDev.__DEV__ = false;
    jest.clearAllMocks();
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    globalWithDev.__DEV__ = originalDev;
    alertSpy.mockRestore();
  });

  it.each([
    ['tel:051704070', 'phone'],
    ['mailto:info@riseagainsthunger.it', 'email'],
  ])('apre %s: gli schemi senza host non sono bloccati', async (url, key) => {
    const { result } = renderHook(() => useLinkHandler({ retryAttempts: 1 }));

    await act(async () => {
      await result.current.openLink(url, key);
    });

    expect(Linking.openURL).toHaveBeenCalledWith(url);
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('apre un dominio presente in allowlist', async () => {
    const url = 'https://italy.riseagainsthunger.org/donaora/';
    const { result } = renderHook(() => useLinkHandler({ retryAttempts: 1 }));

    await act(async () => {
      await result.current.openLink(url, 'donation');
    });

    expect(Linking.openURL).toHaveBeenCalledWith(url);
  });

  it('ogni URL ufficiale (RISE_URLS + SOCIAL_URLS) passa l’allowlist', async () => {
    const { result } = renderHook(() => useLinkHandler({ retryAttempts: 1 }));
    const urls = [...Object.values(RISE_URLS), ...Object.values(SOCIAL_URLS)];

    for (const url of urls) {
      await act(async () => {
        const esito = await result.current.openLink(url, 'test');
        expect(esito.success).toBe(true);
      });
      expect(Linking.openURL).toHaveBeenCalledWith(url);
    }
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('gli URL costruiti inline nell’app (maps di ChiSiamo) passano l’allowlist', async () => {
    // ChiSiamoScreen.tsx costruisce l'URL mappa a runtime: non è in RISE_URLS,
    // quindi l'iterazione sopra non lo copre (finding F-c4b91f03).
    const url = 'https://maps.google.com/?q=Via+di+Prova+1+Bologna';
    const { result } = renderHook(() => useLinkHandler({ retryAttempts: 1 }));

    await act(async () => {
      const esito = await result.current.openLink(url, 'maps');
      expect(esito.success).toBe(true);
    });
    expect(Linking.openURL).toHaveBeenCalledWith(url);
  });

  it('donorbox.org è consentito (embed donazioni, F1.7)', async () => {
    const url = 'https://donorbox.org/embed/dona-ora-rah';
    const { result } = renderHook(() => useLinkHandler({ retryAttempts: 1 }));

    await act(async () => {
      const esito = await result.current.openLink(url, 'donorbox');
      expect(esito.success).toBe(true);
    });
    expect(Linking.openURL).toHaveBeenCalledWith(url);
  });

  it('blocca un dominio estraneo e avvisa l’utente', async () => {
    const { result } = renderHook(() => useLinkHandler({ retryAttempts: 1 }));

    await act(async () => {
      await result.current.openLink('https://evil.example.com/phish', 'x');
    });

    expect(Linking.openURL).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalled();
  });

  it('blocca uno schema non previsto (javascript:)', async () => {
    const { result } = renderHook(() => useLinkHandler({ retryAttempts: 1 }));

    await act(async () => {
      await result.current.openLink('javascript:alert(1)', 'x');
    });

    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('blocca http: anche su host in allowlist (solo https per il web)', async () => {
    const { result } = renderHook(() => useLinkHandler({ retryAttempts: 1 }));

    await act(async () => {
      const esito = await result.current.openLink(
        'http://facebook.com/RAHItalia',
        'x'
      );
      expect(esito.success).toBe(false);
    });
    expect(Linking.openURL).not.toHaveBeenCalled();
  });
});
