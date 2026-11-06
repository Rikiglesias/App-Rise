// Applica al progetto di test le migration di supabase/migrations che non ci sono ancora.
//
// Legge i file dal disco (mai SQL ricopiato a mano), in ordine di nome, e salta quelle già
// nella storia del progetto (confronto sul nome, che è lo stesso usato in produzione).
// Ogni migration gira nell'endpoint delle migration: se fallisce viene annullata per intero
// e lo script si ferma lì, senza provare le successive.
//
//   secret-vault.ps1 run -Names SUPABASE_ACCESS_TOKEN node scripts/progetto-test-ld/applica-migration.mjs [--prova]
//
// --prova: elenca cosa applicherebbe, senza scrivere niente.

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { api } from './api.mjs';

const CARTELLA = fileURLToPath(
  new URL('../../supabase/migrations/', import.meta.url)
);
const soloProva = process.argv.includes('--prova');

const storia = await api('/database/migrations');
if (!storia.ok) {
  console.error(
    `Storia delle migration illeggibile: HTTP ${storia.status}`,
    storia.dati
  );
  process.exit(1);
}
const giaApplicate = new Set((storia.dati ?? []).map(m => m.name));

const file = readdirSync(CARTELLA)
  .filter(nome => /^\d{4}_.+\.sql$/.test(nome))
  .sort();
const daApplicare = file.filter(
  nome => !giaApplicate.has(nome.replace(/\.sql$/, ''))
);

console.log(
  `Nel repo: ${file.length} · già sul test: ${giaApplicate.size} · da applicare: ${daApplicare.length}`
);
if (soloProva) {
  daApplicare.forEach(nome => console.log(`  - ${nome}`));
  process.exit(0);
}

// La versione registrata è un timestamp al secondo: due migration nello stesso secondo
// collidono sulla chiave della storia (visto il 6/11, la seconda viene annullata).
const PAUSA_MS = 1500;

for (const [indice, nome] of daApplicare.entries()) {
  if (indice > 0) await new Promise(fine => setTimeout(fine, PAUSA_MS));
  const query = readFileSync(join(CARTELLA, nome), 'utf8');
  const impronta = createHash('sha256')
    .update(query)
    .digest('hex')
    .slice(0, 16);
  const esito = await api('/database/migrations', {
    method: 'POST',
    body: { name: nome.replace(/\.sql$/, ''), query },
    headers: { 'Idempotency-Key': `${nome}-${impronta}` },
  });
  if (!esito.ok) {
    console.error(`FALLITA ${nome}: HTTP ${esito.status}`);
    console.error(
      typeof esito.dati === 'string'
        ? esito.dati
        : JSON.stringify(esito.dati, null, 2)
    );
    process.exit(1);
  }
  console.log(`ok ${nome}`);
}

const dopo = await api('/database/migrations');
console.log(`Storia dopo: ${(dopo.dati ?? []).length} migration`);
