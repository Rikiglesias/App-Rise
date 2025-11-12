# 🔄 Guida OTA Updates - Rise Against Hunger Italia

## Panoramica

Il sistema Over-The-Air (OTA) Updates permette di aggiornare l'app **senza passare dagli store** (Apple App Store / Google Play Store). Gli utenti riceveranno gli aggiornamenti automaticamente quando aprono l'app.

## ✨ Caratteristiche

- ✅ **Aggiornamenti silenziosi** - Check in background quando l'app torna attiva
- ✅ **UI moderna e attraente** - Schermata di caricamento coerente con il design system
- ✅ **Zero interruzioni** - Aggiornamento applicato al prossimo riavvio
- ✅ **Code signing** - Sicurezza con certificati per validare aggiornamenti
- ✅ **Instant Time-To-Interactive** - Nessun delay all'avvio

## 🎨 Schermata Aggiornamento

La nuova `OTAUpdateScreen` mostra:
- Animazione pulse sul logo
- Barra di progresso durante download
- Messaggi chiari e rassicuranti
- Design premium: gradient nero/rosso brand

## 📋 Quando Usare OTA Updates

### ✅ Perfetto per:
- Fix bug critici
- Correzioni UI/UX
- Aggiornamenti contenuti (testi, immagini statiche)
- Miglioramenti performance
- Modifiche logica business

### ❌ NON compatibile con:
- Modifiche codice nativo (iOS/Android)
- Aggiornamenti dipendenze native
- Modifiche expo-updates / app.config.js
- Cambio major version di Expo SDK
- Modifiche permessi app

> **Regola**: Se modifichi solo JavaScript/TypeScript/React → OTA ✅  
> Se modifichi nativo/config → Build completa ❌

## 🚀 Come Pubblicare OTA Update

### 1. Sviluppo e Test

```bash
# Sviluppa come sempre
npm run dev:android  # o dev:expo-go

# Verifica qualità
npm run post-modifiche
```

### 2. Pubblica Update (Produzione)

```bash
# Update su branch production (utenti live)
npm run update:production -- "Fix bug X e miglioramenti UI"

# Oppure usa il workflow interattivo
npm run update:gui
```

### 3. Verifica Deployment

```bash
# Controlla stato update
npm run update:status
```

## 📱 Esperienza Utente

### Scenario 1: App in foreground
1. Utente usa l'app normalmente
2. Check aggiornamenti avviene in background (silenzioso)
3. Se aggiornamento disponibile, viene scaricato
4. Nessuna interruzione - aggiornamento applicato al prossimo restart

### Scenario 2: App torna da background
1. Utente switcha ad altra app e torna
2. Check aggiornamenti automatico
3. Se disponibile: download in background
4. Se download rapido: schermata moderna mostrata brevemente
5. App si riavvia con nuovo update

### Scenario 3: Primo avvio dopo update
1. Splash screen normale
2. App carica subito (no delay da OTA check)
3. Tutto funziona con il codice aggiornato ✨

## 🔐 Sicurezza

Gli OTA updates sono protetti con:

- **Code Signing**: Certificato RSA per validare autenticità
- **HTTPS**: Tutti i download via connessione sicura
- **Validation**: Hash e integrità verificati prima dell'applicazione

Configurazione in `app.config.js`:
```javascript
codeSigningCertificate: process.env.EXPO_UPDATES_CODE_SIGNING_CERTIFICATE
codeSigningMetadata: { keyId: 'main', alg: 'rsa-v1_5-sha256' }
```

## 📊 Monitoraggio

### Log Sistema

```typescript
// In App.tsx
logger.info('App', '✅ App initialized with OTA Updates enabled');

// In useOTAUpdates.ts
logger.info('OTA Updates', 'Update available, downloading...');
logger.info('OTA Updates', 'Update downloaded. It will apply on next app restart.');
```

### Dashboard EAS

Vai su [expo.dev/accounts/rikiglesias/projects/rise-against-hunger-italia/updates](https://expo.dev) per:
- Vedere tutti gli updates pubblicati
- Controllare adoption rate
- Verificare errori di download
- Gestire canali (production, preview, dev)

## 🛠️ Configurazione Tecnica

### app.config.js
```javascript
updates: {
  fallbackToCacheTimeout: 0,        // Instant TTI
  checkAutomatically: 'ON_ERROR_RECOVERY', // Check solo su errori
  url: 'https://u.expo.dev/[PROJECT_ID]',
}
```

### Hook useOTAUpdates
- Check silenzioso in background
- Progress tracking (0-100%)
- Error handling graceful
- AppState listener per check su resume

### Componente OTAUpdateScreen
- Design system coherente (Perfect Scale, Colors)
- Animazioni fluide (pulse, fade, progress)
- BlurView + LinearGradient per depth
- Responsive su tutti device

## 🧪 Testing

### Test Manuale OTA Update

1. **Build preview con OTA abilitato**:
   ```bash
   eas build --profile preview --platform ios
   ```

2. **Installa build su device**

3. **Pubblica update**:
   ```bash
   eas update --branch preview --message "Test OTA"
   ```

4. **Test sul device**:
   - Apri app → chiudi → riapri
   - Vedrai schermata aggiornamento se update disponibile
   - App si riavvia con nuovo codice

### Test in Sviluppo

```bash
# Development build con OTA support
npm run ios:build:dev

# Poi pubblica update su branch development
npm run update:dev -- "Test feature X"
```

## 📖 Comandi Utili

```bash
# Pubblica update produzione
npm run update:production -- "Messaggio commit"

# Pubblica update iOS only
npm run update:production:ios -- "Messaggio commit"

# GUI interattiva per updates
npm run update:gui

# Controlla stato updates
npm run update:status

# Testa workflow completo
npm run update:workflow-test
```

## 🚨 Troubleshooting

### Update non si applica
- Verifica branch corretto: `eas channel:view production`
- Controlla code signing certificate configurato
- Verifica app usa runtime version compatibile

### Schermata update non appare
- Normale! Se download veloce, schermata appare brevemente
- Check avviene in background - nessuna UI se non necessario

### App crasha dopo update
- Rollback immediato: pubblica versione precedente
- Verifica non hai modificato codice nativo
- Check logs: `npx expo-updates:codesigning:verify`

## 📚 Risorse

- [Expo Updates Docs](https://docs.expo.dev/versions/latest/sdk/updates/)
- [EAS Update Guide](https://docs.expo.dev/eas-update/introduction/)
- [Code Signing](https://docs.expo.dev/eas-update/code-signing/)

---

**Versione**: 1.0  
**Ultimo aggiornamento**: 12 Nov 2024  
**Maintainer**: Rise Against Hunger Italia Tech Team
