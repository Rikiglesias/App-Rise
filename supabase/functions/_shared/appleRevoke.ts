// Revoca Sign in with Apple alla cancellazione account (GDPR + App Store 5.1.1(v)).
//
// Finding (2026-06-15, triangolato): con `signInWithIdToken` (login nativo, M2)
// Supabase NON persiste il refresh-token Apple (supabase/auth #2155, #1308).
// Pattern adottato: re-auth al delete → il client fornisce un `authorizationCode`
// fresco, che qui scambiamo per un refresh-token Apple e poi revochiamo.
// Data minimization: nessun token Apple viene mai persistito.
//
// Secrets richiesti (Supabase Edge Function secrets):
//   APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_BUNDLE_ID, APPLE_PRIVATE_KEY (.p8 PKCS8)
//
// Runtime: Deno (Supabase Edge Functions). Non fa parte del bundle dell'app RN.

import { importPKCS8, SignJWT } from 'npm:jose@5';

const APPLE_BASE = 'https://appleid.apple.com';

/** Client secret = JWT ES256 firmato con la chiave privata Apple (.p8). */
async function buildClientSecret(): Promise<string> {
  const teamId = Deno.env.get('APPLE_TEAM_ID');
  const keyId = Deno.env.get('APPLE_KEY_ID');
  const bundleId = Deno.env.get('APPLE_BUNDLE_ID');
  const privateKeyP8 = Deno.env.get('APPLE_PRIVATE_KEY');
  if (!teamId || !keyId || !bundleId || !privateKeyP8) {
    throw new Error('Apple revoke: secrets mancanti (APPLE_TEAM_ID/KEY_ID/BUNDLE_ID/PRIVATE_KEY)');
  }
  const key = await importPKCS8(privateKeyP8, 'ES256');
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt(now)
    .setExpirationTime(now + 300) // max 6 mesi lato Apple; 5 min è sufficiente
    .setAudience(APPLE_BASE)
    .setSubject(bundleId)
    .sign(key);
}

/**
 * Scambia un authorizationCode Apple fresco per un refresh-token e lo revoca.
 * Throw su qualsiasi errore: il caller (delete-account) gestisce best-effort.
 */
export async function revokeAppleViaAuthCode(authCode: string): Promise<void> {
  const bundleId = Deno.env.get('APPLE_BUNDLE_ID')!;
  const clientSecret = await buildClientSecret();

  // 1) authorizationCode -> refresh_token
  const tokenRes = await fetch(`${APPLE_BASE}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    signal: AbortSignal.timeout(10_000),
    body: new URLSearchParams({
      client_id: bundleId,
      client_secret: clientSecret,
      code: authCode,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`apple token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`);
  }
  const { refresh_token: refreshToken } = await tokenRes.json();
  if (!refreshToken) throw new Error('apple token exchange: nessun refresh_token nella risposta');

  // 2) revoca del refresh_token
  const revokeRes = await fetch(`${APPLE_BASE}/auth/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    signal: AbortSignal.timeout(10_000),
    body: new URLSearchParams({
      client_id: bundleId,
      client_secret: clientSecret,
      token: refreshToken,
      token_type_hint: 'refresh_token',
    }),
  });
  if (!revokeRes.ok) {
    throw new Error(`apple revoke failed: ${revokeRes.status} ${await revokeRes.text()}`);
  }
}
