// Criteri R27-R29 (C85 C87-C99) del contratto android-play: titoli Jest con controprova a BASE_R27
// (13fa640, rigorosa), guardie e statici. C86 sta con C79 in f13-database.mjs (stessa batteria SQL).
// I titoli sono copiati dal testo dei criteri: vanno in file di test NUOVI (regola R27-R29).
import { BASE_R27, criterioConTitoli } from './titoli-jest.mjs';
import { staticoC93, staticoC94, staticoC98 } from './f13-r27-codice.mjs';
import { staticoC91, staticoC92, staticoC96 } from './f13-r27-testi.mjs';
import { staticoC99 } from './f13-r27-pubblici.mjs';

const CAMPI_C93 = [
  'AuthInput',
  'AuthPhoneField',
  'AuthDateField',
  'AuthCountryField',
  'AuthCityField',
  'AuthConsentCheckbox',
];
const SFONDI_C94 = ['Storia', 'Come Donare', 'avviso partner'];

export const DEFINIZIONI_R27 = Object.fromEntries(
  Object.entries({
    C85: {
      titoli: [
        'il profilo di A sparisce al passaggio a B, anche se quello di B non arriva',
        'profilo rimasto da un altro account → i suoi dati NON partono',
        "l'avviso preparato per un account non vale per quello che subentra",
        'sessione già di B mentre il render è ancora di A: nessun link si apre',
      ],
      guardie: [
        'un rinnovo del token sullo STESSO account non toglie il profilo',
      ],
    },
    C87: {
      titoli: [
        'profilo: cambio email già in attesa non si rimanda salvando altro',
        "profilo: confermata la nuova email, il campo segue l'account e Salva non chiama updateEmail",
        'profilo: email in attesa scritta con le maiuscole, salvare altro non la rimanda',
        "profilo: Rimanda il link chiama resend email_change con l'email in attesa",
        "profilo: Rimanda il link troppo presto → errore annunciato con l'attesa",
      ],
    },
    C88: {
      titoli: [
        'reset nel cancello: Annulla torna al passaggio obbligatorio',
        "reset nel cancello col link di un altro account che ha anche lui il cancello: Annulla va alla radice del cancello dell'account collegato",
      ],
    },
    C89: {
      titoli: [
        'cancellazione: errore ma account già eliminato → riuscita e uscita',
        'cancellazione: errore e account presente → errore (riconciliazione chiamata)',
        'cancellazione: errore e verifica impossibile → esito incerto con cosa fare',
        'cancellazione: secondo tentativo dopo una riuscita → riuscita',
        'cancellazione: la chiamata rigetta → riconciliata come un errore',
      ],
    },
    C90: {
      titoli: [
        'profilo: una risposta vecchia arrivata dopo una nuova non sovrascrive',
        'profilo: un "nessun profilo" vecchio dopo uno nuovo non toglie il profilo',
        'profilo: un errore vecchio dopo un successo non mostra errore',
        'profilo: la risposta vecchia restituisce null',
        "consensi: una lettura partita prima dell'accettazione non riapre il cancello",
      ],
    },
    C91: {
      titoli: [
        "Let's Donation: consenso non verificato → nessun codice",
        "Let's Donation: consenso ignoto ma ri-verifica OK → codice presente (ri-verifica chiamata)",
        'Donorbox: consenso non verificato → nessun utm_content',
      ],
      guardie: [
        'Donorbox: continua senza i miei dati → codice sì, nome ed email no',
      ],
      statico: staticoC91,
    },
    C92: {
      titoli: [
        'avviso partner: testo nuovo mostrato anche a chi aveva visto il vecchio',
      ],
      statico: staticoC92,
    },
    C93: {
      titoli: [
        ...CAMPI_C93.map(c => `errore di campo annunciato all'invio: ${c}`),
        'errore di campo: stesso errore due volte, due annunci',
        "più errori: si annuncia il primo nell'ordine del modulo",
        'suggerimento nickname annunciato una volta, senza live region',
      ],
      statico: staticoC93,
    },
    C94: {
      titoli: SFONDI_C94.map(s => `sfondo non è un controllo senza nome: ${s}`),
      statico: staticoC94,
    },
    C95: {
      titoli: ['profilo: data di nascita col selettore'],
      guardie: ['profilo: data illeggibile → selettore vuoto, nessun crash'],
    },
    C97: {
      titoli: [
        'modifica profilo: al cambio di account i dati del precedente non si salvano sul nuovo',
        'elimina account: al cambio di account la schermata si chiude e non cancella',
        'elimina account nel cancello: al cambio di account si torna al passaggio obbligatorio e non si cancella',
      ],
    },
    // Il quarto titolo è guardia solo se è verde alla base (criterio): si decide sulla controprova.
    C98: {
      titoli: [
        "cancellazione riuscita e uscita fallita: l'app torna ospite",
        "cancellazione riuscita e uscita fallita: la sessione si toglie dallo storage dell'app",
        "rimozione dallo storage fallita: l'app resta ospite in questo avvio",
        'riavvio senza rete dopo cancellazione: nessun dato del profilo',
      ],
      statico: staticoC98,
    },
  }).map(([id, d]) => [id, { ...d, base: BASE_R27 }])
);

const soloStatico = statico => ({
  leggi: async () => ({ statico: await statico.leggi() }),
  verifica: ({ statico: dati }) => statico.verifica(dati),
});

export const criteri = {
  ...Object.fromEntries(
    Object.entries(DEFINIZIONI_R27).map(([id, d]) => [
      id,
      criterioConTitoli(id, d),
    ])
  ),
  C96: soloStatico(staticoC96),
  C99: soloStatico(staticoC99),
};
