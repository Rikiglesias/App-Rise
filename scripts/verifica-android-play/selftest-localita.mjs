// C39: ogni negativa cambia una sola condizione del positivo; estratto con righe reali fornite dal revisore.
import assert from 'node:assert/strict';
import { AR2025_URL } from './fonti-ar.mjs';
import { leggiLocalita, staticoC39 } from './localita.mjs';
import { negativiComuni, verde } from './selftest-codice.mjs';

// Definizione indipendente: cambiare i titoli di produzione deve rompere il selftest.
const DEF = {
  C39: {
    titoli: ['dati località: in inglese Kyiv'],
    guardie: ['dati località: in italiano Kiev'],
  },
};
const FILE = 'src/__tests__/x.test.ts';
const IMPORT =
  "import MapModalScreen from '../features/impact/screens/MapModalScreen';";
const REPORT =
  'Zimbabwe\n     1.775.088\nUcraina 52.272\n5833                             Italia';
const LOCALI = {
  it: "export default { mappa: { descrizione: 'Pasti {{meals}} nel {{anno}}', programma: 'Aiuti', risultati: 'Pasti {{meals}}' } };",
  en: "export default { mappa: { descrizione: 'Meals {{meals}} in {{anno}}', programma: 'Aid', risultati: 'Meals {{meals}}' } };",
};
const nomi = [
  ['zimbabwe', 'Gokwe North', 'Gokwe North', 'Zimbabwe', 'Zimbabwe', 1775088],
  ['ukraine', 'Kiev', 'Kyiv', 'Ucraina', 'Ukraine', 52272],
  ['italy', 'Bologna', 'Bologna', 'Italia', 'Italy', 5833],
];
const SORGENTE = `export const LOCATIONS_DATA: LocationData[] = [${nomi
  .map(
    ([id, it, en, paeseIt, paeseEn, meals]) => `{
  id: '${id}', name: { it: '${it}', en: '${en}' },
  country: { it: '${paeseIt}', en: '${paeseEn}' },
  latitude: 35.7796, longitude: -78.6382, anno: 2025, fonte: '${AR2025_URL}',
  stats: { meals: ${meals} }, description: 'mappa.descrizione',
  program: 'mappa.programma', achievements: ['mappa.risultati'],
}`
  )
  .join(',')}];`;
const OK = {
  testo: SORGENTE,
  localita: leggiLocalita(SORGENTE, LOCALI),
  estratti: { [AR2025_URL]: REPORT },
  fileTest: { [FILE]: IMPORT },
};
const v = (mut = {}) => verde('C39', { ...OK, ...mut }, DEF);
const loc = (mut, i = 0) =>
  v({ localita: OK.localita.map((l, n) => (n === i ? { ...l, ...mut } : l)) });
const testo = valore =>
  loc({
    testi: OK.localita[0].testi.map((t, i) =>
      i === 0 ? { ...t, testo: valore } : t
    ),
  });
const file = codice => v({ fileTest: { [FILE]: codice } });
const sorgente = s => v({ testo: s, localita: leggiLocalita(s, LOCALI) });

export const NEGATIVE_C39 = {
  nessunaLocalita: v({ localita: [] }),
  annoAssente: loc({ anno: NaN }),
  fonteAssente: loc({ fonte: null }),
  fonteNonRegistrata: loc({ fonte: 'https://example.org/report.pdf' }),
  fonteEreditata: loc({ fonte: 'constructor' }),
  annoDiversoDalRegistro: loc({ anno: 2024 }),
  numeroAssente: loc({ stats: { meals: 850000 } }),
  numeroLontano: v({
    estratti: {
      [AR2025_URL]: REPORT.replace(
        'Zimbabwe\n     ',
        'Zimbabwe pasti confezionati '
      ),
    },
  }),
  numeroDopoPunteggiatura: v({
    estratti: { [AR2025_URL]: REPORT.replace('Zimbabwe\n     ', 'Zimbabwe: ') },
  }),
  numeroDentroUnAltro: v({
    estratti: { [AR2025_URL]: REPORT.replace('1.775.088', '11.775.088') },
  }),
  numeroNonIntero: loc({ stats: { meals: 1775088.5 } }),
  italiaVolontari: loc(
    { stats: { ...OK.localita[2].stats, volunteers: 5833 } },
    2
  ),
  cifraAMano: testo('Pasti 1775088 nel {{anno}}'),
  cifraInProgramma: loc({
    testi: OK.localita[0].testi.map(t =>
      t.chiave === 'mappa.programma' && t.lingua === 'en'
        ? { ...t, testo: 'Aid 35' }
        : t
    ),
  }),
  cifraInRisultati: loc({
    testi: OK.localita[0].testi.map(t =>
      t.chiave === 'mappa.risultati' && t.lingua === 'it'
        ? { ...t, testo: '5 scuole' }
        : t
    ),
  }),
  segnapostoEstraneo: testo('Pasti {{totale}}'),
  traduzioneAssente: testo(null),
  nameStringa: loc({ name: 'Gokwe North' }),
  nameSenzaEn: loc({ name: { it: 'Gokwe North' } }),
  countryStringa: loc({ country: 'Zimbabwe' }),
  plantingSeeds: testo('Planting Seeds for Strong Communities'),
  aumentoVietato: v({ testo: `${SORGENTE}\n// +35 %` }),
  scuoleVietate: v({ testo: `${SORGENTE}\n// stats: { schools: 5 }` }),
  somalia: sorgente(SORGENTE.replace("id: 'zimbabwe'", "id: 'somalia'")),
  beneficiariUsa: v({ testo: `${SORGENTE}\n// stats: { beneficiaries: 74 }` }),
  mockDeiDati: file(`${IMPORT}\njest.mock('../data/LOCATIONS_DATA');`),
  commentoMapLocations: file(`${IMPORT}\n// MAP_LOCATIONS`),
  commentoLocationsData: file(`${IMPORT}\n// locationsData`),
  commentoImpactData: file(`${IMPORT}\n// impactData`),
  commentoMapModalData: file(`${IMPORT}\n// mapModalData`),
  senzaImport: file('const MapModalScreen = () => null;'),
  importCommentato: file(`// ${IMPORT}`),
  importSoloTipo: file("import type { MapModalScreen } from '../screen';"),
  importTipoNominato: file("import { type MapModalScreen } from '../screen';"),
  importAliasFalso: file(
    "import { Other as MapModalScreen } from '../screen';"
  ),
  importNamespace: file("import * as MapModalScreen from '../screen';"),
  importDentroStringa: file(`const testo = ${JSON.stringify(IMPORT)};`),
  importDentroRegExp: file("const pattern = /import MapModalScreen from '/;"),
  fileAssente: v({ fileTest: {} }),
  guardiaAssente: { ...v(), jest: v().jest.slice(0, 1) },
  fileGuardiaSenzaImport: {
    ...v(),
    jest: v().jest.map((r, i) => ({
      ...r,
      file: i ? 'src/guardia.test.tsx' : FILE,
    })),
    statico: {
      ...OK,
      fileTest: { [FILE]: IMPORT, 'src/guardia.test.tsx': 'const x = 1;' },
    },
  },
};

export const FIXTURE_C39 = {
  neg: [...negativiComuni('C39', OK, DEF), ...Object.values(NEGATIVE_C39)],
  pos: [
    v(),
    v({
      estratti: {
        [AR2025_URL]: REPORT.replace(
          'Zimbabwe\n     ',
          'Zimbabwe     '
        ).replace('1.775.088', '1775088'),
      },
    }),
    v({ estratti: { [AR2025_URL]: REPORT.replace('Ucraina', 'Ukraine') } }),
    v({ estratti: { [AR2025_URL]: REPORT.replace('Ucraina', 'Kyiv') } }),
    v({ estratti: { [AR2025_URL]: REPORT.replace('Ucraina', 'Kiev') } }),
    sorgente(
      SORGENTE.replaceAll(
        "description: 'mappa.descrizione'",
        "description: { it: 'Pasti {{meals}}', en: 'Meals {{meals}}' }"
      )
    ),
    sorgente(SORGENTE.replace("it: 'Gokwe North'", "it: 'Gokwe North 2'")),
    file("import { MapModalScreen } from '../screen';"),
    {
      ...v(),
      jest: v().jest.map((r, i) => ({
        ...r,
        file: i ? 'src/guardia.test.tsx' : FILE,
      })),
      statico: {
        ...OK,
        fileTest: { [FILE]: IMPORT, 'src/guardia.test.tsx': IMPORT },
      },
    },
  ],
};

/** Verifica anche il lettore reale e i motivi, non solo oggetti già estratti. */
export const selftestLettoreLocalita = () => {
  assert.equal(OK.localita.length, 3);
  assert.equal(OK.localita[0].testi[0].chiave, 'mappa.descrizione');
  assert.equal(OK.localita[1].name.en, 'Kyiv');
  const conCommenti = SORGENTE.replace(
    'stats: { meals:',
    '/* numeri documentati */ stats: { meals:'
  );
  assert.deepEqual(leggiLocalita(conCommenti, LOCALI), OK.localita);
  const chiaveSemplice = SORGENTE.replaceAll(
    "description: 'mappa.descrizione'",
    "descriptionKey: 'descrizione'"
  );
  const mancanti = leggiLocalita(chiaveSemplice, {
    it: 'export default {};',
    en: 'export default {};',
  });
  assert.equal(mancanti[0].testi[0].testo, null);
  assert.equal(mancanti[0].testi[1].testo, null);
  const mutazioni = [
    ['anno: 2025', 'anno: 2024', /anno 2024/],
    [
      "name: { it: 'Gokwe North', en: 'Gokwe North' }",
      "name: 'Gokwe North'",
      /name non bilingue/,
    ],
    ['meals: 1775088', 'meals: 850000', /850000 assente/],
  ];
  for (const [prima, dopo, motivo] of mutazioni) {
    const input = sorgente(SORGENTE.replace(prima, dopo));
    assert.match(
      staticoC39.verifica(input.statico, {
        jest: input.jest,
        titoli: [...DEF.C39.titoli, ...DEF.C39.guardie],
      }),
      motivo
    );
  }
  const conCifra = leggiLocalita(SORGENTE, {
    ...LOCALI,
    it: LOCALI.it.replace('Pasti {{meals}} nel', 'Pasti 123 nel'),
  });
  assert.match(
    staticoC39.verifica(
      { ...OK, localita: conCifra },
      { jest: v().jest, titoli: [...DEF.C39.titoli, ...DEF.C39.guardie] }
    ),
    /it:mappa.descrizione: cifra a mano 123/
  );
  assert.throws(
    () =>
      leggiLocalita(SORGENTE.replace('meals: 1775088', '...altriDati'), LOCALI),
    /non letterale/
  );
  const enAssente = leggiLocalita(SORGENTE, {
    ...LOCALI,
    en: "export default { altro: { descrizione: 'Wrong branch' } };",
  });
  assert.equal(enAssente[0].testi[1].testo, null);
};
