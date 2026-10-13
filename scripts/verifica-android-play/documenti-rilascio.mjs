// C19-C20: runbook di rilascio docs/store/google-play/rilascio.md (contratto del goal android-play).
// Il runbook ha sezioni `## ` fisse; ognuna deve contenere i suoi elementi obbligatori.
import { esiste, leggi, percorso } from './comune.mjs';

const RUNBOOK = percorso('docs', 'store', 'google-play', 'rilascio.md');
const GUIDA_STORE = percorso('docs', 'STORE-LOCALIZATION-GUIDE.md');

/** [titolo che la sezione deve contenere, ...elementi (stringa o regex) richiesti nel suo testo] */
export const SEZIONI_C19 = [
  ['Creare', /Play Console/],
  ['Primo invio', 'eas submit', 'internal', 'draft'],
  ['Scheda e moduli', 'scheda.md', 'play-console-risposte.md'],
  ['Rapporto pre-lancio', /credenziali/i],
  ['Prima produzione', /100\s?%/, '6346149'],
  ['Rilascio graduale', /graduale/i, /ferm|interromp/i],
  ['Account personale', /12 tester/i, /14 giorni/i],
  [
    'Gate prima',
    'curl',
    'privacy',
    /elimina-account|delete-account/,
    /marcatore/i,
  ],
  [
    'Aggiornamenti OTA',
    'eas update',
    '--platform android',
    /rollback|republish/i,
  ],
  ['Divieti', 'update:production', '1.3.0', 'iOS'],
  ['Android vitals', /vitals/i, /2 settimane|due settimane/i],
  ['Recensioni', /rispond/i],
  ['Note per la revisione', 'OpenClick'],
  ['Avviso agli utenti della 1.0', /account/i],
];
export const ATTORI_C20 = [
  [
    'Simone',
    'D-U-N-S',
    /verifica (del )?sito/i,
    /telefon/i,
    /tipo di account/i,
    /service account/i,
  ],
  ['Alberto', 'PEC'],
  [
    'Riccardo',
    'SMTP',
    'Site URL',
    'rahitalia://',
    /account demo/i,
    /numeri d.impatto/i,
    /decisioni aperte/i,
  ],
  ['Sede USA', /pagin/i, /inglese|english/i],
  ['OpenClick', 'PEC', /ritir/i],
  ['Consulente', /informativa/i],
  ['Comunicazione', /avviso/i],
];

/** Sezioni di un markdown al livello indicato: [{ titolo, testo }]. */
export const sezioni = (md, livello) => {
  const re = new RegExp(`^${'#'.repeat(livello)} (.+)$`, 'gm');
  const titoli = [...md.matchAll(re)];
  return titoli.map((m, i) => ({
    titolo: m[1].trim(),
    testo: md.slice(m.index, titoli[i + 1]?.index ?? md.length),
  }));
};

const contiene = (testo, el) =>
  typeof el === 'string' ? testo.includes(el) : el.test(testo);

/** Primo elemento mancante per una lista [titolo, ...elementi] contro le sezioni date. */
export const controllaSezioni = (elenco, trovate, dove) => {
  for (const [titolo, ...elementi] of elenco) {
    const s = trovate.find(x => x.titolo.includes(titolo));
    if (!s) return `${dove}: manca la sezione «${titolo}»`;
    const manca = elementi.find(el => !contiene(s.testo, el));
    if (manca) return `${dove} «${titolo}»: manca ${manca}`;
  }
  return null;
};

const chiFaCosa = md => {
  const s = sezioni(md, 2).find(x => x.titolo.includes('Chi fa cosa'));
  return s ? sezioni(s.testo, 3) : null;
};

export const criteri = {
  C19: {
    leggi: () => ({
      runbook: esiste(RUNBOOK) ? leggi(RUNBOOK) : null,
      guida: esiste(GUIDA_STORE) ? leggi(GUIDA_STORE) : null,
    }),
    verifica({ runbook, guida }) {
      if (!runbook) return 'manca docs/store/google-play/rilascio.md';
      const motivo = controllaSezioni(
        SEZIONI_C19,
        sezioni(runbook, 2),
        'rilascio.md'
      );
      if (motivo) return motivo;
      if (guida !== null && !guida.includes('google-play/rilascio.md'))
        return 'docs/STORE-LOCALIZATION-GUIDE.md non rimanda a google-play/rilascio.md';
      return null;
    },
  },
  C20: {
    leggi: () => ({ runbook: esiste(RUNBOOK) ? leggi(RUNBOOK) : null }),
    verifica({ runbook }) {
      if (!runbook) return 'manca docs/store/google-play/rilascio.md';
      const attori = chiFaCosa(runbook);
      if (!attori) return 'rilascio.md: manca la sezione «Chi fa cosa»';
      return controllaSezioni(ATTORI_C20, attori, 'Chi fa cosa');
    },
  },
};
