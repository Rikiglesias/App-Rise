import { assertEquals } from 'jsr:@std/assert@1';
import { assertSpyCalls, spy, stub } from 'jsr:@std/testing@1/mock';
import { handler, type PurgeDeps, timingSafeCompare } from './index.ts';

interface QueryResult {
  data: { id: string }[] | null;
  error: { message: string } | null;
}

function buildAdmin(opts: {
  query?: QueryResult;
  deleteResults?: Record<string, { message: string } | null>;
  deleteDefault?: { message: string } | null;
  seq?: string[];
}) {
  const lt = spy((_col: string, _val: string) =>
    Promise.resolve(opts.query ?? { data: [], error: null })
  );
  const not = spy((_col: string, _op: string, _val: unknown) => ({ lt }));
  const select = spy((_cols: string) => ({ not }));
  const from = spy((_table: string) => ({ select }));
  const deleteUser = spy((id: string) => {
    opts.seq?.push(id);
    const err = opts.deleteResults && id in opts.deleteResults
      ? opts.deleteResults[id]
      : (opts.deleteDefault ?? null);
    return Promise.resolve({ error: err });
  });
  const fake = { from, auth: { admin: { deleteUser } } };
  const adminFactory = spy(() =>
    fake as unknown as ReturnType<NonNullable<PurgeDeps['adminFactory']>>
  );
  return { adminFactory, from, select, not, lt, deleteUser };
}

function req(secret?: string) {
  const headers: Record<string, string> = {};
  if (secret !== undefined) headers['x-cron-secret'] = secret;
  return new Request('http://x', { method: 'POST', headers });
}

function setCron(v: string | null) {
  if (v === null) Deno.env.delete('CRON_SECRET');
  else Deno.env.set('CRON_SECRET', v);
}

Deno.test('CRON_SECRET env mancante -> 403, nessun client, nessun alert', async () => {
  setCron(null);
  const { adminFactory } = buildAdmin({});
  const alert = spy((_i: unknown) => Promise.resolve());
  const res = await handler(req('whatever'), { adminFactory, alert });
  assertEquals(res.status, 403);
  assertEquals(await res.text(), 'forbidden');
  assertSpyCalls(adminFactory, 0);
  assertSpyCalls(alert, 0);
});

Deno.test('header x-cron-secret mancante -> 403', async () => {
  setCron('s3cr3t');
  const { adminFactory } = buildAdmin({});
  const res = await handler(req(undefined), { adminFactory });
  assertEquals(res.status, 403);
  assertSpyCalls(adminFactory, 0);
  setCron(null);
});

Deno.test('secret sbagliato -> 403, nessun client', async () => {
  setCron('s3cr3t-corretto-lungo');
  const { adminFactory } = buildAdmin({});
  const res = await handler(req('valore-errato'), { adminFactory });
  assertEquals(res.status, 403);
  assertSpyCalls(adminFactory, 0);
  setCron(null);
});

Deno.test('timingSafeCompare (S5): uguali true, diversi/lunghezze diverse false', async () => {
  assertEquals(await timingSafeCompare('x', 'x'), true);
  assertEquals(await timingSafeCompare('xa', 'xb'), false);
  assertEquals(await timingSafeCompare('ax', 'bx'), false);
  assertEquals(await timingSafeCompare('abc', 'abcd'), false);
  assertEquals(await timingSafeCompare('s3cr3t', 's3cr3t'), true);
});

Deno.test('secret giusto -> 200, client creato (no falso negativo)', async () => {
  setCron('ok');
  const { adminFactory } = buildAdmin({ query: { data: [], error: null } });
  const res = await handler(req('ok'), { adminFactory });
  assertEquals(res.status, 200);
  assertSpyCalls(adminFactory, 1);
  setCron(null);
});

Deno.test('query error -> 500 + alert query_failed, nessun delete', async () => {
  setCron('ok');
  const { adminFactory, deleteUser } = buildAdmin({
    query: { data: null, error: { message: 'boom-db' } },
  });
  const alert = spy((_i: unknown) => Promise.resolve());
  const res = await handler(req('ok'), { adminFactory, alert });
  assertEquals(res.status, 500);
  assertEquals((await res.json()).error, 'boom-db');
  assertSpyCalls(deleteUser, 0);
  assertSpyCalls(alert, 1);
  assertEquals((alert.calls[0].args[0] as { reason: string }).reason, 'query_failed');
  setCron(null);
});

Deno.test('nessuna riga -> deleted 0 scanned 0 failed 0, no alert', async () => {
  setCron('ok');
  const { adminFactory, deleteUser } = buildAdmin({ query: { data: [], error: null } });
  const alert = spy((_i: unknown) => Promise.resolve());
  const res = await handler(req('ok'), { adminFactory, alert });
  assertEquals(res.status, 200);
  assertEquals(await res.json(), { deleted: 0, scanned: 0, failed: 0 });
  assertSpyCalls(deleteUser, 0);
  assertSpyCalls(alert, 0);
  setCron(null);
});

Deno.test('righe multiple tutte ok -> deleted == scanned, no alert', async () => {
  setCron('ok');
  const seq: string[] = [];
  const { adminFactory, deleteUser } = buildAdmin({
    query: { data: [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }], error: null },
    deleteDefault: null,
    seq,
  });
  const alert = spy((_i: unknown) => Promise.resolve());
  const res = await handler(req('ok'), { adminFactory, alert });
  assertEquals(await res.json(), { deleted: 3, scanned: 3, failed: 0 });
  assertSpyCalls(deleteUser, 3);
  assertEquals(seq, ['u1', 'u2', 'u3']);
  assertSpyCalls(alert, 0);
  setCron(null);
});

Deno.test('alcuni delete falliti -> deleted parziale + alert delete_failed (S9)', async () => {
  setCron('ok');
  const { adminFactory, deleteUser } = buildAdmin({
    query: { data: [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }], error: null },
    deleteResults: { u1: null, u2: { message: 'auth-fail-u2' }, u3: null },
  });
  const alert = spy((_i: unknown) => Promise.resolve());
  using _err = stub(console, 'error', () => {});
  const res = await handler(req('ok'), { adminFactory, alert });
  const body = await res.json();
  assertEquals(body.deleted, 2);
  assertEquals(body.scanned, 3);
  assertEquals(body.failed, 1);
  assertSpyCalls(deleteUser, 3);
  assertSpyCalls(alert, 1);
  const info = alert.calls[0].args[0] as {
    reason: string;
    failed: number;
    failures: { id: string }[];
  };
  assertEquals(info.reason, 'delete_failed');
  assertEquals(info.failed, 1);
  assertEquals(info.failures[0].id, 'u2');
  setCron(null);
});

Deno.test('cutoff 30 giorni corretto (filtro temporale)', async () => {
  setCron('ok');
  const { adminFactory, from, select, not, lt } = buildAdmin({ query: { data: [], error: null } });
  const T = 1_700_000_000_000;
  const res = await handler(req('ok'), { adminFactory, now: () => T });
  assertEquals(res.status, 200);
  assertEquals(from.calls[0].args[0], 'profiles');
  assertEquals(select.calls[0].args[0], 'id');
  assertEquals(not.calls[0].args[0], 'deletion_requested_at');
  assertEquals(not.calls[0].args[1], 'is');
  assertEquals(not.calls[0].args[2], null);
  assertEquals(lt.calls[0].args[0], 'deletion_requested_at');
  assertEquals(lt.calls[0].args[1], new Date(T - 30 * 24 * 60 * 60 * 1000).toISOString());
  setCron(null);
});
