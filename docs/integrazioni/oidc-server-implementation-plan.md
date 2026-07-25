# OIDC «Login con RAH» — piano di implementazione lato nostro (RAH = OpenID Provider)

> Piano di build del server OIDC su Supabase, per far accedere gli utenti RAH a Let's
> Donation (LD) senza secondo login. **Non ancora eseguito**: l'accensione dell'OAuth
> server è un cambio all'auth di **produzione** su una feature **beta** → decisione di
> Riccardo (leva), da fare **dopo** la risposta del fornitore al brief.
>
> **REVISIONE 2026-07-24 (workflow read-only `w45y0hz6y`, verifica alla fonte)** — la
> precondizione tecnica bloccante è stata sciolta e RIBALTA il §3 di questo piano: i claim
> custom **non** arrivano al client OIDC. Il piano è stato riscritto di conseguenza.
> Fonti: `supabase.com/docs/guides/auth/oauth-server` (+ `/token-security`,
> `/oauth-flows`, `/getting-started`) e `.../auth-hooks/custom-access-token-hook`.
> Contesto/decisioni: memoria `integrazione-identita-partner.md`; brief
> `letsdonation-brief-integrazione.md`.

## Finding che riscrive il piano (verificato alla fonte)

**I claim custom NON raggiungono il client OIDC.** Il Custom Access Token Hook modifica solo
l'**access token**, mai l'**id_token** né lo **UserInfo** — che portano solo i claim OIDC
STANDARD determinati dagli scope: `sub`, `email`, `email_verified`, `name`, `phone`,
`picture`. Un client OIDC di terzi (plugin Joomla di LD) legge id_token/UserInfo → **non
vedrà mai `rise_ref` né un'email "risolta" custom**.

Conseguenze:

- **`rise_ref` esce dal login OIDC.** Non serviva all'identità (quella è il `sub`): `rise_ref`
  è il meccanismo di ATTRIBUZIONE UTM sull'ordine (Richiesta A del brief), e lì resta.
- **L'email a LD = claim `email` standard = `auth.users.email`.** Per gli utenti Apple-hide è
  l'alias `@privaterelay.appleid.com`, che **inoltra** alla casella reale (Apple recapita).
  **Assunto, da confermare con LD** (zero-M — è un sistema di terzi): che HikaShop accetti
  l'alias relay per creare l'account via JIT e non pretenda `email_verified` sull'alias.
  L'email "risolta reale" (`contact_email`, F1.10) **non** è consegnabile come claim
  → residuo dichiarato (l'utente relay compare su LD con l'alias, che inoltra).
- **Il Custom Access Token Hook NON va costruito** per questo flusso: non raggiunge LD e
  l'access token non va comunque consegnato a un terzo (vedi sicurezza). Le vecchie
  «Correzione #1/#4» (email condizionale e hedge-id come claim) **non sono applicabili** via
  OIDC standard.

## Precondizioni (gate — NON partire prima)

- [ ] **Fornitore**: LD conferma (a) client OIDC su Joomla (plugin), (b) matching sul `sub`
      non l'email, (c) **ingresso unico sul nostro tenant**: il modulo di registrazione nativo
      viene tolto **nello stesso momento** in cui il pulsante va online — le due cose insieme,
      non una dopo l'altra (invariante **I7**, già concordata in chiamata; confermato da
      Riccardo 2026-07-25). **Non è una preferenza**: scriverlo come «preferito» è
      l'ammorbidimento a ledger (`ask-ammorbidito-e-debolezza-consegnata-al-terzo`).
- [ ] **Chiavi di firma ASIMMETRICHE (RS256/ES256)** sul progetto Supabase — prerequisito
      HARD: l'id_token con HS256 **fallisce**. Migrare le JWT signing keys è un'operazione
      sull'auth di produzione → **leva**. Verificare prima l'algoritmo attuale del progetto.
- [ ] **Decisione rischio-beta**: Riccardo accetta l'auth di produzione su Supabase OAuth
      2.1 Server (beta dal 26/11/2025, GA slittata, prezzo post-GA ignoto) → **leva**.
- [x] ~~**Field-test claim propagation**~~ **SCIOLTO alla fonte 2026-07-24**: verdetto NO
      (vedi sopra). Il field-test resta utile solo per confermare che i claim STANDARD
      (sub, email, name) arrivino correttamente all'id_token dopo l'abilitazione.

## Passi lato nostro (in ordine)

1. **Migrare le JWT signing keys ad asimmetriche** (RS256/ES256) — prerequisito per l'id_token.
   Operazione auth di produzione → leva. Reversibile via rotazione chiavi.
2. **Abilitare l'OAuth 2.1 / OpenID Provider su Supabase** (Dashboard > Authentication >
   OAuth Server > Enable, con `authorization_url_path` = path della NOSTRA pagina consent).
   Reversibile: si disabilita. → step-leva (auth di produzione).
3. **Costruire la pagina web consent + registrazione** (a nostro carico — Supabase non la
   ospita). È il pezzo più grande. Stack: piccola app **Next.js** con `@supabase/supabase-js`
   e `@supabase/ssr`. **Hosting DA CONFERMARE con Riccardo (2026-07-24)**: `riseagainsthunger.org`
   (incl. `italy.`) è di **Rise Against Hunger USA**, NON di RAH-Italia → NON usabile. Opzione
   consigliata: indirizzo **Vercel gratuito** (`*.vercel.app`) subito, o un dominio proprio di
   RAH-Italia se ne acquisisce uno. Nessuna dipendenza dal dominio dell'org globale.
   Route:
   - `/consent` — legge `authorization_id`, `supabase.auth.oauth.getAuthorizationDetails()`,
     mostra client+scope, `approveAuthorization()` / `denyAuthorization()`, redirect.
   - `/register` — signup DA WEB (Apple/Google/email + 18+ `birth_date` + consenso privacy
     tracciato + provisioning profilo), per il nuovo utente diretto su LD (SSO-only).
   - `/auth/callback` — redirect handler; token exchange e `client_secret` SOLO server-side.
   - **NB claim `name`**: viene dai `user_metadata`, non da `profiles` → in fase build
     sincronizzare `profiles.first_name/last_name → user_metadata.name`; per gli Apple-hide il
     nome può mancare dopo il primo login → verso LD `name` è consegnato «se disponibile».
   Leve infra: progetto Vercel (indirizzo gratuito o dominio nostro — MAI riseagainsthunger.org)
   e l'URL nell'allow-list Redirect di Supabase.
4. **Registrare il client LD**: `client_id` + `client_secret` dedicati (Dashboard > OAuth Apps,
   o `supabase.auth.admin.oauth.createClient()`), redirect URI che LD indica, scope
   `openid email profile`. Il secret è un segreto → env/secret-manager, mai in repo/chat.
   (DCR disabilitata di default; per un client noto = registrazione manuale.)
5. **Discovery + scope**: `…/.well-known/openid-configuration` (esposto una volta abilitato;
   NB bug beta: i custom domain non si propagano al discovery). Documentare per LD gli scope
   e i claim STANDARD disponibili (sub, email, name).
6. **Consegnare a LD** i parametri (discovery URL, client_id/secret, scope) e giro di test
   end-to-end (login → JIT sul loro MySQL → aggancio sul `sub`).

## Sicurezza (gotcha beta — non ignorare)

- Gli access token OAuth hanno **privilegi PIENI** dell'utente (come i session token) + il
  `client_id`; gli scope **non** limitano l'accesso al DB → l'autorizzazione dipende
  INTERAMENTE dalle RLS. **Precisazione**: nel flusso OIDC standard (authorization code +
  `client_secret`) il client LD **riceve comunque** l'access token al token-endpoint — è
  inevitabile, non "glielo diamo o no". Il rischio reale (LD detiene un token full-power
  sull'utente) va MITIGATO, non negato:
  - LD deve leggere l'identità dal solo **id_token / UserInfo standard**, senza usare l'access
    token per chiamare API nostre;
  - **audit RLS** che ogni utente veda solo le proprie righe (è l'unica barriera);
  - **TTL degli access token** il più breve possibile — NB: su Supabase l'expiry del JWT è
    impostazione a livello di **PROGETTO** (globale, colpisce tutte le sessioni dell'app), non
    per-client; un TTL distinto per i soli token OAuth è **da verificare**. Resta comunque la
    rotazione/revoca del client.

## Rollback / reversibilità

- **Chiavi asimmetriche**: rotazione reversibile lato Supabase.
- **Server OAuth**: disabilitabile dalla config → i client smettono di autenticare. Reversibile.
- **Client LD**: revocabile (elimina `client_id`/ruota il secret) → blocca solo LD.
- **Pagina web**: cancellabile (host Vercel o altro); nessun DNS altrui coinvolto.
- **Ingresso unico per-tenant**: tecnicamente lato LD basta riattivare il modulo nativo, ma
  **questa contingenza NON si instrada nell'accordo col partner**: scriverla nel DSA equivale a
  consegnare per iscritto la via d'uscita dalla richiesta (errore a ledger). Resta una nostra
  nota interna di rischio; verso LD la posizione è una sola: pulsante su e modulo giù insieme.
- **Punto di non ritorno**: nessuno lato nostro. Lato LD, gli account già provisionati via JIT
  restano nel loro DB (sono loro utenti).

## Rischi dichiarati

- **Beta** (medio-alto): breaking change possibili su endpoint/hook/config, nessuno SLA,
  prezzo post-GA ignoto, GA slittata. Login di produzione di una onlus su feature beta =
  rischio da accettare esplicitamente. Mitigazione **interna** (mai «teniamo anche il loro
  modulo»: ricrea la doppia anagrafica, cioè il problema che l'integrazione risolve):
  presidio del provider, tempi di ripristino dichiarati, e se il rischio non è accettabile si
  sposta la data di partenza, non si riapre la seconda porta.
- **Nuova superficie web auth-critica** (la pagina consent/registrazione): da mettere in
  sicurezza (secret solo server-side, TLS, cookie sicuri, allow-list redirect).
- **Accoppiamento di disponibilità**: provider giù → nessuno registra/fa checkout sul contesto
  RAH di LD. È lo stesso rischio che corre l'autenticazione della nostra app: si presidia
  (monitoraggio + ripristino), **non** si compensa riaprendo il modulo nativo di LD.
- **Dipendenza dal fornitore**: tutto il percorso è gated sul fatto che LD costruisca il
  client OIDC (sul `sub`, per-tenant).

## GDPR

- Due titolari autonomi + Data Sharing Agreement (non Art.26, non Art.28). Liceità = il click
  dell'utente. Claim minimi STANDARD (`sub`, `name`, `email`). Nessuna pre-creazione bulk.
  Informativa RAH aggiornata (dipende dal criterio 1 del goal partner-identita). Vedi memoria
  `gdpr-compliance`.

## De-risking osservato

- Al 2026-07-24 tutte le tabelle hanno **0 righe** (pre-lancio) → abilitare l'OAuth server ha
  blast-radius quasi nullo sugli utenti reali (non ce ne sono ancora).
