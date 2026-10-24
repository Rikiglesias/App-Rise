// C22 per i criteri R24-R26 solo statici (C61 C63 C76 C77 C80 C82): ogni fixture negativa è il positivo con
// UNA mutazione, su testi veri che passano dai lettori. I criteri a titoli Jest stanno in selftest-f13.mjs.
import { ESENTI_C82 } from './f13-statici.mjs';
import { CHIAVI_C61 } from './f13-testi.mjs';

const statico = (ok, mutazioni, positivi = []) => ({
  neg: mutazioni.map(m => ({ statico: { ...ok, ...m } })),
  pos: [{ statico: ok }, ...positivi.map(m => ({ statico: { ...ok, ...m } }))],
});

// --- C61 ---
const it = {
  'auth.delete.confirmNow':
    'L’account sarà eliminato. Il profilo su Let’s Donation resta: chiedilo a loro.',
  'auth.delete.warning':
    "I dati dell'app spariscono; quelli di Let's Donation no.",
  'partner.disclosureBody':
    'Let’s Donation usa un account distinto da quello dell’app.',
};
const en = {
  'auth.delete.confirmNow':
    "Your app account will be deleted. Let's Donation keeps its own.",
  'auth.delete.warning': 'App data goes away; Let’s Donation data does not.',
  'partner.disclosureBody':
    'Let’s Donation uses a separate account from the app one.',
};
const C61_OK = {
  testi: { it, en },
  parita: [{ titolo: 'parità it/en', stato: 'passed' }],
};
const testi61 = (l, k, t) => ({
  testi: { ...C61_OK.testi, [l]: { ...C61_OK.testi[l], [k]: t } },
});

// --- C63 ---
const C63_OK = {
  file: {
    'privacy-policy.html':
      'Sede legale: via dei Fornaciai 17,\n  40129 Bologna',
    'privacy-policy-en.html':
      'Registered office: Via dei Fornaciai 17, 40129 Bologna',
  },
};

// --- C76 ---
const CURSOR =
  "## TL;DR\n- **Usa SEMPRE**: `PerfectText`\n```ts\nimport { PerfectText } from '@/components/ui';\n```\n---\n";
const SORGENTI = [
  {
    nome: 'src/components/ui/index.ts',
    testo: "export * from './PerfectText';",
  },
  {
    nome: 'src/components/ui/PerfectText.tsx',
    testo: 'export const PerfectText = () => null;',
  },
];
const docs76 = (mut = {}) => ({
  '.cursorrules': CURSOR,
  'docs/guides/development.md': 'Nessuna regola sulla scala.',
  'docs/guides/quality-standards.md': 'Nessuna regola sulla scala.',
  ...mut,
});
const C76_OK = { file: docs76(), sorgenti: SORGENTI };

// --- C80 ---
const C80_OK = {
  risposte:
    "| Gift card di Let's Donation | La fatturazione di Play non è richiesta per le gift card (support.google.com/googleplay/android-developer/answer/10281818, letta il 24/10/2026) |",
  rilascio: 'Gift card: la decisione resta a Riccardo.',
};

// --- C82 ---
const C82_OK = {
  config: "ios: {}, userInterfaceStyle: 'light',",
  file: [
    {
      nome: 'App.tsx',
      testo: '<UniversalThemeProvider>{app}</UniversalThemeProvider>',
    },
    {
      nome: ESENTI_C82[1],
      testo: "const toggleTheme = () => setTheme('dark');",
    },
  ],
};
const file82 = (...f) => ({ file: [...C82_OK.file, ...f] });
export const FIXTURE_F13_TESTI = {
  C61: statico(C61_OK, [
    testi61(
      'it',
      'auth.delete.confirmNow',
      'L’account e tutti i dati di Let’s Donation spariscono.'
    ),
    testi61('en', 'auth.delete.warning', 'Your data will be deleted.'),
    testi61(
      'it',
      'partner.disclosureBody',
      'Let’s Donation: dovrai creare un account distinto.'
    ),
    testi61(
      'en',
      'partner.disclosureBody',
      'You will create a separate account.'
    ),
    testi61('it', CHIAVI_C61[0], null),
    { parita: [] },
    { parita: [{ titolo: 'parità it/en', stato: 'failed' }] },
  ]),
  C63: statico(C63_OK, [
    { file: { ...C63_OK.file, 'privacy-policy.html': null } },
    {
      file: {
        ...C63_OK.file,
        'privacy-policy-en.html':
          'Registered office address to be added. Via dei Fornaciai 17, 40129 Bologna',
      },
    },
    { file: { ...C63_OK.file, 'privacy-policy.html': 'Sede legale: Bologna' } },
  ]),
  C76: statico(
    C76_OK,
    [
      {
        file: docs76({
          '.cursorrules': `${CURSOR}- **Vietato**: \`allowFontScaling=true\``,
        }),
      },
      {
        file: docs76({
          'docs/guides/development.md': '`immunity={true}` sempre',
        }),
      },
      {
        file: docs76({
          '.cursorrules': CURSOR.replace(
            '`PerfectText`',
            '`PerfectText`, `scaleFont`'
          ),
        }),
      },
      {
        file: docs76({
          '.cursorrules': CURSOR.replace(
            "'@/components/ui'",
            "'@/shared/constants/responsiveSystem'"
          ),
        }),
      },
      { file: docs76({ 'docs/guides/quality-standards.md': null }) },
      { sorgenti: [SORGENTI[0]] },
    ],
    [
      {
        file: docs76({
          'docs/guides/development.md':
            'allowFontScaling=true resta acceso per scelta (C42)',
        }),
      },
    ]
  ),
  C77: statico(
    { testo: null },
    [{ testo: 'expect(theoreticalLayout.lineCount).toBe(testCase.lines);' }],
    [{ testo: 'expect(misura.righe).toBe(2);' }]
  ),
  C80: statico(C80_OK, [
    { risposte: null },
    {
      risposte: C80_OK.risposte.replace(
        'support.google.com/googleplay/android-developer/answer/10281818, ',
        ''
      ),
    },
    { risposte: C80_OK.risposte.replace('24/10/2026', 'oggi') },
    { risposte: C80_OK.risposte.replace('non è richiesta', 'è richiesta') },
    { rilascio: 'Gift card: le regole di Google non le trattano.' },
    { risposte: `${C80_OK.risposte}\n| Altro | Non trattate esplicitamente |` },
  ]),
  C82: statico(
    C82_OK,
    [
      { config: "userInterfaceStyle: 'automatic'," },
      { config: 'ios: {}' },
      { config: `${C82_OK.config}\n ios: { userInterfaceStyle: 'dark' },` },
      file82({ nome: 'src/x.tsx', testo: "setTheme('dark');" }),
      file82({ nome: 'App.tsx', testo: 'toggleTheme ();' }),
      file82({
        nome: 'App.tsx',
        testo: '<UniversalThemeProvider initialTheme="dark">',
      }),
      file82({
        nome: 'App.tsx',
        testo: '<UniversalThemeProvider initialTheme={tema}>',
      }),
    ],
    [
      file82({
        nome: 'App.tsx',
        testo: '<UniversalThemeProvider initialTheme="system">',
      }),
    ]
  ),
};
