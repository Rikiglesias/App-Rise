// C22: lo script non mente. Per ogni Cn verificato dallo script almeno una fixture NEGATIVA
// deve dare FAIL; le fixture POSITIVE (dove costano poco) devono dare PASS, così un controllo
// che fallisce sempre non passa il selftest.
import { PACKAGE, SUPABASE_REF } from './comune.mjs';
import {
  jwt,
  URL_OK,
  ANON,
  PUBLISHABLE,
  ambiente,
  cfg,
  eas,
  elf64,
  MANIFEST,
  binario,
  EAS_OK,
  build,
} from './selftest-costruttori.mjs';
import { FIXTURE_VISIVO } from './selftest-visivo.mjs';
import { FIXTURE_DOCUMENTI } from './selftest-documenti.mjs';
import { FIXTURE_CANCELLAZIONE } from './selftest-cancellazione.mjs';
import { FIXTURE_INFORMATIVA } from './selftest-informativa.mjs';
import { FIXTURE_PLAY } from './selftest-play.mjs';
import { FIXTURE_AAB } from './selftest-aab.mjs';
import { FIXTURE_LINK } from './selftest-link.mjs';
import { FIXTURE_CODICE } from './selftest-codice.mjs';
import { FIXTURE_LOGIN } from './selftest-login.mjs';
import { FIXTURE_PAGINE } from './selftest-pagine.mjs';
import { FIXTURE_DISPOSITIVI } from './selftest-dispositivi.mjs';

export const FIXTURE = {
  ...FIXTURE_CODICE,
  ...FIXTURE_LOGIN,
  ...FIXTURE_PAGINE,
  ...FIXTURE_DISPOSITIVI,
  ...FIXTURE_VISIVO,
  ...FIXTURE_DOCUMENTI,
  ...FIXTURE_CANCELLAZIONE,
  ...FIXTURE_INFORMATIVA,
  ...FIXTURE_PLAY,
  ...FIXTURE_AAB,
  ...FIXTURE_LINK,
  C1: {
    neg: [
      cfg({ package: 'it.creareunapp.editor.android63da226b447a7' }),
      cfg({ playStoreUrl: 'https://example.com' }),
    ],
    pos: [cfg()],
  },
  C2: {
    neg: [
      cfg({ permissions: ['android.permission.CAMERA'] }),
      cfg({}, { infoPlist: { NSCameraUsageDescription: 'foto' } }),
      cfg({ blockedPermissions: [] }),
      cfg(
        {},
        {},
        {
          locali: [
            { lingua: 'it', dati: { NSCameraUsageDescription: 'foto' } },
          ],
        }
      ),
      cfg(
        {},
        {},
        {
          locali: [
            {
              lingua: 'en',
              dati: { ios: { NSCameraUsageDescription: 'photo' } },
            },
          ],
        }
      ),
    ],
    pos: [
      cfg(),
      cfg(
        {},
        {},
        {
          locali: [
            { lingua: 'it', dati: { ios: { CFBundleName: 'RAH Italia' } } },
          ],
        }
      ),
    ],
  },
  C3: {
    neg: [
      {
        sorgente: 'android: { compileSdkVersion: 34 }',
        xmlPresenti: [],
        docs: [],
      },
      {
        sorgente: '',
        xmlPresenti: ['android-network-security-config.xml'],
        docs: [],
      },
      {
        sorgente: '',
        xmlPresenti: [],
        docs: [
          {
            nome: 'docs/a.md',
            testo: '# Sicurezza\nIl pinning dei certificati è attivo.',
          },
        ],
      },
    ],
    pos: [
      {
        sorgente: '// compileSdkVersion: 34 tolto\nandroid: {}',
        xmlPresenti: [],
        docs: [{ nome: 'docs/a.md', testo: 'Pinning: non attivo per scelta.' }],
      },
      {
        sorgente: '',
        xmlPresenti: [],
        docs: [
          {
            nome: 'docs/b.md',
            testo:
              'Nessuna network security config:\ni due XML sono stati rimossi.',
          },
        ],
      },
    ],
  },
  C4: {
    neg: [
      cfg({}, {}, { version: '1.2.9' }),
      cfg({}, {}, { runtimeVersion: '1.3.0' }),
    ],
    pos: [cfg()],
  },
  C5: {
    neg: [
      eas({ environment: undefined }),
      eas({ node: '20.18.0' }),
      eas({}, { track: 'production' }),
      eas({}, { releaseStatus: 'completed' }),
    ],
    pos: [eas()],
  },
  C6: {
    neg: [
      ambiente({
        EXPO_PUBLIC_SUPABASE_URL: URL_OK,
        EXPO_PUBLIC_SUPABASE_ANON_KEY: '********',
      }),
      ambiente({ EXPO_PUBLIC_SUPABASE_URL: URL_OK }),
      // JWT legacy (chiavi disattivate dal 06/07/2026), anche se uguale a preview e con la sonda che direbbe 200
      ambiente(
        {
          EXPO_PUBLIC_SUPABASE_URL: URL_OK,
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ANON,
        },
        { status: 200 },
        ANON
      ),
      ambiente(
        {
          EXPO_PUBLIC_SUPABASE_URL: URL_OK,
          EXPO_PUBLIC_SUPABASE_ANON_KEY: jwt({ role: 'anon', ref: 'altro' }),
        },
        { status: 200 },
        jwt({ role: 'anon', ref: 'altro' })
      ),
      ambiente(
        {
          EXPO_PUBLIC_SUPABASE_URL: URL_OK,
          EXPO_PUBLIC_SUPABASE_ANON_KEY: PUBLISHABLE,
        },
        { status: 401 }
      ),
      ambiente(
        {
          EXPO_PUBLIC_SUPABASE_URL: URL_OK,
          EXPO_PUBLIC_SUPABASE_ANON_KEY: PUBLISHABLE,
        },
        { errore: 'rete' }
      ),
      ambiente(
        {
          EXPO_PUBLIC_SUPABASE_URL: URL_OK,
          EXPO_PUBLIC_SUPABASE_ANON_KEY: PUBLISHABLE,
        },
        { errore: 'timeout' }
      ),
      ambiente(
        {
          EXPO_PUBLIC_SUPABASE_URL: URL_OK,
          EXPO_PUBLIC_SUPABASE_ANON_KEY: PUBLISHABLE,
        },
        null
      ),
      ambiente({
        EXPO_PUBLIC_SUPABASE_URL: URL_OK,
        EXPO_PUBLIC_SUPABASE_ANON_KEY: PUBLISHABLE,
        EXPO_PUBLIC_SENTRY_DSN: 'x',
      }),
      ambiente({
        EXPO_PUBLIC_SUPABASE_URL: URL_OK,
        EXPO_PUBLIC_SUPABASE_ANON_KEY: PUBLISHABLE,
        APP_ENV: 'development',
      }),
    ],
    pos: [
      ambiente({
        EXPO_PUBLIC_SUPABASE_URL: URL_OK,
        EXPO_PUBLIC_SUPABASE_ANON_KEY: PUBLISHABLE,
      }),
    ],
  },
  C10: {
    neg: [
      build({ eas: { ...EAS_OK, status: 'ERRORED' } }),
      build({ eas: { ...EAS_OK, buildProfile: 'production' } }),
      build({ diffPulito: 1 }),
      build({
        logcat: `Start proc 1:${PACKAGE}/u0\nFATAL EXCEPTION: main\nProcess: ${PACKAGE}, PID: 1`,
      }),
      build({ dumpErrore: '<node text="Errore di rete"/>' }),
    ],
    pos: [build()],
  },
};
