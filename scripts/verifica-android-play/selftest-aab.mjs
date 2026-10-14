// Fixture del selftest (C22) per C11, il contenuto dell'AAB: dati sintetici, nessun accesso al disco.
import { SUPABASE_REF } from './comune.mjs';
import { MANIFEST, binario, libreria } from './selftest-costruttori.mjs';

/** Le librerie del positivo con quella dell'ABI `abi` sostituita. */
const conLibreria = (abi, align, macchina) =>
  binario().so.map(s =>
    s.nome.includes(`/${abi}/`) ? libreria(s.nome, align, macchina) : s
  );
const inApplication = xml =>
  MANIFEST.replace('</application>', `${xml}</application>`);

export const FIXTURE_AAB = {
  // Ogni negativo = il positivo con UNA sola mutazione: il FAIL viene per forza da quel ramo.
  C11: {
    neg: [
      // librerie a 64 bit
      binario({ so: conLibreria('x86_64', 4096, 62) }),
      binario({ so: conLibreria('arm64-v8a', 4096, 183) }),
      binario({ so: conLibreria('x86_64', 16384, 183) }),
      binario({
        so: binario().so.map(s =>
          s.nome.includes('/x86_64/') ? { ...s, classe: 1 } : s
        ),
      }),
      binario({ so: binario().so.filter(s => !s.nome.includes('/x86_64/')) }),
      binario({
        so: [...binario().so, libreria('base/lib/arm64-v8a/liby.so')],
      }),
      binario({
        so: [...binario().so, libreria('base/lib/x86/libz.so', 4096, 3)],
      }),
      binario({
        so: [...binario().so, libreria('base/lib/riscv64/libx.so', 16384, 243)],
      }),
      // file e moduli
      binario({
        voci: [...binario().voci, 'base/lib/arm64-v8a/libbarhopper_v3.so'],
      }),
      binario({
        voci: [...binario().voci, 'base/assets/mlkit_barcode_models/m.tflite'],
      }),
      binario({
        voci: [...binario().voci, 'funzione/manifest/AndroidManifest.xml'],
      }),
      // componenti
      binario({
        manifest: inApplication(
          '<activity android:exported="true" android:name="androidx.compose.ui.tooling.PreviewActivity"/>'
        ),
      }),
      binario({
        manifest: inApplication(
          '<activity android:exported="false" android:name="androidx.compose.ui.tooling.PreviewActivity"/>'
        ),
      }),
      binario({
        manifest: inApplication(
          '<provider android:name="com.google.mlkit.common.internal.MlKitInitProvider"/>'
        ),
      }),
      binario({
        manifest: inApplication(
          '<service android:name="com.google.android.datatransport.runtime.backends.TransportBackendDiscovery"/>'
        ),
      }),
      binario({
        manifest: inApplication(
          '<receiver android:exported="true" android:name="com.example.Ricevitore"/>'
        ),
      }),
      binario({
        manifest: MANIFEST.replace(
          '<application>',
          '<application android:debuggable="true">'
        ),
      }),
      binario({
        manifest: MANIFEST.replace(
          '<application>',
          '<application android:testOnly="true">'
        ),
      }),
      // permessi
      binario({ manifest: MANIFEST.replace('INTERNET', 'CAMERA') }),
      binario({ manifest: MANIFEST.replace('INTERNET', 'READ_CONTACTS') }),
      binario({
        manifest: MANIFEST.replace('INTERNET', 'SYSTEM_ALERT_WINDOW'),
      }),
      binario({
        manifest: MANIFEST.replace(
          'android.permission.INTERNET',
          'com.google.android.gms.permission.AD_ID'
        ),
      }),
      binario({
        manifest: inApplication(
          '<uses-permission-sdk-23 android:name="android.permission.READ_CONTACTS"/>'
        ),
      }),
      binario({ manifest: MANIFEST.replace('1.3.0', '1.2.9') }),
      // configurazione del bundle
      binario({
        config: {
          optimizations: {
            uncompressNativeLibraries: {
              enabled: true,
              alignment: 'PAGE_ALIGNMENT_4K',
            },
          },
        },
      }),
      binario({ config: {} }),
      // bundle JS
      binario({
        bundle: `"${SUPABASE_REF}.supabase.co" "https://0123456789abcdef0123456789abcdef@o1.ingest.sentry.io/42"`,
      }),
      binario({ bundle: '"altro.supabase.co"' }),
    ],
    pos: [
      binario(),
      binario({
        config: {
          optimizations: { uncompressNativeLibraries: { enabled: false } },
        },
      }),
    ],
  },
};
