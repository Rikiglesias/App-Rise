import { assertEquals } from 'jsr:@std/assert@1';
import { assertSpyCalls, stub } from 'jsr:@std/testing@1/mock';
import { handler } from './index.ts';

function useEnv(secretKeys: string | undefined, cronSecret: string | null = 'cron-fixture') {
  // Il nome composto serve solo a rimuovere la variabile legacy dai test.
  const legacyName = ['SUPABASE', 'SERVICE', 'ROLE', 'KEY'].join('_');
  const values = new Map<string, string | undefined>([
    ['SUPABASE_URL', 'https://fixture.supabase.co'],
    ['SUPABASE_SECRET_KEYS', secretKeys],
    ['CRON_SECRET', cronSecret ?? undefined],
    [legacyName, undefined],
  ]);
  const previous = new Map([...values.keys()].map((name) => [name, Deno.env.get(name)]));
  for (const [name, value] of values) {
    if (value === undefined) Deno.env.delete(name);
    else Deno.env.set(name, value);
  }
  return {
    [Symbol.dispose]() {
      for (const [name, value] of previous) {
        if (value === undefined) Deno.env.delete(name);
        else Deno.env.set(name, value);
      }
    },
  };
}

function request(secret: string | undefined = 'cron-fixture') {
  return new Request('http://x/purge-deletions', {
    method: 'POST',
    headers: secret ? { 'x-cron-secret': secret } : {},
  });
}

Deno.test('chiave da SUPABASE_SECRET_KEYS', async () => {
  using _env = useEnv('{"default":"sb_secret_fixture"}');
  const userId = '11111111-1111-4111-8111-111111111111';
  const requests: Request[] = [];
  using fetchMock = stub(globalThis, 'fetch', (input, init) => {
    const req = new Request(input, init);
    requests.push(req);
    return Promise.resolve(Response.json(req.method === 'DELETE' ? {} : [{ id: userId }]));
  });
  const res = await handler(request());
  assertEquals(res.status, 200);
  assertEquals(await res.json(), { deleted: 1, scanned: 1, failed: 0 });
  assertSpyCalls(fetchMock, 2);
  assertEquals(requests.map((req) => req.headers.get('apikey')), [
    'sb_secret_fixture',
    'sb_secret_fixture',
  ]);
  assertEquals(new URL(requests[0].url).pathname, '/rest/v1/profiles');
  assertEquals(requests[1].url, `https://fixture.supabase.co/auth/v1/admin/users/${userId}`);
  assertEquals(requests[1].method, 'DELETE');
});

for (
  const [name, value, reason] of [
    ['chiave assente → 500', undefined, 'variabile assente'],
    ['JSON chiavi non valido → 500', '{"default":"dato-riservato"', 'JSON non valido'],
    ['default assente → 500', '{"other":"dato-riservato"}', 'default assente o non valida'],
    ['default vuota → 500', '{"default":" "}', 'default assente o non valida'],
    ['default non stringa → 500', '{"default":123}', 'default assente o non valida'],
    ['JSON null → 500', 'null', 'default assente o non valida'],
  ] as const
) {
  Deno.test(name, async () => {
    using _env = useEnv(value);
    using fetchMock = stub(globalThis, 'fetch', () => {
      throw new Error('Nessuna richiesta di rete consentita');
    });
    using errorLog = stub(console, 'error', () => {});
    const res = await handler(request());
    assertEquals(res.status, 500);
    assertEquals(await res.json(), { error: 'server_misconfigured' });
    assertSpyCalls(fetchMock, 0);
    assertSpyCalls(errorLog, 1);
    assertEquals(errorLog.calls[0].args, [
      `[purge-deletions] SUPABASE_SECRET_KEYS: ${reason}`,
    ]);
  });
}

for (const scenario of ['header assente', 'header errato', 'env cron assente'] as const) {
  Deno.test(`${scenario} e chiave admin assente → 403`, async () => {
    using _env = useEnv(undefined, scenario === 'env cron assente' ? null : 'cron-fixture');
    using fetchMock = stub(globalThis, 'fetch', () => {
      throw new Error('Nessuna richiesta di rete consentita');
    });
    using errorLog = stub(console, 'error', () => {});
    const res = await handler(request(scenario === 'header assente' ? '' : 'errato'));
    assertEquals(res.status, 403);
    assertEquals(await res.text(), 'forbidden');
    assertSpyCalls(fetchMock, 0);
    assertSpyCalls(errorLog, 0);
  });
}
