#!/usr/bin/env node
// Verifica in sola lettura i criteri del contratto del goal android-play
// (binding ~/todos/android-play.md, § Contratto negoziato). Uso, dalla radice del repo:
//   node scripts/verifica-android-play.mjs C1 [C2 ...]   oppure   all   oppure   --selftest
//   node scripts/verifica-android-play.mjs --controprova C23 [C24 ...]   (registra la controprova)
// Ogni criterio stampa «Cn PASS» o «Cn FAIL <motivo>»; exit 1 se almeno un FAIL.
// C9 non è qui: il suo VERIFY è `npm run conta-problemi`.
import { criteri as config } from './verifica-android-play/config.mjs';
import { criteri as ambiente } from './verifica-android-play/ambiente.mjs';
import { criteri as app } from './verifica-android-play/app.mjs';
import { criteri as binario } from './verifica-android-play/binario.mjs';
import { criteri as aab } from './verifica-android-play/aab.mjs';
import { criteri as link } from './verifica-android-play/link.mjs';
import { criteri as visivo } from './verifica-android-play/visivo.mjs';
import { criteri as documenti } from './verifica-android-play/documenti.mjs';
import { criteri as rilascio } from './verifica-android-play/documenti-rilascio.mjs';
import { criteri as cancellazione } from './verifica-android-play/documenti-cancellazione.mjs';
import { criteri as informativa } from './verifica-android-play/documenti-informativa.mjs';
import { criteri as play } from './verifica-android-play/documenti-play.mjs';
import {
  DEFINIZIONI as DEFINIZIONI_CODICE,
  criteri as codice,
} from './verifica-android-play/codice.mjs';
import { registraControprove } from './verifica-android-play/titoli-jest.mjs';
import { FIXTURE } from './verifica-android-play/selftest.mjs';

const CRITERI = {
  ...config,
  ...ambiente,
  ...app,
  ...binario,
  ...aab,
  ...link,
  ...visivo,
  ...documenti,
  ...rilascio,
  ...cancellazione,
  ...informativa,
  ...play,
  ...codice,
};
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
  'C23',
  'C24',
  'C25',
  'C27',
  'C28',
  'C29',
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

// Solo i titoli non di guardia entrano nella controprova (regole comuni R10).
const controprova = ids => {
  const ignoti = ids.filter(id => !DEFINIZIONI_CODICE[id]);
  if (ignoti.length || ids.length === 0) {
    console.log(
      `controprova: criteri senza titoli Jest: ${ignoti.join(', ') || '(nessuno indicato)'}`
    );
    return false;
  }
  for (const r of registraControprove(
    ids.map(id => ({ id, titoli: DEFINIZIONI_CODICE[id].titoli }))
  )) {
    const esiti = Object.values(r.esitiAllaBase);
    console.log(
      `${r.criterio} controprova: ${esiti.filter(e => e !== 'passed').length}/${esiti.length} titoli rossi o assenti alla base`
    );
  }
  return true;
};

const argomenti = process.argv.slice(2);
const ok = argomenti.includes('--selftest')
  ? await selftest()
  : argomenti.includes('--controprova')
    ? controprova(argomenti.filter(a => a !== '--controprova'))
    : await verifica(
        argomenti.length === 0 || argomenti.includes('all') ? ATTESI : argomenti
      );
process.exit(ok ? 0 : 1);
