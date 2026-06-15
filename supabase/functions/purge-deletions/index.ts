// Edge Function schedulata (Supabase Cron): hard-delete dei profili la cui
// cancellazione è stata programmata da oltre 30 giorni (grace period scaduto).
// Protetta da un segreto condiviso col Cron (header x-cron-secret).
// Runtime: Deno (Supabase Edge Functions).

import { createClient } from 'jsr:@supabase/supabase-js@2';

const GRACE_DAYS = 30;

Deno.serve(async (req) => {
  // Solo il Cron (che conosce il segreto) può invocarla.
  const secret = req.headers.get('x-cron-secret');
  const expected = Deno.env.get('CRON_SECRET');
  if (!expected || secret !== expected) {
    return new Response('forbidden', { status: 403 });
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const cutoff = new Date(Date.now() - GRACE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await admin
    .from('profiles')
    .select('id')
    .not('deletion_requested_at', 'is', null)
    .lt('deletion_requested_at', cutoff);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let deleted = 0;
  for (const row of data ?? []) {
    const { error: delErr } = await admin.auth.admin.deleteUser(row.id);
    if (delErr) console.error('[purge-deletions] delete fallito', row.id, delErr.message);
    else deleted++;
  }

  return new Response(JSON.stringify({ deleted, scanned: data?.length ?? 0 }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
