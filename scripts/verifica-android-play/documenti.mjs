// C13-C15, C17, C19, C20: documenti per Google Play (contratto del goal android-play).
import { esiste, leggi, percorso } from './comune.mjs';

const SCHEDA = percorso('docs', 'store', 'google-play', 'scheda.md');
const LIMITI = { titolo: 30, breve: 80, completa: 4000 };
const MAIUSCOLE_AMMESSE = new Set(['RAH']);
const PROMOZIONALI =
  /(?:^|[^\p{L}])(migliore|migliori|best|top|gratis|free)(?![\p{L}])|#1\b/iu;
const AFFERMAZIONI_FALSE =
  /tempo reale|real[- ]time|mozambico|mozambique|3 paesi|3 countries/i;

/**
 * scheda.md: una sezione `## … (it-IT)` e una `## … (en-US)`, ognuna con tre `###`
 * nell'ordine titolo, descrizione breve, descrizione completa.
 */
export const leggiScheda = testo => {
  const lingue = {};
  for (const sezione of testo.split(/^## /m).slice(1)) {
    const codice = sezione.match(/\((it-IT|en-US)\)/)?.[1];
    if (!codice) continue;
    const campi = sezione
      .split(/^### .*$/m)
      .slice(1)
      .map(t => t.trim());
    lingue[codice] = { titolo: campi[0], breve: campi[1], completa: campi[2] };
  }
  return lingue;
};

const caratteri = s => [...s].length;

export const controllaTestoScheda = (codice, campi) => {
  for (const [campo, max] of Object.entries(LIMITI)) {
    const t = campi?.[campo];
    if (!t) return `${codice}: ${campo} assente`;
    if (caratteri(t) > max)
      return `${codice}: ${campo} di ${caratteri(t)} caratteri, massimo ${max}`;
    if (/\p{Extended_Pictographic}/u.test(t))
      return `${codice}: emoji in ${campo}`;
    const urlate = (t.match(/\b\p{Lu}{2,}\b/gu) ?? []).filter(
      w => !MAIUSCOLE_AMMESSE.has(w)
    );
    if (urlate.length)
      return `${codice}: parola tutta maiuscola in ${campo}: ${urlate[0]}`;
    const promo = t.match(PROMOZIONALI);
    if (promo)
      return `${codice}: termine promozionale in ${campo}: ${promo[0].trim()}`;
    const falsa = t.match(AFFERMAZIONI_FALSE);
    if (falsa)
      return `${codice}: affermazione segnalata come falsa in F0: ${falsa[0]}`;
  }
  return null;
};

export const criteri = {
  C15: {
    leggi: () => ({
      scheda: esiste(SCHEDA) ? leggiScheda(leggi(SCHEDA)) : null,
    }),
    verifica({ scheda }) {
      if (!scheda) return 'manca docs/store/google-play/scheda.md';
      for (const codice of ['it-IT', 'en-US']) {
        const motivo = controllaTestoScheda(codice, scheda[codice]);
        if (motivo) return motivo;
      }
      return null;
    },
  },
};
