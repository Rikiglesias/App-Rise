// Edge Function schedulata (Supabase Cron): hard-delete dei profili la cui
// cancellazione è stata programmata da oltre 30 giorni (grace period scaduto).
// Protetta da un segreto condiviso col Cron (header x-cron-secret).
// Runtime: Deno (Supabase Edge Functions).

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { timingSafeEqual } from 'jsr:@std/crypto@1/timing-safe-equal';

const GRACE_DAYS = 30;
const enc = new TextEncoder();

// S5: confronto del segreto a tempo costante. Si confrontano i digest SHA-256
// (sempre 32 byte) → niente early-exit né leak della lunghezza del segreto, e
// timingSafeEqual non lancia su input di lunghezza diversa. È la primitiva
// canonica Deno (no Buffer-only di node:crypto, che ha avuto bug in Deno).
export async function timingSafeCompare(
  a: string,
  b: string,
): Promise<boolean> {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  return timingSafeEqual(new Uint8Array(ha), new Uint8Array(hb));
}

export interface PurgeFailure {
  id: string;
  message: string;
}

export interface PurgeDeps {
  adminFactory?: () => SupabaseClient | null;
  alert?: (info: {
    reason: string;
    failed: number;
    failures: PurgeFailure[];
  }) => Promise<void>;
  now?: () => number;
}

// S9: alert attivabile (GDPR Art.17 accountability) — non solo console.error, che
// lascerebbe dati oltre i 30gg senza segnalazione. Default: POST a PURGE_ALERT_WEBHOOK
// (integrabile con Telegram/Slack/PagerDuty), fallback su console.error se non configurato.
async function defaultAlert(info: {
  reason: string;
  failed: number;
  failures: PurgeFailure[];
}): Promise<void> {
  const url = Deno.env.get('PURGE_ALERT_WEBHOOK');
  if (!url) {
    console.error('[purge-deletions] ALERT', JSON.stringify(info));
    return;
  }
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({ source: 'purge-deletions', ...info }),
    });
  } catch (e) {
    console.error('[purge-deletions] invio alert fallito', e);
  }
}

function readAdminKey(): string | null {
  if (!Deno.env.has('SUPABASE_SECRET_KEYS')) {
    console.error('[purge-deletions] SUPABASE_SECRET_KEYS: variabile assente');
    return null;
  }
  let keys: unknown;
  try {
    keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')!);
  } catch {
    console.error('[purge-deletions] SUPABASE_SECRET_KEYS: JSON non valido');
    return null;
  }
  if (
    typeof keys !== 'object' || keys === null || Array.isArray(keys) ||
    !('default' in keys) || typeof keys.default !== 'string' || !keys.default.trim()
  ) {
    console.error('[purge-deletions] SUPABASE_SECRET_KEYS: default assente o non valida');
    return null;
  }
  return keys.default;
}

function defaultAdmin(): SupabaseClient | null {
  const key = readAdminKey();
  if (!key) return null;
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    key,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}

export async function handler(
  req: Request,
  deps: PurgeDeps = {},
): Promise<Response> {
  const adminFactory = deps.adminFactory ?? defaultAdmin;
  const alert = deps.alert ?? defaultAlert;
  const now = deps.now ?? Date.now;

  // Solo il Cron (che conosce il segreto) può invocarla.
  const secret = req.headers.get('x-cron-secret');
  const expected = Deno.env.get('CRON_SECRET');
  // S5: nessun !== sul valore. Presenza (env/header) gattata prima del confronto.
  if (!expected || !secret || !(await timingSafeCompare(secret, expected))) {
    return new Response('forbidden', { status: 403 });
  }

  const admin = adminFactory();
  if (!admin) {
    return new Response(JSON.stringify({ error: 'server_misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cutoff = new Date(
    now() - GRACE_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { data, error } = await admin
    .from('profiles')
    .select('id')
    .not('deletion_requested_at', 'is', null)
    .lt('deletion_requested_at', cutoff);
  if (error) {
    console.error('[purge-deletions] query fallita', error.message);
    await alert({
      reason: 'query_failed',
      failed: 0,
      failures: [{ id: '-', message: error.message }],
    });
    return new Response(JSON.stringify({ error: 'query_failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let deleted = 0;
  const failures: PurgeFailure[] = [];
  for (const row of data ?? []) {
    const { error: delErr } = await admin.auth.admin.deleteUser(row.id);
    if (delErr) {
      console.error('[purge-deletions] delete fallito', row.id, delErr.message);
      failures.push({ id: row.id, message: delErr.message });
    } else deleted++;
  }
  // S9: fallimenti parziali → alert attivabile, non solo log. Il cron resta 200 per
  // non perdere il progresso (i delete riusciti restano applicati) né ritentare tutto.
  if (failures.length) {
    await alert({ reason: 'delete_failed', failed: failures.length, failures });
  }

  return new Response(
    JSON.stringify({
      deleted,
      scanned: data?.length ?? 0,
      failed: failures.length,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}

Deno.serve((req) => handler(req));
