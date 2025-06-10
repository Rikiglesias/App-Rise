# Rise Against Hunger Italia - App Mobile

App ufficiale di Rise Against Hunger Italia per iOS e Android, costruita con React Native ed Expo.

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

### 🎯 **Strategia Ibrida Ottimizzata**

**Development**: Expo (veloce, live reload)  
**Production**: GitHub Actions + Fastlane (gratuito, professionale)

### ✅ **Deployment Automatico Configurato**

- **GitHub Actions** workflows per iOS e Android
- **Fastlane** scripts per build e upload automatici
- **Deploy automatico** su git tag (es. `v1.0.0`)
- **Costo totale**: $124/anno (vs $348-1188 con Expo EAS)

### 📋 **File di Deployment**

```text
├── .github/workflows/
│   ├── ios-deploy.yml          # Auto-deploy iOS
│   └── android-deploy.yml      # Auto-deploy Android
├── ios/fastlane/
│   ├── Fastfile                # iOS build script
│   └── Gemfile                 # Dependencies
├── android/fastlane/
│   ├── Fastfile                # Android build script
│   └── Gemfile                 # Dependencies
├── scripts/
│   ├── setup-deployment.ps1    # Setup script Windows
│   ├── setup-deployment.sh     # Setup script macOS/Linux
│   ├── deploy-ios.ps1          # Deploy iOS locale
│   └── deploy-android.ps1      # Deploy Android locale
└── docs/
    └── DEPLOYMENT_GUIDE.md     # Guida completa
```

## 🛠️ Tecnologie Utilizzate

- **React Native** - Framework mobile cross-platform
- **Expo** - Piattaforma di sviluppo (solo development)
- **TypeScript** - Superset tipizzato di JavaScript
- **React Navigation** - Libreria di navigazione
- **GitHub Actions** - CI/CD gratuito
- **Fastlane** - Automazione build e deploy
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
npm run quality-check     # TypeScript + ESLint + Markdown
npm run quality-fix       # Fix automatico problemi
```

### Production Release

```bash
# Aggiorna versione in app.json
# Commit e crea tag
git add .
git commit -m "✨ New features ready"
git tag v1.0.1
git push origin main --tags

# GitHub Actions automaticamente:
# 1. Build iOS → App Store Connect
# 2. Build Android → Google Play Console
```

## 💰 Costi e Risparmio

| Servizio             | Costo          | Nota                  |
| -------------------- | -------------- | --------------------- |
| **Apple Developer**  | $99/anno       | Richiesto per iOS     |
| **Google Play**      | $25 una tantum | Richiesto per Android |
| **GitHub Actions**   | **Gratuito**   | 2000 min/mese gratis  |
| **Fastlane**         | **Gratuito**   | Open source           |
| **Expo Development** | **Gratuito**   | Solo per development  |

### 💡 **Risparmio vs Expo EAS**

- **Anno 1**: $348-1064 risparmiati
- **5 anni**: $1740-5320 risparmiati
- **Budget extra per la beneficenza**: 🎯

## 📋 Setup Publishing

### Quick Setup

```bash
# Windows
.\scripts\setup-deployment.ps1

# macOS/Linux
./scripts/setup-deployment.sh
```

### Prossimi Passi

1. **Accounts**: Apple Developer ($99) + Google Play ($25)
2. **Certificati**: iOS signing + Android keystore
3. **GitHub Secrets**: Configura API keys
4. **Deploy**: `git tag v1.0.0 && git push --tags`

📖 **Guida completa**: [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

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

### Architettura

- **Development**: Expo managed workflow (veloce)
- **Production**: Expo bare workflow (controllo completo)
- **CI/CD**: GitHub Actions (gratuito e potente)

## 📞 Support

- **Deployment**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/actions)
- **Fastlane**: [docs.fastlane.tools](https://docs.fastlane.tools)
- **Expo**: [docs.expo.dev](https://docs.expo.dev)

---

**Rise Against Hunger Italia** - Insieme possiamo fare la differenza! 🍽️❤️

### 🎉 **Sistema Pronto!**

✅ **Development**: Expo (veloce)  
✅ **Production**: GitHub Actions (gratuito)  
✅ **Deployment**: Automatico con git tag  
✅ **Costi**: $124/anno (risparmio significativo)

🚀 **Perfetto per un'associazione no-profit!**
