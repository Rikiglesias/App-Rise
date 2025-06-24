# 🚀 Guida Aggiornamenti Over-the-Air (OTA)

## Cos'è un Aggiornamento OTA?

Gli **aggiornamenti Over-the-Air (OTA)** permettono di inviare aggiornamenti dell'app **direttamente agli
utenti senza passare dagli store** (Google Play Store / Apple App Store).

### ✅ Vantaggi degli OTA

- **Istantanei**: Gli utenti ricevono l'aggiornamento al prossimo avvio dell'app
- **Bypass Store**: Nessuna review degli store (24-72h di attesa)
- **Controllo totale**: Puoi decidere quando e come distribuire
- **Rollback rapido**: Possibilità di tornare indietro velocemente

### ⚠️ Limitazioni degli OTA

- **Solo JavaScript/TypeScript**: Non possono modificare codice nativo (iOS/Android)
- **No nuove dipendenze native**: Nuove librerie native richiedono build completa
- **No cambi configurazione**: Modifiche a `app.config.js` richiedono build completa

## 🛠️ Configurazione Attuale

La tua app è già configurata per gli aggiornamenti OTA:

- **Project ID**: `52a33b0f-dec1-4674-812b-de5b888c911a`
- **Updates URL**: `https://u.expo.dev/52a33b0f-dec1-4674-812b-de5b888c911a`
- **Canali attivi**: `development`, `preview`, `production`

## 📱 Tipi di Aggiornamento

### 1. 🔧 **Development**

- **Per**: Test interni del team
- **Canale**: `development`
- **Uso**: Funzionalità in sviluppo, esperimenti

### 2. 👁️ **Preview**

- **Per**: Beta tester, stakeholder
- **Canale**: `preview`
- **Uso**: Release candidate, demo

### 3. 🌟 **Production**

- **Per**: Utenti finali (LIVE)
- **Canale**: `production`
- **Uso**: Aggiornamenti ufficiali

### 4. 🚨 **Hotfix**

- **Per**: Correzioni urgenti produzione
- **Canale**: `production` (prioritario)
- **Uso**: Bug critici, problemi di sicurezza

## 🚀 Come Pubblicare Aggiornamenti

### Metodo 1: Script Interattivo (CONSIGLIATO)

```bash
npm run update:gui
```

Lo script ti guiderà passo per passo con un'interfaccia user-friendly.

### Metodo 2: Comandi Diretti

```bash
# Aggiornamento sviluppo
npm run update:dev "Nuova funzionalità X"

# Aggiornamento preview
npm run update:preview "Release candidate v1.3.0"

# Aggiornamento produzione
npm run update:production "Miglioramenti UI e correzioni"

# Hotfix urgente
npm run update:hotfix "Fix critico bug login"
```

### Metodo 3: Comando EAS Diretto

```bash
# Esempio aggiornamento produzione
npx eas update --branch production --message "Descrizione aggiornamento"
```

## 📊 Controllo Stato Aggiornamenti

```bash
# Interfaccia completa stato
npm run update:status

# Lista aggiornamenti specifico canale
npx eas update:list --branch production

# Dettagli progetto
npx eas project:info
```

## 🔄 Workflow Completo

### 1. **Preparazione**

```bash
# Controlli qualità automatici
npm run pre-modifiche
```

Il sistema verificherà automaticamente:

- Zero errori ESLint
- Zero warning TypeScript
- Tutti i test passanti

### 2. **Sviluppo**

- Implementa le modifiche
- Testa localmente
- Esegui controlli qualità

### 3. **Pubblicazione**

```bash
# Usa il tool interattivo
npm run update:gui
```

### 4. **Verifica**

```bash
# Controlla lo stato
npm run update:status
```

## 🎯 Strategia di Distribuzione

### Flusso Consigliato

1. **Development** → Test interni
2. **Preview** → Beta test con stakeholder
3. **Production** → Release agli utenti finali

### Per Hotfix Urgenti

```bash
npm run update:hotfix "Fix critico: [descrizione]"
```

## 📲 Come Funziona per gli Utenti

1. **Primo avvio**: L'app scarica automaticamente gli aggiornamenti
2. **Riavvio app**: L'aggiornamento viene applicato
3. **Transparent**: L'utente non vede il processo di update
4. **Fallback**: Se l'update fallisce, l'app usa la versione cache

## ⚡ Comandi Rapidi

| Comando | Descrizione |
|---------|-------------|
| `npm run update:gui` | **🚀 Tool interattivo (CONSIGLIATO)** |
| `npm run update:status` | 📊 Stato di tutti i canali |
| `npm run update:production "msg"` | 🌟 Update produzione |
| `npm run update:hotfix "msg"` | 🚨 Hotfix urgente |
| `npm run update:dev "msg"` | 🔧 Update sviluppo |
| `npm run update:preview "msg"` | 👁️ Update preview |

## 🛡️ Sistema Zero-Tolleranza

Gli aggiornamenti OTA sono integrati con il sistema zero-tolleranza qualità:

- **PRE-UPDATE**: Controlli automatici bloccanti
- **ZERO ERRORI**: ESLint, TypeScript, Jest
- **ZERO WARNING**: Tolleranza zero per problemi
- **ROLLBACK**: Possibilità di tornare indietro rapidamente

## 🔍 Troubleshooting

### Problema: "No updates found"

**Soluzione**: Assicurati che:

- Il branch/canale esista
- Ci siano modifiche da pubblicare
- La configurazione EAS sia corretta

### Problema: Update non ricevuto dall'app

**Soluzione**:

- Riavvia completamente l'app
- Controlla la connessione internet
- Verifica che l'app sia configurata per il canale corretto

### Problema: Errore durante pubblicazione

**Soluzione**:

- Esegui `npm run pre-modifiche`
- Correggi tutti gli errori/warning
- Riprova la pubblicazione

## 🌐 Link Utili

- **Dashboard EAS**: [expo.dev/accounts/riseagainsthunger](https://expo.dev/accounts/riseagainsthunger)
- **Documentazione Expo Updates**: [docs.expo.dev/eas-update](https://docs.expo.dev/eas-update)
- **GitHub Actions Setup**: [workflow-reference.md](./GITHUB_ACTIONS_REFERENCE.md)

---

## 🎉 Pronto all'Uso

Il sistema OTA è **completamente configurato e pronto**. Usa:

```bash
npm run update:gui
```

per il tuo primo aggiornamento OTA! 🚀
