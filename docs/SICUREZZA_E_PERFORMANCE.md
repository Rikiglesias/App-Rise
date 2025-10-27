# 🔐 Sicurezza & ⚡ Performance – Stato Attuale

_Ultimo aggiornamento: 2024-12-24_  
> Panoramica pratica delle difese in essere e delle azioni consigliate prima del go‑live.

---

## ✅ Copertura Attuale

**Trasporto & Rete**
- iOS `NSAppTransportSecurity` applica TLS ≥ 1.2 e vieta traffico HTTP (`app.config.js:77`).
- Android blocca cleartext, definisce domini sicuri e pinning SHA‑256 layer enterprise (`android-network-security-config.xml:1`).
- Richieste API validate da `APISecurityService` con sanitizzazione URL, retry, timeout e rate-limiting (`src/shared/services/apiSecurity.ts:200`). Base URL derivata da `env.API_BASE_URL`.

**Storage & Secrets**
- Credenziali, token e dati sensibili gestiti via Expo SecureStore con keychain/keystore coerenti con il bundle (`src/shared/services/secureStorage.ts:21`).
- Nessun secret in repo: EAS/Play/iOS usano file esterni e variabili (`eas.json:71`).

**Aggiornamenti & Build**
- OTA Expo Updates configurato; se sono presenti le variabili `EXPO_UPDATES_CODE_SIGNING_*` le build firmano automaticamente i pacchetti (`app.config.js:15`, `docs/DEPLOYMENT_GUIDE.md:93`).
- Metro configurato con minificazione aggressiva, tree shaking e rimozione log (`metro.config.js:29`).
- Husky + CI bloccano commit/build se lint/ts/test falliscono (`.husky/pre-commit:1`, `.github/workflows/optimized-ci-cd.yml:1`).

**Monitoring & Logging**
- Logger strutturato con buffer in memoria per crash reports (`src/shared/utils/logger.ts:1`).
- Error tracking interno con handler globali, breadcrumbs e metriche performance (`src/shared/services/errorTracking.ts:37`).

**Design & UX**
- Permessi ridotti al minimo (camera, stato rete, internet). Nessun accesso alla posizione né storage legacy (`app.config.js:108`).
- Componenti platform-aware (blur/touchable/elevation) e layout immune a scaling utente (`src/components/ui`, `src/shared/utils/SystemImmunity.ts`).

---

## 🛠️ Hardening Consigliato

| Priorità | Attività | Dettagli |
| --- | --- | --- |
| Alta | **Firma OTA obbligatoria** | Genera certificato con `npx expo-updates codesigning:generate` e imposta `EXPO_UPDATES_CODE_SIGNING_*`. Verifica un update su canale `preview`. |
| Alta | **Pin TLS Android (SPKI)** | Aggiorna `android-network-security-config.xml` e `android-network-security-config.prod.xml` con pin SPKI (leaf + backup). Vedi guida sotto. |
| Media | **Monitor esterno** | Se necessario, integra Sentry/Crashlytics usando il wrapper già predisposto in `errorTracking`. |
| Media | **Audit periodico permessi** | Mantieni la lista dei permessi Android allineata alle funzionalità reali prima di ogni release. |

---

## 🔑 Aggiornamento Pin TLS (Android)

1. Recupera il certificato del dominio (es. `api.riseagainsthunger.org`):

   ```bash
   echo | openssl s_client -servername api.riseagainsthunger.org -connect api.riseagainsthunger.org:443 2>/dev/null \
     | openssl x509 -pubkey -noout \
     | openssl pkey -pubin -outform DER \
     | openssl dgst -sha256 -binary \
     | openssl enc -base64
   ```

2. Ripeti per un certificato di backup (es. staging o certificato intermedio).
3. Aggiorna il blocco `<pin-set>` con i nuovi digest (sia in `android-network-security-config.xml` sia in `android-network-security-config.prod.xml`) e, se possibile, estendi la data `expiration`.
4. Testa l’app:
   - Produzione: richiesta verso `https://api...` → deve riuscire.
   - Dominio manomesso/vecchio certificato → la richiesta deve fallire con errore di handshake.

> Suggerimento: conserva i pin precedenti finché il nuovo certificato non è in produzione, per evitare lock-out.

---

## 📈 Performance

- **Metro & bundling**
  - Minifier custom, inlineRequires attivato, blocklist test, caching ottimizzato (`metro.config.js:29`).
- **Rendering**
  - Componenti critical path (mappe, animazioni) ottimizzati per Android/iOS con props specifiche (`src/components/layout/InteractiveMap.tsx:186`, `src/components/ui/Platform*`).
- **Monitoring**
  - `performanceMonitor` traccia interazioni critiche; hook `usePerformanceMonitor` disponibile per componenti custom (`src/shared/hooks/usePerformanceMonitor.ts:1`).
- **Pipeline**
  - Workflow `optimized-ci-cd` esegue typecheck, lint, prettier e test in parallelo; `cache-management` mantiene lo stato pulito (`.github/workflows`). 

**Ottimizzazioni future suggerite**
- Integrare report bundle (`npm run bundle:report`) nel CI su richiesta.
- Valutare split dinamico per schermate secondarie se la dimensione del bundle dovesse crescere oltre le soglie definite in `docs/FILE_SIZE_STANDARDS.md`.

---

## 📝 Checklist Pre‑Release

- [ ] Variabili OTA di code signing configurate in ambiente CI/CD.
- [ ] Pin SPKI Android aggiornati e verificati.
- [ ] Permessi Android/iOS riesaminati e documentati.
- [ ] `npm run post-modifiche` → 0 problemi.
- [ ] Build EAS `production-store` (AAB) e `production` (IPA) completate.

---

**Contatti**  
Per ulteriori verifiche di sicurezza o performance profiling, coinvolgere il team mobile o gli specialisti IT di Rise Against Hunger Italia.





