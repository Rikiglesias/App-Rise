import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import { useAuthDeepLink } from '@/shared/auth/useAuthDeepLink';
import { changeLanguage, getCurrentLocale } from '@/locales';

let mockUrl: string | null;
const mockUrlListeners = new Set<(event: { url: string }) => void>();
const mockComplete = jest.fn();
jest.mock('expo-linking', () => ({
  getInitialURL: jest.fn(() => Promise.resolve(mockUrl)),
  addEventListener: jest.fn(
    (_type: string, listener: (event: { url: string }) => void) => {
      mockUrlListeners.add(listener);
      return { remove: () => mockUrlListeners.delete(listener) };
    }
  ),
  createURL: (path: string) => `rahitalia://${path}`,
}));
jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: () => ({
    completeRecoveryFromUrl: mockComplete,
    completeEmailConfirmFromUrl: mockComplete,
  }),
}));

const emitUrl = async (url: string) => {
  await act(async () => {
    mockUrlListeners.forEach(listener => listener({ url }));
    await Promise.resolve();
  });
};
const mount = async (ready = true) => {
  const listeners = new Map<string, () => void>();
  const nav = {
    isReady: jest.fn(() => ready),
    navigate: jest.fn(),
    addListener: (event: string, callback: () => void) => {
      listeners.set(event, callback);
      return () => listeners.delete(event);
    },
  };
  const hook = renderHook(() =>
    useAuthDeepLink(
      nav as unknown as NavigationContainerRefWithCurrent<RootStackParamList>
    )
  );
  await act(() => Promise.resolve());
  return { ...hook, nav, listeners };
};
let alert: jest.SpyInstance;
let locale: ReturnType<typeof getCurrentLocale>;
beforeEach(() => {
  mockUrl = 'rahitalia://reset-password?code=first';
  mockUrlListeners.clear();
  mockComplete.mockReset().mockResolvedValue({ ok: true });
  locale = getCurrentLocale();
  changeLanguage('en');
  alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(() => {
  alert.mockRestore();
  changeLanguage(locale);
});

it('link PKCE: lo stato pronto consegna una sola navigazione e rimuove i listener', async () => {
  const { nav, listeners, unmount } = await mount(false);
  await act(() => Promise.resolve());
  expect(nav.navigate).not.toHaveBeenCalled();
  nav.isReady.mockReturnValue(true);
  act(() => listeners.get('state')?.());
  expect(nav.navigate).toHaveBeenCalledWith('ResetPassword', undefined, {
    pop: true,
  });
  act(() => listeners.get('ready')?.());
  expect(nav.navigate).toHaveBeenCalledTimes(1);
  unmount();
  expect(listeners.size).toBe(0);
});

it('link PKCE: un nuovo link invalida il recupero precedente ancora in volo', async () => {
  let resolve: (value: { ok: boolean }) => void = () => undefined;
  mockComplete.mockReturnValueOnce(
    new Promise<{ ok: boolean }>(done => {
      resolve = done;
    })
  );
  const { nav } = await mount();
  mockUrl = 'rahitalia://confirm-email?code=second';
  await emitUrl(mockUrl);
  await waitFor(() =>
    expect(alert).toHaveBeenCalledWith(
      'Email confirmed',
      'Your email has been confirmed.'
    )
  );
  await act(async () => {
    resolve({ ok: true });
    await Promise.resolve();
  });
  expect(nav.navigate).not.toHaveBeenCalled();
  mockUrl = 'rahitalia://reset-password?code=third';
  await emitUrl(mockUrl);
  await waitFor(() =>
    expect(nav.navigate).toHaveBeenCalledWith('ResetPassword', undefined, {
      pop: true,
    })
  );
});

it('link PKCE: dopo unmount non mostra esiti tardivi', async () => {
  let resolve: (value: { ok: boolean }) => void = () => undefined;
  const positive = await mount();
  await waitFor(() => expect(positive.nav.navigate).toHaveBeenCalledTimes(1));
  positive.unmount();
  mockComplete.mockReturnValueOnce(
    new Promise<{ ok: boolean }>(done => {
      resolve = done;
    })
  );
  const pending = await mount();
  pending.unmount();
  await act(async () => {
    resolve({ ok: false });
    await Promise.resolve();
  });
  expect(alert).not.toHaveBeenCalled();
  expect(pending.nav.navigate).not.toHaveBeenCalled();
});

it('link PKCE: eccezioni e cambio email fallito hanno testi inglesi azionabili', async () => {
  mockComplete.mockRejectedValueOnce(new Error('offline'));
  const { nav } = await mount();
  await waitFor(() =>
    expect(alert).toHaveBeenCalledWith(
      'Sign-in link failed',
      expect.stringContaining('Request a new link')
    )
  );
  expect(nav.navigate).not.toHaveBeenCalled();
  mockComplete.mockResolvedValueOnce({ ok: false });
  mockUrl = 'rahitalia://confirm-email-change?code=confirmed';
  await emitUrl(mockUrl);
  await waitFor(() =>
    expect(alert).toHaveBeenCalledWith(
      'Email updated',
      expect.stringContaining('Sign in with your new address')
    )
  );
  mockUrl = 'rahitalia://reset-password?code=positive';
  await emitUrl(mockUrl);
  await waitFor(() =>
    expect(nav.navigate).toHaveBeenCalledWith('ResetPassword', undefined, {
      pop: true,
    })
  );
});
