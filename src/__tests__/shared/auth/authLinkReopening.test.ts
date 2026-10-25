import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';

import type { RootStackParamList } from '@/navigation/types';
import { useAuthDeepLink } from '@/shared/auth/useAuthDeepLink';
import { changeLanguage, getCurrentLocale } from '@/locales';

const mockListeners = new Set<(event: { url: string }) => void>();
const mockGetInitialURL = jest.fn<Promise<string | null>, []>();
const mockSubscribe = jest.fn(
  (_type: string, listener: (event: { url: string }) => void) => {
    mockListeners.add(listener);
    return { remove: () => mockListeners.delete(listener) };
  }
);
jest.mock('expo-linking', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    createURL: (path: string) => `rahitalia://${path}`,
    getInitialURL: () => mockGetInitialURL(),
    addEventListener: (...args: Parameters<typeof mockSubscribe>) =>
      mockSubscribe(...args),
    useURL: () => {
      const [url, setUrl] = React.useState<string | null>(null);
      React.useEffect(() => {
        void mockGetInitialURL().then(setUrl);
        const sub = mockSubscribe('url', event => setUrl(event.url));
        return () => {
          sub.remove();
        };
      }, []);
      return url;
    },
  };
});
const mockRecovery = jest.fn();
jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: () => ({
    completeRecoveryFromUrl: mockRecovery,
    completeEmailConfirmFromUrl: mockRecovery,
  }),
}));

let alert: jest.SpyInstance;
let locale: ReturnType<typeof getCurrentLocale>;
beforeEach(() => {
  mockListeners.clear();
  mockSubscribe.mockClear();
  mockGetInitialURL.mockReset().mockResolvedValue(null);
  mockRecovery.mockReset().mockResolvedValue({ ok: true });
  locale = getCurrentLocale();
  changeLanguage('it');
  alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(() => {
  alert.mockRestore();
  changeLanguage(locale);
});

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
const mount = async () => {
  const nav = {
    navigate: jest.fn(),
    isReady: () => true,
    addListener: jest.fn(() => jest.fn()),
  };
  const hook = renderHook(() =>
    useAuthDeepLink(
      nav as unknown as NavigationContainerRefWithCurrent<RootStackParamList>
    )
  );
  await flush();
  return { ...hook, nav };
};
const emit = async (url: string) => {
  act(() => mockListeners.forEach(listener => listener({ url })));
  await flush();
};

describe.each([
  [
    'scambio fallito',
    'rahitalia://reset-password?code=failed',
    'Link di accesso non riuscito',
  ],
  [
    'link scaduto',
    'rahitalia://reset-password#error_code=otp_expired',
    'Link scaduto',
  ],
])('%s', (_case, url, title) => {
  it('link di recupero fallito: la riapertura avvisa', async () => {
    mockRecovery.mockResolvedValue({ ok: false });
    const { rerender, nav } = await mount();
    await emit(url);
    expect(alert).toHaveBeenCalledTimes(1);
    const firstAlert = alert.mock.calls[0];
    expect(firstAlert[0]).toBe(title);
    expect(firstAlert[1]).toMatch(/nuovo/i);
    rerender({});
    await flush();
    expect(alert).toHaveBeenCalledTimes(1);
    // Due eventi IDENTICI, nessun URL diverso o null nel mezzo.
    await emit(url);
    expect(alert).toHaveBeenCalledTimes(2);
    expect(alert).toHaveBeenLastCalledWith(...firstAlert);
    expect(nav.navigate).not.toHaveBeenCalled();
  });
});

const recoveryUrl = 'rahitalia://reset-password?code=valid';
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => {
    resolve = done;
  });
  return { promise, resolve };
};

describe.each([
  'initial prima',
  'evento prima',
  'initial già completato',
] as const)('%s', order => {
  it('stesso URL da getInitialURL ed evento → un solo scambio', async () => {
    const initial = deferred<string | null>();
    const exchange = deferred<{ ok: boolean }>();
    mockGetInitialURL.mockReturnValue(initial.promise);
    mockRecovery.mockReturnValue(exchange.promise);
    const { nav } = await mount();
    if (order === 'evento prima') await emit(recoveryUrl);
    await act(async () => {
      initial.resolve(recoveryUrl);
      await initial.promise;
    });
    if (order === 'initial già completato') {
      await act(async () => {
        exchange.resolve({ ok: true });
        await exchange.promise;
      });
    }
    if (order !== 'evento prima') await emit(recoveryUrl);
    expect(mockRecovery).toHaveBeenCalledTimes(1);
    expect(mockRecovery).toHaveBeenCalledWith(recoveryUrl);
    await act(async () => {
      exchange.resolve({ ok: true });
      await exchange.promise;
    });
    expect(nav.navigate).toHaveBeenCalledTimes(1);
  });
});

it('link di recupero riuscito riaperto: nessun secondo scambio', async () => {
  const { nav } = await mount();
  await emit(recoveryUrl);
  expect(mockRecovery).toHaveBeenCalledTimes(1);
  await emit(recoveryUrl);
  expect(mockRecovery).toHaveBeenCalledTimes(1);
  expect(nav.navigate).toHaveBeenCalledTimes(1);
  // La protezione resta valida anche dopo un altro link, non solo consecutivamente.
  await emit('rahitalia://reset-password?code=another');
  await emit(recoveryUrl);
  expect(mockRecovery).toHaveBeenCalledTimes(2);
  expect(nav.navigate).toHaveBeenCalledTimes(2);
  expect(alert).not.toHaveBeenCalled();
});

it('eventi identici durante lo scambio: uno scambio, poi il fallimento riavvisa', async () => {
  const exchange = deferred<{ ok: boolean }>();
  mockRecovery.mockReturnValue(exchange.promise);
  await mount();
  await emit(recoveryUrl);
  await emit(recoveryUrl);
  expect(mockRecovery).toHaveBeenCalledTimes(1);
  await act(async () => {
    exchange.resolve({ ok: false });
    await exchange.promise;
  });
  expect(alert).toHaveBeenCalledTimes(1);
  await emit(recoveryUrl);
  expect(alert).toHaveBeenCalledTimes(2);
  expect(mockRecovery).toHaveBeenCalledTimes(1);
});

it('initial URL tardivo non scavalca il link più recente', async () => {
  const initial = deferred<string | null>();
  mockGetInitialURL.mockReturnValue(initial.promise);
  const { nav } = await mount();
  await emit(recoveryUrl);
  await act(async () => {
    initial.resolve('rahitalia://reset-password?code=old');
    await initial.promise;
  });
  expect(mockRecovery).toHaveBeenCalledTimes(1);
  expect(mockRecovery).toHaveBeenCalledWith(recoveryUrl);
  expect(nav.navigate).toHaveBeenCalledTimes(1);
});

it('smontaggio rimuove il listener e ignora URL iniziale ed esiti tardivi', async () => {
  const initial = deferred<string | null>();
  const exchange = deferred<{ ok: boolean }>();
  mockGetInitialURL.mockReturnValue(initial.promise);
  mockRecovery.mockReturnValue(exchange.promise);
  const { nav, unmount } = await mount();
  await emit(recoveryUrl);
  expect(mockListeners.size).toBeGreaterThan(0);
  unmount();
  expect(mockListeners.size).toBe(0);
  await act(async () => {
    initial.resolve(recoveryUrl);
    exchange.resolve({ ok: false });
    await Promise.all([initial.promise, exchange.promise]);
  });
  expect(alert).not.toHaveBeenCalled();
  expect(nav.navigate).not.toHaveBeenCalled();
  expect(mockRecovery).toHaveBeenCalledTimes(1);
});

it('un link diverso invalida lo scambio precedente ancora in corso', async () => {
  const exchange = deferred<{ ok: boolean }>();
  mockRecovery.mockReturnValueOnce(exchange.promise);
  const { nav } = await mount();
  await emit(recoveryUrl);
  await emit('rahitalia://confirm-email?code=next');
  expect(alert).toHaveBeenCalledWith(
    'Email confermata',
    'La tua email è stata confermata.'
  );
  await act(async () => {
    exchange.resolve({ ok: true });
    await exchange.promise;
  });
  expect(nav.navigate).not.toHaveBeenCalled();
});

it('getInitialURL rifiutato: gli eventi successivi restano ascoltati', async () => {
  mockGetInitialURL.mockRejectedValue(new Error('unavailable'));
  const { nav } = await mount();
  await emit(recoveryUrl);
  expect(mockRecovery).toHaveBeenCalledWith(recoveryUrl);
  expect(nav.navigate).toHaveBeenCalledTimes(1);
});
