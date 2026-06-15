# Spec — Auth donatori (Milestone 5: Modifica profilo, GDPR Art.16 rettifica)

> Data: 2026-06-15 · Progetto: App Rise (Rise Against Hunger Italia) · Branch: `feat/donor-auth`
> Continua M1/M2/M3 (+M4 consensi). Colma il gap M3 ("modifica-profilo avanzata" out-of-scope).
> Fondata su ricerca triangolata: GDPR Art.16, Supabase Auth docs (secure email change), cross-check repo.

## Context
M3 copre cancellazione (Art.17) ed export (Art.20), ma la **rettifica** (Art.16, pari rango) manca: l'utente non può correggere i propri dati in-app. `ProfileScreen` mostra i dati in sola lettura; `CompleteProfileScreen` esiste ma è usato solo post-social per il primo completamento e usa `upsert` con **tutti** i campi (rischio di azzerare campi mancanti). RLS `own_update` su `profiles` **già abilita** tecnicamente la self-rettifica: manca la UI e un metodo di update mirato.

## Requisiti
- **Modifica campi profilo** in-app: nome, cognome, telefono, città, provincia, data di nascita.
- **Cambio email**: via `supabase.auth.updateUser({ email })` con **secure email change** (Supabase invia conferma a **entrambe** le email, vecchia e nuova).
- **Update mirato** (whitelist dei campi cambiati, `.update().eq('id', uid)`) — NON `upsert` di tutti i campi (fix del rischio null).
- **Validazione riusata** (la stessa `validation.ts` di signup): email, telefono E.164, adult ≥18.
- **Non regressione**: M1-M4 intatti; il vincolo DB `birth_date CHECK >= 18y` resta la barriera dura.

## Architettura

### Client
- `AuthContext`:
  - `updateProfile(fields: Partial<ProfileEditable>)`: `supabase.from('profiles').update(whitelist(fields)).eq('id', uid)` → `refreshProfile`. `ProfileEditable` = `{ first_name, last_name, phone, city, province, birth_date }`.
  - `updateEmail(email)`: `supabase.auth.updateUser({ email })` → ritorna esito; la doppia conferma è gestita da Supabase (link a vecchia+nuova email). `user.new_email` resta pendente finché non confermato.
  - Fix: `refreshProfile` con gestione errore (oggi silenziosa).
- **`ProfileEditScreen`** (nuova route, forka il layout di `CompleteProfileScreen`): form pre-popolato dai valori correnti (`profile`), `AuthInput` per ogni campo, validazione on submit (riuso `validateSignUpForm` ridotto ai campi editabili), `updateProfile` + (se email cambiata) `updateEmail`. Stato loading/errore/successo.
- **`ProfileScreen`**: bottone "Modifica profilo" → naviga a `ProfileEditScreen`.

### Email change — flusso
1. Utente cambia email nel form → `updateEmail(nuova)`.
2. Supabase (con "Secure email change" abilitato) invia un link di conferma alla **vecchia** e alla **nuova** email; entrambe vanno confermate.
3. UI: messaggio «Controlla **entrambe** le caselle (vecchia e nuova) per confermare il cambio». Finché pendente, `session.user.email` resta la vecchia e `user.new_email` è valorizzata.

### Campi sensibili
- **`birth_date`**: editabile self (Art.16 = diritto a dati accurati); la validazione `validateAdult` + il `CHECK` DB impediscono valori < 18. Decisione di prodotto sulla self-editabilità → vedi Decisioni.
- **Consensi**: NON in questo screen (gestiti in M4, Art.7).

## Sicurezza & GDPR
- RLS `own_update` garantisce che si modifichi solo il proprio profilo; update **whitelist** (mai campi non previsti, mai `id`/`created_at`).
- Email change via Supabase secure flow (anti-takeover: serve conferma anche dalla vecchia email).
- Anti-enumeration: decidere se rivelare «email già in uso» (usabilità) vs messaggio generico (privacy) — vedi Decisioni.

## Testing
- Unit: `updateProfile` chiama `.update(whitelist).eq('id',uid)` (NON upsert) + refresh; `updateEmail` chiama `auth.updateUser`. Validazione campi. Rendering `ProfileEditScreen` pre-popolato + errori su valori invalidi (mock `useAuth`). Bottone "Modifica profilo" in ProfileScreen naviga. Suite (402+M4) non regredisce.

## Dipendenze nuove
Nessuna.

## Decisioni (tecniche, decise 2026-06-15)
1. **Update whitelist** (`.update().eq`) invece di `upsert` → evita di azzerare campi non presenti nel form (fix gap repo).
2. **Validazione riusata** da `validation.ts` (no duplicazione).
3. **Cambio email in scope M5** (rettifica importante), con secure email change Supabase (doppia conferma).
4. **`ProfileEditScreen` separato** da `CompleteProfileScreen` (ruoli distinti: primo completamento post-social vs rettifica); valutare refactor condiviso come proposta non bloccante.

## Decisioni DA CONFERMARE (prodotto/legale — leva utente)
- **`birth_date` self-editabile** vs modificabile solo via supporto (alcune org bloccano la data di nascita per anti-frode). Default proposto: **self-editabile** (Art.16), con validazione ≥18.
- **Anti-enumeration** sul cambio email: rivelare «email già registrata» (UX) vs messaggio generico (privacy). Default proposto: **messaggio generico** + il secure-change Supabase gestisce il conflitto.
- **Refactor `CompleteProfileScreen`** per condividere il form con `ProfileEditScreen`: proposta (zero-I, non obbligo) — valutare a implementazione.

## Verifica end-to-end (leva utente — Supabase "Secure email change" abilitato)
1. Modifica nome/telefono/città → salva → persistono (refresh) → nessun altro campo azzerato.
2. Cambio email → conferma su entrambe le caselle → `session.user.email` aggiornata.
3. Tentativo birth_date < 18 → bloccato (validazione + CHECK DB).
4. RLS: utente A non aggiorna il profilo di B.
5. jest ≥402+nuovi; tsc/eslint/madge/conta-problemi = 0.
