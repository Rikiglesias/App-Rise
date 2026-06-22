/**
 * Genera il dataset ridotto dei comuni italiani per l'autocomplete città.
 *
 * Input:  comuni-json/comuni.json (devDependency, 7904 comuni ISTAT, ~1.9MB).
 * Output: src/shared/data/comuni-min.json (~336KB) con i soli campi necessari:
 *   - n: nome del comune (label + valore città)
 *   - s: sigla provincia (es. "RM") → valore salvato nel campo Provincia
 *   - p: nome provincia (es. "Roma") → disambigua i comuni omonimi nel dropdown
 *
 * Perché un file generato e committato: importare il dataset completo gonfierebbe
 * il bundle dell'app di ~1.9MB (CAP, popolazione, codici catastali inutili qui).
 * comuni-json resta una devDependency: l'app importa solo il JSON ridotto.
 *
 * Rigenerare: `npm run gen:comuni` (dopo un aggiornamento di comuni-json).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', 'node_modules', 'comuni-json', 'comuni.json');
const out = join(here, '..', 'src', 'shared', 'data', 'comuni-min.json');

const comuni = JSON.parse(readFileSync(src, 'utf8'));
const min = comuni.map((c) => ({ n: c.nome, s: c.sigla, p: c.provincia.nome }));

// Il dataset è già ordinato alfabeticamente per nome a monte; lo riconfermiamo
// per stabilità a prescindere dall'ordine della sorgente.
min.sort((a, b) => a.n.localeCompare(b.n, 'it'));

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(min));
console.log(`comuni-min.json: ${min.length} comuni → ${out}`);
