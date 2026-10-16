import { exchangeAuthLink } from '@/shared/auth/authLinkExchange';
import { supabase } from '@/shared/auth/supabaseClient';

jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: { auth: { exchangeCodeForSession: jest.fn() } },
}));
const exchange = jest.mocked(supabase.auth.exchangeCodeForSession);
const success = { data: { session: { user: { id: 'u1' } } }, error: null };
beforeEach(() => {
  jest.clearAllMocks();
  exchange.mockReset();
  (exchange as jest.Mock).mockResolvedValue(success);
});

it.each([
  'https://evil.test/reset-password?code=foreign',
  'rahitalia://home?code=foreign&type=recovery',
  'rahitalia://reset-password?code=%ZZ',
  'rahitalia://reset-password#code=fragment',
  'rahitalia://reset-password?code=bad&error_code=otp_expired',
  'rahitalia://reset-password?code=bad#error_code=otp_expired',
  'rahitalia://reset-password?code=bad&type=signup',
])('PKCE rifiuta un redirect non valido: %s', async url => {
  expect(await exchangeAuthLink(url, 'reset')).toEqual({ ok: false });
  expect(exchange).not.toHaveBeenCalled();
  expect(
    await exchangeAuthLink('rahitalia://reset-password?code=positive', 'reset')
  ).toEqual({ ok: true });
  expect(exchange).toHaveBeenCalledWith('positive');
});

it('PKCE distingue sessione presente, risposta vuota ed eccezione di storage', async () => {
  const url = 'rahitalia://confirm-email?code=ok';
  expect(await exchangeAuthLink(url, 'confirm')).toEqual({ ok: true });
  (exchange as jest.Mock).mockResolvedValueOnce({
    data: { session: null, user: null },
    error: null,
  });
  expect(await exchangeAuthLink(url, 'confirm')).toEqual({ ok: false });
  exchange.mockRejectedValueOnce(new Error('storage unavailable'));
  expect(await exchangeAuthLink(url, 'confirm')).toEqual({ ok: false });
});
