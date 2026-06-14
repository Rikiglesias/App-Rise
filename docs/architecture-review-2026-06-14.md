# Architecture Review — Rise Against Hunger Italia (2026-06-14)

> Review architetturale 360° multi-agente (14 agenti, 12 lenti top-to-bottom + critico + sintesi).
> Complementa l'audit bug/finding (`audit-360-2026-06-14.md`) con la dimensione architettura.

## Verdetto: **PARZIALE** — fondamenta fatte bene, problema = OVER-engineering (non under)

Il rischio che temevi (under-engineering / app fragile) **non c'è**. Le fondamenta sono **solide e proporzionate**. Il problema dominante è **l'opposto**: ~2500+ righe di infrastruttura "da SaaS" incollata su un'app di 7 schermate, + un pattern diffuso di **"capability dichiarata ≠ reale"** (commenti/doc/tipi che promettono cose inesistenti). Non è da rifare: è da **alleggerire e allineare**.

## Cosa è fatto BENE — da TENERE (non toccare)

| Area | Perché è giusto |
|---|---|
| **Boundary feature-based** | ZERO accoppiamento feature↔feature; `shared` non conosce il dominio. Il confine più importante, rispettato. |
| **Niente state manager** (no Redux/Zustand) | Corretto per 7 schermate senza dati mutabili condivisi. UN solo Context (UniversalTheme). |
| **Grafo dipendenze** | 1 solo ciclo su 241 moduli; hub design-system (perfectScale, designTokens) con fan-out sano = forma corretta di SSOT. |
| **tsconfig strict** | strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes + noImplicitOverride, tsc=0. Oltre lo standard Expo. |
| **Perfect primitives** | PerfectText (161 usi), designTokens SSOT, preset calcolati a runtime (no freeze-at-boot). Pattern da replicare. |
| **scale() per-diagonale** + classifyDeviceType SSOT | Matematica pulita e motivata. Niente FlatList su liste di 4-6 voci (corretto). |
| **Build/release** | env-gating Sentry/Maps/code-signing, appVersionSource:remote, igiene segreti completa (.gitignore copre jks/p8/p12, git ls-files=0 sensibili). |
| **Error handling** | ErrorBoundary→Sentry, Result pattern type-safe, withTimeout senza leak, useLinkHandler con allowlist domini. |
| **i18n proporzionato** | i18n-js + expo-localization, traduzioni in bundle (aggiornabili via OTA). No tooling enterprise. |

## Problemi principali — da CAMBIARE (alleggerire/allineare)

1. **HIGH — Over-engineering da SaaS** (~2500 righe): 3 servizi security (1332 righe, ✅ RIMOSSI chunk-1), LazyLoading factory con cache/retry/preload per 4 schermate, SmartFontSizeCache, dark-mode state machine mai attivata, perfectAnimations mai importato, 6+ moduli animazioni no-op. Infrastruttura enterprise senza bersaglio → da TOGLIERE (già inerte, rimozione regression-safe).
2. **HIGH — "Disonestà dichiarativa"**: codice/commenti/doc che promettono capacità inesistenti — dark mode (`isDark` sempre false per `userInterfaceStyle:light`), "type-safety i18n" su `t()` a stringa libera, cap font commentato 1.3x ma reale 2.0x, README-OTA "auto su push" mentre lo YAML è solo manuale, IMPACT_DATA "SSOT" mentre i numeri reali sono hardcoded nel JSX.
3. **HIGH — Meccanismo che tiene vivo il dead code**: i barrel root re-esportavano i servizi morti + ~170 test (30% della suite) li tenevano "verdi quindi non rimuovibili" → madge-orphans non li vedeva. (chunk-1 ha spezzato questo per i servizi.)
4. **MEDIUM — Duplicazione divergente**: `RootStackParamList` x2 (con route fantasma), `interface Location` x2, numeri impatto su 3 fonti.
5. **MEDIUM — "Security theater" nei test**: penetrationTests/injection/xss (~91 test) mockano vulnerabilità e testano funzioni definite nel file di test stesso → non esercitano codice dell'app.

## Premesse CORRETTE alla fonte (zero-M)
- **NON esiste un `CLAUDE.md` di progetto** (Glob=0). La regola "no barrel" è la **globale utente**; `.cursorrules` del progetto (righe 122-130) **IMPONE** gli `index.ts`. → Conflitto reale. **Decisione**: per le convenzioni di questo progetto vince `.cursorrules` → **i barrel restano**, si rimuovono solo le voci morte.
- `orientation:'portrait'` confermato (app.config.js:70) → il freeze-at-boot dello scaling NON è un problema sul target (phone).
- `version` divergente: package.json `1.0.0` vs app.config.js `1.2.9`.

## Roadmap rimanente (rank 10+ — dead-code & allineamento, regression-safe a chunk)
- [x] **chunk-1**: 3 servizi backend + 4 test + barrel (`1826190`).
- [ ] **chunk-2**: security-theater tests (penetrationTests/injectionPrevention/xssProtection) — non testano codice app.
- [ ] **chunk-3**: LazyLoading — rimuovere le 5/8 coppie morte → **spezza la circular dep alla radice**.
- [ ] **chunk-4**: SmartFontSizeCache + perfectAnimations (mai importati) + moduli animazioni no-op.
- [ ] **chunk-5**: sistema mappa interattiva irraggiungibile (MapModalScreen/mapHelpers) — rendere raggiungibile O rimuovere.
- [ ] **chunk-6**: hook bridge morti (usePerfectTheme/useThemeStyles ecc.).
- [ ] **allineamento "onestà"**: dark mode (attivare `automatic` o rimuovere), cap font (rank 7, validazione device), README-OTA, IMPACT_DATA SSOT, version 1.0.0→1.2.9, interface Location/RootStackParamList unificate.

> Metodo: un chunk per volta, L1 verde dopo ognuno (tsc/lint/madge/jest), commit separato. NON big-bang.
