// C22 per i criteri di F9 (pagine): mutazioni comuni dei criteri a titoli più le fixture degli statici.
// Ogni fixture negativa è il positivo con UNA mutazione.
import { AR2025_URL } from './fonti-ar.mjs';
import { DEFINIZIONI_PAGINE, ROTTE_VIVE_C7, VISIONE_IT } from './pagine.mjs';
import { negativiComuni, verde } from './selftest-codice.mjs';
import { FIXTURE_C39 } from './selftest-localita.mjs';

const v = (id, statico = null) => verde(id, statico, DEFINIZIONI_PAGINE);
const n = (id, statico = null) =>
  negativiComuni(id, statico, DEFINIZIONI_PAGINE);
const f = (nome, testo) => ({ nome, testo });

// --- C7 ---
const NAV = f(
  'src/navigation/ImpactStackNavigator.tsx',
  ROTTE_VIVE_C7.map(r => `<S.Screen name="${r}" component={X} />`).join('\n')
);
const C7_OK = {
  file: [
    f('src/features/impact/components/StatCards.tsx', "navigate('Meals')"),
  ],
  nomiFile: ['src/features/impact/components/StatCards.tsx'],
  navigatori: [NAV],
  tipi: 'export type ImpactStackParamList = { Meals: undefined };',
  viteIt: ['Vite impattate nel 2025'],
  anno2025: true,
};
const c7 = mut => v('C7', { ...C7_OK, ...mut });
const conFile = testo => c7({ file: [...C7_OK.file, f('src/x.tsx', testo)] });

// --- C37 ---
const C37_OK = {
  dati: `export const IMPACT_DATA = { fonte: '${AR2025_URL}' };`,
  oggetto:
    '{ a: 2248344, b: 2397600, c: 24562744, d: 114407, e: 11100, g: 10414 }',
  estratto:
    'DATI MEALS 11.100 2.248.344 2.397.600 24.562.744 114.407 10.414 volontari',
  impatto: [
    f(
      'src/features/impact/screens/MealsScreen.tsx',
      '<StatCard value={IMPACT_DATA.a} />'
    ),
  ],
  src: [],
};
const c37 = mut => v('C37', { ...C37_OK, ...mut });
const conImpatto = testo =>
  c37({
    impatto: [...C37_OK.impatto, f('src/features/impact/screens/K.tsx', testo)],
  });

// --- C38 ---
const IMG = 'assets/images/impatto/pasti.jpg';
const C38_OK = {
  src: [],
  aggiunte: [IMG],
  manifest: [
    {
      file: IMG,
      fonte: 'Annual Report 2025, p. 12',
      permesso: 'foto di RAH Italia',
    },
  ],
  fileEsistenti: { [IMG]: true },
};
const c38 = mut => v('C38', { ...C38_OK, ...mut });

// --- C40 ---
const C40_OK = {
  src: [],
  it: `visionText: '${VISIONE_IT}',`,
  oggetto: '{ annoRisultati: 2025 }',
  visione: {
    it: VISIONE_IT,
    en: 'We are guided by the vision of a world without hunger.',
  },
};
const c40 = mut => ({ statico: { ...C40_OK, ...mut } });
const conSrc = (nome, testo) => c40({ src: [f(nome, testo)] });

export const FIXTURE_PAGINE = {
  C7: {
    neg: [
      ...n('C7', C7_OK),
      c7({ navigatori: [] }),
      c7({ tipi: null }),
      conFile('<WrappedDevelopmentScreen />'),
      c7({
        nomiFile: [
          ...C7_OK.nomiFile,
          'src/features/impact/screens/Impatto2024Screen.tsx',
        ],
      }),
      c7({
        navigatori: [
          f(NAV.nome, `${NAV.testo}\n<S.Screen name="CharityShop" />`),
        ],
      }),
      c7({ tipi: `${C7_OK.tipi}\ntype M = { Progetti: undefined };` }),
      conFile("navigation.navigate('Calendario')"),
      conFile("{ screen: 'Tracciabilita' }"),
      conFile('<Stack.Screen name="CharityGiftCard" />'),
      c7({
        navigatori: [
          f(NAV.nome, NAV.testo.replace('name="Seguici"', 'name="Altro"')),
        ],
      }),
      c7({ viteIt: [] }),
      c7({ viteIt: ['Vite impattate'] }),
      c7({ anno2025: false }),
    ],
    pos: [v('C7', C7_OK), c7({ anno2025: false, viteIt: ['Vite impattate'] })],
  },
  C37: {
    neg: [
      ...n('C37', C37_OK),
      c37({ oggetto: null }),
      c37({
        dati: 'export const IMPACT_DATA = { fonte: "https://example.org/report.pdf" };',
      }),
      c37({ oggetto: '{ a: 2248344, b: 2397600 }' }),
      c37({ oggetto: `${C37_OK.oggetto.slice(0, -1)}, h: 3136968 }` }),
      c37({ estratto: '' }),
      c37({
        impatto: [
          f(
            'src/features/impact/screens/MealsScreen.tsx',
            '<StatCard value="tanti" />'
          ),
        ],
      }),
      conImpatto('<StatCard value="150" />'),
      conImpatto('<StatCard value={1500} />'),
      conImpatto('<Text>2.248.344 pasti</Text>'),
      c37({ src: [f('src/locales/it.ts', "partners: '150+ partner'")] }),
    ],
    pos: [v('C37', C37_OK), conImpatto('{a > 0 ? <A /> : <B />}')],
  },
  C38: {
    neg: [
      ...n('C38', C38_OK),
      c38({
        src: [f('src/x.ts', "uri: 'https://images.unsplash.com/photo-1'")],
      }),
      c38({ src: [f('src/x.ts', 'IMAGE_URLS.meals')] }),
      c38({ manifest: null }),
      c38({ manifest: 'illeggibile' }),
      c38({ manifest: [{ file: IMG, fonte: 'AR 2025', permesso: '' }] }),
      c38({ fileEsistenti: { [IMG]: false } }),
      c38({ aggiunte: [IMG, 'src/features/impact/foto.png'] }),
      c38({ aggiunte: [IMG, 'assets/images/impatto/kit.jpg'] }),
    ],
    pos: [
      v('C38', C38_OK),
      c38({ aggiunte: [], manifest: [], fileEsistenti: {} }),
    ],
  },
  C39: FIXTURE_C39,
  C40: {
    neg: [
      conSrc('src/locales/it.ts', "volunteers2024: 'Volontari 2024'"),
      conSrc(
        'src/features/impact/components/Results2024Section.tsx',
        'export const Results2024Section = 1;'
      ),
      c40({ oggetto: '{ pasti: 2248344 }' }),
      c40({ oggetto: null }),
      conSrc(
        'src/features/impact/screens/ImpactTabScreen.tsx',
        '<Text>{t("risultati")} 2025</Text>'
      ),
      c40({ it: `${C40_OK.it}\nmeals: 'Meals',` }),
      c40({
        visione: {
          ...C40_OK.visione,
          it: 'Un mondo senza fame entro il 2030.',
        },
      }),
      c40({ visione: { ...C40_OK.visione, en: '' } }),
      c40({ visione: { it: VISIONE_IT, en: VISIONE_IT } }),
      conSrc('src/locales/en.ts', "goal: 'by 2030'"),
    ],
    pos: [
      c40({}),
      conSrc(
        'src/features/impact/screens/A.tsx',
        "import x from './2025';\nconst y = data.anno;"
      ),
    ],
  },
};
