// Toglie expo-dev-client dalle build per gli store Android (profili EAS `production*`).
//
// Perché: nel release i moduli dev restano collegati e portano dipendenze dichiarate come
// `implementation` (expo-dev-launcher 6.0.21, ultima patch SDK 54): Jetpack Compose
// `ui-tooling` con `PreviewActivity` ESPORTATA, ML Kit barcode con il suo modello nativo
// (`libbarhopper_v3.so`, ~5 MB per ABI) e il suo trasporto di telemetria verso Google.
// Nessuno di questi è usato dall'app pubblicata (misurato sull'AAB 1.3.0 versionCode 19).
//
// Come: `expo.autolinking.android.exclude` in package.json, scritto durante il prebuild.
// Il CLI di autolinking lo legge a ogni chiamata, compresa quella che Gradle fa in
// settings.gradle (docs.expo.dev/modules/autolinking).
// NON `expoAutolinking.exclude` in settings.gradle: expo-modules-autolinking 3.0.27 (ultima
// SDK 54) passa la lista al CLI come UN argomento unito da spazi (`joinToString(" ")` in
// AutolinkigCommandBuilder.kt), quindi con più di un nome non esclude niente. Provato
// sull'AAB versionCode 20: esclusione scritta, quattro moduli dev ancora dentro.
//
// Effetto collaterale voluto e limitato: tocca package.json solo con EAS_BUILD_PROFILE di
// uno store, cioè nella cartella usa-e-getta di EAS. Le build di sviluppo
// (`expo run:android`, profilo `development`) restano identiche. expo-updates gestisce già
// l'assenza del dev-client (`findProject(":expo-dev-client") != null` nel suo build.gradle).
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

const PROFILI_STORE = ['production', 'production-store'];
const MODULI_DEV = [
  'expo-dev-client',
  'expo-dev-launcher',
  'expo-dev-menu',
  'expo-dev-menu-interface',
];

// Restituisce il package.json con i moduli dev esclusi per Android (stesso oggetto se già ci sono).
const conEsclusione = pacchetto => {
  const expo = pacchetto.expo ?? {};
  const autolinking = expo.autolinking ?? {};
  const android = autolinking.android ?? {};
  const presenti = Array.isArray(android.exclude) ? android.exclude : [];
  const mancanti = MODULI_DEV.filter(m => !presenti.includes(m));
  if (mancanti.length === 0) return pacchetto;
  return {
    ...pacchetto,
    expo: {
      ...expo,
      autolinking: {
        ...autolinking,
        android: { ...android, exclude: [...presenti, ...mancanti] },
      },
    },
  };
};

const scriviEsclusione = progetto => {
  const file = path.join(progetto, 'package.json');
  const prima = JSON.parse(fs.readFileSync(file, 'utf8'));
  const dopo = conEsclusione(prima);
  if (dopo !== prima)
    fs.writeFileSync(file, `${JSON.stringify(dopo, null, 2)}\n`);
  // Meglio una build fallita che un AAB col dev-client.
  const riletto = JSON.parse(fs.readFileSync(file, 'utf8'));
  const esclusi = riletto.expo?.autolinking?.android?.exclude ?? [];
  const assenti = MODULI_DEV.filter(m => !esclusi.includes(m));
  if (assenti.length > 0)
    throw new Error(
      `escludi-dev-client: non esclusi in package.json: ${assenti.join(', ')}`
    );
};

const escludiDevClient = config =>
  withDangerousMod(config, [
    'android',
    cfg => {
      if (PROFILI_STORE.includes(process.env.EAS_BUILD_PROFILE))
        scriviEsclusione(cfg.modRequest.projectRoot);
      return cfg;
    },
  ]);

module.exports = escludiDevClient;
module.exports.conEsclusione = conEsclusione;
module.exports.MODULI_DEV = MODULI_DEV;
