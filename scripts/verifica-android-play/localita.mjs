// C39: numeri documentati per paese, testi interpolati e test della schermata reale.
// Nome e coordinate identificano il punto geografico e non sono numeri d'impatto.
import { leggi, percorso } from './comune.mjs';
import {
  FONTI_REGISTRATE,
  elementiArray,
  estrattoFonte,
  formeNumero,
  letteraleDi,
  numeroNelTesto,
  senzaStringheECommenti,
} from './fonti-ar.mjs';
import { fileDeiTitoli } from './titoli-jest.mjs';
import {
  bilingue,
  proprieta,
  stringa,
  testiLocalita,
} from './testi-localita.mjs';

export const VIETATE_C39 = [
  /Planting Seeds/i,
  /\b35\s*%/,
  /\bschools\s*:\s*5\b/,
  /\b5\s+(?:scuole|schools)\b/i,
  /somalia/i,
  /\bbeneficiaries\s*:\s*74\b/,
];
const DATI_VIETATI =
  /LOCATIONS_DATA|MAP_LOCATIONS|locationsData|impactData|mapModalData/;
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Stesse forme e confini di numeroNelTesto, ma solo whitespace fra numero e nome. */
export const numeroAdiacente = (n, testo, nomi) =>
  formeNumero(n).some(f => {
    const numero = `(?<![\\d.,])${escapeRe(f)}(?![\\d]|[.,]\\d)`;
    return nomi.some(nome => {
      const parola = `(?<![\\p{L}\\p{N}_])${escapeRe(nome)}(?![\\p{L}\\p{N}_])`;
      return new RegExp(
        `(?:${parola}\\s+${numero}|${numero}\\s+${parola})`,
        'iu'
      ).test(testo);
    });
  });

/** Lettore puro condiviso col selftest: non valuta TypeScript né scarica fonti. */
export const leggiLocalita = (testo, locali) => {
  const oggetto = letteraleDi(testo, 'LOCATIONS_DATA');
  if (!oggetto) return [];
  const elementi = elementiArray(oggetto);
  // Rifiuta spread/riferimenti non leggibili anziché saltare una località.
  let resto = oggetto.slice(1, -1);
  for (const e of elementi) resto = resto.replace(e, '');
  if (senzaStringheECommenti(resto).replace(/[,\s]/g, ''))
    throw new Error('LOCATIONS_DATA contiene elementi non letterali');
  return elementi.map(e => {
    const p = proprieta(e);
    const id = stringa(p.id) ?? '?';
    const stats = Object.fromEntries(
      Object.entries(proprieta(p.stats)).map(([k, v]) => [
        k,
        /^\d[\d_]*$/.test(v) ? Number(v.replace(/_/g, '')) : NaN,
      ])
    );
    return {
      id,
      anno: /^\d{4}$/.test(p.anno ?? '') ? Number(p.anno) : NaN,
      fonte: stringa(p.fonte),
      name: bilingue(p.name),
      country: bilingue(p.country),
      stats,
      testi: testiLocalita(p, id, locali),
    };
  });
};

const importSchermata = testo => {
  // Commenti e stringhe non possono fingere un import; la maschera conserva gli identificatori.
  const codice = senzaStringheECommenti(testo);
  return [
    ...codice.matchAll(
      /^\s*import\s+(?!type\b)((?:[\w$]+\s*,\s*)?\{[^{};]*\}|[\w$]+|\*\s+as\s+[\w$]+)\s+from\s+['"]/gm
    ),
  ].some(m => {
    const clausola = m[1].trim();
    if (/^MapModalScreen(?:\s*,|$)/.test(clausola)) return true;
    const nominati = clausola.match(/\{([^}]*)\}/)?.[1] ?? '';
    return nominati
      .split(',')
      .some(n => /^\s*MapModalScreen(?:\s+as\s+[\w$]+)?\s*$/.test(n));
  });
};

export const staticoC39 = {
  async leggi({ jest, titoli }) {
    const testo = leggi(percorso('src/features/impact/data/locationsData.ts'));
    const locali = Object.fromEntries(
      ['it', 'en'].map(l => [l, leggi(percorso('src/locales', `${l}.ts`))])
    );
    const localita = leggiLocalita(testo, locali);
    const estratti = {};
    for (const url of new Set(
      localita.map(l => l.fonte).filter(u => Object.hasOwn(FONTI_REGISTRATE, u))
    ))
      estratti[url] = await estrattoFonte(url);
    const fileTest = Object.fromEntries(
      fileDeiTitoli(titoli, jest).map(f => [f, leggi(percorso(f))])
    );
    return { testo, localita, estratti, fileTest };
  },
  verifica({ testo, localita, estratti, fileTest }, { jest, titoli }) {
    if (!localita?.length)
      return 'nessuna località in LOCATIONS_DATA (lettore rotto?)';
    for (const l of localita) {
      if (!Number.isInteger(l.anno)) return `località ${l.id} senza anno`;
      if (!l.fonte) return `località ${l.id} senza fonte`;
      if (!Object.hasOwn(FONTI_REGISTRATE, l.fonte))
        return `località ${l.id}: fonte non registrata (${l.fonte})`;
      if (l.anno !== FONTI_REGISTRATE[l.fonte].anno)
        return `località ${l.id}: anno ${l.anno}, fonte registrata per ${FONTI_REGISTRATE[l.fonte].anno}`;
      for (const campo of ['name', 'country'])
        if (
          !['it', 'en'].every(
            lang =>
              typeof l[campo]?.[lang] === 'string' && l[campo][lang].trim()
          )
        )
          return `località ${l.id}: ${campo} non bilingue (it/en)`;
      if (!l.stats || typeof l.stats !== 'object' || Array.isArray(l.stats))
        return `località ${l.id}: stats non leggibili`;
      const nomi = [l.country.it, l.country.en, l.name.it, l.name.en];
      const italia =
        /^(italy|italia)$/i.test(l.id) ||
        nomi.some(n => /^(italia|italy)$/i.test(n));
      if (
        italia &&
        Object.keys(l.stats).some(k => !['meals', 'kits'].includes(k))
      )
        return `località ${l.id}: stats Italia ammette solo meals e kits`;
      for (const n of Object.values(l.stats)) {
        if (!Number.isSafeInteger(n) || n < 0)
          return `località ${l.id}: numero stats non valido (${n})`;
        const estratto = estratti?.[l.fonte] ?? '';
        if (!numeroNelTesto(n, estratto))
          return `località ${l.id}: ${n} assente dalla fonte`;
        if (!numeroAdiacente(n, estratto, nomi))
          return `località ${l.id}: ${n} lontano dal paese o dalla sua etichetta`;
      }
      if (!l.testi?.length) return `località ${l.id}: testi non leggibili`;
      for (const t of l.testi) {
        if (t.testo == null)
          return `${t.lingua}:${t.chiave}: traduzione assente`;
        const cifra = t.testo.replace(/\{\{[^{}]*\}\}/g, '').match(/\d+/)?.[0];
        if (cifra) return `${t.lingua}:${t.chiave}: cifra a mano ${cifra}`;
        for (const m of t.testo.matchAll(/\{\{\s*([^{}]*?)\s*\}\}/g))
          if (m[1] !== 'anno' && !Object.hasOwn(l.stats, m[1]))
            return `${t.lingua}:${t.chiave}: segnaposto ${m[1]} fuori da stats/anno`;
      }
    }
    const contenuti = [
      testo,
      ...localita.flatMap(l => l.testi.map(t => t.testo)),
    ].join('\n');
    const vietate = VIETATE_C39.filter(re => re.test(contenuti)).map(String);
    if (vietate.length)
      return `voci senza riscontro nelle località: ${vietate.join(', ')}`;
    const file = fileDeiTitoli(titoli, jest);
    if (!file.length) return 'nessun file per i titoli di C39';
    for (const f of file) {
      const codice = fileTest?.[f];
      if (typeof codice !== 'string')
        return `${f}: file dei test non leggibile`;
      const vietato = codice.match(DATI_VIETATI)?.[0];
      if (vietato) return `${f}: riferimento vietato ${vietato}`;
      if (!importSchermata(codice))
        return `${f}: import di MapModalScreen assente`;
    }
    return '';
  },
};
