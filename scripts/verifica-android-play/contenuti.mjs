// C48-C52 (fase F11 «contenuti e accessibilità» del contratto android-play): titoli Jest + controlli statici.
import { esiste, leggi, percorso } from './comune.mjs';
import { testoTraduzione } from './app.mjs';
import { criterioConTitoli } from './titoli-jest.mjs';

const leggiSeEsiste = p => (esiste(percorso(p)) ? leggi(percorso(p)) : null);

// --- C48 ---------------------------------------------------------------------------------------------
const URLS = 'src/shared/constants/urls.ts';
// Account collegati dal sito ufficiale (letto il 15/10).
export const SOCIAL_C48 = {
  instagram: 'https://www.instagram.com/riseagainsthungeritalia/',
  facebook: 'https://www.facebook.com/RiseAgainstHungerItalia',
  youtube: 'https://www.youtube.com/@riseagainsthungeritaliaonl3843',
  linkedin: 'https://www.linkedin.com/company/rise-against-hunger-italia/',
};
export const staticoC48 = {
  leggi: () => ({ urls: leggiSeEsiste(URLS) }),
  verifica({ urls }) {
    if (urls == null) return `${URLS} assente`;
    for (const [rete, url] of Object.entries(SOCIAL_C48)) {
      const m = urls.match(new RegExp(`\\b${rete}\\s*:\\s*['"]([^'"]+)['"]`));
      if (!m) return `${rete} assente in ${URLS} (lettore rotto?)`;
      if (m[1] !== url) return `${rete} = ${m[1]}, atteso ${url}`;
    }
    const corte = [...urls.matchAll(/\b(\w+Short)\s*:/g)].map(m => m[1]);
    if (corte.length)
      return `varianti *Short ancora in ${URLS}: ${corte.join(', ')}`;
    return '';
  },
};

// --- C52 ---------------------------------------------------------------------------------------------
export const NOME_LEGALE = 'Rise Against Hunger Italia ETS';
export const FILE_C52 = [
  'privacy-policy.html',
  'privacy-policy-en.html',
  'docs/store/google-play/web/elimina-account.html',
  'docs/store/google-play/web/delete-account.html',
  'docs/store/google-play/scheda.md',
  'docs/store/google-play/play-console-risposte.md',
  'docs/store/google-play/rilascio.md',
  'src/locales/it.ts',
  'src/locales/en.ts',
];
// «ONLUS» ammesso solo in queste frasi di contesto storico: una frase nuova entra con il suo motivo.
export const ONLUS_STORICO = [
  // rilascio.md, Riccardo 12 (voce R25 di C20, G2): nomina la denominazione vecchia da correggere su Let's Donation.
  'è ancora intestato «Onlus»',
];
const frasiOnlus = testo =>
  testo
    .split(/\r?\n/)
    .filter(r => /\bONLUS\b/i.test(r))
    .filter(r => !ONLUS_STORICO.some(f => r.includes(f)));

export const staticoC52 = {
  leggi() {
    const file = Object.fromEntries(FILE_C52.map(n => [n, leggiSeEsiste(n)]));
    return {
      file,
      appName: {
        it: testoTraduzione(file['src/locales/it.ts'] ?? '', 'appName'),
      },
    };
  },
  verifica({ file, appName }) {
    for (const n of FILE_C52) {
      const t = file?.[n];
      if (t == null) return `${n} assente`;
      if (!t.includes(NOME_LEGALE)) return `${n} senza «${NOME_LEGALE}»`;
    }
    for (const n of FILE_C52) {
      const righe = frasiOnlus(file[n]);
      if (righe.length)
        return `«ONLUS» fuori dal contesto storico in ${n}: ${righe[0].trim().slice(0, 80)}`;
    }
    if (appName?.it !== 'Rise Against Hunger Italia')
      return `appName (it) = ${appName?.it ?? 'assente'}: il nome commerciale resta senza ETS`;
    return '';
  },
};

// --- definizioni -------------------------------------------------------------------------------------
export const DEFINIZIONI_CONTENUTI = {
  C48: {
    titoli: [
      'social coerenti: Instagram',
      'social coerenti: Facebook',
      'social coerenti: YouTube in Seguici',
    ],
    guardie: ['social coerenti: LinkedIn'],
    statico: staticoC48,
  },
  C49: {
    titoli: ['numeri nella lingua: en'],
    guardie: ['numeri nella lingua: it'],
  },
  C50: {
    titoli: [
      'contrasto: errore in tema scuro',
      'contrasto: Dona e aiuta',
      'contrasto: etichetta della scheda Azioni',
      'contrasto: segnaposto della data in chiaro',
      'contrasto: segnaposto della data in scuro',
    ],
    guardie: [
      'contrasto: testo primario e secondario in chiaro',
      'contrasto: testo primario e secondario in scuro',
    ],
  },
  C51: {
    titoli: [
      'icone con etichetta: sentinella verde',
      'icone con etichetta: la fixture senza etichetta fa fallire',
      'icone con etichetta: StatCard non annunciata disattivata',
    ],
  },
};

export const criteri = {
  ...Object.fromEntries(
    Object.entries(DEFINIZIONI_CONTENUTI).map(([id, d]) => [
      id,
      criterioConTitoli(id, d),
    ])
  ),
  C52: {
    leggi: () => ({ statico: staticoC52.leggi() }),
    verifica: ({ statico }) => staticoC52.verifica(statico),
  },
};
