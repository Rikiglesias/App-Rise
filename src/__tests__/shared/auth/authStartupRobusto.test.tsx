import React from 'react';
import { Alert, Text } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

import { AuthProvider, useAuth } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';
import { authStorage } from '@/shared/auth/authStorage';
import i18n from '@/locales';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
}));

const Capture: React.FC = () => {
  const { status, session } = useAuth();
  return <Text>{`${status}:${session?.user.id ?? 'none'}`}</Text>;
};

const renderAuth = () =>
  render(
    <AuthProvider>
      <Capture />
    </AuthProvider>
  );

type SessionResult = { data: { session: Session | null }; error: null };
const sessionResult: SessionResult = { data: { session: null }, error: null };
type AuthListener = (event: AuthChangeEvent, session: Session | null) => void;

describe('accesso robusto:', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    }));
  });

  afterEach(() => jest.restoreAllMocks());

  // Termina il caricamento e mostra un messaggio tradotto.
  it('avvio con sessione illeggibile', async () => {
    const alert = jest
      .spyOn(Alert, 'alert')
      .mockImplementation(() => undefined);
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(
      new Error('Keychain locked')
    );
    (supabase.auth.getSession as jest.Mock).mockImplementationOnce(async () => {
      await authStorage.getItem('test-session');
      return sessionResult;
    });

    const ui = renderAuth();

    expect(await ui.findByText('unauthenticated:none')).toBeTruthy();
    expect(alert).toHaveBeenCalledWith(
      i18n.t('auth.login.title'),
      i18n.t('auth.errors.session_unreadable')
    );
    alert.mockRestore();
  });

  it.each(['reject', 'resolve'] as const)(
    'avvio tardivo %s non sovrascrive un evento auth più recente',
    async outcome => {
      let resolve!: (value: SessionResult) => void;
      let reject!: (reason: Error) => void;
      const pending = new Promise<SessionResult>((yes, no) => {
        resolve = yes;
        reject = no;
      });
      (supabase.auth.getSession as jest.Mock).mockReturnValueOnce(pending);
      const alert = jest
        .spyOn(Alert, 'alert')
        .mockImplementation(() => undefined);
      const ui = renderAuth();
      const callback = (supabase.auth.onAuthStateChange as jest.Mock).mock
        .calls[0][0] as AuthListener;

      act(() => callback('SIGNED_OUT', null));
      await act(async () => {
        if (outcome === 'reject') reject(new Error('Keychain locked'));
        else
          resolve({
            data: { session: { user: { id: 'old' } } as Session },
            error: null,
          });
        await pending.catch(() => undefined);
      });

      expect(ui.getByText('unauthenticated:none')).toBeTruthy();
      expect(alert).not.toHaveBeenCalled();
      alert.mockRestore();
    }
  );

  it('avvio con INITIAL_SESSION vuota non nasconde il fallimento della lettura', async () => {
    let reject!: (reason: Error) => void;
    const pending = new Promise<SessionResult>((_yes, no) => {
      reject = no;
    });
    (supabase.auth.getSession as jest.Mock).mockReturnValueOnce(pending);
    const alert = jest
      .spyOn(Alert, 'alert')
      .mockImplementation(() => undefined);
    const ui = renderAuth();
    const callback = (supabase.auth.onAuthStateChange as jest.Mock).mock
      .calls[0][0] as AuthListener;

    act(() => callback('INITIAL_SESSION', null));
    await act(async () => {
      reject(new Error('Keychain locked'));
      await pending.catch(() => undefined);
    });

    expect(ui.getByText('unauthenticated:none')).toBeTruthy();
    expect(alert).toHaveBeenCalledWith(
      i18n.t('auth.login.title'),
      i18n.t('auth.errors.session_unreadable')
    );
  });

  it('ignora il completamento della sessione dopo unmount e rimuove la sottoscrizione', async () => {
    let reject!: (reason: Error) => void;
    const pending = new Promise<SessionResult>((_yes, no) => {
      reject = no;
    });
    (supabase.auth.getSession as jest.Mock).mockReturnValueOnce(pending);
    const alert = jest
      .spyOn(Alert, 'alert')
      .mockImplementation(() => undefined);
    const ui = renderAuth();
    const registration = (supabase.auth.onAuthStateChange as jest.Mock).mock
      .results[0];
    if (!registration) throw new Error('Sottoscrizione auth non registrata');
    const subscription = registration.value.data.subscription;

    ui.unmount();
    await act(async () => {
      reject(new Error('Keychain locked'));
      await pending.catch(() => undefined);
    });

    await waitFor(() =>
      expect(subscription.unsubscribe).toHaveBeenCalledTimes(1)
    );
    expect(alert).not.toHaveBeenCalled();
    alert.mockRestore();
  });
});
