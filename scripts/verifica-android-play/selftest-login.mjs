// C22 per i criteri di F8 (login): stesse mutazioni dei criteri a titoli di F7, più le fixture degli statici.
// Ogni fixture negativa è il positivo con UNA mutazione.
import { DEFINIZIONI_LOGIN } from './login.mjs';
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

const funzioneOk = () => ({
  file: ['supabase/functions/x/index.ts'],
  nuova: true,
  legacy: [
    {
      nome: 'supabase/functions/x/index.ts',
      riga: 12,
      contesto:
        '// ripiego documentato\nDeno.env.get("SUPABASE_SERVICE_ROLE_KEY")',
    },
  ],
  deno: {
    exit: 0,
    casi: [
      { nome: 'chiave da SUPABASE_SECRET_KEYS', verde: true },
      { nome: 'token assente → 401', verde: true },
    ],
    coda: '',
  },
});
const c35 = (mut = {}) => ({
  statico: {
    'delete-account': funzioneOk(),
    'purge-deletions': { ...funzioneOk(), ...mut },
  },
});
const denoCon = casi => ({ deno: { ...funzioneOk().deno, casi } });

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
const docC30 = (mut = {}) =>
  Object.entries({
    'play-console-risposte.md':
      'toccare la quarta scheda «Profilo» nella barra in basso',
    'web/elimina-account.html':
      'tocca la quarta scheda <strong>Profilo</strong>',
    'web/delete-account.html': 'tap the fourth tab, <strong>Profile</strong>',
    'rilascio.md':
      'sostituire le pagine web/elimina-account.html e web/delete-account.html già consegnate',
    ...mut,
  })
    .filter(([, testo]) => testo != null)
    .map(([n, testo]) => ({ nome: `${DOC}/${n}`, testo }));
const C30_OK = { file: docC30(), etichetta: { it: 'Profilo', en: 'Profile' } };
const c30 = mut => ({ ...C30_OK, file: docC30(mut) });

export const FIXTURE_LOGIN = {
  C30: {
    neg: [
      ...n('C30', C30_OK),
      v('C30', { ...C30_OK, etichetta: { it: 'Profilo', en: null } }),
      v('C30', { ...C30_OK, file: [] }),
      v('C30', c30({ 'scheda.md': "Tocca l'icona del profilo" })),
      v(
        'C30',
        c30({
          'web/delete-account.html': 'tap the Profile icon at the top right',
        })
      ),
      v('C30', c30({ 'play-console-risposte.md': 'icona in alto a destra' })),
      v('C30', c30({ 'web/elimina-account.html': null })),
      v(
        'C30',
        c30({
          'web/delete-account.html':
            'tap the fourth tab, <strong>Profilo</strong>',
        })
      ),
      v('C30', c30({ 'rilascio.md': null })),
      v(
        'C30',
        c30({ 'rilascio.md': 'mandare le pagine web/elimina-account.html' })
      ),
    ],
    pos: [v('C30', C30_OK)],
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
      c35({ legacy: [...funzioneOk().legacy, ...funzioneOk().legacy] }),
      c35({
        legacy: [
          {
            nome: 'i.ts',
            riga: 3,
            contesto: 'Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")',
          },
        ],
      }),
      c35({ deno: { errore: 'deno: non trovato' } }),
      c35({ deno: { exit: 1, casi: null, coda: 'boom' } }),
      c35(denoCon([])),
      c35(denoCon([{ nome: 'token assente → 401', verde: true }])),
      c35(
        denoCon([
          { nome: 'chiave da SUPABASE_SECRET_KEYS', verde: false },
          { nome: 'token assente → 401', verde: true },
        ])
      ),
      c35(
        denoCon([
          { nome: 'chiave da SUPABASE_SECRET_KEYS', verde: true },
          { nome: 'token assente -> 401', verde: true },
        ])
      ),
      c35({ deno: { ...funzioneOk().deno, exit: 1 } }),
    ],
    pos: [c35(), c35({ legacy: [] })],
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
