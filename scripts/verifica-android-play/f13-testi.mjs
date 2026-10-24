// Controlli statici sui testi e sui documenti dei criteri R24-R26 (fase F13 del contratto android-play):
// C61 (Let's Donation nei testi), C63 (sede nelle informative), C76 (`.cursorrules` e guide), C80 (gift card).
import {
  elencaFile,
  esiste,
  leggi,
  normalizzaSpazi,
  percorso,
  rel,
} from './comune.mjs';
import { testoTraduzione } from './app.mjs';
import { suite } from './titoli-jest.mjs';

const leggiSeEsiste = p => (esiste(percorso(p)) ? leggi(percorso(p)) : null);
const apostrofi = s => s.replace(/[’‘`]/g, "'");

// --- C61 ---------------------------------------------------------------------------------------------
export const CHIAVI_C61 = [
  'auth.delete.confirmNow',
  'auth.delete.warning',
  'partner.disclosureBody',
];
export const PARITA_C61 = 'src/__tests__/locales/i18nParity.test.ts';
const REGOLE_C61 = {
  it: {
    eliminazione: { deve: "Let's Donation", mai: 'tutti i dati' },
    uscita: { deve: 'distinto', mai: 'creare un account' },
  },
  en: {
    eliminazione: { deve: "Let's Donation", mai: 'all data' },
    uscita: { deve: 'separate', mai: 'create a separate account' },
  },
};

export const staticoC61 = {
  leggi: () => ({
    testi: Object.fromEntries(
      ['it', 'en'].map(l => {
        const s = leggiSeEsiste(`src/locales/${l}.ts`) ?? '';
        return [
          l,
          Object.fromEntries(CHIAVI_C61.map(k => [k, testoTraduzione(s, k)])),
        ];
      })
    ),
    parita: (suite() ?? []).filter(r => r.file === PARITA_C61),
  }),
  verifica({ testi, parita }) {
    for (const [lingua, regole] of Object.entries(REGOLE_C61)) {
      for (const k of CHIAVI_C61) {
        const t = testi?.[lingua]?.[k];
        if (t == null) return `${k} (${lingua}) assente`;
        const r = k.startsWith('partner.')
          ? regole.uscita
          : regole.eliminazione;
        const testo = apostrofi(t).toLowerCase();
        if (!testo.includes(r.deve.toLowerCase()))
          return `${k} (${lingua}) senza «${r.deve}»`;
        if (testo.includes(r.mai.toLowerCase()))
          return `${k} (${lingua}) contiene ancora «${r.mai}»`;
      }
    }
    if (!parita?.length) return `${PARITA_C61} non eseguito`;
    const rosso = parita.find(r => r.stato !== 'passed');
    if (rosso) return `parità delle chiavi: «${rosso.titolo}» ${rosso.stato}`;
    return '';
  },
};

// --- C63 ---------------------------------------------------------------------------------------------
export const INDIRIZZO_C63 = 'via dei Fornaciai 17, 40129 Bologna';
export const SEGNAPOSTO_C63 = {
  'privacy-policy.html': 'PEC e indirizzo della sede legale da inserire',
  'privacy-policy-en.html': 'registered office address to be added',
};

export const staticoC63 = {
  leggi: () => ({
    file: Object.fromEntries(
      Object.keys(SEGNAPOSTO_C63).map(f => [f, leggiSeEsiste(f)])
    ),
  }),
  verifica({ file }) {
    for (const [f, segnaposto] of Object.entries(SEGNAPOSTO_C63)) {
      if (file?.[f] == null) return `${f} assente`;
      const testo = normalizzaSpazi(file[f]).toLowerCase();
      if (testo.includes(segnaposto.toLowerCase()))
        return `${f}: resta il segnaposto «${segnaposto}»`;
      if (!testo.includes(INDIRIZZO_C63.toLowerCase()))
        return `${f} senza «${INDIRIZZO_C63}»`;
    }
    return '';
  },
};

// --- C76 ---------------------------------------------------------------------------------------------
export const FILE_C76 = [
  '.cursorrules',
  'docs/guides/development.md',
  'docs/guides/quality-standards.md',
];
// Un divieto della scala del testo o un obbligo di `immunity={true}` contraddicono C42 (scala accesa).
const SCALA_ACCESA = /allowFontScaling\s*=\s*\{?\s*true/;
const SCALA_PERMESSA =
  /acces|consentit|ammess|permess|C42|scala del testo dell.utente/i;
const IMMUNITA = /immunity\s*=\s*\{?\s*true/;
const IMMUNITA_FACOLTATIVA =
  /non serve|facoltativ|non obbligatori|opzional|non usare/i;
const IMPORT =
  /import\s+(?:(\w+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s*['"]@\/([^'"]+)['"]/g;

/** Nomi richiesti dai file di regole: riga «Usa SEMPRE» del TL;DR più gli import `@/…` nei blocchi ts. */
export const nomiRichiesti = (nome, testo) => {
  const nomi = [];
  const tldr =
    nome === '.cursorrules' ? (testo.split(/^---$/m)[0] ?? '') : testo;
  const sempre = /^- \*\*Usa SEMPRE\*\*:(.*)$/m.exec(tldr)?.[1] ?? '';
  for (const m of sempre.matchAll(/`([A-Za-z_]\w*)`/g))
    nomi.push({ nome: m[1], modulo: null });
  for (const m of tldr.matchAll(IMPORT)) {
    if (m[1]) nomi.push({ nome: m[1], modulo: m[3], predefinito: true });
    for (const n of (m[2] ?? '').split(','))
      if (n.trim()) nomi.push({ nome: n.trim(), modulo: m[3] });
  }
  return nomi;
};

const esportaNome = (testo, nome) =>
  new RegExp(
    `export\\s+(?:default\\s+)?(?:const|let|function|class|type|interface|enum)\\s+${nome}\\b|export\\s*\\{[^}]*\\b${nome}\\b[^}]*\\}|export\\s+default\\s+${nome}\\b`
  ).test(testo);

const moduloDi = (sorgenti, base) =>
  sorgenti.filter(s =>
    new RegExp(`^${base.replace(/[.]/g, '\\.')}(\\.tsx?|/index\\.tsx?)$`).test(
      s.nome
    )
  );

/** Il modulo (o un `export * from` che riesporta, fino a 3 livelli) esporta `nome`. */
export const esportatoDa = (sorgenti, file, nome, livello = 0) =>
  file.some(
    s =>
      esportaNome(s.testo, nome) ||
      (livello < 3 &&
        [...s.testo.matchAll(/export\s*\*\s*from\s*['"](\.[^'"]+)['"]/g)].some(
          m => {
            const dir = s.nome.split('/').slice(0, -1);
            for (const p of m[1].split('/'))
              p === '..' ? dir.pop() : p !== '.' && dir.push(p);
            return esportatoDa(
              sorgenti,
              moduloDi(sorgenti, dir.join('/')),
              nome,
              livello + 1
            );
          }
        ))
  );

export const staticoC76 = {
  leggi: () => ({
    file: Object.fromEntries(FILE_C76.map(f => [f, leggiSeEsiste(f)])),
    sorgenti: elencaFile(
      percorso('src'),
      p => /\.(ts|tsx)$/.test(p) && !/__tests__/.test(p)
    ).map(p => ({ nome: rel(p), testo: leggi(p) })),
  }),
  verifica({ file, sorgenti }) {
    for (const f of FILE_C76) {
      const testo = file?.[f];
      if (testo == null) return `${f} assente`;
      const righe = testo.split(/\r?\n/);
      const divieto = righe.findIndex(
        r => SCALA_ACCESA.test(r) && !SCALA_PERMESSA.test(r)
      );
      if (divieto >= 0)
        return `${f}:${divieto + 1} vieta allowFontScaling=true (contro C42)`;
      const obbligo = righe.findIndex(
        r => IMMUNITA.test(r) && !IMMUNITA_FACOLTATIVA.test(r)
      );
      if (obbligo >= 0)
        return `${f}:${obbligo + 1} rende obbligatorio immunity={true}`;
      for (const { nome, modulo } of nomiRichiesti(f, testo)) {
        const dove = modulo ? moduloDi(sorgenti, `src/${modulo}`) : sorgenti;
        if (modulo && dove.length === 0)
          return `${f}: il modulo @/${modulo} non esiste`;
        if (!esportatoDa(sorgenti, dove, nome))
          return `${f}: ${nome} non è esportato ${modulo ? `da @/${modulo}` : 'in src/'}`;
      }
    }
    return '';
  },
};

// --- C80 ---------------------------------------------------------------------------------------------
export const RISPOSTE_C80 = 'docs/store/google-play/play-console-risposte.md';
export const RILASCIO_C80 = 'docs/store/google-play/rilascio.md';
export const FONTE_C80 =
  'support.google.com/googleplay/android-developer/answer/10281818';
const VECCHIE_C80 = ['non trattate esplicitamente', 'non le trattano'];
const DATA = /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b|\b\d{4}-\d{2}-\d{2}\b/;

export const staticoC80 = {
  leggi: () => ({
    risposte: leggiSeEsiste(RISPOSTE_C80),
    rilascio: leggiSeEsiste(RILASCIO_C80),
  }),
  verifica({ risposte, rilascio }) {
    if (risposte == null) return `${RISPOSTE_C80} assente`;
    if (rilascio == null) return `${RILASCIO_C80} assente`;
    for (const [f, t] of [
      [RISPOSTE_C80, risposte],
      [RILASCIO_C80, rilascio],
    ]) {
      const vecchia = VECCHIE_C80.find(v => t.toLowerCase().includes(v));
      if (vecchia) return `${f}: resta «${vecchia}»`;
    }
    const riga = risposte
      .split(/\r?\n/)
      .find(r => /gift card/i.test(r) && r.includes(FONTE_C80));
    if (!riga)
      return `${RISPOSTE_C80}: nessuna riga sulle gift card cita ${FONTE_C80}`;
    if (!DATA.test(riga))
      return `${RISPOSTE_C80}: la riga delle gift card non ha la data di lettura`;
    if (
      !/fatturazione di (Google )?Play/i.test(riga) ||
      !/non (è )?richiest/i.test(riga)
    )
      return `${RISPOSTE_C80}: la riga non dice che la fatturazione di Play non è richiesta`;
    return '';
  },
};
