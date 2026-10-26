// C83 R29: lo sha del giro è l'ultimo commit sui file sorvegliati, e un commit che tocca solo `verifica/` non
// lo sposta (altrimenti il commit che scrive lo sha lo cambierebbe: ciclo). Prova su un repo git temporaneo.
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { esegui } from './comune.mjs';
import { ultimoCommitSorvegliato } from './f13-rilievi.mjs';

const CONFIG = [
  '-c',
  'user.name=selftest',
  '-c',
  'user.email=selftest@example.invalid',
  '-c',
  'commit.gpgsign=false',
];

export const selftestSorvegliati = () => {
  const dir = mkdtempSync(join(tmpdir(), 'sorvegliati-'));
  const git = args => esegui('git', [...CONFIG, ...args], { cwd: dir }).trim();
  const committa = (file, testo) => {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), testo);
    git(['add', '--', file]);
    git(['commit', '-q', '--no-verify', '-m', file]);
    return git(['rev-parse', 'HEAD']);
  };
  try {
    git(['init', '-q']);
    const codice = committa('src/a.ts', 'a');
    committa('docs/store/google-play/verifica/rilievi-f13.md', 'sha');
    assert.equal(
      ultimoCommitSorvegliato(dir),
      codice,
      'un commit che tocca solo verifica/ non sposta lo sha'
    );
    const doc = committa('docs/store/google-play/rilascio.md', 'gate');
    assert.equal(
      ultimoCommitSorvegliato(dir),
      doc,
      'un documento corretto da R27-R29 sposta lo sha'
    );
    committa('docs/store/google-play/verifica/f13/codex-arch.md', 'indice');
    committa('README.md', 'altro');
    assert.equal(ultimoCommitSorvegliato(dir), doc, 'file non sorvegliati');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};
