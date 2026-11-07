// Elenca o registra i client OAuth (chi può usare il login unico) sul progetto di test.
//
//   secret-vault.ps1 run -Names SUPABASE_ACCESS_TOKEN node scripts/progetto-test-ld/client-oauth.mjs
//   secret-vault.ps1 run -Names SUPABASE_ACCESS_TOKEN node scripts/progetto-test-ld/client-oauth.mjs --crea-prova
//   secret-vault.ps1 run -Names SUPABASE_ACCESS_TOKEN node scripts/progetto-test-ld/client-oauth.mjs --crea-strumenti
//   secret-vault.ps1 run -Names SUPABASE_ACCESS_TOKEN node scripts/progetto-test-ld/client-oauth.mjs --crea-riservato "<nome>" <uri> [<uri>…] --segreto-in <file fuori dal repo>
//
// La chiave segreta del progetto serve all'API di amministrazione: la legge qui dentro dalla
// Management API e non esce dal processo. Si stampano solo dati pubblici (client_id, indirizzi).
// Se esiste già un client con lo stesso nome non se ne crea un secondo.
//
// Client RISERVATO (client_secret_basic, il tipo che userà Let's Donation): il segreto il server
// lo mostra UNA volta sola. Va SOLO nel file indicato (valore nudo, senza a capo), da importare
// subito nel vault e cancellare: `secret-vault.ps1 import-file <file> -As <NOME>`.

import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

// Client per il partner, da usare SUBITO con strumenti standard, prima che il suo client
// abbia indirizzi registrati: pubblico (PKCE, nessun segreto da consegnare), ritorno sugli
// indirizzi fissi di OIDC Debugger e di Postman (app desktop e «Authorize using browser»,
// docs Postman «OAuth 2.0»). Solo sul progetto di test: in produzione mai ritorni di terzi.
const CLIENT_STRUMENTI = {
  client_name: 'Strumenti di prova (OIDC Debugger, Postman)',
  redirect_uris: [
    'https://oidcdebugger.com/debug',
    'https://oauth.pstmn.io/v1/callback',
    'https://oauth.pstmn.io/v1/browser-callback',
  ],
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
  return `${c.client_name} · ${c.client_type} · ${c.token_endpoint_auth_method ?? '?'} · client_id=${c.client_id} · ritorno=${(c.redirect_uris ?? []).join(' ')}`;
}

const uguali = (a, b) =>
  JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

function argomentiRiservato() {
  const args = process.argv.slice(2);
  const i = args.indexOf('--crea-riservato');
  const nome = args[i + 1];
  const uri = [];
  for (const a of args.slice(i + 2)) {
    if (a.startsWith('--')) break;
    uri.push(a);
  }
  const j = args.indexOf('--segreto-in');
  const file = j >= 0 ? args[j + 1] : undefined;
  const radiceRepo = fileURLToPath(new URL('../../', import.meta.url));
  const errori = [];
  if (!nome || nome.startsWith('--')) errori.push('manca il nome del client');
  if (!uri.length) errori.push('manca almeno un indirizzo di ritorno');
  for (const u of uri) {
    // Il server accetta solo corrispondenze esatte, niente jolly: un * qui è un errore di chi scrive.
    if (u.includes('*') || !URL.canParse(u))
      errori.push(`indirizzo non valido: ${u}`);
  }
  if (
    !file ||
    resolve(file).toLowerCase().startsWith(resolve(radiceRepo).toLowerCase())
  )
    errori.push(
      'serve --segreto-in <file> FUORI dal repo (il segreto non deve poter finire in un commit)'
    );
  else if (existsSync(file))
    errori.push(`il file ${file} esiste già: non lo sovrascrivo`);
  if (errori.length) {
    console.error(`Client riservato non creato: ${errori.join('; ')}.`);
    process.exit(1);
  }
  return { nome, uri, file };
}

async function creaRiservato(chiave, clienti) {
  const { nome, uri, file } = argomentiRiservato();
  const conNome = clienti.find(c => c.client_name === nome);
  if (conNome) {
    console.log(
      `«${nome}» esiste già (${pubblico(conNome)}): il segreto non si rilegge; per averne uno nuovo va rigenerato dal pannello (OAuth Apps).`
    );
    return;
  }
  const conUri = clienti.find(c => uguali(c.redirect_uris ?? [], uri));
  if (conUri) {
    console.error(
      `Gli stessi indirizzi li ha già «${conUri.client_name}»: non lo tocco, scegli altri indirizzi o un altro nome.`
    );
    process.exit(1);
  }
  const creato = await admin(chiave, '/oauth/clients', {
    method: 'POST',
    body: JSON.stringify({
      client_name: nome,
      redirect_uris: uri,
      client_type: 'confidential',
      token_endpoint_auth_method: 'client_secret_basic',
    }),
  });
  if (!creato.ok) {
    console.error(`Creazione rifiutata: HTTP ${creato.status}`, creato.dati);
    process.exit(1);
  }
  console.log(`Creato: ${pubblico(creato.dati)}`);
  const segreto = creato.dati?.client_secret;
  if (!segreto) {
    console.error(
      'Il server non ha restituito client_secret: rigeneralo dal pannello o cancella il client.'
    );
    process.exit(1);
  }
  writeFileSync(file, segreto, { encoding: 'utf8', mode: 0o600, flag: 'wx' });
  console.log(
    `Segreto (${segreto.length} caratteri) nel file indicato: importalo nel vault e cancella il file.`
  );
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

if (process.argv.includes('--crea-riservato')) {
  await creaRiservato(chiave, clienti);
  process.exit(0);
}
// Client pubblico definito qui sopra. Stesso client = stesso nome o stessi indirizzi di
// ritorno: si allinea il nome, non se ne crea un altro.
async function creaFisso(chiave, clienti, definizione) {
  const esistente = clienti.find(
    c =>
      c.client_name === definizione.client_name ||
      uguali(c.redirect_uris ?? [], definizione.redirect_uris)
  );
  if (esistente?.client_name === definizione.client_name) {
    console.log(`«${definizione.client_name}» esiste già: niente da fare.`);
    return;
  }
  const risposta = esistente
    ? await admin(chiave, `/oauth/clients/${esistente.client_id}`, {
        method: 'PUT',
        body: JSON.stringify({ client_name: definizione.client_name }),
      })
    : await admin(chiave, '/oauth/clients', {
        method: 'POST',
        body: JSON.stringify(definizione),
      });
  if (!risposta.ok) {
    console.error(
      `${esistente ? 'Allineamento' : 'Creazione'} rifiutata: HTTP ${risposta.status}`,
      risposta.dati
    );
    process.exit(1);
  }
  console.log(
    `${esistente ? 'Allineato' : 'Creato'}: ${pubblico(risposta.dati)}`
  );
}

if (process.argv.includes('--crea-prova'))
  await creaFisso(chiave, clienti, CLIENT_PROVA);
else if (process.argv.includes('--crea-strumenti'))
  await creaFisso(chiave, clienti, CLIENT_STRUMENTI);
