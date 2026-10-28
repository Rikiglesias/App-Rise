// C22 per i criteri R24-R26 a titoli Jest (f13.mjs) e per C81: ogni fixture negativa è il positivo con UNA
// mutazione. Gli statici ricevono testi veri, così il selftest prova anche i lettori (regex e parser).
// I criteri solo statici (C61 C63 C76 C77 C80 C82) stanno in selftest-f13-testi.mjs.
import { DEFINIZIONI_F13, GUARDIE_C81, LOCALI_C72 } from './f13.mjs';
import { COMPONENTI_C65, FILE_C65, tempiOta } from './f13-statici.mjs';
import { negativiComuni, verde } from './selftest-codice.mjs';

const v = (id, statico = null) => verde(id, statico, DEFINIZIONI_F13);
const n = (id, statico = null) => negativiComuni(id, statico, DEFINIZIONI_F13);
const soloTitoli = id => ({ neg: n(id), pos: [v(id)] });
const conStatico = (id, ok, mutazioni, positivi = []) => ({
  neg: [...n(id, ok), ...mutazioni.map(m => v(id, { ...ok, ...m }))],
  pos: [v(id, ok), ...positivi.map(m => v(id, { ...ok, ...m }))],
});

// --- C56 ---
const STILI =
  'const styles = StyleSheet.create({ filterRow: { flexDirection: "row" } });';
const C56_OK = {
  testo: `<View style={[styles.filterRow, { left: 4 }]} />\n${STILI}`,
};

// --- C58 ---
const C58_OK = {
  sonda: {
    totale: 3,
    noto: true,
    file: [
      { n: 2, file: 'src/a.tsx' },
      { n: 1, file: 'src/b.tsx' },
    ],
  },
  elenco:
    'Totale: 3\n| 2 | `src/a.tsx` | C47 Home |\n| 1 | `src/b.tsx` | residuo non fotografato |',
};

// --- C65 ---
const SUBMIT = '<AuthSubmitError message={submitError} />';
const schermate = (mut = {}) => ({
  file: {
    ...Object.fromEntries(
      [...Object.values(FILE_C65), ...COMPONENTI_C65].map(f => [f, SUBMIT])
    ),
    ...mut,
  },
});
const [LOGIN] = Object.values(FILE_C65);
const [RINVIO] = COMPONENTI_C65;

// --- C73 ---
const OTA =
  'const OTA_ATTESA_MAX_MS = 30_000;\nsetTimeout(sblocca, OTA_ATTESA_MAX_MS);';
const C27_OK = {
  registro: { fileTest: { 'src/__tests__/App.test.tsx': 'aa' } },
  shaAttuali: { 'src/__tests__/App.test.tsx': 'aa' },
};
const C73_OK = {
  tempi: tempiOta([{ nome: 'App.tsx', testo: OTA }]),
  c27: C27_OK,
};

const ok81 = GUARDIE_C81.map(t => ({
  nome: t,
  titolo: t,
  stato: 'passed',
  file: 'x',
}));

// --- C72 (emendato R28-R29) ---
const [IT_C72, EN_C72] = Object.keys(LOCALI_C72);
const C72_OK = {
  testi: {
    [IT_C72]:
      "accountEliminato: 'Account eliminato. Ora usi l’app da ospite.',",
    [EN_C72]: "accountDeleted: 'Account deleted. You are now a guest.',",
  },
};

export const FIXTURE_F13 = {
  ...Object.fromEntries(
    ['C57', 'C62', 'C64', 'C66', 'C67', 'C69', 'C70', 'C74', 'C75', 'C84'].map(
      id => [id, soloTitoli(id)]
    )
  ),
  C72: conStatico('C72', C72_OK, [
    { testi: { ...C72_OK.testi, [IT_C72]: null } },
    {
      testi: {
        ...C72_OK.testi,
        [IT_C72]:
          "sessionResidua:\n  'Account eliminato: esci a  mano dal profilo.',",
      },
    },
    {
      testi: {
        ...C72_OK.testi,
        [EN_C72]: "sessionResidua: 'Please sign out manually.',",
      },
    },
  ]),
  C56: conStatico('C56', C56_OK, [
    { testo: null },
    { testo: `${C56_OK.testo}\nconst x = scaleSpacing(56);` },
    { testo: 'const styles = StyleSheet.create({ filterRow: { top: 8 } });' },
    {
      testo: `<View style={[styles.filterRow, { top: insets.top + 3 }]} />\n${STILI}`,
    },
  ]),
  C58: conStatico('C58', C58_OK, [
    { sonda: null },
    { sonda: { ...C58_OK.sonda, noto: false } },
    { elenco: null },
    { elenco: 'Totale: 3\n| 2 | `src/a.tsx` | C47 Home |' },
    { elenco: C58_OK.elenco.replace('| 2 |', '| 3 |') },
    { elenco: C58_OK.elenco.replace('C47 Home', 'da vedere') },
    { elenco: C58_OK.elenco.replace('Totale: 3', 'Totale: 4') },
  ]),
  C65: conStatico(
    'C65',
    schermate(),
    [
      schermate({ [LOGIN]: null }),
      schermate({
        [LOGIN]: '<PerfectText size={14}>\n  {submitError}\n</PerfectText>',
      }),
      schermate({ [LOGIN]: '<Text>{form.submitError}</Text>' }),
      schermate({
        [LOGIN]:
          "<PerfectText>\n  {error ?? t('auth.resend.sent')}\n</PerfectText>",
      }),
      schermate({ [RINVIO]: null }),
      schermate({
        [RINVIO]: '<PerfectText size={14}>\n  {error}\n</PerfectText>',
      }),
    ],
    [
      schermate({
        [LOGIN]: '<PerfectText>\n  {profileReadError}\n</PerfectText>',
      }),
    ]
  ),
  C68: conStatico('C68', { scenari: 2 }, [{ scenari: 1 }, { scenari: 0 }]),
  C71: conStatico(
    'C71',
    { testo: '/** Rinuncia illeggibile: si esce senza dati. */' },
    [
      { testo: null },
      {
        testo:
          '/**\n * Fail-open: se lo storage non risponde si risponde\n * «nessuna rinuncia». Qui …\n */',
      },
    ]
  ),
  C73: conStatico(
    'C73',
    C73_OK,
    [
      { tempi: [] },
      {
        tempi: tempiOta([
          { nome: 'App.tsx', testo: 'const OTA_ATTESA_MAX_MS = 30_000;' },
        ]),
      },
      {
        tempi: tempiOta([
          { nome: 'App.tsx', testo: OTA.replace('30_000', '30_001') },
        ]),
      },
      {
        tempi: tempiOta([
          {
            nome: 'App.tsx',
            testo: OTA.replaceAll('OTA_ATTESA_MAX_MS', 'ATTESA'),
          },
        ]),
      },
      { tempi: [{ nome: 'App.tsx', costante: 'OTA_TIMEOUT', ms: 0 }] },
      { c27: { registro: null, shaAttuali: {} } },
      {
        c27: { ...C27_OK, shaAttuali: { 'src/__tests__/App.test.tsx': 'bb' } },
      },
    ],
    [
      {
        tempi: tempiOta([
          {
            nome: 'App.tsx',
            testo: 'const OTA_TIMEOUT_S = 20;\nf(OTA_TIMEOUT_S);',
          },
        ]),
      },
    ]
  ),
  C81: {
    neg: [
      { jest: ok81.slice(1) },
      { jest: ok81.map((r, i) => (i === 0 ? { ...r, stato: 'failed' } : r)) },
      { jest: null },
    ],
    pos: [{ jest: ok81 }],
  },
};
