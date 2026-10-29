// C83 (R25, U4 «controlla più volte»; emendato R28-R29): ogni riga delle tabelle dei revisori di F13, del secondo
// giro e delle revisioni del delta, e ogni difetto D1-D7, ha una destinazione (un Cn, un residuo dichiarato o il
// Fuori contratto) in rilievi-f13.md; ogni riga destinata a un Cn cita un titolo o un'azione che il verificatore
// esporta per quel Cn; l'indice nel repo porta solo le righe delle tabelle; i log delle revisioni del delta
// dichiarano il CODEX_HOME pulito e non leggono note private; le chiusure del giro 2 sono riverificate; la
// revisione del delta è fatta sull'ultimo commit del codice.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { ROOT, esegui, esiste, leggi, percorso } from './comune.mjs';

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
// Il secondo giro scrive `giro2-<perimetro>-esito.md`; la revisione del delta `delta<N>-<perimetro>-esito.md`;
// la verifica delle chiusure `verifica-delta<N>-<perimetro>-esito.md` (R28: ognuno con la sua regex).
const SECONDO_GIRO = /^giro2-(.+)-esito\.md$/;
const DELTA = /^(delta\d+)-(.+)-esito\.md$/;
const CHIUSURE = /^verifica-delta\d*-(.+)-esito\.md$/;
const LOG_DELTA = /^(?:verifica-)?delta\d+-.+\.log$/;
// R29: anche i documenti che R27-R29 correggono; `verifica/` escluso per nome, perché il commit che scrive lo
// sha in rilievi-f13.md (o l'indice f13/) altrimenti lo sposterebbe.
const SORVEGLIATI = [
  'src',
  'supabase',
  'app.config.js',
  'eas.json',
  'package.json',
  'package-lock.json',
  'docs/store/google-play/play-console-risposte.md',
  'docs/store/google-play/rilascio.md',
  'docs/store/google-play/web/',
  'privacy-policy.html',
  'privacy-policy-en.html',
  'docs/integrazioni/scambio-dati-quadro.md',
  'docs/informativa-punti-aperti.md',
  ':(exclude)docs/store/google-play/verifica/',
];
/** Ultimo commit che tocca i file sorvegliati: lo sha su cui deve girare la revisione. */
export const ultimoCommitSorvegliato = (cwd = ROOT) =>
  esegui('git', ['log', '-1', '--format=%H', '--', ...SORVEGLIATI], {
    cwd,
  }).trim();
const DESTINAZIONE = /\bC\d+\b|residuo|fuori contratto/i;
const FUORI_DAL_REPO =
  /[A-Za-z]:[\\/]|\/Users\/|~\/|AppData|(^|[\s(])\/c\/|\.claude|memory\//i;
// Una lettura di note private in un comando del log: cartella con separatore accanto, o argomento nudo.
const LETTURA_VIETATA =
  /[\\/](?:todos|memory|memories)\b|\b(?:todos|memory|memories)[\\/]|(?:^|\s)(?:todos|memory|memories)(?:\s|$)|\.claude\b|\.codex[\\/]+memories/i;
// Revisore cieco (delta 1 del 29/10: home senza `[windows] sandbox`, 13 `EXIT 0` senza un file letto): un comando
// rifiutato dalla sandbox, o nessun comando riuscito, e l'esito parla solo del testo incollato.
const RIFIUTATO = /rejected: blocked by policy/i;
const RIUSCITO = /^ ?succeeded in \d+ms:$/;

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
  if (g) return `giro2-${g[1]}`;
  const d = DELTA.exec(f);
  return d ? `${d[1]}-${d[2]}` : null;
};
const chiaveIndice = f => chiaveEsito(f.replace(/\.md$/, '-esito.md'));

/** Motivo di FAIL di un log di revisione del delta, o ''. */
export const controllaLog = (nome, testo) => {
  const r = String(testo ?? '').split(/\r?\n/);
  if (!/^CODEX_HOME=\S/.test(r[0] ?? '') || !/CODEX_HOME/.test(r[1] ?? ''))
    return `${nome}: in testa mancano il CODEX_HOME usato e il suo elenco di file`;
  const rifiutato = r.findIndex(x => RIFIUTATO.test(x));
  if (rifiutato >= 0)
    return `${nome}:${rifiutato + 1} comando rifiutato dalla sandbox: il revisore non ha letto il codice`;
  if (!r.some(x => RIUSCITO.test(x)))
    return `${nome}: nessun comando riuscito, il revisore non ha letto il codice`;
  const i = r.findIndex(
    (x, k) => k > 0 && r[k - 1].trim() === 'exec' && LETTURA_VIETATA.test(x)
  );
  return i >= 0
    ? `${nome}:${i + 1} legge note private (todos, memory, .claude)`
    : '';
};

/** Motivo di FAIL della prova di una riga destinata a uno o più Cn, o ''. */
const controllaProva = (c, testi) => {
  for (const id of c[2].match(/\bC\d+\b/g) ?? []) {
    const voci = testi[id] ?? [];
    if (!voci.length) return `${id} non esporta titoli né azioni`;
    if (!voci.some(t => (c[3] ?? '').includes(t)))
      return `la prova non è un titolo o un'azione di ${id}`;
  }
  return '';
};

/** Motivo di FAIL delle chiusure: una riga per ogni rilievo del giro 2 dichiarato corretto, nessuna smentita. */
const controllaChiusure = (mappa, chiusure) => {
  const attese = {};
  for (const c of mappa)
    if (c[0].startsWith('giro2-') && /\bcorrett/i.test(c[2] ?? ''))
      attese[c[0].slice(6)] = (attese[c[0].slice(6)] ?? 0) + 1;
  for (const [p, n] of Object.entries(attese)) {
    const righe = righeTabella(chiusure[p]);
    if (righe.length !== n)
      return `chiusure di ${p}: ${righe.length} righe, i rilievi del giro 2 dichiarati corretti sono ${n}`;
    const smentita = righe.find(r => /\bNON CORRETTO\b/i.test(r));
    if (smentita) return `chiusure di ${p}: ${smentita.slice(0, 80)}`;
  }
  return '';
};

/** C83 con i testi citabili per criterio (`testiDeiCriteri`, iniettati per non importare il registro). */
export const creaC83 = (testi = {}) => ({
  leggi: () => ({
    esiti: leggiCartella(ESITI_C83, chiaveEsito),
    chiusure: leggiCartella(ESITI_C83, f => CHIUSURE.exec(f)?.[1] ?? null),
    log: leggiCartella(ESITI_C83, f => (LOG_DELTA.test(f) ? f : null)),
    indice: leggiCartella(percorso(INDICE_C83), chiaveIndice) ?? {},
    rilievi: esiste(percorso(RILIEVI_C83))
      ? leggi(percorso(RILIEVI_C83))
      : null,
    ultimoCommit: ultimoCommitSorvegliato(),
    testi,
  }),
  nota: i =>
    i.esiti
      ? `righe contate sugli esiti in ${ESITI_C83}`
      : "righe contate sull'indice del repo",
  verifica({ esiti, chiusure, log, indice, rilievi, ultimoCommit, testi: t }) {
    if (rilievi == null) return `${RILIEVI_C83} assente`;
    const fonte = esiti ?? indice;
    for (const k of Object.keys(REVISORI_C83))
      if (!(k in fonte))
        return `esito del revisore ${k} assente (${esiti ? ESITI_C83 : INDICE_C83})`;
    if (!Object.keys(fonte).some(k => k.startsWith('giro2-')))
      return 'secondo giro dei revisori non fatto (nessun esito giro2-*)';
    if (!Object.keys(fonte).some(k => /^delta\d+-/.test(k)))
      return 'revisione del delta non fatta (nessun esito delta<N>-*)';
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
    for (const [nome, testo] of Object.entries(log ?? {})) {
      const motivo = controllaLog(nome, testo);
      if (motivo) return motivo;
    }
    const mappa = righeTabella(rilievi).map(celle);
    for (const c of mappa) {
      if (/da correggere/i.test(c[2] ?? ''))
        return `${RILIEVI_C83}: riga ${c[1]} di ${c[0]} chiede ancora codice`;
      const motivo = DESTINAZIONE.test(c[2] ?? '')
        ? controllaProva(c, t ?? {})
        : '';
      if (motivo) return `${RILIEVI_C83}: riga ${c[1]} di ${c[0]}: ${motivo}`;
    }
    const destinazione = (rev, n) =>
      mappa.find(
        c => c[0] === rev && c[1] === String(n) && DESTINAZIONE.test(c[2] ?? '')
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
    if (chiusure) {
      const motivo = controllaChiusure(mappa, chiusure);
      if (motivo) return motivo;
    }
    const sha = /revisione del delta[^\n]*?\b([0-9a-f]{7,40})\b/i.exec(
      rilievi
    )?.[1];
    if (!sha)
      return `${RILIEVI_C83} non scrive lo sha della revisione del delta`;
    if (!ultimoCommit.startsWith(sha))
      return `revisione del delta su ${sha}, ma l'ultimo commit del codice è ${ultimoCommit.slice(0, 7)}`;
    return '';
  },
});
