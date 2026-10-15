// Fixture del selftest (C22) per C8, link scaduto: dati sintetici, nessun accesso al disco.
// Ogni negativo = il positivo con UNA sola mutazione: il FAIL viene per forza da quel ramo.
import { PACKAGE } from './comune.mjs';
import { TEST_ATTESI } from './link.mjs';

const ATTESI = {
  it: ['Link scaduto', 'Questo link è scaduto. Chiedine uno nuovo.'],
  en: ['Link expired', 'This link has expired. Request a new one.'],
};
const nodo = (testo, pkg = PACKAGE) =>
  `<node text="${testo}" package="${pkg}"/>`;
const dumpDi = lingua => ATTESI[lingua].map(t => nodo(t)).join('');
const HASH = {
  'link-scaduto-it.png': 'a'.repeat(64),
  'link-scaduto-en.png': 'b'.repeat(64),
  'link-scaduto-it.xml': 'c'.repeat(64),
  'link-scaduto-en.xml': 'd'.repeat(64),
  'link-scaduto-caldo-it.xml': 'e'.repeat(64),
};
const START = `10-15 12:00:00.000 693 1327 I ActivityTaskManager: START u0 {act=android.intent.action.VIEW dat=rahitalia://reset-password/... flg=0x10000000 pkg=${PACKAGE} cmp=${PACKAGE}/.MainActivity} from uid 2000`;
const giro = (nome, lingua, freddo) =>
  [
    `=== giro: ${nome}`,
    '    versionCode=21 minSdk=24 targetSdk=36',
    '    versionName=1.3.0',
    '    flags=[ HAS_CODE ALLOW_CLEAR_USER_DATA ]',
    freddo
      ? 'Status: ok\nLaunchState: COLD'
      : 'Warning: Activity not started, intent has been delivered to currently running top-most instance.\nStatus: ok',
    `lingua: ${lingua}`,
    START,
  ].join('\n');
const LOG = [
  giro('freddo-it', 'it-IT', true),
  giro('freddo-en', 'en-US', true),
  giro('caldo-it', 'it-IT', false),
  ...Object.entries(HASH).map(([n, h]) => `sha256 ${h} ${n}`),
].join('\n');

const link = (over = {}) => ({
  mancanti: [],
  dump: { it: dumpDi('it'), en: dumpDi('en'), caldo: dumpDi('it') },
  log: LOG,
  hash: HASH,
  versionCode: '21',
  attesi: ATTESI,
  jest: TEST_ATTESI.map(titolo => ({ titolo: `${titolo} …`, stato: 'passed' })),
  ...over,
});
const conLog = (da, a) => link({ log: LOG.replace(da, a) });
const conDump = (chiave, xml) =>
  link({ dump: { ...link().dump, [chiave]: xml } });

export const FIXTURE_LINK = {
  C8: {
    neg: [
      // file e build
      link({ mancanti: ['link-scaduto-en.png'] }),
      link({ versionCode: null }),
      // dump
      conDump('it', nodo(ATTESI.it[0])),
      conDump('caldo', nodo(ATTESI.it[0])),
      conDump(
        'it',
        nodo(ATTESI.it[0]) + nodo(ATTESI.it[1], 'com.android.systemui')
      ),
      conDump('it', dumpDi('it') + nodo(ATTESI.en[0])),
      conDump('en', dumpDi('en') + nodo(ATTESI.it[1])),
      // log, giro per giro
      link({ log: LOG.replace(/=== giro: caldo-it[\s\S]*?(?=sha256)/, '') }),
      conLog('versionCode=21', 'versionCode=20'),
      conLog('flags=[ HAS_CODE', 'flags=[ DEBUGGABLE HAS_CODE'),
      conLog('Status: ok', 'Status: timeout'),
      conLog('LaunchState: COLD', 'LaunchState: WARM'),
      conLog(
        'intent has been delivered to currently running top-most instance',
        'activity started'
      ),
      conLog('lingua: en-US', 'lingua: it-IT'),
      link({
        log: LOG.split(START).join(
          START.replace(` cmp=${PACKAGE}/.MainActivity`, '')
        ),
      }),
      link({
        log: LOG.split(START).join(
          START.replace('reset-password', 'confirm-email')
        ),
      }),
      // sha256 calcolato sul dispositivo
      conLog(/^sha256 \S+ link-scaduto-caldo-it\.xml$/m, ''),
      link({ hash: { ...HASH, 'link-scaduto-it.png': 'f'.repeat(64) } }),
      // Jest per titolo
      link({ jest: null }),
      link({
        jest: link().jest.map((t, i) =>
          i === 0 ? { ...t, stato: 'failed' } : t
        ),
      }),
      link({ jest: link().jest.slice(0, 3) }),
    ],
    pos: [link()],
  },
};
