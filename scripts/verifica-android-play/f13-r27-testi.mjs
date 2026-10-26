// Controlli statici su testi e documenti dei criteri R27-R29 (contratto android-play): C91 (codice verso i
// partner solo col consenso), C92 (avvisi che nominano il codice), C96 (documenti interni); C99 in
// f13-r27-pubblici.mjs. I lettori restituiscono i testi interi; il parsing sta in `verifica`, provato dal selftest.
import { esiste, leggi, normalizzaSpazi, percorso } from './comune.mjs';
import { testoTraduzione } from './app.mjs';
import { sezioni } from './documenti-rilascio.mjs';

export const leggiSeEsiste = p =>
  esiste(percorso(p)) ? leggi(percorso(p)) : null;
const testiDi = file =>
  Object.fromEntries(file.map(f => [f, leggiSeEsiste(f)]));
/** Testo confrontabile: spazi compattati, apostrofi tipografici resi dritti, minuscole. */
export const piano = s =>
  normalizzaSpazi(String(s ?? '').replace(/[’‘`]/g, "'")).toLowerCase();
/** Testo di un frammento HTML: tag tolti, entità comuni sciolte. */
export const testoHtml = html =>
  piano(
    String(html ?? '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&rsquo;|&#39;|&#x27;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
  );
/** Paragrafi `<p>` come testo piano. */
const paragrafi = html =>
  [...String(html ?? '').matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(m =>
    testoHtml(m[1])
  );

// --- C91 ---------------------------------------------------------------------------------------------
export const USCITA_C91 = 'src/shared/partner/usePartnerExit.ts';
export const QUADRO_C91 = 'docs/integrazioni/scambio-dati-quadro.md';
// Paragrafo del codice nelle informative: si riconosce dalle prime parole.
export const INFORMATIVE_C91 = {
  'privacy-policy.html': [
    'il codice di provenienza è una sigla casuale',
    "solo se hai accettato l'informativa",
  ],
  'privacy-policy-en.html': [
    'the referral code is a random code',
    'only if you have accepted the privacy policy',
  ],
};
// Le due righe del codice nella tabella del quadro (oggi :135-136), dalla prima cella.
const RIGHE_C91 = ['codice di provenienza', 'lo stesso codice'];

export const staticoC91 = {
  leggi: () => ({
    uscita: leggiSeEsiste(USCITA_C91),
    quadro: leggiSeEsiste(QUADRO_C91),
    informative: testiDi(Object.keys(INFORMATIVE_C91)),
  }),
  verifica({ uscita, quadro, informative }) {
    if (uscita == null) return `${USCITA_C91} assente`;
    // Gli asterischi di continuazione dei commenti a blocco non spezzano la frase.
    if (
      piano(uscita.replace(/^\s*\*(?!\/)\s?/gm, ' ')).includes(
        'ref su ogni uscita'
      )
    )
      return `${USCITA_C91}: dice ancora «ref su OGNI uscita»`;
    if (quadro == null) return `${QUADRO_C91} assente`;
    const righe = quadro.split(/\r?\n/).map(piano);
    for (const inizio of RIGHE_C91) {
      const riga = righe.find(r => r.startsWith(`| ${inizio}`));
      if (!riga) return `${QUADRO_C91}: riga «${inizio}» assente`;
      if (!riga.includes('solo con il consenso'))
        return `${QUADRO_C91}: la riga «${inizio}» non dice «solo con il consenso»`;
    }
    for (const [f, [apertura, frase]] of Object.entries(INFORMATIVE_C91)) {
      if (informative?.[f] == null) return `${f} assente`;
      const p = paragrafi(informative[f]).find(x => x.startsWith(apertura));
      if (!p) return `${f}: paragrafo del codice («${apertura}…») non trovato`;
      if (!p.includes(frase))
        return `${f}: il paragrafo del codice non dice «${frase}»`;
    }
    return '';
  },
};

// --- C92 ---------------------------------------------------------------------------------------------
export const LOCALI_C92 = {
  it: 'src/locales/it.ts',
  en: 'src/locales/en.ts',
};
export const FLAG_C92 = 'src/shared/partner/disclosureFlag.ts';
export const RISPOSTE_C92 = 'docs/store/google-play/play-console-risposte.md';
const FRASI_C92 = {
  it: {
    comuni: [
      'un codice',
      'collegato al tuo account',
      "per sapere che arrivi dall'app",
    ],
    donorbox: 'anche se continui senza i tuoi dati',
    vietata: 'anonim',
  },
  en: {
    comuni: [
      'a code',
      'linked to your account',
      'to know you came from the app',
    ],
    donorbox: 'even if you continue without your details',
    vietata: 'anonymous',
  },
};
const AVVISI_C92 = [
  'partner.disclosureTitle',
  'partner.disclosureBody',
  'partner.donorboxDisclosureTitle',
  'partner.donorboxDisclosureBody',
];
const CHIAVI_C92 = [
  'partner_disclosure_seen_v2',
  'donorbox_disclosure_seen_v2',
];
/** Commenti `//…` e `/*…*\/` di un sorgente (un `//` dopo `:` è un URL, non un commento). */
export const commenti = testo =>
  [...String(testo ?? '').matchAll(/(?<!:)\/\/[^\n]*|\/\*[\s\S]*?\*\//g)]
    .map(m => m[0])
    .join('\n');

export const staticoC92 = {
  leggi: () => ({
    locali: Object.fromEntries(
      Object.entries(LOCALI_C92).map(([l, f]) => [l, leggiSeEsiste(f)])
    ),
    uscita: leggiSeEsiste(USCITA_C91),
    flag: leggiSeEsiste(FLAG_C92),
    risposte: leggiSeEsiste(RISPOSTE_C92),
  }),
  verifica({ locali, uscita, flag, risposte }) {
    for (const [l, frasi] of Object.entries(FRASI_C92)) {
      const s = locali?.[l];
      if (s == null) return `${LOCALI_C92[l]} assente`;
      const testo = k => piano(testoTraduzione(s, k));
      for (const [k, extra] of [
        ['partner.disclosureBody', []],
        ['partner.donorboxDisclosureBody', [frasi.donorbox]],
      ]) {
        if (testoTraduzione(s, k) == null) return `${k} (${l}) assente`;
        const manca = [...frasi.comuni, ...extra].find(
          f => !testo(k).includes(f)
        );
        if (manca) return `${k} (${l}) senza «${manca}»`;
      }
      const anonimo = AVVISI_C92.find(k => testo(k).includes(frasi.vietata));
      if (anonimo) return `${anonimo} (${l}) dice ancora «${frasi.vietata}…»`;
    }
    if (uscita == null) return `${USCITA_C91} assente`;
    if (piano(commenti(uscita)).includes('anonim'))
      return `${USCITA_C91}: un commento dice ancora «anonimo»`;
    if (flag == null) return `${FLAG_C92} assente`;
    const chiave = CHIAVI_C92.find(k => !flag.includes(`'${k}'`));
    if (chiave) return `${FLAG_C92}: chiave ${chiave} assente`;
    if (/_disclosure_seen_v1/.test(flag))
      return `${FLAG_C92}: resta una chiave _v1`;
    if (piano(flag).includes('resta esattamente quella di prima'))
      return `${FLAG_C92}: il commento dice ancora che la chiave resta quella di prima`;
    if (risposte == null) return `${RISPOSTE_C92} assente`;
    const s = sezioni(risposte, 3).find(x =>
      x.titolo.startsWith('Condivisione')
    );
    if (!s) return `${RISPOSTE_C92}: manca la sezione «Condivisione…»`;
    const righe = s.testo.split(/\r?\n/).map(piano);
    if (!righe.some(r => /avvis/.test(r) && /codice/.test(r)))
      return `${RISPOSTE_C92} § condivisione: non dice che gli avvisi nominano il codice`;
    if (!piano(s.testo).includes('dichiarato come condiviso'))
      return `${RISPOSTE_C92} § condivisione: senza «dichiarato come condiviso»`;
    return '';
  },
};

// --- C96 ---------------------------------------------------------------------------------------------
export const PUNTI_C96 = 'docs/informativa-punti-aperti.md';
// «Esporta i miei dati» è l'etichetta dell'app (`it.ts`, exportCta).
const EXPORT_C96 = /esporta i miei dati/;
const RIFERIMENTI_C96 = /riferimenti partner|codic[ei] di provenienza/;
const REGISTRO_C96 =
  /registro dei consensi[^.]{0,120}(si cancella|cancellat[oa])[^.]{0,60}account/;
const VECCHIO_C96 = 'conserviamo il registro anche dopo la cancellazione';

export const staticoC96 = {
  leggi: () => ({
    quadro: leggiSeEsiste(QUADRO_C91),
    punti: leggiSeEsiste(PUNTI_C96),
  }),
  verifica({ quadro, punti }) {
    if (quadro == null) return `${QUADRO_C91} assente`;
    const righe = quadro.split(/\r?\n/).map(piano);
    if (!righe.some(r => EXPORT_C96.test(r) && RIFERIMENTI_C96.test(r)))
      return `${QUADRO_C91}: non dice che «Esporta i miei dati» contiene i riferimenti partner`;
    if (punti == null) return `${PUNTI_C96} assente`;
    const p = piano(punti);
    if (p.includes(VECCHIO_C96))
      return `${PUNTI_C96}: dice ancora che il registro resta dopo la cancellazione`;
    if (!REGISTRO_C96.test(p))
      return `${PUNTI_C96}: non dice che il registro dei consensi si cancella con l'account`;
    return '';
  },
};
