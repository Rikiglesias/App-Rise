# 🔐 Setup GitHub Secrets - Guida Completa

## Secrets Necessari per CI/CD

Per far funzionare i workflow GitHub Actions, devi configurare i seguenti secrets.

---

## 1. EXPO_TOKEN (OBBLIGATORIO per OTA)

**Serve per:** Autenticare GitHub Actions con Expo/EAS per pubblicare OTA updates.

### Come Ottenere il Token

#### Metodo 1: CLI (Consigliato)

```bash
# 1. Login con Expo CLI
npx expo login

# 2. Crea personal access token
npx expo whoami
# Vai su: https://expo.dev/accounts/[username]/settings/access-tokens

# 3. Oppure usa comando diretto
eas token:create
```

#### Metodo 2: Web Dashboard

1. Vai su: https://expo.dev
2. Login con account
3. Vai su: Settings → Access Tokens
4. Click "Create Token"
5. Nome: `GitHub Actions CI/CD`
6. Permessi: **Read and write**
7. Scadenza: **No expiration** (consigliato per CI/CD)
8. Copia il token (IMPORTANTE: non lo vedrai più!)

### Come Configurare su GitHub

#### Metodo 1: GitHub CLI (Veloce)

```bash
# Naviga nella root del progetto
cd "c:\Users\albie\Desktop\Programmi\App Rise"

# Configura secret
gh secret set EXPO_TOKEN
# Incolla il token quando richiesto
```

#### Metodo 2: Web Interface

1. Vai su: https://github.com/Rikiglesias/App-Rise
2. Click su: **Settings**
3. Nel menu laterale: **Secrets and variables** → **Actions**
4. Click: **New repository secret**
5. Name: `EXPO_TOKEN`
6. Secret: `[incolla il token copiato]`
7. Click: **Add secret**

### Verifica Configurazione

```bash
# Lista secrets configurati
gh secret list

# Output atteso:
# EXPO_TOKEN  Updated 2025-11-10
```

---

## 2. Altri Secrets Utili (Opzionali)

### SLACK_WEBHOOK (Notifiche Slack)

**Serve per:** Ricevere notifiche su Slack quando deploy avviene.

```bash
# 1. Crea Incoming Webhook su Slack
# https://api.slack.com/messaging/webhooks

# 2. Configura secret
gh secret set SLACK_WEBHOOK
# Incolla: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX
```

### SENTRY_AUTH_TOKEN (Error Tracking)

**Serve per:** Upload sourcemaps su Sentry per debugging produzione.

```bash
# 1. Ottieni token da Sentry
# https://sentry.io/settings/account/api/auth-tokens/

# 2. Configura secret
gh secret set SENTRY_AUTH_TOKEN
```

### GOOGLE_SERVICES_JSON (Android Build)

**Serve per:** Build Android con Firebase/Google Services.

```bash
# 1. Scarica google-services.json da Firebase Console
# 2. Converti in base64
cat google-services.json | base64 -w 0 > google-services.json.base64

# 3. Configura secret
gh secret set GOOGLE_SERVICES_JSON
# Incolla contenuto del file .base64
```

---

## Verifica Completa Setup

### Test 1: Verifica Secrets Configurati

```bash
gh secret list
```

**Output atteso:**
```
EXPO_TOKEN              Updated 2025-11-10
```

### Test 2: Verifica Autenticazione Expo

```bash
# Testa localmente con stesso token
export EXPO_TOKEN="[tuo token]"
eas whoami

# Output atteso:
# Logged in as rikiglesias
```

### Test 3: Trigger Workflow Manuale

1. Vai su: https://github.com/Rikiglesias/App-Rise/actions
2. Click su: **🚀 OTA Deploy - Manual Only**
3. Click: **Run workflow**
4. Seleziona:
   - Branch: `master`
   - Message: `Test workflow setup`
   - Target: `preview`
5. Click: **Run workflow**

**Attendi 5 minuti:**
- ✅ Quality checks pass
- ✅ Deploy OTA success
- ✅ Workflow completes

---

## Troubleshooting

### Errore: "Secret not found"

**Problema:** Secret non configurato o nome errato

**Fix:**
```bash
# Verifica nome esatto
gh secret list

# Secret deve essere ESATTAMENTE: EXPO_TOKEN
# Non: expo_token, ExpoToken, EXPO-TOKEN
```

### Errore: "Invalid token"

**Problema:** Token scaduto o permessi insufficienti

**Fix:**
1. Ricrea token su expo.dev
2. Assicurati di selezionare **Read and write**
3. Aggiorna secret su GitHub

### Errore: "Authentication failed"

**Problema:** Token non ha permessi EAS Update

**Fix:**
```bash
# Verifica permessi token
npx eas token:list

# Crea nuovo token con permessi corretti
npx eas token:create --name "GitHub Actions" --scope update
```

---

## Sicurezza Best Practices

### ✅ DO

- ✅ Usa token con **scadenza limitata** per dev/test
- ✅ Usa token **no expiration** solo per CI/CD production
- ✅ **Ruota** token ogni 6-12 mesi
- ✅ Usa **GitHub Secrets** (encrypted at rest)
- ✅ Limita **permessi** al minimo necessario
- ✅ **Monitora** uso token su Expo dashboard

### ❌ DON'T

- ❌ Mai committare token nel codice
- ❌ Mai loggare token in output
- ❌ Mai condividere token via email/chat
- ❌ Mai usare stesso token per dev locale e CI/CD
- ❌ Mai dare permessi "Admin" a token CI/CD

---

## Token Rotation (Ogni 6 Mesi)

### 1. Crea Nuovo Token

```bash
npx eas token:create --name "GitHub Actions 2025-Q2"
```

### 2. Aggiorna Secret GitHub

```bash
gh secret set EXPO_TOKEN
# Incolla nuovo token
```

### 3. Testa Workflow

```bash
# Trigger manuale per test
gh workflow run "ota-deploy.yml"
```

### 4. Revoca Token Vecchio

```bash
npx eas token:revoke [old-token-id]
```

---

## Status Check

### ✅ Checklist Completa

Prima di fare primo deploy OTA, verifica:

- [ ] `EXPO_TOKEN` configurato su GitHub
- [ ] Token ha permessi "Read and write"
- [ ] Token valido: `eas whoami` funziona
- [ ] Workflow esiste: `.github/workflows/ota-deploy.yml`
- [ ] Branch `master` protetto (optional)
- [ ] Test workflow manuale passa

**Se tutti ✅ → Pronto per primo OTA deploy automatico!** 🚀

---

## Support

**Problemi setup:**
- GitHub Docs: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- Expo Docs: https://docs.expo.dev/eas-update/github-actions/

**Token issues:**
- Expo Discord: https://discord.gg/expo
- EAS Support: support@expo.dev

---

**Versione:** 1.0.0  
**Ultimo aggiornamento:** 2025-11-10  
**Maintainer:** @rikiglesias
