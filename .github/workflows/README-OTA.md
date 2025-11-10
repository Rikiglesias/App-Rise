# 🚀 OTA Deploy Workflow - Documentazione

## Panoramica

Il workflow `ota-deploy.yml` automatizza la pubblicazione di aggiornamenti Over-The-Air (OTA) tramite Expo Application Services (EAS).

## Quando Si Attiva

### Automatico (Push su Master)
Il workflow si attiva automaticamente quando:
- Viene fatto push su branch `master`
- Le modifiche riguardano:
  - `src/**` (codice sorgente)
  - `assets/**` (immagini, icone)
  - `app.config.js` (configurazione)
  - `package.json` (dipendenze)

### Manuale (Workflow Dispatch)
Puoi attivare manualmente il workflow da:
- GitHub → Actions → "🚀 OTA Deploy" → Run workflow

**Opzioni manuali:**
- **message**: Messaggio custom per l'update
- **branch**: Target branch EAS (`production`, `preview`, `development`)

## Fasi del Workflow

### 1️⃣ Quality Checks (✅)
Prima di pubblicare, esegue controlli di qualità:

```bash
✅ TypeScript Check  → npx tsc --noEmit (BLOCCA se errori)
⚠️ ESLint Check     → npx eslint (warning, non blocca)
⚠️ Tests            → npm test (warning, non blocca)
📊 Conta Problemi   → npm run conta-problemi (info)
```

**Nota:** Solo TypeScript check è bloccante. Lint e test producono warning ma non fermano il deploy.

### 2️⃣ Deploy OTA (🚀)
Pubblica l'update su Expo:

```bash
eas update --branch production --message "..."
```

**Features:**
- ✅ Retry automatico (3 tentativi)
- ✅ Messaggio commit automatico
- ✅ Autenticazione sicura via `EXPO_TOKEN`
- ✅ Non-interactive mode

### 3️⃣ Notify Results (📢)
Notifica risultato del deploy:
- ✅ Success → Log conferma + dettagli update
- ❌ Failure → Log errore + exit code

## Configurazione Necessaria

### Secrets GitHub

Devi configurare il seguente secret nel repository:

1. **`EXPO_TOKEN`** (OBBLIGATORIO)
   - Vai su: https://expo.dev/accounts/[username]/settings/access-tokens
   - Crea nuovo token con permesso "Read and write"
   - Aggiungi su GitHub:
     - Repository → Settings → Secrets and variables → Actions
     - New repository secret: `EXPO_TOKEN`

### Variabili Ambiente

Il workflow usa queste variabili:

```yaml
NODE_VERSION: '20.17.0'  # Versione Node.js
EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}  # Token Expo
```

## Come Usare

### Scenario 1: Deploy Automatico

```bash
# 1. Fai modifiche al codice
git checkout -b feature/fix-traduzione
# ... modifiche ...

# 2. Commit e push
git commit -am "fix: traduzione home screen"
git push origin feature/fix-traduzione

# 3. Crea PR e merge su master
# GitHub Actions → Merge su master → OTA deploy automatico! ✅
```

### Scenario 2: Deploy Manuale

```bash
# 1. Vai su GitHub
# Repository → Actions → "🚀 OTA Deploy" → Run workflow

# 2. Configura:
# - Branch: production
# - Message: "Hotfix: crash all'apertura"
# - Run workflow

# 3. Attendi ~5 minuti
# ✅ Update pubblicato!
```

### Scenario 3: Hotfix Urgente

```bash
# 1. Fix locale
nano src/App.tsx
git commit -am "hotfix: critical crash fix"

# 2. Push su master (bypass PR se urgente)
git push origin master

# 3. Workflow parte automaticamente
# ✅ Update live in ~5 minuti
```

## Tempi di Esecuzione

```
Quality Checks:  2-3 minuti
Deploy OTA:      2-3 minuti
Notify:          < 30 secondi
----------------------------
TOTALE:          4-7 minuti
```

## Troubleshooting

### Errore: "Not authenticated with Expo"

**Causa:** `EXPO_TOKEN` non configurato o invalido

**Fix:**
```bash
# 1. Verifica token esistente
gh secret list

# 2. Ricrea token su expo.dev
# 3. Aggiorna secret su GitHub
gh secret set EXPO_TOKEN
```

### Errore: "TypeScript check failed"

**Causa:** Errori TypeScript nel codice

**Fix:**
```bash
# Locale
npx tsc --noEmit

# Correggi errori
# Commit fix
# Re-push
```

### Errore: "Failed to publish after 3 attempts"

**Causa:** Problemi rete o Expo server

**Fix:**
- Attendi 5-10 minuti
- Re-run workflow manualmente
- Controlla status Expo: https://status.expo.dev

## Sicurezza

### ✅ Best Practices Implementate

1. **Token Sicuro**
   - `EXPO_TOKEN` mai hardcoded
   - Stored come GitHub Secret
   - Non loggato in output

2. **Permissions Minime**
   ```yaml
   permissions:
     contents: read
     pull-requests: write
   ```

3. **Concurrency Control**
   - Un solo deploy OTA alla volta
   - Previene conflitti

4. **Timeout**
   - Quality checks: 10 minuti max
   - Deploy: 15 minuti max
   - Previene hang infiniti

## Monitoraggio

### Logs GitHub Actions

```
Repository → Actions → "🚀 OTA Deploy" → Latest run
```

### EAS Dashboard

```
https://expo.dev/accounts/rikiglesias/projects/rise-against-hunger-italia/updates
```

### Verifica Update Pubblicato

```bash
eas update:list --branch production --limit 1
```

## Rollback

Se un update causa problemi:

```bash
# Metodo 1: Rollback EAS
eas update:rollback --branch production

# Metodo 2: Re-deploy versione precedente
git revert HEAD
git push origin master
# Workflow automatico re-deploya versione precedente
```

## Notifiche

Il workflow può essere esteso con notifiche:

### Slack
```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "🚀 OTA Update deployed!"
      }
```

### Email
```yaml
- name: Send Email
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: OTA Deploy Success
    body: Update deployed successfully!
```

## FAQ

### Q: Il workflow parte anche per PR?
**A:** No, solo su push a `master` o trigger manuale.

### Q: Posso fare deploy su branch diversi da production?
**A:** Sì, usa workflow_dispatch e seleziona branch target.

### Q: Quanto tempo per applicare update sugli utenti?
**A:** 1-30 minuti, dipende da quando l'app controlla updates.

### Q: Posso testare prima del deploy production?
**A:** Sì, fai deploy su branch `preview` prima.

### Q: I tests bloccano il deploy?
**A:** No, solo TypeScript check è bloccante. Tests sono warning.

## Metriche

Il workflow traccia:
- ✅ Success rate
- ⏱️ Durata deploy
- 📊 Numero updates/settimana
- ❌ Failure rate

Visibili su: GitHub Actions → Insights → Workflows

## Prossimi Miglioramenti

- [ ] Notifiche Slack/Discord
- [ ] Rollback automatico su crash spike
- [ ] A/B testing support
- [ ] Progressive rollout (%)
- [ ] Staging → Production pipeline

## Supporto

Per problemi o domande:
- GitHub Issues
- Expo Discord: https://discord.gg/expo
- EAS Docs: https://docs.expo.dev/eas-update/

---

**Versione:** 1.0.0  
**Ultimo aggiornamento:** 2025-11-10  
**Maintainer:** @rikiglesias
