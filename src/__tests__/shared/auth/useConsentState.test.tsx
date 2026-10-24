import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useConsentState } from '@/shared/auth/useConsentState';
import { CURRENT_POLICY_VERSION } from '@/shared/auth/consent';
import type { ConsentEvent } from '@/shared/auth/types';

jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { is_material: true },
        error: null,
      }),
    })),
  },
}));

type Args = Parameters<typeof useConsentState>[0];

const consentA: ConsentEvent[] = [
  {
    id: 'consent-a',
    user_id: 'A',
    purpose: 'privacy_notice',
    action: 'granted',
    policy_version: CURRENT_POLICY_VERSION,
    legal_basis: 'consent',
    channel: 'app',
    created_at: '2026-10-24T10:00:00Z',
  },
];

const deferredHistory = () => {
  let resolve!: (history: ConsentEvent[] | null) => void;
  const promise = new Promise<ConsentEvent[] | null>(done => {
    resolve = done;
  });
  return { promise, resolve };
};

async function checkStaleResponse(manual: boolean, logout: boolean) {
  const pending = deferredHistory();
  const historyA = jest.fn<ReturnType<Args['getConsentHistory']>, []>();
  if (manual) historyA.mockResolvedValueOnce([]);
  historyA.mockReturnValueOnce(pending.promise);
  const { result, rerender, unmount } = renderHook(
    (props: Args) => useConsentState(props),
    {
      initialProps: {
        status: 'authenticated',
        userId: 'A',
        getConsentHistory: historyA,
      } as Args,
    }
  );
  let refresh: ReturnType<typeof result.current.refreshConsent> | undefined;
  if (manual) {
    await waitFor(() => expect(result.current.consentState).toBe('needed'));
    act(() => {
      refresh = result.current.refreshConsent();
    });
  }
  expect(historyA).toHaveBeenCalledTimes(manual ? 2 : 1);
  const historyB = jest.fn().mockResolvedValue([]);
  rerender({
    status: logout ? 'unauthenticated' : 'authenticated',
    userId: logout ? null : 'B',
    getConsentHistory: historyB,
  });
  const expected = logout ? 'unknown' : 'needed';
  await waitFor(() => expect(result.current.consentState).toBe(expected));
  expect(historyB).toHaveBeenCalledTimes(logout ? 0 : 1);
  await act(async () => {
    pending.resolve(consentA);
    await pending.promise;
    if (refresh) await refresh;
  });
  expect(result.current.consentState).toBe(expected);
  expect(result.current.needsReConsent).toBe(!logout);
  // Anche chi attende il refresh deve ricevere un esito non utilizzabile per B.
  if (refresh) await expect(refresh).resolves.toBe('unknown');
  unmount();
}

it('consensi: risposta del vecchio account scartata', async () => {
  await checkStaleResponse(true, false);
  await checkStaleResponse(true, true);
  await checkStaleResponse(false, false);
  await checkStaleResponse(false, true);
});

it.each([false, true])(
  'consensi: lettura automatica scartata dopo uscita=%s',
  logout => checkStaleResponse(false, logout)
);

it('consensi: refresh manuale scartato dopo uscita', async () => {
  await checkStaleResponse(true, true);
});

it('consensi: refresh dello stesso account applicato', async () => {
  const history = jest
    .fn()
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce(consentA);
  const { result } = renderHook(() =>
    useConsentState({
      status: 'authenticated',
      userId: 'A',
      getConsentHistory: history,
    })
  );
  await waitFor(() => expect(result.current.consentState).toBe('needed'));
  await act(async () => {
    await expect(result.current.refreshConsent()).resolves.toBe('ok');
  });
  expect(result.current.consentState).toBe('ok');
});

it('consensi: refresh scartato anche tornando allo stesso account', async () => {
  const pending = deferredHistory();
  const history = jest
    .fn()
    .mockResolvedValueOnce([])
    .mockReturnValueOnce(pending.promise);
  const { result, rerender } = renderHook(
    (props: Args) => useConsentState(props),
    {
      initialProps: {
        status: 'authenticated',
        userId: 'A',
        getConsentHistory: history,
      } as Args,
    }
  );
  await waitFor(() => expect(result.current.consentState).toBe('needed'));
  let refresh!: ReturnType<typeof result.current.refreshConsent>;
  act(() => {
    refresh = result.current.refreshConsent();
  });
  const historyNew = jest.fn().mockResolvedValue([]);
  rerender({
    status: 'authenticated',
    userId: 'B',
    getConsentHistory: historyNew,
  });
  await waitFor(() => expect(result.current.consentState).toBe('needed'));
  rerender({
    status: 'authenticated',
    userId: 'A',
    getConsentHistory: historyNew,
  });
  await waitFor(() => expect(result.current.consentState).toBe('needed'));
  await act(async () => {
    pending.resolve(consentA);
    await refresh;
  });
  expect(result.current.consentState).toBe('needed');
  await expect(refresh).resolves.toBe('unknown');
});

it('consensi: refresh in volo scartato allo smontaggio', async () => {
  const pending = deferredHistory();
  const history = jest
    .fn()
    .mockResolvedValueOnce([])
    .mockReturnValueOnce(pending.promise);
  const { result, unmount } = renderHook(() =>
    useConsentState({
      status: 'authenticated',
      userId: 'A',
      getConsentHistory: history,
    })
  );
  await waitFor(() => expect(result.current.consentState).toBe('needed'));
  const refresh = result.current.refreshConsent();
  unmount();
  pending.resolve(consentA);
  await expect(refresh).resolves.toBe('unknown');
});

it('consensi: nuova callback dello stesso account non azzera il consenso', async () => {
  const history = jest.fn().mockResolvedValue(consentA);
  const { result, rerender } = renderHook(
    (props: Args) => useConsentState(props),
    {
      initialProps: {
        status: 'authenticated',
        userId: 'A',
        getConsentHistory: history,
      } as Args,
    }
  );
  await waitFor(() => expect(result.current.consentState).toBe('ok'));
  const historyNew = jest.fn().mockResolvedValue([]);
  rerender({
    status: 'authenticated',
    userId: 'A',
    getConsentHistory: historyNew,
  });
  expect(result.current.consentState).toBe('ok');
  expect(historyNew).not.toHaveBeenCalled();
  await act(async () => {
    await expect(result.current.refreshConsent()).resolves.toBe('needed');
  });
  expect(result.current.needsReConsent).toBe(true);
});
