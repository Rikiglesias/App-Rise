import { assertEquals } from 'jsr:@std/assert@1';
import { assertSpyCalls, spy } from 'jsr:@std/testing@1/mock';
import { type Deps, handler } from './index.ts';

interface FakeAdmin {
  auth: {
    getUser: (jwt: string) => Promise<{ data: { user: unknown }; error: unknown }>;
    admin: { deleteUser: (id: string) => Promise<{ error: unknown }> };
  };
}

function buildDeps(opts: { user?: unknown; getUserError?: unknown; deleteUserError?: unknown }) {
  const getUser = spy((_jwt: string) =>
    Promise.resolve({ data: { user: opts.user ?? null }, error: opts.getUserError ?? null })
  );
  const deleteUser = spy((_id: string) => Promise.resolve({ error: opts.deleteUserError ?? null }));
  const fake: FakeAdmin = { auth: { getUser, admin: { deleteUser } } };
  const createAdmin = spy(() => fake as unknown as ReturnType<Deps['createAdmin']>);
  const deps: Deps = { createAdmin };
  return { deps, getUser, deleteUser, createAdmin };
}

const emailUser = { id: 'u2', identities: [{ provider: 'email' }] };

function post(body?: string, headers: Record<string, string> = {}) {
  return new Request('http://x/delete-account', {
    method: 'POST',
    headers: { Authorization: 'Bearer tok', ...headers },
    body,
  });
}

Deno.test('OPTIONS -> 200 ok + CORS, nessun side-effect', async () => {
  const { deps, createAdmin, getUser, deleteUser } = buildDeps({});
  const res = await handler(new Request('http://x', { method: 'OPTIONS' }), deps);
  assertEquals(res.status, 200);
  assertEquals(await res.text(), 'ok');
  assertEquals(res.headers.get('Access-Control-Allow-Origin'), '*');
  assertEquals(res.headers.get('Access-Control-Allow-Methods'), 'POST, OPTIONS');
  assertSpyCalls(createAdmin, 0);
  assertSpyCalls(getUser, 0);
  assertSpyCalls(deleteUser, 0);
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
  const { deps, getUser, deleteUser } = buildDeps({ getUserError: { message: 'invalid jwt' } });
  const res = await handler(post('{}', { 'Content-Type': 'application/json' }), deps);
  assertEquals(res.status, 401);
  assertEquals((await res.json()).error, 'unauthorized');
  assertSpyCalls(getUser, 1);
  assertEquals(getUser.calls[0].args[0], 'tok');
  assertSpyCalls(deleteUser, 0);
});

Deno.test('getUser user null senza error -> 401, no delete', async () => {
  const { deps, deleteUser } = buildDeps({ user: null });
  const res = await handler(post('{}', { 'Content-Type': 'application/json' }), deps);
  assertEquals(res.status, 401);
  assertSpyCalls(deleteUser, 0);
});

Deno.test('body assente -> 200 ok, cancella il chiamante', async () => {
  const { deps, deleteUser } = buildDeps({ user: emailUser });
  const res = await handler(post(undefined), deps);
  assertEquals(res.status, 200);
  assertEquals((await res.json()).ok, true);
  assertSpyCalls(deleteUser, 1);
  assertEquals(deleteUser.calls[0].args[0], 'u2');
});

// REGRESSIONE della rimozione social: un'app già installata continua a inviare
// { appleAuthCode }. Il campo non esiste più, ma il diritto all'oblio non può
// dipendere dall'aver aggiornato l'app → il body va IGNORATO, non rifiutato.
Deno.test('body vecchio con appleAuthCode -> ignorato, cancellazione riuscita', async () => {
  const { deps, deleteUser } = buildDeps({ user: emailUser });
  const res = await handler(
    post(JSON.stringify({ appleAuthCode: 'CODE123' }), { 'Content-Type': 'application/json' }),
    deps
  );
  assertEquals(res.status, 200);
  assertEquals(await res.json(), { ok: true });
  assertSpyCalls(deleteUser, 1);
  assertEquals(deleteUser.calls[0].args[0], 'u2');
});

// Stesso principio con un corpo non parsabile: nessuna lettura del body deve
// poter far fallire la cancellazione.
Deno.test('body non-JSON -> ignorato, cancellazione riuscita', async () => {
  const { deps, deleteUser } = buildDeps({ user: emailUser });
  const res = await handler(post('non-json{{', { 'Content-Type': 'application/json' }), deps);
  assertEquals(res.status, 200);
  assertEquals((await res.json()).ok, true);
  assertSpyCalls(deleteUser, 1);
});

// Un'identità apple residua (account nato prima della rimozione) non è più un
// caso speciale: si cancella come tutti, senza revoca e senza warning.
Deno.test('identità apple residua -> nessun ramo speciale, 200', async () => {
  const { deps, deleteUser } = buildDeps({
    user: { id: 'u1', identities: [{ provider: 'apple' }] },
  });
  const res = await handler(post(undefined), deps);
  assertEquals(res.status, 200);
  assertEquals(await res.json(), { ok: true });
  assertSpyCalls(deleteUser, 1);
  assertEquals(deleteUser.calls[0].args[0], 'u1');
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

Deno.test('happy path identities undefined -> 200 { ok: true }', async () => {
  const { deps, deleteUser } = buildDeps({ user: { id: 'u3' } });
  const res = await handler(post(JSON.stringify({}), { 'Content-Type': 'application/json' }), deps);
  assertEquals(res.status, 200);
  assertEquals(await res.json(), { ok: true });
  assertSpyCalls(deleteUser, 1);
  assertEquals(deleteUser.calls[0].args[0], 'u3');
});
