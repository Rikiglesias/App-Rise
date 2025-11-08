# 🤖 Setup Completo Google Play Console - Rise Against Hunger Italia

## 📋 Indice

- [Prerequisiti](#prerequisiti)
- [Step 1: Service Account Google Cloud](#step-1-service-account-google-cloud)
- [Step 2: Play App Signing](#step-2-play-app-signing)
- [Step 3: Configurazione Locale](#step-3-configurazione-locale)
- [Step 4: Firebase (Opzionale)](#step-4-firebase-opzionale)
- [Step 5: Store Listing](#step-5-store-listing)
- [Step 6: Primo Deploy](#step-6-primo-deploy)
- [Step 7: Data Safety & Content Rating](#step-7-data-safety--content-rating)
- [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisiti

Prima di iniziare, assicurati di avere:

- ✅ Account Google Play Console creato ($25 una tantum)
- ✅ App creata su Play Console con package name: `org.riseagainsthunger.italia`
- ✅ Accesso amministratore all'account Google Play Console
- ✅ EAS CLI installato: `npm install -g eas-cli`
- ✅ Login EAS attivo: `eas login`

---

## Step 1: Service Account Google Cloud

### 1.1 Creare Service Account

**Vai su Google Cloud Console:**

1. Apri [console.cloud.google.com](https://console.cloud.google.com)
2. Seleziona/crea progetto collegato a Google Play Console
3. Vai a **IAM & Admin** → **Service Accounts**
4. Click **+ CREATE SERVICE ACCOUNT**

**Configura Service Account:**

```
Service account name: rah-italia-play-deploy
Service account ID: rah-italia-play-deploy
Description: Service account per deploy automatico su Google Play Store
```

5. Click **CREATE AND CONTINUE**
6. **Grant this service account access to project** → Skip (non serve)
7. Click **DONE**

### 1.2 Generare JSON Key

1. Click sul service account appena creato
2. Vai su **KEYS** tab
3. Click **ADD KEY** → **Create new key**
4. Seleziona **JSON**
5. Click **CREATE**
6. **Scarica il file JSON** (es. `rah-italia-play-deploy-abc123.json`)

⚠️ **IMPORTANTE**: Questo file contiene credenziali sensibili! Non commitarlo mai su Git.

### 1.3 Collegare Service Account a Play Console

**Vai su Google Play Console:**

1. Apri [play.google.com/console](https://play.google.com/console)
2. Vai su **Setup** → **API access**
3. Nella sezione **Service accounts**, click su **Link service account** (se non presente, click **+ Create new service account** e segui il link a Google Cloud)
4. Seleziona il service account creato: `rah-italia-play-deploy@...`
5. Click **LINK**

### 1.4 Assegnare Permessi

1. Torna su Play Console → **Users and permissions**
2. Trova il service account `rah-italia-play-deploy@...`
3. Click su **Edit permissions**
4. Assegna i seguenti permessi:
   - ✅ **Releases** → **Create and edit releases**
   - ✅ **Releases** → **Manage testing tracks** (Internal, Alpha, Beta)
   - ✅ **App access** → **View app information**
5. **Aggiungi app**: Seleziona "Rise Against Hunger Italia"
6. Click **Apply** → **Save changes**

---

## Step 2: Play App Signing

**Perché è importante:**
Google Play gestisce la firma dell'app per te, aumentando sicurezza e semplificando la distribuzione.

### 2.1 Attivare Play App Signing

1. Vai su Play Console → **Setup** → **App signing**
2. Se vedi "**App signing by Google Play is not enabled**":
   - Click **Continue**
   - Seleziona "**Use Google Play to generate a new upload key**" (RACCOMANDATO)
   - Oppure "Upload a key exported from Android Studio" (se hai già un keystore)
3. Accetta i termini
4. Click **Enroll**

✅ **Google Play Signing è ora attivo!**

### 2.2 Scaricare Certificato Upload Key (Opzionale)

Se scegli di usare upload key generata da Google:

1. Vai su **Setup** → **App signing**
2. Nella sezione **Upload key certificate**, click **Download**
3. Salva il certificato in un luogo sicuro

**Per EAS Build**: Non serve! EAS genera automaticamente una upload key temporanea.

### 2.3 Verificare Configurazione

Verifica che Play App Signing sia attivo:

```bash
# Su Play Console, dovresti vedere:
✅ App signing by Google Play is enabled
✅ App signing key certificate: SHA-256 fingerprint presente
✅ Upload key certificate: SHA-256 fingerprint presente
```

---

## Step 3: Configurazione Locale

### 3.1 Salvare Service Account JSON

```bash
# Nella root del progetto
cp ~/Downloads/rah-italia-play-deploy-*.json ./google-service-account.json

# Verifica che sia nel .gitignore (già configurato)
cat .gitignore | grep google-service-account.json
# Output: google-service-account.json
```

### 3.2 Verificare EAS Configuration

**Verifica `eas.json`:**

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    },
    "production-store": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

✅ **Già configurato correttamente!**

### 3.3 Configurare Variabili Ambiente (Opzionale)

**Crea `.env` se non esiste:**

```bash
# Android Configuration
ANDROID_PACKAGE=org.riseagainsthunger.italia
ANDROID_VERSION_CODE=5
```

**Per CI/CD (GitHub Actions):**

Aggiungi come GitHub Secrets:

- `GOOGLE_SERVICE_ACCOUNT_JSON`: Contenuto del file JSON (copia-incolla tutto il contenuto)
- `ANDROID_VERSION_CODE`: Numero versione (es. 5)

### 3.4 Aggiornare Version Code

**Ogni release deve avere `versionCode` incrementato:**

```bash
# app.config.js usa:
versionCode: parseInt(process.env.ANDROID_VERSION_CODE || '4', 10)

# Per release successiva:
# 1. Incrementa localmente
versionCode: parseInt(process.env.ANDROID_VERSION_CODE || '5', 10)

# 2. Oppure usa variabile ambiente
export ANDROID_VERSION_CODE=5
```

---

## Step 4: Firebase (Opzionale)

### 4.1 Quando Serve Firebase?

Firebase è necessario solo se usi:

- ❌ **Non serve per questa app** (niente Analytics, Crashlytics, FCM al momento)
- ✅ Push notifications (Firebase Cloud Messaging)
- ✅ Analytics (Google Analytics for Firebase)
- ✅ Crash reporting (Firebase Crashlytics)
- ✅ Remote Config (feature flags dinamici)

### 4.2 Setup Firebase (Se Necessario)

```bash
# 1. Crea progetto Firebase: https://console.firebase.google.com
# 2. Aggiungi app Android con package: org.riseagainsthunger.italia
# 3. Scarica google-services.json
# 4. Salva in: android/app/google-services.json (se hai folder android/)

# Per Expo managed workflow (come il tuo caso):
# - Firebase si configura tramite app.config.js o expo-firebase plugin
# - Non serve google-services.json nel progetto
```

**Conclusione**: ⏭️ **Skippiamo Firebase per ora** (non necessario).

---

## Step 5: Store Listing

### 5.1 Informazioni App

**Vai su Play Console → App content:**

1. **App name**: Rise Against Hunger Italia
2. **Short description** (80 caratteri):
   ```
   App ufficiale RAH Italia per supportare la lotta contro la fame nel mondo
   ```
3. **Full description** (4000 caratteri):

   ```
   Rise Against Hunger Italia è l'app ufficiale per sostenere la missione di combattere la fame nel mondo.

   🌍 LA NOSTRA MISSIONE
   Rise Against Hunger è un'organizzazione internazionale che distribuisce cibo e supporto vitale alle popolazioni più vulnerabili del mondo. Ogni anno aiutiamo milioni di persone attraverso:
   - Distribuzione di pasti nutrienti
   - Programmi educativi
   - Supporto alle comunità locali

   📱 COSA PUOI FARE CON L'APP
   • Scopri i progetti attivi in Italia e nel mondo
   • Partecipa agli eventi di confezionamento pasti
   • Segui l'impatto delle tue donazioni
   • Unisciti alla community di volontari

   ✨ CARATTERISTICHE PRINCIPALI
   • Dashboard interattiva con statistiche real-time
   • Calendario eventi e opportunità di volontariato
   • Storie di impatto e aggiornamenti dai progetti
   • Mappe interattive delle zone di intervento
   • Sistema di donazioni sicuro e trasparente

   🎯 IL TUO IMPATTO
   Ogni azione conta. Con l'app RAH Italia puoi:
   - Vedere in tempo reale quante persone stai aiutando
   - Monitorare l'impatto dei progetti supportati
   - Connetterti con altri volontari
   - Ricevere aggiornamenti sulle iniziative

   💙 UNISCITI A NOI
   Insieme possiamo fare la differenza nella lotta contro la fame.

   Per maggiori informazioni:
   🌐 https://italy.riseagainsthunger.org
   📧 info@riseagainsthunger.it

   #FameZero #RiseAgainstHunger #VolontariatoItalia
   ```

### 5.2 Grafica e Screenshot

**Requisiti Google Play:**

1. **App icon**: 512x512 PNG (già in `assets/icons/app/app-icon.png`)
2. **Feature graphic**: 1024x500 (banner store)
3. **Screenshots**: Minimo 2, max 8 per tipo di dispositivo
   - **Phone**: 320-3840px
   - **Tablet 7"**: Opzionale
   - **Tablet 10"**: Opzionale

**Suggerimento screenshot:**

- Home screen con dashboard
- Sezione progetti/statistiche
- Calendario eventi
- Mappa interattiva
- Profilo volontario/donazioni

### 5.3 Categorizzazione

1. **Category**: Social
2. **Tags**: Volontariato, Beneficenza, Nonprofit
3. **Content rating**: Compilare questionario (app per tutti)

---

## Step 6: Primo Deploy

### 6.1 Verifica Prerequisiti

```bash
# Verifica EAS login
eas whoami
# Output: Logged in as [tuo-account]

# Verifica google-service-account.json
ls -la google-service-account.json
# Output: File presente

# Verifica configurazione app.config.js
node -e "console.log(require('./app.config.js').expo.android.package)"
# Output: org.riseagainsthunger.italia
```

### 6.2 Build Test su Internal Testing

**Build AAB con EAS:**

```bash
# Build production-store (crea App Bundle)
eas build --platform android --profile production-store

# Segui il prompt:
# - Conferma package name: org.riseagainsthunger.italia
# - EAS genererà automaticamente upload keystore
```

**Output atteso:**

```
✔ Build complete
📦 App bundle: https://expo.dev/accounts/[account]/projects/[project]/builds/[build-id]
```

### 6.3 Submit a Play Console (Internal Testing)

**Opzione 1: Submit Automatico (Raccomandato)**

```bash
# Submit automatico su track production (o internal se configurato)
eas submit --platform android --latest

# EAS userà:
# - serviceAccountKeyPath: ./google-service-account.json
# - track: production (da eas.json)
```

**Opzione 2: Submit Manuale**

```bash
# 1. Scarica AAB da EAS build
eas build:download --platform android --latest

# 2. Carica manualmente su Play Console:
#    Play Console → Release → Testing → Internal testing
#    → Create new release → Upload AAB
```

### 6.4 Creare Release su Internal Testing

1. Vai su Play Console → **Release** → **Testing** → **Internal testing**
2. Click **Create new release**
3. Upload AAB (se submit manuale) o conferma AAB da EAS
4. Aggiungi **Release notes** (es. "Prima versione interna per test")
5. Click **Review release** → **Start rollout to Internal testing**

✅ **Prima release su Internal Testing completata!**

### 6.5 Test con Team Interno

1. Vai su **Internal testing** → **Testers** tab
2. Aggiungi email tester (max 100 per internal testing)
3. Condividi link opt-in con i tester
4. Tester scaricano app da Play Store e testano

---

## Step 7: Data Safety & Content Rating

### 7.1 Data Safety (Obbligatorio)

**Vai su Play Console → App content → Data safety:**

**Per Rise Against Hunger Italia:**

```yaml
Raccolta dati:
  - ❌ No dati personali raccolti
  - ❌ No tracking utenti
  - ❌ No dati condivisi con terze parti

Permessi usati:
  - ✅ CAMERA: Per scansione QR code donazioni
  - ✅ INTERNET: Per comunicazione API
  - ✅ ACCESS_NETWORK_STATE: Per monitoraggio connessione

Sicurezza:
  - ✅ Dati in transito criptati (HTTPS)
  - ✅ No backup automatici (allowBackup: false)
  - ✅ Network Security Config per TLS 1.2+
```

**Compila sezioni:**

1. Click **Start** su Data safety
2. Rispondi al questionario basandoti sulle info sopra
3. Dichiara che non raccogli dati utente (se vero)
4. Salva

### 7.2 Content Rating (Obbligatorio)

**Vai su Play Console → App content → Content rating:**

1. Click **Start questionnaire**
2. Seleziona **Category**: Non-gaming
3. Compila questionario:
   - Contenuti violenti? ❌ No
   - Contenuti sessuali? ❌ No
   - Linguaggio scurrile? ❌ No
   - Droghe/alcol? ❌ No
   - Contenuti spaventosi? ❌ No
4. Submit

**Rating atteso**: PEGI 3 / Everyone (app per tutti)

### 7.3 Altri Requisiti

**Completa anche:**

1. **Privacy policy**: URL a `https://italy.riseagainsthunger.org/privacy`
2. **App access**: Specifica se richiede login
3. **Ads**: ❌ No ads presente
4. **Target audience**: Tutti (13+)
5. **News app**: ❌ Non è news app
6. **COVID-19 app**: ❌ Non è COVID app
7. **Government app**: ❌ Non è government app

---

## Step 8: Passaggio a Production

### 8.1 Testing Completato

Dopo test su **Internal testing**, procedi con:

1. **Closed testing (Alpha)**: Test con gruppo ristretto (fino a 100 tester)
2. **Open testing (Beta)**: Test pubblico (chiunque può partecipare)
3. **Production**: Release pubblica su Google Play Store

### 8.2 Promote to Production

```bash
# Build production finale
eas build --platform android --profile production-store

# Submit su production
eas submit --platform android --latest

# Su Play Console:
# 1. Release → Production
# 2. Create new release
# 3. Upload AAB o usa quello da testing
# 4. Review release → Start rollout to Production
```

### 8.3 Rollout Graduale

**Raccomandazione**: Rollout graduale

1. **10%**: Prime 24-48 ore (monitor crash, feedback)
2. **25%**: Se tutto OK dopo 48 ore
3. **50%**: Se tutto OK dopo 72 ore
4. **100%**: Rollout completo dopo 1 settimana

---

## 🔄 Workflow Completo

### Deploy Script Automatico

**Usa lo script esistente:**

```bash
# Build + Submit automatico
npm run deploy:android

# Solo build (no submit)
npm run deploy:android:build-only

# Solo submit (usa ultima build)
npm run deploy:android:submit-only
```

### Update OTA (Post-Release)

**Per aggiornamenti JavaScript senza rebuild:**

```bash
# Update OTA su production channel
npm run update:production

# Con messaggio custom
eas update --branch production --message "🐛 Fix bug donazioni"
```

---

## 🚨 Troubleshooting

### Errore: "Service account not found"

**Causa**: Service account non collegato a Play Console

**Soluzione**:

1. Verifica su Play Console → Setup → API access
2. Service account deve essere presente e linked
3. Verifica permissions su Users and permissions

### Errore: "Upload key doesn't match"

**Causa**: Upload key diversa da quella registrata

**Soluzione**:

1. Usa Play App Signing (Google gestisce keys)
2. Lascia che EAS generi upload key automatica
3. Mai usare keystore manuale con Play App Signing attivo

### Errore: "Version code already exists"

**Causa**: `versionCode` già usato in una release precedente

**Soluzione**:

```bash
# Incrementa versionCode in app.config.js
versionCode: parseInt(process.env.ANDROID_VERSION_CODE || '5', 10)

# O imposta variabile ambiente
export ANDROID_VERSION_CODE=5
```

### Build Fallita

**Debug build:**

```bash
# Verifica build logs su EAS
eas build:list --platform android

# Verifica configurazione locale
eas build --platform android --profile production-store --local
```

### Submit Fallito

**Verifica credentials:**

```bash
# Testa service account JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('./google-service-account.json', 'utf8')))"

# Verifica formato JSON valido
# Output dovrebbe includere: type, project_id, private_key, client_email
```

---

## 📚 Risorse Utili

- [Google Play Console](https://play.google.com/console)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Play App Signing Guide](https://developer.android.com/studio/publish/app-signing)
- [Service Account Setup](https://docs.expo.dev/submit/android/#google-service-account)

---

## ✅ Checklist Finale

Prima di submit a production:

- [ ] ✅ Service account creato e configurato
- [ ] ✅ Play App Signing attivo
- [ ] ✅ google-service-account.json salvato localmente
- [ ] ✅ Store listing completo (nome, descrizioni, screenshot)
- [ ] ✅ Data Safety completata
- [ ] ✅ Content Rating ottenuto
- [ ] ✅ Privacy policy URL aggiunto
- [ ] ✅ Build AAB testata su Internal Testing
- [ ] ✅ Test con team completato
- [ ] ✅ Version code incrementato per production
- [ ] ✅ Release notes preparate

🎉 **Sei pronto per il deploy su Google Play Store!**
