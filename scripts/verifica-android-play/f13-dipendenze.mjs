// C59 (R24-R25, rilievo A1 di F13): `npm audit` delle dipendenze dell'app con il registro raggiungibile,
// correzioni solo patch o minor rispetto a BASE_R24, prebuild di prova se cambiano gli `overrides`.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT, esegui, esiste, leggi, percorso } from './comune.mjs';
import { BASE_R24 } from './titoli-jest.mjs';
import { staccaJunction } from './controprova-registra.mjs';

// Pacchetti che entrano nel bundle dell'app (P2 di F13): zero avvisi ammessi.
export const NEL_BUNDLE_C59 = [
  'lodash',
  'query-string',
  'decode-uri-component',
];
export const RILASCIO_C59 = 'docs/store/google-play/rilascio.md';
const WIN = process.platform === 'win32';

const lancia = (cmd, args, cwd = ROOT) =>
  spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    shell: WIN,
  });

/** Rapporto di `npm audit --omit=dev --json`; un errore di rete o un'uscita illeggibile restano errori. */
export const leggiAudit = () => {
  const r = lancia('npm', ['audit', '--omit=dev', '--json']);
  try {
    return JSON.parse(r.stdout);
  } catch {
    return { error: { summary: `uscita illeggibile (exit ${r.status})` } };
  }
};

/** [maggiore, minore] di una versione o di un intervallo semplice (`^1.2.3`, `~0.81.4`, `1.2.3`). */
export const versione = spec => {
  const m = /(\d+)\.(\d+)/.exec(String(spec ?? ''));
  return m ? [Number(m[1]), Number(m[2])] : null;
};

/** Salto che rompe: maggiore diverso, o minore diverso sotto la 1.0 (lì il minore è il «maggiore»). */
export const saltoMaggiore = (prima, dopo) => {
  const a = versione(prima);
  const b = versione(dopo);
  if (!a || !b) return prima !== dopo;
  return a[0] !== b[0] || (a[0] === 0 && a[1] !== b[1]);
};

const tutteLeDipendenze = p => ({
  ...(p?.dependencies ?? {}),
  ...(p?.devDependencies ?? {}),
});

const prebuildDiProva = () => {
  const dir = mkdtempSync(join(tmpdir(), 'c59-prebuild-'));
  try {
    esegui('git', ['worktree', 'add', '--detach', dir, 'HEAD']);
    symlinkSync(
      percorso('node_modules'),
      join(dir, 'node_modules'),
      'junction'
    );
    const r = lancia(
      'npx',
      ['expo', 'prebuild', '--no-install', '--platform', 'android'],
      dir
    );
    return r.status;
  } finally {
    staccaJunction(join(dir, 'node_modules'));
    spawnSync('git', ['worktree', 'remove', '--force', dir], { cwd: ROOT });
    rmSync(dir, { recursive: true, force: true });
  }
};

export const C59 = {
  nota: () => 'gate npm run conta-problemi rilanciato dentro il criterio',
  leggi() {
    const oggi = JSON.parse(leggi(percorso('package.json')));
    const base = JSON.parse(
      esegui('git', ['show', `${BASE_R24}:package.json`])
    );
    const lockBase = JSON.parse(
      esegui('git', ['show', `${BASE_R24}:package-lock.json`])
    );
    const overrideCambiati =
      JSON.stringify(oggi.overrides ?? {}) !==
      JSON.stringify(base.overrides ?? {});
    return {
      audit: leggiAudit(),
      oggi: tutteLeDipendenze(oggi),
      base: tutteLeDipendenze(base),
      overrides: oggi.overrides ?? {},
      installateBase: Object.fromEntries(
        Object.keys(oggi.overrides ?? {}).map(n => [
          n,
          lockBase.packages?.[`node_modules/${n}`]?.version ?? null,
        ])
      ),
      overrideCambiati,
      prebuild: overrideCambiati ? prebuildDiProva() : null,
      rilascio: esiste(percorso(RILASCIO_C59))
        ? leggi(percorso(RILASCIO_C59))
        : null,
      gate: lancia('npm', ['run', 'conta-problemi']).status,
    };
  },
  verifica(i) {
    if (!i.audit || i.audit.error || !i.audit.vulnerabilities)
      return `npm audit senza rapporto (registro non raggiungibile?): ${i.audit?.error?.summary ?? 'nessun dato'}`;
    const vuln = i.audit.vulnerabilities;
    const nelBundle = NEL_BUNDLE_C59.filter(n => vuln[n]);
    if (nelBundle.length)
      return `avvisi ancora su pacchetti del bundle: ${nelBundle.join(', ')}`;
    if (vuln.uuid) {
      const riga = (i.rilascio ?? '')
        .split(/\r?\n/)
        .find(r => /\buuid\b/.test(r) && /xcode|prebuild/i.test(r));
      if (!riga) return `avviso su uuid senza motivo in ${RILASCIO_C59}`;
    }
    for (const [nome, prima] of Object.entries(i.base ?? {}))
      if (nome in i.oggi && saltoMaggiore(prima, i.oggi[nome]))
        return `${nome}: ${prima} → ${i.oggi[nome]} è un salto di versione maggiore`;
    for (const [nome, v] of Object.entries(i.overrides ?? {})) {
      if (typeof v !== 'string')
        return `override annidato su ${nome}: da controllare a mano`;
      if (saltoMaggiore(i.installateBase?.[nome] ?? '', v))
        return `override ${nome} → ${v}: salto maggiore rispetto a ${i.installateBase?.[nome] ?? 'nessuna versione'} della base`;
    }
    if (i.overrideCambiati && i.prebuild !== 0)
      return `expo prebuild di prova con gli overrides nuovi: exit ${i.prebuild}`;
    if (i.gate !== 0) return `npm run conta-problemi: exit ${i.gate}`;
    return '';
  },
};
