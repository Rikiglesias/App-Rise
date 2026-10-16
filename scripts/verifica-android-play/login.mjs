// C26, C30-C36, C53, C55 (fase F8 «login» del contratto android-play, R8-R14): titoli Jest + controlli statici.
import { elencaFile, esiste, leggi, percorso, rel } from './comune.mjs';
import { testoTraduzione } from './app.mjs';
import { staticoC35 } from './funzioni-edge.mjs';
import { RAMI_C55, staticoC55 } from './segnala-problema.mjs';
import { criterioConTitoli } from './titoli-jest.mjs';

const RUNBOOK = 'docs/store/google-play/rilascio.md';

const sorgentiApp = () =>
  elencaFile(
    percorso('src'),
    p =>
      /\.(ts|tsx)$/.test(p) &&
      !/[\\/](__tests__|__mocks__)[\\/]|\.(test|spec)\.tsx?$/.test(p)
  ).map(p => ({ nome: rel(p), testo: leggi(p) }));

const leggiSeEsiste = p => (esiste(percorso(p)) ? leggi(percorso(p)) : null);

// --- C30 ---------------------------------------------------------------------------------------------
// Le istruzioni per Google e per la sede USA devono portare alla 4ª scheda con l'etichetta vera di src/locales.
const DOC_PLAY = 'docs/store/google-play';
export const FRASI_VIETATE_C30 = [
  'icona del profilo',
  'profile icon',
  'in alto a destra',
  'top right',
];
const ISTRUZIONI_C30 = [
  ['play-console-risposte.md', 'it'],
  ['web/elimina-account.html', 'it'],
  ['web/delete-account.html', 'en'],
];

export const staticoC30 = {
  leggi() {
    const file = elencaFile(percorso(DOC_PLAY), p =>
      /\.(md|html)$/.test(p)
    ).map(p => ({ nome: rel(p), testo: leggi(p) }));
    return {
      file,
      etichetta: {
        it: testoTraduzione(
          leggi(percorso('src', 'locales', 'it.ts')),
          'navigation.profile'
        ),
        en: testoTraduzione(
          leggi(percorso('src', 'locales', 'en.ts')),
          'navigation.profile'
        ),
      },
    };
  },
  verifica({ file, etichetta }) {
    if (!etichetta?.it || !etichetta?.en)
      return 'navigation.profile assente in it.ts o en.ts';
    if (!file?.length)
      return `nessun documento in ${DOC_PLAY} (lettore rotto?)`;
    const vietate = file.flatMap(f =>
      FRASI_VIETATE_C30.filter(fr => f.testo.toLowerCase().includes(fr)).map(
        fr => `${f.nome}: «${fr}»`
      )
    );
    if (vietate.length)
      return `istruzioni con il vecchio ingresso: ${vietate.join(', ')}`;
    const testo = n =>
      file.find(f => f.nome === `${DOC_PLAY}/${n}`)?.testo ?? null;
    for (const [n, lingua] of ISTRUZIONI_C30) {
      const t = testo(n);
      const et = etichetta[lingua];
      if (t == null) return `${DOC_PLAY}/${n} assente`;
      if (!t.includes(`<strong>${et}</strong>`) && !t.includes(`«${et}»`))
        return `${n} non porta alla scheda «${et}»`;
    }
    const runbook = testo('rilascio.md');
    if (runbook == null) return `${DOC_PLAY}/rilascio.md assente`;
    if (
      !/sostitu/i.test(runbook) ||
      !runbook.includes('web/elimina-account.html') ||
      !runbook.includes('web/delete-account.html')
    )
      return "rilascio.md (C20) senza l'istruzione di sostituire le pagine web/ già consegnate";
    return '';
  },
};

// --- C34 ---------------------------------------------------------------------------------------------
// I redirect si leggono dalle costanti `*_PATH` di authRedirect.ts: un percorso nuovo entra da solo nel controllo.
export const staticoC34 = {
  leggi() {
    const client = leggi(
      percorso('src', 'shared', 'auth', 'supabaseClient.ts')
    );
    const redirect = leggi(
      percorso('src', 'shared', 'auth', 'authRedirect.ts')
    );
    const file = sorgentiApp();
    return {
      pkce: /flowType\s*:\s*['"]pkce['"]/.test(client),
      scambio: file
        .filter(f => /\.exchangeCodeForSession\(/.test(f.testo))
        .map(f => f.nome),
      setSession: file
        .filter(f => /auth\.setSession\(/.test(f.testo))
        .map(f => f.nome),
      percorsi: [
        ...redirect.matchAll(/export const \w+_PATH\s*=\s*['"]([^'"]+)['"]/g),
      ].map(m => m[1]),
      runbook: leggiSeEsiste(RUNBOOK),
    };
  },
  verifica({ pkce, scambio, setSession, percorsi, runbook }) {
    if (!pkce) return "supabaseClient.ts senza flowType: 'pkce'";
    if (!scambio?.length)
      return 'nessuna chiamata exchangeCodeForSession( in src/';
    if (setSession?.length)
      return `auth.setSession( ancora in: ${setSession.join(', ')}`;
    if (!percorsi?.length)
      return 'nessuna costante *_PATH in authRedirect.ts: lettore rotto?';
    if (runbook == null) return `${RUNBOOK} assente`;
    if (!runbook.includes('{{ .ConfirmationURL }}'))
      return 'runbook senza il controllo dei modelli mail ({{ .ConfirmationURL }})';
    if (!/Additional Redirect URLs/.test(runbook))
      return 'runbook senza «Additional Redirect URLs»';
    const mancanti = percorsi.filter(
      p => !runbook.includes(`rahitalia://${p}`)
    );
    if (mancanti.length)
      return `runbook senza i redirect ${mancanti.map(p => `rahitalia://${p}`).join(', ')}`;
    return '';
  },
};

export const DEFINIZIONI_LOGIN = {
  C30: {
    titoli: [
      'scheda Profilo: ospite vede Accesso',
      'scheda Profilo: collegato vede Profilo',
      'scheda Profilo: Home senza icona profilo',
      "scheda Profilo: ri-consenso all'avvio",
      "scheda Profilo: dal ri-consenso si può uscire dall'account",
    ],
    statico: staticoC30,
  },
  C26: {
    titoli: [
      'link di accesso fallito: recupero con errore chiede un nuovo link',
      'link di accesso fallito: conferma con scambio fallito dice email confermata, accedi',
      'link di accesso fallito: verificatore assente dopo un secondo invio',
      'link di accesso: avvio a freddo apre Reimposta password quando la navigazione è pronta',
      'link di accesso: conferma riuscita mostra un messaggio',
    ],
  },
  C31: {
    titoli: [
      'indietro visibile: Registrazione',
      'indietro visibile: Password dimenticata',
      'indietro visibile: Reimposta password dallo stack',
      'indietro visibile: Modifica profilo',
      'indietro visibile: assente alla radice della scheda Profilo',
      'indietro visibile: assente nel cancello del profilo',
    ],
  },
  C32: {
    titoli: [
      'rinvio conferma: dopo la registrazione',
      'rinvio conferma: su email non confermata',
      'rinvio conferma: attesa di 60 s',
      'rinvio conferma: limite del server tradotto',
    ],
  },
  C33: {
    titoli: [
      'Accesso',
      'Registrazione',
      'Password dimenticata',
      'Reimposta password',
      'Profilo',
      'Modifica profilo',
      'Elimina account',
      'Ri-consenso',
    ].map(s => `account offline: ${s}`),
  },
  C34: {
    titoli: [
      'PKCE: il link con code apre la sessione',
      'PKCE: il link con token nel fragment non apre sessioni',
    ],
    statico: staticoC34,
  },
  C36: {
    titoli: [
      'moduli account: larghezza massima 560 dp su tablet',
      'moduli account: data nel formato della lingua',
      'moduli account: suggerimenti per i gestori di password',
    ],
  },
  C53: {
    titoli: [
      "cambio email: redirect all'app",
      'cambio email: conferma mostra email aggiornata',
    ],
  },
  C55: {
    titoli: [
      'segnala un problema: corpo con versione e codici',
      'segnala un problema: nessun dato personale',
      ...RAMI_C55.map(r => `segnala un problema: errore registrato da ${r}`),
      'segnala un problema: timeout di rete nel buffer',
      'segnala un problema: mailto codificato',
      "segnala un problema: rifiuto mostra l'indirizzo e Condividi",
      "segnala un problema: dall'ospite",
      'segnala un problema: da collegato',
      'segnala un problema: dal cancello del profilo',
      "segnala un problema: dalla schermata d'errore",
      'segnala un problema: area toccabile ≥ 48 dp',
    ],
    statico: staticoC55,
  },
};

// C35 non ha titoli Jest: solo statico + deno test.
export const criteri = {
  ...Object.fromEntries(
    Object.entries(DEFINIZIONI_LOGIN).map(([id, d]) => [
      id,
      criterioConTitoli(id, d),
    ])
  ),
  C35: {
    leggi: () => ({ statico: staticoC35.leggi() }),
    verifica: ({ statico }) => staticoC35.verifica(statico),
  },
};
