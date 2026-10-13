// C7-C8: comportamento dell'app (contratto del goal android-play).
import { join } from 'node:path';
import {
  PACKAGE,
  VERIFICA_DIR,
  elencaFile,
  esiste,
  leggi,
  normalizzaSpazi,
  percorso,
  rel,
  testiDump,
} from './comune.mjs';

// I valori di traduzione non sono rotte: `volunteersLabel: 'Volunteers'` è un'etichetta.
const ESCLUSI_ROTTE = [
  { re: /Navigator\.tsx$/, motivo: 'registra le rotte' },
  { re: /navigation\/types\.ts$/, motivo: 'tipi delle rotte' },
  {
    re: /src\/locales\/[^/]+\.ts$/,
    motivo: 'testi tradotti, non nomi di rotta (precisazione da ratificare)',
  },
];

/** Rotte registrate con WrappedDevelopmentScreen in un file *Navigator.tsx. */
export const rotteInSviluppo = sorgente =>
  sorgente
    .split(/<\w+\.Screen\b/)
    .slice(1)
    .map(blocco => blocco.slice(0, blocco.indexOf('/>') + 1 || undefined))
    .filter(b => /component=\{WrappedDevelopmentScreen\}/.test(b))
    .map(b => b.match(/\bname=["']([^"']+)["']/)?.[1])
    .filter(Boolean);

/** Testo di una chiave `a.b.c` in un file di traduzione (stringhe tra apici, anche su più righe). */
export const testoTraduzione = (sorgente, chiave) => {
  let blocco = sorgente;
  const parti = chiave.split('.');
  for (const [i, parte] of parti.entries()) {
    const at = blocco.search(new RegExp(`\\b${parte}\\s*:`));
    if (at < 0) return null;
    blocco = blocco.slice(at);
    if (i === parti.length - 1) {
      const m = blocco.match(/:\s*(['"`])((?:\\.|(?!\1)[\s\S])*)\1/);
      return m ? m[2].replace(/\\(['"`\\])/g, '$1') : null;
    }
  }
  return null;
};

export const criteri = {
  C7: {
    leggi() {
      const navigatori = elencaFile(percorso('src', 'navigation'), p =>
        p.endsWith('Navigator.tsx')
      );
      const rotte = [
        ...new Set(navigatori.flatMap(p => rotteInSviluppo(leggi(p)))),
      ];
      const tutti = elencaFile(percorso('src'), p =>
        /\.(ts|tsx|js|jsx)$/.test(p)
      ).map(rel);
      const esclusi = tutti
        .map(nome => ({
          nome,
          motivo: ESCLUSI_ROTTE.find(e => e.re.test(nome))?.motivo,
        }))
        .filter(e => e.motivo);
      const file = tutti
        .filter(nome => !esclusi.some(e => e.nome === nome))
        .map(nome => ({ nome, testo: leggi(percorso(nome)) }));
      return { rotte, file, esclusi };
    },
    verifica({ rotte, file }) {
      if (!rotte.length)
        return 'nessuna rotta con WrappedDevelopmentScreen trovata: il lettore è rotto o il criterio va rivisto';
      for (const rotta of rotte) {
        const re = new RegExp(`['"\`]${rotta}['"\`]`);
        const dove = file.find(f => re.test(f.testo));
        if (dove)
          return `la rotta in sviluppo '${rotta}' è citata in ${dove.nome}`;
      }
      return null;
    },
    nota: ({ rotte, esclusi }) =>
      `rotte registrate ma irraggiungibili: ${rotte.join(', ')}; ` +
      `esclusi dalla ricerca: ${[...new Set(esclusi.map(e => e.motivo))].join('; ')} (${esclusi.length} file)`,
  },
  C8: {
    leggi() {
      const f = nome => join(VERIFICA_DIR, nome);
      const opz = p => (esiste(p) ? leggi(p) : null);
      return {
        png: ['link-scaduto-it.png', 'link-scaduto-en.png'].filter(
          n => !esiste(f(n))
        ),
        dump: {
          it: opz(f('link-scaduto-it.xml')),
          en: opz(f('link-scaduto-en.xml')),
        },
        log: opz(f('link-scaduto.log')),
        attesi: Object.fromEntries(
          ['it', 'en'].map(l => {
            const src = leggi(percorso('src', 'locales', `${l}.ts`));
            return [
              l,
              [
                testoTraduzione(src, 'auth.linkExpired.title'),
                testoTraduzione(src, 'auth.linkExpired.reset'),
              ],
            ];
          })
        ),
      };
    },
    verifica({ png, dump, log, attesi }) {
      if (png.length) return `mancano gli screenshot: ${png.join(', ')}`;
      for (const lingua of ['it', 'en']) {
        if (attesi[lingua].some(t => !t))
          return `testo auth.linkExpired non trovato in src/locales/${lingua}.ts`;
        if (!dump[lingua])
          return `manca link-scaduto-${lingua}.xml (uiautomator dump)`;
        const visti = testiDump(dump[lingua]).map(normalizzaSpazi);
        const mancante = attesi[lingua].find(
          t => !visti.includes(normalizzaSpazi(t))
        );
        if (mancante)
          return `${lingua}: a schermo manca «${mancante.slice(0, 50)}…»`;
      }
      if (!log) return 'manca link-scaduto.log (logcat con l’intent ricevuto)';
      if (!/error_code=otp_expired/.test(log))
        return 'il log non contiene error_code=otp_expired';
      if (!log.includes(PACKAGE)) return `il log non nomina ${PACKAGE}`;
      return null;
    },
  },
};
