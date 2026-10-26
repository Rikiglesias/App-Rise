// Registrazione delle controprove: la suite gira in un worktree temporaneo alla base di ogni criterio, con
// i file di test di HEAD copiati dentro. Unico modulo del verificatore che scrive (worktree e registri JSON).
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
import { ROOT, esegui, percorso } from './comune.mjs';
import { commitCorrente, controllaRegressioni } from './controprova-storia.mjs';
import {
  BASE_CONTROPROVA,
  corrisponde,
  eseguiSuite,
  esitoTitoli,
  fileControprova,
  fileDeiTitoli,
  rigorosa,
  shaFile,
  suite,
} from './titoli-jest.mjs';

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
  const commitFileTest = commitCorrente();
  const registri = [...new Set(perCriterio.map(c => c.base))].flatMap(commit =>
    registraSuBase(
      commit,
      perCriterio.filter(c => c.base === commit),
      commitFileTest
    )
  );
  // Regola R27-R29: prima di scrivere, nessun esito alla base perso rispetto alla versione in git.
  controllaRegressioni(registri);
  for (const r of registri)
    writeFileSync(
      fileControprova(r.criterio),
      `${JSON.stringify(r, null, 2)}\n`
    );
  return registri;
};

const registraSuBase = (commit, perCriterio, commitFileTest) => {
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
      return {
        criterio: id,
        base: commit,
        titoli,
        esitiAllaBase,
        ...(rigorosa(commit) ? { motiviAllaBase } : {}),
        fileTest: shaFile(fileTest),
        commitFileTest,
      };
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
