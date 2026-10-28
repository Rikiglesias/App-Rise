// C19-C20: runbook di rilascio docs/store/google-play/rilascio.md (contratto del goal android-play).
// Il runbook ha sezioni `## ` fisse; ognuna deve contenere i suoi elementi obbligatori.
import { esiste, leggi, normalizzaSpazi, percorso, voci } from './comune.mjs';

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
    // Emendato R25: deploy delle funzioni Edge dal commit consegnato e sonda di delete-account (C35, C60),
    // Cron senza chiavi legacy, chiave pubblica dell'app (anche sulla 1.2.9 iOS), base giuridica del rise_ref (G5).
    'git log -1',
    'functions deploy delete-account',
    'functions deploy purge-deletions',
    'Authorization: Bearer x',
    '{"error":"unauthorized"} 401',
    /\bCron\b/,
    'eyJ',
    'sb_publishable_',
    '1.2.9',
    /base giuridica del `rise_ref`/i,
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

// Emendato R28-R29: chi importa o ricrea profili in Supabase scrive anche il registro, e la scelta sul
// `recordConsent` fallito dopo l'upsert è dichiarata.
export const FRASI_C20 = [
  'scrive anche gli eventi `marketing`',
  "un `recordConsent` fallito dopo l'upsert lascia `false`",
];

// Emendato R25: una voce per ciascuna voce «Da R24/R25» del Fuori contratto. Ogni voce è UN punto d'elenco di
// «Chi fa cosa» che contiene le sue parole e «Innesco:» (quando farla), non parole sparse nella sezione.
export const VOCI_R25_C20 = [
  ["PEC nell'informativa", 'PEC', /informativ/i],
  ['migration 0022', '0022', '0017-0021', /sola lettura/i],
  ["profilo Let's Donation «Onlus» → «ETS»", 'Onlus', 'ETS', "Let's Donation"],
  [
    'G3 G5 G8',
    'DPA',
    /base giuridica/i,
    'rise_ref',
    /revoca/i,
    /cancellazion/i,
  ],
  ['piano Supabase Pro', /Supabase Pro/i, /backup/i],
  ['rettifica del brief del 31/07', /rettific/i, /brief/i, '31/07'],
  [
    'migrazione degli iscritti e collaudo',
    /migrazione/i,
    /iscritt/i,
    /collaud/i,
    'rise_ref',
  ],
];

const PUNTO_ELENCO = /^(?:[-*]|\d+\.)\s/;

/** Prima voce R25 mancante o senza «Innesco:» fra i punti d'elenco di un testo. */
export const controllaVociR25 = testo => {
  const punti = voci(testo).filter(v => PUNTO_ELENCO.test(v));
  for (const [nome, ...elementi] of VOCI_R25_C20) {
    const candidati = punti.filter(p => elementi.every(el => contiene(p, el)));
    if (!candidati.length) return `manca la voce «${nome}»`;
    if (!candidati.some(p => p.includes('Innesco:')))
      return `voce «${nome}» senza «Innesco:»`;
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
      const motivo = controllaSezioni(ATTORI_C20, attori, 'Chi fa cosa');
      if (motivo) return motivo;
      const sezione = sezioni(runbook, 2).find(x =>
        x.titolo.includes('Chi fa cosa')
      );
      const testo = normalizzaSpazi(sezione.testo).replace(/[’‘]/g, "'");
      const manca = FRASI_C20.find(f => !testo.includes(f));
      if (manca) return `Chi fa cosa: manca «${manca}»`;
      const voce = controllaVociR25(sezione.testo.replace(/[’‘]/g, "'"));
      return voce ? `Chi fa cosa: ${voce}` : null;
    },
  },
};
