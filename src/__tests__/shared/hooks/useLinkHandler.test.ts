import { renderHook, act } from '@testing-library/react-native';
import { Alert, Linking } from 'react-native';
import { useLinkHandler } from '../../../shared/hooks/useLinkHandler';

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
 * di store. Questi test girano perciò con `__DEV__ = false`.
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

  it('blocca un dominio estraneo e avvisa l utente', async () => {
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
});
