// Fixture del selftest (C22) per i documenti: C15, C19, C20.
import { ATTORI_C20, SEZIONI_C19 } from './documenti-rilascio.mjs';

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
]);
const esempio = el => {
  if (typeof el === 'string') return el;
  const testo = ESEMPI.get(String(el));
  if (!testo) throw new Error(`selftest: manca un esempio per ${el}`);
  return testo;
};
const blocco = (livello, [titolo, ...el]) =>
  `${'#'.repeat(livello)} ${titolo}\n${el.map(esempio).join(' ')}\n`;
const runbookOk = () =>
  SEZIONI_C19.map(s => blocco(2, s)).join('\n') +
  '\n## Chi fa cosa\n' +
  ATTORI_C20.map(a => blocco(3, a)).join('\n');

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
    ],
    pos: [{ runbook: runbookOk() }],
  },
};
