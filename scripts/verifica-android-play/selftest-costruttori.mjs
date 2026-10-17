// Costruttori delle fixture del selftest (C22): dati sintetici, nessun accesso al disco.
import { PACKAGE, SUPABASE_REF } from './comune.mjs';
import { infoElf } from './aab.mjs';

export const jwt = payload =>
  ['{"alg":"HS256"}', JSON.stringify(payload), 'firma']
    .map(s => Buffer.from(s).toString('base64url'))
    .join('.');
export const URL_OK = `https://${SUPABASE_REF}.supabase.co`;
export const ANON = jwt({ role: 'anon', ref: SUPABASE_REF });
export const PUBLISHABLE = 'sb_publishable_fixture';
export const ambiente = (
  production,
  sonda = { status: 200 },
  chiavePreview = PUBLISHABLE
) => ({
  production,
  preview: {
    EXPO_PUBLIC_SUPABASE_URL: URL_OK,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: chiavePreview,
  },
  sonda,
});
export const cfg = (android = {}, ios = {}, extra = {}) => ({
  version: '1.3.0',
  runtimeVersion: { policy: 'appVersion' },
  android: {
    package: PACKAGE,
    playStoreUrl: `https://play.google.com/store/apps/details?id=${PACKAGE}`,
    permissions: ['INTERNET'],
    blockedPermissions: ['com.google.android.gms.permission.AD_ID'],
    ...android,
  },
  ios,
  ...extra,
});
export const eas = (production = {}, submitAndroid = {}) => ({
  build: {
    production: { environment: 'production', node: '20.19.4', ...production },
    'production-store': {
      extends: 'production',
      android: { autoIncrement: true },
    },
  },
  submit: {
    production: {
      android: { track: 'internal', releaseStatus: 'draft', ...submitAndroid },
    },
  },
});

/** ELF64 minimo con un solo segmento PT_LOAD allineato a `align` (e_machine 183 = AArch64). */
export const elf64 = (align, macchina = 183) => {
  const b = Buffer.alloc(0x40 + 0x38);
  b.writeUInt32BE(0x7f454c46, 0);
  b[4] = 2;
  b[5] = 1;
  b.writeUInt16LE(macchina, 0x12);
  b.writeBigUInt64LE(0x40n, 0x20);
  b.writeUInt16LE(0x38, 0x36);
  b.writeUInt16LE(1, 0x38);
  b.writeUInt32LE(1, 0x40);
  b.writeBigUInt64LE(BigInt(align), 0x40 + 0x30);
  return b;
};
export const libreria = (nome, align = 16384, macchina = 183) => ({
  nome,
  ...infoElf(elf64(align, macchina)),
});
export const MANIFEST = `<manifest package="${PACKAGE}" android:versionName="1.3.0"><uses-sdk android:targetSdkVersion="36"/>
<uses-permission android:name="android.permission.INTERNET"/><uses-permission android:name="android.permission.VIBRATE"/>
<application><activity android:exported="true" android:name="${PACKAGE}.MainActivity"/>
<provider android:exported="false" android:name="expo.modules.filesystem.FileSystemFileProvider"/></application></manifest>`;
// AAB minimo che passa C11: le mutazioni di una sola cosa in selftest.mjs provano un ramo ciascuna.
export const binario = (extra = {}) => {
  const so = [
    libreria('base/lib/arm64-v8a/libx.so', 16384, 183),
    libreria('base/lib/x86_64/libx.so', 16384, 62),
    // 32 bit a 4 KB: fuori dal requisito Google (vale «on 64-bit devices»), non deve far fallire.
    libreria('base/lib/armeabi-v7a/libx.so', 4096, 40),
  ];
  return {
    manifest: MANIFEST,
    config: {
      optimizations: {
        uncompressNativeLibraries: {
          enabled: true,
          alignment: 'PAGE_ALIGNMENT_16K',
        },
      },
    },
    voci: [
      'BundleConfig.pb',
      'BUNDLE-METADATA/x',
      'META-INF/MANIFEST.MF',
      'base/manifest/AndroidManifest.xml',
      'base/assets/index.android.bundle',
      ...so.map(s => s.nome),
    ],
    so,
    bundle: `"${SUPABASE_REF}.supabase.co" "https://sentry.io"`,
    ...extra,
  };
};
export const EAS_OK = {
  status: 'FINISHED',
  platform: 'ANDROID',
  buildProfile: 'production-store',
  appVersion: '1.3.0',
};
export const build = (extra = {}) => ({
  eas: EAS_OK,
  antenato: 0,
  diffPulito: 0,
  jarSha: 'a099cfa1543f55593bc2ed16a70a7c67fe54b1747bb7301f37fdfd6d91028e29',
  logcat: `Start proc 123:${PACKAGE}/u0a1`,
  screenshot: true,
  dumpErrore: '<node text="Email o password non corretti"/>',
  attesiErrore: [
    'Email o password non corretti',
    'Incorrect email or password',
  ],
  ...extra,
});
export const immagine = (nome, larghezza, altezza, extra = {}) => ({
  nome,
  sha: nome,
  larghezza,
  altezza,
  formato: 'png',
  alfa: false,
  ...extra,
});
export const verdetto = (nomi, extra = {}) => ({
  agente: 'a1',
  criterio: 'C12',
  verdetto: 'PASS',
  giudicate: nomi.map(nome => ({ nome, hash: 'h', attuale: 'h' })),
  ...extra,
});
export const grande = (extra = {}) => {
  const imgs = ['grande-a.png', 'grande-b.png', 'grande-c.png'].map(n =>
    immagine(n, 2560, 1600)
  );
  return {
    immagini: imgs,
    log: 'Physical size: 2560x1600\nPhysical density: 320',
    verdetto: verdetto(imgs.map(i => i.nome)),
    ...extra,
  };
};
export const pixel = (lato, punti) => {
  const data = Buffer.alloc(lato * lato * 4);
  for (const [x, y, rgb = [0, 0, 0]] of punti)
    data.set([...rgb, 255], (y * lato + x) * 4);
  return { data, larghezza: lato, altezza: lato, alfa: true };
};
