import { renderHook, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';

import type { RootStackParamList } from '@/navigation/types';
import { useAuthDeepLink } from '@/shared/auth/useAuthDeepLink';
import { changeLanguage, getCurrentLocale } from '@/locales';

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

  // Link dell'email aperto dopo la scadenza (o già usato): Supabase rientra con
  // `error_code` nel fragment al posto dei token. Prima nessun ramo combaciava e la
  // persona vedeva l'app aprirsi senza spiegazioni.
  describe('link scaduto', () => {
    const EXPIRED_RESET_URL =
      'rahitalia://reset-password#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired';
    const EXPIRED_CONFIRM_URL =
      'rahitalia://confirm-email#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired';
    let alertSpy: jest.SpyInstance;
    let localeBefore: ReturnType<typeof getCurrentLocale>;

    beforeEach(() => {
      localeBefore = getCurrentLocale();
      alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
      changeLanguage(localeBefore);
      alertSpy.mockRestore();
    });

    it('link scaduto (it): reset password mostra il messaggio tradotto con l’invito a chiederne uno nuovo', () => {
      changeLanguage('it');
      mockUrl = EXPIRED_RESET_URL;
      const nav = makeNavRef(true);
      renderHook(() => useAuthDeepLink(nav.ref));

      expect(alertSpy).toHaveBeenCalledTimes(1);
      const [title, message] = alertSpy.mock.calls[0];
      expect(title).toBe('Link scaduto');
      expect(message).toContain('Password dimenticata?');
      expect(mockCompleteRecovery).not.toHaveBeenCalled();
      expect(nav.navigate).not.toHaveBeenCalled();
    });

    it('link scaduto (en): reset password mostra il messaggio inglese', () => {
      changeLanguage('en');
      mockUrl = EXPIRED_RESET_URL;
      const nav = makeNavRef(true);
      renderHook(() => useAuthDeepLink(nav.ref));

      expect(alertSpy).toHaveBeenCalledTimes(1);
      const [title, message] = alertSpy.mock.calls[0];
      expect(title).toBe('Link expired');
      expect(message).toContain('Forgot password?');
    });

    it('link scaduto (it): conferma email mostra il messaggio di conferma, non quello del reset', () => {
      changeLanguage('it');
      mockUrl = EXPIRED_CONFIRM_URL;
      const nav = makeNavRef(true);
      renderHook(() => useAuthDeepLink(nav.ref));

      expect(alertSpy).toHaveBeenCalledTimes(1);
      const [, message] = alertSpy.mock.calls[0];
      expect(message).toContain('conferma');
      expect(message).not.toContain('Password dimenticata?');
      expect(mockCompleteEmailConfirm).not.toHaveBeenCalled();
    });

    it('link scaduto: URL troncato al primo & (senza error_code) non mostra l’avviso', () => {
      // È ciò che arriverebbe se la shell spezzasse l'URL sul primo «&»: l'avviso a schermo
      // sul dispositivo (C8 del goal android-play) prova quindi che il fragment è arrivato intero.
      mockUrl = 'rahitalia://reset-password#error=access_denied';
      const nav = makeNavRef(true);
      renderHook(() => useAuthDeepLink(nav.ref));

      expect(alertSpy).not.toHaveBeenCalled();
      expect(mockCompleteRecovery).not.toHaveBeenCalled();
    });

    it('link scaduto: lo stesso URL non ripete l’avviso a ogni render', () => {
      mockUrl = EXPIRED_RESET_URL;
      const nav = makeNavRef(true);
      const { rerender } = renderHook(() => useAuthDeepLink(nav.ref));
      rerender({});

      expect(alertSpy).toHaveBeenCalledTimes(1);
    });
  });
});
