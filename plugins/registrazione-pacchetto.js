// Prova di possesso della chiave per la «Verifica dello sviluppatore Android» (Play Console, 22/10).
//
// Perché: ogni pacchetto va registrato all'identità verificata dello sviluppatore, e finché non lo è
// Play Console non manda l'app in revisione («Nome del pacchetto non registrato»). Per registrare la
// chiave di firma `15:59:10:…:0A:DB` Play chiede un APK firmato con quella chiave che contenga
// `assets/adi-registration.properties` con lo snippet dell'account. La chiave la tiene Google (Play
// App Signing): l'APK giusto è l'«APK universale firmato» che Play genera dall'AAB caricato, quindi
// il file deve stare nell'app vera. Lo snippet identifica l'account, non è un segreto: Google lo fa
// mettere nell'APK, che chiunque può aprire. Serve di nuovo solo per aggiungere altre chiavi.
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

const FILE = 'adi-registration.properties';
const SNIPPET = 'DTUFRWY5BYSMMAAAAAAAAAAAAA';

// Scrive il file negli asset del modulo `app` (solo lo snippet, come chiede Play Console).
const scriviRegistrazione = async radiceAndroid => {
  const cartella = path.join(radiceAndroid, 'app', 'src', 'main', 'assets');
  await fs.promises.mkdir(cartella, { recursive: true });
  await fs.promises.writeFile(path.join(cartella, FILE), SNIPPET);
};

const registrazionePacchetto = config =>
  withDangerousMod(config, [
    'android',
    async cfg => {
      await scriviRegistrazione(cfg.modRequest.platformProjectRoot);
      return cfg;
    },
  ]);

module.exports = registrazionePacchetto;
module.exports.scriviRegistrazione = scriviRegistrazione;
module.exports.FILE = FILE;
module.exports.SNIPPET = SNIPPET;
