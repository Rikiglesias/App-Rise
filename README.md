# 🇮🇹 **Rise Against Hunger Italia**
<!-- Test workflow automatico - Solo iOS -->

## App React Native per combattere la fame nel mondo

---

## 🎯 **PER SVILUPPATORI**

### **📚 Documenti OBBLIGATORI da Leggere**

> **ATTENZIONE**: Prima di contribuire, DEVI leggere questi documenti!

1. **[CONTRIBUTING.md](./CONTRIBUTING.md)** ⭐ **START HERE** - Workflow completo per contribuire
2. **[Development Guide](./docs/guides/development.md)** 💎 **REGOLE PROGETTO** - Standard codice e best practices
3. **[Quality Standards](./docs/guides/quality-standards.md)** ✅ **PRIMA DI OGNI COMMIT** - Checklist pulizia codice

**TL;DR**:

- ✅ Zero compromessi sulla qualità
- ✅ Perfect System obbligatorio
- ✅ TypeScript strict mode
- ✅ ESLint zero warnings
- ✅ Ogni file deve seguire le [Quality Standards](./docs/guides/quality-standards.md)

---

## 📊 **STATO PROGETTO**

```text
✅ TypeScript: 0 errori - PERFETTO
✅ ESLint: 0 warnings - PERFETTO
✅ Test: vedi CI
✅ Prettier: Formatting perfetto
✅ Performance: Ottimizzata
✅ Layout: Sistema responsive unificato
✅ Architettura: Perfect System implementato
🚀 PRONTO PER SVILUPPO PROFESSIONALE
```

---

## 🎯 **OVERVIEW PROGETTO**

### **🌍 Missione**

Rise Against Hunger Italia combatte la fame nel mondo attraverso packaging events,
progetti di sviluppo agricolo e programmi di nutrizione scolastica.

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

- [🚀 Development Guide](docs/guides/development.md) - Guida sviluppo completa
- [🏗️ Architecture](docs/architecture/overview.md) - Architettura del progetto
- [🏆 Quality Standards](docs/guides/quality-standards.md) - Standard di qualità
- [⚙️ Deployment](docs/guides/deployment.md) - Guida deploy
- [🔒 Security](docs/standards/security-performance.md) - Sicurezza e performance

---

## 🎯 **ARCHITETTURA**

### **📁 Struttura Progetto**

```text
src/
├── components/
│   ├── ui/                 # Componenti UI riusabili (PerfectText, PerfectImage, etc.)
│   └── layout/             # Layout
├── features/
│   ├── home/               # Homepage
│   ├── actions/            # Azioni e donazioni
│   ├── impact/             # Impatto e risultati
│   ├── projects/           # Progetti attivi
│   ├── about/              # Chi siamo
│   ├── social/             # Social media
│   └── auth/               # Auth donatori (signup, login, profilo, reset password)
├── shared/
│   ├── auth/               # AuthContext, Supabase client, consensi GDPR, social auth
│   ├── config/             # Configurazione runtime
│   ├── constants/          # Design tokens e perfectScale (SSOT scaling)
│   ├── data/               # Dati statici
│   ├── hooks/              # Hook personalizzati (useTheme, usePerfectTheme)
│   ├── screens/            # Screen condivise
│   ├── services/           # Service layer
│   ├── theme/              # Theme
│   └── utils/              # SystemImmunity e utility
├── navigation/             # Navigation configuration
└── locales/                # Traduzioni (it, en)
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

Il repo lavora **direttamente su `master`** — unico branch permanente, protetto da
ruleset linear-history (`.github/ruleset.yml`). Non esistono `develop` né `release/*`.

- **`master`**: produzione, protetto. Merge **solo via PR** (squash o rebase, no merge-commit).
- **Branch di lavoro temporanei** (creati da `master`, PR verso `master`):
  - `feat/nome` — nuove funzionalità
  - `fix/nome` — bugfix
  - `chore/nome` — manutenzione, refactor, CI/CD

```bash
git checkout master && git pull
git checkout -b feat/nome-feature
# ... sviluppo + npm run conta-problemi = 0 ...
git push -u origin feat/nome-feature
# Apri PR verso master
```

### **✅ Regole PR** (ruleset `master`)

- ✅ Tutti i check CI devono passare (typescript / eslint / prettier / tests / visual-diff / build)
- ✅ 1 approvazione + code owner (`CODEOWNERS`)
- ✅ Linear history: squash o rebase, no merge-commit
- ✅ Commit message convenzionali:
  - `feat:` nuove funzionalità
  - `fix:` correzioni bug
  - `chore:` manutenzione
  - `docs:` documentazione
  - `test:` test
  - `refactor:` refactoring

### **🚀 CI/CD Triggers**

- **Push / PR** su `master` → quality checks, test, visual diff
- **Commit message `[build]`** → build iOS/Android (EAS Build)
- **Commit message `[ota]`** → deploy OTA update (EAS Update)

---

## 🤝 **CONTRIBUTI**

### **👥 Team**

- **Lead Developer**: @Rikiglesias
- **Organization**: Rise Against Hunger Italia
- **Repository**: <https://github.com/Rikiglesias/App-Rise>

### **📞 Contatti**

- **Website**: <https://italy.riseagainsthunger.org>
- **Email**: <info@riseagainsthunger.it>
- **Social**: @riseagainsthungeritalia

---

## 📄 **License**

MIT License - Vedi [LICENSE](LICENSE) file per dettagli.

---

**🎯 Rise Against Hunger Italia** - App React Native per combattere la fame nel mondo con tecnologie moderne e qualità enterprise.

<!-- CI trigger 2: [build] -->
