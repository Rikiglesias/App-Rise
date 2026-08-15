// Edge Function: eliminazione immediata dell'account del chiamante (GDPR Art.17).
// Autorizza tramite il JWT della sessione: un utente può cancellare SOLO sé stesso.
// Runtime: Deno (Supabase Edge Functions).
//
// La revoca dei token Apple è stata RIMOSSA insieme al login social (decisione
// 2026-07-26, «email+password unico ingresso»): senza provider Apple non esiste un
// token da revocare, e la Apple Review 5.1.1(v) si applica solo a chi offre Sign in
// with Apple. Se un giorno il provider tornasse, va ripristinata insieme a esso —
// non è un dettaglio opzionale, è un requisito di pubblicazione.

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

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

// Seam di dependency-injection: i default replicano 1:1 il comportamento di produzione,
// i test iniettano fake (nessuna rete, nessun client reale). createAdmin è lazy →
// il client viene creato SOLO dopo le guard, come nella versione originale.
export interface Deps {
  createAdmin: () => SupabaseClient;
}

function defaultAdmin(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}

const DEFAULT_DEPS: Deps = { createAdmin: defaultAdmin };

export async function handler(
  req: Request,
  deps: Deps = DEFAULT_DEPS
): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'unauthorized' }, 401);

  const admin = deps.createAdmin();

  // Identifica il chiamante dal SUO jwt (cancella solo sé stesso).
  const jwt = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error,
  } = await admin.auth.getUser(jwt);
  if (error || !user) return json({ error: 'unauthorized' }, 401);

  // Nessun body richiesto: la cancellazione si decide dal solo JWT. Un body
  // eventualmente inviato da una versione VECCHIA dell'app (che mandava
  // { appleAuthCode }) viene semplicemente ignorato — non deve far fallire il
  // diritto all'oblio di chi non ha ancora aggiornato.

  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) return json({ error: delErr.message }, 500);

  return json({ ok: true }, 200);
}

Deno.serve(req => handler(req));
