// C78 (R24-R25, catena di fornitura e CI di F13): workflow GitHub con le azioni di terzi fissate a SHA
// verificati contro il tag, input di `workflow_dispatch` passati via `env`, permessi per job nel workflow di
// build, trigger e condizioni di build/OTA identici a BASE_R24.
import { spawnSync } from 'node:child_process';
import YAML from 'yaml';
import { elencaFile, esegui, leggi, percorso, rel } from './comune.mjs';
import { BASE_R24 } from './titoli-jest.mjs';

export const CARTELLA_C78 = '.github/workflows';
export const FIDATI_C78 = ['actions', 'github'];
export const CI_C78 = '.github/workflows/optimized-ci-cd.yml';
export const OTA_C78 = '.github/workflows/ota-deploy.yml';
// Job di build e di OTA dentro il workflow principale: le loro condizioni non si toccano.
const JOB_SORVEGLIATI = /build|ota/;
const SHA = /^[0-9a-f]{40}$/;
const INPUT_IN_RUN = /\$\{\{[^}]*\b(?:github\.event\.inputs|inputs)\.[^}]*\}\}/;

/** Righe `uses:` di azioni esterne: azione, ref e versione nel commento. */
export const azioniDiTerzi = (nome, testo) =>
  testo
    .split(/\r?\n/)
    .map((r, i) => ({
      m: /^\s*-?\s*uses:\s*['"]?([^\s'"#@]+)@([^\s'"#]+)['"]?\s*(?:#\s*(\S+))?/.exec(
        r
      ),
      riga: i + 1,
    }))
    .filter(
      ({ m }) => m && !m[1].startsWith('./') && !m[1].startsWith('docker:')
    )
    .map(({ m, riga }) => ({
      nome,
      riga,
      azione: m[1],
      ref: m[2],
      versione: m[3] ?? null,
      proprietario: m[1].split('/')[0],
    }))
    .filter(a => !FIDATI_C78.includes(a.proprietario));

/** Passi `run:` che interpolano un input di `workflow_dispatch` dentro lo script. */
export const inputNeiRun = (nome, doc) =>
  Object.entries(doc?.jobs ?? {}).flatMap(([job, j]) =>
    (j?.steps ?? [])
      .filter(s => typeof s?.run === 'string' && INPUT_IN_RUN.test(s.run))
      .map(s => `${nome} job ${job}, passo «${s.name ?? s.run.slice(0, 30)}»`)
  );

const scrivono = permessi =>
  permessi === 'write-all' ||
  Object.values(permessi ?? {}).some(v => v === 'write');
// Un job che scrive deve avere un passo che usa il token: github-script, gh o git push.
const usaIlToken = j =>
  (j?.steps ?? []).some(
    s =>
      /actions\/github-script/.test(s?.uses ?? '') ||
      /\bgh\s|git push|GITHUB_TOKEN/.test(s?.run ?? '')
  );

/** Riferimenti dei tag di un repository GitHub: { 'v8.2.1': [sha del tag, sha del commit] }. */
export const tagRemoti = azione => {
  const repo = azione.split('/').slice(0, 2).join('/');
  const tag = {};
  for (const r of esegui('git', [
    'ls-remote',
    '--tags',
    `https://github.com/${repo}`,
  ]).split(/\r?\n/)) {
    const m = /^([0-9a-f]{40})\s+refs\/tags\/(.+?)(\^\{\})?$/.exec(r.trim());
    if (m) (tag[m[2]] ??= []).push(m[1]);
  }
  return tag;
};

const condizioni = doc =>
  Object.fromEntries(
    Object.entries(doc?.jobs ?? {}).map(([id, j]) => [id, j?.if ?? null])
  );

export const C78 = {
  leggi() {
    const file = elencaFile(percorso(CARTELLA_C78), p =>
      /\.ya?ml$/.test(p)
    ).map(p => {
      const testo = leggi(p);
      let doc = null;
      let errore = null;
      try {
        doc = YAML.parse(testo);
      } catch (e) {
        errore = e.message;
      }
      return { nome: rel(p), testo, doc, errore };
    });
    const tag = {};
    for (const a of file.flatMap(f => azioniDiTerzi(f.nome, f.testo)))
      if (!(a.azione in tag))
        try {
          tag[a.azione] = tagRemoti(a.azione);
        } catch (e) {
          tag[a.azione] = { errore: e.message };
        }
    const base = Object.fromEntries(
      [CI_C78, OTA_C78].map(f => [
        f,
        YAML.parse(esegui('git', ['show', `${BASE_R24}:${f}`])),
      ])
    );
    // Si cerca prima il comando: il messaggio di «comando non trovato» cambia con lingua e shell.
    const presente =
      spawnSync(process.platform === 'win32' ? 'where' : 'which', [
        'actionlint',
      ]).status === 0;
    const lint = presente
      ? spawnSync('actionlint', [], { cwd: percorso(), encoding: 'utf8' })
      : null;
    return {
      file,
      tag,
      base,
      actionlint: lint && {
        exit: lint.status,
        uscita: String(lint.stdout || lint.stderr || lint.error || '').slice(
          0,
          300
        ),
      },
    };
  },
  nota: i =>
    i.actionlint
      ? 'actionlint eseguito'
      : 'actionlint non installato: solo analisi YAML',
  verifica({ file, tag, base, actionlint }) {
    if (!file?.length) return `nessun workflow in ${CARTELLA_C78}`;
    for (const f of file)
      if (f.errore) return `${f.nome} non si analizza: ${f.errore}`;
    for (const a of file.flatMap(f => azioniDiTerzi(f.nome, f.testo))) {
      const dove = `${a.nome}:${a.riga} ${a.azione}@${a.ref}`;
      if (!SHA.test(a.ref)) return `azione di terzi non fissata a SHA: ${dove}`;
      if (!a.versione) return `SHA senza la versione in commento: ${dove}`;
      const t = tag?.[a.azione];
      if (!t || t.errore)
        return `tag di ${a.azione} non letti (rete?): ${t?.errore ?? 'nessun dato'}`;
      if (!(t[a.versione] ?? []).includes(a.ref))
        return `${dove}: lo SHA non corrisponde al tag ${a.versione}`;
    }
    for (const f of file) {
      const [primo] = inputNeiRun(f.nome, f.doc);
      if (primo)
        return `input interpolato dentro run (va passato via env): ${primo}`;
    }
    const ci = file.find(f => f.nome === CI_C78)?.doc;
    if (!ci) return `${CI_C78} assente`;
    for (const [id, j] of Object.entries(ci.jobs ?? {})) {
      if (j?.permissions == null)
        return `${CI_C78}: il job ${id} non dichiara i permessi`;
      if (scrivono(j.permissions) && !usaIlToken(j))
        return `${CI_C78}: il job ${id} ha permessi di scrittura senza un passo che li usi`;
    }
    for (const f of [CI_C78, OTA_C78]) {
      const oggi = file.find(x => x.nome === f)?.doc;
      if (!oggi) return `${f} assente`;
      if (JSON.stringify(oggi.on) !== JSON.stringify(base?.[f]?.on))
        return `${f}: i trigger (on:) sono cambiati rispetto a ${BASE_R24}`;
      const prima = condizioni(base?.[f]);
      const dopo = condizioni(oggi);
      for (const id of Object.keys(prima))
        if (
          (f === OTA_C78 || JOB_SORVEGLIATI.test(id)) &&
          prima[id] !== dopo[id]
        )
          return `${f}: la condizione del job ${id} è cambiata rispetto a ${BASE_R24}`;
    }
    if (actionlint && actionlint.exit !== 0)
      return `actionlint exit ${actionlint.exit}: ${actionlint.uscita}`;
    return '';
  },
};
