// Accesso alla Management API di Supabase SOLO per il progetto di test di Let's Donation.
//
// Il token (SUPABASE_ACCESS_TOKEN) vale per tutto l'account, produzione compresa: la
// separazione la fa questo file. Il ref è fisso e qualunque richiesta che nomini il
// progetto di produzione si ferma prima di partire.
//
// Uso: ~/.claude/scripts/secret-vault.ps1 run -Names SUPABASE_ACCESS_TOKEN node <script>
// (il token entra solo nel processo figlio, non viene mai stampato).

export const REF_TEST = 'khsojmjopyoadtbjnarw';
const REF_PRODUZIONE = 'yrsilvbuqhohgznpdles';
const BASE = 'https://api.supabase.com/v1';

function token() {
  const valore = process.env.SUPABASE_ACCESS_TOKEN;
  if (!valore) {
    console.error(
      'Manca SUPABASE_ACCESS_TOKEN. Lancia con: secret-vault.ps1 run -Names SUPABASE_ACCESS_TOKEN node <script>'
    );
    process.exit(1);
  }
  return valore;
}

/**
 * Chiama `/v1/projects/<ref di test><percorso>`. Si rifiuta di partire se il percorso o il
 * corpo nominano la produzione: un errore di copia non deve mai arrivare al database vero.
 */
export async function api(
  percorso,
  { method = 'GET', body, headers = {} } = {}
) {
  const corpo = body === undefined ? undefined : JSON.stringify(body);
  if (
    percorso.includes(REF_PRODUZIONE) ||
    (corpo ?? '').includes(REF_PRODUZIONE)
  ) {
    throw new Error('Richiesta verso il progetto di PRODUZIONE bloccata.');
  }
  const url = `${BASE}/projects/${REF_TEST}${percorso}`;
  const risposta = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token()}`,
      ...(corpo === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: corpo,
  });
  const testo = await risposta.text();
  return { status: risposta.status, ok: risposta.ok, dati: leggiCorpo(testo) };
}

// Corpo vuoto → null; JSON → oggetto; altro (pagina d'errore, testo) → il testo così com'è,
// perché il chiamante lo stampi invece di perderlo.
function leggiCorpo(testo) {
  if (!testo) return null;
  try {
    return JSON.parse(testo);
  } catch {
    return testo;
  }
}
