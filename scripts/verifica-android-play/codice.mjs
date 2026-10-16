// C23-C25, C27-C29 (fase F7 «codice» del contratto android-play, R8-R10): titoli Jest + controlli statici.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, elencaFile, esiste, leggi, percorso, rel } from './comune.mjs';
import { testoTraduzione } from './app.mjs';
import { criterioConTitoli } from './titoli-jest.mjs';

/** Email pubblica dell'associazione (Chi siamo, `mailto:` di ChiSiamoScreen). */
export const EMAIL_CONTATTO = 'info@riseagainsthunger.it';

const sorgentiApp = () =>
  elencaFile(
    percorso('src'),
    p =>
      /\.(ts|tsx)$/.test(p) &&
      !/[\\/](__tests__|__mocks__)[\\/]|\.(test|spec)\.tsx?$/.test(p)
  ).map(p => ({ nome: rel(p), testo: leggi(p) }));

const conta = (file, re) =>
  file.reduce(
    (n, f) => n + (f.testo.match(new RegExp(re.source, 'g')) ?? []).length,
    0
  );

const traduzioni = chiavi =>
  Object.fromEntries(
    ['it', 'en'].map(l => {
      const src = leggi(percorso('src', 'locales', `${l}.ts`));
      return [
        l,
        Object.fromEntries(chiavi.map(k => [k, testoTraduzione(src, k)])),
      ];
    })
  );

// --- C23 ---------------------------------------------------------------------------------------------
const SEGNAPOSTO_C23 = {
  'links.errors.phone': '{{phone}}',
  'links.errors.email': '{{email}}',
  'links.errors.map': '{{address}}',
};
export const staticoC23 = {
  leggi() {
    const file = sorgentiApp();
    return {
      canOpen: conta(file, /Linking\.canOpenURL\(/),
      openUrl: conta(file, /Linking\.openURL\(/),
      testi: traduzioni([
        ...Object.keys(SEGNAPOSTO_C23),
        'errorBoundary.support',
      ]),
    };
  },
  verifica({ canOpen, openUrl, testi }) {
    if (canOpen > 0) return `${canOpen} chiamate a Linking.canOpenURL( in src/`;
    if (openUrl === 0) return 'nessun Linking.openURL( trovato: lettore rotto?';
    for (const lingua of ['it', 'en']) {
      for (const [k, s] of Object.entries(SEGNAPOSTO_C23)) {
        const t = testi?.[lingua]?.[k];
        if (t == null) return `${lingua}: chiave ${k} assente`;
        if (!t.includes(s)) return `${lingua}: ${k} senza ${s}`;
      }
      const sup = testi?.[lingua]?.['errorBoundary.support'];
      if (!sup?.includes(EMAIL_CONTATTO))
        return `${lingua}: errorBoundary.support senza ${EMAIL_CONTATTO}`;
    }
    return '';
  },
};

// --- C24 ---------------------------------------------------------------------------------------------
// L'helper si riconosce dall'uso: è il modulo importato da supabaseClient.ts per `global.fetch`.
export const staticoC24 = {
  leggi() {
    const client = leggi(
      percorso('src', 'shared', 'auth', 'supabaseClient.ts')
    );
    const nomeFetch =
      client.match(/global\s*:\s*\{[^}]*\bfetch\s*:\s*(\w+)/)?.[1] ?? null;
    const modulo = nomeFetch
      ? client.match(
          new RegExp(
            `import\\s*\\{[^}]*\\b${nomeFetch}\\b[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`
          )
        )?.[1]
      : null;
    const file = sorgentiApp();
    const helper = modulo
      ? file.find(f =>
          f.nome
            .replace(/\.(ts|tsx)$/, '')
            .endsWith(modulo.replace(/^[.@/]+/, '').replace(/^src\//, ''))
        )
      : null;
    return {
      nomeFetch,
      helper: helper ? { nome: helper.nome, testo: helper.testo } : null,
      fetchDiretti: file
        .filter(f => f.nome !== helper?.nome)
        .flatMap(f => (/(^|[^.\w])fetch\(/m.test(f.testo) ? [f.nome] : [])),
    };
  },
  verifica({ nomeFetch, helper, fetchDiretti }) {
    if (!nomeFetch) return 'supabaseClient.ts senza global.fetch';
    if (!helper) return `helper di ${nomeFetch} non trovato in src/`;
    if (!/AbortController/.test(helper.testo))
      return `${helper.nome} senza AbortController`;
    if (!/15[_ ]?000|15\s*\*\s*1000/.test(helper.testo))
      return `${helper.nome} senza timeout di 15 s`;
    if (fetchDiretti.length)
      return `fetch( diretto fuori dall'helper: ${fetchDiretti.join(', ')}`;
    return '';
  },
};

// --- C29 ---------------------------------------------------------------------------------------------
// Perimetro di madge (R12): l'ingresso vero `index.ts` più `src`, test esclusi anche fra chi importa.
export const MADGE_BASE = [
  '--json',
  '--extensions',
  'ts,tsx',
  '--ts-config',
  'tsconfig.json',
  '--exclude',
  '__tests__|__mocks__|\\.test\\.|\\.spec\\.',
  'index.ts',
  'src',
];
// Orfani per natura: l'ingresso (nessuno lo importa: lo registra Expo) e le dichiarazioni di tipo ambientali.
export const ORFANI_LEGITTIMI = ['index.ts', 'src/types/images.d.ts'];
// File tolti in F7 (R12): i due hook morti, il test del primo e i barrel che nessuno importava.
export const TOLTI_C29 = [
  'src/shared/hooks/useAsyncOperation.ts',
  'src/__tests__/shared/hooks/useAsyncOperation.test.ts',
  'src/features/home/hooks/useHomeAnimations.ts',
  'src/features/about/index.ts',
  'src/features/about/screens/index.ts',
  'src/features/actions/components/ActionButtons/index.ts',
  'src/features/actions/components/shared/index.ts',
  'src/features/home/components/index.ts',
  'src/features/home/hooks/index.ts',
  'src/features/home/index.ts',
  'src/features/home/screens/index.ts',
  'src/features/impact/data/index.ts',
  'src/features/projects/index.ts',
  'src/features/projects/screens/index.ts',
  'src/features/social/index.ts',
  'src/features/social/screens/index.ts',
  'src/shared/hooks/index.ts',
  'src/shared/screens/index.ts',
];
// Le frasi false che C29 chiede di togliere (testo a `fbefa98`), cercate per frase e non per riga.
export const COMMENTI_FALSI_C29 = {
  'src/components/ui/PlatformBlur.tsx': [/\btry\s*\{/, /Gradient ottimizzato/],
  'src/shared/utils/logger.ts': [/crash reporting/i, /produzione sicura/],
  'src/shared/partner/partnerRefService.ts': [
    /raggiung\w* i log di produzione/,
  ],
  'src/features/auth/screens/CompleteProfileScreen.tsx': [/ha già l.indietro/],
};
const versioneInstallata = nome => {
  const p = percorso('node_modules', nome, 'package.json');
  return esiste(p) ? JSON.parse(leggi(p)).version : null;
};
/** Esegue madge con `modo` (`--orphans` | `--circular`): array letto dal JSON, o null con lo stderr. */
const madge = modo => {
  const cli = join(ROOT, 'node_modules', 'madge', 'bin', 'cli.js');
  const r = spawnSync(process.execPath, [cli, modo, ...MADGE_BASE], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  let elenco = null;
  try {
    elenco = JSON.parse(r.stdout);
  } catch {
    elenco = null;
  }
  const stderr = String(r.stderr ?? '')
    .trim()
    .split(/\r?\n/)
    .slice(-3)
    .join(' | ');
  return { elenco: Array.isArray(elenco) ? elenco : null, stderr };
};
export const staticoC29 = {
  leggi() {
    const pkg = JSON.parse(leggi(percorso('package.json')));
    const orfani = madge('--orphans');
    const cicli = madge('--circular');
    return {
      versione: pkg.devDependencies?.madge ?? null,
      installata: versioneInstallata('madge'),
      ingresso: {
        main: pkg.main ?? null,
        testo: esiste(percorso('index.ts'))
          ? leggi(percorso('index.ts'))
          : null,
      },
      orfani: orfani.elenco,
      cicli: cicli.elenco,
      stderr: orfani.stderr || cicli.stderr,
      ancoraPresenti: TOLTI_C29.filter(f => esiste(percorso(f))),
      commenti: Object.fromEntries(
        Object.keys(COMMENTI_FALSI_C29).map(f => [
          f,
          esiste(percorso(f)) ? leggi(percorso(f)) : null,
        ])
      ),
    };
  },
  verifica({
    versione,
    installata,
    ingresso,
    orfani,
    cicli,
    stderr,
    ancoraPresenti,
    commenti,
  }) {
    if (versione !== '8.0.0')
      return `madge in devDependencies = ${versione ?? 'assente'}, atteso 8.0.0`;
    if (installata !== '8.0.0')
      return `madge installata = ${installata ?? 'assente'}, attesa 8.0.0`;
    // `index.ts` è orfano lecito solo finché è davvero l'ingresso che registra App.
    if (ingresso?.main !== 'index.ts')
      return `package.json main = ${ingresso?.main ?? 'assente'}, atteso index.ts`;
    if (
      !/from\s+['"]\.\/App['"]/.test(ingresso?.testo ?? '') ||
      !/registerRootComponent\(\s*App\s*\)/.test(ingresso?.testo ?? '')
    )
      return 'index.ts non registra ./App con registerRootComponent';
    if (!Array.isArray(cicli))
      return `madge --circular illeggibile${stderr ? ` (${stderr})` : ''}`;
    if (cicli.length)
      return `${cicli.length} dipendenze circolari: ${cicli.map(c => c.join(' > ')).join('; ')}`;
    for (const [f, frasi] of Object.entries(COMMENTI_FALSI_C29)) {
      const testo = commenti?.[f];
      if (testo == null)
        return `${f} non trovato (positivo del controllo commenti)`;
      const resta = frasi.find(re => re.test(testo));
      if (resta) return `${f}: resta ${resta}`;
    }
    if (!Array.isArray(orfani))
      return `madge illeggibile${stderr ? ` (${stderr})` : ''}`;
    const norm = orfani.map(f => f.replace(/\\/g, '/'));
    if (!norm.includes('index.ts'))
      return 'madge non trova neppure index.ts: lettore rotto?';
    const extra = norm.filter(f => !ORFANI_LEGITTIMI.includes(f));
    if (extra.length)
      return `orfani oltre ${ORFANI_LEGITTIMI.join(' e ')}: ${extra.join(', ')}`;
    if (ancoraPresenti.length)
      return `ancora presenti: ${ancoraPresenti.join(', ')}`;
    return '';
  },
};

export const DEFINIZIONI = {
  C23: {
    titoli: [
      'link esterni senza canOpenURL: telefono',
      'link esterni senza canOpenURL: email',
      'link esterni senza canOpenURL: rifiuto mostra il contatto',
    ],
    statico: staticoC23,
  },
  C24: {
    titoli: [
      'timeout di rete: richiesta senza risposta fallisce entro 15 s',
      'timeout di rete: Accesso esce dal caricamento',
      'timeout di rete: Dona esce dal caricamento',
      'timeout di rete: messaggio come nessuna connessione',
    ],
    statico: staticoC24,
  },
  C25: {
    titoli: [
      'accesso robusto: Accesso rete',
      'accesso robusto: Accesso salvataggio sicuro',
      'accesso robusto: Registrazione rete',
      'accesso robusto: Password dimenticata rete',
      'accesso robusto: Reimposta password rete',
      'accesso robusto: avvio con sessione illeggibile',
      'accesso robusto: same_password',
      'accesso robusto: weak_password',
    ],
  },
  C27: {
    titoli: [
      'aggiornamento OTA: dentro la finestra ricarica subito',
      'aggiornamento OTA: fuori dalla finestra aspetta il prossimo avvio',
      'aggiornamento OTA: avanzamento visibile',
    ],
  },
  C28: {
    titoli: [
      "prefisso nella lingua dell'app: it",
      "prefisso nella lingua dell'app: en",
    ],
  },
  C29: {
    titoli: ["logger: argomenti di error nell'ordine giusto"],
    statico: staticoC29,
  },
};

export const criteri = Object.fromEntries(
  Object.entries(DEFINIZIONI).map(([id, d]) => [id, criterioConTitoli(id, d)])
);
