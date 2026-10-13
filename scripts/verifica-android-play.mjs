#!/usr/bin/env node
// Verifica in sola lettura i criteri del contratto del goal android-play
// (binding ~/todos/android-play.md, § Contratto negoziato). Uso, dalla radice del repo:
//   node scripts/verifica-android-play.mjs C1 [C2 ...]   oppure   all   oppure   --selftest
// Ogni criterio stampa «Cn PASS» o «Cn FAIL <motivo>»; exit 1 se almeno un FAIL.
// C9 non è qui: il suo VERIFY è `npm run conta-problemi`.
import { criteri as config } from './verifica-android-play/config.mjs';
import { criteri as ambiente } from './verifica-android-play/ambiente.mjs';
import { criteri as app } from './verifica-android-play/app.mjs';
import { criteri as binario } from './verifica-android-play/binario.mjs';
import { criteri as visivo } from './verifica-android-play/visivo.mjs';
import { FIXTURE } from './verifica-android-play/selftest.mjs';

const CRITERI = { ...config, ...ambiente, ...app, ...binario, ...visivo };
const ATTESI = [
  'C1',
  'C2',
  'C3',
  'C4',
  'C5',
  'C6',
  'C7',
  'C8',
  'C10',
  'C11',
  'C12',
  'C13',
  'C14',
  'C15',
  'C16',
  'C17',
  'C18',
  'C19',
  'C20',
  'C21',
];

const esito = async (fn, input) => {
  try {
    return await fn(input);
  } catch (err) {
    return `errore: ${err instanceof Error ? err.message : String(err)}`;
  }
};

const selftest = async () => {
  let coperti = 0;
  let sbagli = 0;
  for (const id of ATTESI) {
    const c = CRITERI[id];
    const f = FIXTURE[id];
    if (!c || !f?.neg?.length) {
      console.log(
        `${id} selftest MANCANTE ${!c ? '(criterio non implementato)' : '(nessuna fixture negativa)'}`
      );
      continue;
    }
    let ok = true;
    for (const [n, input] of f.neg.entries()) {
      if (!(await esito(c.verifica, input))) {
        console.log(`${id} selftest: la fixture negativa #${n + 1} dà PASS`);
        ok = false;
      }
    }
    for (const [n, input] of (f.pos ?? []).entries()) {
      const motivo = await esito(c.verifica, input);
      if (motivo) {
        console.log(
          `${id} selftest: la fixture positiva #${n + 1} dà FAIL (${motivo})`
        );
        sbagli++;
      }
    }
    if (ok) coperti++;
  }
  console.log(
    `selftest: ${coperti}/${ATTESI.length}${sbagli ? ` — ${sbagli} fixture positive in FAIL` : ''}`
  );
  return coperti === ATTESI.length && sbagli === 0;
};

const verifica = async ids => {
  let falliti = 0;
  for (const id of ids) {
    const c = CRITERI[id];
    if (!c) {
      console.log(`${id} FAIL criterio non implementato nello script`);
      falliti++;
      continue;
    }
    let input;
    let motivo;
    try {
      input = await c.leggi();
      motivo = await c.verifica(input);
    } catch (err) {
      motivo = `errore: ${err instanceof Error ? err.message : String(err)}`;
    }
    if (motivo) falliti++;
    console.log(motivo ? `${id} FAIL ${motivo}` : `${id} PASS`);
    if (!motivo && c.nota) console.log(`  nota: ${c.nota(input)}`);
  }
  return falliti === 0;
};

const argomenti = process.argv.slice(2);
const ok = argomenti.includes('--selftest')
  ? await selftest()
  : await verifica(
      argomenti.length === 0 || argomenti.includes('all') ? ATTESI : argomenti
    );
process.exit(ok ? 0 : 1);
