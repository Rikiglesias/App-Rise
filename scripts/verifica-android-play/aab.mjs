// C11: contenuto dell'AAB (contratto del goal android-play, testo emendato il 14/10 dopo
// l'AAB 1.3.0 versionCode 19). La build si registra in docs/store/google-play/verifica/build.json:
//   { "id": "<id build EAS>", "aabSha256": "<sha256 del file scaricato>" }
// e l'AAB sta fuori dal repo in C:/tmp/rah-store/build/<id>.aab (pesa decine di MB).
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  PACKAGE,
  SUPABASE_REF,
  VERIFICA_DIR,
  elencaFile,
  esegui,
  esiste,
  leggi,
  sha256File,
} from './comune.mjs';

export const STRUMENTI = {
  jar: 'C:/tmp/rah-store/tools/bundletool-all-1.18.3.jar',
  jarSha256: 'a099cfa1543f55593bc2ed16a70a7c67fe54b1747bb7301f37fdfd6d91028e29',
  java: 'C:/Program Files/Android/Android Studio/jbr/bin/java.exe',
  cartellaAab: 'C:/tmp/rah-store/build',
  tar: 'C:/Windows/System32/tar.exe',
};
// Permessi ammessi nel manifest finale: è l'insieme scritto nel testo di C11, un permesso
// nuovo = FAIL finché il contratto non lo nomina.
export const PERMESSI_AMMESSI = new Map([
  ['android.permission.INTERNET', 'chiamate a Supabase e al sito'],
  ['android.permission.ACCESS_NETWORK_STATE', 'avviso di rete assente'],
  ['android.permission.VIBRATE', 'feedback al tocco di expo-haptics'],
  [
    `${PACKAGE}.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`,
    'aggiunto da androidx.core, interno all’app',
  ],
]);
const PERMESSI_VIETATI =
  /CAMERA|LOCATION|FOREGROUND_SERVICE|SYSTEM_ALERT_WINDOW|AD_ID/;
// Gli unici componenti raggiungibili da altre app.
const ESPORTATI_AMMESSI = new Set([
  `${PACKAGE}.MainActivity`,
  'androidx.profileinstaller.ProfileInstallReceiver',
]);
// Ciò che expo-dev-launcher porta nel release anche se l'app non lo usa, e il debug di RN.
const RESIDUI_DEV =
  /expo\.modules\.dev(launcher|menu)|androidx\.compose\.ui\.tooling\.PreviewActivity|com\.google\.mlkit|com\.google\.android\.datatransport|com\.google\.android\.gms\.(vision|codescanner)|com\.facebook\.react\.devsupport/i;
const FILE_VIETATI =
  /\/lib\/[^/]+\/libbarhopper[^/]*\.so$|\/assets\/(.*\/)?[^/]*mlkit[^/]*|\.tflite$/i;
const VOCI_DI_SERVIZIO = new Set([
  'BundleConfig.pb',
  'BUNDLE-METADATA',
  'META-INF',
]);
// Il requisito delle pagine da 16 KB vale «on 64-bit devices»
// (developer.android.com/guide/practices/page-sizes): le ABI a 32 bit ne sono fuori.
const MACCHINA_64 = { 'arm64-v8a': 183, x86_64: 62 }; // EM_AARCH64, EM_X86_64
const ABI_32 = ['armeabi-v7a', 'x86'];
const DSN_SENTRY =
  /https:\/\/[0-9a-f]{32}@[^"' ]*ingest[^"' ]*sentry[.]io\/[0-9]+/;

/** Classe (1 = 32 bit, 2 = 64 bit), e_machine e p_align dei PT_LOAD di un ELF little endian. */
export const infoElf = buf => {
  if (buf.readUInt32BE(0) !== 0x7f454c46) throw new Error('non è un ELF');
  const a64 = buf[4] === 2;
  const phoff = a64
    ? Number(buf.readBigUInt64LE(0x20))
    : buf.readUInt32LE(0x1c);
  const phentsize = buf.readUInt16LE(a64 ? 0x36 : 0x2a);
  const phnum = buf.readUInt16LE(a64 ? 0x38 : 0x2c);
  const allineamenti = [];
  for (let i = 0; i < phnum; i++) {
    const o = phoff + i * phentsize;
    if (buf.readUInt32LE(o) !== 1) continue;
    allineamenti.push(
      a64 ? Number(buf.readBigUInt64LE(o + 0x30)) : buf.readUInt32LE(o + 0x1c)
    );
  }
  return { classe: buf[4], macchina: buf.readUInt16LE(0x12), allineamenti };
};
export const allineamentiLoad = buf => infoElf(buf).allineamenti;

const abiDi = nome => nome.split('/')[2];
const nomiDi = (so, abi) =>
  new Set(so.filter(s => abiDi(s.nome) === abi).map(s => s.nome.split('/')[3]));

const leggiBuild = () => {
  const p = join(VERIFICA_DIR, 'build.json');
  return esiste(p) ? JSON.parse(leggi(p)) : null;
};

const bundletool = (...args) =>
  esegui(STRUMENTI.java, ['-jar', STRUMENTI.jar, ...args]);

const controllaManifest = m => {
  if (!new RegExp(`package="${PACKAGE.replace(/\./g, '\\.')}"`).test(m))
    return 'pacchetto diverso nel manifest';
  if (!/android:versionName="1\.3\.0"/.test(m))
    return 'versionName diverso da 1.3.0';
  if (!/android:targetSdkVersion="36"/.test(m))
    return 'targetSdkVersion diverso da 36';
  const permessi = [
    ...m.matchAll(/<uses-permission(?:-sdk-23)?\b[^>]*android:name="([^"]+)"/g),
  ].map(x => x[1]);
  const vietato = permessi.find(p => PERMESSI_VIETATI.test(p));
  if (vietato) return `permesso vietato nel manifest: ${vietato}`;
  const ignoto = permessi.find(p => !PERMESSI_AMMESSI.has(p));
  if (ignoto) return `permesso fuori whitelist: ${ignoto}`;
  const esportati = [
    ...m.matchAll(
      /<(?:activity|activity-alias|service|receiver|provider)\b[^>]*>/g
    ),
  ]
    .map(x => x[0])
    .filter(t => /android:exported="true"/.test(t))
    .map(t => t.match(/android:name="([^"]+)"/)?.[1] ?? '(senza nome)');
  const fuori = esportati.find(n => !ESPORTATI_AMMESSI.has(n));
  if (fuori) return `componente esportato fuori whitelist: ${fuori}`;
  const residuo = m.match(RESIDUI_DEV);
  if (residuo) return `componente di sviluppo nel manifest: ${residuo[0]}`;
  if (/android:debuggable="true"/.test(m)) return 'applicazione debuggable';
  if (/android:testOnly="true"/.test(m)) return 'applicazione testOnly';
  return null;
};

const controllaLibrerie = so => {
  if (!so.length) return 'nessuna libreria .so trovata: lettore rotto?';
  const abis = new Set(so.map(s => abiDi(s.nome)));
  const estranea = [...abis].find(
    a => !(a in MACCHINA_64) && !ABI_32.includes(a)
  );
  if (estranea) return `cartella ABI non prevista: ${estranea}`;
  const arm64 = nomiDi(so, 'arm64-v8a');
  const x64 = nomiDi(so, 'x86_64');
  if (!arm64.size || !x64.size)
    return 'manca un’ABI a 64 bit (arm64-v8a o x86_64)';
  const diversi = [...arm64]
    .filter(n => !x64.has(n))
    .concat([...x64].filter(n => !arm64.has(n)));
  if (diversi.length)
    return `librerie diverse fra arm64-v8a e x86_64: ${diversi.join(', ')}`;
  for (const abi of ABI_32) {
    const manca = [...nomiDi(so, abi)].find(n => !arm64.has(n));
    if (manca) return `${abi}/${manca} senza la versione a 64 bit`;
  }
  for (const s of so.filter(x => abiDi(x.nome) in MACCHINA_64)) {
    if (s.classe !== 2) return `${s.nome}: non è ELFCLASS64`;
    if (s.macchina !== MACCHINA_64[abiDi(s.nome)])
      return `${s.nome}: e_machine ${s.macchina} non coerente con l’ABI`;
    if (!s.allineamenti.length || s.allineamenti.some(a => a < 16384))
      return `${s.nome}: p_align ${s.allineamenti.join('/')} < 16384`;
  }
  return null;
};

export const criteri = {
  C11: {
    leggi() {
      const build = leggiBuild();
      if (!build)
        return { mancante: 'docs/store/google-play/verifica/build.json' };
      const aab = join(STRUMENTI.cartellaAab, `${build.id}.aab`);
      if (!esiste(aab)) return { mancante: aab };
      if (sha256File(aab) !== build.aabSha256)
        return { mancante: `${aab} con sha256 uguale a build.json` };
      const manifest = bundletool('dump', 'manifest', `--bundle=${aab}`);
      const config = JSON.parse(
        bundletool('dump', 'config', `--bundle=${aab}`)
      );
      const voci = esegui(STRUMENTI.tar, ['-tf', aab])
        .split(/\r?\n/)
        .filter(Boolean);
      const tmp = mkdtempSync(join(tmpdir(), 'verifica-aab-'));
      try {
        esegui(STRUMENTI.tar, ['-xf', aab, '-C', tmp]);
        const so = elencaFile(tmp, p => p.endsWith('.so'))
          .map(p => ({
            nome: p
              .slice(tmp.length + 1)
              .split('\\')
              .join('/'),
            ...infoElf(readFileSync(p)),
          }))
          .filter(s => s.nome.split('/')[1] === 'lib');
        const pb = join(tmp, 'base', 'assets', 'index.android.bundle');
        const bundle = esiste(pb) ? readFileSync(pb).toString('latin1') : null;
        return { manifest, config, voci, so, bundle };
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    },
    verifica(i) {
      if (i.mancante) return `manca ${i.mancante}`;
      const moduli = [
        ...new Set(
          i.voci.map(v => v.split('/')[0]).filter(v => !VOCI_DI_SERVIZIO.has(v))
        ),
      ];
      if (moduli.length !== 1 || moduli[0] !== 'base')
        return `moduli dell'AAB: ${moduli.join(', ')} (atteso solo base)`;
      const errManifest = controllaManifest(i.manifest);
      if (errManifest) return errManifest;
      const vietato = i.voci.find(v => FILE_VIETATI.test(v));
      if (vietato) return `file di ML Kit nell'AAB: ${vietato}`;
      const errLib = controllaLibrerie(i.so);
      if (errLib) return errLib;
      const nc = i.config?.optimizations?.uncompressNativeLibraries ?? {};
      if (nc.enabled !== false && nc.alignment !== 'PAGE_ALIGNMENT_16K')
        return `librerie native non compresse con allineamento ${nc.alignment ?? 'assente'}`;
      if (!i.bundle) return 'index.android.bundle assente nell’AAB';
      if (!i.bundle.includes(`${SUPABASE_REF}.supabase.co`))
        return 'il bundle non contiene l’host Supabase di produzione';
      if (DSN_SENTRY.test(i.bundle)) return 'il bundle contiene un DSN Sentry';
      return null;
    },
  },
};
