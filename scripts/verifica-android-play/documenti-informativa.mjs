// C13: informativa privacy IT/EN senza le falsità misurate in F0 (contratto del goal
// android-play). Vietato ciò che l'app non fa più o non ha mai fatto; obbligatorio ciò
// che fa davvero. I fornitori citati devono essere gli stessi nelle due lingue.
import { esiste, leggi, percorso } from './comune.mjs';

export const FILE = { it: 'privacy-policy.html', en: 'privacy-policy-en.html' };

export const VIETATE = [
  [
    /Google o Apple|Google or Apple|accesso social|social (?:sign-?in|login)/i,
    'accesso Google/Apple',
  ],
  [/Nascondi la mia email|Hide My Email/i, '«Nascondi la mia email»'],
  [/maggiorenn|adults only|over 18|18 anni|18 years/i, 'età minima 18'],
  [/30 giorni|30 days|30-day/i, 'cancellazione a 30 giorni'],
  [/Sentry|Functional Software/i, 'Sentry'],
  [
    /(?:segnalazioni di errore|error reports|crash reports)[^.]*account/i,
    'diagnostica associata all’account',
  ],
];
export const OBBLIGATORIE = [
  [/nickname/i, 'nickname'],
  [/14 anni|14 years/i, 'età minima 14'],
  [
    /identificativo (?:casuale )?(?:dell'|generato)|installation identifier|random identifier generated/i,
    'identificativo di installazione Expo',
  ],
  [
    /registro dei consensi[^.]*cancellat|consent record[^.]*deleted/i,
    'registro consensi cancellato con l’account',
  ],
];
const FORNITORI = ['Supabase', 'Expo', 'Resend', 'Donorbox', "Let's Donation"];

const testo = html =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');

/** Testo intero e sezioni per numero: «5. Trasferimenti…» → sezioni['5']. */
export const leggiInformativa = html => {
  const sezioni = {};
  for (const parte of html.split(/<h2>/).slice(1)) {
    const numero = parte.match(/^\s*(\d+)\./)?.[1];
    if (numero) sezioni[numero] = testo(parte);
  }
  return { tutto: testo(html), sezioni };
};

export const criteri = {
  C13: {
    leggi: () =>
      Object.fromEntries(
        Object.entries(FILE).map(([lingua, f]) => {
          const p = percorso(f);
          return [lingua, esiste(p) ? leggiInformativa(leggi(p)) : null];
        })
      ),
    verifica(informative) {
      const citati = {};
      for (const [lingua, file] of Object.entries(FILE)) {
        const inf = informative[lingua];
        if (!inf) return `manca ${file}`;
        const vietata = VIETATE.find(([re]) => re.test(inf.tutto));
        if (vietata) return `${file}: contiene ancora ${vietata[1]}`;
        const assente = OBBLIGATORIE.find(([re]) => !re.test(inf.tutto));
        if (assente) return `${file}: manca ${assente[1]}`;
        if (!/Expo/.test(inf.sezioni['5'] ?? ''))
          return `${file}: Expo non è fra i trasferimenti extra-UE (sezione 5)`;
        citati[lingua] = FORNITORI.filter(f => inf.tutto.includes(f)).join(
          ', '
        );
      }
      if (citati.it !== citati.en)
        return `fornitori diversi fra IT (${citati.it}) ed EN (${citati.en})`;
      return null;
    },
  },
};
