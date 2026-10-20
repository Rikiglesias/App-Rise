// C22 per i criteri di F8 (login): stesse mutazioni dei criteri a titoli di F7, più le fixture degli statici.
// Ogni fixture negativa è il positivo con UNA mutazione.
import { DEFINIZIONI_LOGIN } from './login.mjs';
import { TEST_C35 } from './funzioni-edge.mjs';
import { negativiComuni, verde } from './selftest-codice.mjs';

const v = (id, statico = null) => verde(id, statico, DEFINIZIONI_LOGIN);
const n = (id, statico = null) =>
  negativiComuni(id, statico, DEFINIZIONI_LOGIN);
const soloTitoli = id => ({ neg: n(id), pos: [v(id)] });

const C34_OK = {
  pkce: true,
  scambio: ['src/shared/auth/useAuthDeepLink.ts'],
  setSession: [],
  percorsi: ['reset-password', 'auth/callback'],
  runbook:
    'Modelli mail: {{ .ConfirmationURL }} · Additional Redirect URLs: rahitalia://reset-password, rahitalia://auth/callback',
};

// R17: la chiave legacy è vietata ovunque in supabase/functions/, verify_jwt = false su entrambe, test per funzione.
const CONFIG_OK =
  '# chiavi di firma ES256: il controllo vero è auth.getUser nel codice\n[functions.delete-account]\nverify_jwt = false\n\n[functions.purge-deletions]\nverify_jwt = false\n';
const casiOk = nomi => nomi.map(nome => ({ nome, verde: true }));
const funzioneOk = f => ({
  file: [`supabase/functions/${f}/index.ts`],
  nuova: true,
  deno: { exit: 0, casi: casiOk(TEST_C35[f]), coda: '' },
});
const c35 = (mutPurge = {}, radice = {}) => ({
  statico: {
    legacy: [],
    config: CONFIG_OK,
    funzioni: {
      'delete-account': funzioneOk('delete-account'),
      'purge-deletions': { ...funzioneOk('purge-deletions'), ...mutPurge },
    },
    ...radice,
  },
});
const denoCon = casi => ({
  deno: { ...funzioneOk('purge-deletions').deno, casi },
});

const INTESTAZIONE =
  '| Tipo (Play Console) | Campi | Raccolto | Condiviso | Facoltativo | Finalità |\n| --- | --- | --- | --- | --- | --- |';
const RIGA_DIAGNOSTICA =
  "| Informazioni e prestazioni dell'app → Diagnostica | versione, sistema, codici d'errore | Sì | No | Sì (solo se la persona invia la mail) | Analisi |";
const tabella = riga => `## Sicurezza dei dati\n${INTESTAZIONE}\n${riga}\n`;
const C55_OK = {
  risposte: tabella(RIGA_DIAGNOSTICA),
  informative: {
    'privacy-policy.html': '<section id="segnalazione-problemi">',
    'privacy-policy-en.html': '<section id="segnalazione-problemi">',
  },
  voceIt: true,
  voceEn: true,
  helper: [{ nome: 'src/shared/auth/registraErroreAccount.ts', chiama: true }],
  chiamanti: [],
  report: [
    { nome: 'src/shared/support/buildProblemReport.ts', import: ['./tipi'] },
  ],
};
const conRiga = riga => ({ ...C55_OK, risposte: tabella(riga) });

const DOC = 'docs/store/google-play';
// C30 (R21-R23): dati come li produce staticoC30.leggi(); ogni negativa cambia UNA cosa.
const PLAY_OK =
  "\n- Istruzioni: toccare l'icona della persona in alto a destra («Area Donatori», «Donor Area» in inglese).\n";
const PASSI_IT =
  "<li>Tocca l'icona della persona in alto a destra: <strong>Area Donatori</strong> o <strong>Il mio profilo</strong>.</li>";
const PASSI_EN =
  '<li>Tap the person icon at the top right: <strong>Donor Area</strong> or <strong>My profile</strong>.</li>';
const RUNBOOK_OK =
  'sostituire le pagine web/elimina-account.html e web/delete-account.html già consegnate';
const RADICI_OK = [
  'src/features/home/screens/HomeScreen.tsx',
  'src/features/impact/screens/ImpactTabScreen.tsx',
  'src/features/actions/screens/ContributeTabScreen.tsx',
].map(nome => ({ nome, edges: ["'bottom'"], insetsTop: false }));
const locale = (ospite, collegato) => ({
  ospite,
  collegato,
  home: 'Home',
  profilo: null,
});
const C30_OK = {
  importaIntestazione: ['src/navigation/BottomTabNavigator.tsx'],
  testID: ['src/navigation/TabHeader.tsx'],
  schedaProfilo: [],
  schedaAzioni: ['src/navigation/BottomTabNavigator.tsx'],
  radici: RADICI_OK,
  locali: {
    it: locale('Area Donatori', 'Il mio profilo'),
    en: locale('Donor Area', 'My profile'),
  },
  file: [
    { nome: `${DOC}/play-console-risposte.md`, testo: PLAY_OK },
    { nome: `${DOC}/web/elimina-account.html`, testo: PASSI_IT },
    { nome: `${DOC}/web/delete-account.html`, testo: PASSI_EN },
    { nome: `${DOC}/rilascio.md`, testo: RUNBOOK_OK },
  ],
  accessoPlay: PLAY_OK,
  passi: { it: PASSI_IT, en: PASSI_EN },
  runbook: RUNBOOK_OK,
};
const c30 = mut => ({ ...C30_OK, ...mut });
const radice = (i, mut) => ({
  radici: RADICI_OK.map((r, j) => (j === i ? { ...r, ...mut } : r)),
});
const conDoc = testo => ({
  file: [...C30_OK.file, { nome: `${DOC}/scheda.md`, testo }],
});
const localeIt = mut => ({
  locali: { ...C30_OK.locali, it: { ...C30_OK.locali.it, ...mut } },
});
const senza = (testo, pezzo) => testo.replace(pezzo, '');

export const FIXTURE_LOGIN = {
  C30: {
    neg: [
      ...n('C30', C30_OK),
      // codice: lettore rotto, scheda Profilo, intestazione montata altrove, testID altrove
      v('C30', c30({ schedaAzioni: [] })),
      v('C30', c30({ schedaProfilo: ['src/navigation/types.ts'] })),
      v('C30', c30({ importaIntestazione: [] })),
      v(
        'C30',
        c30({
          importaIntestazione: [
            'src/features/home/screens/HomeScreen.tsx',
            'src/navigation/BottomTabNavigator.tsx',
          ],
        })
      ),
      v(
        'C30',
        c30({
          testID: [
            'src/features/home/screens/HomeScreen.tsx',
            'src/navigation/TabHeader.tsx',
          ],
        })
      ),
      // inset superiore: edges illeggibili, 'top' negli edges, insets.top, radice mancante
      v('C30', c30(radice(1, { edges: [] }))),
      v('C30', c30(radice(0, { edges: ["'top', 'bottom'"] }))),
      v('C30', c30(radice(2, { insetsTop: true }))),
      v('C30', c30({ radici: RADICI_OK.slice(1) })),
      // traduzioni: lettore rotto, navigation.profile rimasta, etichetta mancante
      v('C30', c30(localeIt({ home: null }))),
      v('C30', c30(localeIt({ profilo: 'Profilo' }))),
      v('C30', c30(localeIt({ ospite: null }))),
      // documenti: nessuno, frasi della vecchia scheda (anche dentro tag e virgolette)
      v('C30', c30({ file: [] })),
      v('C30', c30(conDoc('la scheda <strong>Profilo</strong>'))),
      v('C30', c30(conDoc('tocca la quarta scheda'))),
      v('C30', c30(conDoc('apri la 4ª scheda'))),
      v('C30', c30(conDoc('the **fourth tab**'))),
      v('C30', c30(conDoc('nella barra\n  in basso'))),
      v('C30', c30(conDoc('in the bottom bar'))),
      v('C30', c30(conDoc('the <strong>Profile</strong> tab'))),
      // sezione dei revisori: assente o senza etichette e posizione
      v('C30', c30({ accessoPlay: null })),
      v('C30', c30({ accessoPlay: senza(PLAY_OK, '«Area Donatori»') })),
      v('C30', c30({ accessoPlay: senza(PLAY_OK, '«Donor Area»') })),
      v('C30', c30({ accessoPlay: senza(PLAY_OK, 'in alto a destra') })),
      // passi delle pagine di cancellazione
      v('C30', c30({ passi: { ...C30_OK.passi, it: null } })),
      v(
        'C30',
        c30({
          passi: {
            ...C30_OK.passi,
            it: senza(PASSI_IT, '<strong>Area Donatori</strong>'),
          },
        })
      ),
      v(
        'C30',
        c30({
          passi: {
            ...C30_OK.passi,
            it: senza(PASSI_IT, '<strong>Il mio profilo</strong>'),
          },
        })
      ),
      v(
        'C30',
        c30({
          passi: { ...C30_OK.passi, it: senza(PASSI_IT, 'in alto a destra') },
        })
      ),
      v(
        'C30',
        c30({ passi: { ...C30_OK.passi, it: senza(PASSI_IT, 'icona') } })
      ),
      v(
        'C30',
        c30({ passi: { ...C30_OK.passi, en: senza(PASSI_EN, 'top right') } })
      ),
      // runbook (C20)
      v('C30', c30({ runbook: null })),
      v('C30', c30({ runbook: 'mandare le pagine web/elimina-account.html' })),
    ],
    pos: [
      v('C30', C30_OK),
      // «in alto a destra» e «barra» altrove non sono vecchie istruzioni
      v('C30', c30(conDoc('la barra delle schede ha Impatto, Home e Azioni'))),
    ],
  },
  C26: soloTitoli('C26'),
  C31: soloTitoli('C31'),
  C32: soloTitoli('C32'),
  C33: soloTitoli('C33'),
  C36: soloTitoli('C36'),
  C53: soloTitoli('C53'),
  C34: {
    neg: [
      ...n('C34', C34_OK),
      v('C34', { ...C34_OK, pkce: false }),
      v('C34', { ...C34_OK, scambio: [] }),
      v('C34', { ...C34_OK, setSession: ['src/shared/auth/AuthContext.tsx'] }),
      v('C34', { ...C34_OK, percorsi: [] }),
      v('C34', { ...C34_OK, runbook: null }),
      v('C34', {
        ...C34_OK,
        runbook: C34_OK.runbook.replace('{{ .ConfirmationURL }}', ''),
      }),
      v('C34', {
        ...C34_OK,
        runbook: C34_OK.runbook.replace('Additional Redirect URLs', 'Redirect'),
      }),
      v('C34', {
        ...C34_OK,
        runbook: C34_OK.runbook.replace('rahitalia://auth/callback', ''),
      }),
    ],
    pos: [v('C34', C34_OK)],
  },
  C35: {
    neg: [
      { statico: null },
      c35({ file: [] }),
      c35({ nuova: false }),
      c35(
        {},
        { legacy: [{ nome: 'supabase/functions/x/index_test.ts', riga: 3 }] }
      ),
      c35({}, { config: null }),
      c35(
        {},
        {
          config: CONFIG_OK.replace(
            'verify_jwt = false\n\n',
            'verify_jwt = true\n\n'
          ),
        }
      ),
      c35(
        {},
        {
          config: CONFIG_OK.replace(
            '[functions.purge-deletions]\nverify_jwt = false\n',
            ''
          ),
        }
      ),
      c35(
        {},
        { config: `# la piattaforma DEVE validare il JWT\n${CONFIG_OK}` }
      ),
      c35({ deno: { errore: 'deno: non trovato' } }),
      c35({ deno: { exit: 1, casi: null, coda: 'boom' } }),
      c35(denoCon([])),
      c35(denoCon(casiOk(TEST_C35['purge-deletions'].slice(1)))),
      c35(
        denoCon(
          TEST_C35['purge-deletions'].map((nome, i) => ({
            nome,
            verde: i !== 0,
          }))
        )
      ),
      c35(
        denoCon(
          casiOk([
            'chiave da SUPABASE_SECRET_KEYS',
            'chiave assente -> 500',
            'segreto cron assente → 403',
          ])
        )
      ),
      // il test di delete-account non basta a purge-deletions: nomi per funzione
      c35(denoCon(casiOk(TEST_C35['delete-account']))),
      c35({ deno: { ...funzioneOk('purge-deletions').deno, exit: 1 } }),
    ],
    pos: [c35()],
  },
  C55: {
    neg: [
      ...n('C55', C55_OK),
      v('C55', { ...C55_OK, risposte: null }),
      v('C55', conRiga('')),
      v('C55', conRiga(RIGA_DIAGNOSTICA.replace('| Sì | No |', '| No | No |'))),
      v('C55', conRiga(RIGA_DIAGNOSTICA.replace('| Sì | No |', '| Sì | Sì |'))),
      v('C55', conRiga(RIGA_DIAGNOSTICA.replace('| Sì (solo', '| No (solo'))),
      v(
        'C55',
        conRiga(RIGA_DIAGNOSTICA.replace('Analisi', "Funzionalità dell'app"))
      ),
      v('C55', {
        ...C55_OK,
        risposte: `## Sicurezza dei dati\n${RIGA_DIAGNOSTICA}\n`,
      }), // senza intestazione
      v('C55', {
        ...C55_OK,
        risposte: tabella(RIGA_DIAGNOSTICA).replace(
          '| Raccolto |',
          '| Raccolta |'
        ),
      }), // intestazione illeggibile
      v('C55', {
        ...C55_OK,
        risposte: `${C55_OK.risposte}Non raccolti: informazioni e prestazioni dell'app (nessun servizio di segnalazione errori)\n`,
      }),
      v('C55', {
        ...C55_OK,
        informative: {
          ...C55_OK.informative,
          'privacy-policy-en.html': '<section>',
        },
      }),
      v('C55', {
        ...C55_OK,
        informative: { ...C55_OK.informative, 'privacy-policy.html': null },
      }),
      v('C55', { ...C55_OK, voceIt: false }),
      v('C55', { ...C55_OK, voceEn: false }),
      v('C55', { ...C55_OK, helper: [] }),
      v('C55', { ...C55_OK, helper: [{ ...C55_OK.helper[0], chiama: false }] }),
      v('C55', {
        ...C55_OK,
        chiamanti: ['src/features/auth/screens/LoginScreen.tsx'],
      }),
      v('C55', { ...C55_OK, report: [] }),
      v('C55', {
        ...C55_OK,
        report: [{ ...C55_OK.report[0], import: ['expo-updates'] }],
      }),
      v('C55', {
        ...C55_OK,
        report: [{ ...C55_OK.report[0], import: ['react-native'] }],
      }),
      v('C55', {
        ...C55_OK,
        report: [{ ...C55_OK.report[0], import: ['@/shared/utils/logger'] }],
      }),
    ],
    pos: [v('C55', C55_OK)],
  },
};
