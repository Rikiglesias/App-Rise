// Test Jest cercati per TITOLO ESATTO (regole comuni R8/R9/R10 del contratto android-play) e controprova
// al commit di partenza. `jest -t` senza corrispondenze esce 0 con tutti i test saltati: qui un titolo
// assente, saltato o rosso è FAIL, e la suite gira UNA volta per processo.
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import {
  ROOT,
  VERIFICA_DIR,
  esegui,
  esiste,
  leggi,
  percorso,
  rel,
  sha256,
} from './comune.mjs';

/** Commit su cui i test nuovi DEVONO fallire: lo stato prima del lavoro R8-R10. */
export const BASE_CONTROPROVA = 'fbefa98';

/** Base dei criteri R24-R26 (C56-C84): lo stato prima delle correzioni di F13. */
export const BASE_R24 = '63352bc';

// Regola della controprova R25: alla base il test deve arrivare al codice di quella base e fallire su
// un'asserzione. Un titolo assente (file che non si carica) o uno di questi messaggi dice invece che il
// test non ha trovato il suo punto d'ingresso: è FAIL della controprova, non un rosso.
export const PUNTO_INGRESSO_MANCANTE =
  /Cannot find module|is not a function|is not a constructor|Element type is invalid|is not defined|does not provide an export/;
const rigorosa = base => base === BASE_R24;

/** Esegue l'intera suite in `cwd` e restituisce le asserzioni { nome, titolo, stato, file, motivo }; null se illeggibile. */
export const eseguiSuite = (cwd = ROOT) => {
  // Node diretto, senza shell: con `shell: true` su Windows gli argomenti con spazi e apici si spezzano.
  // Worker al 25 %: col default (core - 1 = 31 qui) la suite esaurisce la memoria virtuale (17/10, due arresti).
  const jest = join(cwd, 'node_modules', 'jest', 'bin', 'jest.js');
  const r = spawnSync(
    process.execPath,
    [jest, '--json', '--silent', '--maxWorkers=25%'],
    {
      cwd,
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    }
  );
  try {
    const j = JSON.parse(r.stdout);
    return j.testResults.flatMap(t =>
      t.assertionResults.map(a => ({
        nome: [...a.ancestorTitles, a.title].join(' '),
        titolo: a.title,
        stato: a.status,
        file: rel(t.name),
        motivo: String(a.failureMessages?.[0] ?? '')
          .split(/\r?\n/)[0]
          .slice(0, 200),
      }))
    );
  } catch {
    return null;
  }
};

let suiteDiOggi;
/** La suite di HEAD, eseguita una volta sola per processo. */
export const suite = () => (suiteDiOggi ??= eseguiSuite());

const corrisponde = (r, titolo) => r.nome === titolo || r.titolo === titolo;

/** Motivo di FAIL per i titoli attesi, o '' se ognuno ha almeno un test e tutti i suoi test sono verdi. */
export const esitoTitoli = (titoli, risultati) => {
  if (!risultati) return 'Jest non eseguito o output illeggibile';
  const problemi = [];
  for (const titolo of titoli) {
    const suoi = risultati.filter(r => corrisponde(r, titolo));
    const storto = suoi.find(r => r.stato !== 'passed');
    if (suoi.length === 0) problemi.push(`manca «${titolo}»`);
    else if (storto) problemi.push(`«${titolo}» ${storto.stato}`);
  }
  return problemi.join('; ');
};

/** File di test che contengono i titoli dati, secondo la suite. */
export const fileDeiTitoli = (titoli, risultati) =>
  [
    ...new Set(
      (risultati ?? [])
        .filter(r => titoli.some(t => corrisponde(r, t)))
        .map(r => r.file)
    ),
  ].sort();

export const fileControprova = id =>
  join(VERIFICA_DIR, `controprova-${id}.json`);

export const leggiControprova = id =>
  esiste(fileControprova(id)) ? JSON.parse(leggi(fileControprova(id))) : null;

// Sha del testo con gli a capo LF: `.gitattributes` (eol=lf) riscrive al checkout un file salvato CRLF,
// e lo sha del disco non coinciderebbe più con quello registrato a contenuto identico (17/10, C32 C33).
const shaTesto = p => sha256(leggi(p).replace(/\r\n/g, '\n'));

export const shaFile = files =>
  Object.fromEntries(
    files.map(f => [f, esiste(percorso(f)) ? shaTesto(percorso(f)) : null])
  );

/**
 * Esegue la suite in un worktree temporaneo alla base di ogni criterio (BASE_CONTROPROVA se non ne
 * dichiara una) con i file di test di HEAD copiati dentro e salva l'esito per ogni titolo
 * (passed | failed | assente).
 */
export const registraControprove = criteri => {
  const oggi = suite();
  for (const { id, titoli } of criteri) {
    const motivo = esitoTitoli(titoli, oggi);
    if (motivo)
      throw new Error(`${id}: i test non sono verdi su HEAD (${motivo})`);
  }
  const perCriterio = criteri.map(c => ({
    ...c,
    base: c.base ?? BASE_CONTROPROVA,
    fileTest: fileDeiTitoli(c.titoli, oggi),
  }));
  return [...new Set(perCriterio.map(c => c.base))].flatMap(commit =>
    registraSuBase(
      commit,
      perCriterio.filter(c => c.base === commit)
    )
  );
};

const registraSuBase = (commit, perCriterio) => {
  const tutti = [...new Set(perCriterio.flatMap(c => c.fileTest))];
  const dir = mkdtempSync(join(tmpdir(), 'controprova-'));
  try {
    esegui('git', ['worktree', 'add', '--detach', dir, commit]);
    symlinkSync(
      percorso('node_modules'),
      join(dir, 'node_modules'),
      'junction'
    );
    for (const f of tutti) {
      mkdirSync(dirname(join(dir, f)), { recursive: true });
      cpSync(percorso(f), join(dir, f));
    }
    const base = eseguiSuite(dir);
    if (!base) throw new Error(`suite illeggibile nel worktree di ${commit}`);
    return perCriterio.map(({ id, titoli, fileTest }) => {
      const esitiAllaBase = Object.fromEntries(
        titoli.map(t => {
          const suoi = base.filter(r => corrisponde(r, t));
          if (suoi.length === 0) return [t, 'assente'];
          return [
            t,
            suoi.every(r => r.stato === 'passed') ? 'passed' : 'failed',
          ];
        })
      );
      // Per la regola R25 serve sapere PERCHÉ un titolo è rosso alla base.
      const motiviAllaBase = Object.fromEntries(
        titoli
          .filter(t => esitiAllaBase[t] === 'failed')
          .map(t => [
            t,
            base.find(r => corrisponde(r, t) && r.stato !== 'passed')?.motivo ??
              '',
          ])
      );
      const registro = {
        criterio: id,
        base: commit,
        titoli,
        esitiAllaBase,
        ...(rigorosa(commit) ? { motiviAllaBase } : {}),
        fileTest: shaFile(fileTest),
      };
      writeFileSync(
        fileControprova(id),
        `${JSON.stringify(registro, null, 2)}\n`
      );
      return registro;
    });
  } finally {
    staccaJunction(join(dir, 'node_modules'));
    spawnSync('git', ['worktree', 'remove', '--force', dir], { cwd: ROOT });
    rmSync(dir, { recursive: true, force: true });
  }
};

/**
 * Toglie la junction PRIMA di cancellare il worktree: `git worktree remove --force` (Git 2.50 per Windows)
 * la attraversa e svuota il `node_modules` vero (provato il 16/10: bersaglio da 1 file a 0). Se non si
 * riesce a staccarla si lancia, e il worktree resta su disco: meglio un avanzo da togliere a mano che le
 * dipendenze del repo cancellate.
 */
export const staccaJunction = nm => {
  let info;
  try {
    info = lstatSync(nm);
  } catch {
    return; // mai creata
  }
  if (!info.isSymbolicLink())
    throw new Error(`${nm} non è una junction: worktree lasciato su disco`);
  unlinkSync(nm);
  if (existsSync(nm))
    throw new Error(`${nm} ancora presente: worktree lasciato su disco`);
};

/** Motivo di FAIL della controprova registrata (solo titoli non di guardia), o ''. */
export const esitoControprova = (
  titoli,
  registro,
  shaAttuali,
  base = BASE_CONTROPROVA
) => {
  if (!registro) return 'controprova mancante';
  if (registro.base !== base)
    return `controprova su ${registro.base}, attesa ${base}`;
  if (titoli.length === 0)
    return 'nessun titolo da controprovare (servono titoli non di guardia)';
  const esiti = registro.esitiAllaBase ?? {};
  const senza = titoli.filter(t => !(t in esiti));
  if (senza.length) return `controprova senza «${senza.join('», «')}»`;
  const verdi = titoli.filter(t => esiti[t] === 'passed');
  if (verdi.length) return `già verdi alla base: «${verdi.join('», «')}»`;
  if (rigorosa(base)) {
    const assenti = titoli.filter(t => esiti[t] === 'assente');
    if (assenti.length)
      return `assenti alla base ${base}, il test deve passare da un punto d'ingresso che esiste lì: «${assenti.join('», «')}»`;
    const motivi = registro.motiviAllaBase ?? {};
    const ingresso = titoli.find(
      t => !motivi[t] || PUNTO_INGRESSO_MANCANTE.test(motivi[t])
    );
    if (ingresso)
      return `«${ingresso}» rosso alla base senza un'asserzione fallita (${motivi[ingresso] || 'motivo non registrato'})`;
  }
  const file = Object.keys(registro.fileTest ?? {});
  if (file.length === 0) return 'controprova senza file di test';
  for (const f of file)
    if (shaAttuali[f] !== registro.fileTest[f])
      return `${f} cambiato dopo la controprova`;
  return '';
};

/**
 * Criterio fatto di titoli Jest (con guardie) più un eventuale controllo statico.
 * `statico.leggi()` raccoglie i dati, `statico.verifica(dati)` restituisce il motivo di FAIL o ''.
 */
export const criterioConTitoli = (
  id,
  { titoli, guardie = [], statico, base = BASE_CONTROPROVA } = {},
  lettori = { leggiControprova, suite, shaFile }
) => ({
  titoli,
  guardie,
  base,
  async leggi() {
    const registro = await lettori.leggiControprova(id);
    const jest = await lettori.suite();
    return {
      jest,
      controprova: registro,
      shaAttuali: await lettori.shaFile(Object.keys(registro?.fileTest ?? {})),
      statico: statico
        ? await statico.leggi({ jest, titoli: [...titoli, ...guardie] })
        : null,
    };
  },
  async verifica({ jest, controprova, shaAttuali, statico: datiStatici }) {
    const motivi = [
      esitoTitoli([...titoli, ...guardie], jest),
      esitoControprova(titoli, controprova, shaAttuali ?? {}, base),
      statico
        ? await statico.verifica(datiStatici, {
            jest,
            titoli: [...titoli, ...guardie],
          })
        : '',
    ].filter(Boolean);
    return motivi.join(' · ');
  },
});
