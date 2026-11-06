// Edge Function SOLO DI TEST — progetto `app-rise-test-ld` (goal ld-ambiente-test).
//
// Perché esiste: nell'app il cambio email vale solo dopo il clic sul link mandato per posta
// (`supabase/auth` internal/api/user.go: l'autoconferma vale solo per gli utenti anonimi), e
// sul progetto di test l'SMTP di base consegna solo agli indirizzi del team. Il partner che
// prova il login unico non riceverebbe mai il link. Questa funzione fa la parte del clic: cambia
// l'email del SOLO utente del token, già confermata, così il partner vede al login successivo
// cosa gli arriva (stesso `sub`, `email` nuova, `contact_email` riallineata dal trigger 0013).
//
// 🔴 NON va mai pubblicata in produzione: là toglierebbe la verifica della casella nuova
// (furto di indirizzi, `email_verified` falso verso i partner). Per questo:
//   - vive fuori da `supabase/functions/`, che è ciò che la CLI pubblica;
//   - si rifiuta di lavorare se non gira sul progetto di test (ref fisso);
//   - si pubblica solo sul test, con verify_jwt=false come delete-account (chiavi ES256):
//     l'autorizzazione è `auth.getUser(jwt)` qui sotto.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const REF_TEST = 'khsojmjopyoadtbjnarw';

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

// Stessa lettura della chiave di delete-account.
function chiaveAdmin(): string | null {
  try {
    const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '');
    return typeof keys?.default === 'string' && keys.default.trim()
      ? keys.default
      : null;
  } catch {
    return null;
  }
}

// Il payload del token, già verificato da getUser: serve solo a riconoscere i token OAuth.
function payload(jwt: string): Record<string, unknown> | null {
  try {
    const parte = jwt.split('.')[1] ?? '';
    const base64 = parte.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
    );
  } catch {
    return null;
  }
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  if (!url.includes(`${REF_TEST}.`))
    return json({ error: 'solo_ambiente_di_test' }, 403);

  const jwt = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
  if (!jwt) return json({ error: 'unauthorized' }, 401);

  const chiave = chiaveAdmin();
  if (!chiave) return json({ error: 'server_misconfigured' }, 500);
  const admin = createClient(url, chiave, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error,
  } = await admin.auth.getUser(jwt);
  if (error || !user) return json({ error: 'unauthorized' }, 401);

  // Un token rilasciato a un partner col login unico porta `client_id`: il partner non
  // cambia l'email della persona, la cambia solo lei dalla sua sessione.
  const claims = payload(jwt);
  if (!claims || 'client_id' in claims)
    return json({ error: 'token_di_partner' }, 403);

  let email: unknown;
  try {
    ({ email } = await req.json());
  } catch {
    return json({ error: 'body_non_valido' }, 400);
  }
  const nuova = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuova)) {
    return json({ error: 'email_non_valida' }, 400);
  }

  // Su un'email già usata l'API admin risponde 500 generico (vincolo unico del database),
  // mentre l'app riceve `email_exists` (422): lo si controlla prima, come fa il percorso
  // dell'utente. `filter` cerca con LIKE, quindi il confronto finale è esatto.
  const elenco = await fetch(
    `${url}/auth/v1/admin/users?filter=${encodeURIComponent(nuova)}&per_page=50`,
    { headers: { apikey: chiave, Authorization: `Bearer ${chiave}` } }
  );
  if (!elenco.ok) return json({ error: 'controllo_non_riuscito' }, 502);
  const { users = [] } = (await elenco.json()) as {
    users?: { id: string; email?: string }[];
  };
  if (users.some(u => u.email?.toLowerCase() === nuova && u.id !== user.id)) {
    return json({ error: 'email_exists' }, 422);
  }

  const { data, error: errore } = await admin.auth.admin.updateUserById(
    user.id,
    {
      email: nuova,
      email_confirm: true,
    }
  );
  if (errore) {
    const stato = errore.status && errore.status >= 400 ? errore.status : 400;
    return json(
      { error: errore.code ?? 'update_failed', message: errore.message },
      stato
    );
  }
  return json({ ok: true, email: data.user.email }, 200);
});
