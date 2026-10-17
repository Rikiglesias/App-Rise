// Fonti dei numeri dell'app (C7, C37, C39 del contratto android-play): gli Annual Report si scaricano in una
// cache FUORI dal repo, lo sha256 è fissato qui e il testo esce da `pdftotext -layout`. Una fonte che cambia, o un
// pdftotext assente, è un errore: mai un estratto vuoto che fa sembrare «nessun numero mancante».
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { esegui, sha256 } from './comune.mjs';

export const AR2025_URL =
  'https://riseagainsthunger.org/wp-content/uploads/media/Annual-report-2025-ITA_DEF-1.pdf';

/** URL → sha256 e anno attesi. Una fonte nuova entra solo registrandoli qui. */
export const FONTI_REGISTRATE = {
  [AR2025_URL]: {
    sha256: '956b8d12b5dd36680ac12ff747f30722f503188a16b04df0336581952f9eedcd',
    anno: 2025,
  },
};

const CACHE = join(tmpdir(), 'verifica-android-play-fonti');
const estratti = new Map();

/** Testo `pdftotext -layout` (UTF-8) di una fonte registrata. */
export const estrattoFonte = async url => {
  if (estratti.has(url)) return estratti.get(url);
  const atteso = Object.hasOwn(FONTI_REGISTRATE, url)
    ? FONTI_REGISTRATE[url].sha256
    : null;
  if (!atteso) throw new Error(`fonte non registrata nello script: ${url}`);
  mkdirSync(CACHE, { recursive: true });
  const pdf = join(CACHE, `${atteso}.pdf`);
  if (!existsSync(pdf)) {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`download di ${url}: HTTP ${r.status}`);
    writeFileSync(pdf, Buffer.from(await r.arrayBuffer()));
  }
  const sha = sha256(readFileSync(pdf));
  if (sha !== atteso) {
    rmSync(pdf, { force: true });
    throw new Error(`sha256 di ${url} = ${sha}, atteso ${atteso}`);
  }
  const txt = join(CACHE, `${atteso}.txt`);
  esegui('pdftotext', ['-layout', '-enc', 'UTF-8', pdf, txt]);
  const testo = readFileSync(txt, 'utf8');
  if (!testo.trim())
    throw new Error(`pdftotext ha dato un testo vuoto per ${url}`);
  estratti.set(url, testo);
  return testo;
};

/** Forme in cui un intero compare in un report italiano: 2248344 e 2.248.344 (5833 resta senza punto). */
export const formeNumero = n => {
  const s = String(n);
  return [...new Set([s, s.replace(/\B(?=(\d{3})+(?!\d))/g, '.')])];
};

/** L'intero compare nel testo come numero a sé, non dentro un numero più lungo. */
export const numeroNelTesto = (n, testo) =>
  formeNumero(n).some(f =>
    new RegExp(`(?<![\\d.,])${f.replace(/\./g, '[.]')}(?![\\d]|[.,]\\d)`).test(
      testo
    )
  );

/**
 * Codice senza commenti e con le stringhe svuotate (stessa lunghezza, apici conservati): serve a contare graffe
 * e a leggere i numeri letterali senza scambiare per codice il testo dentro una stringa.
 */
export const senzaStringheECommenti = codice => {
  let out = '';
  let i = 0;
  while (i < codice.length) {
    const c = codice[i];
    const d = codice[i + 1];
    if (c === '/' && d === '/') {
      while (i < codice.length && codice[i] !== '\n') {
        out += ' ';
        i++;
      }
    } else if (c === '/' && d === '*') {
      const fine = codice.indexOf('*/', i + 2);
      const stop = fine < 0 ? codice.length : fine + 2;
      out += codice.slice(i, stop).replace(/[^\n]/g, ' ');
      i = stop;
    } else if (c === "'" || c === '"' || c === '`') {
      out += c;
      i++;
      while (i < codice.length && codice[i] !== c) {
        if (codice[i] === '\\') {
          out += '  ';
          i += 2;
          continue;
        }
        out += codice[i] === '\n' ? '\n' : ' ';
        i++;
      }
      out += c;
      i++;
    } else {
      out += c;
      i++;
    }
  }
  return out;
};

/** Testo (originale) dell'oggetto o array letterale assegnato a `export const <nome>`; null se non c'è. */
export const letteraleDi = (sorgente, nome) => {
  const pulito = senzaStringheECommenti(sorgente);
  const m = new RegExp(`export const ${nome}\\b[^=]*=\\s*`).exec(pulito);
  if (!m) return null;
  const inizio = m.index + m[0].length;
  if (!['{', '['].includes(pulito[inizio])) return null;
  let profondita = 0;
  for (let i = inizio; i < pulito.length; i++) {
    if (pulito[i] === '{' || pulito[i] === '[') profondita++;
    if (pulito[i] === '}' || pulito[i] === ']') profondita--;
    if (profondita === 0) return sorgente.slice(inizio, i + 1);
  }
  return null;
};

/** Oggetti di primo livello di un array letterale (testo originale di ciascuno). */
export const elementiArray = testoArray => {
  const pulito = senzaStringheECommenti(testoArray);
  const out = [];
  let profondita = 0;
  let da = -1;
  for (let i = 0; i < pulito.length; i++) {
    const c = pulito[i];
    if (c === '{' || c === '[') {
      profondita++;
      if (profondita === 2 && c === '{') da = i;
    } else if (c === '}' || c === ']') {
      if (profondita === 2 && c === '}' && da >= 0) {
        out.push(testoArray.slice(da, i + 1));
        da = -1;
      }
      profondita--;
    }
  }
  return out;
};

/** Interi letterali di un frammento di codice (i decimali e le cifre dentro nomi o stringhe non contano). */
export const interiLetterali = codice =>
  [
    ...senzaStringheECommenti(codice).matchAll(/(?<![\w.$])\d[\d_]*(?![\w.])/g),
  ].map(m => Number(m[0].replace(/_/g, '')));
