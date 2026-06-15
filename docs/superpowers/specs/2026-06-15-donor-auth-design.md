# Spec — Autenticazione donatori (Fase 1: Auth)

> Data: 2026-06-15 · Progetto: App Rise (Rise Against Hunger Italia) · Branch: da creare `feat/donor-auth`
> Stato: design approvato (brainstorming), in attesa di revisione spec prima del piano.

## Context
L'app è oggi **100% statica, senza backend** (`src/shared/config/environment.ts:22-24` lo dichiara esplicitamente: `getApiUrl`/`API_BASE_URL` sono placeholder mai usati). Si vuole introdurre un'**area donatori** autenticata. Poiché l'area completa (storico donazioni, ricevute fiscali, profilo) è ampia, viene **decomposta**: questo spec copre **solo la Fase 1 = Autenticazione** (registrazione, login, sessione, profilo base, logout, eliminazione account). Donazioni e ricevute saranno sotto-progetti successivi, ciascuno con il proprio ciclo spec → plan → implementazione.

Obiettivo Fase 1: un donatore può creare un account, accedere (email/password o Google/Apple), completare il proprio profilo, restare loggato tra sessioni, e cancellare l'account — il tutto **senza bloccare** l'accesso ai contenuti pubblici dell'app.

## Requisiti
- **Login "vostro"**: email + password con verifica email e reset password.
- **Profilo donatore**: nome, cognome, email, **location** (per pianificare eventi sul territorio), **data di nascita** (non "età": si calcola, non invecchia).
- **Social**: Google + Apple. *(Instagram NON disponibile — Basic Display API end-of-life 04/12/2024; eventuale Meta solo via Facebook, fuori scope ora.)*
- **Auth opzionale (non-gating)**: i contenuti pubblici restano liberi; l'auth sblocca solo l'area donatori.
- **GDPR**: consenso privacy esplicito, data minimization, gestione minori, diritto all'oblio.

## Architettura
- **Backend**: Supabase — Auth (email/password + OAuth Google/Apple) + Postgres + Row-Level Security. Nessun server custom da mantenere.
- **Client**: `@supabase/supabase-js` con sessione persistita in **`expo-secure-store`** (token in keychain/keystore cifrati, NON AsyncStorage).
- **Social nativi**: `expo-apple-authentication` (Apple HIG richiede il pulsante nativo su iOS) + Google sign-in nativo → `supabase.auth.signInWithIdToken()`. Richiede **EAS dev build** (già nel flusso del progetto), non Expo Go.
- **Stato app**: `AuthContext` provider (sessione, utente, profilo, stato loading) montato accanto ai provider esistenti in `App.tsx`. Espone `useAuth()`.
- **Config**: `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` aggiunti al sistema `environment.ts` esistente (con validazione fail-fast al boot). La anon key è pubblica per design (la sicurezza sta nelle RLS policy, non nella key).

### Modello dati (Postgres)
Tabella `public.profiles` (1:1 con `auth.users`):
| campo | tipo | note |
|---|---|---|
| `id` | uuid PK | FK → `auth.users.id`, on delete cascade |
| `first_name` | text | obbligatorio |
| `last_name` | text | obbligatorio |
| `location` | text/struttura | città + provincia (granularità "dove fare eventi", NON GPS) |
| `birth_date` | date | obbligatorio; validazione età minima |
| `privacy_consent_at` | timestamptz | consenso privacy (obbligatorio) |
| `marketing_consent` | boolean | opt-in separato (default false) |
| `created_at` / `updated_at` | timestamptz | audit |

`email` vive in `auth.users` (non duplicato). **RLS**: `select/update/insert/delete` consentiti solo dove `auth.uid() = id`. Trigger `on auth.users insert` per creare la riga profilo vuota (poi completata).

### Flussi
1. **Signup email**: form (nome, cognome, email, password, location, data nascita, consenso) → `signUp` → email di verifica → al primo login profilo già popolato → home.
2. **Login email**: email+password → sessione → home.
3. **Reset password**: email → link Supabase → nuova password.
4. **Social (Google/Apple)**: id-token nativo → `signInWithIdToken` → se profilo incompleto (location/data nascita/consenso mancanti, come avviene sempre coi social) → **schermata "Completa profilo"** → home.
5. **Logout**: `signOut` + pulizia SecureStore.
6. **Elimina account** (GDPR): conferma → cancellazione `auth.users` (cascade su `profiles`) via Edge Function o RPC sicura.

### Schermate (in `AppNavigator`, stack già esistente; dark-aware pattern A)
`AuthLanding` (scegli metodo) · `Login` · `SignUp` · `CompleteProfile` · `ForgotPassword` · `Profile` (visualizza/modifica/logout/elimina). Entry point dai contenuti pubblici: voce "Accedi"/"Profilo" (posizione da definire nel piano — tab o header).

## Sicurezza & GDPR
- Token in `expo-secure-store`; mai loggati (rispetta la policy logger esistente).
- RLS come unica barriera dati (anon key pubblica per design).
- Consenso privacy esplicito e tracciato (`privacy_consent_at`); marketing separato e opt-in.
- **Minori**: età minima da confermare (consenso digitale IT = 14 anni ex art. 8 GDPR + d.lgs. 101/2018; molte ONG richiedono 18+ per donatori). **Decisione aperta → vedi sotto.**
- Data minimization: nessun GPS; location = città/provincia.
- Diritto all'oblio: funzione elimina-account completa.

## Testing
- Suite attuale: **371 test verdi** — non devono regredire. `AuthContext` mockato in `renderWithProviders`/`AllProviders` (pattern già usato nel progetto).
- Nuovi: unit su validazione form (email, password policy, data nascita/età, consenso), reducer/stato AuthContext; integration sui flussi chiave con Supabase mockato.

## Dipendenze nuove
`@supabase/supabase-js`, `expo-secure-store`, `expo-apple-authentication`, Google sign-in nativo. Impatto EAS build config (plugin nativi). Nessuna gira in Expo Go → dev build necessaria per testare i social.

## Out of scope (Fase 1)
Storico donazioni, ricevute fiscali, integrazione gateway pagamenti, notifiche push, Facebook login, gestione eventi. Ognuno = sotto-progetto successivo.

## Decisioni aperte (da confermare in revisione)
1. **Età minima**: 14 (consenso digitale IT) o 18+ (policy donatori)? Default proposto: **18+** per area donatori, con messaggio chiaro.
2. **Location**: campo libero città vs select provincia/regione strutturata? Default proposto: **città (testo) + provincia (select)**.
3. **Entry point** dell'area auth: tab dedicata "Profilo" vs voce nell'header? Default proposto: **tab "Profilo"** nella bottom bar.
4. **Verifica email** obbligatoria prima dell'accesso? Default proposto: **sì** (sicurezza/anti-spam).

## Verifica end-to-end (a implementazione completata)
Dev build EAS → signup email → ricezione email verifica → login → completa profilo → kill & riapri app (sessione persiste) → login Google → login Apple (iOS) → reset password → elimina account (verifica cascade su `profiles` lato Supabase). Test jest verdi (≥371). RLS testata: utente A non legge profilo di B.
