// C79 (R24-R25, rilievi B6 B7 B8 di F13): migration `0022` nel repo con la sua suite SQL in `run-all.sh`,
// verde su entrambi gli shim, un mutante ucciso per ogni regola, suite 0008-0020 ancora verdi, e il runbook
// (C20) che dice come applicarla. Applicarla al database vero è Fuori contratto: qui non si tocca.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { esiste, leggi, percorso } from './comune.mjs';

export const MUTANTI_C79 = 'supabase/tests/mutants-0022.sh';
export const RUNBOOK_C79 = 'docs/store/google-play/rilascio.md';
// Una regola per riga del criterio: created_at del server, evento marketing che aggiorna il profilo nella
// stessa transazione, solo se IS DISTINCT FROM, BEFORE UPDATE che riallinea, nessun evento → false.
export const MUTANTI_MINIMI_C79 = 5;
// Casi che la suite deve nominare (parole cercate nel testo della suite, senza maiuscole).
export const CASI_C79 = [
  'revoca',
  'registrazione',
  'discordante',
  'futuro',
  'legacy_contacts',
  'nessun evento',
];
const SQL_REGOLE = [
  [
    /created_at[\s\S]{0,200}now\(\)|now\(\)[\s\S]{0,200}created_at/i,
    'created_at deciso dal server con now()',
  ],
  [/is\s+distinct\s+from/i, 'aggiornamento solo se IS DISTINCT FROM'],
  // `before insert or update` vale: il BEFORE UPDATE c'è ancora (giro 2 abc-4, f5f2256).
  [
    /before\s+(?:insert\s+or\s+)?update[\s\S]{0,200}profiles/i,
    'BEFORE UPDATE su profiles',
  ],
];

/**
 * Il SQL senza commenti `--…` e `/*…*\/` (R28: una regola citata in un commento non conta). Le stringhe fra
 * apici singoli (con `''` dentro) restano intere; i corpi `$$…$$` si leggono come codice, così anche i
 * commenti nelle funzioni spariscono.
 */
export const senzaCommentiSql = sql => {
  let fuori = '';
  for (let i = 0; i < sql.length; ) {
    if (sql[i] === "'") {
      let j = i + 1;
      while (j < sql.length && !(sql[j] === "'" && sql[j + 1] !== "'"))
        j += sql[j] === "'" ? 2 : 1;
      fuori += sql.slice(i, j + 1);
      i = j + 1;
    } else if (sql.startsWith('--', i)) {
      const a = sql.indexOf('\n', i);
      i = a < 0 ? sql.length : a;
    } else if (sql.startsWith('/*', i)) {
      const a = sql.indexOf('*/', i + 2);
      fuori += ' ';
      i = a < 0 ? sql.length : a + 2;
    } else fuori += sql[i++];
  }
  return fuori;
};

const unoChe = (dir, re) =>
  existsSync(dir) ? (readdirSync(dir).find(f => re.test(f)) ?? null) : null;
// Bash di Git per Windows: quello in PATH può essere il bash di WSL, che non vede Docker Desktop allo stesso modo.
const BASH =
  process.platform === 'win32' &&
  existsSync('C:\\Program Files\\Git\\bin\\bash.exe')
    ? 'C:\\Program Files\\Git\\bin\\bash.exe'
    : 'bash';
const lanciaBash = script => {
  const r = spawnSync(BASH, [script], {
    cwd: percorso('supabase'),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    exit: r.error ? null : r.status,
    uscita: String(r.stdout ?? '') + String(r.stderr ?? ''),
  };
};

export const C79 = {
  nota: () => 'batteria SQL completa in Docker: circa 7 minuti',
  leggi() {
    const migration = unoChe(
      percorso('supabase', 'migrations'),
      /^0022_.*\.sql$/
    );
    const suite = unoChe(percorso('supabase', 'tests'), /^0022_.*\.test\.sql$/);
    const testo = (...p) =>
      esiste(percorso(...p)) ? leggi(percorso(...p)) : null;
    const docker =
      spawnSync('docker', ['info'], { encoding: 'utf8' }).status === 0;
    return {
      migration,
      sql: migration && testo('supabase', 'migrations', migration),
      suite,
      testoSuite: suite && testo('supabase', 'tests', suite),
      runAll: testo('supabase', 'tests', 'run-all.sh'),
      mutanti: testo(MUTANTI_C79),
      runbook: testo(RUNBOOK_C79),
      docker,
      // Sette minuti di Docker solo se c'è qualcosa da provare.
      batteria:
        docker && migration && suite ? lanciaBash('tests/run-all.sh') : null,
      mutazioni:
        docker && migration && esiste(percorso(MUTANTI_C79))
          ? lanciaBash('tests/mutants-0022.sh')
          : null,
    };
  },
  verifica(i) {
    if (!i.migration) return 'migration 0022 assente in supabase/migrations';
    const sql = senzaCommentiSql(i.sql ?? '');
    for (const [re, cosa] of SQL_REGOLE)
      if (!re.test(sql)) return `${i.migration}: manca ${cosa}`;
    if (!i.suite) return 'suite 0022_*.test.sql assente in supabase/tests';
    const nome = i.suite.replace(/\.test\.sql$/, '');
    if (!new RegExp(`"${nome}"`).test(i.runAll ?? ''))
      return `${nome} non è fra le coppie di run-all.sh`;
    const caso = CASI_C79.find(
      c => !(i.testoSuite ?? '').toLowerCase().includes(c)
    );
    if (caso) return `la suite ${i.suite} non nomina il caso «${caso}»`;
    const n = (i.mutanti?.match(/^\s*run_mutante\s/gm) ?? []).length;
    if (n < MUTANTI_MINIMI_C79)
      return `${MUTANTI_C79}: ${n} mutanti, almeno ${MUTANTI_MINIMI_C79} (uno per regola)`;
    const rb = i.runbook ?? '';
    const at = rb.indexOf('0022');
    if (at < 0) return `${RUNBOOK_C79} non dice come applicare la 0022`;
    if (!rb.slice(Math.max(0, at - 600), at + 600).includes('0021'))
      return `${RUNBOOK_C79}: la 0022 non è messa dopo le 0017-0021`;
    const query = rb.search(
      /select\s+count\([^)]*\)[\s\S]{0,400}marketing_consent/i
    );
    if (query < 0)
      return `${RUNBOOK_C79}: manca la query di sola lettura sui marketing_consent discordanti`;
    const applica = rb.search(
      /(applic|db push)[^\n]{0,80}0022|0022[^\n]{0,80}(applic|db push)/i
    );
    if (applica >= 0 && query > applica)
      return `${RUNBOOK_C79}: la query di controllo viene dopo l'applicazione della 0022`;
    if (!i.docker) return 'Docker non attivo: la batteria SQL non gira';
    if (i.batteria?.exit !== 0)
      return `run-all.sh exit ${i.batteria?.exit}: ${(i.batteria?.uscita.match(/ROSSO[^\n]*/) ?? [''])[0]}`;
    const verdi = (
      i.batteria.uscita.match(new RegExp(`verde\\s+${nome}\\b`, 'g')) ?? []
    ).length;
    if (verdi < 2) return `${nome} verde su ${verdi} shim, attesi 2`;
    if (
      i.mutazioni?.exit !== 0 ||
      !/tutti i mutanti uccisi/.test(i.mutazioni?.uscita ?? '')
    )
      return `mutants-0022.sh: mutanti sopravvissuti (exit ${i.mutazioni?.exit})`;
    return '';
  },
};
