# 🚀 **GUIDA COMPLETA: PUBLISHING & DEPLOYMENT**

## Rise Against Hunger Italia - App Store Submission

### **📋 PANORAMICA**

Questa guida ti accompagna attraverso il processo completo per pubblicare
l'app **Rise Against Hunger Italia** su Google Play Store e Apple App Store
utilizzando **Expo EAS Build**.

---

## 🎯 **OVERVIEW GENERALE**

### **🛠️ STRUMENTI NECESSARI**

- **Expo EAS Build** - Sistema di build cloud professionale
- **Google Play Console** - Per distribuzione Android ($25 una tantum)
- **Apple Developer Program** - Per distribuzione iOS ($99/anno)
- **EAS CLI** - Command line interface per automazione

### **📱 RISULTATO FINALE**

- **Android**: File `.aab` (Android App Bundle) per Google Play Store
- **iOS**: File `.ipa` (iOS App Archive) per Apple App Store
- **Deployment automatizzato** con pipeline CI/CD
- **App live** su entrambi gli store

---

## 📅 **TIMELINE DETTAGLIATA (3-5 GIORNI)**

### **🔵 GIORNO 1: SETUP INIZIALE E CONFIGURAZIONE**

#### **1.1 Setup Account e Strumenti**

```bash
# Installa EAS CLI globalmente (versione latest)
npm install -g @expo/cli@latest

# Verifica installazione
npx expo --version

# Login al tuo account Expo
npx expo login

# Inizializza configurazione EAS Build per il progetto
npx eas build:configure
```

#### **1.2 Configurazione eas.json**

Crea/aggiorna il file `eas.json` nella root del progetto:

```json
{
  "cli": {
    "version": ">= 6.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "android": {
        "buildType": "aab",
        "gradleCommand": ":app:bundleRelease"
      },
      "ios": {
        "autoIncrement": true,
        "bundler": "4.3.4"
      },
      "env": {
        "ENVIRONMENT": "production"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./android-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-team-id"
      }
    }
  }
}
```

#### **1.3 Configurazione App (app.json/app.config.js)**

Assicurati che la configurazione dell'app sia production-ready:

```json
{
  "expo": {
    "name": "Rise Against Hunger Italia",
    "slug": "rise-against-hunger-italia",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "android": {
      "package": "org.riseagainsthunger.italia",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ],
      "networkSecurityConfig": "./android-network-security-config.xml"
    },
    "ios": {
      "bundleIdentifier": "org.riseagainsthunger.italia",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": false,
          "NSExceptionDomains": {
            "riseagainsthunger.org": {
              "NSExceptionAllowsInsecureHTTPLoads": false,
              "NSExceptionMinimumTLSVersion": "1.2",
              "NSIncludesSubdomains": true
            }
          }
        }
      }
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": ["expo-secure-store"],
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

---

### **🟡 GIORNO 2: STORE ASSETS E METADATA**

#### **2.1 App Icons (Obbligatori)**

**Formati richiesti:**

#### **Android:**

- **Play Store**: 512x512px (alta risoluzione)
- **App**: 48x48, 72x72, 96x96, 144x144, 192x192px
- **Adaptive Icon**: 108x108dp (foreground + background)

#### **iOS:**

- **App Store**: 1024x1024px (senza angoli arrotondati)
- **App**: 20x20, 29x29, 40x40, 58x58, 60x60, 80x80, 87x87, 120x120, 180x180px
- **iPad**: 76x76, 152x152px

#### **Tool consigliati:**

- **Figma/Sketch** per design
- **Icon Kitchen** per generazione automatica
- **App Icon Generator** online

#### **2.2 Screenshots Store**

#### **Android (Google Play):**

- **Phone**: Min 320dp, Max 3840dp larghezza
- **Tablet**: Min 600dp larghezza
- **Formati**: JPEG o PNG (24-bit)
- **Quantità**: 2-8 screenshot per tipo

#### **iOS (App Store):**

- **iPhone**: 6.5" (1242x2688), 6.7" (1290x2796)
- **iPad**: 12.9" (2048x2732), 11" (1668x2388)
- **Formato**: PNG, JPEG
- **Quantità**: 1-10 screenshot per device

#### **2.3 Store Metadata**

#### **Informazioni comuni:**

- **Nome app**: "Rise Against Hunger Italia" (30 caratteri)
- **Sottotitolo**: "Combatti la fame nel mondo" (30 caratteri iOS)
- **Descrizione breve**: 80 caratteri (Android)
- **Descrizione completa**: Max 4000 caratteri
- **Keywords**: "charity, donation, hunger, NGO, volontariato, beneficenza"
- **Categoria**:
  - Android: Social, Lifestyle
  - iOS: Social Networking, Lifestyle

#### **Esempio descrizione:**

```text
🍽️ UNISCITI ALLA LOTTA CONTRO LA FAME

Rise Against Hunger Italia è l'app ufficiale dell'organizzazione no-profit che combatte la fame nel mondo attraverso donazioni, volontariato e progetti di sviluppo sostenibile.

🌟 CARATTERISTICHE PRINCIPALI:
• Donazioni sicure e trasparenti
• Tracking dell'impatto delle tue contribuzioni
• Mappa interattiva dei progetti globali
• Opportunità di volontariato locale
• Statistiche in tempo reale sui progressi

🎯 IL TUO IMPATTO:
Ogni donazione aiuta a fornire pasti nutrienti a bambini e famiglie in difficoltà. Visualizza in tempo reale quante persone hai aiutato e segui i progressi dei progetti che supporti.

🔒 SICUREZZA E TRASPARENZA:
• Pagamenti sicuri con crittografia enterprise
• Tracciabilità completa delle donazioni
• Report dettagliati sull'utilizzo dei fondi
• Conformità alle normative internazionali

Scarica ora e inizia a fare la differenza! 🌍
```

---

### **🟢 GIORNO 3: CERTIFICATI E PROFILI DI PROVISIONING**

#### **3.1 Setup Android (Google Play)**

#### **Step 1: Genera Upload Key**

```bash
# Configura credenziali Android automaticamente
npx eas credentials:configure --platform android

# Alternative: genera manualmente keystore
keytool -genkeypair -v -storetype PKCS12 -keystore upload-keystore.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

#### **Step 2: Upload su EAS**

```bash
# Upload certificato su EAS (se generato manualmente)
npx eas credentials:upload --platform android
```

#### **3.2 Setup iOS (Apple Developer)**

**Prerequisiti:**

- Account Apple Developer attivo ($99/anno)
- Accesso ad App Store Connect

**Configurazione automatica:**

```bash
# EAS gestisce automaticamente certificati e provisioning profiles
npx eas credentials:configure --platform ios

# Login Apple Developer (se richiesto)
npx eas credentials:sync --platform ios
```

**Configurazione manuale (se necessaria):**

1. **Development Certificate**: Per testing locale
2. **Distribution Certificate**: Per App Store
3. **Provisioning Profiles**: App ID + Certificate + Devices

#### **3.3 Environment Variables Production**

Crea `.env.production`:

```bash
# API Configuration
API_BASE_URL=https://api.riseagainsthunger.org
ENABLE_FLIPPER=false
ENABLE_PERFORMANCE_MONITORING=true
LOG_LEVEL=error

# EAS Project
EAS_PROJECT_ID=your-eas-project-id

# Security
ENABLE_NETWORK_SECURITY=true
ENABLE_SSL_PINNING=true
```

---

### **🔴 GIORNO 4: BUILD PRODUCTION**

#### **4.1 Pre-Build Checklist**

**Quality Assurance:**

```bash
# Verifica zero-tolerance system
npm run conta-problemi

# Risultato atteso:
# ✅ 0 errori TypeScript
# ✅ 0 problemi ESLint
# ✅ 0 errori Prettier
# ✅ 214 test passanti
# ✅ 0 problemi totali
```

**Performance Check:**

```bash
# Test su device reali
npx expo start --tunnel

# Verifica:
# - App si avvia < 3 secondi
# - Navigazione fluida
# - Nessun memory leak
# - Network requests veloci
```

#### **4.2 Build Commands**

**Build di Preview (Test):**

```bash
# Test build Android (APK)
npx eas build --platform android --profile preview

# Test build iOS (Simulator)
npx eas build --platform ios --profile preview
```

**Build Production:**

```bash
# Build Android per Play Store (AAB)
npx eas build --platform android --profile production

# Build iOS per App Store (IPA)
npx eas build --platform ios --profile production

# Build entrambe le piattaforme
npx eas build --platform all --profile production
```

**Monitoraggio Build:**

```bash
# Lista build recenti
npx eas build:list --limit 10

# Dettagli build specifica
npx eas build:view [BUILD_ID]

# Log dettagliati
npx eas build:log [BUILD_ID]
```

#### **4.3 Testing Builds**

**Installazione Test:**

```bash
# Genera link installazione
npx eas build --platform android --profile preview

# QR code per installazione diretta
# Link condivisibile per team testing
```

**Beta Testing:**

- **Android**: Google Play Internal Testing
- **iOS**: TestFlight (automatico con EAS)

---

### **🟣 GIORNO 5: STORE SUBMISSION**

#### **5.1 Google Play Console Setup**

#### **Step 1: Crea App**

1. Vai su [Google Play Console](https://play.google.com/console)
2. "Crea app" → "Rise Against Hunger Italia"
3. Seleziona "Gratuita" e categoria "Social"

#### **Step 2: Upload AAB**

```bash
# Submit automatico con EAS
npx eas submit --platform android --latest

# Alternative: upload manuale
# Download .aab da EAS dashboard
# Upload in Play Console → Release → Production
```

#### **Step 3: Store Listing**

- **Descrizione breve**: 80 caratteri max
- **Descrizione completa**: Usa template sopra
- **Screenshots**: Phone + Tablet (2-8 per tipo)
- **Icona**: 512x512px alta risoluzione

#### **Step 4: Content Rating**

- Questionario IARC per classificazione età
- Per app beneficenza: tipicamente "Tutti"

#### **Step 5: Pricing & Distribution**

- **Prezzo**: Gratuito
- **Paesi**: Tutti (o specifici per NGO)
- **Device categories**: Phone + Tablet

#### **5.2 App Store Connect Setup**

#### **Step 1: Crea App Store Connect**

1. Vai su [App Store Connect](https://appstoreconnect.apple.com)
2. "My Apps" → "+" → "New App"
3. Nome: "Rise Against Hunger Italia"
4. Bundle ID: org.riseagainsthunger.italia

#### **Step 2: Upload IPA**

```bash
# Submit automatico con EAS
npx eas submit --platform ios --latest

# Alternative: Transporter app
# Download .ipa da EAS dashboard
# Upload con Apple Transporter
```

#### **Step 3: App Information**

- **Name**: Rise Against Hunger Italia
- **Subtitle**: Combatti la fame nel mondo
- **Category**: Social Networking
- **Content Rights**: Non contiene pubblicità di terze parti

#### **Step 4: Version Information**

- **Version**: 1.0.0
- **Copyright**: © 2025 Rise Against Hunger Italia
- **Description**: Usa template dettagliato sopra
- **Keywords**: charity,donation,hunger,NGO,volunteer

#### **Step 5: App Review Information**

```text
Contact Information:
Email: app@riseagainsthunger.italia
Phone: +39 [numero]
URL: https://riseagainsthunger.org

Notes for Review:
Questa app è per un'organizzazione no-profit che combatte la fame nel mondo.
L'app permette donazioni sicure e visualizzazione dell'impatto dei progetti.
Non sono richiesti account speciali per il testing.

Demo Account: Non necessario (app pubblica)
```

---

## 💰 **ANALISI COSTI COMPLETA**

### **📊 Breakdown Costi Iniziali**

- **Google Play Console**: $25 (una tantum)
- **Apple Developer Program**: $99/anno
- **EAS Build**: Gratuito (1000 build/mese)
- **Domain/SSL**: $10-20/anno (opzionale)

### **💸 Costi Ricorrenti**

- **Apple Developer**: $99/anno
- **EAS Build**: $0 (piano gratuito sufficiente)
- **Hosting API**: Variabile ($0-50/mese)
- **Analytics**: Gratuito (Expo Analytics)

### **💡 Ottimizzazioni Risparmio**

- **Apple Developer Non-Profit**: Sconto possibile per NGO
- **EAS Build Optimization**: Riutilizza cache per ridurre build
- **Beta Testing**: Usa TestFlight/Play Console (gratuiti)
- **Analytics**: Expo Analytics + Firebase (tier gratuiti)

---

## 🚨 **TROUBLESHOOTING COMUNI**

### **❌ Build Failures**

#### **Errore: Metro Cache**

```bash
# Soluzione: Reset cache completo
npx expo start --clear
rm -rf node_modules && npm install
```

#### **Errore: TypeScript**

```bash
# Verifica errori
npx tsc --noEmit

# Fix automatico dipendenze
npm install --legacy-peer-deps
```

#### **Errore: Android Gradle**

```text
Soluzione: Controlla eas.json
- buildType: "aab" per production
- gradleCommand: ":app:bundleRelease"
```

### **❌ Certificate Issues**

#### **iOS Certificate Problems**

```bash
# Reset certificates iOS
npx eas credentials:reset --platform ios

# Rigenera automaticamente
npx eas credentials:configure --platform ios
```

#### **Android Keystore Issues**

```bash
# Reset keystore Android
npx eas credentials:reset --platform android

# Upload nuovo keystore
npx eas credentials:upload --platform android
```

### **❌ Store Rejections**

**Google Play Common Issues:**

- **Privacy Policy**: URL richiesta per app con permissions
- **Target SDK**: Deve essere aggiornato (API 34+)
- **Content Rating**: IARC rating mancante

**App Store Common Issues:**

- **App Review Guidelines**: 2.1, 4.2, 5.1 più comuni
- **Export Compliance**: Info crittografia richieste
- **Metadata Rejection**: Screenshot non corrispondenti

**Soluzioni:**

```bash
# Update dependencies
npx expo doctor

# Check compliance
npx expo install --fix

# Review guidelines:
# Google: https://play.google.com/about/developer-policy/
# Apple: https://developer.apple.com/app-store/review/guidelines/
```

---

## 🎯 **CHECKLIST FINALE PRE-SUBMISSION**

### **📱 Technical Checklist**

- [ ] ✅ Zero errori TypeScript
- [ ] ✅ Zero warning ESLint
- [ ] ✅ Tutti test passano (214/215)
- [ ] ✅ App testata su device reali
- [ ] ✅ Performance ottimizzate
- [ ] ✅ Security implementata (SSL pinning, secure storage)
- [ ] ✅ Network security configurato
- [ ] ✅ Error tracking attivo

### **🎨 Assets Checklist**

- [ ] 📱 App icon (tutti i formati)
- [ ] 📸 Screenshots (phone + tablet)
- [ ] 📝 Store descriptions (IT + EN)
- [ ] 🎯 Keywords ottimizzate
- [ ] 🏷️ Metadata complete

### **🔐 Certificates Checklist**

- [ ] 🤖 Android upload key configurato
- [ ] 🍎 iOS distribution certificate
- [ ] 📋 Provisioning profiles
- [ ] 🔑 EAS credentials sincronizzate

### **📋 Store Accounts Checklist**

- [ ] 🏪 Google Play Console setup
- [ ] 🍎 App Store Connect setup
- [ ] 💳 Payment methods configured
- [ ] 📧 Contact information complete

---

## 🚀 **PROSSIMI STEP RACCOMANDATI**

### **1. 📝 Preparazione Immediata**

```bash
# Verifica accounts
- Crea Google Play Console account
- Registra Apple Developer Program
- Setup Expo account (gratuito)

# Prepara assets
- Design app icons professionali
- Crea screenshots marketing efficaci
- Scrivi descrizioni store ottimizzate
```

### **2. 🔧 Setup Tecnico**

```bash
# Configura EAS Build
npx eas build:configure

# Test build preview
npx eas build --platform all --profile preview

# Setup certificati
npx eas credentials:configure
```

### **3. 🎯 Go-Live Strategy**

```bash
# Soft launch (paesi specifici)
# Beta testing esteso
# Marketing pre-launch
# Press release NGO
```

---

## 📞 **SUPPORTO E RISORSE**

### **📚 Documentazione Ufficiale**

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Google Play Console](https://support.google.com/googleplay/android-developer)
- [App Store Connect](https://developer.apple.com/app-store-connect/)

### **🆘 Community Support**

- [Expo Discord](https://chat.expo.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)
- [GitHub Issues](https://github.com/expo/expo/issues)

### **🎯 Success Metrics**

- **Time to Market**: 3-5 giorni
- **Build Success Rate**: >95%
- **Store Approval**: 2-7 giorni
- **User Acquisition**: NGO network + organic

---

## 🌍 Ready to make a difference with Rise Against Hunger Italia! 🍽️

### Ultimo aggiornamento: 22 Dicembre 2025
