// Elenca o registra i client OAuth (chi può usare il login unico) sul progetto di test.
//
//   secret-vault.ps1 run -Names SUPABASE_ACCESS_TOKEN node scripts/progetto-test-ld/client-oauth.mjs
//   secret-vault.ps1 run -Names SUPABASE_ACCESS_TOKEN node scripts/progetto-test-ld/client-oauth.mjs --crea-prova
//
// La chiave segreta del progetto serve all'API di amministrazione: la legge qui dentro dalla
// Management API e non esce dal processo. Si stampano solo dati pubblici (client_id, indirizzi).
// Se esiste già un client con lo stesso nome non se ne crea un secondo.

import { api, REF_TEST } from './api.mjs';

const AUTH = `https://${REF_TEST}.supabase.co/auth/v1`;

// Client NOSTRO per provare il giro prima di LD: pubblico (PKCE, nessun segreto).
// Il campo è `client_name` (RFC 7591, tipi di supabase-js): con `name`, come nell esempio delle
// docs, il server lo scarta in silenzio e il client resta senza nome (visto il 6/11).
const CLIENT_PROVA = {
  client_name: 'Prova Rise',
  redirect_uris: ['http://127.0.0.1:8787/callback'],
  client_type: 'public',
};

async function chiaveSegreta() {
  const chiavi = await api('/api-keys?reveal=true');
  if (!chiavi.ok) throw new Error(`Chiavi illeggibili: HTTP ${chiavi.status}`);
  const segreta = (chiavi.dati ?? []).find(
    k => k.type === 'secret' && k.api_key
  );
  if (!segreta)
    throw new Error(
      'Nessuna chiave segreta (sb_secret_) sul progetto di test.'
    );
  return segreta.api_key;
}

async function admin(chiave, percorso, opzioni = {}) {
  const risposta = await fetch(`${AUTH}/admin${percorso}`, {
    ...opzioni,
    headers: {
      apikey: chiave,
      Authorization: `Bearer ${chiave}`,
      'Content-Type': 'application/json',
    },
  });
  const testo = await risposta.text();
  return {
    status: risposta.status,
    ok: risposta.ok,
    dati: testo ? JSON.parse(testo) : null,
  };
}

function pubblico(c) {
  return `${c.client_name} · ${c.client_type} · client_id=${c.client_id} · ritorno=${(c.redirect_uris ?? []).join(' ')}`;
}

const chiave = await chiaveSegreta();
const elenco = await admin(chiave, '/oauth/clients');
if (!elenco.ok) {
  console.error(`Elenco client rifiutato: HTTP ${elenco.status}`, elenco.dati);
  process.exit(1);
}
// Con zero client il server risponde 200 con corpo vuoto (visto il 6/11): elenco vuoto.
const vuoto = elenco.dati === null || Object.keys(elenco.dati).length === 0;
const clienti = vuoto
  ? []
  : Array.isArray(elenco.dati)
    ? elenco.dati
    : elenco.dati.clients;
if (!Array.isArray(clienti)) {
  console.error(
    `Forma inattesa (HTTP ${elenco.status}, ${typeof elenco.dati}), chiavi:`,
    Object.keys(elenco.dati ?? {})
  );
  process.exit(1);
}
console.log(`Client registrati: ${clienti.length}`);
clienti.forEach(c => console.log(`  - ${pubblico(c)}`));

if (!process.argv.includes('--crea-prova')) process.exit(0);
// Stesso client = stesso nome o stessi indirizzi di ritorno: si allinea il nome, non se ne crea un altro.
const uguali = (a, b) =>
  JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const esistente = clienti.find(
  c =>
    c.client_name === CLIENT_PROVA.client_name ||
    uguali(c.redirect_uris ?? [], CLIENT_PROVA.redirect_uris)
);
if (esistente) {
  if (esistente.client_name === CLIENT_PROVA.client_name) {
    console.log(`«${CLIENT_PROVA.client_name}» esiste già: niente da fare.`);
    process.exit(0);
  }
  const allineato = await admin(
    chiave,
    `/oauth/clients/${esistente.client_id}`,
    {
      method: 'PUT',
      body: JSON.stringify({ client_name: CLIENT_PROVA.client_name }),
    }
  );
  if (!allineato.ok) {
    console.error(
      `Allineamento rifiutato: HTTP ${allineato.status}`,
      allineato.dati
    );
    process.exit(1);
  }
  console.log(`Allineato: ${pubblico(allineato.dati)}`);
  process.exit(0);
}
const creato = await admin(chiave, '/oauth/clients', {
  method: 'POST',
  body: JSON.stringify(CLIENT_PROVA),
});
if (!creato.ok) {
  console.error(`Creazione rifiutata: HTTP ${creato.status}`, creato.dati);
  process.exit(1);
}
console.log(`Creato: ${pubblico(creato.dati)}`);
