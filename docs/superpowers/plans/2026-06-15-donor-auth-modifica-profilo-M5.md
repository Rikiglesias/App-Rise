# Auth Donatori — Milestone 5 (Modifica profilo, GDPR Art.16) Implementation Plan

> Esecuzione INLINE task-by-task. Step con checkbox `- [ ]`. **Da lanciare con `/goal donor-auth-m5`.**

**Goal:** L'utente corregge i propri dati in-app (campi profilo + email) con update mirato e validazione riusata, senza regredire M1-M4.

**Architecture:** Supabase `profiles` RLS own_update + `auth.updateUser` (secure email change). `ProfileEditScreen` riusa AuthInput/validation. Dark-aware.

**Spec:** `docs/superpowers/specs/2026-06-15-donor-auth-modifica-profilo-M5.md`

**Scope:** modifica campi profilo + cambio email + fix gap (upsert→update whitelist, refreshProfile error handling). **Fuori:** toggle marketing (M4), profilazione.

---

## Prerequisiti (LEVE UTENTE)
- [ ] **P1.** Supabase Auth → abilitare "Secure email change" (doppia conferma) — Dashboard → Authentication → Email.
- [ ] **P2.** Decisioni prodotto (birth_date self-edit, anti-enumeration) — default già nella spec; non bloccano codice/test.

---

## File Structure
- `src/shared/auth/types.ts` — `ProfileEditable` (subset editabile) (modify)
- `src/shared/auth/AuthContext.tsx` — `updateProfile`, `updateEmail`, fix `refreshProfile` (modify)
- `src/features/auth/screens/ProfileEditScreen.tsx` — form rettifica (create)
- `src/features/auth/screens/ProfileScreen.tsx` — bottone "Modifica profilo" (modify)
- `src/navigation/{types,AppNavigator}.tsx` — route `ProfileEdit` (modify)
- `src/locales/{it,en}.ts` — `auth.edit.*` (modify)
- Test: estensione `AuthContext.test.tsx`, `src/__tests__/features/auth/profileEdit.test.tsx`

---

## Task 1: Tipi + AuthContext (TDD, mock)
**Files:** `types.ts`, `AuthContext.tsx` + estensione `AuthContext.test.tsx`
- [ ] `ProfileEditable = Pick<Profile,'first_name'|'last_name'|'phone'|'city'|'province'|'birth_date'>`.
- [ ] Test (red): `updateProfile({phone})` → `from('profiles').update({phone}).eq('id',uid)` (NON upsert, NON altri campi) + refresh; `updateEmail('x@y.it')` → `auth.updateUser({email:'x@y.it'})`; `refreshProfile` gestisce errore senza throw.
- [ ] Implementa `updateProfile` (whitelist), `updateEmail`, fix `refreshProfile` (try/catch + stato). Green; tsc/eslint 0.
- [ ] Commit `feat(auth): updateProfile/updateEmail + fix refreshProfile (M5 T1)`.

## Task 2: i18n
**Files:** `it.ts`/`en.ts` — `auth.edit.*` (titolo, label save, esito, "controlla entrambe le email", errori). Commit `feat(auth): i18n modifica profilo (M5 T2)`.

## Task 3: ProfileEditScreen
**Files:** `ProfileEditScreen.tsx` (create) · `navigation` (route `ProfileEdit`)
- [ ] Form pre-popolato da `profile` (AuthInput per first_name/last_name/phone/city/province/birth_date); validazione on submit (riuso `validation.ts`); su submit → `updateProfile(changed)` e, se email modificata, `updateEmail`; messaggi loading/errore/successo + nota doppia conferma email.
- [ ] Route + import in AppNavigator.
- [ ] Test (mock useAuth): render pre-popolato; submit con phone invalido → errore; submit valido → `updateProfile` chiamato coi soli campi cambiati. Green; tsc/eslint 0.
- [ ] Commit `feat(auth): ProfileEditScreen + route (M5 T3)`.

## Task 4: Bottone in ProfileScreen
**Files:** `ProfileScreen.tsx` + estensione test
- [ ] Bottone "Modifica profilo" (variant link/primary) nel ramo authenticated → `navigation.navigate('ProfileEdit')`.
- [ ] Test: bottone presente + naviga. Green; tsc/eslint 0. Commit `feat(auth): entry modifica profilo in ProfileScreen (M5 T4)`.

## Task 5: Verifica finale L1-L9
- [ ] tsc 0 · `npm run lint` 0 · `npx jest` (ri-conta ≥402+nuovi) · madge 0 · conta-problemi 0.
- [ ] Aggiorna binding `~/todos/donor-auth-m5.md` + leve utente residue. Commit `chore(auth): verifica M5`.

---

## Verifica E2E (leva utente — "Secure email change" ON)
Modifica campi → persistono, nessun campo azzerato · cambio email → conferma su entrambe le caselle → email aggiornata · birth_date <18 bloccato · RLS: no update altrui.

---

## Nota refactor (proposta, non in scope)
`CompleteProfileScreen` usa `upsert` con tutti i campi (rischio null) e duplica la logica di validazione/form con SignUpScreen. Valutare l'estrazione di un componente form condiviso (`ProfileForm`) usato da SignUp/CompleteProfile/ProfileEdit. zero-I: proposta tracciata, da decidere a implementazione M5.
