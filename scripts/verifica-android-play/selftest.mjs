// C22: lo script non mente. Per ogni Cn verificato dallo script almeno una fixture NEGATIVA
// deve dare FAIL; le fixture POSITIVE (dove costano poco) devono dare PASS, così un controllo
// che fallisce sempre non passa il selftest.
import { PACKAGE, SUPABASE_REF } from './comune.mjs';
import { allineamentiLoad } from './binario.mjs';
import {
  jwt,
  URL_OK,
  ANON,
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

export const FIXTURE = {
  ...FIXTURE_VISIVO,
  ...FIXTURE_DOCUMENTI,
  ...FIXTURE_CANCELLAZIONE,
  ...FIXTURE_INFORMATIVA,
  ...FIXTURE_PLAY,
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
      ambiente({
        EXPO_PUBLIC_SUPABASE_URL: URL_OK,
        EXPO_PUBLIC_SUPABASE_ANON_KEY: jwt({ role: 'anon', ref: 'altro' }),
      }),
      ambiente({
        EXPO_PUBLIC_SUPABASE_URL: URL_OK,
        EXPO_PUBLIC_SUPABASE_ANON_KEY: ANON,
        EXPO_PUBLIC_SENTRY_DSN: 'x',
      }),
      ambiente({
        EXPO_PUBLIC_SUPABASE_URL: URL_OK,
        EXPO_PUBLIC_SUPABASE_ANON_KEY: ANON,
        APP_ENV: 'development',
      }),
    ],
    pos: [
      ambiente({
        EXPO_PUBLIC_SUPABASE_URL: URL_OK,
        EXPO_PUBLIC_SUPABASE_ANON_KEY: ANON,
      }),
    ],
  },
  C7: {
    neg: [
      {
        rotte: ['Beneficiaries'],
        file: [
          { nome: 'src/a.tsx', testo: "navigation.navigate('Beneficiaries')" },
        ],
      },
      {
        rotte: ['Kits'],
        file: [{ nome: 'src/b.ts', testo: "linking: { screen: 'Kits' }" }],
      },
      { rotte: [], file: [] },
    ],
    pos: [
      {
        rotte: ['Beneficiaries'],
        file: [{ nome: 'src/a.tsx', testo: "navigate('Impact')" }],
      },
    ],
  },
  C8: {
    neg: [
      {
        png: ['link-scaduto-it.png'],
        dump: {},
        log: null,
        attesi: { it: ['a'], en: ['b'] },
      },
      {
        png: [],
        dump: { it: '<node text="altro"/>', en: '<node text="b"/>' },
        log: 'x',
        attesi: { it: ['a'], en: ['b'] },
      },
      {
        png: [],
        dump: { it: '<node text="a"/>', en: '<node text="b"/>' },
        log: `${PACKAGE} error_code=otp_disabled`,
        attesi: { it: ['a'], en: ['b'] },
      },
    ],
    pos: [
      {
        png: [],
        dump: { it: '<node text="a"/>', en: '<node text="b"/>' },
        log: `${PACKAGE} rahitalia://reset-password#error_code=otp_expired`,
        attesi: { it: ['a'], en: ['b'] },
      },
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
  C11: {
    neg: [
      binario({
        so: [
          {
            nome: 'base/lib/arm64-v8a/liby.so',
            allineamenti: allineamentiLoad(elf64(4096)),
          },
        ],
      }),
      binario({ manifest: MANIFEST.replace('INTERNET', 'CAMERA') }),
      binario({ manifest: MANIFEST.replace('INTERNET', 'READ_CONTACTS') }),
      binario({
        bundle: `"${SUPABASE_REF}.supabase.co" "https://0123456789abcdef0123456789abcdef@o1.ingest.sentry.io/42"`,
      }),
      binario({ bundle: '"altro.supabase.co"' }),
    ],
    pos: [binario()],
  },
};
