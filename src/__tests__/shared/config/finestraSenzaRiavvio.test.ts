/**
 * C54 (contratto android-play): con target 36, Android 16 ignora il blocco in verticale sugli schermi
 * ≥ 600 dp. Senza `smallestScreenSize` in `configChanges`, aprire un pieghevole o ridimensionare la
 * finestra ricrea l'attività e l'app riparte dalla Home (AAB 23baf998: `configChanges=0x27b4`, senza).
 */
import { configApp } from '../../helpers/configApp';

const plugin = require('../../../../plugins/finestra-senza-riavvio') as {
  (config: Record<string, unknown>): {
    mods: { android: { manifest: (c: unknown) => Promise<ManifestConfig> } };
  };
  conConfigChanges: (valore: string | undefined) => string;
};

type Attivita = { $: Record<string, string> };
type ManifestConfig = {
  modResults: { manifest: { application: { activity: Attivita[] }[] } };
};

const DI_EXPO =
  'keyboard|keyboardHidden|orientation|screenSize|screenLayout|uiMode';

it('finestra senza riavvio: configChanges con smallestScreenSize', () => {
  const dopo = plugin.conConfigChanges(DI_EXPO);
  const voci = dopo.split('|');
  expect(voci).toEqual(
    expect.arrayContaining([...DI_EXPO.split('|'), 'smallestScreenSize'])
  );
  expect(new Set(voci).size).toBe(voci.length);
  expect(plugin.conConfigChanges(dopo)).toBe(dopo);
  expect(plugin.conConfigChanges(undefined).split('|')).toEqual(
    expect.arrayContaining([
      'screenSize',
      'smallestScreenSize',
      'screenLayout',
      'orientation',
    ])
  );
});

it("finestra senza riavvio: il plugin scrive l'attività principale", async () => {
  const attivita = (nome: string): Attivita => ({
    $: { 'android:name': nome, 'android:configChanges': DI_EXPO },
  });
  const manifest = {
    manifest: {
      $: { 'xmlns:android': 'http://schemas.android.com/apk/res/android' },
      application: [
        {
          $: { 'android:name': '.MainApplication' },
          activity: [attivita('.MainActivity'), attivita('.AltraActivity')],
        },
      ],
    },
  };
  const config = plugin({ name: 'app', slug: 'app' });
  const esito = await config.mods.android.manifest({
    ...config,
    modResults: manifest,
    modRequest: { platform: 'android', modName: 'manifest', projectRoot: '.' },
  });
  const valori = (esito.modResults.manifest.application[0]?.activity ?? []).map(
    a => a.$['android:configChanges']
  );
  expect(valori).toEqual([plugin.conConfigChanges(DI_EXPO), DI_EXPO]);
});

it('finestra senza riavvio: il plugin è nella configurazione', () => {
  expect(configApp().expo.plugins).toContain(
    './plugins/finestra-senza-riavvio.js'
  );
});
