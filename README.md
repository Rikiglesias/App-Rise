# Rise Against Hunger Italia - App Mobile

App ufficiale di Rise Against Hunger Italia per iOS e Android, costruita con **Expo** e React Native.

## 🚀 Quick Start

### Prerequisiti

- Node.js (versione 18 o superiore)
- Expo CLI
- App Expo Go sul tuo dispositivo mobile

### Installazione e Avvio

1. **Clona il repository**

   ```bash
   # Il progetto è già nella directory corretta
   ```

2. **Installa le dipendenze**

   ```bash
   npm install
   ```

3. **Avvia il server di sviluppo**

   ```bash
   npx expo start
   ```

4. **Testa l'app sul tuo dispositivo**
   - Installa l'app **Expo Go** dal tuo store (iOS/Android)
   - Scannerizza il QR code mostrato nel terminale con la fotocamera (iOS) o con Expo Go (Android)

## 📱 Funzionalità Implementate

### Homepage

- **Design moderno e accattivante** con logo e branding Rise Against Hunger Italia
- **Menu principale** con 7 sezioni principali:
  - 🏗️ **Progetti** - Scopri i nostri progetti attivi
  - 🛍️ **Charity Shop** - Acquista prodotti solidali
  - 🎁 **Charity Gift Card** - Regala solidarietà
  - 📅 **Calendario** - Eventi e appuntamenti
  - 📱 **Seguici** - Social media e aggiornamenti
  - 📊 **Tracciabilità** - Segui l'impatto delle donazioni
  - 👥 **Chi Siamo** - La nostra mission e storia

### Caratteristiche Tecniche

- ✅ **TypeScript** per maggiore sicurezza del codice
- ✅ **React Navigation** per navigazione fluida
- ✅ **Design responsivo** per tutti i dispositivi
- ✅ **Animazioni e transizioni** per UX ottimale
- ✅ **Live reload** con Expo Go
- ✅ **Colori brandizzati** (#FF6B35 colore principale)

### Quality & Testing

- ✅ **Jest Testing** framework configurato
- ✅ **Pre-commit Hooks** con Husky
- ✅ **Lint-staged** per controlli automatici
- ✅ **ESLint + Prettier** per code quality
- ✅ **Markdown Linting** per documentazione

## 🏗️ Sistema di Deployment

### 🎯 **Deployment con Expo EAS**

**Development**: Expo (veloce, live reload)  
**Production**: Expo EAS Build (ufficiale, ottimizzato)

### ✅ **Deployment Configurato**

- **EAS Build** per iOS e Android
- **EAS Submit** per invio automatico agli store
- **Script PowerShell** per Windows
- **Script Bash** per macOS/Linux

### 📋 **File di Deployment**

```text
├── scripts/
│   ├── setup-deployment.ps1    # Setup script Windows
│   ├── setup-deployment.sh     # Setup script macOS/Linux
│   ├── deploy-ios.ps1          # Deploy iOS
│   ├── deploy-android.ps1      # Deploy Android
│   └── publish.sh              # Script deploy interattivo
├── eas.json                    # Configurazione EAS Build
└── docs/
    └── PUBLISHING_CHECKLIST.md # Guida pubblicazione
```

## 🛠️ Tecnologie Utilizzate

- **Expo** - Piattaforma di sviluppo e build React Native
- **React Native** - Framework mobile cross-platform
- **TypeScript** - Superset tipizzato di JavaScript
- **React Navigation** - Libreria di navigazione
- **EAS Build** - Servizio di build Expo
- **Jest** - Testing framework
- **Husky** - Pre-commit hooks per qualità codice

## 📂 Struttura del Progetto

```text
App Rise/
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.tsx     # Navigator principale
│   │   └── types.ts             # Tipi TypeScript per navigazione
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Schermata homepage
│   │   └── PlaceholderScreen.tsx # Componente per schermate future
│   └── __tests__/              # Test files
│       └── App.test.tsx        # Test di esempio
├── docs/                       # Documentazione
│   ├── DEPLOYMENT_GUIDE.md     # Guida deployment
│   ├── GITHUB_ACTIONS_SETUP.md # Setup CI/CD
│   ├── MIGRATION_TO_NATIVE.md  # Migrazione React Native
│   └── PUBLISHING_CHECKLIST.md # Checklist pubblicazione
├── scripts/                    # Script di automazione
│   ├── setup-deployment.ps1    # Setup Windows
│   ├── setup-deployment.sh     # Setup macOS/Linux
│   ├── deploy-ios.ps1          # Deploy iOS
│   └── deploy-android.ps1      # Deploy Android
├── .github/workflows/          # GitHub Actions CI/CD
├── ios/fastlane/              # iOS deployment config
├── android/fastlane/          # Android deployment config
├── assets/                    # Immagini e risorse
├── App.tsx                    # Entry point dell'app
├── app.json                   # Configurazione Expo
├── jest.config.js             # Configurazione testing
└── package.json               # Dipendenze del progetto
```

## 🎨 Design System

### Colori Principali

- **Primary Orange**: `#FF6B35` - Colore principale del brand
- **Secondary Colors**: Vari colori per differenziare le sezioni
- **Text Colors**: `#2C3E50` (dark), `#7F8C8D` (gray)
- **Background**: `#FAFAFA` (light gray)

### Typography

- **Titoli**: Font bold, dimensioni 24-32px
- **Sottotitoli**: Font semi-bold, dimensioni 16-18px
- **Corpo**: Font regular, dimensioni 14-16px

## 🔄 Workflow di Sviluppo

### Development (Quotidiano)

```bash
# Sviluppo con live reload
npx expo start

# Test su dispositivo reale con Expo Go
# Scannerizza QR code e sviluppa in tempo reale

# Quality checks
npm run test              # Esegui test
npm run test:watch        # Test in modalità watch
npm run pre-modifiche     # TypeScript + ESLint + controlli qualità
npm run post-modifiche    # Verifica post-sviluppo
```

### Production Release

```bash
# Aggiorna versione in app.json
# Commit delle modifiche
git add .
git commit -m "✨ New features ready"
git push origin main

# Build e deploy con EAS
eas build --platform all --profile production-store
eas submit --platform all --profile production
```

## 💰 Costi

| Servizio            | Costo          | Nota                  |
| ------------------- | -------------- | --------------------- |
| **Apple Developer** | $99/anno       | Richiesto per iOS     |
| **Google Play**     | $25 una tantum | Richiesto per Android |
| **Expo Account**    | **Gratuito**   | Account base          |
| **EAS Build**       | **Gratuito**   | Tier gratuito         |

### 💡 **Totale: $124 primo anno, $99/anno successivi**

Perfetto per un'organizzazione no-profit come Rise Against Hunger Italia!

## 📋 Setup Publishing

### Quick Setup

```bash
# Windows
.\scripts\setup-deployment.ps1

# macOS/Linux
./scripts/setup-deployment.sh
```

### Prossimi Passi

1. **Account Expo**: Gratuito su expo.dev
2. **Apple Developer**: $99/anno per iOS
3. **Google Play Console**: $25 una tantum per Android
4. **Deploy**: `eas build --platform all`

📖 **Guida completa**: [PUBLISHING_CHECKLIST.md](docs/PUBLISHING_CHECKLIST.md)

## 📱 Compatibilità

- ✅ **iOS** 13.0+
- ✅ **Android** API 21+ (Android 5.0+)
- ✅ **Web** (tramite Expo Web)

## 🤝 Sviluppo

### Contribuire

1. Crea un branch per ogni funzionalità
2. Usa TypeScript per tutti i componenti
3. Mantieni il design system coerente
4. Testa su dispositivi reali con Expo Go
5. Esegui `npm run pre-modifiche` prima di ogni commit

### Architettura

- **Development**: Expo managed workflow con live reload
- **Production**: EAS Build per generazione APK/IPA ottimizzati
- **Testing**: Jest + React Native Testing Library

## 📞 Support

- **Expo Documentation**: [docs.expo.dev](https://docs.expo.dev)
- **EAS Build**: [docs.expo.dev/build](https://docs.expo.dev/build)
- **Publishing Guide**: [PUBLISHING_CHECKLIST.md](docs/PUBLISHING_CHECKLIST.md)
- **React Native**: [reactnative.dev](https://reactnative.dev)

---

**Rise Against Hunger Italia** - Insieme possiamo fare la differenza! 🍽️❤️

### 🎉 **Progetto Expo Ready!**

✅ **Development**: Expo con live reload  
✅ **Production**: EAS Build per iOS e Android  
✅ **Deployment**: Scripts configurati  
✅ **Costi**: $124/anno per associazione no-profit

🚀 **Perfetto per un'organizzazione benefica!**
