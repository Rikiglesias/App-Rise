import { renderHook, waitFor } from '@testing-library/react-native';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';

import type { RootStackParamList } from '@/navigation/types';
import { useAuthDeepLink } from '@/shared/auth/useAuthDeepLink';

// URL deep link iniettato da expo-linking (controllato per-test).
let mockUrl: string | null = null;
jest.mock('expo-linking', () => ({
  useURL: () => mockUrl,
}));

// AuthContext mockato: il flusso di setSession è coperto da authRecovery.test;
// qui isoliamo l'orchestrazione dell'hook (detection URL -> handler + nav).
const mockCompleteRecovery = jest.fn();
const mockCompleteEmailConfirm = jest.fn();
jest.mock('@/shared/auth/AuthContext', () => ({
  useAuth: () => ({
    completeRecoveryFromUrl: mockCompleteRecovery,
    completeEmailConfirmFromUrl: mockCompleteEmailConfirm,
  }),
}));

const RECOVERY_URL =
  'rahitalia://reset-password#access_token=AAA&refresh_token=BBB&type=recovery';
const CONFIRM_URL =
  'rahitalia://confirm-email#access_token=AAA&refresh_token=BBB&type=signup';

interface MockNavRef {
  ref: NavigationContainerRefWithCurrent<RootStackParamList>;
  navigate: jest.Mock;
  isReady: jest.Mock;
}

const makeNavRef = (ready = true): MockNavRef => {
  const navigate = jest.fn();
  const isReady = jest.fn(() => ready);
  const ref = {
    navigate,
    isReady,
  } as unknown as NavigationContainerRefWithCurrent<RootStackParamList>;
  return { ref, navigate, isReady };
};

describe('useAuthDeepLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUrl = null;
    mockCompleteRecovery.mockResolvedValue({ ok: true });
    mockCompleteEmailConfirm.mockResolvedValue({ ok: true });
  });

  it('senza URL non processa nulla', () => {
    const nav = makeNavRef();
    renderHook(() => useAuthDeepLink(nav.ref));
    expect(mockCompleteRecovery).not.toHaveBeenCalled();
    expect(mockCompleteEmailConfirm).not.toHaveBeenCalled();
  });

  it('URL di recovery: chiama completeRecoveryFromUrl e naviga a ResetPassword', async () => {
    mockUrl = RECOVERY_URL;
    const nav = makeNavRef(true);
    renderHook(() => useAuthDeepLink(nav.ref));

    expect(mockCompleteRecovery).toHaveBeenCalledWith(RECOVERY_URL);
    await waitFor(() =>
      expect(nav.navigate).toHaveBeenCalledWith('ResetPassword')
    );
    expect(mockCompleteEmailConfirm).not.toHaveBeenCalled();
  });

  it('recovery con ok:false: nessuna navigazione', async () => {
    mockUrl = RECOVERY_URL;
    mockCompleteRecovery.mockResolvedValueOnce({ ok: false });
    const nav = makeNavRef(true);
    renderHook(() => useAuthDeepLink(nav.ref));

    await waitFor(() => expect(mockCompleteRecovery).toHaveBeenCalled());
    expect(nav.navigate).not.toHaveBeenCalled();
  });

  it('recovery con navigationRef non pronto: nessuna navigazione', async () => {
    mockUrl = RECOVERY_URL;
    const nav = makeNavRef(false);
    renderHook(() => useAuthDeepLink(nav.ref));

    await waitFor(() => expect(mockCompleteRecovery).toHaveBeenCalled());
    expect(nav.navigate).not.toHaveBeenCalled();
  });

  it('URL di conferma email: chiama completeEmailConfirmFromUrl senza navigare', async () => {
    mockUrl = CONFIRM_URL;
    const nav = makeNavRef(true);
    renderHook(() => useAuthDeepLink(nav.ref));

    expect(mockCompleteEmailConfirm).toHaveBeenCalledWith(CONFIRM_URL);
    await waitFor(() => expect(mockCompleteEmailConfirm).toHaveBeenCalled());
    expect(nav.navigate).not.toHaveBeenCalled();
    expect(mockCompleteRecovery).not.toHaveBeenCalled();
  });

  it('URL non-auth: nessun handler invocato', () => {
    mockUrl = 'rahitalia://home';
    const nav = makeNavRef(true);
    renderHook(() => useAuthDeepLink(nav.ref));

    expect(mockCompleteRecovery).not.toHaveBeenCalled();
    expect(mockCompleteEmailConfirm).not.toHaveBeenCalled();
  });

  it('guard handled: stesso URL non ri-processato anche se cambia navigationRef', async () => {
    mockUrl = RECOVERY_URL;
    const nav1 = makeNavRef(true);
    const { rerender } = renderHook<
      void,
      { ref: NavigationContainerRefWithCurrent<RootStackParamList> }
    >(({ ref }) => useAuthDeepLink(ref), {
      initialProps: { ref: nav1.ref },
    });

    await waitFor(() => expect(mockCompleteRecovery).toHaveBeenCalledTimes(1));

    // Cambia la dep navigationRef → l'effect rifire, ma il guard `handled`
    // sullo stesso URL deve impedire il doppio processamento.
    const nav2 = makeNavRef(true);
    rerender({ ref: nav2.ref });

    expect(mockCompleteRecovery).toHaveBeenCalledTimes(1);
  });
});
