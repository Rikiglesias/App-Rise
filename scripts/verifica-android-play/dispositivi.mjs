// C41-C46, C54 (fase F10 «tutti i telefoni» del contratto android-play): titoli Jest + controlli statici.
// C47 (matrice di emulatori sulla build di C10) è della fase F12 e sta con gli altri criteri del dispositivo.
import { elencaFile, leggi, percorso, rel } from './comune.mjs';
import { criterioConTitoli } from './titoli-jest.mjs';

const ESCLUSI_TEST = /[\\/](__tests__|__mocks__)[\\/]|\.(test|spec)\.tsx?$/;
const sorgentiApp = () =>
  elencaFile(
    percorso('src'),
    p => /\.(ts|tsx)$/.test(p) && !ESCLUSI_TEST.test(p)
  ).map(p => ({
    nome: rel(p),
    testo: leggi(p),
  }));

// --- C44 ---------------------------------------------------------------------------------------------
// Costanti di spazio della barra presenti alla base (lette il 16/10): un nome nuovo con lo stesso ruolo va aggiunto qui.
export const SPAZI_BARRA_C44 = [
  { nome: 'TAB_BAR_HEIGHT', re: /\bTAB_BAR_HEIGHT\b/ },
  {
    nome: '+ 95 (altezza della barra scritta a mano)',
    re: /\+\s*95\b|\b95\s*\+/,
  },
];
// Radici delle schede: Home, Impatto, Azioni e il layout comune delle schermate della scheda Profilo.
export const RADICI_C44 = [
  'src/features/home/screens/HomeScreen.tsx',
  'src/features/impact/screens/ImpactTabScreen.tsx',
  'src/features/actions/screens/ContributeTabScreen.tsx',
  'src/features/auth/components/AuthScreen.tsx',
];
export const staticoC44 = {
  leggi() {
    const file = sorgentiApp();
    return {
      file,
      radici: Object.fromEntries(
        RADICI_C44.map(n => [n, file.find(f => f.nome === n)?.testo ?? null])
      ),
    };
  },
  verifica({ file, radici }) {
    if (!file?.length) return 'nessun sorgente in src/ (lettore rotto?)';
    for (const s of SPAZI_BARRA_C44) {
      const dove = file.filter(f => s.re.test(f.testo)).map(f => f.nome);
      if (dove.length)
        return `costante di spazio della barra «${s.nome}» in: ${dove.join(', ')}`;
    }
    for (const [nome, testo] of Object.entries(radici ?? {})) {
      if (testo == null) return `${nome} assente`;
      if (
        !/\buseBottomTabBarHeight\b|\bBottomTabBarHeightContext\b/.test(testo)
      )
        return `${nome} senza useBottomTabBarHeight`;
    }
    return '';
  },
};

// --- C45 ---------------------------------------------------------------------------------------------
const PERFECT_MODAL = 'src/components/ui/PerfectModal.tsx';
export const staticoC45 = {
  leggi: () => ({
    testo: sorgentiApp().find(f => f.nome === PERFECT_MODAL)?.testo ?? null,
  }),
  verifica({ testo }) {
    if (testo == null) return `${PERFECT_MODAL} assente`;
    if (/(?<![\w.])(768|600)(?![\w.])/.test(testo))
      return 'PerfectModal ha ancora una soglia 768/600';
    if (!/\buseDeviceType\b/.test(testo))
      return 'PerfectModal non usa useDeviceType';
    return '';
  },
};

// --- definizioni -------------------------------------------------------------------------------------
const CONTROLLI_C43 = [
  'schede',
  'indietro',
  'chiudi',
  'contatti',
  'social',
  'StatCard',
  "pulsanti dell'account",
];
const ROTAZIONE_C54 = [
  'barra delle schede',
  'Home',
  'Impatto',
  'Azioni',
  'Profilo',
  'MapModalScreen',
  'PerfectModal',
  "schermate dell'account",
];
export const DEFINIZIONI_DISPOSITIVI = {
  C41: {
    titoli: [
      "finestre scorrevoli: uscita dall'app",
      'finestre scorrevoli: info donazioni',
    ],
  },
  C42: {
    titoli: [
      'scala del testo: minimo 12 dp',
      'scala del testo: nessuna zona morta',
      'scala del testo: tetto 2,0 anche sui campi',
    ],
  },
  C43: {
    titoli: [
      'aree toccabili: minimo 48 dp',
      ...CONTROLLI_C43.map(c => `aree toccabili: ${c}`),
    ],
  },
  C44: {
    titoli: [
      'barra delle schede: cresce col testo',
      'barra delle schede: spazio sotto i contenuti = altezza vera',
    ],
    statico: staticoC44,
  },
  C45: {
    titoli: [
      'modali e mappa: PerfectModal usa il tipo di dispositivo',
      "modali e mappa: spazio della barra solo dove c'è",
    ],
    statico: staticoC45,
  },
  C46: {
    titoli: [
      'riduci animazioni: animazioni a durata 0',
      "lingua al ritorno: schermata già montata passa all'inglese",
      'lingua al ritorno: numeri nella nuova lingua',
    ],
  },
  C54: {
    titoli: ROTAZIONE_C54.map(
      c => `rotazione: ${c} si ridisegna con le nuove dimensioni`
    ),
  },
};

export const criteri = Object.fromEntries(
  Object.entries(DEFINIZIONI_DISPOSITIVI).map(([id, d]) => [
    id,
    criterioConTitoli(id, d),
  ])
);
