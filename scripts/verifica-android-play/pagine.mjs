// C7 (emendato R8/R9), C37-C40 (fase F9 «pagine» del contratto android-play): titoli Jest + controlli statici.
// I controlli di numeri leggono l'estratto della fonte (fonti-ar.mjs), mai una copia dei numeri scritta qui.
import { elencaFile, esegui, esiste, leggi, percorso, rel } from './comune.mjs';
import { testoTraduzione } from './app.mjs';
import {
  AR2025_URL,
  estrattoFonte,
  interiLetterali,
  letteraleDi,
  numeroNelTesto,
} from './fonti-ar.mjs';
import { BASE_CONTROPROVA, criterioConTitoli } from './titoli-jest.mjs';
import { staticoC39 } from './localita.mjs';

const ESCLUSI_TEST = /[\\/](__tests__|__mocks__)[\\/]|\.(test|spec)\.tsx?$/;
const sorgenti = (dir = 'src', filtro = () => true) =>
  elencaFile(percorso(dir), p => /\.(ts|tsx)$/.test(p) && filtro(p)).map(p => ({
    nome: rel(p),
    testo: leggi(p),
  }));
const senzaTest = f => !ESCLUSI_TEST.test(f.nome);
const contiene = (file, re) =>
  file.filter(f => re.test(f.testo)).map(f => f.nome);

// --- C7 ----------------------------------------------------------------------------------------------
export const ROTTE_MORTE_C7 = [
  'CharityShop',
  'CharityGiftCard',
  'Calendario',
  'Tracciabilita',
  'Impatto2024',
  'Progetti',
];
export const ROTTE_VIVE_C7 = [
  'Impact',
  'Meals',
  'Kits',
  'Volunteers',
  'Partners',
  'Beneficiaries',
  'MapModal',
  'Seguici',
];
// «11.100» fra «DATI MEALS» e la riga di «24.562.744»: blocco dei dati 2025 nell'estratto di C37.
export const anno2025DelleVite = estratto => {
  const da = estratto.indexOf('DATI MEALS');
  const a = estratto.indexOf('24.562.744');
  if (da < 0 || a < 0 || a < da) return false;
  const rigaFine = estratto.lastIndexOf('\n', a);
  return estratto.slice(da, rigaFine < da ? a : rigaFine).includes('11.100');
};

export const staticoC7 = {
  async leggi() {
    const tutti = sorgenti();
    const navigatori = tutti.filter(f =>
      /src\/navigation\/[^/]*Navigator\.tsx$/.test(f.nome)
    );
    const tipi =
      tutti.find(f => f.nome === 'src/navigation/types.ts')?.testo ?? null;
    const it = leggi(percorso('src', 'locales', 'it.ts'));
    return {
      file: tutti.filter(f => !f.nome.startsWith('src/locales/')),
      nomiFile: tutti.map(f => f.nome),
      navigatori,
      tipi,
      viteIt: [
        ...it.matchAll(
          /:\s*(['"`])((?:(?!\1).)*vite impattate(?:(?!\1).)*)\1/gi
        ),
      ].map(m => m[2]),
      anno2025: anno2025DelleVite(await estrattoFonte(AR2025_URL)),
    };
  },
  verifica({ file, nomiFile, navigatori, tipi, viteIt, anno2025 }) {
    if (!navigatori?.length)
      return 'nessun *Navigator.tsx in src/navigation (lettore rotto?)';
    if (tipi == null) return 'src/navigation/types.ts assente';
    const sviluppo = contiene(file, /\b(Wrapped)?DevelopmentScreen\b/);
    if (sviluppo.length)
      return `DevelopmentScreen ancora in: ${sviluppo.join(', ')}`;
    const fileMorti = nomiFile.filter(n =>
      new RegExp(
        `/(${ROTTE_MORTE_C7.join('|')}|Development)Screen\\.tsx$`
      ).test(n)
    );
    if (fileMorti.length)
      return `schermate delle rotte morte: ${fileMorti.join(', ')}`;
    for (const r of ROTTE_MORTE_C7) {
      const nav = navigatori.filter(f =>
        new RegExp(`['"\`]${r}['"\`]`).test(f.testo)
      );
      if (nav.length)
        return `rotta morta '${r}' in ${nav.map(f => f.nome).join(', ')}`;
      if (new RegExp(`\\b${r}\\s*[?]?:`).test(tipi))
        return `rotta morta '${r}' in navigation/types.ts`;
      const uso = contiene(
        file,
        new RegExp(
          `navigate\\(\\s*['"\`]${r}['"\`]|screen:\\s*['"\`]${r}['"\`]|name=["']${r}["']`
        )
      );
      if (uso.length) return `rotta morta '${r}' usata in ${uso.join(', ')}`;
    }
    const registrate = navigatori.map(f => f.testo).join('\n');
    const mancanti = ROTTE_VIVE_C7.filter(
      r => !new RegExp(`name=["']${r}["']`).test(registrate)
    );
    if (mancanti.length)
      return `rotte vive non trovate: ${mancanti.join(', ')} (lettore rotto?)`;
    if (!viteIt?.length)
      return 'nessuna etichetta con «vite impattate» in it.ts';
    const conAnno = viteIt.some(v => v.includes('2025'));
    if (anno2025 && !conAnno)
      return "l'estratto ha 11.100 nel blocco 2025 ma l'etichetta delle vite non porta il 2025";
    if (!anno2025 && conAnno)
      return "etichetta delle vite con il 2025 senza 11.100 nel blocco 2025 dell'estratto";
    return '';
  },
};

// --- C37 ---------------------------------------------------------------------------------------------
export const VIETATI_C37 = ['150+', '15.8M', '142K'];
const DIR_IMPATTO = 'src/features/impact';
// Cifre scritte a mano in una prop `value=` o nel testo JSX (fra `>` e `<`, non un confronto del codice).
export const cifreAMano = testo => [
  ...[
    ...testo.matchAll(
      /\bvalue=(?:["'][^"']*\d[^"']*["']|\{[^}]*(?<![\w.$])\d[^}]*\})/g
    ),
  ].map(m => m[0]),
  ...[...testo.matchAll(/>([^<>{}\n=&|?()]*\d[^<>{}\n=&|?()]*)</g)].map(m =>
    m[1].trim()
  ),
];

export const staticoC37 = {
  async leggi() {
    const dati = leggi(percorso(DIR_IMPATTO, 'data', 'impactData.ts'));
    const impatto = sorgenti(DIR_IMPATTO).filter(senzaTest);
    return {
      dati,
      oggetto: letteraleDi(dati, 'IMPACT_DATA'),
      estratto: await estrattoFonte(AR2025_URL),
      impatto,
      src: sorgenti().filter(senzaTest),
    };
  },
  verifica({ dati, oggetto, estratto, impatto, src }) {
    if (!oggetto) return 'IMPACT_DATA non trovato in impactData.ts';
    if (
      !new RegExp(
        `fonte\\s*:\\s*['"]${AR2025_URL.replace(/[.]/g, '[.]')}['"]`
      ).test(dati)
    )
      return `impactData.ts senza il campo fonte = ${AR2025_URL}`;
    const numeri = [...new Set(interiLetterali(oggetto))];
    if (numeri.length < 6)
      return `solo ${numeri.length} numeri in IMPACT_DATA (lettore rotto?)`;
    const assenti = numeri.filter(n => !numeroNelTesto(n, estratto ?? ''));
    if (assenti.length)
      return `numeri di IMPACT_DATA assenti dall'AR 2025: ${assenti.join(', ')}`;
    const usi = impatto.filter(
      f => !f.nome.endsWith('/impactData.ts') && /\bIMPACT_DATA\b/.test(f.testo)
    );
    if (!usi.length)
      return `nessun uso di IMPACT_DATA in ${DIR_IMPATTO} (lettore rotto?)`;
    const aMano = impatto
      .filter(f => f.nome.endsWith('.tsx'))
      .flatMap(f => cifreAMano(f.testo).map(c => `${f.nome}: ${c}`));
    if (aMano.length)
      return `cifre scritte a mano: ${aMano.slice(0, 5).join(' | ')}`;
    const vietati = src.flatMap(f =>
      VIETATI_C37.filter(v => f.testo.includes(v)).map(v => `${f.nome}: «${v}»`)
    );
    if (vietati.length) return `numeri senza fonte: ${vietati.join(', ')}`;
    return '';
  },
};

// --- C38 ---------------------------------------------------------------------------------------------
const MANIFEST = 'assets/immagini-manifest.json';
const IMMAGINE = /\.(png|jpe?g|webp|gif)$/i;
export const staticoC38 = {
  leggi() {
    const aggiunte = esegui('git', [
      'diff',
      '--name-only',
      '--diff-filter=A',
      BASE_CONTROPROVA,
      'HEAD',
    ])
      .split(/\r?\n/)
      .filter(n => IMMAGINE.test(n));
    let manifest = null;
    try {
      manifest = esiste(percorso(MANIFEST))
        ? JSON.parse(leggi(percorso(MANIFEST)))
        : null;
    } catch {
      manifest = 'illeggibile';
    }
    const voci = Array.isArray(manifest) ? manifest : [];
    return {
      src: sorgenti().filter(senzaTest),
      aggiunte,
      manifest,
      fileEsistenti: Object.fromEntries(
        voci.map(v => [v?.file, esiste(percorso(String(v?.file ?? '')))])
      ),
    };
  },
  verifica({ src, aggiunte, manifest, fileEsistenti }) {
    const remote = contiene(src, /unsplash|\bIMAGE_URLS\b/);
    if (remote.length)
      return `unsplash o IMAGE_URLS ancora in: ${remote.join(', ')}`;
    if (!Array.isArray(manifest))
      return `${MANIFEST} ${manifest == null ? 'assente' : 'non è un array JSON'}`;
    const incomplete = manifest.filter(
      v =>
        !v?.file ||
        !String(v.fonte ?? '').trim() ||
        !String(v.permesso ?? '').trim()
    );
    if (incomplete.length)
      return `voci del manifest senza file, fonte o permesso: ${incomplete.length}`;
    const assenti = manifest
      .filter(v => !fileEsistenti?.[v.file])
      .map(v => v.file);
    if (assenti.length)
      return `file del manifest assenti: ${assenti.join(', ')}`;
    const fuori = (aggiunte ?? []).filter(n => !n.startsWith('assets/'));
    if (fuori.length)
      return `immagini nuove fuori da assets/: ${fuori.join(', ')}`;
    const elencati = new Set(manifest.map(v => v.file));
    const nonElencate = (aggiunte ?? []).filter(n => !elencati.has(n));
    if (nonElencate.length)
      return `immagini nuove non nel manifest: ${nonElencate.join(', ')}`;
    return '';
  },
};

// --- C40 ---------------------------------------------------------------------------------------------
export const VISIONE_IT =
  'Ci guida la visione di un mondo senza fame, in cui cibo, salute e istruzione siano accessibili a tutti, in modo tale che chiunque possa nutrire con dignità le proprie aspirazioni.';
export const staticoC40 = {
  leggi() {
    const src = sorgenti().filter(senzaTest);
    const it = leggi(percorso('src', 'locales', 'it.ts'));
    const en = leggi(percorso('src', 'locales', 'en.ts'));
    return {
      src,
      it,
      oggetto: letteraleDi(
        leggi(percorso(DIR_IMPATTO, 'data', 'impactData.ts')),
        'IMPACT_DATA'
      ),
      visione: {
        it: testoTraduzione(it, 'visionText'),
        en: testoTraduzione(en, 'visionText'),
      },
    };
  },
  verifica({ src, it, oggetto, visione }) {
    const vecchi = contiene(
      src,
      /\bvolunteers2024\b|\bvolunteersActive\b|\bResults2024Section\b/
    );
    if (vecchi.length)
      return `chiavi o componente dei risultati 2024 ancora in: ${vecchi.join(', ')}`;
    if (!oggetto || !/\b(anno\w*|\w*[Yy]ear\w*)\s*:\s*20\d\d\b/.test(oggetto))
      return "IMPACT_DATA senza il campo dell'anno dei risultati";
    const anniAMano = src
      .filter(
        f => f.nome.startsWith(`${DIR_IMPATTO}/`) && f.nome.endsWith('.tsx')
      )
      .filter(f =>
        /(?<![\w.$'"])20[2-3]\d(?![\w'"])/.test(
          f.testo.replace(/^import .*$/gm, '')
        )
      )
      .map(f => f.nome);
    if (anniAMano.length)
      return `anno dei risultati scritto a mano in: ${anniAMano.join(', ')}`;
    if (/\bMeals\b|\bKits\b/.test(it)) return 'it.ts contiene «Meals» o «Kits»';
    if (visione?.it !== VISIONE_IT)
      return "visionText (it) diverso dalla frase dell'AR 2025";
    if (!visione?.en?.trim() || visione.en === visione.it)
      return 'visionText (en) assente o non tradotto';
    const futuro = contiene(src, /\b2030\b/);
    if (futuro.length) return `«2030» ancora in: ${futuro.join(', ')}`;
    return '';
  },
};

// --- definizioni -------------------------------------------------------------------------------------
const STATCARD = [
  'pasti dalla nascita',
  'kit dalla nascita',
  'volontari 2025',
  'associazioni partner',
  'pasti 2025',
  'vite raggiunte 2025',
];
export const DEFINIZIONI_PAGINE = {
  C7: {
    titoli: STATCARD.map(e => `StatCard aprono il dettaglio: ${e}`),
    guardie: ['StatCard aprono il dettaglio: nessuna StatCard in più'],
    statico: staticoC7,
  },
  C37: {
    titoli: [
      "numeri d'impatto: le 6 StatCard mostrano IMPACT_DATA in it",
      "numeri d'impatto: le 6 StatCard mostrano IMPACT_DATA in en",
    ],
    statico: staticoC37,
  },
  C38: {
    titoli: ['Meals', 'Kits', 'Volunteers', 'Partners', 'Beneficiaries'].map(
      r => `pagine di dettaglio: ${r} si apre e torna indietro`
    ),
    statico: staticoC38,
  },
  C39: {
    titoli: ['dati località: in inglese Kyiv'],
    guardie: ['dati località: in italiano Kiev'],
    statico: staticoC39,
  },
};

export const criteri = {
  ...Object.fromEntries(
    Object.entries(DEFINIZIONI_PAGINE).map(([id, d]) => [
      id,
      criterioConTitoli(id, d),
    ])
  ),
  C40: {
    leggi: () => ({ statico: staticoC40.leggi() }),
    verifica: ({ statico }) => staticoC40.verifica(statico),
  },
};
