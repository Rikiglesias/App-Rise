import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';
import type { Session } from '@supabase/supabase-js';

import { AuthProvider, useAuth } from '@/shared/auth/AuthContext';
import { useAuthDeepLink } from '@/shared/auth/useAuthDeepLink';
import { supabase } from '@/shared/auth/supabaseClient';
import type { RootStackParamList } from '@/navigation/types';
import { changeLanguage, getCurrentLocale } from '@/locales';

let mockUrl: string | null = null;
const mockUrlListeners = new Set<(event: { url: string }) => void>();
let mockAuthEvent: ((event: string, session: Session) => void) | undefined;
const mockSession = { user: { id: 'b1-user', email: 'new@example.org' } };
jest.mock('expo-linking', () => ({
  createURL: (path: string) => `rahitalia://${path}`,
  getInitialURL: jest.fn(() => Promise.resolve(mockUrl)),
  addEventListener: jest.fn(
    (_type: string, listener: (event: { url: string }) => void) => {
      mockUrlListeners.add(listener);
      return { remove: () => mockUrlListeners.delete(listener) };
    }
  ),
}));
jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(cb => {
        mockAuthEvent = cb;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
      exchangeCodeForSession: jest.fn(),
      setSession: jest.fn().mockResolvedValue({ error: null }),
      updateUser: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

const exchange = supabase.auth.exchangeCodeForSession as jest.Mock;
const makeNavigation = (ready = true) => {
  const listeners = new Map<string, () => void>();
  const navigate = jest.fn();
  const isReady = jest.fn(() => ready);
  const addListener = jest.fn((event: string, listener: () => void) => {
    listeners.set(event, listener);
    return () => listeners.delete(event);
  });
  return {
    ref: {
      navigate,
      isReady,
      addListener,
    } as unknown as NavigationContainerRefWithCurrent<RootStackParamList>,
    navigate,
    isReady,
    listeners,
  };
};
const emitUrl = async (url: string) => {
  await act(async () => {
    mockUrlListeners.forEach(listener => listener({ url }));
    await Promise.resolve();
  });
};
const mount = async (nav = makeNavigation()) => {
  const hook = renderHook(
    () => {
      useAuthDeepLink(nav.ref);
      return useAuth();
    },
    { wrapper: AuthProvider }
  );
  await act(() => Promise.resolve());
  return { ...hook, nav };
};

describe('Link auth B1', () => {
  let alert: jest.SpyInstance;
  let previousLocale: ReturnType<typeof getCurrentLocale>;
  beforeEach(() => {
    jest.clearAllMocks();
    mockUrl = null;
    mockUrlListeners.clear();
    mockAuthEvent = undefined;
    previousLocale = getCurrentLocale();
    changeLanguage('it');
    alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    // Come l'SDK reale, risponde dopo l'inizializzazione e la sottoscrizione auth.
    exchange.mockImplementation(() =>
      Promise.resolve().then(() => {
        mockAuthEvent?.('SIGNED_IN', mockSession as Session);
        return { data: { session: mockSession }, error: null };
      })
    );
  });
  afterEach(() => {
    alert.mockRestore();
    changeLanguage(previousLocale);
  });

  // C34: hook e provider reali; il mock rappresenta solo la risposta del server.
  it('PKCE: il link con code apre la sessione', async () => {
    mockUrl = 'rahitalia://reset-password?code=codice-valido';
    const { result, nav } = await mount();
    await waitFor(() => expect(result.current.status).toBe('authenticated'));
    expect(exchange).toHaveBeenCalledWith('codice-valido');
    expect(nav.navigate).toHaveBeenCalledWith('ResetPassword', undefined, {
      pop: true,
    });
    expect(supabase.auth.setSession).not.toHaveBeenCalled();
  });

  // C34: include il controllo positivo nello stesso test di assenza.
  it('PKCE: il link con token nel fragment non apre sessioni', async () => {
    mockUrl =
      'rahitalia://reset-password#type=recovery&access_token=A&refresh_token=B';
    const { result, nav } = await mount();
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'));
    expect(supabase.auth.setSession).not.toHaveBeenCalled();
    expect(exchange).not.toHaveBeenCalled();
    expect(nav.navigate).not.toHaveBeenCalled();
    mockUrl = 'rahitalia://reset-password?code=positivo';
    await emitUrl(mockUrl);
    await waitFor(() => expect(result.current.status).toBe('authenticated'));
    expect(exchange).toHaveBeenCalledWith('positivo');
  });

  // C26: error_code in query e fragment, senza tentare lo scambio.
  it('link di accesso fallito: recupero con errore chiede un nuovo link', async () => {
    mockUrl = 'rahitalia://reset-password?error_code=otp_expired';
    await mount();
    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith(
        'Link scaduto',
        expect.stringContaining('Chiedine uno nuovo')
      )
    );
    expect(exchange).not.toHaveBeenCalled();
    mockUrl = 'rahitalia://reset-password#error_code=otp_expired';
    await emitUrl(mockUrl);
    await waitFor(() => expect(alert).toHaveBeenCalledTimes(2));
    expect(alert).toHaveBeenNthCalledWith(
      2,
      'Link scaduto',
      expect.stringContaining('Chiedine uno nuovo')
    );
    expect(exchange).not.toHaveBeenCalled();
    mockUrl = 'rahitalia://reset-password?code=positivo';
    await emitUrl(mockUrl);
    await waitFor(() => expect(exchange).toHaveBeenCalledWith('positivo'));
  });

  it('link di accesso fallito: conferma con scambio fallito dice email confermata, accedi', async () => {
    exchange.mockResolvedValueOnce({
      data: { session: null },
      error: { code: 'bad_code_verifier' },
    });
    mockUrl = 'rahitalia://confirm-email?code=confermata';
    const { result } = await mount();
    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith(
        'Email confermata',
        expect.stringContaining('Accedi')
      )
    );
    expect(exchange).toHaveBeenCalledWith('confermata');
    expect(result.current.status).toBe('unauthenticated');
  });

  it('link di accesso fallito: verificatore assente dopo un secondo invio', async () => {
    exchange.mockResolvedValueOnce({
      data: { session: null },
      error: { code: 'pkce_code_verifier_not_found' },
    });
    mockUrl = 'rahitalia://reset-password?code=primo-invio';
    const { nav } = await mount();
    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith(
        'Link di accesso non riuscito',
        expect.stringContaining('nuovo link')
      )
    );
    expect(exchange).toHaveBeenCalledWith('primo-invio');
    expect(nav.navigate).not.toHaveBeenCalled();
    mockUrl = 'rahitalia://reset-password?code=nuovo-invio';
    await emitUrl(mockUrl);
    await waitFor(() =>
      expect(nav.navigate).toHaveBeenCalledWith('ResetPassword', undefined, {
        pop: true,
      })
    );
  });

  it('link di accesso: avvio a freddo apre Reimposta password quando la navigazione è pronta', async () => {
    mockUrl = 'rahitalia://reset-password?code=avvio';
    const nav = makeNavigation(false);
    const { result, unmount } = await mount(nav);
    await waitFor(() => expect(result.current.status).toBe('authenticated'));
    expect(nav.navigate).not.toHaveBeenCalled();
    nav.isReady.mockReturnValue(true);
    act(() => nav.listeners.get('ready')?.());
    expect(nav.navigate).toHaveBeenCalledWith('ResetPassword', undefined, {
      pop: true,
    });
    act(() => nav.listeners.get('state')?.());
    expect(nav.navigate).toHaveBeenCalledTimes(1);
    unmount();
    expect(nav.listeners.size).toBe(0);
  });

  it('link di accesso: conferma riuscita mostra un messaggio', async () => {
    mockUrl = 'rahitalia://confirm-email?code=conferma';
    const { nav } = await mount();
    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith(
        'Email confermata',
        'La tua email è stata confermata.'
      )
    );
    expect(exchange).toHaveBeenCalledWith('conferma');
    expect(nav.navigate).not.toHaveBeenCalled();
  });

  it("cambio email: redirect all'app", async () => {
    const { result } = await mount();
    await act(async () => {
      await result.current.updateEmail('new@example.org');
    });
    expect(supabase.auth.updateUser).toHaveBeenCalledWith(
      { email: 'new@example.org' },
      { emailRedirectTo: 'rahitalia://confirm-email-change' }
    );
  });

  // PKCE non garantisce type nel redirect: il percorso distingue il cambio email.
  it('cambio email: conferma mostra email aggiornata', async () => {
    mockUrl = 'rahitalia://confirm-email-change?code=cambio';
    await mount();
    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith(
        'Email aggiornata',
        'Il tuo indirizzo email è stato aggiornato.'
      )
    );
    expect(exchange).toHaveBeenCalledWith('cambio');
    alert.mockClear();
    mockUrl = 'rahitalia://confirm-email?code=cambio-tipo&type=email_change';
    await emitUrl(mockUrl);
    await waitFor(() => expect(exchange).toHaveBeenCalledWith('cambio-tipo'));
    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith(
        'Email aggiornata',
        'Il tuo indirizzo email è stato aggiornato.'
      )
    );
  });
});
