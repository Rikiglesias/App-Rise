// C22 per i criteri R27-R29 su documenti, testi e database (C86 C91 C92 C96; C99 sta in
// selftest-f13-r27-pubblici.mjs): ogni fixture negativa è il positivo con UNA mutazione; i lettori sono
// provati con testi interi (tabelle, HTML, sorgenti delle lingue).
import { C79_OK, casi } from './selftest-f13-esterni.mjs';
import { conStatico } from './selftest-f13-r27.mjs';

// --- C86 ---
const UCCISO = shim =>
  `M9 profilo ricreato senza protezione [${shim}]: UCCISO dal test previsto`;
const C86_OK = {
  ...C79_OK,
  sql: C79_OK.sql.replace('before update', 'before insert or update'),
  testoSuite: `${C79_OK.testoSuite}\nselect pg_temp.verifica(x, 'T16 profilo ricreato dal client: vale il registro');`,
  mutanti: `${C79_OK.mutanti}\nrun_mutante 'M9 profilo ricreato senza protezione' 'T16.*FAIL' \\`,
  mutazioni: {
    exit: 0,
    uscita: [
      UCCISO('shim_permissive'),
      UCCISO('shim_restrictive'),
      'tutti i mutanti uccisi dal test previsto',
    ].join('\n'),
  },
};

// --- C91 ---
const C91_OK = {
  uscita: '// il codice parte solo con il consenso ok\nconst x = 1;',
  quadro: [
    '| Dato | Direzione | Condizione |',
    '|---|---|---|',
    '| Codice di provenienza (`rise_ref`) | noi → LD | Solo con il consenso `ok` |',
    '| Lo stesso codice, riga distinta | noi → Donorbox | solo con il  consenso |',
  ].join('\n'),
  informative: {
    'privacy-policy.html':
      '<p>\n  Il <strong>codice di provenienza</strong> è una sigla casuale:\n  parte solo se hai accettato l’informativa.\n</p>',
    'privacy-policy-en.html':
      '<p>The <strong>referral code</strong> is a random code, sent only if you have accepted the privacy policy.</p>',
  },
};
const informativa = (f, testo) => ({
  informative: { ...C91_OK.informative, [f]: testo },
});

// --- C92 ---
const lingua = (corpo, donorbox, titolo = 'Stai per uscire') =>
  `export default {\n  partner: {\n    donorboxDisclosureTitle: '${titolo}',\n    donorboxDisclosureBody:\n      '${donorbox}',\n    disclosureTitle: '${titolo}',\n    disclosureBody: '${corpo}',\n  },\n};`;
const CORPO_IT =
  'Ti portiamo fuori con un codice collegato al tuo account, per sapere che arrivi dall’app.';
const CORPO_EN =
  'We add a code linked to your account, to know you came from the app.';
const IT_OK = lingua(
  CORPO_IT,
  `${CORPO_IT} Vale anche se continui senza i tuoi dati.`
);
const EN_OK = lingua(
  CORPO_EN,
  `${CORPO_EN} It is sent even if you continue without your details.`
);
const C92_OK = {
  locali: { it: IT_OK, en: EN_OK },
  uscita: "// l'avviso nomina il codice\nconst sito = 'https://example.org/x';",
  flag: "const KEY_PREFIX = 'partner_disclosure_seen_v2';\nconst KEY_PREFIX_DONORBOX = 'donorbox_disclosure_seen_v2';",
  risposte:
    "## Sicurezza dei dati\n### Condivisione verso Donorbox e Let's Donation (motivazione)\nGli avvisi nominano il codice di provenienza.\nResta dichiarato come condiviso.\n### Altro\nniente\n",
};

// --- C96 ---
const C96_OK = {
  quadro:
    '| Esporta i miei dati (app) | noi → persona | contiene i riferimenti partner |',
  punti:
    '### L2 — Registro\nIl registro dei consensi si cancella con l’account.\n',
};

export const FIXTURE_F13_R27_TESTI = {
  C86: casi(C86_OK, [
    { sql: C79_OK.sql },
    { sql: `${C79_OK.sql}\n-- before insert or update on profiles` },
    { testoSuite: C79_OK.testoSuite },
    { mutanti: C79_OK.mutanti },
    {
      mutazioni: {
        ...C86_OK.mutazioni,
        uscita:
          UCCISO('shim_permissive') +
          '\ntutti i mutanti uccisi dal test previsto',
      },
    },
    { docker: false },
  ]),
  C91: conStatico(
    'C91',
    C91_OK,
    [
      { uscita: null },
      { uscita: '/* UNA VOLTA per utente, poi ref su OGNI\n * uscita. */' },
      { quadro: null },
      {
        quadro: C91_OK.quadro.replace('solo con il  consenso', 'a ogni tocco'),
      },
      { quadro: C91_OK.quadro.replace('| Lo stesso codice', '| Il codice') },
      informativa('privacy-policy.html', null),
      informativa(
        'privacy-policy.html',
        C91_OK.informative['privacy-policy.html'].replace(
          'parte solo se hai accettato l’informativa',
          'parte sempre'
        )
      ),
      informativa(
        'privacy-policy-en.html',
        C91_OK.informative['privacy-policy-en.html'].replace(
          'is a random code',
          'is a code'
        )
      ),
    ],
    [
      informativa(
        'privacy-policy.html',
        C91_OK.informative['privacy-policy.html'].replace(
          'l’informativa',
          'l&rsquo;informativa'
        )
      ),
    ]
  ),
  C92: conStatico('C92', C92_OK, [
    { locali: { ...C92_OK.locali, it: null } },
    {
      locali: {
        ...C92_OK.locali,
        it: IT_OK.replaceAll('collegato al tuo account', 'tuo'),
      },
    },
    {
      locali: {
        ...C92_OK.locali,
        en: EN_OK.replace(
          'It is sent even if you continue without your details.',
          ''
        ),
      },
    },
    {
      locali: {
        ...C92_OK.locali,
        it: IT_OK.replace(
          `disclosureBody: '${CORPO_IT}'`,
          "disclosureTitle2: 'x'"
        ),
      },
    },
    {
      locali: {
        ...C92_OK.locali,
        it: lingua(
          CORPO_IT,
          `${CORPO_IT} Vale anche se continui senza i tuoi dati.`,
          'Codice anonimo'
        ),
      },
    },
    {
      locali: {
        ...C92_OK.locali,
        en: EN_OK.replace('We add a code', 'We add an anonymous code'),
      },
    },
    {
      uscita: `${C92_OK.uscita}\n// l'avviso stava sull'ALTRO canale, che manda solo un codice anonimo.`,
    },
    { uscita: null },
    {
      flag: C92_OK.flag.replace(
        'partner_disclosure_seen_v2',
        'partner_disclosure_seen_v1'
      ),
    },
    { flag: `${C92_OK.flag}\nconst VECCHIA = 'donorbox_disclosure_seen_v1';` },
    {
      flag: `// La chiave di Let's Donation resta ESATTAMENTE quella di prima.\n${C92_OK.flag}`,
    },
    { risposte: null },
    { risposte: C92_OK.risposte.replace('### Condivisione', '### Altro') },
    {
      risposte: C92_OK.risposte.replace('Resta dichiarato come condiviso.', ''),
    },
    {
      risposte: C92_OK.risposte.replace(
        'Gli avvisi nominano il codice di provenienza.',
        'Gli avvisi esistono.'
      ),
    },
  ]),
  C96: casi({ statico: C96_OK }, [
    { statico: { ...C96_OK, quadro: null } },
    {
      statico: {
        ...C96_OK,
        quadro: '| Esporta i miei dati (app) | noi → persona | profilo |',
      },
    },
    { statico: { ...C96_OK, punti: null } },
    {
      statico: {
        ...C96_OK,
        punti:
          'Conserviamo il registro anche dopo la cancellazione dell’account. Il registro dei consensi si cancella con l’account.',
      },
    },
    {
      statico: { ...C96_OK, punti: '### L2\nIl registro dei consensi resta.' },
    },
  ]),
};
