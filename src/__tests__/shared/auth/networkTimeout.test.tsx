import React from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
} from '@testing-library/react-native';
import { Linking } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';

import { AllProviders } from '../../helpers/testProviders';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import * as Auth from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';
import { usePartnerExit } from '@/shared/partner/usePartnerExit';
import i18n from '@/locales';

// Client, auth e query reali; solo il trasporto non risponde. Nessun server vero.
jest.unmock('@/shared/auth/supabaseClient');
jest.mock('@supabase/supabase-js', () => {
  const actual = jest.requireActual('@supabase/supabase-js');
  return { ...actual, createClient: jest.fn(actual.createClient) };
});
jest.mock('@/shared/auth/authStorage', () => ({
  authStorage: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('@/shared/config/environment', () => ({
  env: {
    SUPABASE_URL: 'https://example.invalid',
    SUPABASE_ANON_KEY: 'test-key',
  },
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

const originalFetch = global.fetch;
const transport = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
const configuredFetch = (...args: Parameters<typeof fetch>) => {
  // Sul codice precedente usa il fetch senza timeout: il test fallisce sullo stato,
  // non per un import inesistente del nuovo helper.
  const options = (createClient as jest.Mock).mock.calls[0][2];
  const request = options.global?.fetch ?? global.fetch;
  return request(...args) as ReturnType<typeof fetch>;
};

beforeEach(async () => {
  jest.useFakeTimers();
  i18n.locale = 'it';
  global.fetch = transport;
  transport.mockImplementation(() => new Promise(() => undefined));
  await supabase.auth.stopAutoRefresh();
});

afterEach(() => {
  jest.restoreAllMocks();
  transport.mockReset();
  global.fetch = originalFetch;
  jest.useRealTimers();
});

it('timeout di rete: richiesta senza risposta fallisce entro 15 s', async () => {
  const rejected = jest.fn();
  void configuredFetch('https://example.invalid/hangs').catch(rejected);
  await jest.advanceTimersByTimeAsync(14999);
  expect(rejected).not.toHaveBeenCalled();
  await jest.advanceTimersByTimeAsync(1);
  expect(rejected).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'AbortError' })
  );
  expect(transport.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
  expect(jest.getTimerCount()).toBe(0);
});

it('timeout di rete: Accesso esce dal caricamento', async () => {
  const screen = render(
    <AllProviders>
      <LoginScreen />
    </AllProviders>
  );
  await act(() => Promise.resolve());
  fireEvent.changeText(screen.getByLabelText('Email'), 'donatore@example.test');
  fireEvent.changeText(screen.getByLabelText('Password'), 'Password1!');
  fireEvent.press(screen.getByRole('button', { name: 'Accedi' }));
  await act(() => Promise.resolve());
  expect(transport).toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Accedi' })).toBeNull();
  await act(async () => {
    await jest.advanceTimersByTimeAsync(15000);
  });
  expect(screen.getByText(i18n.t('auth.errors.network'))).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Accedi' })).toBeEnabled();
});

it('timeout di rete: Dona esce dal caricamento', async () => {
  const session = {
    access_token: 'test-token',
    user: { id: 'donor' },
  } as Session;
  jest
    .spyOn(supabase.auth, 'getSession')
    .mockResolvedValue({ data: { session }, error: null });
  jest.spyOn(Auth, 'useAuth').mockReturnValue({
    session,
    profile: null,
    consentState: 'unknown',
    refreshProfile: jest.fn().mockResolvedValue(null),
    refreshConsent: jest.fn().mockResolvedValue('unknown'),
  } as unknown as ReturnType<typeof Auth.useAuth>);
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  const { result } = renderHook(() => usePartnerExit());
  let completed = false;
  act(() => {
    void result.current.openDonation().then(() => {
      completed = true;
    });
  });
  await act(() => Promise.resolve());
  expect(result.current.isExiting).toBe(true);
  // Select e insert best-effort sono due richieste, entrambe limitate a 15 s.
  await act(async () => {
    await jest.advanceTimersByTimeAsync(30000);
  });
  expect(completed).toBe(true);
  expect(result.current.isExiting).toBe(false);
  expect(open).toHaveBeenCalledWith(expect.stringContaining('donorbox.org'));
  expect(open.mock.calls[0]?.[0]).not.toContain('email=');
});

it('il timeout resta attivo con il segnale del chiamante e ripulisce i listener', async () => {
  const caller = new AbortController();
  const remove = jest.spyOn(caller.signal, 'removeEventListener');
  const rejected = jest.fn();
  void configuredFetch('https://example.invalid/hangs', {
    signal: caller.signal,
  }).catch(rejected);
  await jest.advanceTimersByTimeAsync(15000);
  expect(rejected).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'AbortError' })
  );
  expect(caller.signal.aborted).toBe(false);
  expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
});

it('la cancellazione del chiamante interrompe subito la richiesta', async () => {
  const caller = new AbortController();
  const rejected = jest.fn();
  void configuredFetch('https://example.invalid/hangs', {
    signal: caller.signal,
  }).catch(rejected);
  caller.abort();
  await jest.advanceTimersByTimeAsync(0);
  expect(rejected).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'AbortError' })
  );
  expect(jest.getTimerCount()).toBe(0);
});

it('un segnale già annullato non avvia il trasporto', async () => {
  const caller = new AbortController();
  caller.abort();
  const rejected = jest.fn();
  void configuredFetch('https://example.invalid/hangs', {
    signal: caller.signal,
  }).catch(rejected);
  await jest.advanceTimersByTimeAsync(0);
  expect(rejected).toHaveBeenCalled();
  expect(transport).not.toHaveBeenCalled();
});

it('una risposta riuscita libera il timer e conserva le opzioni', async () => {
  const response = { ok: true } as Response;
  transport.mockResolvedValueOnce(response);
  await expect(
    configuredFetch('https://example.invalid', {
      method: 'POST',
      body: 'payload',
    })
  ).resolves.toBe(response);
  expect(transport).toHaveBeenCalledWith(
    'https://example.invalid',
    expect.objectContaining({ method: 'POST', body: 'payload' })
  );
  expect(jest.getTimerCount()).toBe(0);
});
