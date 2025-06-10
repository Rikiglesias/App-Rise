# 🚀 Guida Deployment Rise Against Hunger Italia

## 🎯 Setup Completato

Il tuo progetto è ora configurato per il **deployment automatico gratuito** su iOS App Store e Google Play Store usando
GitHub Actions.

## 📋 Cosa È Stato Configurato

### ✅ GitHub Actions Workflows

- **iOS Deploy**: `.github/workflows/ios-deploy.yml`
- **Android Deploy**: `.github/workflows/android-deploy.yml`
- **Trigger**: Push su `main` branch o tag `v*`

### ✅ Fastlane Configuration

- **iOS**: `ios/fastlane/Fastfile` + `ios/Gemfile`
- **Android**: `android/fastlane/Fastfile` + `android/Gemfile`
- **Automazione**: Build, firma, e upload automatici

### ✅ Deploy Scripts

- **setup-deployment.sh**: Script setup completo
- **deploy-ios.sh**: Deploy iOS locale
- **deploy-android.sh**: Deploy Android locale

## 🔑 Prossimi Passi per Publishing

### Step 1: Account Developer

#### 🍎 Apple Developer Account

1. Vai su [developer.apple.com](https://developer.apple.com)
2. Iscriviti al **Apple Developer Program** ($99/anno)
3. Crea una nuova app in **App Store Connect**:
   - Bundle ID: `org.riseagainsthunger.italia`
   - Nome: "Rise Against Hunger Italia"

#### 🤖 Google Play Developer Account

1. Vai su [play.google.com/console](https://play.google.com/console)
2. Registrati come sviluppatore ($25 una tantum)
3. Crea una nuova app:
   - Package name: `org.riseagainsthunger.italia`
   - Nome: "Rise Against Hunger Italia"

### Step 2: Certificati e Signing

#### 🍎 iOS Signing

```bash
# Genera App Store Connect API Key
# 1. Vai su App Store Connect → Users and Access → Keys
# 2. Crea nuova API Key con ruolo "App Manager"
# 3. Scarica il file .p8
```

#### 🤖 Android Signing

```bash
# Genera keystore per signing
keytool -genkey -v -keystore release.keystore -alias rise-against-hunger -keyalg RSA -keysize 2048 -validity 10000

# Genera Google Play Service Account
# 1. Vai su Google Cloud Console
# 2. Crea service account per Google Play
# 3. Scarica il JSON key
```

### Step 3: GitHub Secrets Configuration

Vai su **GitHub Repository → Settings → Secrets and variables → Actions**

#### iOS Secrets

```bash
APP_STORE_CONNECT_API_KEY = [contenuto del file .p8 in base64]
APP_STORE_CONNECT_API_KEY_ID = [ID della API key]
APP_STORE_CONNECT_ISSUER_ID = [Issuer ID da App Store Connect]
```

#### Android Secrets

```bash
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON = [contenuto del file JSON]
ANDROID_KEYSTORE_FILE = [file keystore in base64]
ANDROID_KEYSTORE_PASSWORD = [password keystore]
ANDROID_KEY_ALIAS = [alias chiave]
ANDROID_KEY_PASSWORD = [password chiave]
```

### Step 4: Primo Deploy

#### Metodo 1: Tag Release (Automatico)

```bash
# Crea tag e push
git add .
git commit -m "🚀 Ready for first release"
git tag v1.0.0
git push origin main --tags

# GitHub Actions farà automaticamente:
# 1. Build iOS → App Store Connect
# 2. Build Android → Google Play Console
```

#### Metodo 2: Deploy Locale

```bash
# Genera progetti native
npx expo run:ios --no-build-cache --no-install
npx expo run:android --no-build-cache --no-install

# Deploy iOS
./deploy-ios.sh

# Deploy Android
./deploy-android.sh
```

## 🔄 Workflow Quotidiano

### Development (Non Cambia!)

```bash
# Per sviluppo continua a usare Expo
npx expo start

# Testa con Expo Go come sempre
```

### Production Releases

```bash
# Aggiorna versione in app.json
# Commit changes
git add .
git commit -m "✨ Add new features"

# Create release
git tag v1.0.1
git push origin main --tags

# GitHub Actions deploy automaticamente! 🚀
```

## 💰 Costi Finali

| Servizio | Costo | Frequenza |
|----------|-------|-----------|
| **Apple Developer** | $99 | Annuale |
| **Google Play** | $25 | Una tantum |
| **GitHub Actions** | $0 | Gratuito (2000 min/mese) |
| **Fastlane** | $0 | Gratuito |
| **Total Year 1** | **$124** | vs $472-1312 con Expo EAS |
| **Total Year 2+** | **$99** | vs $348-1188 con Expo EAS |

### 💡 Risparmio per Rise Against Hunger

- **Anno 1**: $348-1188 risparmiati
- **5 anni**: $1740-5320 risparmiati
- **Budget extra per beneficenza**: 🎯

## 🚨 Troubleshooting

### Build Fails

1. Controlla GitHub Actions logs
2. Verifica secrets configurati
3. Controlla certificati scaduti

### iOS Issues

```bash
# Reset certificati
cd ios
bundle exec fastlane match nuke development
bundle exec fastlane match nuke distribution
```

### Android Issues

```bash
# Reset build
cd android
./gradlew clean
```

## 📞 Support

- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)
- **Fastlane**: [docs.fastlane.tools](https://docs.fastlane.tools)
- **Expo**: [docs.expo.dev](https://docs.expo.dev)

## 🎉 Congratulazioni

Hai ora un sistema di deployment **professionale**, **gratuito** e **automatizzato**!

**Development**: Expo (veloce e facile)  
**Production**: GitHub Actions (gratuito e potente)

🎯 **Perfetto per Rise Against Hunger Italia!**
