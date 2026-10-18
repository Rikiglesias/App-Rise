// C7 (emendato R18/R19): la card delle vite raggiunte prende l'anno da IMPACT_DATA.resultsYear per interpolazione.
// La card si riconosce dal valore (`IMPACT_DATA.livesImpactedMeals`), non dall'etichetta: una seconda card
// «vite impattate» (dalla nascita) non deve essere costretta a dire 2025. Le chiavi si risolvono per percorso
// completo nell'oggetto delle traduzioni, mai per ricerca in avanti nel testo.
import { createHash } from 'node:crypto';

export const sha256 = testo =>
  createHash('sha256').update(testo, 'utf8').digest('hex');

// --- traduzioni: parser del sottoinsieme usato in src/locales (oggetti annidati di stringhe) -----------------
const spazi = (s, i) => {
  for (;;) {
    while (i < s.length && /\s/.test(s[i])) i++;
    if (s.startsWith('//', i)) {
      const n = s.indexOf('\n', i);
      i = n < 0 ? s.length : n;
    } else if (s.startsWith('/*', i)) {
      const n = s.indexOf('*/', i + 2);
      i = n < 0 ? s.length : n + 2;
    } else return i;
  }
};
const ESCAPE = { n: '\n', t: '\t', r: '\r' };
const stringa = (s, i) => {
  const q = s[i];
  let v = '';
  for (i++; i < s.length && s[i] !== q; i++)
    v += s[i] === '\\' ? (ESCAPE[s[++i]] ?? s[i]) : s[i];
  return i < s.length ? [v, i + 1] : [null, s.length];
};
const oggetto = (s, i) => {
  const voci = new Map();
  for (i = spazi(s, i + 1); i < s.length && s[i] !== '}'; ) {
    let chiave;
    if (s[i] === "'" || s[i] === '"') [chiave, i] = stringa(s, i);
    else {
      chiave = /^[A-Za-z_$][\w$]*/.exec(s.slice(i, i + 200))?.[0] ?? null;
      i += chiave?.length ?? 0;
    }
    i = spazi(s, i);
    if (chiave == null || s[i] !== ':') return [null, s.length];
    i = spazi(s, i + 1);
    let valore = null;
    if (s[i] === '{') [valore, i] = oggetto(s, i);
    else if ('\'"`'.includes(s[i])) [valore, i] = stringa(s, i);
    if (valore == null) return [null, s.length];
    voci.set(chiave, valore);
    i = spazi(s, i);
    if (s[i] === ',') i = spazi(s, i + 1);
    else if (s[i] !== '}') return [null, s.length];
  }
  return i < s.length ? [voci, i + 1] : [null, s.length];
};

/** Oggetto `export default { … }` di un file di traduzioni come Map annidate; null se illeggibile. */
export const traduzioni = sorgente => {
  const m = /export default\s*\{/.exec(sorgente ?? '');
  return m ? oggetto(sorgente, m.index + m[0].length - 1)[0] : null;
};

/** Stringa al percorso `a.b.c`, o null se il percorso non arriva a una stringa. */
export const traduzione = (albero, percorso) => {
  let nodo = albero;
  for (const parte of percorso.split('.'))
    nodo = nodo instanceof Map ? nodo.get(parte) : undefined;
  return typeof nodo === 'string' ? nodo : null;
};

// --- JSX: elementi StatCard e loro prop ----------------------------------------------------------------------
const senzaCommenti = testo =>
  testo
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

// Fine di un'espressione fra graffe bilanciate (stringhe comprese); `i` punta alla `{`.
const fineGraffe = (s, i) => {
  for (let prof = 0; i < s.length; i++) {
    if ('\'"`'.includes(s[i])) i = stringa(s, i)[1] - 1;
    else if (s[i] === '{') prof++;
    else if (s[i] === '}' && --prof === 0) return i;
  }
  return -1;
};

/** Prop `nome={espressione}` di ogni `<StatCard … />` del testo (commenti tolti). */
export const statCard = testo => {
  const s = senzaCommenti(testo);
  const carte = [];
  for (const m of s.matchAll(/<StatCard\b/g)) {
    const prop = {};
    let i = m.index + m[0].length;
    while (i < s.length) {
      i = spazi(s, i);
      if (s.startsWith('/>', i) || s[i] === '>') break;
      const nome = /^[A-Za-z_$][\w$]*/.exec(s.slice(i, i + 100))?.[0];
      if (!nome) break;
      i += nome.length;
      if (s[i] !== '=') continue;
      i++;
      if (s[i] === '{') {
        const fine = fineGraffe(s, i);
        if (fine < 0) break;
        prop[nome] = s.slice(i + 1, fine).trim();
        i = fine + 1;
      } else if ('\'"'.includes(s[i])) {
        const [v, fine] = stringa(s, i);
        prop[nome] = JSON.stringify(v);
        i = fine;
      } else break;
    }
    carte.push(prop);
  }
  return carte;
};

// `t('<chiave letterale>')` o `t('<chiave letterale>', { year })` / `{ year: Y }`, nient'altro.
const CHIAMATA_T =
  /^t\(\s*(['"])([\w.]+)\1\s*(?:,\s*\{\s*year(?:\s*:\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*))?\s*,?\s*\}\s*)?\)$/;
const chiamataT = espressione => {
  const m = CHIAMATA_T.exec(espressione ?? '');
  if (!m) return null;
  const conAnno = /,\s*\{/.test(espressione);
  return { chiave: m[2], anno: conAnno ? (m[3] ?? 'year') : null };
};
// Quante volte il file lega il nome `y`: const/let/var, destrutturazione, parametri, catch.
const legami = (testo, y) => {
  const nome = new RegExp(`(^|[^\\w$.])${y}(?![\\w$])`);
  const gruppi = [
    ...testo.matchAll(
      new RegExp(`\\b(?:const|let|var)\\s+${y}(?![\\w$])`, 'g')
    ),
    ...[
      ...testo.matchAll(/\b(?:const|let|var)\s*[{[]([^=;]*)[}\]]\s*=/g),
    ].filter(m => nome.test(m[1])),
    ...[...testo.matchAll(/\(([^()]*)\)\s*(?::[^=]*)?=>/g)].filter(m =>
      nome.test(m[1])
    ),
    ...testo.matchAll(new RegExp(`(^|[^\\w$.])${y}\\s*=>`, 'g')),
    ...[...testo.matchAll(/\bfunction\b[^(]*\(([^)]*)\)/g)].filter(m =>
      nome.test(m[1])
    ),
    ...testo.matchAll(new RegExp(`\\bcatch\\s*\\(\\s*${y}\\s*\\)`, 'g')),
  ];
  return gruppi.length;
};
const annoDaResultsYear = (testo, y) =>
  y === 'IMPACT_DATA.resultsYear' ||
  (/^[A-Za-z_$][\w$]*$/.test(y ?? '') &&
    new RegExp(`\\bconst\\s+${y}\\s*=\\s*IMPACT_DATA\\.resultsYear\\s*;`).test(
      testo
    ) &&
    legami(testo, y) === 1);

// Test protetto: via le righe intere del jest.mock di LazyLoading, CRLF → LF (R20).
export const senzaMockLazy = testo => {
  const s = (testo ?? '').replace(/\r\n/g, '\n');
  const m = /jest\.mock\(\s*['"]@\/navigation\/LazyLoading['"]/.exec(s);
  if (!m) return s;
  let prof = 0;
  let i = m.index + 'jest.mock'.length;
  for (; i < s.length; i++) {
    if ('\'"`'.includes(s[i])) i = stringa(s, i)[1] - 1;
    else if (s[i] === '(') prof++;
    else if (s[i] === ')' && --prof === 0) break;
  }
  const inizioRiga = s.lastIndexOf('\n', m.index) + 1;
  const a = s.indexOf('\n', i);
  return s.slice(0, inizioRiga) + (a < 0 ? '' : s.slice(a + 1));
};
// sha256 di senzaMockLazy(accountNavigation.test.tsx a 7b764e9), calcolato il 18/10 da `git show`.
export const SHA_TEST_PROTETTO_C7 =
  'e6d8d8f48b42a10491961ca6b41bb8cafa9504fb06ad8ebca2ac474b5863e9bd';

/**
 * '' se la card delle vite rispetta C7, altrimenti il motivo.
 * impatto: [{nome, testo}] dei .tsx di src/features/impact (test esclusi); it/en: sorgenti dei file di
 * traduzione; resultsYear: numero letto da IMPACT_DATA; anno2025: 11.100 nel blocco 2025 dell'estratto;
 * testProtetto: {prima (a 7b764e9), dopo} di accountNavigation.test.tsx.
 */
export const verificaCardVite = ({
  impatto,
  it,
  en,
  resultsYear,
  anno2025,
  testProtetto,
  shaTestProtetto = SHA_TEST_PROTETTO_C7,
}) => {
  if (!anno2025)
    return "11.100 assente dal blocco 2025 dell'estratto (estratto o lettore cambiati: si rinegozia)";
  const lingue = { it: traduzioni(it), en: traduzioni(en) };
  if (!lingue.it || !lingue.en) return 'it.ts o en.ts illeggibile';
  const carte = (impatto ?? []).flatMap(f =>
    statCard(f.testo)
      .filter(p => /\bIMPACT_DATA\.livesImpactedMeals\b/.test(p.value ?? ''))
      .map(p => ({ ...p, file: f.nome, testo: senzaCommenti(f.testo) }))
  );
  if (!carte.some(c => c.file.endsWith('/components/AnnualResultsSection.tsx')))
    return 'nessuna StatCard con value = IMPACT_DATA.livesImpactedMeals in AnnualResultsSection.tsx';
  for (const c of carte) {
    const parti = [];
    for (const nome of ['label', 'subtitle']) {
      if (c[nome] === undefined && nome === 'subtitle') continue;
      const t = chiamataT(c[nome]);
      if (!t)
        return `${c.file}: ${nome} non è t('<chiave letterale>'[, { year }])`;
      const testi = {
        it: traduzione(lingue.it, t.chiave),
        en: traduzione(lingue.en, t.chiave),
      };
      if (testi.it == null || testi.en == null)
        return `${c.file}: chiave ${t.chiave} non risolta in it.ts o en.ts`;
      if (/\d/.test(testi.it + testi.en))
        return `${c.file}: cifre nel testo di ${t.chiave}`;
      parti.push({ nome, ...t, testi });
    }
    if (!/vite impattate/i.test(parti[0].testi.it))
      return `${c.file}: l'etichetta it della card delle vite non dice «vite impattate»`;
    const conAnno = parti.filter(
      p => p.testi.it.includes('{{year}}') && p.testi.en.includes('{{year}}')
    );
    if (!conAnno.length)
      return `${c.file}: né label né subtitle portano {{year}} in it ed en`;
    const senzaAnno = parti.filter(
      p =>
        (p.testi.it + p.testi.en).includes('{{year}}') &&
        !annoDaResultsYear(c.testo, p.anno)
    );
    if (senzaAnno.length)
      return `${c.file}: ${senzaAnno.map(p => p.nome).join(', ')} con {{year}} senza year da IMPACT_DATA.resultsYear`;
  }
  if (resultsYear !== 2025)
    return `IMPACT_DATA.resultsYear = ${resultsYear}, atteso 2025`;
  if (testProtetto == null) return 'accountNavigation.test.tsx assente';
  if (sha256(senzaMockLazy(testProtetto)) !== shaTestProtetto)
    return 'accountNavigation.test.tsx cambiato fuori dal blocco jest.mock di LazyLoading';
  return '';
};
