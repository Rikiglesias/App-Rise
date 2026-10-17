// Lettura statica dei letterali delle località: nessuna esecuzione del codice dell'app.
import { senzaStringheECommenti } from './fonti-ar.mjs';

/** Proprietà di primo livello; una sintassi non letterale fallisce invece di omettere dati. */
export const proprieta = codice => {
  const testo = codice?.trim() ?? '';
  if (!testo.startsWith('{') || !testo.endsWith('}'))
    throw new Error('oggetto letterale atteso');
  const pulito = senzaStringheECommenti(testo);
  const parti = [];
  let profondita = 0;
  let da = 1;
  for (let i = 1; i < testo.length - 1; i++) {
    if ('{[('.includes(pulito[i])) profondita++;
    if ('}])'.includes(pulito[i])) profondita--;
    if (pulito[i] === ',' && profondita === 0) {
      parti.push([da, i]);
      da = i + 1;
    }
  }
  parti.push([da, testo.length - 1]);
  const out = {};
  for (const [inizio, fine] of parti) {
    const parte = pulito.slice(inizio, fine);
    if (!parte.trim()) continue;
    const m = /^\s*([\w]+|['"][^'"]*['"])\s*:/.exec(parte);
    if (!m) throw new Error('proprietà non letterale nelle località');
    const offset = m[0].indexOf(m[1]);
    const nome = testo
      .slice(inizio + offset, inizio + offset + m[1].length)
      .replace(/^['"]|['"]$/g, '');
    if (Object.hasOwn(out, nome))
      throw new Error(`proprietà duplicata: ${nome}`);
    out[nome] = testo.slice(inizio + m[0].length, fine).trim();
  }
  return out;
};

export const stringa = codice => {
  const m = /^(['"`])((?:\\.|(?!\1)[\s\S])*)\1$/.exec(codice?.trim() ?? '');
  if (!m || (m[1] === '`' && m[2].includes('${'))) return null;
  return m[2].replace(
    /\\u\{([\da-f]+)\}|\\u([\da-f]{4})|\\x([\da-f]{2})|\\([\s\S])/gi,
    (_, lungo, unicode, hex, c) =>
      lungo || unicode || hex
        ? String.fromCodePoint(parseInt(lungo ?? unicode ?? hex, 16))
        : ({ n: '\n', r: '\r', t: '\t' }[c] ?? c)
  );
};

export const bilingue = codice => {
  if (!codice?.trim().startsWith('{')) return null;
  const p = proprieta(codice);
  return { it: stringa(p.it), en: stringa(p.en) };
};

// Cerca la chiave nel suo oggetto esatto: un omonimo in un altro ramo non vale come traduzione.
const traduzione = (sorgente, chiave) => {
  let blocco = sorgente
    .replace(/^[\s\S]*?export\s+default\s*/, '')
    .replace(/;\s*$/, '')
    .trim();
  for (const parte of chiave.split('.')) {
    if (!blocco?.startsWith('{')) return null;
    blocco = proprieta(blocco)[parte];
  }
  return stringa(blocco);
};

/** Testi inline it/en attuali, oppure chiavi nei locali per description/program/achievements. */
export const testiLocalita = (p, id, locali) => {
  const out = [];
  const visita = (codice, campo, lingua, chiaveObbligatoria = false) => {
    const valore = stringa(codice);
    if (valore != null) {
      const tradotti = Object.fromEntries(
        ['it', 'en'].map(lang => [lang, traduzione(locali[lang], valore)])
      );
      const chiave =
        chiaveObbligatoria ||
        Object.values(tradotti).some(t => t != null) ||
        /^[\w-]+(?:\.[\w-]+)+$/.test(valore);
      for (const lang of lingua ? [lingua] : ['it', 'en']) {
        const tradotto = tradotti[lang];
        out.push({
          chiave: chiave ? valore : `${id}.${campo}`,
          lingua: lang,
          testo: chiave ? tradotto : valore,
        });
      }
    } else if (codice?.startsWith('{')) {
      const b = proprieta(codice);
      for (const lang of ['it', 'en'])
        visita(b[lang], campo, lang, chiaveObbligatoria);
    } else if (codice?.startsWith('[') && codice.endsWith(']')) {
      // Un array di testi ha la stessa separazione a livello zero di un oggetto.
      const interno = codice.slice(1, -1);
      const pulito = senzaStringheECommenti(interno);
      let livello = 0;
      let da = 0;
      let indice = 0;
      for (let i = 0; i <= interno.length; i++) {
        if (i < interno.length && '{[('.includes(pulito[i])) livello++;
        if (i < interno.length && '}])'.includes(pulito[i])) livello--;
        if (i === interno.length || (pulito[i] === ',' && livello === 0)) {
          const pezzo = interno.slice(da, i).trim();
          if (pezzo)
            visita(pezzo, `${campo}.${indice++}`, lingua, chiaveObbligatoria);
          da = i + 1;
        }
      }
    } else throw new Error(`località ${id}: ${campo} non leggibile`);
  };
  for (const campo of ['description', 'program', 'achievements']) {
    const codice = p[campo] ?? p[`${campo}Key`] ?? p[`${campo}Keys`];
    visita(codice, campo, undefined, !Object.hasOwn(p, campo));
  }
  return out;
};
