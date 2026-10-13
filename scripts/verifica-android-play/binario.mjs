// C10-C11: build EAS `production-store` e contenuto dell'AAB (contratto del goal android-play).
// La build si registra in docs/store/google-play/verifica/build.json:
//   { "id": "<id build EAS>", "aabSha256": "<sha256 del file scaricato>" }
// e l'AAB sta fuori dal repo in C:/tmp/rah-store/build/<id>.aab (pesa decine di MB).
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  PACKAGE,
  SUPABASE_REF,
  VERIFICA_DIR,
  crashDelPacchetto,
  elencaFile,
  esegui,
  esiste,
  exitDi,
  leggi,
  percorso,
  regexLogcatAvvio,
  sha256File,
  testiDump,
} from './comune.mjs';
import { testoTraduzione } from './app.mjs';

export const STRUMENTI = {
  jar: 'C:/tmp/rah-store/tools/bundletool-all-1.18.3.jar',
  jarSha256: 'a099cfa1543f55593bc2ed16a70a7c67fe54b1747bb7301f37fdfd6d91028e29',
  java: 'C:/Program Files/Android/Android Studio/jbr/bin/java.exe',
  cartellaAab: 'C:/tmp/rah-store/build',
  tar: 'C:/Windows/System32/tar.exe',
};
const FILE_SORVEGLIATI = [
  'src',
  'app.config.js',
  'eas.json',
  'package.json',
  'package-lock.json',
];
// Permessi ammessi nel manifest finale: ognuno ha un motivo. Uno nuovo = FAIL finché non è giustificato qui.
export const PERMESSI_AMMESSI = new Map([
  ['android.permission.INTERNET', 'chiamate a Supabase e al sito'],
  ['android.permission.ACCESS_NETWORK_STATE', 'avviso di rete assente'],
  [
    `${PACKAGE}.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`,
    'aggiunto da androidx.core, interno all’app',
  ],
]);
const PERMESSI_VIETATI =
  /CAMERA|LOCATION|FOREGROUND_SERVICE|SYSTEM_ALERT_WINDOW|AD_ID/;
const DSN_SENTRY =
  /https:\/\/[0-9a-f]{32}@[^"' ]*ingest[^"' ]*sentry[.]io\/[0-9]+/;

const leggiBuild = () => {
  const p = join(VERIFICA_DIR, 'build.json');
  if (!esiste(p)) return null;
  return JSON.parse(leggi(p));
};

/** p_align dei segmenti PT_LOAD di un ELF (32 o 64 bit, little endian). */
export const allineamentiLoad = buf => {
  if (buf.readUInt32BE(0) !== 0x7f454c46) throw new Error('non è un ELF');
  const a64 = buf[4] === 2;
  const phoff = a64
    ? Number(buf.readBigUInt64LE(0x20))
    : buf.readUInt32LE(0x1c);
  const phentsize = buf.readUInt16LE(a64 ? 0x36 : 0x2a);
  const phnum = buf.readUInt16LE(a64 ? 0x38 : 0x2c);
  const out = [];
  for (let i = 0; i < phnum; i++) {
    const o = phoff + i * phentsize;
    if (buf.readUInt32LE(o) !== 1) continue;
    out.push(
      a64 ? Number(buf.readBigUInt64LE(o + 0x30)) : buf.readUInt32LE(o + 0x1c)
    );
  }
  return out;
};

export const criteri = {
  C10: {
    leggi() {
      const build = leggiBuild();
      if (!build)
        return { mancante: 'docs/store/google-play/verifica/build.json' };
      const eas = JSON.parse(
        esegui('npx', ['eas', 'build:view', build.id, '--json'])
      );
      const hash = eas.gitCommitHash;
      const f = n => join(VERIFICA_DIR, n);
      const attesiErrore = ['it', 'en'].map(l =>
        testoTraduzione(
          leggi(percorso('src', 'locales', `${l}.ts`)),
          'auth.errors.invalid_credentials'
        )
      );
      return {
        eas,
        antenato: hash
          ? exitDi('git', ['merge-base', '--is-ancestor', hash, 'HEAD'])
          : 1,
        diffPulito: hash
          ? exitDi('git', [
              'diff',
              '--quiet',
              hash,
              'HEAD',
              '--',
              ...FILE_SORVEGLIATI,
            ])
          : 1,
        jarSha: esiste(STRUMENTI.jar) ? sha256File(STRUMENTI.jar) : null,
        logcat: esiste(f('C10-logcat.txt')) ? leggi(f('C10-logcat.txt')) : null,
        screenshot: esiste(f('C10-accesso.png')),
        dumpErrore: esiste(f('C10-errore-server.xml'))
          ? leggi(f('C10-errore-server.xml'))
          : null,
        attesiErrore,
      };
    },
    verifica(i) {
      if (i.mancante) return `manca ${i.mancante}`;
      const e = i.eas;
      if (e.status !== 'FINISHED') return `build EAS in stato ${e.status}`;
      if (e.platform !== 'ANDROID') return `build per ${e.platform}`;
      if (e.buildProfile !== 'production-store')
        return `profilo ${e.buildProfile}, atteso production-store`;
      if (e.appVersion !== '1.3.0')
        return `appVersion ${e.appVersion}, atteso 1.3.0`;
      if (i.antenato !== 0)
        return 'il commit della build non è antenato di HEAD';
      if (i.diffPulito !== 0)
        return `dopo il commit della build sono cambiati: ${FILE_SORVEGLIATI.join(', ')}`;
      if (i.jarSha !== STRUMENTI.jarSha256)
        return 'bundletool assente o con sha256 diverso da quello pubblicato';
      if (!i.logcat) return 'manca C10-logcat.txt';
      if (!regexLogcatAvvio.test(i.logcat))
        return `il logcat non mostra l'avvio di ${PACKAGE}`;
      if (crashDelPacchetto(i.logcat))
        return `FATAL EXCEPTION di ${PACKAGE} nel logcat`;
      if (!i.screenshot) return 'manca C10-accesso.png';
      if (!i.dumpErrore)
        return 'manca C10-errore-server.xml (dump dopo l’accesso sbagliato)';
      const visti = testiDump(i.dumpErrore);
      if (!i.attesiErrore.some(t => t && visti.includes(t)))
        return 'a schermo non c’è l’errore «credenziali non corrette» restituito dal server';
      return null;
    },
  },
  C11: {
    leggi() {
      const build = leggiBuild();
      if (!build)
        return { mancante: 'docs/store/google-play/verifica/build.json' };
      const aab = join(STRUMENTI.cartellaAab, `${build.id}.aab`);
      if (!esiste(aab)) return { mancante: aab };
      if (sha256File(aab) !== build.aabSha256)
        return { mancante: `${aab} con sha256 uguale a build.json` };
      const manifest = esegui(STRUMENTI.java, [
        '-jar',
        STRUMENTI.jar,
        'dump',
        'manifest',
        `--bundle=${aab}`,
      ]);
      const tmp = mkdtempSync(join(tmpdir(), 'verifica-aab-'));
      try {
        esegui(STRUMENTI.tar, ['-xf', aab, '-C', tmp]);
        const so = elencaFile(join(tmp, 'base', 'lib'), p =>
          p.endsWith('.so')
        ).map(p => ({
          nome: p
            .slice(tmp.length + 1)
            .split('\\')
            .join('/'),
          allineamenti: allineamentiLoad(readFileSync(p)),
        }));
        const pb = join(tmp, 'base', 'assets', 'index.android.bundle');
        const bundle = esiste(pb) ? readFileSync(pb).toString('latin1') : null;
        return { manifest, so, bundle };
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    },
    verifica(i) {
      if (i.mancante) return `manca ${i.mancante}`;
      const m = i.manifest;
      if (!new RegExp(`package="${PACKAGE.replace(/\./g, '\\.')}"`).test(m))
        return 'pacchetto diverso nel manifest';
      if (!/android:versionName="1\.3\.0"/.test(m))
        return 'versionName diverso da 1.3.0';
      if (!/android:targetSdkVersion="36"/.test(m))
        return 'targetSdkVersion diverso da 36';
      const permessi = [
        ...m.matchAll(
          /<uses-permission(?:-sdk-23)?\b[^>]*android:name="([^"]+)"/g
        ),
      ].map(x => x[1]);
      const vietato = permessi.find(p => PERMESSI_VIETATI.test(p));
      if (vietato) return `permesso vietato nel manifest: ${vietato}`;
      const ignoto = permessi.find(p => !PERMESSI_AMMESSI.has(p));
      if (ignoto) return `permesso fuori whitelist: ${ignoto}`;
      if (/expo\.modules\.dev(launcher|menu)/i.test(m))
        return 'activity di expo-dev-launcher/dev-menu nel manifest';
      if (/android:debuggable="true"/.test(m)) return 'applicazione debuggable';
      if (!i.so.length) return 'nessuna libreria .so trovata: lettore rotto?';
      const male = i.so.find(
        s => !s.allineamenti.length || s.allineamenti.some(a => a < 16384)
      );
      if (male)
        return `${male.nome}: p_align ${male.allineamenti.join('/')} < 16384`;
      if (!i.bundle) return 'index.android.bundle assente nell’AAB';
      if (!i.bundle.includes(`${SUPABASE_REF}.supabase.co`))
        return 'il bundle non contiene l’host Supabase di produzione';
      if (DSN_SENTRY.test(i.bundle)) return 'il bundle contiene un DSN Sentry';
      return null;
    },
  },
};
