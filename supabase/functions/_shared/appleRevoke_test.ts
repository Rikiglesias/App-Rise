import { assertEquals, assertRejects, assertStringIncludes } from 'jsr:@std/assert@1';
import { assertSpyCalls, returnsNext, stub } from 'jsr:@std/testing@1/mock';
import { decodeProtectedHeader, exportPKCS8, generateKeyPair, jwtVerify } from 'npm:jose@5';
import { revokeAppleViaAuthCode } from './appleRevoke.ts';

const APPLE = 'https://appleid.apple.com';

// Chiave EC P-256 di test generata a runtime: nessun segreto hardcodato e firma
// verificabile end-to-end con la publicKey (il sorgente firma con la privata .p8).
const keyPair = await generateKeyPair('ES256', { extractable: true });
const publicKey = keyPair.publicKey;
const privateKeyP8 = await exportPKCS8(keyPair.privateKey);
const otherPublicKey = (await generateKeyPair('ES256', { extractable: true })).publicKey;

function setSecrets() {
  Deno.env.set('APPLE_TEAM_ID', 'TEAMID0000');
  Deno.env.set('APPLE_KEY_ID', 'KEYID00000');
  Deno.env.set('APPLE_BUNDLE_ID', 'com.rise.app');
  Deno.env.set('APPLE_PRIVATE_KEY', privateKeyP8);
}

function clearSecrets() {
  for (const k of ['APPLE_TEAM_ID', 'APPLE_KEY_ID', 'APPLE_BUNDLE_ID', 'APPLE_PRIVATE_KEY']) {
    Deno.env.delete(k);
  }
}

function tokenOk(body: Record<string, unknown>) {
  return Promise.resolve(Response.json(body, { status: 200 }));
}

function bodyParams(init: RequestInit | undefined): URLSearchParams {
  const b = init?.body;
  if (b instanceof URLSearchParams) return b;
  return new URLSearchParams(String(b));
}

Deno.test('happy path: 2 fetch con parametri corretti + client_secret JWT ES256 valido', async () => {
  setSecrets();
  using fetchStub = stub(
    globalThis,
    'fetch',
    returnsNext([
      tokenOk({ refresh_token: 'rt_happy' }),
      Promise.resolve(new Response(null, { status: 200 })),
    ]),
  );

  await revokeAppleViaAuthCode('the_auth_code');
  assertSpyCalls(fetchStub, 2);

  // CALL 0 -> /auth/token
  assertEquals(fetchStub.calls[0].args[0], `${APPLE}/auth/token`);
  const init0 = fetchStub.calls[0].args[1] as RequestInit;
  assertEquals(init0.method, 'POST');
  const p0 = bodyParams(init0);
  assertEquals(p0.get('client_id'), 'com.rise.app');
  assertEquals(p0.get('code'), 'the_auth_code');
  assertEquals(p0.get('grant_type'), 'authorization_code');

  // client_secret = JWT ES256 ben formato e firmato dalla chiave Apple
  const clientSecret = p0.get('client_secret') ?? '';
  const hdr = decodeProtectedHeader(clientSecret);
  assertEquals(hdr.alg, 'ES256');
  assertEquals(hdr.kid, 'KEYID00000');
  const { payload } = await jwtVerify(clientSecret, publicKey, {
    issuer: 'TEAMID0000',
    audience: APPLE,
  });
  assertEquals(payload.sub, 'com.rise.app');
  assertEquals(payload.iss, 'TEAMID0000');
  assertEquals(typeof payload.iat, 'number');
  assertEquals(typeof payload.exp, 'number');
  assertEquals((payload.exp as number) - (payload.iat as number), 300);
  // firma non bypassabile: una chiave diversa fa fallire la verifica
  await assertRejects(() => jwtVerify(clientSecret, otherPublicKey));

  // CALL 1 -> /auth/revoke con il refresh_token estratto dalla 1a risposta
  assertEquals(fetchStub.calls[1].args[0], `${APPLE}/auth/revoke`);
  const p1 = bodyParams(fetchStub.calls[1].args[1] as RequestInit);
  assertEquals(p1.get('client_id'), 'com.rise.app');
  assertEquals(p1.get('token'), 'rt_happy');
  assertEquals(p1.get('token_type_hint'), 'refresh_token');
  assertEquals((p1.get('client_secret') ?? '').length > 0, true);

  clearSecrets();
});

Deno.test('secrets mancanti -> throw, fetch mai chiamata', async (t) => {
  for (const missing of ['APPLE_TEAM_ID', 'APPLE_KEY_ID', 'APPLE_BUNDLE_ID', 'APPLE_PRIVATE_KEY']) {
    await t.step(`manca ${missing}`, async () => {
      setSecrets();
      Deno.env.delete(missing);
      using fetchStub = stub(globalThis, 'fetch', returnsNext([tokenOk({})]));
      await assertRejects(() => revokeAppleViaAuthCode('code'), Error, 'secrets mancanti');
      assertSpyCalls(fetchStub, 0);
    });
  }
  clearSecrets();
});

Deno.test('token exchange non-2xx -> throw, solo 1 fetch', async () => {
  setSecrets();
  using fetchStub = stub(
    globalThis,
    'fetch',
    returnsNext([Promise.resolve(new Response('invalid_grant', { status: 400 }))]),
  );
  const err = await assertRejects(() => revokeAppleViaAuthCode('bad'), Error);
  assertStringIncludes(err.message, 'apple token exchange failed: 400');
  assertStringIncludes(err.message, 'invalid_grant');
  assertSpyCalls(fetchStub, 1);
  assertEquals(fetchStub.calls[0].args[0], `${APPLE}/auth/token`);
  clearSecrets();
});

Deno.test('risposta token senza refresh_token -> throw, solo 1 fetch', async () => {
  setSecrets();
  using fetchStub = stub(
    globalThis,
    'fetch',
    returnsNext([tokenOk({ access_token: 'a', id_token: 'b' })]),
  );
  await assertRejects(() => revokeAppleViaAuthCode('code'), Error, 'nessun refresh_token');
  assertSpyCalls(fetchStub, 1);
  clearSecrets();
});

Deno.test('revoke non-2xx -> throw, 2 fetch', async () => {
  setSecrets();
  using fetchStub = stub(
    globalThis,
    'fetch',
    returnsNext([
      tokenOk({ refresh_token: 'rt_ok' }),
      Promise.resolve(new Response('server_error', { status: 503 })),
    ]),
  );
  const err = await assertRejects(() => revokeAppleViaAuthCode('code'), Error);
  assertStringIncludes(err.message, 'apple revoke failed: 503');
  assertSpyCalls(fetchStub, 2);
  assertEquals(fetchStub.calls[1].args[0], `${APPLE}/auth/revoke`);
  clearSecrets();
});
