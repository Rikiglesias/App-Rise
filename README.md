# 🇮🇹 **Rise Against Hunger Italia**
<!-- Test workflow automatico - Solo iOS -->

*App React Native per combattere la fame nel mondo*

---

## 🎯 **PER SVILUPPATORI**

### **📚 Documenti OBBLIGATORI da Leggere**

> **ATTENZIONE**: Prima di contribuire, DEVI leggere questi documenti!

1. **[CONTRIBUTING.md](./CONTRIBUTING.md)** ⭐ **START HERE** - Workflow completo per contribuire
2. **[CODING_STANDARDS.md](./docs/CODING_STANDARDS.md)** 💎 **REGOLE PROGETTO** - Standard codice e best practices
3. **[CODE_CLEANUP_CHECKLIST.md](./docs/CODE_CLEANUP_CHECKLIST.md)** ✅ **PRIMA DI OGNI COMMIT** - Checklist pulizia codice

**TL;DR**:
- ✅ Zero compromessi sulla qualità
- ✅ Perfect System obbligatorio
- ✅ TypeScript strict mode
- ✅ ESLint zero warnings
- ✅ Ogni file deve seguire [CODE_CLEANUP_CHECKLIST](./docs/CODE_CLEANUP_CHECKLIST.md)

---

## 📊 **STATO PROGETTO**

```
✅ TypeScript: 0 errori - PERFETTO
✅ ESLint: 0 warnings - PERFETTO
✅ Test: 93.5% passanti (661/707 tests)
✅ Prettier: Formatting perfetto
✅ Performance: Ottimizzata
✅ Layout: Sistema responsive unificato
✅ Architettura: Perfect System implementato
🚀 PRONTO PER SVILUPPO PROFESSIONALE
```

---

## 🎯 **OVERVIEW PROGETTO**

### **🌍 Missione**
Rise Against Hunger Italia combatte la fame nel mondo attraverso packaging events, progetti di sviluppo agricolo e programmi di nutrizione scolastica.

### **📱 App Features**
- **🏠 Home**: Informazioni organizzazione e call-to-action
- **🎯 Azioni**: Come contribuire (donazioni, volontariato, eventi)
- **💪 Impatto**: Risultati ottenuti e storie di successo
- **📊 Progetti**: Progetti attivi e completati
- **👥 Chi Siamo**: Team, missione e valori
- **📱 Seguici**: Social media e newsletter

### **🛡️ Sicurezza Enterprise**
- 🔒 **Network Security**: Android Network Security Config
- 🔐 **Certificate Pinning**: SSL/TLS protection
- 🛡️ **Data Protection**: GDPR compliant
- 🔑 **Secure Storage**: Expo SecureStore
- 📊 **Error Tracking**: Monitoraggio automatico

---

## 🛠️ **TECNOLOGIE**

### **🔧 Core Stack**
- **React Native**: Framework mobile
- **Expo**: Development platform  
- **TypeScript**: Type safety
- **React Navigation**: Navigation
- **React Native Paper**: UI components

### **🧪 Testing & Quality**
- **Jest**: Unit testing
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static typing

---

## 🔧 **SVILUPPO**

### **📋 Prerequisiti**
- Node.js 18+
- Expo CLI
- React Native environment

### **🚀 Setup Rapido**
```bash
# Clone repository
git clone https://github.com/Rikiglesias/App-Rise.git
cd App-Rise

# Install dependencies
npm install

# Start development
npm start
```

### **🏗️ Build & Deploy**
```bash
# Build iOS
npm run build:ios

# Build Android
npm run build:android

# Deploy with scripts
npm run deploy:ios
npm run deploy:android
```

### **🧪 Quality Assurance**
```bash
# PRE-SVILUPPO (OBBLIGATORIO)
npm run pre-modifiche

# POST-SVILUPPO (OBBLIGATORIO)
npm run post-modifiche

# Conteggio problemi
npm run conta-problemi
```

---

## 📚 **DOCUMENTAZIONE**

### **📚 Guide e Documentazione**
- [🚀 Development Guide](docs/DEVELOPMENT_GUIDE.md) - Guida sviluppo completa
- [🏗️ Architecture](docs/ARCHITECTURE.md) - Architettura del progetto
- [🏆 Quality Standards](docs/QUALITY_STANDARDS.md) - Standard di qualità
- [⚙️ Deployment](docs/DEPLOYMENT_GUIDE.md) - Guida deploy
- [🔒 Security](docs/SICUREZZA_E_PERFORMANCE.md) - Sicurezza e performance

---

## 🎯 **ARCHITETTURA**

### **📁 Struttura Progetto**
```
src/
├── components/
│   ├── ui/                 # Sistema Perfetto (PerfectText, PerfectImage, etc.)
│   ├── domain/             # Componenti business logic
│   └── layout/             # Layout e navigation
├── features/
│   ├── home/               # Homepage
│   ├── actions/            # Azioni e donazioni
│   ├── impact/             # Impatto e risultati
│   ├── projects/           # Progetti attivi
│   └── about/              # Chi siamo
├── shared/
│   ├── utils/              # UniversalMillimetricSystem, SystemImmunity
│   ├── theme/              # UniversalTheme
│   ├── constants/          # Design tokens
│   └── hooks/              # Hook personalizzati
└── navigation/             # Navigation configuration
```

---

## ⚡ **WORKFLOW SVILUPPO**

### **🔄 Quality Assurance**
```bash
# PRE-SVILUPPO (Obbligatorio)
npm run pre-modifiche

# POST-SVILUPPO (Obbligatorio)  
npm run post-modifiche

# Verifica problemi
npm run conta-problemi
```

### **📋 Processo Sviluppo**
1. Verifica pre-sviluppo
2. Implementazione feature
3. Verifica post-sviluppo
4. Commit solo se 0 problemi

---

## 🌿 **GIT WORKFLOW**

### **🔀 Struttura Branch**

#### **Branch Permanenti**
- **`master`**: Production - Codice stabile in produzione
- **`develop`**: Integration - Sviluppo attivo e testing
- **`release/x.x`**: Release candidates - Preparazione release

#### **Branch Temporanei**
- **`feature/nome-feature`**: Nuove funzionalità
  ```bash
  git checkout -b feature/new-authentication develop
  # ... sviluppo ...
  git push origin feature/new-authentication
  # Apri PR verso develop
  ```

- **`fix/nome-bug`**: Bugfix non critici
  ```bash
  git checkout -b fix/button-alignment develop
  ```

- **`hotfix/nome-urgente`**: Fix produzione urgenti
  ```bash
  git checkout -b hotfix/critical-crash master
  # ... fix ...
  # Merge in master E develop
  ```

- **`chore/nome-task`**: Manutenzione, refactor, CI/CD

### **🔄 GitFlow Workflow**

```
1. Feature Development
   feature/* → develop (PR + CI checks)

2. Release Preparation
   develop → release/x.x (stabilizzazione + testing)

3. Production Deploy
   release/x.x → master (tag + deploy automatico)

4. Hotfix Urgente
   hotfix/* → master (direct merge)
   hotfix/* → develop (backport)
```

### **✅ Regole PR**

- ✅ Tutti i check CI devono passare
- ✅ Code review obbligatorio
- ✅ Branch aggiornato con base
- ✅ Commit message convenzionali:
  - `feat:` nuove funzionalità
  - `fix:` correzioni bug
  - `chore:` manutenzione
  - `docs:` documentazione
  - `test:` test
  - `refactor:` refactoring

### **🚀 CI/CD Triggers**

- **Push** su `master`, `develop` → Full CI/CD
- **PR** verso `master`, `develop` → Quality checks, tests, visual diff
- **Commit message `[build]`** → Force build iOS/Android
- **Commit message `[ota]`** → Deploy OTA update

---

## 🤝 **CONTRIBUTI**

### **👥 Team**
- **Lead Developer**: @Rikiglesias
- **Organization**: Rise Against Hunger Italia
- **Repository**: https://github.com/Rikiglesias/App-Rise

### **📞 Contatti**
- **Website**: https://italy.riseagainsthunger.org
- **Email**: info@riseagainsthunger.it
- **Social**: @riseagainsthungeritalia

---

## 📄 **License**

MIT License - Vedi [LICENSE](LICENSE) file per dettagli.

---

**🎯 Rise Against Hunger Italia** - App React Native per combattere la fame nel mondo con tecnologie moderne e qualità enterprise.

<!-- CI trigger 2: [build] -->
