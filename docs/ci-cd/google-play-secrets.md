# 🔐 GitHub Actions Secrets - Google Play Deploy

Guida per configurare GitHub Secrets per deploy automatico Android su Google Play Store.

---

## 📋 Panoramica

Per abilitare deploy automatico Android via GitHub Actions, devi configurare questi secrets nel repository GitHub.

---

## 🔑 Secrets Richiesti

### 1. GOOGLE_SERVICE_ACCOUNT_JSON

**Descrizione**: Contenuto completo del file service account JSON da Google Cloud

**Come ottenerlo**:

```bash
# 1. Scarica JSON da Google Cloud Console (vedi google-play-setup.md)
# 2. Copia TUTTO il contenuto del file
cat google-service-account.json

# Output esempio:
{
  "type": "service_account",
  "project_id": "your-project-123",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  ...
}
```

**Come aggiungerlo su GitHub**:

1. Vai su repository GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `GOOGLE_SERVICE_ACCOUNT_JSON`
4. Value: Copia-incolla **tutto** il contenuto del file JSON (incluse parentesi graffe)
5. Click **Add secret**

⚠️ **IMPORTANTE**: 
- Copia TUTTO il file JSON, incluse le parentesi graffe `{}`
- Non modificare nulla (spazi, newlines, etc.)
- Verifica che la chiave privata inizi con `-----BEGIN PRIVATE KEY-----`

---

### 2. ANDROID_VERSION_CODE

**Descrizione**: Numero intero che identifica univocamente ogni build Android

**Valore**:
```
5
```

**Come gestirlo**:

```bash
# Incrementa ad ogni release
# Release 1: versionCode = 1
# Release 2: versionCode = 2
# Release 3: versionCode = 3
# etc.

# REGOLA: versionCode DEVE essere > di tutte le release precedenti
```

**Come aggiungerlo su GitHub**:

1. GitHub → Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `ANDROID_VERSION_CODE`
4. Value: `5` (o numero successivo alla tua ultima release)
5. Add secret

**Aggiornamento per nuove release**:

```bash
# Prima di ogni release, incrementa:
# 1. Vai su GitHub → Settings → Secrets → ANDROID_VERSION_CODE
# 2. Click "Update"
# 3. Incrementa valore (es. da 5 a 6)
# 4. Save

# Oppure usa variabile in workflow direttamente
```

---

### 3. EXPO_TOKEN (Opzionale - Raccomandato)

**Descrizione**: Token EAS per autenticazione build automatiche

**Come ottenerlo**:

```bash
# 1. Login EAS
eas login

# 2. Genera token
eas build:configure

# 3. Crea personal access token
# Vai su: https://expo.dev/accounts/[your-account]/settings/access-tokens
# Click "Create token"
# Nome: GitHub Actions Android Deploy
# Copia il token generato
```

**Come aggiungerlo su GitHub**:

1. GitHub → Settings → Secrets and variables → Actions
2. New repository secret
3. Name: `EXPO_TOKEN`
4. Value: [token generato da Expo]
5. Add secret

---

## 🔄 Workflow GitHub Actions

### Esempio Workflow Android Deploy

Crea file `.github/workflows/android-deploy.yml`:

```yaml
name: Android Production Deploy

on:
  push:
    tags:
      - 'v*'  # Trigger su tag tipo v1.0.0

jobs:
  deploy:
    name: Deploy Android to Google Play
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build Android AAB
        run: eas build --platform android --profile production-store --non-interactive
        env:
          ANDROID_VERSION_CODE: ${{ secrets.ANDROID_VERSION_CODE }}

      - name: Submit to Google Play
        run: eas submit --platform android --latest --non-interactive
        env:
          GOOGLE_SERVICE_ACCOUNT_JSON: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_JSON }}

      - name: Notify on success
        if: success()
        run: |
          echo "✅ Deploy Android completato!"
          echo "🎉 App disponibile su Google Play Console"
```

---

## 📝 Checklist Setup Secrets

Prima di attivare deploy automatico, verifica:

- [ ] ✅ `GOOGLE_SERVICE_ACCOUNT_JSON` configurato
  - [ ] Contiene JSON completo con parentesi graffe
  - [ ] Include `private_key` con header/footer
  - [ ] Service account collegato a Play Console
  - [ ] Permessi "Create releases" assegnati

- [ ] ✅ `ANDROID_VERSION_CODE` configurato
  - [ ] Valore > ultima release su Play Store
  - [ ] Numero intero valido

- [ ] ✅ `EXPO_TOKEN` configurato (opzionale)
  - [ ] Token valido e non scaduto
  - [ ] Account Expo corretto

---

## 🧪 Test Secrets Configuration

### Test Locale

Prima di usare GitHub Actions, testa localmente:

```bash
# 1. Esporta secrets come variabili ambiente
export GOOGLE_SERVICE_ACCOUNT_JSON=$(cat google-service-account.json)
export ANDROID_VERSION_CODE=5

# 2. Test build
eas build --platform android --profile production-store

# 3. Test submit
eas submit --platform android --latest
```

### Test GitHub Actions

```bash
# 1. Crea branch test
git checkout -b test/github-actions-deploy

# 2. Commit workflow
git add .github/workflows/android-deploy.yml
git commit -m "test: GitHub Actions Android deploy"
git push origin test/github-actions-deploy

# 3. Crea tag test
git tag v1.0.0-test
git push origin v1.0.0-test

# 4. Monitora: https://github.com/[org]/[repo]/actions
```

---

## 🚨 Troubleshooting

### Errore: "Invalid service account JSON"

**Causa**: JSON malformato o incompleto

**Soluzione**:
```bash
# Verifica JSON valido
cat google-service-account.json | jq .

# Se OK, ricopia su GitHub Secrets
# Assicurati di NON modificare nulla
```

### Errore: "Service account doesn't have permission"

**Causa**: Permessi non assegnati su Play Console

**Soluzione**:
1. Play Console → Users and permissions
2. Trova service account
3. Edit permissions → Releases → Create and edit releases
4. Save

### Errore: "Version code 5 has already been used"

**Causa**: `ANDROID_VERSION_CODE` già usato

**Soluzione**:
```bash
# Incrementa su GitHub Secrets
# Settings → Secrets → ANDROID_VERSION_CODE → Update
# Cambia da 5 a 6 (o successivo)
```

### Errore: "EXPO_TOKEN is invalid"

**Causa**: Token scaduto o revocato

**Soluzione**:
```bash
# Rigenera token
# 1. https://expo.dev/accounts/[account]/settings/access-tokens
# 2. Revoke old token
# 3. Create new token
# 4. Update GitHub Secret
```

---

## 🔒 Sicurezza Best Practices

### ✅ DO

- ✅ Usa GitHub Secrets per credenziali sensibili
- ✅ Ruota service account keys periodicamente (ogni 6-12 mesi)
- ✅ Limita permessi service account al minimo necessario
- ✅ Monitora GitHub Actions logs per accessi non autorizzati
- ✅ Abilita 2FA su account GitHub e Google Cloud

### ❌ DON'T

- ❌ Mai committare `google-service-account.json` su Git
- ❌ Mai esporre secrets nei logs (usa `::add-mask::`)
- ❌ Mai condividere EXPO_TOKEN pubblicamente
- ❌ Mai dare permessi "Owner" a service account
- ❌ Mai usare stesso service account per dev e prod

---

## 📚 Risorse

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [EAS Build with GitHub Actions](https://docs.expo.dev/build/building-on-ci/)
- [Google Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Play Console API Access](https://developers.google.com/android-publisher/getting_started)

---

## ✅ Riepilogo

Dopo aver configurato tutti i secrets:

1. ✅ Secrets GitHub configurati
2. ✅ Workflow GitHub Actions creato
3. ✅ Test locale superato
4. ✅ Test GitHub Actions superato

🎉 **Deploy automatico attivo!**

Ogni tag `v*.*.*` triggerà build + deploy automatico su Google Play Store.

---

**Rise Against Hunger Italia** 🌍
