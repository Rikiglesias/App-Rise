// Fixture del selftest (C22) per C14, le pagine di richiesta cancellazione.
import { leggiSezioni, PAGINE } from './documenti-cancellazione.mjs';

const ETICHETTE = {
  it: [
    'Profilo',
    'Privacy e dati',
    'Elimina account',
    'Elimina subito',
    'Sì, procedi',
  ],
  en: [
    'Profile',
    'Privacy and data',
    'Delete account',
    'Delete now',
    'Yes, proceed',
  ],
};
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
const TESTI = {
  it: {
    testa:
      'App RAH Italia, su Google Play «Rise Against Hunger Italia», dello sviluppatore Rise Against Hunger Italia.',
    passi: ETICHETTE.it.join(', '),
    senza:
      '<a href="mailto:info@example.org">scrivi</a>: ti chiederemo di confermare.',
    cancellati:
      'email, password, nome, cognome, nickname, telefono, città, provincia, paese, data di nascita, informativa, comunicazioni',
    conservati: 'Registri tecnici: si cancellano entro 7 giorni.',
    tempi: 'Dall’app subito, per email entro un mese.',
  },
  en: {
    testa:
      'The RAH Italia app, on Google Play «Rise Against Hunger Italia», by the developer Rise Against Hunger Italia.',
    passi: ETICHETTE.en.join(', '),
    senza:
      '<a href="mailto:info@example.org">write</a>: we will ask you to confirm.',
    cancellati:
      'email, password, first name, last name, nickname, phone, city, province, country, date of birth, privacy notice, communications',
    conservati: 'Technical logs are deleted within 7 days.',
    tempi: 'In the app immediately, by email within one month.',
  },
};
const html = (lingua, sost = {}) => {
  const [a, b, c, d, e] = PAGINE[lingua].sezioni;
  const t = { ...TESTI[lingua], ...sost };
  return [
    `<p>${t.testa}</p>`,
    `<h2 id="${a}">1</h2><p>${t.passi}</p>`,
    `<h2 id="${b}">2</h2><p>${t.senza}</p>`,
    `<h2 id="${c}">3</h2><p>${t.cancellati}</p>`,
    `<h2 id="${d}">4</h2><p>${t.conservati}</p>`,
    `<h2 id="${e}">5</h2><p>${t.tempi}</p>`,
  ].join('\n');
};
const caso = ({ it = {}, en = {}, campi = CAMPI, pagine } = {}) => ({
  pagine: pagine ?? {
    it: leggiSezioni(html('it', it)),
    en: leggiSezioni(html('en', en)),
  },
  etichette: ETICHETTE,
  campi,
  titolo: 'Rise Against Hunger Italia',
});

export const FIXTURE_CANCELLAZIONE = {
  C14: {
    neg: [
      caso({ pagine: { it: null, en: leggiSezioni(html('en')) } }),
      caso({ campi: [] }),
      caso({ campi: [...CAMPI, 'tax_code'] }),
      caso({ it: { testa: 'App RAH Italia, «Rise Against Hunger Italia».' } }),
      caso({ it: { passi: ETICHETTE.it.slice(0, 4).join(', ') } }),
      caso({ en: { senza: 'Write to us and we will ask you to confirm.' } }),
      caso({
        it: { cancellati: TESTI.it.cancellati.replace('telefono, ', '') },
      }),
      caso({ it: { cancellati: TESTI.it.cancellati.replace(' nome,', '') } }),
      caso({ en: { conservati: 'Technical logs are deleted automatically.' } }),
      caso({ en: { tempi: 'We answer quickly.' } }),
      caso({
        pagine: {
          it: leggiSezioni(html('it').replace('id="tempi"', 'id="altro"')),
          en: leggiSezioni(html('en')),
        },
      }),
    ],
    pos: [caso()],
  },
};
