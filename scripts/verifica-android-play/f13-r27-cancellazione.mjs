// Controllo statico di C89 (contratto android-play, R30-R33): nessun avviso di «esito incerto», il testo
// neutro `auth.errors.delete_interrupted` e il tipo di ritorno di `deleteAccountNow` scritto in linea.
// Il lettore restituisce i testi interi: il parsing sta in `verifica`, così il selftest prova anche lui.
import { elencaFile, esiste, leggi, percorso, rel } from './comune.mjs';
import { testoTraduzione } from './app.mjs';

const leggiSeEsiste = p => (esiste(percorso(p)) ? leggi(percorso(p)) : null);

export const LOCALI_C89 = { it: 'src/locales/it.ts', en: 'src/locales/en.ts' };
export const AZIONI_C89 = 'src/shared/auth/accountActions.ts';
export const CONTESTO_C89 = 'src/shared/auth/AuthContext.tsx';
export const CHIAVI_DELETE_C89 = [
  'title',
  'warning',
  'now',
  'scheduled',
  'scheduledHint',
  'confirmNow',
  'confirmScheduled',
  'confirm',
  'cancel',
  'banner',
  'bannerCancel',
  'error',
  'done',
];
export const TESTO_INTERROTTA_C89 =
  "Connessione interrotta: riprova per completare l'eliminazione.";
// Firma con il tipo scritto in linea: senza annotazione TypeScript non controlla i campi in più.
const FIRME_C89 = [
  [AZIONI_C89, /export const deleteAccountNow = async \(\)\s*:\s*Promise<\{/],
  [CONTESTO_C89, /\bdeleteAccountNow\s*:\s*\(\)\s*=>\s*Promise<\{/],
];

const APICI = `'"\``;

/** Indice dell'apice che chiude la stringa aperta in `da` (escape saltati). */
const fineStringa = (s, da) => {
  let j = da + 1;
  for (; j < s.length && s[j] !== s[da]; j++) if (s[j] === '\\') j++;
  return j;
};

/** Indice dell'ultimo carattere del commento che parte in `da`, o -1 se `da` non apre un commento. */
const fineCommento = (s, da) => {
  if (s[da] !== '/') return -1;
  if (s[da + 1] === '/') {
    const a = s.indexOf('\n', da);
    return a < 0 ? s.length : a;
  }
  if (s[da + 1] === '*') {
    const a = s.indexOf('*/', da + 2);
    return a < 0 ? s.length : a + 1;
  }
  return -1;
};

/** Testo dalla parentesi in `da` a quella che la chiude, saltando stringhe e commenti; null se non si chiude. */
export const bloccoDa = (s, da) => {
  let livello = 0;
  for (let i = da; i < s.length; i++) {
    const commento = fineCommento(s, i);
    if (commento >= 0) i = commento;
    else if (APICI.includes(s[i])) i = fineStringa(s, i);
    else if ('([{'.includes(s[i])) livello++;
    else if (')]}'.includes(s[i]) && --livello === 0) return s.slice(da, i + 1);
  }
  return null;
};

/**
 * Chiavi al primo livello di un blocco `{ … }`, con la posizione dopo i due punti. null se al primo
 * livello c'è una chiave fra apici o uno spread: l'insieme delle chiavi non sarebbe più leggibile così.
 */
export const chiaviPrimoLivello = blocco => {
  const s = String(blocco);
  const chiavi = [];
  let livello = 0;
  for (let i = 1; i < s.length - 1; i++) {
    const commento = fineCommento(s, i);
    if (commento >= 0) i = commento;
    else if (APICI.includes(s[i])) {
      const j = fineStringa(s, i);
      if (livello === 0 && /^\s*:/.test(s.slice(j + 1))) return null;
      i = j;
    } else if (s.startsWith('...', i)) {
      if (livello === 0) return null;
      i += 2;
    } else if ('([{'.includes(s[i])) livello++;
    else if (')]}'.includes(s[i])) livello--;
    else if (/[A-Za-z_$]/.test(s[i]) && !/[\w$]/.test(s[i - 1])) {
      const m = /^([A-Za-z_$][\w$]*)(\??\s*:)?/.exec(s.slice(i, i + 200));
      if (livello === 0 && m[2])
        chiavi.push({ nome: m[1], dopo: i + m[0].length });
      i += m[0].length - 1;
    }
  }
  return chiavi;
};

/** Il blocco `{ … }` della chiave diretta `nome` di `blocco`, o null. */
export const figlio = (blocco, nome) => {
  if (blocco == null) return null;
  const chiave = chiaviPrimoLivello(blocco)?.find(c => c.nome === nome);
  if (!chiave) return null;
  const graffa = chiave.dopo + blocco.slice(chiave.dopo).search(/\S/);
  return blocco[graffa] === '{' ? bloccoDa(blocco, graffa) : null;
};

const radice = testo => {
  const m = /export default\s*\{/.exec(testo ?? '');
  return m ? bloccoDa(testo, m.index + m[0].length - 1) : null;
};

/** Campi del tipo di ritorno in linea, o il motivo per cui non lo è. */
export const campiRitorno = (testo, firma) => {
  const m = firma.exec(testo ?? '');
  if (!m)
    return { motivo: 'tipo di ritorno non scritto in linea come Promise<{…}>' };
  const graffa = m.index + m[0].length - 1;
  const tipo = bloccoDa(testo, graffa);
  if (tipo == null) return { motivo: 'tipo di ritorno non chiuso' };
  if (testo.slice(graffa + tipo.length).trimStart()[0] !== '>')
    return { motivo: 'tipo di ritorno composto (intersezione o altro)' };
  const chiavi = chiaviPrimoLivello(tipo);
  if (!chiavi)
    return { motivo: 'tipo di ritorno con spread o chiavi fra apici' };
  return { campi: chiavi.map(c => c.nome).sort() };
};

const apostrofi = s => String(s ?? '').replace(/[’‘]/g, "'");

export const staticoC89 = {
  leggi: () => ({
    locali: Object.fromEntries(
      Object.entries(LOCALI_C89).map(([l, f]) => [l, leggiSeEsiste(f)])
    ),
    azioni: leggiSeEsiste(AZIONI_C89),
    contesto: leggiSeEsiste(CONTESTO_C89),
    sorgenti: Object.fromEntries(
      elencaFile(percorso('src'), p => /\.tsx?$/.test(p))
        .map(rel)
        .filter(f => !f.startsWith('src/__tests__/'))
        .map(f => [f, leggi(percorso(f))])
    ),
  }),
  verifica({ locali, azioni, contesto, sorgenti }) {
    const attese = [...CHIAVI_DELETE_C89].sort().join(',');
    for (const [l, f] of Object.entries(LOCALI_C89)) {
      const s = locali?.[l];
      if (s == null) return `${f} assente`;
      const auth = figlio(radice(s), 'auth');
      const del = figlio(auth, 'delete');
      if (!del) return `${f}: blocco auth.delete non trovato`;
      const chiavi = chiaviPrimoLivello(del);
      if (!chiavi) return `${f}: auth.delete con chiavi fra apici o spread`;
      const trovate = chiavi
        .map(c => c.nome)
        .sort()
        .join(',');
      if (trovate !== attese)
        return `${f}: chiavi di auth.delete {${trovate}} invece di {${attese}}`;
      const errori = figlio(auth, 'errors');
      const testo = errori && testoTraduzione(errori, 'delete_interrupted');
      if (!testo) return `${f}: auth.errors.delete_interrupted assente o vuota`;
      if (l === 'it' && apostrofi(testo) !== TESTO_INTERROTTA_C89)
        return `${f}: auth.errors.delete_interrupted «${testo}» invece di «${TESTO_INTERROTTA_C89}»`;
    }
    const testi = { [AZIONI_C89]: azioni, [CONTESTO_C89]: contesto };
    for (const [f, firma] of FIRME_C89) {
      if (testi[f] == null) return `${f} assente`;
      const { campi, motivo } = campiRitorno(testi[f], firma);
      if (motivo) return `${f}: deleteAccountNow, ${motivo}`;
      if (campi.join(',') !== 'error,sessioneAncoraSulDispositivo')
        return `${f}: deleteAccountNow restituisce {${campi.join(',')}}`;
    }
    const conIncerto = Object.keys(sorgenti ?? {}).find(f =>
      /esitoIncerto/.test(sorgenti[f])
    );
    if (conIncerto) return `${conIncerto}: contiene ancora esitoIncerto`;
    return '';
  },
};
