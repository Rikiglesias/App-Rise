/**
 * Ricerca offline dei comuni italiani per l'autocomplete città (registrazione
 * donatore). Sorgente: `comuni-min.json` (7904 comuni ISTAT, generato da
 * `npm run gen:comuni`). Nessuna rete: il dato anagrafico resta disponibile
 * offline e senza dipendere da un servizio esterno a runtime.
 */
import rawComuni from './comuni-min.json';

/** Forma compatta sul disco: n=nome, s=sigla provincia, p=nome provincia. */
interface RawComune {
  n: string;
  s: string;
  p: string;
}

export interface Comune {
  /** Nome del comune (valore del campo Città). */
  nome: string;
  /** Sigla provincia, es. "RM" (valore del campo Provincia). */
  sigla: string;
  /** Nome provincia, es. "Roma" (disambigua gli omonimi nel dropdown). */
  provincia: string;
}

interface IndexedComune extends Comune {
  /** Nome normalizzato (lowercase, senza accenti) per il confronto. */
  norm: string;
}

/**
 * Lowercase + mappatura degli accenti ai caratteri base. Usa i caratteri
 * accentati precomposti (NFC) — quelli prodotti dalle tastiere e presenti nel
 * dataset — anziché normalize('NFD') + combining marks: più robusto nel sorgente
 * e indipendente dal supporto Unicode del motore (Hermes-safe).
 */
const normalize = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[àáâä]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .trim();

// Indicizzazione lazy: il `.map` su 7904 voci avviene al primo uso (apertura del
// form auth), non all'import del modulo, per non gravare sull'avvio dell'app.
let cache: IndexedComune[] | null = null;
const load = (): IndexedComune[] => {
  if (!cache) {
    cache = (rawComuni as unknown as RawComune[]).map(c => ({
      nome: c.n,
      sigla: c.s,
      provincia: c.p,
      norm: normalize(c.n),
    }));
  }
  return cache;
};

/** Numero minimo di caratteri prima di proporre suggerimenti. */
const MIN_QUERY = 2;

/**
 * Comuni che matchano `query`, ordinati per pertinenza: prima i prefissi
 * (il nome inizia con la query), poi le sottostringhe; ogni gruppo resta in
 * ordine alfabetico (il dataset è pre-ordinato). Sotto i 2 caratteri ritorna [].
 */
export const searchComuni = (query: string, limit = 8): Comune[] => {
  const q = normalize(query);
  if (q.length < MIN_QUERY) return [];
  const data = load();
  const starts: Comune[] = [];
  const contains: Comune[] = [];
  for (const c of data) {
    if (c.norm.startsWith(q)) {
      starts.push({ nome: c.nome, sigla: c.sigla, provincia: c.provincia });
      if (starts.length >= limit) break;
    } else if (contains.length < limit && c.norm.includes(q)) {
      contains.push({ nome: c.nome, sigla: c.sigla, provincia: c.provincia });
    }
  }
  return starts.length >= limit
    ? starts
    : [...starts, ...contains].slice(0, limit);
};
