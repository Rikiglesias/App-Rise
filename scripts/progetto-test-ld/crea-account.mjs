// Crea i 10 account di prova per Let's Donation sul progetto di test, dal VERO percorso di
// registrazione: lo stesso signUp dell'app (chiave pubblica, stessi metadati di
// src/shared/auth/useEmailConfirmation.ts), quindi profilo e consensi li scrivono i trigger veri.
//
//   LD_TEST_CASELLA=<casella> secret-vault.ps1 run -Names SUPABASE_ACCESS_TOKEN node scripts/progetto-test-ld/crea-account.mjs --password-in <file fuori dal repo>
//
// Le password nuove vanno SOLO nel file indicato (JSON email → password), da importare subito nel
// vault e cancellare: `secret-vault.ps1 import-file <file> -As LD_TEST_ACCOUNT_PASSWORDS`.
// Un account che esiste già non viene toccato (lo script si può rilanciare).

import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { api, REF_TEST } from './api.mjs';

const AUTH = `https://${REF_TEST}.supabase.co/auth/v1`;
// La casella vera NON sta nel codice (repo pubblico): LD_TEST_CASELLA=nome@dominio, gli account
// diventano nome+ld01@dominio … nome+ld10@dominio.
const [utente, dominio] = (process.env.LD_TEST_CASELLA ?? '').split('@');
if (!utente || !dominio) {
  console.error(
    'Manca LD_TEST_CASELLA (es. nome@gmail.com): da lì nascono i 10 indirizzi col «+».'
  );
  process.exit(1);
}
const CASELLA = n => `${utente}+ld${String(n).padStart(2, '0')}@${dominio}`;

// Matrice del binding ~/todos/ld-ambiente-test.md § F3d. Persone inventate.
const adulto = '1990-04-12';
const MATRICE = [
  {
    n: 1,
    caso: 'completo, email assente da LD',
    first_name: 'Anna',
    last_name: 'Prova',
    nickname: 'anna_prova01',
  },
  { n: 2, caso: 'senza nickname', first_name: 'Bruno', last_name: 'Prova' },
  {
    n: 3,
    caso: 'LD la inserisce come già iscritta Rise',
    first_name: 'Carla',
    last_name: 'Prova',
    nickname: 'carla_prova03',
  },
  {
    n: 4,
    caso: 'LD la inserisce come iscritta a un’altra organizzazione',
    first_name: 'Dario',
    last_name: 'Prova',
    nickname: 'dario_prova04',
  },
  {
    n: 5,
    caso: 'cambio email',
    first_name: 'Elena',
    last_name: 'Prova',
    nickname: 'elena_prova05',
  },
  {
    n: 6,
    caso: 'cambio nome, cognome, nickname e nickname tolto',
    first_name: 'Fabio',
    last_name: 'Prova',
    nickname: 'fabio_prova06',
  },
  {
    n: 7,
    caso: 'rifiuta il consenso («Non ora»)',
    first_name: 'Giulia',
    last_name: 'Prova',
    nickname: 'giulia_prova07',
  },
  {
    n: 8,
    caso: 'età 14-17',
    first_name: 'Luca',
    last_name: 'Prova',
    nickname: 'luca_prova08',
    birth_date: '2010-06-01',
  },
  {
    n: 9,
    caso: 'cancellazione account durante il test',
    first_name: 'Marta',
    last_name: 'Prova',
    nickname: 'marta_prova09',
  },
  {
    n: 10,
    caso: 'paese estero',
    first_name: 'Nadia',
    last_name: 'Prova',
    nickname: 'nadia_prova10',
    country: 'CH',
    marketing: true,
  },
];

function argomento(nome) {
  const i = process.argv.indexOf(nome);
  return i > 0 ? process.argv[i + 1] : undefined;
}

// Regola dell'app (validatePassword): almeno 8, una maiuscola, un carattere speciale.
function password() {
  return `${randomBytes(15).toString('base64url')}A9!`;
}

async function chiavi() {
  const r = await api('/api-keys?reveal=true');
  if (!r.ok) throw new Error(`Chiavi illeggibili: HTTP ${r.status}`);
  const trova = tipo =>
    (r.dati ?? []).find(k => k.type === tipo && k.api_key)?.api_key;
  const pubblica = trova('publishable');
  const segreta = trova('secret');
  if (!pubblica || !segreta)
    throw new Error(
      'Mancano la chiave pubblica o quella segreta sul progetto di test.'
    );
  return { pubblica, segreta };
}

async function emailEsistenti(segreta) {
  const r = await fetch(`${AUTH}/admin/users?per_page=200`, {
    headers: { apikey: segreta, Authorization: `Bearer ${segreta}` },
  });
  if (!r.ok) throw new Error(`Elenco utenti rifiutato: HTTP ${r.status}`);
  const { users = [] } = await r.json();
  return new Set(users.map(u => u.email));
}

const fileUscita = argomento('--password-in');
const radiceRepo = fileURLToPath(new URL('../../', import.meta.url));
if (
  !fileUscita ||
  resolve(fileUscita)
    .toLowerCase()
    .startsWith(resolve(radiceRepo).toLowerCase())
) {
  console.error(
    'Serve --password-in <file> FUORI dal repo (le password non devono poter finire in un commit).'
  );
  process.exit(1);
}

const { pubblica, segreta } = await chiavi();
const esistenti = await emailEsistenti(segreta);
const nuove = {};

for (const p of MATRICE) {
  const email = CASELLA(p.n);
  if (esistenti.has(email)) {
    console.log(`= ld${String(p.n).padStart(2, '0')} esiste già (${p.caso})`);
    continue;
  }
  const data = {
    name: `${p.first_name} ${p.last_name}`,
    ...(p.nickname ? { preferred_username: p.nickname } : {}),
    first_name: p.first_name,
    last_name: p.last_name,
    country: p.country ?? 'IT',
    birth_date: p.birth_date ?? adulto,
    marketing_consent: p.marketing ?? false,
  };
  const segretoNuovo = password();
  const r = await fetch(`${AUTH}/signup`, {
    method: 'POST',
    headers: { apikey: pubblica, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: segretoNuovo, data }),
  });
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error(
      `FALLITO ld${String(p.n).padStart(2, '0')}: HTTP ${r.status} ${corpo.msg ?? corpo.message ?? ''}`
    );
    process.exitCode = 1;
    continue;
  }
  nuove[email] = segretoNuovo;
  console.log(
    `+ ld${String(p.n).padStart(2, '0')} creato, sessione ${corpo.access_token ? 'sì' : 'no'} (${p.caso})`
  );
}

if (Object.keys(nuove).length) {
  writeFileSync(fileUscita, JSON.stringify(nuove, null, 2), {
    encoding: 'utf8',
    mode: 0o600,
  });
  console.log(
    `${Object.keys(nuove).length} password nel file indicato: importale nel vault e cancella il file.`
  );
}
