# 🚀 Guida Deployment Rise Against Hunger Italia

Il progetto usa **Expo SDK 54 (managed) + EAS** per build, submit e aggiornamenti
Over-the-Air. Niente Fastlane, niente cartelle native `ios/`/`android/` committate, niente
keystore gestiti a mano: la firma e il provisioning sono gestiti da EAS.

## 🎯 Panoramica

| Operazione | Strumento | Comando base |
| --- | --- | --- |
| Build store (iOS/Android) | EAS Build | `eas build --profile <profile>` |
| Pubblicazione store | EAS Submit | `eas submit --platform <ios\|android> --latest` |
| Aggiornamento OTA (JS) | EAS Update | `eas update --branch production` |

La differenza chiave:

- **EAS Build + Submit** → serve quando cambia il codice nativo (nuova dipendenza con
  modulo nativo, bump `app.config.js`, nuova versione binaria). Produce un nuovo binario
  da caricare su App Store / Play Store.
- **EAS Update (OTA)** → serve quando cambia solo il bundle JS/asset. L'aggiornamento
  arriva agli utenti al prossimo avvio dell'app, senza passare dagli store.

## 📦 Profili EAS (`eas.json`)

I profili di build sono definiti in `eas.json`. Quelli rilevanti:

| Profilo | Distribuzione | Channel | Note |
| --- | --- | --- | --- |
| `development` | internal | development | Dev client (`developmentClient: true`), `autoIncrement` |
| `preview` | internal | preview | iOS simulator, Android APK — test interni |
| `preview-device` | internal | preview | Build embedded su device reale (`ios.simulator: false`) |
| `production` | store | production | APK Android, `NODE_ENV=production`, Node 20.17.0 |
| `production-store` | store | production | Estende `production`, Android **AAB** (`app-bundle`) per Play Store |

> Per la pubblicazione sugli store usa **`production-store`**: produce l'AAB richiesto da
> Google Play e mantiene la config di firma store di `production`.

I dati di submit (Apple ID, `ascAppId`, team, service account Google) sono nella sezione
`submit` di `eas.json`.

## 🛠️ Comandi npm

Gli script in `package.json` avvolgono i comandi EAS:

```bash
# Build
npm run build:ios          # eas build --platform ios
npm run build:android      # eas build --platform android
npm run build:all          # eas build --platform all
npm run preview            # eas build --profile preview

# Submit agli store
npm run submit:ios         # eas submit --platform ios
npm run submit:android     # eas submit --platform android
npm run submit:all         # eas submit --platform all

# Deploy completo (build + submit) via helper PowerShell
npm run deploy:ios         # pwsh ./scripts/deploy-ios.ps1
npm run deploy:android     # pwsh ./scripts/deploy-android.ps1

# OTA Update
npm run update:production "messaggio"   # eas update --branch production --message
npm run update:gui                      # pwsh ./scripts/update-ota.ps1 (menu interattivo)
```

## 🤝 Helper PowerShell

Tre script in `scripts/` semplificano le operazioni ricorrenti:

- **`scripts/deploy-ios.ps1`** — verifica/installa la EAS CLI, fa `eas login` e lancia
  `eas build --platform ios --profile production-store`.
- **`scripts/deploy-android.ps1`** — build + submit Android con `production-store`.
  Parametri: `-Profile <nome>` (default `production-store`), `-SkipSubmit` (solo build),
  `-SkipBuild` (solo submit dell'ultima build). Verifica il login EAS e il service account
  Google prima del submit.
- **`scripts/update-ota.ps1`** — menu interattivo per pubblicare un OTA. Esegue prima
  `npm run pre-modifiche` (quality gate bloccante), poi `eas update --branch <…>` per
  development / preview / production / hotfix, oppure `eas update --auto`.

## 🔑 Prerequisiti store (una tantum)

### 🍎 Apple

1. Apple Developer Program ($99/anno) su [developer.apple.com](https://developer.apple.com).
2. App in App Store Connect con bundle id e nome corretti. L'`ascAppId` è già configurato
   in `eas.json` (`submit.production.ios`).

### 🤖 Google

1. Account Google Play Console ($25 una tantum) su
   [play.google.com/console](https://play.google.com/console).
2. Service account JSON salvato come `./google-service-account.json` (referenziato da
   `eas.json` → `submit.production.android.serviceAccountKeyPath`).

> Credenziali di firma iOS/Android: gestite da EAS (`eas credentials`). Non serve generare
> manualmente keystore o provisioning profile.

## 🔄 Flussi di rilascio

### A) Nuovo binario sugli store (CI)

Il flusso automatico passa da GitHub Actions (`.github/workflows/optimized-ci-cd.yml`).
Aggiungi il tag al messaggio di commit su `master`:

```bash
git commit -m "feat: nuova feature [build]"   # build iOS + Android
git commit -m "fix: patch iOS [build ios]"     # solo iOS
git commit -m "fix: patch Android [build android]"  # solo Android
```

La CI esegue i quality check, poi `eas build --profile production-store --wait` e, su
`master`, `eas submit --latest`. Dettagli in [docs/ci-cd/github-actions.md](../ci-cd/github-actions.md).

### B) Build/submit manuale (locale)

```bash
# Build + submit completo
npm run deploy:android          # build production-store + submit Play Store
npm run deploy:ios              # build production-store iOS

# Oppure granulare
eas build --profile production-store --platform all --wait
eas submit --platform ios --latest
eas submit --platform android --latest
```

### C) Aggiornamento OTA (solo JS/asset)

Per modifiche che non toccano il nativo, pubblica un update sul branch EAS `production`:

```bash
# Tramite commit (CI): vedi workflow OTA
git commit -m "fix: copy aggiornata [ota]"

# Manuale
npm run update:production "Fix copy schermata donazioni"

# Interattivo
npm run update:gui
```

L'app legge gli update da `runtimeVersion: { policy: 'appVersion' }` (vedi `app.config.js`):
un OTA è compatibile solo con i binari che condividono la stessa `version`. Quando cambi
codice nativo o bumpi la versione, serve un nuovo binario (flusso A/B), non un OTA.

## 🔐 Code Signing degli update (opzionale, consigliato pre-lancio)

EAS Update supporta la firma del manifest. `app.config.js` abilita il code signing solo se
è presente la variabile `CODE_SIGNING_CERTIFICATE`:

```bash
npx expo-updates codesigning:generate \
  --key-output-directory ./certs \
  --certificate-output-directory ./certs \
  --certificate-validity-duration-years 10 \
  --certificate-common-name 'Rise Against Hunger Italia'
```

I file in `certs/` sono esclusi dal versionamento (`.gitignore`): conserva la chiave privata
in modo sicuro e carica le variabili `CODE_SIGNING_*` nei secrets CI.

## 🩺 Diagnostica

```bash
npm run doctor              # npx expo-doctor
eas build:list --limit 5   # ultime build
eas update:list --branch production --limit 5
```

Monitoraggio build/update:
[expo.dev/accounts/rikiglesias/projects/rise-against-hunger-italia](https://expo.dev/accounts/rikiglesias/projects/rise-against-hunger-italia).

### Privacy Labels (iOS) e Data Safety (Android)

- iOS: compila il Privacy Manifest per le SDK terze parti (es. Sentry). Se non tracci utenti,
  le sezioni restano minime.
- Android: aggiorna la sezione "Data Safety" su Play Console coerente con i permessi e con il
  flusso di donazioni esterne (nessun pagamento in-app).

## 🚨 Troubleshooting

| Sintomo | Cosa controllare |
| --- | --- |
| Build fallita | Log EAS (`eas build:list`), `npm run doctor`, secret `EXPO_TOKEN` in CI |
| Submit iOS bloccato | `ascAppId`/`appleTeamId` in `eas.json`, processing su App Store Connect |
| Submit Android skippato | Presenza di `./google-service-account.json` |
| OTA non arriva agli utenti | `version` del binario = quella dell'update (`runtimeVersion` `appVersion`) |
