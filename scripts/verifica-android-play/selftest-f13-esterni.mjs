// C22 per i criteri R24-R26 che leggono rete, Deno, Docker o file fuori dal repo (C59 C60 C78 C79 C83):
// la verifica è pura, qui riceve dati sintetici. Ogni fixture negativa è il positivo con UNA mutazione.
import YAML from 'yaml';
import { TEST_C60 } from './f13-funzioni.mjs';
import { CI_C78, OTA_C78 } from './f13-workflow.mjs';
import { CASI_C79, MUTANTI_MINIMI_C79 } from './f13-database.mjs';
import { DIFETTI_C83, REVISORI_C83 } from './f13-rilievi.mjs';

const casi = (ok, mutazioni, positivi = []) => ({
  neg: mutazioni.map(m => ({ ...ok, ...m })),
  pos: [ok, ...positivi.map(m => ({ ...ok, ...m }))],
});

// --- C59 ---
const C59_OK = {
  audit: { vulnerabilities: { 'shell-quote': { severity: 'critical' } } },
  oggi: { expo: '~54.0.1', 'react-native': '0.81.5' },
  base: { expo: '~54.0.0', 'react-native': '0.81.4' },
  overrides: {},
  installateBase: {},
  overrideCambiati: false,
  prebuild: null,
  rilascio: '',
  gate: 0,
};

// --- C60 ---
const deno = verde =>
  Object.fromEntries(
    Object.entries(TEST_C60).map(([f, t]) => [
      f,
      { casi: [{ nome: t, verde }] },
    ])
  );
const C60_OK = {
  sorgenti: {
    'delete-account':
      "if (delErr) return json({ error: 'delete_failed' }, 500);",
    'purge-deletions':
      "return new Response(JSON.stringify({ error: 'query_failed' }), {\n status: 500 });",
  },
  oggi: deno(true),
  base: deno(false),
};
const sorgente60 = t => ({
  sorgenti: { ...C60_OK.sorgenti, 'delete-account': t },
});

// --- C78 ---
const SHA = 'a'.repeat(40);
const CI = `on:
  push:
    branches: [master]
permissions: {}
jobs:
  build-android:
    if: github.ref == 'refs/heads/master'
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@${SHA} # v8.2.1
      - run: echo "$MSG"
        env:
          MSG: \${{ github.event.inputs.message }}
  notify:
    permissions:
      pull-requests: write
    steps:
      - uses: actions/github-script@v7
`;
const OTA = `on:
  workflow_dispatch:
    inputs:
      message:
        type: string
jobs:
  deploy-ota:
    if: github.event_name == 'workflow_dispatch'
    permissions:
      contents: read
    steps:
      - run: echo ok
`;
const wf = (nome, testo) => {
  try {
    return { nome, testo, doc: YAML.parse(testo), errore: null };
  } catch (e) {
    return { nome, testo, doc: null, errore: e.message };
  }
};
const C78_OK = {
  file: [wf(CI_C78, CI), wf(OTA_C78, OTA)],
  tag: { 'expo/expo-github-action': { 'v8.2.1': ['b'.repeat(40), SHA] } },
  base: { [CI_C78]: YAML.parse(CI), [OTA_C78]: YAML.parse(OTA) },
  actionlint: null,
};
const ci78 = testo => ({ file: [wf(CI_C78, testo), wf(OTA_C78, OTA)] });

// --- C79 ---
const C79_OK = {
  migration: '0022_consensi.sql',
  sql: 'created_at timestamptz not null default now(); … where marketing_consent is distinct from …; create trigger t before update on public.profiles',
  suite: '0022_consensi.test.sql',
  testoSuite: CASI_C79.join('\n'),
  runAll: '  "0022_consensi"',
  mutanti: Array.from(
    { length: MUTANTI_MINIMI_C79 },
    (_, i) => `run_mutante "M${i + 1}" "T1 FAIL" x y`
  ).join('\n'),
  runbook:
    'Dopo le 0017-0021, prima: select count(*) from profiles where marketing_consent … Poi applica la 0022.',
  docker: true,
  batteria: {
    exit: 0,
    uscita:
      'verde  0022_consensi [shim_permissive] — 9 PASS\nverde  0022_consensi [shim_restrictive] — 9 PASS',
  },
  mutazioni: { exit: 0, uscita: 'tutti i mutanti uccisi dal test previsto' },
};

// --- C83 ---
const TAB =
  '| gravità | file:riga | destinazione |\n|---|---|---|\n| ALTA | src/a.ts:1 | C64 |';
const chiavi = [...Object.keys(REVISORI_C83), 'giro2-a'];
const tutte = testo => Object.fromEntries(chiavi.map(k => [k, testo]));
const RILIEVI = [
  '| revisore | n | destinazione |',
  '|---|---|---|',
  ...chiavi.map(k => `| ${k} | 1 | C64 |`),
  ...DIFETTI_C83.map(d => `| difetti | ${d} | C81 |`),
  '',
  'Secondo giro su abc1234.',
].join('\n');
const C83_OK = {
  esiti: tutte(`# esito\n${TAB}`),
  indice: tutte(TAB),
  rilievi: RILIEVI,
  ultimoCommit: `abc1234${'f'.repeat(33)}`,
};
const senza = k =>
  Object.fromEntries(Object.entries(C83_OK.esiti).filter(([x]) => x !== k));

export const FIXTURE_F13_ESTERNI = {
  C59: casi(
    C59_OK,
    [
      { audit: { error: { summary: 'ENOTFOUND registry.npmjs.org' } } },
      { audit: {} },
      { audit: { vulnerabilities: { lodash: {} } } },
      { audit: { vulnerabilities: { uuid: {} } }, rilascio: 'uuid' },
      { oggi: { ...C59_OK.oggi, expo: '~55.0.0' } },
      { oggi: { ...C59_OK.oggi, 'react-native': '0.82.0' } },
      {
        overrides: { 'query-string': '8.0.0' },
        installateBase: { 'query-string': '7.1.3' },
        overrideCambiati: true,
        prebuild: 0,
      },
      {
        overrides: { 'query-string': { x: '1' } },
        overrideCambiati: true,
        prebuild: 0,
      },
      {
        overrides: { 'query-string': '7.1.4' },
        installateBase: { 'query-string': '7.1.3' },
        overrideCambiati: true,
        prebuild: 1,
      },
      { gate: 1 },
    ],
    [
      {
        audit: { vulnerabilities: { uuid: {} } },
        rilascio: '- `uuid`: arriva da xcode, solo nel prebuild.',
      },
      {
        overrides: { 'query-string': '7.2.0' },
        installateBase: { 'query-string': '7.1.3' },
        overrideCambiati: true,
        prebuild: 0,
      },
    ]
  ),
  C60: casi(
    C60_OK,
    [
      sorgente60('if (delErr) return json({ error: delErr.message }, 500);'),
      {
        sorgenti: {
          ...C60_OK.sorgenti,
          'purge-deletions':
            'return new Response(\n JSON.stringify({ error: error.message }),\n {});',
        },
      },
      { sorgenti: { ...C60_OK.sorgenti, 'delete-account': null } },
      {
        oggi: { ...C60_OK.oggi, 'delete-account': { errore: 'deno: ENOENT' } },
      },
      { oggi: { ...C60_OK.oggi, 'delete-account': { casi: null } } },
      { oggi: { ...C60_OK.oggi, 'delete-account': { casi: [] } } },
      { oggi: deno(false) },
      { base: { ...C60_OK.base, 'purge-deletions': { casi: [] } } },
      { base: deno(true) },
    ],
    [
      sorgente60(
        "console.error(delErr.message);\nreturn json({ error: 'delete_failed' }, 500);"
      ),
    ]
  ),
  C78: casi(
    C78_OK,
    [
      { file: [] },
      ci78(CI.replace(`@${SHA} # v8.2.1`, '@v8')),
      ci78(CI.replace(' # v8.2.1', '')),
      ci78(CI.replace('v8.2.1', 'v8.2.0')),
      {
        tag: {
          'expo/expo-github-action': { errore: 'git ls-remote exit 128' },
        },
      },
      ci78(
        CI.replace('echo "$MSG"', 'echo "${{ github.event.inputs.message }}"')
      ),
      ci78(CI.replace('    permissions:\n      contents: read\n', '')),
      ci78(CI.replace('actions/github-script@v7', 'actions/checkout@v4')),
      ci78(CI.replace('branches: [master]', 'branches: [master, develop]')),
      ci78(CI.replace("github.ref == 'refs/heads/master'", 'always()')),
      ci78(`${CI}\n  rotto: [`),
      { actionlint: { exit: 1, uscita: 'errore' } },
    ],
    [{ actionlint: { exit: 0, uscita: '' } }]
  ),
  C79: casi(C79_OK, [
    { migration: null },
    { sql: C79_OK.sql.replace('now()', "'2026-01-01'") },
    { sql: C79_OK.sql.replace('is distinct from', '<>') },
    { suite: null },
    { runAll: '"0020_claim"' },
    { testoSuite: CASI_C79.slice(1).join('\n') },
    { mutanti: C79_OK.mutanti.split('\n').slice(1).join('\n') },
    { runbook: 'Nulla da applicare.' },
    { runbook: 'Applica la 0022.' },
    { runbook: 'Dopo le 0017-0021 applica la 0022.' },
    {
      runbook:
        'Dopo le 0017-0021 applica la 0022. Poi: select count(*) from profiles where marketing_consent …',
    },
    { docker: false },
    { batteria: { exit: 1, uscita: 'ROSSO  0019 [shim_restrictive]' } },
    {
      batteria: {
        exit: 0,
        uscita: 'verde  0022_consensi [shim_permissive] — 9 PASS',
      },
    },
    { mutazioni: { exit: 1, uscita: '1 mutanti NON uccisi' } },
  ]),
  C83: casi(
    C83_OK,
    [
      { rilievi: null },
      { esiti: senza('D') },
      { esiti: senza('giro2-a') },
      { indice: { ...C83_OK.indice, G: `nota libera\n${TAB}` } },
      {
        indice: {
          ...C83_OK.indice,
          G: `${TAB}\n| ALTA | C:/tmp/x.ts:1 | C64 |`,
        },
      },
      { rilievi: RILIEVI.replace('| G | 1 | C64 |', '| G | 1 | da vedere |') },
      { rilievi: RILIEVI.replace('| difetti | D7 | C81 |', '') },
      { rilievi: RILIEVI.replace('Secondo giro su abc1234.', '') },
      { ultimoCommit: 'def5678'.padEnd(40, '0') },
      { esiti: { ...C83_OK.esiti, E: `${TAB}\n| BASSA | src/b.ts:2 | C70 |` } },
    ],
    [{ esiti: null }]
  ),
};
