// Fixture del selftest (C22) per i documenti: C15, C19, C20.
import {
  ATTORI_C20,
  FRASI_C20,
  SEZIONI_C19,
  VOCI_R25_C20,
} from './documenti-rilascio.mjs';

const campi = (extra = {}) => ({
  titolo: 'Rise Against Hunger Italia',
  breve: 'Scopri il nostro impatto contro la fame.',
  completa: 'Questa è l’app ufficiale di RAH.',
  ...extra,
});
const scheda = (it = {}, en = {}) => ({
  scheda: { 'it-IT': campi(it), 'en-US': campi(en) },
});

// Un esempio letterale che soddisfa ogni regex delle liste di documenti-rilascio.mjs.
const ESEMPI = new Map([
  ['/Play Console/', 'Play Console'],
  ['/credenziali/i', 'credenziali'],
  ['/100\\s?%/', '100 %'],
  ['/graduale/i', 'graduale'],
  ['/ferm|interromp/i', 'fermarlo'],
  ['/12 tester/i', '12 tester'],
  ['/14 giorni/i', '14 giorni'],
  ['/elimina-account|delete-account/', 'elimina-account'],
  ['/marcatore/i', 'marcatore'],
  ['/rollback|republish/i', 'rollback'],
  ['/vitals/i', 'vitals'],
  ['/2 settimane|due settimane/i', '2 settimane'],
  ['/rispond/i', 'rispondere'],
  ['/account/i', 'account'],
  ['/verifica (del )?sito/i', 'verifica del sito'],
  ['/telefon/i', 'telefoni'],
  ['/tipo di account/i', 'tipo di account'],
  ['/service account/i', 'service account'],
  ['/account demo/i', 'account demo'],
  ['/numeri d.impatto/i', 'numeri d’impatto'],
  ['/decisioni aperte/i', 'decisioni aperte'],
  ['/pagin/i', 'pagine'],
  ['/inglese|english/i', 'inglese'],
  ['/ritir/i', 'ritiro'],
  ['/informativa/i', 'informativa'],
  ['/avviso/i', 'avviso'],
  ['/\\bCron\\b/', 'Cron'],
  ['/base giuridica del `rise_ref`/i', 'base giuridica del `rise_ref`'],
  ['/informativ/i', 'informativa'],
  ['/sola lettura/i', 'sola lettura'],
  ['/base giuridica/i', 'base giuridica'],
  ['/revoca/i', 'revoca'],
  ['/cancellazion/i', 'cancellazione'],
  ['/Supabase Pro/i', 'Supabase Pro'],
  ['/backup/i', 'backup'],
  ['/rettific/i', 'rettifica'],
  ['/brief/i', 'brief'],
  ['/migrazione/i', 'migrazione'],
  ['/iscritt/i', 'iscritti'],
  ['/collaud/i', 'collaudo'],
]);
const esempio = el => {
  if (typeof el === 'string') return el;
  const testo = ESEMPI.get(String(el));
  if (!testo) throw new Error(`selftest: manca un esempio per ${el}`);
  return testo;
};
const blocco = (livello, [titolo, ...el]) =>
  `${'#'.repeat(livello)} ${titolo}\n${el.map(esempio).join(' ')}\n`;
// R25: una voce d'elenco per ciascuna voce del Fuori contratto, con le sue parole e l'innesco.
const voceR25 = ([, ...el]) => `- ${el.map(esempio).join(' ')} Innesco: prova.`;
const VOCE_BRIEF = voceR25(VOCI_R25_C20.find(([n]) => n.includes('brief')));
const runbookOk = () =>
  SEZIONI_C19.map(s => blocco(2, s)).join('\n') +
  '\n## Chi fa cosa\n' +
  ATTORI_C20.map(a => blocco(3, a)).join('\n') +
  `\nChi ricrea profili ${FRASI_C20[0]}; scelta:\n${FRASI_C20[1]}.\n\n` +
  VOCI_R25_C20.map(voceR25).join('\n') +
  '\n';

export const FIXTURE_DOCUMENTI = {
  C15: {
    neg: [
      { scheda: null },
      scheda({ titolo: 'Rise Against Hunger Italia — app ufficiale' }),
      scheda({ breve: 'Dona ora 🙌' }),
      scheda({}, { completa: 'The BEST app' }),
      scheda({ completa: 'La migliore app per donare' }),
      scheda({}, { breve: 'Free and simple' }),
      scheda({ completa: 'Numeri aggiornati in tempo reale' }),
      scheda({ completa: 'Operiamo in Mozambico' }),
    ],
    pos: [
      scheda(),
      scheda({ completa: 'Siamo RAH Italia: pasti per chi ha fame.' }),
    ],
  },
  C19: {
    neg: [
      { runbook: null, guida: null },
      { runbook: runbookOk().replace('## Divieti', '## Altro'), guida: null },
      { runbook: runbookOk().replace('6346149', ''), guida: null },
      { runbook: runbookOk(), guida: 'guida senza rimando' },
      // R25: chiave pubblica dell'app e base giuridica del rise_ref nel gate.
      { runbook: runbookOk().replace('sb_publishable_', ''), guida: null },
      {
        runbook: runbookOk().replace('base giuridica del `rise_ref`', 'base'),
        guida: null,
      },
    ],
    pos: [
      {
        runbook: runbookOk(),
        guida: 'vedi docs/store/google-play/rilascio.md',
      },
    ],
  },
  C20: {
    neg: [
      { runbook: runbookOk().replace('## Chi fa cosa', '## Altro') },
      { runbook: runbookOk().replace('### Sede USA', '### Altri') },
      { runbook: runbookOk().replace('rahitalia://', '') },
      // R28-R29: le due frasi su eventi `marketing` e recordConsent fallito.
      ...FRASI_C20.map(f => ({ runbook: runbookOk().replace(f, 'altro') })),
      {
        runbook: runbookOk().replace(
          'scrive anche gli eventi `marketing`',
          'scrive anche gli eventi marketing'
        ),
      },
      // R25: voce assente, voce senza innesco, voce fuori da un elenco.
      { runbook: runbookOk().replace(VOCE_BRIEF, '') },
      {
        runbook: runbookOk().replace(
          VOCE_BRIEF,
          VOCE_BRIEF.replace('Innesco:', 'Quando:')
        ),
      },
      {
        runbook: runbookOk().replace(VOCE_BRIEF, `\n${VOCE_BRIEF.slice(2)}`),
      },
    ],
    pos: [{ runbook: runbookOk() }],
  },
};
