// C22 per i criteri a titoli Jest (R8-R10): ogni fixture negativa è il positivo con UNA mutazione.
import { BASE_CONTROPROVA, BASE_R27, rigorosa } from './titoli-jest.mjs';
import { COMMENTI_FALSI_C29, DEFINIZIONI, EMAIL_CONTATTO } from './codice.mjs';

const FILE = 'src/__tests__/x.test.ts';
const COMMIT = 'c'.repeat(40);

/** Ingresso verde per un criterio: ogni titolo passato su HEAD, rosso alla base, sha coerenti. */
export const verde = (id, statico = null, definizioni = DEFINIZIONI) => {
  const { titoli, guardie = [], base = BASE_CONTROPROVA } = definizioni[id];
  return {
    jest: [...titoli, ...guardie].map(t => ({
      nome: t,
      titolo: t,
      stato: 'passed',
      file: FILE,
    })),
    controprova: {
      criterio: id,
      base,
      titoli,
      esitiAllaBase: Object.fromEntries(titoli.map(t => [t, 'failed'])),
      ...(rigorosa(base)
        ? {
            motiviAllaBase: Object.fromEntries(
              titoli.map(t => [t, 'Error: expect(received).toBe(expected)'])
            ),
          }
        : {}),
      fileTest: { [FILE]: 'aa' },
      ...(base === BASE_R27 ? { commitFileTest: COMMIT } : {}),
    },
    shaAttuali: { [FILE]: 'aa' },
    storia: {
      precedente: null,
      commitPrecedente: null,
      commitNoto: base === BASE_R27 ? true : null,
    },
    statico,
  };
};

/** Le mutazioni che ogni criterio a titoli deve rifiutare. */
export const negativiComuni = (
  id,
  statico = null,
  definizioni = DEFINIZIONI
) => {
  const ok = verde(id, statico, definizioni);
  const [primo] = definizioni[id].titoli;
  return [
    { ...ok, jest: ok.jest.slice(1) }, // un titolo manca
    {
      ...ok,
      jest: ok.jest.map((r, i) => (i === 0 ? { ...r, stato: 'pending' } : r)),
    }, // saltato
    {
      ...ok,
      jest: ok.jest.map((r, i) => (i === 0 ? { ...r, stato: 'failed' } : r)),
    }, // rosso
    {
      ...ok,
      jest: ok.jest.map((r, i) =>
        i === 0 ? { ...r, nome: `${primo} bis`, titolo: `${primo} bis` } : r
      ),
    }, // titolo solo simile
    { ...ok, jest: null }, // suite illeggibile
    { ...ok, controprova: null },
    {
      ...ok,
      controprova: {
        ...ok.controprova,
        esitiAllaBase: { ...ok.controprova.esitiAllaBase, [primo]: 'passed' },
      },
    },
    { ...ok, controprova: { ...ok.controprova, base: 'deadbee' } },
    { ...ok, shaAttuali: { [FILE]: 'bb' } }, // test cambiato dopo la controprova
    {
      ...ok,
      controprova: {
        ...ok.controprova,
        esitiAllaBase: { ...ok.controprova.esitiAllaBase, [primo]: 'assente' },
      },
      storia: {
        ...ok.storia,
        precedente: { ...ok.controprova, esitiAllaBase: { [primo]: 'failed' } },
        commitPrecedente: 'abc1234',
      },
    }, // R29: controprova rifatta, un titolo rosso diventato assente
    ...(ok.controprova.base === BASE_R27
      ? [
          {
            ...ok,
            controprova: { ...ok.controprova, commitFileTest: undefined },
          }, // R29: senza il commit dei file di test
          { ...ok, storia: { ...ok.storia, commitNoto: false } }, // commit fuori dalla storia di HEAD
        ]
      : []),
    ...(rigorosa(ok.controprova.base)
      ? [
          {
            ...ok,
            controprova: {
              ...ok.controprova,
              esitiAllaBase: {
                ...ok.controprova.esitiAllaBase,
                [primo]: 'assente',
              },
            },
          }, // R25: il file non si carica alla base
          {
            ...ok,
            controprova: {
              ...ok.controprova,
              motiviAllaBase: {
                ...ok.controprova.motiviAllaBase,
                [primo]: 'TypeError: (0 , _x.nuova) is not a function',
              },
            },
          }, // R25: rosso perché manca il punto d'ingresso
          {
            ...ok,
            controprova: { ...ok.controprova, motiviAllaBase: undefined },
          }, // R25: registro senza i motivi
          {
            ...ok,
            controprova: { ...ok.controprova, base: BASE_CONTROPROVA },
          }, // base del lavoro R8-R10 al posto di quella R24
        ]
      : []),
  ];
};

const testiC23 = (mut = {}) => {
  const base = {
    'links.errors.phone': 'Chiama {{phone}}',
    'links.errors.email': 'Scrivi a {{email}}',
    'links.errors.map': 'Indirizzo: {{address}}',
    'errorBoundary.support': `Scrivi a ${EMAIL_CONTATTO}`,
  };
  return { it: { ...base, ...mut }, en: { ...base } };
};
const C23_OK = { canOpen: 0, openUrl: 5, testi: testiC23() };

const C24_OK = {
  nomeFetch: 'fetchConTimeout',
  helper: {
    nome: 'src/shared/net/fetchConTimeout.ts',
    testo: 'new AbortController(); const T = 15_000;',
  },
  fetchDiretti: [],
};

const COMMENTI_PULITI = Object.fromEntries(
  Object.keys(COMMENTI_FALSI_C29).map(f => [f, '// commento vero\n'])
);
const C29_OK = {
  versione: '8.0.0',
  installata: '8.0.0',
  ingresso: {
    main: 'index.ts',
    testo: "import App from './App';\nregisterRootComponent(App);\n",
  },
  orfani: ['index.ts', 'src/types/images.d.ts'],
  cicli: [],
  stderr: '',
  ancoraPresenti: [],
  commenti: COMMENTI_PULITI,
};

export const FIXTURE_CODICE = {
  C23: {
    neg: [
      ...negativiComuni('C23', C23_OK),
      verde('C23', { ...C23_OK, canOpen: 1 }),
      verde('C23', { ...C23_OK, openUrl: 0 }),
      verde('C23', {
        ...C23_OK,
        testi: testiC23({
          'links.errors.phone': 'Impossibile aprire il dialer.',
        }),
      }),
      verde('C23', {
        ...C23_OK,
        testi: testiC23({ 'errorBoundary.support': 'Contatta il supporto' }),
      }),
    ],
    pos: [verde('C23', C23_OK)],
  },
  C24: {
    neg: [
      ...negativiComuni('C24', C24_OK),
      verde('C24', { ...C24_OK, nomeFetch: null }),
      verde('C24', { ...C24_OK, helper: null }),
      verde('C24', {
        ...C24_OK,
        helper: { ...C24_OK.helper, testo: 'const T = 15_000;' },
      }),
      verde('C24', {
        ...C24_OK,
        helper: { ...C24_OK.helper, testo: 'new AbortController(); 30_000' },
      }),
      verde('C24', {
        ...C24_OK,
        fetchDiretti: ['src/features/actions/hooks/useDona.ts'],
      }), // esca: fetch( diretto
    ],
    pos: [verde('C24', C24_OK)],
  },
  C25: { neg: negativiComuni('C25'), pos: [verde('C25')] },
  C27: { neg: negativiComuni('C27'), pos: [verde('C27')] },
  C28: { neg: negativiComuni('C28'), pos: [verde('C28')] },
  C29: {
    neg: [
      ...negativiComuni('C29', C29_OK),
      verde('C29', { ...C29_OK, versione: '^8.0.0' }),
      verde('C29', { ...C29_OK, orfani: null }),
      verde('C29', { ...C29_OK, orfani: [] }),
      verde('C29', {
        ...C29_OK,
        orfani: [...C29_OK.orfani, 'shared/hooks/index.ts'],
      }),
      verde('C29', {
        ...C29_OK,
        ancoraPresenti: ['src/shared/hooks/useAsyncOperation.ts'],
      }),
      verde('C29', { ...C29_OK, installata: '8.0.1' }),
      verde('C29', { ...C29_OK, cicli: null }),
      verde('C29', { ...C29_OK, cicli: [['a.ts', 'b.ts']] }),
      verde('C29', {
        ...C29_OK,
        ingresso: { ...C29_OK.ingresso, main: 'App.tsx' },
      }),
      verde('C29', {
        ...C29_OK,
        ingresso: { ...C29_OK.ingresso, testo: "import App from './App';\n" },
      }),
      verde('C29', { ...C29_OK, installata: null }),
      verde('C29', {
        ...C29_OK,
        commenti: {
          ...COMMENTI_PULITI,
          'src/components/ui/PlatformBlur.tsx': 'try {\n} catch {}',
        },
      }),
      verde('C29', {
        ...C29_OK,
        commenti: {
          ...COMMENTI_PULITI,
          'src/features/auth/screens/CompleteProfileScreen.tsx':
            "questa schermata ha già l'indietro e i comandi",
        },
      }),
      verde('C29', {
        ...C29_OK,
        commenti: {
          ...COMMENTI_PULITI,
          'src/shared/utils/logger.ts': null,
        },
      }),
    ],
    pos: [verde('C29', C29_OK)],
  },
};
