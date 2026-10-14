// Fixture del selftest (C22) per C17, le risposte ai moduli di Play Console.
const CAMPI = [
  'first_name',
  'last_name',
  'nickname',
  'phone',
  'city',
  'province',
  'country',
  'birth_date',
  'privacy_consent',
  'marketing_consent',
];
const MD = [
  '# Play Console',
  '## Creazione app',
  '| Campo | Risposta |',
  '| --- | --- |',
  '| Nome app | Rise Against Hunger Italia |',
  '| Lingua predefinita | Italiano |',
  '| App o gioco | App |',
  '| Senza costi o a pagamento | Senza costi |',
  '## Impostazioni della scheda',
  '| Categoria | Stile di vita |',
  '| Email | `info@example.org` |',
  '| Sito web | <https://example.org> |',
  '## URL delle norme sulla privacy',
  'https://example.org/privacy-policy/',
  "## Accesso all'app",
  'Istruzioni per i revisori; credenziali: le crea Riccardo',
  '(«Chi fa cosa» → Riccardo, account demo).',
  '## Annunci',
  '«No, la mia app non contiene annunci.»',
  '## ID pubblicità',
  'Permesso AD_ID bloccato in blockedPermissions.',
  '## Classificazione dei contenuti',
  'Questionario IARC.',
  '## Pubblico di destinazione',
  "Fasce d'età: 13-15, 16-17, 18 e oltre; account da 14 anni.",
  '## App di notizie',
  "«No, la mia app non è un'app di notizie.»",
  '## Sicurezza dei dati',
  'Fonte: answer/10787469.',
  "| URL per la richiesta di eliminazione dell'account | elimina-account.html («Chi fa cosa» → Sede USA) |",
  `| Campi | \`email\`, ${CAMPI.map(c => `\`${c}\``).join(', ')} |`,
  "### Condivisione verso Donorbox e Let's Donation (motivazione)",
  "- Donorbox: avviso e consenso, eccezione di answer/10787469. Let's Donation: solo il codice.",
  '## Funzionalità finanziarie',
  '«La mia app non offre funzionalità finanziarie.»',
  '## App sanitarie',
  '«No, la mia app non ha funzionalità sanitarie.»',
  '## App governative',
  "«No, la mia app non è un'app governativa.»",
  '## Paesi',
  "I 27 dell'Unione europea e altri 15.",
  '## Norme sui pagamenti',
  'Fonte: answer/9858738.',
  '| Dona | 3.2 | Ammesso, a condizione che lo confermi Alberto («Chi fa cosa» → Alberto) |',
  '| Shop | 3.1 | Ammesso |',
  '| Gift card | — | Decisione aperta di Riccardo («Chi fa cosa» → Riccardo, decisioni aperte) |',
].join('\n');

const caso = (modifica = s => s, extra = {}) => ({
  md: modifica(MD),
  campi: CAMPI,
  titolo: 'Rise Against Hunger Italia',
  privacy: 'https://example.org/privacy-policy/',
  ...extra,
});
const sostituisci = (da, a) => s => s.replace(da, a);

export const FIXTURE_PLAY = {
  C17: {
    neg: [
      caso(() => null),
      caso(sostituisci('## Annunci', '')),
      caso(sostituisci('## Paesi', '## Mercati')),
      caso(sostituisci('## Norme sui pagamenti', '## Pagamenti')),
      caso(sostituisci('answer/9858738', 'answer/1')),
      caso(s => s.replaceAll('10787469', '1')),
      caso(sostituisci('`nickname`, ', '')),
      caso(undefined, { campi: [...CAMPI, 'tax_code'] }),
      caso(undefined, { titolo: 'RAH Italia' }),
      caso(undefined, { privacy: 'https://example.org/altro/' }),
      caso(sostituisci('`info@example.org`', '')),
      caso(sostituisci('<https://example.org>', 'il nostro sito')),
      caso(sostituisci('### Condivisione verso', '### Note su')),
      caso(
        sostituisci(
          'di Riccardo («Chi fa cosa» → Riccardo, decisioni aperte)',
          ''
        )
      ),
      caso(
        sostituisci('Questionario IARC.', 'Questionario IARC: da verificare.')
      ),
      caso(sostituisci('→ Sede USA', '→ Marketing')),
    ],
    pos: [caso()],
  },
};
