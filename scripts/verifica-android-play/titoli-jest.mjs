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
  sha256File,
} from './comune.mjs';

/** Commit su cui i test nuovi DEVONO fallire: lo stato prima del lavoro R8-R10. */
export const BASE_CONTROPROVA = 'fbefa98';

/** Esegue l'intera suite in `cwd` e restituisce le asserzioni { nome, titolo, stato, file }; null se illeggibile. */
export const eseguiSuite = (cwd = ROOT) => {
  // Node diretto, senza shell: con `shell: true` su Windows gli argomenti con spazi e apici si spezzano.
  const jest = join(cwd, 'node_modules', 'jest', 'bin', 'jest.js');
  const r = spawnSync(process.execPath, [jest, '--json', '--silent'], {
    cwd,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  try {
    const j = JSON.parse(r.stdout);
    return j.testResults.flatMap(t =>
      t.assertionResults.map(a => ({
        nome: [...a.ancestorTitles, a.title].join(' '),
        titolo: a.title,
        stato: a.status,
        file: rel(t.name),
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

export const shaFile = files =>
  Object.fromEntries(
    files.map(f => [f, esiste(percorso(f)) ? sha256File(percorso(f)) : null])
  );

/**
 * Esegue la suite in un worktree temporaneo a BASE_CONTROPROVA con i file di test di HEAD copiati dentro
 * e salva l'esito per ogni titolo (passed | failed | assente).
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
    fileTest: fileDeiTitoli(c.titoli, oggi),
  }));
  const tutti = [...new Set(perCriterio.flatMap(c => c.fileTest))];
  const dir = mkdtempSync(join(tmpdir(), 'controprova-'));
  try {
    esegui('git', ['worktree', 'add', '--detach', dir, BASE_CONTROPROVA]);
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
    if (!base) throw new Error('suite illeggibile nel worktree della base');
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
      const registro = {
        criterio: id,
        base: BASE_CONTROPROVA,
        titoli,
        esitiAllaBase,
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
export const esitoControprova = (titoli, registro, shaAttuali) => {
  if (!registro) return 'controprova mancante';
  if (registro.base !== BASE_CONTROPROVA)
    return `controprova su ${registro.base}, attesa ${BASE_CONTROPROVA}`;
  if (titoli.length === 0)
    return 'nessun titolo da controprovare (servono titoli non di guardia)';
  const esiti = registro.esitiAllaBase ?? {};
  const senza = titoli.filter(t => !(t in esiti));
  if (senza.length) return `controprova senza «${senza.join('», «')}»`;
  const verdi = titoli.filter(t => esiti[t] === 'passed');
  if (verdi.length) return `già verdi alla base: «${verdi.join('», «')}»`;
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
  { titoli, guardie = [], statico } = {}
) => ({
  titoli,
  guardie,
  leggi() {
    const registro = leggiControprova(id);
    return {
      jest: suite(),
      controprova: registro,
      shaAttuali: shaFile(Object.keys(registro?.fileTest ?? {})),
      statico: statico ? statico.leggi() : null,
    };
  },
  verifica({ jest, controprova, shaAttuali, statico: datiStatici }) {
    const motivi = [
      esitoTitoli([...titoli, ...guardie], jest),
      esitoControprova(titoli, controprova, shaAttuali ?? {}),
      statico ? statico.verifica(datiStatici) : '',
    ].filter(Boolean);
    return motivi.join(' · ');
  },
});
