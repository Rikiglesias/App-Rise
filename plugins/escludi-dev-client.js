// Toglie expo-dev-client dalle build per gli store Android (profili EAS `production*`).
//
// Perché: nel release i moduli dev restano collegati e portano dipendenze dichiarate come
// `implementation` (expo-dev-launcher 6.0.21, ultima patch SDK 54): Jetpack Compose
// `ui-tooling` con `PreviewActivity` ESPORTATA, ML Kit barcode con il suo modello nativo
// (`libbarhopper_v3.so`, ~5 MB per ABI) e il suo trasporto di telemetria verso Google.
// Nessuno di questi è usato dall'app pubblicata (misurato sull'AAB 1.3.0 versionCode 19).
//
// Come: `expoAutolinking.exclude` in settings.gradle (proprietà del plugin Gradle di
// expo-modules-autolinking). expo-updates gestisce già l'assenza del dev-client
// (`findProject(":expo-dev-client") != null` nel suo build.gradle). Le build di sviluppo
// (`expo run:android`, profilo `development`) restano identiche.
const { withSettingsGradle } = require('expo/config-plugins');

const PROFILI_STORE = ['production', 'production-store'];
const MODULI_DEV = [
  'expo-dev-client',
  'expo-dev-launcher',
  'expo-dev-menu',
  'expo-dev-menu-interface',
];
const ANCORA = 'expoAutolinking.useExpoModules()';

const conEsclusione = contenuto => {
  if (contenuto.includes('expoAutolinking.exclude')) return contenuto;
  if (!contenuto.includes(ANCORA)) {
    // Template di settings.gradle cambiato: meglio una build fallita che un AAB col dev-client.
    throw new Error(
      `escludi-dev-client: «${ANCORA}» non trovato in settings.gradle`
    );
  }
  const elenco = MODULI_DEV.map(m => `'${m}'`).join(', ');
  return contenuto.replace(
    ANCORA,
    `expoAutolinking.exclude = [${elenco}]\n${ANCORA}`
  );
};

const escludiDevClient = config =>
  withSettingsGradle(config, cfg => {
    if (!PROFILI_STORE.includes(process.env.EAS_BUILD_PROFILE)) return cfg;
    cfg.modResults.contents = conEsclusione(cfg.modResults.contents);
    return cfg;
  });

module.exports = escludiDevClient;
module.exports.conEsclusione = conEsclusione;
module.exports.MODULI_DEV = MODULI_DEV;
