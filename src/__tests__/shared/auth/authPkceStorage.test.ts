import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/shared/auth/supabaseClient';

// SDK e storage adapter reali; solo rete e archivio nativo sono simulati.
jest.unmock('@/shared/auth/supabaseClient');
const mockVault = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((key: string) =>
    Promise.resolve(mockVault.get(key) ?? null)
  ),
  setItemAsync: jest.fn((key: string, value: string) => {
    mockVault.set(key, value);
    return Promise.resolve();
  }),
  deleteItemAsync: jest.fn((key: string) => {
    mockVault.delete(key);
    return Promise.resolve();
  }),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  AppState: { addEventListener: jest.fn() },
}));
jest.mock('@/shared/config/environment', () => ({
  env: {
    SUPABASE_URL: 'https://example.invalid',
    SUPABASE_ANON_KEY: 'test-key',
  },
}));

it('PKCE: il verificatore persistito viene riusato dopo il riavvio del client', async () => {
  const previousFetch = global.fetch;
  const transport = jest.fn<
    ReturnType<typeof fetch>,
    Parameters<typeof fetch>
  >();
  global.fetch = transport;
  let restarted: typeof supabase | undefined;
  try {
    await supabase.auth.stopAutoRefresh();
    transport.mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const sent = await supabase.auth.resetPasswordForEmail(
      'donor@example.test',
      {
        redirectTo: 'rahitalia://reset-password',
      }
    );
    expect(sent.error).toBeNull();
    const verifierKey = 'sb-example-auth-token-code-verifier';
    const stored = await SecureStore.getItemAsync(verifierKey);
    expect(stored).not.toBeNull();
    if (!stored) throw new Error('Verificatore non persistito');
    const verifier = (JSON.parse(stored) as string).split('/')[0];
    expect(verifier).toBeTruthy();
    const firstBody = JSON.parse(String(transport.mock.calls[0]?.[1]?.body));
    expect(firstBody.code_challenge).toBeTruthy();

    // Nuovi moduli/client, stesso archivio nativo: nessun verificatore in RAM condivisa.
    jest.resetModules();
    restarted = jest.requireActual<
      typeof import('@/shared/auth/supabaseClient')
    >('@/shared/auth/supabaseClient').supabase;
    await restarted.auth.stopAutoRefresh();
    transport.mockClear();
    transport.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: 'test-access',
          refresh_token: 'test-refresh',
          token_type: 'bearer',
          expires_in: 3600,
          user: { id: 'donor', email: 'donor@example.test' },
        }),
        { status: 200 }
      )
    );
    const exchanged =
      await restarted.auth.exchangeCodeForSession('returned-code');
    expect(exchanged.error).toBeNull();
    expect(exchanged.data.session?.user.id).toBe('donor');
    const request = transport.mock.calls[0];
    if (!request) throw new Error('Scambio PKCE non inviato');
    const [url, options] = request;
    expect(String(url)).toContain('/token?grant_type=pkce');
    expect(JSON.parse(String(options?.body))).toEqual({
      auth_code: 'returned-code',
      code_verifier: verifier,
    });
    expect((await restarted.auth.getSession()).data.session?.user.id).toBe(
      'donor'
    );
    expect(await SecureStore.getItemAsync(verifierKey)).toBeNull();
    const missing = await restarted.auth.exchangeCodeForSession('reused-code');
    expect(missing.error?.code).toBe('pkce_code_verifier_not_found');
    expect(transport).toHaveBeenCalledTimes(1);
  } finally {
    await supabase.auth.stopAutoRefresh();
    await restarted?.auth.stopAutoRefresh();
    global.fetch = previousFetch;
    mockVault.clear();
  }
});
