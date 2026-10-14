// C17: risposte campo per campo ai moduli di Play Console (contratto del goal android-play).
// Ogni modulo è una sezione `## ` fissa con i suoi elementi obbligatori; ogni campo che l'app
// manda al profilo compare in Sicurezza dei dati; ogni punto aperto ha un responsabile fra
// quelli di «Chi fa cosa» del runbook (C20 controlla che il runbook li abbia tutti).
import { esiste, leggi, percorso } from './comune.mjs';
import { leggiScheda } from './documenti.mjs';
import { campiSignUp } from './documenti-cancellazione.mjs';
import {
  ATTORI_C20,
  controllaSezioni,
  sezioni,
} from './documenti-rilascio.mjs';

const DIR = ['docs', 'store', 'google-play'];

/** [titolo che la sezione deve contenere, ...elementi (stringa o regex) richiesti nel suo testo] */
export const SEZIONI_C17 = [
  [
    'Creazione app',
    'Nome app',
    'Lingua predefinita',
    'App o gioco',
    /senza costi/i,
  ],
  ['Impostazioni della scheda', 'Categoria', 'Email', 'Sito web'],
  ['URL delle norme sulla privacy', /https:\/\//],
  ["Accesso all'app", /istruzioni/i, /credenziali/i],
  ['Annunci', /non contiene annunci/i],
  ['ID pubblicità', 'AD_ID', 'blockedPermissions'],
  ['Classificazione dei contenuti', 'IARC'],
  ['Pubblico di destinazione', /fasce d.età/i, '14'],
  ['App di notizie', /non è un'app di notizie/i],
  [
    'Sicurezza dei dati',
    '10787469',
    /eliminazione dell'account/i,
    'Donorbox',
    "Let's Donation",
  ],
  ['Funzionalità finanziarie', /non offre funzionalità finanziarie/i],
  ['App sanitarie', /non ha funzionalità sanitarie/i],
  ['App governative', /non è un'app governativa/i],
  ['Paesi', /Unione europea/i],
  ['Norme sui pagamenti', '9858738', '3.1', '3.2', /gift card/i],
];
const NOMI = ATTORI_C20.map(([nome]) => nome);
const INCERTEZZA =
  /da verificare|da decidere|da confermare|da validare|decisione aperta|decisioni aperte|a condizione|in attesa di/i;

/** Voci del markdown: titolo, riga di tabella, punto d'elenco o paragrafo (righe di seguito unite). */
export const voci = md => {
  const out = [];
  let aperta = false;
  for (const riga of md.split('\n')) {
    if (!riga.trim()) {
      aperta = false;
      continue;
    }
    if (aperta && !/^\s*(?:[-*|#]|\d+\.)/.test(riga))
      out[out.length - 1] += ` ${riga.trim()}`;
    else out.push(riga.trim());
    // Un titolo non continua sulla riga dopo.
    aperta = !riga.startsWith('#');
  }
  return out;
};

/** Responsabili citati come «Chi fa cosa» → Nome[, Nome] (le aggiunte minuscole sono note). */
const riferimenti = voce =>
  [...voce.matchAll(/«Chi fa cosa»\s*→\s*([^)\n|.;]+)/g)].flatMap(m =>
    m[1]
      .split(',')
      .map(s => s.trim())
      .filter(s => /^\p{Lu}/u.test(s))
  );

/** Valore della riga `| campo | valore |` di una tabella. */
const cella = (testo, campo) =>
  testo.match(new RegExp(`^\\|\\s*${campo}\\s*\\|([^|]*)\\|`, 'm'))?.[1].trim();

export const criteri = {
  C17: {
    leggi: () => {
      const risposte = percorso(...DIR, 'play-console-risposte.md');
      const scheda = percorso(...DIR, 'scheda.md');
      return {
        md: esiste(risposte) ? leggi(risposte) : null,
        campi: campiSignUp(
          leggi(percorso('src/features/auth/hooks/useSignUpForm.ts'))
        ),
        titolo: esiste(scheda)
          ? leggiScheda(leggi(scheda))['it-IT']?.titolo
          : null,
        privacy:
          leggi(percorso('src/shared/constants/urls.ts')).match(
            /privacyPolicy:\s*'([^']+)'/
          )?.[1] ?? null,
      };
    },
    verifica({ md, campi, titolo, privacy }) {
      if (!md) return 'manca docs/store/google-play/play-console-risposte.md';
      if (!campi.length)
        return 'nessun campo trovato in useSignUpForm.ts (lettura rotta)';
      if (!privacy)
        return 'privacyPolicy non trovato in urls.ts (lettura rotta)';
      const trovate = sezioni(md, 2);
      const motivo = controllaSezioni(
        SEZIONI_C17,
        trovate,
        'play-console-risposte.md'
      );
      if (motivo) return motivo;
      const sez = t => trovate.find(x => x.titolo.includes(t)).testo;

      const nome = cella(sez('Creazione app'), 'Nome app');
      if (!titolo || nome !== titolo)
        return `Nome app «${nome}» diverso dal titolo della scheda «${titolo}»`;
      const impostazioni = sez('Impostazioni della scheda');
      if (!cella(impostazioni, 'Categoria')) return 'Categoria senza risposta';
      if (!/@/.test(cella(impostazioni, 'Email') ?? ''))
        return 'Email della scheda senza indirizzo';
      if (!/https?:\/\//.test(cella(impostazioni, 'Sito web') ?? ''))
        return 'Sito web della scheda senza indirizzo';
      if (!sez('URL delle norme sulla privacy').includes(privacy))
        return `URL dell'informativa diverso da quello che l'app apre (${privacy})`;

      const sicurezza = sez('Sicurezza dei dati');
      const nonMappato = ['email', ...campi].find(
        c => !sicurezza.includes(`\`${c}\``)
      );
      if (nonMappato)
        return `Sicurezza dei dati: campo non mappato ${nonMappato}`;
      const condivisione = sezioni(sicurezza, 3).find(x =>
        /condivisione/i.test(x.titolo)
      );
      if (
        !condivisione ||
        !['Donorbox', "Let's Donation", '10787469'].every(s =>
          condivisione.testo.includes(s)
        )
      )
        return "Sicurezza dei dati: manca la condivisione verso Donorbox e Let's Donation motivata con answer/10787469";

      const gift = voci(sez('Norme sui pagamenti')).find(v =>
        /gift card/i.test(v)
      );
      if (!riferimenti(gift).includes('Riccardo'))
        return 'gift card senza la decisione di Riccardo in «Chi fa cosa»';
      for (const v of voci(md)) {
        const attori = riferimenti(v);
        const ignoto = attori.find(a => !NOMI.includes(a));
        if (ignoto)
          return `«Chi fa cosa» → ${ignoto}: responsabile che il runbook non prevede`;
        if (INCERTEZZA.test(v) && !attori.length)
          return `punto aperto senza responsabile in «Chi fa cosa»: «${v.slice(0, 80)}»`;
      }
      return null;
    },
  },
};
