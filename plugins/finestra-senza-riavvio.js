// Pieghevole aperto o finestra ridimensionata senza riavviare l'app (C54 del contratto android-play).
//
// Perché: con target 36, Android 16 ignora il blocco in verticale (`orientation: 'portrait'`) sugli
// schermi ≥ 600 dp, quindi su tablet e pieghevoli la finestra cambia con l'app aperta. Il modello di
// Expo SDK 54 dichiara `keyboard|keyboardHidden|orientation|screenSize|screenLayout|uiMode` (AAB
// 23baf998: `configChanges=0x27b4`, letto con bundletool il 22/10): senza `smallestScreenSize`, quando
// cambia il lato corto Android distrugge e ricrea l'attività, e l'app riparte dalla Home perdendo la
// pagina aperta. Il modello ufficiale di React Native lo dichiara; la guida Android multi-finestra
// chiede «at least screenSize | smallestScreenSize | screenLayout | orientation».
//
// Effetto: React Native riceve il cambio come per la rotazione (`Dimensions` emette `change`) e le
// pagine si ridisegnano con la finestra nuova (`useThemeColors`, `PerfectText` e `PerfectContainer`
// la seguono). La prova vera è sul telefono, in C47.
const { AndroidConfig, withAndroidManifest } = require('expo/config-plugins');

const RICHIESTI = [
  'orientation',
  'screenSize',
  'smallestScreenSize',
  'screenLayout',
];

// Il valore di `android:configChanges` con le voci richieste in coda (stesso valore se ci sono già).
const conConfigChanges = valore => {
  const voci = (valore ?? '')
    .split('|')
    .map(v => v.trim())
    .filter(Boolean);
  const mancanti = RICHIESTI.filter(v => !voci.includes(v));
  return [...voci, ...mancanti].join('|');
};

const finestraSenzaRiavvio = config =>
  withAndroidManifest(config, cfg => {
    const attivita = AndroidConfig.Manifest.getMainActivityOrThrow(
      cfg.modResults
    );
    attivita.$['android:configChanges'] = conConfigChanges(
      attivita.$['android:configChanges']
    );
    return cfg;
  });

module.exports = finestraSenzaRiavvio;
module.exports.conConfigChanges = conConfigChanges;
