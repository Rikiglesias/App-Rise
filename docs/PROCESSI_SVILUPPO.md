# 📋 PROCESSI SVILUPPO - GUIDA COMPLETA

## 🏗️ STATO ATTUALE PROGETTO

### **📊 SITUAZIONE CORRENTE:**

- **Commit**: `ac7d1db` - refactor: Pulizia dead code e ottimizzazioni codebase
- **Sistema Deploy**: EAS Build (Expo)
- **Problemi Rilevati**: 172 totali (170 TypeScript + 1 ESLint + 1 Jest)
- **Account**: rikiglesias (EAS loggato)

### **✅ CONFIGURAZIONI ATTIVE:**

- ✅ EAS CLI installato e configurato
- ✅ Progetto EAS ID: `52a33b0f-dec1-4674-812b-de5b888c911a`
- ✅ eas.json configurato con profili
- ✅ Sistema qualità attivo (zero tolleranza)
- ✅ GitHub Actions rimossi (no conflitti)

---

## 🔧 PROCESSO SVILUPPO QUOTIDIANO

### **📋 WORKFLOW STANDARD:**

```bash
# 1. CONTROLLO PRE-SVILUPPO
npm run pre-modifiche

# 2. SVILUPPO
# - Modifica codice in VS Code
# - Correggi errori mostrati in Problems tab

# 3. CONTROLLO POST-SVILUPPO
npm run post-modifiche

# 4. COMMIT (solo se ZERO problemi)
git add .
git commit -m "feat: Descrizione modifiche"
```

### **🚨 REGOLE RIGIDE:**

- ❌ **ZERO TOLLERANZA**: Mai committare con errori/warnings
- ❌ **BLOCCO ASSOLUTO**: 1 errore = stop sviluppo
- ✅ **SOLO MANUALE**: Correzioni nell'editor, no automatismi
- ✅ **VERIFICA CONTINUA**: `npm run conta-problemi` sempre

---

## 🚀 PROCESSO DEPLOY EAS

### **📱 BUILD COMMANDS:**

```bash
# 🔧 BUILD DEVELOPMENT (Testing interno)
eas build --profile development --platform ios
eas build --profile development --platform android

# 👀 BUILD PREVIEW (Condivisione APK/IPA)
eas build --profile preview --platform ios
eas build --profile preview --platform android
eas build --profile preview --platform all

# 🏪 BUILD PRODUCTION (Per store)
eas build --profile production --platform ios
eas build --profile production --platform android
eas build --profile production --platform all
```

### **📤 SUBMIT COMMANDS:**

```bash
# 📱 SUBMIT iOS APP STORE
eas submit --platform ios --profile production

# 🤖 SUBMIT ANDROID PLAY STORE
eas submit --platform android --profile production

# 📤 SUBMIT ENTRAMBI
eas submit --platform all --profile production
```

### **⚡ OVER-THE-AIR UPDATES:**

```bash
# 🔄 UPDATE ISTANTANEO (Senza App Store)
eas update --branch production --message "Hotfix: Descrizione"

# 🔄 UPDATE STAGING
eas update --branch staging --message "Test: Nuova feature"
```

---

## 📊 PROCESSO QUALITÀ - ZERO TOLLERANZA

### **🔍 COMANDI CONTROLLO:**

```bash
# 📊 CONTEGGIO PROBLEMI COMPLETO
npm run conta-problemi

# 🔍 ANALISI DETTAGLIATA
npm run analisi-completa

# 💡 HELPER CORREZIONI MANUALI
npm run helper-manuali

# 🔧 WORKFLOW COMPLETO
npm run workflow-completo
```

### **🎯 PROCESSO CORREZIONE ERRORI:**

#### **STEP 1: IDENTIFICAZIONE**

```bash
npm run conta-problemi
```

- Controlla output per errori TypeScript
- Verifica warnings ESLint
- Controlla test falliti

#### **STEP 2: CORREZIONE MANUALE**

- Apri VS Code
- Vai al tab **Problems**
- Correggi errori UNO PER UNO manualmente
- ❌ **NO correzioni automatiche**

#### **STEP 3: VERIFICA**

```bash
npm run conta-problemi
```

- Ripeti finché: **🚨 PROBLEMI TOTALI: 0**

#### **STEP 4: COMMIT**

```bash
git add .
git commit -m "fix: Risolti errori TypeScript/ESLint"
```

---

## 📱 PROCESSO TESTING

### **🧪 TESTING LOCALE:**

```bash
# 📱 AVVIO APP DEVELOPMENT
npm start

# 🤖 ANDROID EMULATOR
npm run android

# 🍎 iOS SIMULATOR
npm run ios

# 🌐 WEB BROWSER
npm run web
```

### **🧪 TESTING REAL DEVICE:**

```bash
# 📱 EXPO GO (Development)
npm start
# Scansiona QR code con Expo Go

# 📦 BUILD PREVIEW (Standalone)
eas build --profile preview --platform ios
# Scarica IPA e installa su device
```

---

## 🔑 PROCESSO CERTIFICATI iOS

### **🍎 CONFIGURAZIONE AUTOMATICA:**

```bash
# 🔧 CONFIGURAZIONE CERTIFICATI
eas credentials

# 📋 VERIFICA CERTIFICATI
eas credentials --platform ios

# 🔄 RINNOVO AUTOMATICO
# EAS gestisce automaticamente i rinnovi
```

### **📱 REQUISITI:**

- ✅ Apple Developer Account attivo ($99/anno)
- ✅ Bundle ID configurato
- ✅ EAS gestisce tutto automaticamente

---

## 📦 PROCESSO GESTIONE DIPENDENZE

### **📦 INSTALLAZIONE PACCHETTI:**

```bash
# ✅ INSTALLAZIONE SICURA
npm install [package-name]

# 🔍 VERIFICA POST-INSTALLAZIONE
npm run conta-problemi

# 🚨 SE PROBLEMI: Rimuovi pacchetto
npm uninstall [package-name]
```

### **⚠️ REGOLE DIPENDENZE:**

- ✅ Solo pacchetti compatibili Expo
- ❌ No pacchetti che richiedono ejecting
- 🔍 Verifica sempre impatto con `conta-problemi`

---

## 🎯 PROCESSO RELEASE PRODUCTION

### **📋 CHECKLIST PRE-RELEASE:**

```bash
# 1. VERIFICA QUALITÀ
npm run conta-problemi
# Risultato deve essere: PROBLEMI TOTALI: 0

# 2. BUILD PRODUCTION
eas build --profile production --platform all

# 3. TESTING INTERNO
# Scarica build e testa su device reali

# 4. SUBMIT STORES
eas submit --platform all --profile production
```

### **📱 VERSIONING:**

```bash
# 📊 AGGIORNA VERSIONE IN app.json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    },
    "ios": {
      "buildNumber": "2"
    }
  }
}

# 🏷️ TAG GIT
git tag v1.0.1
git push origin v1.0.1
```

---

## 🆘 PROCESSO TROUBLESHOOTING

### **🐛 PROBLEMI COMUNI:**

#### **BUILD FALLISCE:**

```bash
# 1. CONTROLLA LOGS
eas build:list

# 2. VERIFICA CONFIGURAZIONE
eas config

# 3. PULISCI CACHE
eas build --clear-cache
```

#### **CERTIFICATI PROBLEMI:**

```bash
# 🔧 RESET CERTIFICATI
eas credentials --platform ios --clear

# 🔄 RICONFIGURA
eas credentials --platform ios
```

#### **TROPPI ERRORI TYPESCRIPT:**

```bash
# 📊 ANALISI GRADUALE
# Correggi errori per categorie:
# 1. Import/Export errors
# 2. Type definitions
# 3. Component props
# 4. API calls
```

---

## 💰 PROCESSO GESTIONE COSTI

### **📊 MONITORAGGIO USAGE:**

```bash
# 📊 VERIFICA USAGE EAS
eas build:list
# Controlla numero build utilizzate

# 💰 PIANO ATTUALE: GRATUITO
# ✅ 30 build iOS/mese
# ✅ 30 build Android/mese
# ✅ OTA updates illimitati
```

### **⚠️ OTTIMIZZAZIONE:**

- 🎯 Usa `preview` per testing
- 🎯 Usa `production` solo per release
- 🎯 Usa OTA updates per hotfix

---

## 📞 SUPPORTO E RISORSE

### **🔗 LINK UTILI:**

- **EAS Documentation**: <https://docs.expo.dev/eas/>
- **Expo Forums**: <https://forums.expo.dev/>
- **GitHub Issues**: Repository issues tab

### **🆘 COMANDI DIAGNOSTICI:**

```bash
# 🔍 INFO AMBIENTE
eas diagnostics

# 📋 CONFIGURAZIONE PROGETTO
eas config

# 👤 ACCOUNT INFO
eas whoami
```

---

## 🎯 RIASSUNTO PROCESSI CRITICI

### **🚨 SVILUPPO QUOTIDIANO:**

1. `npm run pre-modifiche`
2. Sviluppa e correggi errori
3. `npm run post-modifiche`
4. Commit solo se ZERO problemi

### **🚀 DEPLOY PRODUCTION:**

1. `npm run conta-problemi` → ZERO problemi
2. `eas build --profile production --platform all`
3. Test su device reali
4. `eas submit --platform all --profile production`

### **⚡ HOTFIX URGENTE:**

1. Correggi bug
2. `npm run conta-problemi` → ZERO problemi
3. `eas update --branch production --message "Hotfix: Descrizione"`

---

_📅 Ultimo aggiornamento: $(date)_
_🔗 Progetto: riseagainsthungeritalia_
_👤 Account: rikiglesias_
