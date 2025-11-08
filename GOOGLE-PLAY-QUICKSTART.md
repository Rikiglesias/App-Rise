# 🚀 Google Play Console - Quick Start

Setup rapido per collegare l'app a Google Play Console.

## ⚡ Setup Veloce (15 minuti)

### 1️⃣ Crea Service Account

```bash
# 1. Vai su: https://console.cloud.google.com
# 2. Seleziona progetto collegato a Play Console
# 3. IAM & Admin → Service Accounts → CREATE SERVICE ACCOUNT
# 4. Nome: rah-italia-play-deploy
# 5. CREATE → DONE
# 6. Click sul service account → KEYS → ADD KEY → Create new key → JSON
# 7. Scarica il file JSON
```

### 2️⃣ Collega a Play Console

```bash
# 1. Vai su: https://play.google.com/console
# 2. Setup → API access
# 3. Link service account (seleziona quello creato sopra)
# 4. Users and permissions
# 5. Trova service account → Edit permissions
# 6. Assegna: "Create and edit releases" + "Manage testing tracks"
# 7. Aggiungi app: Rise Against Hunger Italia
# 8. Save
```

### 3️⃣ Attiva Play App Signing

```bash
# 1. Play Console → Setup → App signing
# 2. Continue
# 3. "Use Google Play to generate a new upload key"
# 4. Accept terms → Enroll
```

### 4️⃣ Salva Service Account Localmente

```bash
# Nella root del progetto
cp ~/Downloads/rah-italia-play-deploy-*.json ./google-service-account.json
```

### 5️⃣ Verifica Setup

```bash
npm run verify:google-play
```

**Output atteso**: ✅ Tutte le verifiche superate

### 6️⃣ Primo Deploy

```bash
# Build + Submit automatico
npm run deploy:android

# Oppure step-by-step:
npm run build:android
npm run submit:android
```

---

## 📋 Checklist Pre-Deploy

Prima di fare il primo deploy, completa su Play Console:

- [ ] **Store listing** completato (nome, descrizioni, screenshots)
- [ ] **App icon** caricato (512x512)
- [ ] **Feature graphic** caricato (1024x500)
- [ ] **Privacy policy** URL aggiunto
- [ ] **Data Safety** compilata
- [ ] **Content Rating** ottenuto
- [ ] **Target audience** configurato

---

## 🎯 Comandi Principali

```bash
# Verifica setup completo
npm run verify:google-play

# Build AAB per Google Play
npm run build:android

# Submit ultima build
npm run submit:android

# Deploy completo (build + submit)
npm run deploy:android

# Solo build (no submit)
npm run deploy:android:build-only

# Solo submit (usa ultima build)
npm run deploy:android:submit-only
```

---

## 📚 Documentazione Completa

Per guida dettagliata passo-passo:

👉 **[docs/guides/google-play-setup.md](./docs/guides/google-play-setup.md)**

Include:

- Setup dettagliato service account
- Configurazione Play App Signing
- Workflow completo di deploy
- Troubleshooting comune
- Data Safety e Content Rating
- Passaggio da testing a production

---

## 🔗 Link Utili

- [Google Play Console](https://play.google.com/console)
- [Google Cloud Console](https://console.cloud.google.com)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)

---

## 🆘 Troubleshooting Rapido

### ❌ Service account not found

**Soluzione**: Verifica collegamento su Play Console → API access

### ❌ Permission denied

**Soluzione**: Verifica permessi su Users and permissions → Service account → Edit permissions

### ❌ Version code already exists

**Soluzione**: Incrementa `versionCode` in `app.config.js`

### ❌ Upload key doesn't match

**Soluzione**: Assicurati che Play App Signing sia attivo

---

## ✅ Setup Completato?

Se `npm run verify:google-play` restituisce ✅ su tutte le verifiche:

🎉 **Sei pronto per il primo deploy!**

```bash
npm run deploy:android
```

---

## 📝 Note

- **Service account JSON**: Mai committare su Git (già in `.gitignore`)
- **Version code**: Incrementa ad ogni release
- **Play App Signing**: Lascia che Google gestisca le keys
- **Internal testing**: Testa sempre prima di production

---

**Rise Against Hunger Italia** 🌍
