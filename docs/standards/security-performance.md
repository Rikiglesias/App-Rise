# Sicurezza & Performance — Stato Attuale

Panoramica pratica delle difese in essere e delle azioni consigliate prima del
go-live. Descrive ciò che è effettivamente configurato nel repo (Expo SDK 54
managed + EAS).

---

## Copertura Attuale

### Trasporto & Rete

- iOS `NSAppTransportSecurity` vieta il traffico arbitrario
  (`NSAllowsArbitraryLoads: false`) e impone TLS ≥ 1.2 con forward secrecy sui
  domini `riseagainsthunger.org` (`app.config.js`).
- Android usa una network security config dedicata: in development
  `android-network-security-config.xml`, in produzione
  `android-network-security-config.prod.xml`
  (`app.config.js`, chiave `android.networkSecurityConfig`). Cleartext bloccato;
  vedi sotto per il pinning SPKI.

### Storage & Secrets

- La sessione Supabase è salvata via Expo SecureStore (keychain iOS / keystore
  Android), con un adapter custom che splitta in chunk i valori oltre il limite
  ~2048 byte (`src/shared/auth/authStorage.ts`). Su web (solo dev/preview) il
  fallback è `localStorage`, senza cifratura nativa.
- Nessun secret committato: DSN Sentry, chiavi e token vengono da variabili
  d'ambiente (`EXPO_PUBLIC_*`, `SENTRY_*`, `EAS`) e non sono nel repo
  (`App.tsx`, `app.config.js`, `eas.json`).

### Aggiornamenti & Build

- OTA Expo Updates configurato (`app.config.js`, blocco `updates`); se sono
  presenti le variabili `EXPO_UPDATES_CODE_SIGNING_*` le build firmano i
  pacchetti OTA (code signing certificate + metadata).
- Metro usa la config Sentry (`getSentryExpoConfig`) con `inlineRequires`
  attivo e l'upload automatico delle source map al build EAS quando il plugin
  Sentry è attivo (`metro.config.js`). Nota: la minificazione è quella di
  default di Expo/Metro — non c'è un `minifierConfig` custom.
- Husky + CI bloccano commit/build se TypeScript/ESLint/Prettier/test falliscono
  (`.husky/pre-commit` esegue `check:strict` + `lint-staged`;
  `.github/workflows/optimized-ci-cd.yml`).

### Monitoring & Logging

- Logger strutturato con buffer in memoria per i log/crash report
  (`src/shared/utils/logger.ts`).
- Crash reporting via Sentry (`@sentry/react-native`): inizializzato in
  `App.tsx` (`Sentry.init`, attivo solo se `EXPO_PUBLIC_SENTRY_DSN` è presente,
  altrimenti no-op) e usato nell'`ErrorBoundary` per catturare gli errori di
  render con il component stack (`src/shared/components/ErrorBoundary.tsx`).

### Design & UX

- Permessi ridotti al minimo: `CAMERA`, `INTERNET`, `ACCESS_NETWORK_STATE`.
  Nessun accesso a posizione o storage legacy; `AD_ID` esplicitamente bloccato
  (`app.config.js`, blocco `android.permissions` / `blockedPermissions`).
- Layout immune al font scaling utente via `SystemImmunity`
  (`src/shared/utils/SystemImmunity.ts`) e componenti `PerfectText` /
  `PerfectImage`.

---

## Hardening Consigliato

| Priorità | Attività | Dettagli |
| --- | --- | --- |
| Alta | Firma OTA obbligatoria | Genera il certificato con `npx expo-updates codesigning:generate` e imposta le `EXPO_UPDATES_CODE_SIGNING_*`. Verifica un update sul canale `preview`. |
| Alta | Pin TLS Android (SPKI) | Aggiorna `android-network-security-config.xml` e `android-network-security-config.prod.xml` con i pin SPKI (leaf + backup). Vedi guida sotto. |
| Media | Monitor esterno | Sentry è già integrato (`@sentry/react-native`): basta impostare `EXPO_PUBLIC_SENTRY_DSN` (+ `SENTRY_ORG`/`SENTRY_PROJECT` per il plugin nativo e l'upload source map). |
| Media | Audit periodico permessi | Mantieni la lista dei permessi Android allineata alle funzionalità reali prima di ogni release. |

---

## Aggiornamento Pin TLS (Android)

1. Recupera il certificato del dominio (es. `api.riseagainsthunger.org`):

   ```bash
   echo | openssl s_client -servername api.riseagainsthunger.org -connect api.riseagainsthunger.org:443 2>/dev/null \
     | openssl x509 -pubkey -noout \
     | openssl pkey -pubin -outform DER \
     | openssl dgst -sha256 -binary \
     | openssl enc -base64
   ```

2. Ripeti per un certificato di backup (es. staging o certificato intermedio).
3. Aggiorna il blocco `<pin-set>` con i nuovi digest (sia in
   `android-network-security-config.xml` sia in
   `android-network-security-config.prod.xml`) e, se possibile, estendi la data
   `expiration`.
4. Testa l'app:
   - Produzione: richiesta verso `https://api...` deve riuscire.
   - Dominio manomesso / vecchio certificato: la richiesta deve fallire con
     errore di handshake.

> Suggerimento: conserva i pin precedenti finché il nuovo certificato non è in
> produzione, per evitare lock-out.

---

## Performance

- Metro & bundling: `inlineRequires` attivo, resolver con alias di percorso,
  serializer Sentry per le source map (`metro.config.js`).
- Rendering: i componenti del critical path (mappa, animazioni) sono ottimizzati
  con props specifiche per piattaforma
  (`src/components/layout/InteractiveMap.tsx`, `src/components/ui/Platform*`).
- Pipeline: il workflow `optimized-ci-cd` esegue typecheck, lint, prettier e
  test in parallelo (`.github/workflows/optimized-ci-cd.yml`).

### Ottimizzazioni future suggerite

- Integrare il report bundle (`npm run bundle:report`) nel CI quando serve.
- Valutare uno split dinamico per le schermate secondarie se la dimensione del
  bundle cresce oltre le soglie definite in `docs/standards/file-size.md`.

---

## Checklist Pre-Release

- [ ] Variabili OTA di code signing configurate in ambiente CI/CD.
- [ ] Pin SPKI Android aggiornati e verificati.
- [ ] Permessi Android/iOS riesaminati e documentati.
- [ ] `npm run post-modifiche` → 0 problemi.
- [ ] Build EAS `production-store` (AAB) e `production` (IPA) completate.

---

Per il flusso di deploy completo vedi `docs/guides/deployment.md`. Per
ulteriori verifiche di sicurezza o performance profiling, coinvolgere il team
mobile o gli specialisti IT di Rise Against Hunger Italia.
