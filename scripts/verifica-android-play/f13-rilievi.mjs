// C83 (R25, U4 «controlla più volte»): ogni riga delle tabelle dei revisori di F13 e ogni difetto D1-D7 ha
// una destinazione (un Cn, un residuo dichiarato o il Fuori contratto) in rilievi-f13.md; l'indice nel repo
// porta solo le righe delle tabelle; il secondo giro dei revisori è fatto sull'ultimo commit del codice.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { esegui, esiste, leggi, percorso } from './comune.mjs';

export const ESITI_C83 = join(homedir(), 'todos', 'android-play-f13');
export const RILIEVI_C83 = 'docs/store/google-play/verifica/rilievi-f13.md';
export const INDICE_C83 = 'docs/store/google-play/verifica/f13';
// Revisore → nome del file di esito (`<file>-esito.md` fra gli esiti, `<file>.md` nell'indice).
export const REVISORI_C83 = {
  'A-B-C': 'codex-p2-abc',
  D: 'codex-p2-d',
  E: 'codex-p2-e',
  F1: 'codex-p2-f1',
  F2: 'codex-p2-f2',
  G: 'codex-p2-g',
  architettura: 'codex-arch',
};
export const DIFETTI_C83 = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
// Il secondo giro scrive file `giro2-<perimetro>-esito.md`: il revisore è `giro2-<perimetro>`.
const SECONDO_GIRO = /^giro2-(.+)-esito\.md$/;
const SORVEGLIATI = [
  'src',
  'supabase',
  'app.config.js',
  'eas.json',
  'package.json',
  'package-lock.json',
];
const DESTINAZIONE = /\bC\d+\b|residuo|fuori contratto/i;
const FUORI_DAL_REPO =
  /[A-Za-z]:[\\/]|\/Users\/|~\/|AppData|(^|[\s(])\/c\/|\.claude|memory\//i;

const separatore = r => /^\|\s*:?-{3,}/.test(r.trim());
/** Righe di dati delle tabelle markdown: niente intestazioni (la riga sopra un separatore) né separatori. */
export const righeTabella = testo => {
  const r = String(testo ?? '').split(/\r?\n/);
  return r.filter(
    (x, i) =>
      x.trim().startsWith('|') && !separatore(x) && !separatore(r[i + 1] ?? '')
  );
};
const celle = riga =>
  riga
    .split('|')
    .slice(1, -1)
    .map(c => c.trim());

const leggiCartella = (dir, nomeFile) =>
  existsSync(dir)
    ? Object.fromEntries(
        readdirSync(dir)
          .map(f => [nomeFile(f), f])
          .filter(([k]) => k)
          .map(([k, f]) => [k, readFileSync(join(dir, f), 'utf8')])
      )
    : null;
const chiaveEsito = f => {
  const r = Object.entries(REVISORI_C83).find(([, n]) => f === `${n}-esito.md`);
  if (r) return r[0];
  const g = SECONDO_GIRO.exec(f);
  return g ? `giro2-${g[1]}` : null;
};
const chiaveIndice = f => chiaveEsito(f.replace(/\.md$/, '-esito.md'));

export const C83 = {
  leggi: () => ({
    esiti: leggiCartella(ESITI_C83, chiaveEsito),
    indice: leggiCartella(percorso(INDICE_C83), chiaveIndice) ?? {},
    rilievi: esiste(percorso(RILIEVI_C83))
      ? leggi(percorso(RILIEVI_C83))
      : null,
    ultimoCommit: esegui('git', [
      'log',
      '-1',
      '--format=%H',
      '--',
      ...SORVEGLIATI,
    ]).trim(),
  }),
  nota: i =>
    i.esiti
      ? `righe contate sugli esiti in ${ESITI_C83}`
      : "righe contate sull'indice del repo",
  verifica({ esiti, indice, rilievi, ultimoCommit }) {
    if (rilievi == null) return `${RILIEVI_C83} assente`;
    const fonte = esiti ?? indice;
    for (const k of Object.keys(REVISORI_C83))
      if (!(k in fonte))
        return `esito del revisore ${k} assente (${esiti ? ESITI_C83 : INDICE_C83})`;
    if (!Object.keys(fonte).some(k => k.startsWith('giro2-')))
      return 'secondo giro dei revisori non fatto (nessun esito giro2-*)';
    for (const [k, testo] of Object.entries(indice)) {
      const altro = String(testo)
        .split(/\r?\n/)
        .findIndex(
          r => r.trim() && !r.trim().startsWith('|') && !r.startsWith('#')
        );
      if (altro >= 0)
        return `${INDICE_C83}/${k}: riga ${altro + 1} non è una riga di tabella`;
      const fuori = String(testo)
        .split(/\r?\n/)
        .findIndex(r => FUORI_DAL_REPO.test(r));
      if (fuori >= 0)
        return `${INDICE_C83}/${k}: riga ${fuori + 1} con un percorso fuori dal repo`;
    }
    const mappa = righeTabella(rilievi).map(celle);
    const destinazione = (rev, n) =>
      mappa.find(
        c =>
          c[0] === rev &&
          c[1] === String(n) &&
          DESTINAZIONE.test(c.slice(2).join(' '))
      );
    for (const [k, testo] of Object.entries(fonte)) {
      const righe = righeTabella(testo).length;
      if (esiti && righeTabella(indice[k]).length !== righe)
        return `${INDICE_C83}: ${k} ha ${righeTabella(indice[k]).length} righe, l'esito ${righe}`;
      for (let n = 1; n <= righe; n++)
        if (!destinazione(k, n))
          return `${RILIEVI_C83}: riga ${n} di ${k} senza destinazione`;
    }
    for (const d of DIFETTI_C83)
      if (!destinazione('difetti', d))
        return `${RILIEVI_C83}: difetto ${d} senza destinazione`;
    const sha = /secondo giro[^\n]*?\b([0-9a-f]{7,40})\b/i.exec(rilievi)?.[1];
    if (!sha) return `${RILIEVI_C83} non scrive lo sha del secondo giro`;
    if (!ultimoCommit.startsWith(sha))
      return `secondo giro su ${sha}, ma l'ultimo commit del codice è ${ultimoCommit.slice(0, 7)}`;
    return '';
  },
};
