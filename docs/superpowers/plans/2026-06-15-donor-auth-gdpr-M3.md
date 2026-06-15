# Auth Donatori — Milestone 3 (GDPR: elimina-account + export dati) Implementation Plan

> Esecuzione INLINE task-by-task (regola utente: no subagent-driven). Step con checkbox `- [ ]`.

**Goal:** Conformità GDPR + App Store sulla gestione del proprio account: elimina-account in-app (subito o con grace period 30gg a scelta utente), revoca token Apple alla cancellazione, export dati JSON (Art.20). Senza regredire M1/M2.

**Architecture:** Supabase (Auth + Postgres + RLS + Edge Functions Deno + Cron). Eliminazione immediata via Edge Function `delete-account` (service_role, JWT-authed); programmata via `deletion_requested_at` + Edge Function schedulata `purge-deletions`. Export client-side (sessione corrente). UI dark-aware pattern A.

**Spec di riferimento:** `docs/superpowers/specs/2026-06-15-donor-auth-gdpr-M3.md`

**Scope M3:** elimina-account (2 modelli) + export dati + Apple revoke. **Fuori:** audit-log consensi, modifica-profilo avanzata, export CSV.

---

## Prerequisiti (LEVE UTENTE — bloccano solo l'E2E reale, NON i task di codice/test)
- [ ] **P1.** Deploy: `supabase functions deploy delete-account purge-deletions`.
- [ ] **P2.** Apply migration `0002_account_deletion.sql` (SQL Editor o `supabase db push`).
- [ ] **P3.** Secrets Apple (Supabase → Project Settings → Edge Functions → Secrets): `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` (contenuto `.p8`), `APPLE_BUNDLE_ID`.
- [ ] **P4.** Supabase Cron → schedule giornaliero che invoca `purge-deletions` (Dashboard → Integrations → Cron, oppure pg_cron + pg_net).

> I task 1, 4, 5, 6, 7 sono scrivibili/testabili SENZA Supabase live (mock). I task 2-3 (Edge Functions) sono scrivibili ma il runtime/deploy è leva utente.

---

## File Structure
- `supabase/migrations/0002_account_deletion.sql` — colonna `deletion_requested_at` (create)
- `supabase/functions/delete-account/index.ts` — Edge Function eliminazione immediata + Apple revoke (create)
- `supabase/functions/_shared/appleRevoke.ts` — helper client_secret JWT + revoke (create)
- `supabase/functions/purge-deletions/index.ts` — Edge Function purge schedulata (create)
- `src/shared/auth/types.ts` — `deletion_requested_at` su `Profile` (modify)
- `src/shared/auth/dataExport.ts` — costruzione JSON export (logica pura) (create)
- `src/shared/auth/AuthContext.tsx` — `deleteAccountNow`/`scheduleDeletion`/`cancelScheduledDeletion`/`exportData` (modify)
- `src/features/auth/screens/DeleteAccountScreen.tsx` — scelta modello + doppia conferma (create)
- `src/features/auth/screens/ProfileScreen.tsx` — sezione "Privacy e dati" + banner annulla (modify)
- `src/navigation/types.ts` + `src/navigation/AppNavigator.tsx` — route `DeleteAccount` (modify)
- `src/locales/it.ts` + `src/locales/en.ts` — `auth.privacy.*`, `auth.delete.*` (modify)
- Test: `src/__tests__/shared/auth/dataExport.test.ts`, estensione `AuthContext.test.tsx`, `src/__tests__/features/auth/deleteAccount.test.tsx`

---

## Task 1: Migration 0002 + tipo Profile

**Files:** Create `supabase/migrations/0002_account_deletion.sql` · Modify `src/shared/auth/types.ts`

- [ ] **Step 1: Migration**
```sql
-- Migration 0002 — cancellazione account (grace period opzionale)
-- NULL = account attivo; valorizzato = cancellazione programmata a +30gg.
alter table public.profiles
  add column deletion_requested_at timestamptz null;
-- RLS: own_update/own_select esistenti coprono set/clear e lettura del campo.
```
- [ ] **Step 2: Tipo** — in `types.ts` aggiungere a `Profile`: `deletion_requested_at: string | null;`
- [ ] **Step 3: Typecheck** → `npx tsc --noEmit` → exit 0.
- [ ] **Step 4: Commit** `feat(auth): migration deletion_requested_at + tipo (M3 Task 1)`

---

## Task 2: Edge Function `delete-account` + Apple revoke

**Files:** Create `supabase/functions/delete-account/index.ts`, `supabase/functions/_shared/appleRevoke.ts`

- [ ] **Step 1: Apple revoke helper** (`_shared/appleRevoke.ts`) — `revokeAppleViaAuthCode(authCode)`: (a) costruisce il client_secret JWT ES256 (header `kid`, claims `iss=APPLE_TEAM_ID`, `aud=https://appleid.apple.com`, `sub=APPLE_BUNDLE_ID`, `iat`/`exp`) firmandolo con `APPLE_PRIVATE_KEY` (.p8 PKCS8) via `jose`; (b) scambia l'authCode → refresh-token (`POST https://appleid.apple.com/auth/token`, form-urlencoded, `grant_type=authorization_code`); (c) revoca (`POST .../auth/revoke`, `token_type_hint=refresh_token`). Throw su errore (il caller fa best-effort). **Motivo authCode** (finding triangolato): `signInWithIdToken` non espone il refresh-token Apple.
- [ ] **Step 2: Edge Function** (`delete-account/index.ts`)
```ts
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { revokeAppleToken } from '../_shared/appleRevoke.ts';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Unauthorized', { status: 401 });

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  // Identifica il chiamante dal SUO jwt (può cancellare solo sé stesso)
  const { data: { user }, error } = await admin.auth.getUser(authHeader.replace('Bearer ', ''));
  if (error || !user) return new Response('Unauthorized', { status: 401 });

  // Apple revoke best-effort (non blocca la cancellazione dati)
  const apple = user.identities?.find((i) => i.provider === 'apple');
  if (apple) {
    try { await revokeAppleToken(user); } catch (e) { console.error('apple revoke failed', e); }
  }

  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) return new Response(JSON.stringify({ error: delErr.message }), { status: 500 });
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
});
```
- [ ] **Step 3: Verifica statica** — `deno check supabase/functions/delete-account/index.ts` se Deno disponibile; altrimenti revisione manuale (il runtime è leva utente P1). Dichiarare quale.
- [ ] **Step 4: Commit** `feat(auth): Edge Function delete-account + Apple revoke (M3 Task 2)`

---

## Task 3: Edge Function `purge-deletions` (schedulata)

**Files:** Create `supabase/functions/purge-deletions/index.ts`

- [ ] **Step 1: Function** — service_role; seleziona `profiles` con `deletion_requested_at < now() - interval '30 days'`; per ciascuno `admin.deleteUser(id)`; ritorna il conteggio. Protezione: header segreto (`CRON_SECRET`) confrontato con `Deno.env`, così solo il Cron la invoca.
- [ ] **Step 2: Verifica statica** (come Task 2 Step 3).
- [ ] **Step 3: Commit** `feat(auth): Edge Function purge-deletions schedulata (M3 Task 3)`

---

## Task 4: dataExport + AuthContext (TDD, mock)

**Files:** Create `src/shared/auth/dataExport.ts` · Modify `src/shared/auth/AuthContext.tsx` · Test `dataExport.test.ts` + estensione `AuthContext.test.tsx`

- [ ] **Step 1: Test che falliscono** — `buildExportPayload(user, profile)` ritorna un oggetto JSON con `account.email`, `account.created_at`, `profile.*`, `exported_at`; serializzazione stabile. Per AuthContext: `deleteAccountNow` chiama `supabase.functions.invoke('delete-account')` poi `signOut`; `scheduleDeletion` fa update `deletion_requested_at`; `cancelScheduledDeletion` lo rimette a null.
- [ ] **Step 2: Eseguire** → FAIL.
- [ ] **Step 3: Implementare**
  - `dataExport.ts`: `buildExportPayload` (puro) + `exportData(user, profile)` che serializza il JSON e apre il share-sheet con `Share.share({ message })` (react-native; nessuna dep nativa nuova — `expo-file-system`/`expo-sharing` NON installati e non necessari).
  - `AuthContext`: aggiungere i 4 metodi all'interfaccia + value memoizzato; `deleteAccountNow` → `functions.invoke` → on ok `signOut`; `scheduleDeletion`/`cancel` → `supabase.from('profiles').update({ deletion_requested_at }).eq('id', user.id)` + `refreshProfile`; `exportData` → delega a `dataExport`.
- [ ] **Step 4: Eseguire** → PASS. `npx tsc --noEmit && npx eslint src/shared/auth` → exit 0.
- [ ] **Step 5: Commit** `feat(auth): AuthContext delete/schedule/export + dataExport (M3 Task 4)`

---

## Task 5: i18n

**Files:** Modify `src/locales/it.ts`, `src/locales/en.ts`

- [ ] **Step 1:** Aggiungere `auth.privacy.*` (sezione, export CTA, esito export) e `auth.delete.*` (titolo, avviso irreversibile, opzione subito, opzione 30gg, doppia conferma, banner programmazione con data, annulla). Chiavi identiche it/en.
- [ ] **Step 2: Typecheck** → exit 0 (le chiavi i18n sono tipizzate se il progetto lo fa — verificare).
- [ ] **Step 3: Commit** `feat(auth): i18n privacy/delete (M3 Task 5)`

---

## Task 6: DeleteAccountScreen + route

**Files:** Create `src/features/auth/screens/DeleteAccountScreen.tsx` · Modify `src/navigation/types.ts`, `src/navigation/AppNavigator.tsx`

- [ ] **Step 1: Schermata** — `AuthScreen` + testo irreversibilità; due `AuthButton`: "Elimina subito" e "Elimina tra 30 giorni"; ogni azione apre una **seconda conferma** (Alert nativo o stato locale) prima di chiamare `deleteAccountNow()` / `scheduleDeletion()`. Stato loading/errore. Dopo successo → l'app torna a unauthenticated (gestito da AuthContext).
- [ ] **Step 2: Route** — `DeleteAccount: undefined` in `RootStackParamList` + `<Stack.Screen>` in `AppNavigator`.
- [ ] **Step 3: Test** — rendering, presenza due opzioni, che il submit senza seconda conferma NON chiami i metodi auth (mock `useAuth`).
- [ ] **Step 4: Eseguire** → PASS; `tsc`/`eslint` exit 0.
- [ ] **Step 5: Commit** `feat(auth): DeleteAccountScreen + route (M3 Task 6)`

---

## Task 7: ProfileScreen — sezione Privacy e dati + banner annulla

**Files:** Modify `src/features/auth/screens/ProfileScreen.tsx`

- [ ] **Step 1:** Nel ramo `authenticated`: aggiungere sezione "Privacy e dati" con `Esporta i miei dati` (→ `exportData`) e `Elimina account` (→ naviga a `DeleteAccount`). Se `profile?.deletion_requested_at` valorizzato → banner in cima con la data prevista (+30gg) e CTA "Annulla eliminazione" (→ `cancelScheduledDeletion`).
- [ ] **Step 2: Test** — estendere `authScreens.test.tsx`: banner visibile quando `deletion_requested_at` set; CTA export/delete presenti.
- [ ] **Step 3: Eseguire** → PASS; `tsc`/`eslint` exit 0.
- [ ] **Step 4: Commit** `feat(auth): ProfileScreen privacy/export/banner (M3 Task 7)`

---

## Task 8: Verifica finale L1-L9

- [ ] **Step 1:** `npx tsc --noEmit` exit 0 · `npm run lint` 0 · `npx jest --watchAll=false` (ri-conta passed, ≥392) · `npx madge --circular src` = 0 · `npm run conta-problemi` = 0.
- [ ] **Step 2:** Aggiornare il binding `~/todos/donor-auth-m3.md` (spuntare AI-completabile) e dichiarare le leve utente residue (P1-P4 + E2E).
- [ ] **Step 3: Commit** `chore(auth): verifica M3 + tracking leve utente`

---

## Verifica end-to-end (M3, leva utente — dev build + Supabase configurato)
1. Esporta dati → share-sheet → JSON con email + tutti i campi profilo.
2. Elimina subito → doppia conferma → login successivo fallisce; riga `profiles` cancellata (cascade).
3. Elimina tra 30gg → `deletion_requested_at` set → logout → login entro 30gg → banner → Annulla → NULL.
4. `purge-deletions` (data backdated) cancella il profilo scaduto.
5. Account Apple → dopo delete, app rimossa da Apple ID → app collegate.
6. `conta-problemi` = 0; `jest` ≥ 392; snapshot invariati; `madge` 0.
