import { assertEquals } from 'jsr:@std/assert@1';
import { assertSpyCalls, spy, stub } from 'jsr:@std/testing@1/mock';
import { type Deps, handler } from './index.ts';

interface FakeAdmin {
  auth: {
    getUser: (jwt: string) => Promise<{ data: { user: unknown }; error: unknown }>;
    admin: { deleteUser: (id: string) => Promise<{ error: unknown }> };
  };
}

function buildDeps(opts: {
  user?: unknown;
  getUserError?: unknown;
  deleteUserError?: unknown;
  revokeImpl?: (code: string) => Promise<void>;
  seq?: string[];
}) {
  const getUser = spy((_jwt: string) =>
    Promise.resolve({ data: { user: opts.user ?? null }, error: opts.getUserError ?? null })
  );
  const deleteUser = spy((_id: string) => {
    opts.seq?.push('delete');
    return Promise.resolve({ error: opts.deleteUserError ?? null });
  });
  const fake: FakeAdmin = { auth: { getUser, admin: { deleteUser } } };
  const createAdmin = spy(() => fake as unknown as ReturnType<Deps['createAdmin']>);
  const revokeApple = spy(
    opts.revokeImpl ??
      ((_code: string) => {
        opts.seq?.push('revoke');
        return Promise.resolve();
      }),
  );
  const deps: Deps = { createAdmin, revokeApple };
  return { deps, getUser, deleteUser, createAdmin, revokeApple };
}

const appleUser = { id: 'u1', identities: [{ provider: 'apple' }] };
const emailUser = { id: 'u2', identities: [{ provider: 'email' }] };

function post(body?: string, headers: Record<string, string> = {}) {
  return new Request('http://x/delete-account', {
    method: 'POST',
    headers: { Authorization: 'Bearer tok', ...headers },
    body,
  });
}

Deno.test('OPTIONS -> 200 ok + CORS, nessun side-effect', async () => {
  const { deps, createAdmin, getUser, deleteUser, revokeApple } = buildDeps({});
  const res = await handler(new Request('http://x', { method: 'OPTIONS' }), deps);
  assertEquals(res.status, 200);
  assertEquals(await res.text(), 'ok');
  assertEquals(res.headers.get('Access-Control-Allow-Origin'), '*');
  assertEquals(res.headers.get('Access-Control-Allow-Methods'), 'POST, OPTIONS');
  assertSpyCalls(createAdmin, 0);
  assertSpyCalls(getUser, 0);
  assertSpyCalls(deleteUser, 0);
  assertSpyCalls(revokeApple, 0);
});

Deno.test('GET -> 405 method_not_allowed, nessun client', async () => {
  const { deps, createAdmin } = buildDeps({});
  const res = await handler(new Request('http://x', { method: 'GET' }), deps);
  assertEquals(res.status, 405);
  assertEquals((await res.json()).error, 'method_not_allowed');
  assertSpyCalls(createAdmin, 0);
});

Deno.test('POST senza Authorization -> 401, nessun client', async () => {
  const { deps, createAdmin } = buildDeps({});
  const res = await handler(new Request('http://x', { method: 'POST' }), deps);
  assertEquals(res.status, 401);
  assertEquals((await res.json()).error, 'unauthorized');
  assertSpyCalls(createAdmin, 0);
});

Deno.test('getUser error -> 401, jwt spogliato del Bearer, no delete', async () => {
  const { deps, getUser, deleteUser, revokeApple } = buildDeps({
    getUserError: { message: 'invalid jwt' },
  });
  const res = await handler(post('{}', { 'Content-Type': 'application/json' }), deps);
  assertEquals(res.status, 401);
  assertEquals((await res.json()).error, 'unauthorized');
  assertSpyCalls(getUser, 1);
  assertEquals(getUser.calls[0].args[0], 'tok');
  assertSpyCalls(deleteUser, 0);
  assertSpyCalls(revokeApple, 0);
});

Deno.test('getUser user null senza error -> 401, no delete', async () => {
  const { deps, deleteUser } = buildDeps({ user: null });
  const res = await handler(post('{}', { 'Content-Type': 'application/json' }), deps);
  assertEquals(res.status, 401);
  assertSpyCalls(deleteUser, 0);
});

Deno.test('body assente/non-JSON, non-Apple -> 200 ok, no revoke', async () => {
  const { deps, deleteUser, revokeApple } = buildDeps({ user: emailUser });
  const res = await handler(post(undefined), deps);
  assertEquals(res.status, 200);
  assertEquals((await res.json()).ok, true);
  assertSpyCalls(revokeApple, 0);
  assertSpyCalls(deleteUser, 1);
  assertEquals(deleteUser.calls[0].args[0], 'u2');
});

Deno.test('Apple + appleAuthCode -> revoke poi delete (200), ordine corretto', async () => {
  const seq: string[] = [];
  const { deps, deleteUser, revokeApple } = buildDeps({ user: appleUser, seq });
  const res = await handler(
    post(JSON.stringify({ appleAuthCode: 'CODE123' }), { 'Content-Type': 'application/json' }),
    deps,
  );
  assertEquals(res.status, 200);
  assertEquals((await res.json()).ok, true);
  assertSpyCalls(revokeApple, 1);
  assertEquals(revokeApple.calls[0].args[0], 'CODE123');
  assertSpyCalls(deleteUser, 1);
  assertEquals(seq, ['revoke', 'delete']);
});

Deno.test('appleAuthCode non-stringa -> trattato come assente, no revoke', async () => {
  const { deps, revokeApple, deleteUser } = buildDeps({ user: appleUser });
  using warn = stub(console, 'warn', () => {});
  const res = await handler(
    post(JSON.stringify({ appleAuthCode: 12345 }), { 'Content-Type': 'application/json' }),
    deps,
  );
  assertEquals(res.status, 200);
  assertSpyCalls(revokeApple, 0);
  assertSpyCalls(deleteUser, 1);
  assertSpyCalls(warn, 1);
});

Deno.test('Apple senza appleAuthCode -> warn, salta revoca, delete ok', async () => {
  const { deps, revokeApple, deleteUser } = buildDeps({ user: appleUser });
  using warn = stub(console, 'warn', () => {});
  const res = await handler(post(undefined), deps);
  assertEquals(res.status, 200);
  assertSpyCalls(revokeApple, 0);
  assertSpyCalls(deleteUser, 1);
  assertSpyCalls(warn, 1);
});

Deno.test('revoca Apple che throwa -> log, delete prosegue (200)', async () => {
  const { deps, revokeApple, deleteUser } = buildDeps({
    user: appleUser,
    revokeImpl: (_c: string) => Promise.reject(new Error('apple revoke failed')),
  });
  using err = stub(console, 'error', () => {});
  const res = await handler(
    post(JSON.stringify({ appleAuthCode: 'X' }), { 'Content-Type': 'application/json' }),
    deps,
  );
  assertEquals(res.status, 200);
  assertEquals((await res.json()).ok, true);
  assertSpyCalls(revokeApple, 1);
  assertSpyCalls(deleteUser, 1);
  assertSpyCalls(err, 1);
});

Deno.test('deleteUser error -> 500 con delErr.message', async () => {
  const { deps, deleteUser } = buildDeps({
    user: emailUser,
    deleteUserError: { message: 'db down' },
  });
  const res = await handler(post(undefined), deps);
  assertEquals(res.status, 500);
  assertEquals((await res.json()).error, 'db down');
  assertSpyCalls(deleteUser, 1);
});

Deno.test('happy path non-Apple (identities undefined) -> 200 { ok: true }', async () => {
  const { deps, revokeApple, deleteUser } = buildDeps({ user: { id: 'u3' } });
  const res = await handler(post(JSON.stringify({}), { 'Content-Type': 'application/json' }), deps);
  assertEquals(res.status, 200);
  assertEquals(await res.json(), { ok: true });
  assertSpyCalls(revokeApple, 0);
  assertSpyCalls(deleteUser, 1);
  assertEquals(deleteUser.calls[0].args[0], 'u3');
});

Deno.test('identities senza apple + authCode -> isApple false, no revoke', async () => {
  const { deps, revokeApple, deleteUser } = buildDeps({
    user: { id: 'u4', identities: [{ provider: 'google' }, { provider: 'email' }] },
  });
  const res = await handler(
    post(JSON.stringify({ appleAuthCode: 'Y' }), { 'Content-Type': 'application/json' }),
    deps,
  );
  assertEquals(res.status, 200);
  assertSpyCalls(revokeApple, 0);
  assertSpyCalls(deleteUser, 1);
});
