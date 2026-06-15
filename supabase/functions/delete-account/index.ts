// Edge Function: eliminazione immediata dell'account del chiamante (GDPR Art.17).
// Autorizza tramite il JWT della sessione: un utente può cancellare SOLO sé stesso.
// Revoca Apple best-effort (vedi _shared/appleRevoke.ts): non blocca la cancellazione.
// Runtime: Deno (Supabase Edge Functions).

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { revokeAppleViaAuthCode } from '../_shared/appleRevoke.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'unauthorized' }, 401);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Identifica il chiamante dal SUO jwt (cancella solo sé stesso).
  const jwt = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await admin.auth.getUser(jwt);
  if (error || !user) return json({ error: 'unauthorized' }, 401);

  // Body opzionale: { appleAuthCode } per la revoca Apple (re-auth al delete).
  let appleAuthCode: string | undefined;
  try {
    const body = await req.json();
    if (body && typeof body.appleAuthCode === 'string') appleAuthCode = body.appleAuthCode;
  } catch {
    // body assente/non-JSON: ok, nessun authCode.
  }

  // Revoca Apple best-effort: il diritto all'oblio prevale, non blocca mai il delete.
  const isApple = user.identities?.some((i) => i.provider === 'apple') ?? false;
  if (isApple) {
    if (appleAuthCode) {
      try {
        await revokeAppleViaAuthCode(appleAuthCode);
      } catch (e) {
        console.error('[delete-account] revoca Apple fallita (continuo con la cancellazione):', e);
      }
    } else {
      console.warn('[delete-account] utente Apple senza appleAuthCode: revoca saltata');
    }
  }

  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) return json({ error: delErr.message }, 500);

  return json({ ok: true }, 200);
});
