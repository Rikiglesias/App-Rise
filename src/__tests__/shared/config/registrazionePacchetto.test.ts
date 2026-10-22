/**
 * Verifica dello sviluppatore Android (22/10): per registrare la chiave di firma di Google, Play Console
 * vuole un APK firmato con quella chiave che contenga `assets/adi-registration.properties` con lo snippet
 * dell'account. Il file deve stare nell'app vera: l'APK giusto è quello che Play firma dall'AAB caricato.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';

import appConfig from '../../../../app.config';

type ModConfig = {
  modRequest: { platformProjectRoot: string };
};
const plugin = require('../../../../plugins/registrazione-pacchetto') as {
  (config: Record<string, unknown>): {
    mods: { android: { dangerous: (c: unknown) => Promise<ModConfig> } };
  };
  FILE: string;
  SNIPPET: string;
};

const ASSET = ['app', 'src', 'main', 'assets'];

let radice: string;
beforeEach(() => {
  radice = fs.mkdtempSync(path.join(os.tmpdir(), 'adi-'));
});
afterEach(() => {
  fs.rmSync(radice, { recursive: true, force: true });
});

it('registrazione pacchetto: il plugin scrive lo snippet negli asset', async () => {
  const android = path.join(radice, 'android');
  const config = plugin({ name: 'app', slug: 'app' });
  await config.mods.android.dangerous({
    ...config,
    modRequest: {
      platform: 'android',
      modName: 'dangerous',
      projectRoot: radice,
      platformProjectRoot: android,
    },
  });
  const file = path.join(android, ...ASSET, 'adi-registration.properties');
  expect(plugin.FILE).toBe('adi-registration.properties');
  expect(fs.readFileSync(file, 'utf8')).toBe('DTUFRWY5BYSMMAAAAAAAAAAAAA');
});

it('registrazione pacchetto: il plugin è nella configurazione', () => {
  expect(appConfig.expo.plugins).toContain(
    './plugins/registrazione-pacchetto.js'
  );
});
