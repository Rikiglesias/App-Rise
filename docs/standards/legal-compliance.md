# Compliance legale — Rise Against Hunger Italia

> ⚠️ Inventario tecnico ricostruito dal codice (`src/shared/auth/`, `src/features/auth/`,
> `supabase/migrations/`, `supabase/functions/`). Le affermazioni di GIUDIZIO LEGALE
> (base giuridica, retention esatta, classificazione) sono marcate
> `> ⚠️ DA VERIFICARE CON DPO/LEGALE` e NON sono una dichiarazione di conformità.

## Premessa: l'app raccoglie dati personali e gestisce account

L'app NON è read-only/anonima. Esiste un'area donatori completa con **registrazione,
login (solo email/password dal 2026-07-26), profilo personale e consensi GDPR**, su backend
**Supabase**. Questo documento inventaria i dati realmente trattati e i diritti già
implementati nel codice. Le donazioni monetarie restano gestite da piattaforme esterne
(Donorbox via sito Rise per le donazioni; Let's Donation, `letsdonation.com`
ex welfare4charity, per shop/gift card/eventi) — l'app **non processa pagamenti**.

---

## Dati personali raccolti

### Account e autenticazione (Supabase Auth)

- **Email** — identità dell'account (registrazione email/password).
- **Password** — gestita da Supabase Auth, **mai in chiaro lato app**: hashing lato
  server. Vincoli client (`validation.ts`): min 8 caratteri, ≥1 maiuscola, ≥1 speciale.
- **Provider social** — ⚠️ **RIMOSSI il 2026-07-26** (commit `6848467`): Apple e Google
  non sono più un canale di accesso e **nessun dato ci arriva più da loro**; non vanno
  dichiarati fra i destinatari/origini di un'informativa scritta da oggi in avanti.
  Restano gli account **nati prima**, che portano l'indirizzo ricevuto allora (per chi
  usò «Nascondi la mia email», un alias `@privaterelay.appleid.com`).
- **Sessione** — persistita cifrata sul dispositivo via `expo-secure-store`
  (iOS Keychain / Android Keystore), con chunking >2KB (`authStorage.ts`).

### Profilo donatore (tabella `public.profiles`, migration 0001 + 0007)

Raccolti nei form di registrazione/profilo (`SignUpScreen.tsx`,
`CompleteProfileScreen.tsx`, `validation.ts`):

- **Nome** (`first_name`) e **cognome** (`last_name`) — obbligatori.
- **Telefono** (`phone`) — formato E.164 (`+` e 8-15 cifre), obbligatorio.
- **Città** (`city`) — obbligatoria.
- **Provincia** (`province`) — sigla IT, obbligatoria solo se `country = 'IT'`
  (nullable dal migration 0007 per donatori esteri).
- **Paese** (`country`) — ISO 3166-1 alpha-2, default `IT` (migration 0007).
- **Data di nascita** (`birth_date`) — ISO date; **età minima 14 anni** imposta sia
  in UI (`validateMinAge`) sia dal DB (`constraint eta_minima`, migration 0019, che
  sostituisce il `constraint adult` a 18 anni della 0001).
- **Nickname** (`nickname`, migration 0017) — **facoltativo**, 2-30 caratteri, unico
  (indice `profiles_nickname_unico` su `lower()`). Destinato a uscire verso un terzo come
  claim OIDC `preferred_username`, dove può comparire in **liste pubbliche di donatori**.
- **Email di contatto** (`contact_email`, migration 0009; significato riallineato dalla
  0013) — facoltativa, distinta dall'indirizzo dell'account. **Esce già oggi**: è la chiave
  scelta per il prefill delle donazioni (`contact_email ?? auth.email`).

> 🔴 **CAMPI CHE ESCONO VERSO TERZI — due canali distinti, uno già attivo.** Da tenere
> insieme quando si scrive l'informativa, perché è la parte che si sottostima più facilmente:
> - **Prefill degli URL di donazione, ATTIVO OGGI**: `first_name`, `last_name` ed `email`
>   viaggiano come parametri nell'indirizzo verso Donorbox
>   (`partnerUrls.ts` → `buildDonorboxDonationUrl`, chiamato da `usePartnerExit.ts`).
>   Coerente con `scambio-dati-quadro.md:691`, che lo registra da tempo.
> - **Claim OIDC, quando il provider si accende**: `name` (nome e cognome in una stringa,
>   sincronizzato da `syncDisplayNameClaim`), `email`, `email_verified`, `sub`,
>   `preferred_username`.
> ⚠️ Corretto il 2026-07-31: questa sezione aveva dichiarato il `nickname` «l'unico campo di
> profilo destinato a uscire verso un terzo». **Falso** — nome, cognome ed email escono già
> adesso, per un canale che esisteva prima. Un inventario che sottostima i trasferimenti è
> esattamente ciò su cui poggia l'informativa.
- **Timestamp consenso privacy** (`privacy_consent_at`).
- **Consenso marketing** (`marketing_consent`) — boolean, cache derivata (vedi consensi).
- **Stato cancellazione** (`deletion_requested_at`) — NULL = attivo;
  valorizzato = cancellazione programmata.

RLS: ogni utente accede **solo alla propria riga** (policy `own_*`, migration 0001;
hardening `with check` + init-plan `auth.uid()` in migration 0006).

### Telemetria

- **Crash/error reporting** — Sentry (`@sentry/react-native`, `App.tsx`). Attivo solo
  se `EXPO_PUBLIC_SENTRY_DSN` è configurato; `tracesSampleRate: 0.2`. Richiede dev/prebuild
  (non Expo Go). Può includere dati diagnostici e contesto runtime.

> ⚠️ DA VERIFICARE CON DPO/LEGALE — Sentry come responsabile del trattamento
> (DPA), categorie di dati nei breadcrumb/event, e disclosure nella privacy policy.

### Dati NON trattati dall'app

- **Pagamenti / dati bancari** — gestiti da piattaforme esterne, fuori dall'app.
- **Upload di contenuti utente** (foto, file) — assenti.
- **Chat / messaggistica** — assente.

---

## Consensi (GDPR Art.7) — registro append-only

Sistema dimostrativo del consenso (`consent.ts`, migration 0003), non un semplice
boolean:

- **`policy_versions`** — versioni dell'informativa con flag `is_material`
  (cambio materiale ⇒ richiede ri-consenso). Versione corrente seed:
  `privacy-2026-06-15`.
- **`consent_events`** — ledger **immutabile** (nessuna policy UPDATE/DELETE: solo
  SELECT/INSERT della propria riga). Ogni evento registra `purpose`
  (`privacy_notice` | `marketing` | `profiling`), `action` (`granted` | `withdrawn`),
  `policy_version`, `legal_basis`, `channel`, `created_at`.
- **Stato corrente** derivato dall'ultimo evento per `(user, purpose)`;
  `profiles.marketing_consent` è solo una cache.
- **Ri-consenso** — `isReConsentRequired` forza il consenso quando la versione corrente
  è materiale e manca un `privacy_notice/granted` per quella versione
  (`ReConsentScreen.tsx`).
- **Creazione iniziale** — alla registrazione il trigger server-side `handle_new_user`
  (migration 0004/0007) crea profilo + eventi `privacy_notice/granted`
  (e `marketing/granted` se l'utente ha acconsentito), con `policy_version`
  letta server-side dall'ultima pubblicata.

> ⚠️ DA VERIFICARE CON DPO/LEGALE — la `legal_basis` registrata nel codice è
> `'consent'` per tutti i purpose. Conferma che il consenso sia effettivamente la base
> giuridica corretta per ciascuna finalità (es. dati di contatto del donatore potrebbero
> poggiare su altra base) e che il testo dell'informativa lo rispecchi.

---

## Diritti dell'interessato già implementati

- **Accesso / portabilità (Art.20)** — `dataExport.ts`: esporta un JSON con account
  (id, email, created_at, provider), profilo completo e cronologia consensi, via
  share-sheet nativo. In caso di errore di fetch della history l'export viene
  interrotto (no export parziale).
- **Rettifica (Art.16)** — `updateProfile` (AuthContext) con whitelist
  `PROFILE_EDITABLE_KEYS` (mai `id`/consensi); `ProfileEditScreen.tsx`. Cambio email
  via `updateEmail` (secure email change Supabase, doppia conferma).
- **Cancellazione (Art.17)** — due modalità (`DeleteAccountScreen.tsx`):
  - **Immediata** — Edge Function `delete-account`: autorizza dal JWT del chiamante
    (cancella solo sé stesso), `auth.admin.deleteUser`, poi `signOut`. Cascade DB
    elimina profilo e `consent_events`. La revoca dei token Apple (`appleRevoke.ts`)
    è stata rimossa col login social il 2026-07-26: senza provider non c'è token da
    revocare, e la App Store 5.1.1(v) vincola solo chi offre Sign in with Apple.
    ✅ **Pubblicata il 2026-07-26** (v1 ACTIVE, `verify_jwt = true` come da
    `supabase/config.toml`). `POST /functions/v1/delete-account` senza header di
    autorizzazione risponde `401 UNAUTHORIZED_NO_AUTH_HEADER` — prima `404`.
    ⚠️ **Quanto vale questa prova**: dimostra che la funzione esiste ed è
    raggiungibile, NON che la cancellazione riesca. Quel `401` è del gateway
    (`verify_jwt = true`), che rifiuta prima di eseguire una riga dell'handler —
    il 401 dell'handler avrebbe body `{"error":"unauthorized"}` (`index.ts:46`).
    Il percorso reale (JWT valido → `getUser` → `admin.deleteUser` con
    service-role) **non è mai stato esercitato** `[A]`: va provato con un account
    usa-e-getta prima del rilascio. Ack ≠ effetto.
  - **Programmata a +30 giorni** (grace period recuperabile) — imposta
    `deletion_requested_at`; l'hard-delete a scadenza è eseguito dalla Edge Function
    schedulata `purge-deletions` (Supabase Cron, `GRACE_DAYS = 30`), protetta da
    `x-cron-secret` con confronto a tempo costante, con alert sui fallimenti.
    ⚠️ **Pubblicata ma non ancora schedulata** (2026-07-26): la funzione risponde
    (`403 forbidden` prodotto dal suo stesso handler), ma sul progetto **non sono
    installate `pg_cron`/`pg_net`** e **`CRON_SECRET` non è impostato** → nessuno la
    invoca, quindi **l'hard-delete a 30 giorni oggi non avviene**. I dati di chi ha
    chiesto la cancellazione programmata restano oltre il termine dichiarato: va
    chiuso prima del rilascio. Ordine obbligato: ① segreto ② estensioni ③ job
    schedulato (creare il job prima del segreto produce solo `403` ricorrenti).
  - Annullabile finché entro il grace period (`cancelScheduledDeletion`).

> ⚠️ DA VERIFICARE CON DPO/LEGALE — periodi di **retention** esatti oltre il grace
> period di 30 giorni (es. backup Supabase, log Sentry), obblighi di conservazione di
> documenti del donatore, e coerenza con quanto dichiarato nella privacy policy.

---

## Note di compliance da verificare

### Privacy policy

Il link in-app punta a `https://italy.riseagainsthunger.org/privacy-policy/`
(`urls.ts`), mostrato in fase di consenso (`SignUpScreen`/`CompleteProfileScreen`).

> ⚠️ DA VERIFICARE CON DPO/LEGALE — l'informativa deve coprire TUTTO l'inventario
> sopra (account, profilo, telefono, data di nascita, **nickname**, **email di contatto**,
> consensi, Sentry e Supabase come
> responsabili), i diritti e i tempi di conservazione. 🔴 **Due voci aggiunte il 2026-07-31**
> (`nickname` dalla 0017, `contact_email` dalla 0009): erano nel database e **non**
> nell'inventario, quindi l'informativa non le copriva. Il `nickname` è il caso che pesa —
> è destinato a **uscire verso Let's Donation** e a comparire in liste pubbliche.
> 🔴 **La soglia dei 14 anni** (0019, applicata il 2026-07-31) va detta nell'informativa
> **prima del rilascio**: oggi dice un'altra cosa. **Apple/Google NON vanno più
> inclusi come origine dei dati** (login social rimosso il 2026-07-26): dichiararli
> descriverebbe un trattamento che non avviene.
> La versione del testo deve coincidere con `policy_versions` (`privacy-2026-06-15`).

### GDPR

- **Età minima 14 anni** imposta in UI e DB — soglia italiana per il consenso digitale
  (art. 8 GDPR + d.lgs. 101/2018, art. 2-quinquies Codice Privacy). Regime unico: sopra i
  14 acconsente la persona, sotto i 14 non si entra, perché il consenso di chi ha la
  responsabilità genitoriale andrebbe raccolto e **provato** e non lo raccogliamo.
  ⚠️ Fino al 30/07/2026 il limite era 18 («no trattamento di minori per design»):
  **l'informativa deve dire la soglia nuova prima del rilascio**.
- **Minimizzazione**: i campi raccolti sono finalizzati al rapporto col donatore.
- **Onere della prova del consenso**: coperto dal ledger `consent_events`.

> ⚠️ DA VERIFICARE CON DPO/LEGALE — adeguatezza delle basi giuridiche, valutazione
> di necessità per ciascun campo (es. data di nascita/telefono), eventuale DPIA,
> nomina del DPO, registro dei trattamenti, e clausole di trasferimento dati verso
> Supabase e Sentry (Apple/Google non più pertinenti dal 2026-07-26).

### PCI-DSS

L'app **non processa né memorizza dati di pagamento**: le donazioni avvengono su
piattaforme esterne.

> ⚠️ DA VERIFICARE CON DPO/LEGALE — la classificazione PCI dipende dall'esatto flusso
> di pagamento delle piattaforme esterne; confermare che l'app non entri mai in contatto
> con dati di carta (neppure via webview/redirect che ne trasportino).

---

## Sicurezza (stato implementato)

### Trasporto

- **Certificate pinning** Android — `android-network-security-config.xml`: `pin-set`
  per `riseagainsthunger.org` e `italy.riseagainsthunger.org` (scadenza pin 2030-06-04),
  `cleartextTrafficPermitted="false"` sui domini di produzione.
- **No cleartext** di default (`base-config`), eccezione solo per host di
  sviluppo locale (localhost, 10.0.2.2, exp.direct).

> ⚠️ DA VERIFICARE — equivalente iOS (App Transport Security / NSAppTransportSecurity)
> in `app.config.js`/Info.plist e copertura del pinning verso l'endpoint Supabase
> (`*.supabase.co`), oggi NON incluso nel pin-set.

### Storage locale

- Sessione e token in `expo-secure-store` (Keychain/Keystore), con chunking
  (`authStorage.ts`). Su web (solo dev/preview) fallback a `localStorage` non cifrato.

### Backend

- **RLS** attiva su `profiles`, `consent_events`, `policy_versions` (own-row).
- Trigger `handle_new_user` `SECURITY DEFINER` con `search_path` pinnato e `EXECUTE`
  revocato da `public/anon/authenticated` (rimuove la superficie RPC, migration 0006).
- Edge Functions: `delete-account` autorizza dal JWT del chiamante; `purge-deletions`
  protetta da segreto con confronto a tempo costante.
- **Chiave anon Supabase pubblica per design** (`supabaseClient.ts`): la sicurezza dei
  dati poggia sulle RLS, non sulla segretezza della chiave.

### Monitoraggio

- Sentry per crash/error reporting (DSN solo da env, mai committato).

---

## Checklist (stato tecnico, non parere legale)

### App Store / Play Store

- [ ] Privacy policy allineata all'inventario dati reale (sopra)
- [ ] Data safety / privacy nutrition label dichiarano account, contatti, identificativi
- [x] Eliminazione account in-app (App Store 5.1.1(v)) — `DeleteAccountScreen`
- [n/a] Sign in with Apple accanto ad altri provider (Apple 4.8) — **non dovuto**:
      dal 2026-07-26 l'app non offre alcun login social, l'ingresso è solo
      email + password, quindi la linea guida non si applica

### GDPR (implementazione)

- [x] Consenso tracciato (ledger `consent_events`)
- [x] Diritto di accesso/portabilità (`dataExport.ts`)
- [x] Diritto di rettifica (`updateProfile`/`updateEmail`)
- [ ] Diritto di cancellazione — **immediata**: funzione pubblicata, percorso completo
      ancora da provare `[A]`; **programmata a 30gg**: NON eseguita finché il cron non
      è acceso (`pg_cron`/`pg_net` non installate, `CRON_SECRET` assente). Vedi
      §Cancellazione sopra: la spunta tornerà quando entrambe sono verificate dal vivo
- [ ] Retention oltre i 30gg definita e documentata — DA VERIFICARE CON DPO/LEGALE

### Sicurezza

- [x] Certificate pinning Android (domini Rise)
- [ ] Pinning/ATS iOS verificati; pinning endpoint Supabase valutato
- [x] Secure storage iOS/Android (Keychain/Keystore)
- [x] RLS attiva su tutte le tabelle dati
- [x] Crash monitoring (Sentry, DSN da env)
