// Storia delle controprove in git (regola R27-R29): una controprova rifatta conserva l'esito alla base di
// ogni titolo vecchio, e il registro dice con quale commit dei file di test è stato generato.
import { esegui, exitDi } from './comune.mjs';

/** Percorso nel repo del registro di un criterio (stesso file di `fileControprova`). */
const percorsoRegistro = id =>
  `docs/store/google-play/verifica/controprova-${id}.json`;

const stessoRegistro = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * La controprova precedente in git: la versione più recente fra quelle committate che differisce da
 * `registro` (se `registro` è già committato si guarda quella prima). `commitNoto`: `commitFileTest`
 * è nella storia di HEAD (null se il registro non lo dichiara).
 */
export const storiaControprova = (id, registro) => {
  const file = percorsoRegistro(id);
  const versioni = esegui('git', ['log', '--format=%H', '--', file])
    .split(/\s+/)
    .filter(Boolean);
  let precedente = null;
  let commitPrecedente = null;
  for (const c of versioni) {
    let vecchio;
    try {
      vecchio = JSON.parse(esegui('git', ['show', `${c}:${file}`]));
    } catch {
      continue; // commit che cancella il file, o testo illeggibile
    }
    if (!stessoRegistro(vecchio, registro)) {
      precedente = vecchio;
      commitPrecedente = c.slice(0, 7);
      break;
    }
  }
  const commit = registro?.commitFileTest;
  return {
    precedente,
    commitPrecedente,
    commitNoto: commit
      ? exitDi('git', ['merge-base', '--is-ancestor', commit, 'HEAD']) === 0
      : null,
  };
};

/**
 * Motivo di FAIL se, rispetto alla controprova precedente sulla stessa base, un titolo rosso non è più
 * rosso o un titolo diventa assente (anche sulle basi non rigorose); '' altrimenti. I titoli tolti dal
 * criterio non si confrontano.
 */
export const regressioneControprova = (precedente, registro) => {
  if (!precedente || !registro || precedente.base !== registro.base) return '';
  const ora = registro.esitiAllaBase ?? {};
  for (const [t, prima] of Object.entries(precedente.esitiAllaBase ?? {})) {
    if (!(t in ora)) continue;
    if (prima === 'failed' && ora[t] !== 'failed')
      return `«${t}» era failed alla base nella controprova precedente, ora ${ora[t]}`;
    if (ora[t] === 'assente' && prima !== 'assente')
      return `«${t}» diventato assente alla base (prima ${prima})`;
  }
  return '';
};

/** Motivo di FAIL della storia del registro, o ''. `richiesto`: il registro deve dichiarare `commitFileTest`. */
export const esitoStoria = (registro, storia, richiesto) => {
  if (!registro) return ''; // «controprova mancante» lo dice già esitoControprova
  const regressione = regressioneControprova(storia?.precedente, registro);
  if (regressione)
    return `${regressione} (${storia.commitPrecedente ?? 'commit ignoto'})`;
  if (registro.commitFileTest == null)
    return richiesto
      ? 'controprova senza commitFileTest (commit dei file di test)'
      : '';
  return storia?.commitNoto === true
    ? ''
    : `commitFileTest ${String(registro.commitFileTest).slice(0, 7)} non è nella storia di HEAD`;
};

/** Commit da scrivere in `commitFileTest`: i file di test sono quelli dell'albero su questo commit. */
export const commitCorrente = () => esegui('git', ['rev-parse', 'HEAD']).trim();

/** Rifiuta di scrivere controprove che perdono un esito alla base: lancia con l'elenco dei motivi. */
export const controllaRegressioni = registri => {
  const motivi = registri
    .map(r => {
      const m = regressioneControprova(
        storiaControprova(r.criterio, r).precedente,
        r
      );
      return m && `${r.criterio}: ${m}`;
    })
    .filter(Boolean);
  if (motivi.length)
    throw new Error(`controprova non scritta: ${motivi.join('; ')}`);
};
