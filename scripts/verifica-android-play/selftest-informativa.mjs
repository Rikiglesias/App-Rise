// Fixture del selftest (C22) per C13, l'informativa privacy IT/EN.
import { leggiInformativa } from './documenti-informativa.mjs';

const CORPO = {
  it: [
    '<h2>2. Dati</h2><p>Nome, nickname, data di nascita (età minima 14 anni).',
    "Un identificativo casuale dell'installazione va a Expo.</p>",
    '<h2>4. Destinatari</h2><p>Supabase, Expo, Resend, Donorbox.</p>',
    '<h2>5. Trasferimenti</h2><p>Verso Expo e Donorbox, negli Stati Uniti.</p>',
    "<h2>6. Conservazione</h2><p>Registro dei consensi: cancellato insieme all'account.</p>",
  ].join('\n'),
  en: [
    '<h2>2. Data</h2><p>Name, nickname, date of birth (minimum age of 14 years).',
    'A random installation identifier goes to Expo.</p>',
    '<h2>4. Recipients</h2><p>Supabase, Expo, Resend, Donorbox.</p>',
    '<h2>5. Transfers</h2><p>To Expo and Donorbox, in the United States.</p>',
    '<h2>6. Retention</h2><p>Consent record: deleted together with the account.</p>',
  ].join('\n'),
};
const caso = ({ it = s => s, en = s => s } = {}) => ({
  it: leggiInformativa(it(CORPO.it)),
  en: leggiInformativa(en(CORPO.en)),
});
const aggiungi = frase => s => `${s}\n<p>${frase}</p>`;

export const FIXTURE_INFORMATIVA = {
  C13: {
    neg: [
      { it: null, en: caso().en },
      caso({ it: aggiungi('Accesso con Google o Apple.') }),
      caso({ en: aggiungi('You can use Hide My Email.') }),
      caso({ it: aggiungi('Area riservata ai maggiorenni.') }),
      caso({ en: aggiungi('Deletion after 30 days.') }),
      caso({ it: aggiungi('Le segnalazioni passano da Sentry.') }),
      caso({ en: aggiungi('Crash reports linked to your account.') }),
      caso({ it: s => s.replace('nickname, ', '') }),
      caso({ en: s => s.replace('of 14 years', 'required') }),
      caso({ it: s => s.replace('Un identificativo casuale', 'Un numero') }),
      caso({ en: s => s.replace('deleted together', 'kept') }),
      caso({ it: s => s.replace('Verso Expo e Donorbox', 'Verso Donorbox') }),
      caso({ en: s => s.replace('Resend, ', '') }),
    ],
    pos: [caso()],
  },
};
