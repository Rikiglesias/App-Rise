# Spec — Auth donatori (Milestone 3: GDPR — elimina-account + export dati)

> Data: 2026-06-15 · Progetto: App Rise (Rise Against Hunger Italia) · Branch: `feat/donor-auth`
> Continua da M1 (email/password) e M2 (social Google/Apple). Spec base: `2026-06-15-donor-auth-design.md`.

## Context
M1+M2 hanno reso operativa l'area donatori (registrazione, login email/social, profilo, logout). Manca la **conformità GDPR + App Store** sulla gestione del proprio account:
- **Apple App Store 5.1.1(v)** (enforced dal 30/06/2022): ogni app che consente la creazione di un account DEVE permettere all'utente di **avviare l'eliminazione dell'account dall'interno dell'app**; non basta disattivare. Se l'app offre Sign in with Apple (M2 sì), alla cancellazione bisogna **revocare i token via Sign in with Apple REST API**. Senza questo → rejection in review.
- **GDPR Art.17** (diritto all'oblio): cancellazione completa dei dati personali.
- **GDPR Art.20** (portabilità): l'utente può ottenere i propri dati in formato **strutturato, di uso comune e leggibile da macchina** (JSON/CSV).

Fonti (triangolate, 2026-06-15): Apple Developer News id=12m75xbj + forum thread 693997; Supabase docs `auth-admin-deleteUser` + discussion #21274; DPC Irlanda (Art.17) + gdprinfo (Art.20).

## Requisiti
- **Elimina account in-app**, facilmente raggiungibile dal profilo, con **doppia conferma** (azione irreversibile).
- **Scelta utente sul modello di cancellazione** (decisione 2026-06-15):
  1. **Elimina subito** — cancellazione immediata e definitiva.
  2. **Elimina tra 30 giorni** — grace period: l'account resta recuperabile per 30 giorni (anti-cancellazione accidentale), poi hard-delete automatico. Se l'utente rientra entro 30gg → può **annullare** la cancellazione.
- **Revoca Apple** alla cancellazione per gli account registrati con Apple.
- **Export dati** (Art.20): l'utente scarica/condivide un JSON con tutti i propri dati (email + profilo + metadati consensi).
- **Non regressione**: i contenuti pubblici restano liberi; M1/M2 intatti; suite test verde (≥392).

## Architettura

### Modello dati (migration `0002_account_deletion.sql`)
Aggiunta a `public.profiles`:
| campo | tipo | note |
|---|---|---|
| `deletion_requested_at` | `timestamptz null` | NULL = attivo; valorizzato = cancellazione programmata a +30gg. Modificabile dall'utente via RLS `own_update` esistente. |

Nessuna nuova policy: `own_update` copre set/clear del campo; `own_select` lo espone al client.

### Eliminazione — due percorsi
- **Subito** → **Edge Function `delete-account`** (richiede `service_role`, MAI nel client):
  1. Estrae il JWT dall'header `Authorization`, ricava l'utente (`auth.getUser`).
  2. Se l'utente ha identità `apple` **e** il client ha fornito un `appleAuthCode` fresco (vedi nota sotto) → **revoca best-effort**: scambia l'`authorizationCode` per un refresh-token Apple (`POST https://appleid.apple.com/auth/token`, client_secret = JWT ES256 firmato con la chiave `.p8` da secrets), poi revoca (`POST .../auth/revoke`, `token_type_hint=refresh_token`). Fallimento o code assente → log esplicito, NON blocca (la cancellazione dati GDPR prevale).
  3. `supabase.auth.admin.deleteUser(userId)` → cascade su `profiles` (FK `on delete cascade`).
  4. Client: dopo successo → `signOut` + pulizia SecureStore.

> **Nota Apple (finding 2026-06-15, triangolato):** con `signInWithIdToken` (login nativo M2) Supabase **non** persiste `providerRefreshToken` (fonti: supabase/auth #2155, #1308). Non esiste quindi un token Apple lato server da revocare. Soluzione adottata: **re-auth al delete** — l'utente Apple ri-effettua un Apple sign-in al momento della cancellazione, fornendo un `authorizationCode` fresco che la Edge Function scambia e revoca. Vantaggio collaterale GDPR: **nessun token Apple persistito** (data minimization). Per utenti email/Google il passo è saltato.
- **Tra 30 giorni** → nessuna Edge Function: il client fa `update profiles set deletion_requested_at = now()` (RLS `own_update`) + `signOut`. L'hard-delete avviene via:
  - **Edge Function `purge-deletions`** (service_role): `admin.deleteUser` per ogni profilo con `deletion_requested_at < now() - interval '30 days'`.
  - Invocata da **Supabase Cron** (pg_cron + pg_net) una volta al giorno.
- **Annulla** (al rientro entro 30gg): banner in `ProfileScreen` se `profile.deletion_requested_at` valorizzato → `update profiles set deletion_requested_at = null`.

### Export dati (client-side, Art.20)
- `exportData()` in `AuthContext`: raccoglie `session.user` (email, id, created_at, providers) + `profile` (tutti i campi) → oggetto JSON strutturato (`buildExportPayload`, logica pura) → condivisione via **`Share` API di react-native** (`Share.share({ message })`, JSON nel share-sheet nativo). Scelta: **nessuna dipendenza nativa nuova** (coerente con M1 che preferì SecureStore per evitare moduli nativi); per dati minimi il JSON-come-testo è formato machine-readable conforme. Usa la sessione corrente (RLS `own_select`); nessun privilegio elevato.

### UI (dark-aware pattern A, componenti `AuthScreen`/`AuthButton`/`AuthInput` esistenti)
- **`ProfileScreen`**: nuova sezione "Privacy e dati" con `Esporta i miei dati` e `Elimina account`. Banner in cima se cancellazione programmata: «Account in eliminazione il <data> — Annulla».
- **`DeleteAccountScreen`** (nuova route nello stack auth): spiega l'irreversibilità, offre le due opzioni (subito / tra 30gg), **doppia conferma** prima di eseguire.

### Client → Edge Function
`supabase.functions.invoke('delete-account')` (il client passa automaticamente il JWT della sessione). Wrapper in `AuthContext.deleteAccountNow()`.

## Sicurezza & GDPR
- `service_role` SOLO lato Edge Function (mai nel bundle client). `delete-account` autorizza tramite il JWT del chiamante: cancella **solo** il proprio account.
- Apple revoke obbligatoria per compliance store; best-effort per non bloccare il diritto all'oblio.
- Export limitato ai dati del richiedente (RLS). Nessun dato di terzi.
- Secrets Apple (`APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`, `APPLE_BUNDLE_ID`) in Supabase secrets, mai nel repo.
- Grace period: dato trattenuto max 30gg con finalità "annullamento errore" — comunicato all'utente nel testo di conferma (trasparenza GDPR).

## Testing
- Unit/integration con Supabase + Edge Function **mockati**: `deleteAccountNow` invoca `functions.invoke('delete-account')`; `scheduleDeletion`/`cancelScheduledDeletion` fanno update del campo; `exportData` produce il JSON atteso (file-system/sharing mockati). Rendering `ProfileScreen` (banner programmazione) e `DeleteAccountScreen` (doppia conferma).
- Edge Functions Deno: logica pura testabile dove possibile; deploy+runtime = leva utente.
- Suite attuale **392** non deve regredire.

## Dipendenze nuove
**Nessuna lato app** (export via `Share` di react-native, già disponibile). Edge Functions: runtime Deno gestito da Supabase (`jose` per il client_secret ES256, `@supabase/supabase-js` via jsr — nessuna dep nel bundle app RN).

## Out of scope (M3)
Audit-log/revoca granulare consensi, modifica-profilo avanzata, export CSV (oltre JSON), dashboard admin. Follow-up successivi.

## Decisioni (chiuse 2026-06-15)
1. **Scope**: elimina-account + export dati (GDPR pieno).
2. **Modello delete**: scelta utente finale — subito **o** tra 30 giorni (grace period recuperabile).
3. **Apple revoke**: pattern **re-auth al delete** (l'utente Apple ri-autentica → `authorizationCode` → scambio+revoca lato Edge Function); best-effort, non bloccante; nessun token Apple persistito.
4. **Export**: JSON, client-side, share-sheet nativo.

## Verifica end-to-end (a implementazione completata — leva utente, dev build + Supabase)
1. Esporta dati → share-sheet → JSON contiene email + tutti i campi profilo.
2. Elimina subito → conferma doppia → account sparito (login fallisce) → riga `profiles` cancellata (cascade).
3. Elimina tra 30gg → `deletion_requested_at` valorizzato → logout → login entro 30gg → banner → Annulla → campo a NULL.
4. Cron `purge-deletions` cancella un profilo con `deletion_requested_at` oltre 30gg (test con data backdated).
5. Account Apple eliminato → token revocati (verifica in Apple ID → app collegate).
6. `npm run conta-problemi` = 0; `npx jest` ≥ 392 passed; snapshot invariati; `madge` 0.
