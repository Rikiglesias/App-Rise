# Auth Donatori — Milestone 4 (Gestione e audit consensi, GDPR Art.7) Implementation Plan

> Esecuzione INLINE task-by-task. Step con checkbox `- [ ]`. **Da lanciare con `/goal donor-auth-m4`.**

**Goal:** Consent ledger append-only + revoca marketing in-app + re-consenso al cambio policy + consent history nell'export, senza regredire M1-M3.

**Architecture:** Supabase Postgres + RLS. Tabelle `consent_events` (immutabile) e `policy_versions`. `profiles.marketing_consent` resta cache. UI dark-aware (AuthScreen/AuthButton). Riuso pattern M3 (Edge Function+Cron per retention, opzionale).

**Spec:** `docs/superpowers/specs/2026-06-15-donor-auth-consensi-M4.md`

**Scope:** ledger, toggle/revoca marketing, re-consenso, export consent history. **Fuori:** modifica dati profilo (M5), profilazione (futura + DPIA).

---

## Prerequisiti (LEVE UTENTE)
- [ ] **P1.** Apply `0003_consent_log.sql` (+ seed prima riga `policy_versions`, es. `privacy-2026-06-15`).
- [ ] **P2.** Decisioni legali DPO/RAHI (retention, soglia materialità, base giuridica) — vedi spec §Decisioni da confermare. NON bloccano i task di codice/test (default prudenti già nello schema).

---

## File Structure
- `supabase/migrations/0003_consent_log.sql` — tabelle + RLS + indice (create)
- `src/shared/auth/types.ts` — `ConsentEvent`, `ConsentPurpose`, `ConsentAction` (modify)
- `src/shared/auth/consent.ts` — helper puri (deriveMarketingState, buildConsentInsert) (create)
- `src/shared/auth/AuthContext.tsx` — `recordConsent`/`setMarketingConsent`/`getConsentHistory` (modify)
- `src/shared/auth/dataExport.ts` — `consent_history` nel payload (modify)
- `src/features/auth/screens/ProfileScreen.tsx` — sezione "Consensi" (toggle marketing) (modify)
- `src/features/auth/screens/ReConsentScreen.tsx` — re-consenso al cambio policy (create)
- `src/navigation/{types,AppNavigator}.tsx` — route `ReConsent` (modify)
- `src/locales/{it,en}.ts` — `auth.consents.*` (modify)
- Test: `src/__tests__/shared/auth/consent.test.ts`, estensione `AuthContext.test.tsx`, `src/__tests__/features/auth/consents.test.tsx`

---

## Task 1: Migration 0003 + tipi
**Files:** `supabase/migrations/0003_consent_log.sql` (create) · `src/shared/auth/types.ts` (modify)
- [ ] Schema come da spec (consent_events append-only + policy_versions; RLS own_select/own_insert, no update/delete; indice). `create table if not exists` per idempotenza.
- [ ] Tipi: `ConsentPurpose = 'privacy_notice'|'marketing'|'profiling'`, `ConsentAction = 'granted'|'withdrawn'`, `interface ConsentEvent`.
- [ ] tsc 0. Commit `feat(auth): migration consent_events + policy_versions + tipi (M4 T1)`.

## Task 2: consent.ts (logica pura, TDD)
**Files:** `src/shared/auth/consent.ts` + `consent.test.ts`
- [ ] Test (red): `deriveMarketingState(events)` → bool dall'ultimo evento marketing; `buildConsentInsert(userId, purpose, action, policyVersion, channel)` → riga valida.
- [ ] Implementa; test green; tsc/eslint 0. Commit `feat(auth): helper consensi puri (M4 T2)`.

## Task 3: AuthContext (TDD, mock)
**Files:** `AuthContext.tsx` + estensione `AuthContext.test.tsx`
- [ ] Test (red): `setMarketingConsent(true)` → insert `consent_events(marketing,granted)` + update `profiles.marketing_consent=true` + refresh; `getConsentHistory()` select ordinato.
- [ ] Implementa `recordConsent`/`setMarketingConsent`/`getConsentHistory` (+ interfaccia AuthState). Green; tsc/eslint 0. Commit `feat(auth): AuthContext gestione consensi (M4 T3)`.

## Task 4: Export consent history
**Files:** `dataExport.ts` + `dataExport.test.ts`
- [ ] Test (red): `buildExportPayload` accetta e include `consent_history`.
- [ ] Implementa (estende il payload M3); AuthContext.exportData passa la history. Green. Commit `feat(auth): consent history nell'export (M4 T4)`.

## Task 5: i18n
**Files:** `it.ts`/`en.ts` — `auth.consents.*` (titolo sezione, toggle marketing, stato, re-consenso). Commit `feat(auth): i18n consensi (M4 T5)`.

## Task 6: UI sezione Consensi in ProfileScreen
**Files:** `ProfileScreen.tsx` + estensione test
- [ ] Sezione "Consensi": toggle marketing (stato da `profile.marketing_consent`, onChange → `setMarketingConsent`), testo esplicativo "puoi revocare in ogni momento". Loading/errore.
- [ ] Test: toggle presente, chiamata `setMarketingConsent` al cambio. Green; tsc/eslint 0. Commit `feat(auth): sezione consensi in ProfileScreen (M4 T6)`.

## Task 7: ReConsentScreen + gating al boot
**Files:** `ReConsentScreen.tsx` (create) · `AuthContext.tsx` (rileva versione) · `navigation` · test
- [ ] Al boot/login, dopo load profilo: query ultima `policy_version` accettata vs `policy_versions` corrente materiale → flag `needsReConsent` in AuthState.
- [ ] `ReConsentScreen`: mostra testo nuova policy, CTA accetta → `recordConsent('privacy_notice','granted', nuovaVersione)` → sblocca.
- [ ] Route + test (render, accetta → recordConsent). Green; tsc/eslint 0. Commit `feat(auth): re-consenso al cambio policy materiale (M4 T7)`.

## Task 8: Verifica finale L1-L9
- [ ] tsc 0 · `npm run lint` 0 · `npx jest` (ri-conta ≥402+nuovi) · madge 0 · conta-problemi 0.
- [ ] Aggiorna binding `~/todos/donor-auth-m4.md` + dichiara leve utente residue. Commit `chore(auth): verifica M4`.

---

## Verifica E2E (leva utente)
Toggle marketing → eventi in `consent_events` + cache coerente · nuova policy materiale → ReConsentScreen al login · export con consent_history · RLS: no read altrui, no update/delete ledger.
