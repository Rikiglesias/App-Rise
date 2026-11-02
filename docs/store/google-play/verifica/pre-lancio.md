# Passata pre-lancio di sicurezza

Prima esecuzione della checklist `security-reviewer/references/pre-lancio.md` su App Rise, 02/11. Sotto il giudizio
finale; in fondo la raccolta delle evidenze voce per voce, i cui esiti sono proposte superate da questa tabella.
Regola della checklist: una prova mancante è «non passa», mai N/A.

Letto dal vivo il 02/11, sola lettura: 13 funzioni SECURITY DEFINER con `search_path` vuoto, solo `nickname_disponibile`
aperta ad `anon`; RLS su 6 tabelle su 6; nessun bucket, nessuna pubblicazione realtime, `pg_graphql` assente; conferma
email obbligatoria, solo provider email; registro fermo alla 0020; 2 account di prova, 0 profili, 0 contatti storici.

| Esito | Voci |
|---|---|
| Passa | V1.1 V1.2 V2.3 V4.4 V6.1 V7.1 V8.1 V8.2 V8.3 V11.1 V13.3 V13.4 V15.2 V16.1 A.1 A.7 S.3 S.6 Z.1 |
| Corretto nel repo, passa con la 0023 in produzione | V2.1 V8.4 V8.5 |
| Corretto nel repo, passa con le pagine pubblicate | S.10 S.14 |
| Non passa, decisione o azione di Riccardo | V4.3 V6.2 V6.3 V10.1 A.4 A.5 |
| Non passa, consulente o PEC | S.15 C.2 C.3 C.4 |
| Non passa, sede USA | V3.2 V12.1 V13.5 |
| Non passa, prova mancante in F12 sulla build | V6.5 V9.1 V13.1 V13.2 V14.2 V15.1 V16.2 A.8 C.1 C.6 |
| Non passa, prova mancante su stack Auth locale | V6.4 V7.2 V7.3 |
| Non passa, prova mancante sugli URL pubblicati | S.7 S.9 S.17 |
| Non passa, resta da fare | Z.2 (revisione indipendente: giro 2 di C83), Z.3 (schema del registro assente nella reference) |
| N/A motivato, inventario nella raccolta | V1.3 V2.2 V3.1 V3.3 V4.1 V4.2 V5.1 V5.2 V14.1 A.2 A.3 A.6 L.1 L.2 L.3 S.1 S.2 S.4 S.5 S.8 S.11 S.12 S.13 S.16 C.5 |

Totale: 19 + 3 + 2 + 6 + 4 + 3 + 10 + 3 + 3 + 2 + 25 = 80 voci.

Note sui giudizi che pesano:

- **V8.2**: batteria a due account in `supabase/tests/0023_privilegi_minimi.test.sql`, T6; con RLS spenta cade (M7, M8).
- **V8.4**: in produzione `anon` e `authenticated` hanno tutti i privilegi, `TRUNCATE` compreso, su tre tabelle. La RLS non
  copre `TRUNCATE`; oggi non è raggiungibile. La 0023 toglie ciò che l'app non usa.
- **V2.1**: chi aggira il client resta libero di scrivere sulla propria riga. Scelta voluta: niente elenco di colonne,
  perché `useProfileForm.ts:447` fa upsert e `AuthContext.tsx:400` scrive `deletion_requested_at`. Il danno resta sulla
  propria riga e la prova del consenso è `consent_events`.
- **V3.2**: il CORS `*` di `delete-account` è motivato: l'autenticazione è con token, non con cookie. Non passa solo per
  le intestazioni del sito USA, che è fuori dal nostro controllo.
- **V12.1**: `http://italy.riseagainsthunger.org` risponde 200 senza passare a https e senza HSTS. Non blocca Play.
- **V15.2**: 6 workflow su 6 con permessi; 37 azioni `actions/*` su 41 restano a tag per scelta di C78 (`FIDATI_C78`).

---

## Raccolta delle evidenze (proposte, non giudizi)

**Voci della checklist: 80.** Esiti proposti, ricontati su questo file: passa-statico 12, sospetto 15, N/A 25, serve-prova-attiva 28. Somma 80.

Raccoglitore, non giudice: gli esiti sono proposte. Checklist: `~/.claude/skills/security-reviewer/references/pre-lancio.md`.
Repo letto: `C:\tmp\rah-codex-i18n`, branch `feat/f11`. Il codice dell'app è quello di `afd3912`: `git diff afd3912 HEAD` su `src`, `supabase`, `App.tsx`, `app.config.js` è vuoto.

**Avviso sul perimetro.** La raccolta è partita su HEAD `21ba635`. Mentre lavoravo qualcun altro ha cambiato il worktree: 8 file modificati alle 22:34, poi il commit
`204afd5` (workflow e OTA), poi `package.json` e `docs/store/google-play/rilascio.md` ancora non committati. I conteggi CI sono ricontati su `204afd5`.
I numeri di riga di `rilascio.md` sono quelli letti su `21ba635`: nel file attuale, dopo la riga 185, vanno aumentati di 4.

Percorsi delle migration abbreviati: `0022:93` = `supabase/migrations/0022_*.sql:93`.
Rilievi citati come `perimetro n` di `docs/store/google-play/verifica/rilievi-f13.md`; il codice è stato riletto, i rilievi non bastano da soli.
Produzione: migration applicate fino alla 0020, lettura del 28/10 riportata da `docs/store/google-play/rilascio.md:330`. La 0021 e la 0022 esistono solo nel repo.

## V1 — Codifica e sanificazione

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| V1.1 SQL injection | passa-statico | Client solo via supabase-js parametrizzato: `src/shared/auth/AuthContext.tsx:193-197,371-374`, `src/shared/partner/partnerRefService.ts:39-44`. Unica RPC con parametro tipizzato `src/shared/auth/nickname.ts:68`, corpo statico `0018:59-64`. `git grep` di `.or(`, `.filter(`, `textSearch`, `ilike(`, `execute format`, `EXECUTE` in src, migrations, functions: solo `Array.filter` JS, zero SQL dinamico. | Facoltativo: apostrofi nella batteria a due account di V8.2. |
| V1.2 XSS | passa-statico | `git grep` di `WebView`, `dangerouslySetInnerHTML`, `injectJavaScript`, `eval(`, `new Function` in src senza test: 0. Nessuna libreria webview in `package.json:92-133`. Pagine statiche: `<script>` = 0 su 4 (app. G). Parametri verso i partner con `encodeURIComponent`: `src/shared/partner/partnerUrls.ts:47-50`. | Nessuno. Ramo web solo dev: `src/shared/auth/authStorage.ts:68-70`. |
| V1.3 SSRF | N/A | Inventario: `supabase/functions` contiene `delete-account` e `purge-deletions`. Unico `fetch` esterno: `purge-deletions/index.ts:56`, URL da env `:50`, mai da input. `delete-account` non fa fetch. Nessun recupero di URL lato server. | Nessuno. |

## V2 — Validazione e logica di business

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| V2.1 Input e dimensione delle richieste | sospetto | Vincoli server su `profiles`: solo `profiles_contact_email_chk` (`0009:28-33`), `nickname_forma` (`0017:81-85`), `eta_minima` (`0019:221-223`). Nessun limite di lunghezza su first_name, last_name, phone, city, province, country; `consent_events.channel` libero (`0003:21`). `own_update` è per riga, non per colonna (`0006:17-18`), nessun `grant update(colonna)` (app. B). La whitelist dei campi sta solo nel client: `AuthContext.tsx:349-354`. Chiamando PostgREST si riscrivono i propri `privacy_consent_at`, `created_at`, `deletion_requested_at` e, con la 0020 in produzione, `marketing_consent`. Nome e paese finiscono in `raw_user_meta_data`, quindi nel JWT: `0021:59-85`. | Su DB locale, da authenticated: PATCH `profiles` con first_name da 1 MB, con tipo errato, con `privacy_consent_at` e `created_at` alterati. Atteso rifiuto; oggi il codice non lo prevede. |
| V2.2 Prezzi e diritto al servizio | N/A | `git grep` di `stripe`, `checkout`, `in.app.purchase`, `revenuecat`, `expo-iap` in src, supabase, package.json: 0. Donazioni e acquisti su siti esterni: `partnerUrls.ts:28`, `src/shared/constants/urls.ts:37-40`, `play-console-risposte.md:177-178`. | Nessuno. |
| V2.3 Invii doppi e concorrenza | passa-statico | Indice unico parziale `0008:30-32`, gestione 23505 `partnerRefService.ts:86-93`. Guardia sul doppio tocco `src/shared/partner/usePartnerExit.ts:110,139-140,257-258,296-297`. Cancellazione riconciliata dopo errore `src/shared/auth/accountActions.ts:130-140`. Rilievi F1 1, F2 4 → C67. Residuo noto: sulla 0020 il marketing è scritto in due passi (`AuthContext.tsx:492-507`, giro2-arch 9), la 0022 lo chiude. | Ripetere dopo la 0022: due toggle marketing simultanei. |

## V3 — Sicurezza del frontend web

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| V3.1 CSRF e cookie di sessione | N/A | `git grep` di `document.cookie`, `credentials: 'include'`, `set-cookie`: 0. Sessione bearer in SecureStore: `src/shared/auth/supabaseClient.ts:33`. Pagine statiche: `<form>` = 0. | Nessuno. |
| V3.2 CORS e header di sicurezza | sospetto | `supabase/functions/delete-account/index.ts:13-17` risponde `Access-Control-Allow-Origin: *`, inutile per un'app nativa. Rischio basso: risposte con soli codici (`:74-101`), token bearer e non cookie. `purge-deletions` non ha CORS. Header delle pagine pubbliche: li decide l'hosting USA (`rilascio.md:403-405`), non verificabili qui. | Decidere se restringere o motivare `*`. Dopo la pubblicazione: `curl -I` sulle tre pagine, CSP, X-Content-Type-Options, Referrer-Policy. |
| V3.3 SRI sugli script esterni statici | N/A | `<script>` = 0 nelle 4 pagine, nessun foglio esterno; gli unici URL esterni sono `<a>` verso sito e Garante (app. G). | Se le pagine finiscono dentro il tema WordPress USA, riguardare il wrapper. |

## V4 — API e servizi web

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| V4.1 Webhook: autenticità | N/A | Nessuna funzione riceve eventi di terzi: `delete-account` con JWT utente (`index.ts:76-88`), `purge-deletions` con segreto cron (`index.ts:110-115`). `git grep webhook` in src e supabase: solo `PURGE_ALERT_WEBHOOK`, in uscita. `supabase/config.toml` senza auth hook. | Rivedere se LD o Donorbox manderanno eventi. |
| V4.2 Webhook: replay e idempotenza | N/A | Stesso inventario di V4.1: nessun endpoint riceve eventi esterni. | Nessuno. |
| V4.3 Limiti API e autenticazione | sospetto | `nickname_disponibile` eseguibile da anon senza alcun limite: `0018:79-80`; nessun limite in migrations. Il limite di rinvio è solo nel client: `src/shared/auth/useEmailConfirmation.ts:76-84`. `config.toml` non ha `[auth]`: soglie di login, OTP e reset solo in dashboard. `delete-account` senza limite proprio. | Su ambiente di prova: raffica sulla RPC anon, su login, reset e rinvio. Leggere le soglie Auth in dashboard. Atteso: 429 visibile, nessun bypass. |
| V4.4 GraphQL, WebSocket e realtime | serve-prova-attiva | Lato codice nulla: `.channel(`, `realtime`, `graphql`, `alter publication` in src e migrations = 0 (solo `deno.lock`). Ma `/graphql/v1` e `/realtime/v1` sono endpoint della piattaforma, il repo non li inventaria. | Stack locale: introspezione GraphQL da anon, query su `profiles` da altro utente, subscribe a `profiles`. Atteso nessun dato altrui. |

## V5 — Gestione dei file

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| V5.1 Upload | N/A | `git grep` di `storage.(from/objects/buckets)`, image-picker, document-picker, `multipart`, `FormData`, `upload` in src, supabase, package.json: solo URL di PDF in `src/features/impact/data/impactData.ts:10`. Nessun bucket nelle migration. | Nessuno. |
| V5.2 Path traversal | N/A | Nessun endpoint serve file: le due funzioni edge non leggono il filesystem (`delete-account/index.ts`, `purge-deletions/index.ts`, lette intere). | Nessuno. |

## V6 — Autenticazione

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| V6.1 Conferma email | serve-prova-attiva | «Confirm email» è impostazione di dashboard: `0004:2`, `config.toml` senza `[auth]`; `0016:460` nota che basta `mailer_autoconfirm` acceso per riaprire il furto di schede. Il claim dell'archivio esige email confermata: `0019:586-588`. App: `src/shared/auth/authErrors.ts:37-38`. | Leggere `mailer_autoconfirm` su Supabase; su locale account non confermato tenta login e scrittura. |
| V6.2 MFA e account predefiniti | serve-prova-attiva | Nessun ruolo admin nel prodotto: `git grep` di `is_admin`, `isAdmin`, `role =`, `app_metadata`, `user_role`, `auth.jwt()` = 0. Credenziali demo fuori repo: `play-console-risposte.md:46-47`, `rilascio.md:310-312`. L'accesso amministrativo vero è su Supabase, EAS, Play, GitHub: non leggibile dal repo. | Riccardo: MFA obbligatoria sugli account di quei quattro pannelli. Account demo con password robusta e dati di prova. |
| V6.3 Password deboli o trapelate | sospetto | Regola solo nel client: `src/shared/auth/validation.ts:15-18` (usata da `ResetPasswordScreen.tsx:59`). Protezione password trapelate spenta sul piano free: `rilascio.md:376-378`, lettura del 28/10. `git grep` di `pwned`, `haveibeen`, `leaked` in src e supabase: 0. Requisito minimo server non nel repo. | Registrare via API un account con password da corpus: atteso rifiuto. Oggi l'atteso storico è «non attivabile senza Pro»: scelta fra Pro e controllo k-anonymity. |
| V6.4 Enumerazione e tentativi ripetuti | serve-prova-attiva | Messaggi distinti mappati in `authErrors.ts:36-45`: `invalid_credentials`, `email_not_confirmed`, `already_registered`. Se escono senza password corretta decide GoTrue. Enumerazione nickname dichiarata: `0018:22-30`. | Stack locale: login, reset e signup su account esistente, inesistente e non confermato; confrontare le risposte; superare la soglia. |
| V6.5 Link di reset | serve-prova-attiva | PKCE `supabaseClient.ts:32`, scambio `src/shared/auth/authLinkExchange.ts:21`, errori `src/shared/auth/authRedirect.ts:124-127`, stesso URL non riprocessato `src/shared/auth/useAuthDeepLink.ts:52-53`. Residuo A-B-C 1: un link falso durante il recupero fa perdere il verificatore, senza presa dell'account. Scadenza in dashboard. | Dispositivo: link valido, riuso, scaduto (`rilascio.md:306-309`). |

## V7 — Gestione delle sessioni

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| V7.1 Conservazione dei token | passa-statico | Nativo: SecureStore a blocchi, `src/shared/auth/authStorage.ts:17-66,88-89`, `supabaseClient.ts:33-37`. Web: `localStorage` solo dev e preview, `authStorage.ts:68-70`; nessun profilo web in `eas.json`. `app.config.js:192` `allowBackup: false`. | Riesame dell'eccezione web, se mai si pubblica una versione web. |
| V7.2 Logout e revoca | serve-prova-attiva | `AuthContext.tsx:298` `signOut({ scope: 'local' })`. Durata JWT solo in dashboard. La validità del token d'accesso fino a `exp` resta da verificare. | Supabase locale: salvare token sintetico, logout, riprovare subito e dopo `exp`. Registrare. |
| V7.3 Cambio password | serve-prova-attiva | Unica via: recupero → `src/shared/auth/accountActions.ts:42-47`, `src/features/auth/screens/ResetPasswordScreen.tsx:69`. Nessun campo password attuale. Revoca delle altre sessioni decisa da GoTrue. | Due sessioni di prova, cambio password, riuso della vecchia e della seconda sessione. |

## V8 — Autorizzazione

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| V8.1 Ruolo amministratore sul server | passa-statico | Nessuna UI admin. Operazioni privilegiate: `purge-deletions` chiusa senza segreto, confronto a tempo costante prima della chiave (`index.ts:110-115`); `delete-account` solo sé stesso (`index.ts:83-95`); funzioni `_di` revocate (`0020:250`, `0021:100`); tabelle interne revocate (`0012:217-218`, `0008:82,88`). Purge non schedulato: A-B-C 5-6, `src/shared/auth/deletionPolicy.ts:42`. | Chiamate dirette da utente ordinario nella batteria V8.2. |
| V8.2 IDOR, tenant e RLS | serve-prova-attiva | RLS su 6 tabelle su 6, policy in app. B. Suite con `set role` solo su 4 file: 0008, 0012, 0018, 0022. Suite fuori dalla CI (giro2-arch 10; `run-all` assente nei workflow). `get_advisors` non eseguito: MCP vietato in questa raccolta. | Batteria a due account su DB locale, fixture con RLS spenta che la sonda deve rilevare, `get_advisors` sul vivo. |
| V8.3 Funzioni SECURITY DEFINER | passa-statico | 16 definer, una per una in app. A: tutte con `search_path=''`; 15 senza EXECUTE per public, anon, authenticated; `nickname_disponibile` eccezione motivata (`0018:22-30`). Inventario meccanico dell'ultima definizione, poi letto il corpo. Comportamento finale `allinea_*` e 0022 non in produzione. | Rileggere `pg_proc.prosecdef` e `has_function_privilege` sul vivo: le migration sono state applicate a mano e possono divergere (`0017:59-64`). |
| V8.4 Privilegi DB e storage | serve-prova-attiva | Client solo chiave pubblica: `src/shared/config/environment.ts:22-23`, `supabaseClient.ts:18`. Chiave admin solo in env della funzione: `delete-account/index.ts:33-52`. `profiles`, `consent_events`, `policy_versions` senza grant espliciti: dipendono dai default privileges del progetto (`0008:43-50`). Nessun bucket nel repo. | Da anon e authenticated su DB vivo in lettura o su copia: `information_schema.role_table_grants`, elenco bucket. |
| V8.5 Identificatori esposti | sospetto | UUID di default ovunque: `0001:5`, `0003:15`, `0008:19`, `0012:161`. Ma `grant select, insert` sull'intera tabella (`0008:54`) e policy che controlla solo `user_id` e `active` (`0008:64-66`): il client può scegliere il valore di `ref`, contro quanto dice il commento `0008:56`. Nessun trigger lo sovrascrive (`git grep partner_refs` nelle migration). Conseguenza: ref scelti a mano e oracolo di esistenza via PK. Basso. | POST su `partner_refs` con `ref` scelto: oggi passerebbe. Valutare `grant insert (user_id, partner)`. |

## V9 — Token autonomi

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| V9.1 JWT | serve-prova-attiva | `delete-account/index.ts:83-88` valida con `auth.getUser`; `supabase/config.toml:10-11` `verify_jwt=false` per le chiavi ES256. `git grep` di `sb_secret`, `service_role`, `SUPABASE_SECRET` in src senza test: 0. | Token alterato e scaduto contro funzione e REST su locale; scan del bundle (V13.1). |

## V10 — OAuth e OIDC

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| V10.1 Redirect e flusso OAuth | serve-prova-attiva | Niente OAuth nel client: `signInWithOAuth`, `signInWithIdToken`, `signInWithOtp`, `linkIdentity` = 0. Redirect email da costante: `authRedirect.ts:20-28`; solo tre percorsi accettati `authRedirect.ts:80-95`; `detectSessionInUrl: false` `supabaseClient.ts:37`; nessun `linking` nella navigazione. Allow-list in dashboard: `rilascio.md:292-294` elenca tre URL esatti, `authRedirect.ts:13` parla di `rahitalia://**`. Provider OIDC spento: `0017:19-22`, lettura del 29/07. | Leggere l'allow-list reale; `redirect_to` fuori elenco rifiutato; confermare il provider OIDC spento. |

## V11 — Crittografia

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| V11.1 Password | passa-statico | Nessuna colonna password nelle 6 tabelle (`0001:4-22`, `0012:160-199`, ecc.). Password solo verso Auth: `useEmailConfirmation.ts:36-38`, `accountActions.ts:23-26`; esclusa dai metadata `useEmailConfirmation.ts:42-63`. | Nessuno. |

## V12 — Comunicazioni sicure

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| V12.1 HTTPS e HSTS | serve-prova-attiva | App: solo https verso l'esterno `src/shared/hooks/useLinkHandler.ts:103`; ATS `app.config.js:134-149`; cleartext solo nel manifest debug `android/app/src/debug/AndroidManifest.xml:6`, assente nel main (cartella locale generata, non tracciata). HSTS del dominio pubblico: rete vietata qui. | `curl -I` su `http://` e `https://` delle pagine; manifest finale sull'AAB. |

## V13 — Configurazione

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| V13.1 Segreti nel codice, storia e bundle | serve-prova-attiva | Repo: tracciato solo `.env.example`, con soli nomi; `.gitignore:16-18,34,46-50,81-83`. Pattern su file tracciati: solo fixture `sb_secret_fixt…` nei test. Storia `--all`: solo un JWT di test (payload `sub,iat`, senza `iss` né `role`) in file rimosso con `c76d685`. Sonda tarata sul positivo noto `sb_secret_`. Fatta con `git grep` e `git log -G`: gitleaks e trufflehog non installati. Bundle e AAB non scansionati. | Scan redatto su AAB finale; `gitleaks` se autorizzato; fixture `admin123`. Chiudere il file chiave service account sul PC: `rilascio.md:321-326`. |
| V13.2 Staging e debug | serve-prova-attiva | Produzione senza Flipper e con log `error`: `environment.ts:112-122`. Dettagli d'errore solo `__DEV__`: `src/shared/components/ErrorBoundary.tsx:131-148`. Dev-client escluso dai profili store: `plugins/escludi-dev-client.js:25-31`, sonda C11 `scripts/verifica-android-play/aab.mjs:46,120`. Staging: solo placeholder `environment.ts:106`. | C11 sull'AAB finale; errore sintetico in release. |
| V13.3 Credenziali predefinite dei servizi | passa-statico | Placeholder con fail-fast in release: `supabaseClient.ts:17-18`, `environment.ts:173-188`. Chiave di invio da file ignorato: `eas.json:90`, `.gitignore:83`. Nessuna credenziale di servizio nel repo. | Nessuno. |
| V13.4 File e directory esposti | serve-prova-attiva | Pagine su hosting USA (`rilascio.md:403-405`); nessun server nostro. App: nessun file servito. | Dopo la pubblicazione: `/.git/`, listing, `.env` sul dominio; a carico dell'hosting USA. |
| V13.5 DNS pendenti | serve-prova-attiva | Domini citati: `src/shared/hooks/useLinkHandler.ts:64-83`, `urls.ts:23-43`. DNS gestito dagli USA secondo la memoria di progetto (`sito-italia-infrastruttura-usa`), assunto e non verificato; rete vietata qui. | Elenco record di `riseagainsthunger.it` e `italy.`, confronto con i servizi posseduti. |

## V14 — Protezione dei dati

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| V14.1 Cache autenticata | N/A | Inventario: nessuna pagina autenticata dietro CDN. App senza persistenza del profilo (`accountActions.ts:181`, profilo solo in stato React). API raggiunte direttamente con Authorization. | Nessuno. |
| V14.2 SDK, font e terze parti | serve-prova-attiva | Host a runtime in src: Supabase da env, `u.expo.dev` (`app.config.js:12`), link esterni aperti nel browser; nessuna immagine remota (`uri:` = 0). Nessun analytics. Sentry acceso solo con DSN: `App.tsx:30-33`, spento al lancio `rilascio.md:193,318`, assente dall'informativa. Destinatari informativa: `privacy-policy.html:258-279`. MapTiler citato solo nei commenti `app.config.js:118,168`. | Cattura rete di una build release; confermare che il DSN non sia nell'AAB; confronto con informativa e Sicurezza dei dati. |

## V15 — Codifica sicura e architettura

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| V15.1 Dipendenze | serve-prova-attiva | `npm audit --omit=dev` oggi: 3 high, 24 moderate, 8 low, 0 critical, totale 35 voci (app. F). `rilascio.md:146-157` parla di 8 avvisi da tre pacchetti e dice che nulla entra nell'app: non copre `glob`, `minimatch`, `deepmerge`. Edge: versioni fissate in `supabase/functions/deno.lock:6,9`, fuori da `npm audit`. | Ripetere la sonda sulle source map di `expo export` con anche `glob`, `minimatch`, `deepmerge`; aggiornare `rilascio.md`. |
| V15.2 CI/CD | sospetto | Su `204afd5`: 6 YAML, 6 con `permissions:` (baseline 4, il commit le aggiunge a `cache-management.yml` e `legacy-guard.yml`). 41 `uses`: 4 fissate a SHA, 37 a tag (baseline 24/10: 44 a tag). `ota-deploy.yml` ora passa `--environment`. Nessun `pull_request_target`; `github.event.pull_request.title` solo in `env` (`optimized-ci-cd.yml:71`). | Fissare a SHA le 37 eccezioni o motivarle; esaminare i permessi job per job. |

## V16 — Log di sicurezza e gestione degli errori

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| V16.1 Log e dati sensibili | passa-statico | Produzione: niente console, buffer RAM, solo error e fatal: `src/shared/utils/logger.ts:30-34,93,115-116`. Report mail a campi ammessi: `src/shared/utils/buildProblemReport.ts:78-116`, test `src/__tests__/shared/utils/problemReport.test.ts:111-152`. Rete: solo famiglia dell'endpoint `src/shared/utils/fetchWithTimeout.ts:6-22`. URL con dati solo in `__DEV__`: `useLinkHandler.ts:185-190`. Edge: `purge-deletions/index.ts:151` logga l'id utente, funzione non schedulata. Sentry senza `beforeSend` (`App.tsx:31-38`): da rivedere prima di accenderlo. | Prova con password e token sintetici se si vuole l'evidenza dinamica. |
| V16.2 Audit degli eventi e dashboard | serve-prova-attiva | Nessun evento applicativo su azioni privilegiate: `delete-account/index.ts:95-101` non traccia il successo. Si conta sui log Auth di Supabase. Errori pubblici a codice senza stack: `delete-account/index.ts:74-101`, `ErrorBoundary.tsx:137-140`. | Login negato e cancellazione su locale: evento correlabile? Durata log sul piano reale. |

## Affidabilità e costi

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| A.1 Timeout, retry e backoff | passa-statico | Timeout 15 s su ogni richiesta: `fetchWithTimeout.ts:3,49-56`, agganciato a `supabaseClient.ts:30`. Link: 10 s e un tentativo, `useLinkHandler.ts:54-55`, `src/shared/utils/result.ts:317`. OTA: tetto 30 s, `App.tsx:25`. Alert: 10 s, `purge-deletions/index.ts:59`. Le chiamate admin edge non hanno timeout proprio, vale il limite di piattaforma (`delete-account/index.ts:87,95`). | Facoltativo: servizio lento simulato. |
| A.2 Circuit breaker | N/A | `git grep circuit`: 0. Nessun ciclo automatico verso dipendenze remote, oltre al refresh del token gestito dalla libreria. Unico ciclo server: `purge-deletions/index.ts:148-154`, non schedulato. | Rivedere se si accende il purge. |
| A.3 Dead letter queue | N/A | Nessuna coda: `pgmq`, `dead letter`, `cron.schedule` = 0; pg_cron assente (`deletionPolicy.ts:21-23`). I fallimenti del purge vanno in alert (`purge-deletions/index.ts:157-159`). `partner_ref_tombstones` è lavorazione manuale (`rilascio.md:364-371`). | Nessuno. |
| A.4 Backup e restore | sospetto | Piano free: nessun backup automatico, `rilascio.md:376-378`, lettura del 28/10. Backup manuale previsto solo prima della 0022: `rilascio.md:331-332`. Nessun ripristino di prova documentato. | Decidere Pro o backup programmato; banco B-backup: restore isolato confrontato con dati attesi. |
| A.5 Uptime, errori e tracing | sospetto | Sentry spento al lancio: `rilascio.md:193,318`. Unico segnale Android vitals (`rilascio.md:187-193`). Nessun controllo di uptime nel repo. Il progetto free va in pausa dopo una settimana senza uso: `rilascio.md:377-378`. | Banco B-osservabilità: interruzione sintetica rilevata; decisione su Sentry UE e informativa. |
| A.6 Tetti AI/API e spesa | N/A | Nessuna chiamata a pagamento dal server su azione utente: nessun LLM (L.1), nessuna API di terzi nelle funzioni. Unico costo per evento: email di Auth, limitata dalle soglie di V4.3. | Rivedere con Resend e con Pro: tetto di spesa. |
| A.7 Query, indici e paginazione | serve-prova-attiva | Letture per chiave: `AuthContext.tsx:193-197`. Indici `0003:41-42`, `0004:75-77`, `0006:24-25`, `0008:30-37`, `0012:204-205`, `0017:104-106`, `0022:15-17,84`. Illimitata per utente: `AuthContext.tsx:426-430`. Purge senza paginazione: `purge-deletions/index.ts:128-132`. `get_advisors` performance non eseguito. | `get_advisors` performance; misura con volume reale (1.352 righe storiche attese). |
| A.8 Caricamento, vuoto ed errore | serve-prova-attiva | Rilievi corretti: C64, C65, C67, C69, C70, C75. Resta: `isExiting` non ha consumatori nei componenti (`git grep` nei `.tsx`: 0), `usePartnerExit.ts:62-68` lo ammette, quindi attesa non mostrata durante la preparazione dell'uscita verso i partner. | Dispositivo: rete lenta, vuoto, interrotta sulle uscite partner e sui moduli. |

## Applicazioni con LLM

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| L.1 Prompt injection e permessi degli strumenti | N/A | `git grep` di `anthropic`, `openai`, `gemini`, `gpt-N`, `claude-`, `langchain`, `huggingface` in src, supabase, App, config, package.json: un solo falso positivo in `src/shared/data/comuni-min.json`. `scripts/ai-translate.ts` (`package.json:69-70`) è uno strumento di sviluppo per le traduzioni: sta fuori da src, nessun modulo dell'app lo importa. | Nessuno. |
| L.2 Avviso AI | N/A | Nessuna chat AI, stesso inventario di L.1. | Nessuno. |
| L.3 Ramo di crisi | N/A | Nessuna chat, stesso inventario di L.1. | Nessuno. |

## Sito pubblico

Le pagine sono quattro file di contenuto: `privacy-policy.html`, `privacy-policy-en.html`, `docs/store/google-play/web/elimina-account.html`, `delete-account.html`.
Il sito è il «site 10» della rete USA (`rilascio.md:416`): robots, sitemap, 404 e tema non sono nel repo. Inventario in app. G.

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| S.1 Robots, sitemap, canonical, title/description e Open Graph | N/A | Non abbiamo sito nostro; pagine legali da incollare nel sito USA. `title` c'è (`elimina-account.html:6`), description, canonical e og assenti su 4 pagine. | Nessuno lato repo. |
| S.2 404 | N/A | Nessun routing nostro. | Nessuno. |
| S.3 HTML senza JavaScript | passa-statico | `<script>` = 0, H1 presente su 4 pagine: `elimina-account.html:36`, app. G. | Nessuno. |
| S.4 Dati strutturati | N/A | JSON-LD = 0 su 4 pagine; pagine legali, nessun dato da dichiarare. | Nessuno. |
| S.5 Crawler AI e llms.txt | N/A | Né robots né llms.txt nel repo; nessuna decisione scritta del titolare trovata; il dominio è gestito dagli USA. | Se serve, la decisione spetta alla sede USA. |
| S.6 Source map | passa-statico | `sourceMappingURL` = 0 su 4 pagine, nessun JS. Upload source map del bundle verso Sentry solo con plugin attivo: `app.config.js:256-266`. | Nessuno. |
| S.7 Favicon | serve-prova-attiva | `rel="icon"` = 0 su 4 pagine: dipende da come vengono pubblicate (`rilascio.md:418-420`). | Controllo sugli URL pubblicati. |
| S.8 Moduli | N/A | `<form>` = 0 su 4 pagine. | Nessuno. |
| S.9 Mobile e CTA | serve-prova-attiva | Viewport e `max-width: 800px`: `elimina-account.html:5,13`. Nessuna CTA. | Foto a 320, 390, 768, 1440 px delle pagine pubblicate. |
| S.10 Accessibilità | sospetto | `.last-updated` `#7f8c8d` su bianco = 3,48:1, sotto 4,5:1 per testo normale: `elimina-account.html:26`, `delete-account.html:26`, `privacy-policy.html:26`, `privacy-policy-en.html:26`. App: rilievi C64-C66, C81, C93, C94 corretti, resta la prova sul nativo. | Scurire quel colore; passata TalkBack e tastiera sulla build. |
| S.11 Skip link | N/A | Nessuna navigazione ripetuta: `<nav>` = 0, solo il link di lingua. | Se finiscono nel tema WordPress, lo decide il tema. |
| S.12 Stampa, dove utile | N/A | Nessuna ricetta o documento da stampare, nessun controllo sovrapposto. | Nessuno. |
| S.13 Immagini e velocità | N/A | `<img>` = 0 su 4 pagine, nessun bundle. | Nessuno. |
| S.14 Link, navigazione e contatti | sospetto | Link relativi `delete-account.html`, `privacy-policy.html#segnalazione-problemi`, `privacy-policy.html`: `elimina-account.html:35,121,140`; gemelli `delete-account.html:35,118,137` verso `privacy-policy-en.html`. Le pagine sono chieste a `/elimina-account/` e `/delete-account/`, l'informativa a `/privacy-policy/`, e l'inglese non è fra gli allegati: `rilascio.md:418-420`. Da quei percorsi i link relativi portano a pagine inesistenti. | Link assoluti nelle due pagine; pubblicare o togliere l'informativa inglese; prova sugli URL finali. |
| S.15 Segnaposto | sospetto | Marcatori `da-validare` e «BOZZA INTERNA» nelle due informative: `privacy-policy.html:56-60,192-202,238,260,280,291,327,341,352,368`, `privacy-policy.html:504` «PEC da inserire»; gemelli in `privacy-policy-en.html:56-60`. Il gate lo blocca: `rilascio.md:103-111`. | Chiudere con la consulente e Alberto prima della pubblicazione. |
| S.16 Copyright | N/A | Nessun footer né `©` nelle 4 pagine (`grep`). | Nessuno. |
| S.17 Cookie e statistiche | serve-prova-attiva | App senza analytics (V14.2). Pagine senza script. Il wrapper WordPress può aggiungerne: non è nel repo. | Rete e cookie sugli URL pubblicati, confronto con informativa e Sicurezza dei dati. |

## Contenuti, diritti e pubblicazione

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| C.1 Testimonianze e claim | serve-prova-attiva | `git grep` di `testimon`, `recension` in src e `scheda.md`: 0. Numeri con fonte e pagina dichiarate: `src/features/impact/data/impactData.ts:3-11`. `rilascio.md:313` li dà ancora da fornire: da riconciliare. | Confronto riga per riga con il PDF dell'Annual Report 2025. Validazione legale separata. |
| C.2 Termini d'uso | sospetto | `git grep -i` di `termini`, `terms of` in src: nessun documento né link; il consenso rimanda solo all'informativa (`src/features/auth/screens/SignUpScreen.tsx:202`). L'app ha account. | Decidere se servono termini d'uso e dove; validazione legale. |
| C.3 Informativa privacy | sospetto | Bozza non validata né pubblicata: `privacy-policy.html:56-60`, `rilascio.md:90-111`. Versione del consenso ferma: `src/shared/auth/consent.ts:9` e `0003:46` dicono `privacy-2026-06-15`, l'informativa dice 28 ottobre 2026 (`privacy-policy.html:54`), nessun'altra riga in `policy_versions`, `body` nullo (`0003:46`, `docs/integrazioni/letsdonation-donorbox-identita.md:85`). `docs/standards/legal-compliance.md:204` chiede che coincidano. Il registro dei consensi direbbe una versione diversa dal testo mostrato. | Prima del lancio: nuova versione con testo archiviato, costante allineata. Registro GDPR in `todos/gdpr.md`, non duplicato qui. |
| C.4 Licenze, copyright e marchi | sospetto | Lockfile non dev: 827 pacchetti, 655 MIT, 60 ISC, 12 MPL-2.0, 12 Apache-2.0; licenza assente per `qrcode-terminal` e `requireg`; `node-forge` duale. Nessun avviso di terze parti in app: `git grep -i` di `licenz`, `open.?source`, `third.?party` in src = 0. Nessun LICENSE nel repo. Asset: nessun font proprio, provenienza icone non documentata. | Generare avvisi di terze parti; decidere dove mostrarli; verificare se i due senza licenza entrano nel bundle; validazione legale. |
| C.5 Prezzi, rinnovi, rimborso e cancellazione | N/A | Nessun acquisto o abbonamento in app (V2.2). Pagine esterne: `play-console-risposte.md:200-205`. | Nessuno. |
| C.6 Store | sospetto | Scheda: «I risultati del 2024», `docs/store/google-play/scheda.md:34,70`. App: `resultsYear: 2025`, `src/features/impact/data/impactData.ts:11`, usato in `src/features/impact/components/AnnualResultsSection.tsx:24`; `results2024` resta solo come chiave inutilizzata in `src/locales/it.ts:415`. Gate § 8 non chiuso: `rilascio.md:90-112`, URL di cancellazione ancora da avere (`play-console-risposte.md:100`), Pro e 0021-0022 aperti (`rilascio.md:329-330,376-383`). | Allineare la scheda; `verifica-android-play.mjs C15 C17 C19 C20`; gate § 8. |

## Audit

| Voce | Esito proposto | Evidenza | Da fare |
|---|---|---|---|
| Z.1 Ledger | serve-prova-attiva | Questo file: 80 voci riconciliate con la checklist per sezione. Manca il giudizio finale passa, non passa, N/A. | Il giudice chiude ogni riga. |
| Z.2 Verificatore | serve-prova-attiva | Nessun verificatore indipendente su questi candidati. | Riesame di ogni `sospetto` con soggetto, risorsa, confine ed effetto; gli incerti restano `needs_validation`. |
| Z.3 Schema | serve-prova-attiva | Nessun validatore: la skill contiene `SKILL.md` e sette file di riferimento, `schema` e `validatore` = 0 in `SKILL.md` e `report-template.md` (`grep -i`). | Fissare schema ledger e findings, un caso valido e uno rifiutato. |

## Appendice A — SECURITY DEFINER, una per una

Ultima definizione per nome, estratta da `scratchpad/inventario-sql.mjs` e poi riletta. `search_path` = `''` per tutte. «rev» = `revoke execute ... from public, anon, authenticated`.
«Prod» = presente così in produzione secondo `rilascio.md:330`.

| Funzione | Definizione | Tipo | Autorizzazione | Grant | Prod |
|---|---|---|---|---|---|
| `handle_new_user` | `0020:451` | trigger AFTER INSERT su `auth.users` (`0011:116-119`) | opera su `new.id`, versione informativa decisa dal server `0020:547-550`; metadata client letti per nome e poi puliti `0020:571` | rev `0020:583` | sì |
| `handle_profile_deletion` | `0008:97` | trigger BEFORE DELETE su `profiles` | solo `old.id` | rev `0008:114` | sì |
| `claim_legacy_contact` | `0019:555` | trigger BEFORE INSERT su `profiles` | chiave = email di `auth.users`, esige conferma `0019:572-588`; non strappa righe altrui `0019:596-597` | rev `0019:648` | sì |
| `claim_legacy_on_email_confirmed` | `0016:255` | trigger su transizione a confermata `0016:349-354` | chiave = `new.email` dopo conferma | rev `0016:341` | sì |
| `sync_contact_email_on_email_change` | `0022:87` | trigger AFTER UPDATE OF email `0016:551-552` | claim solo con vecchia email provata `0022:93,116` | rev `0022:174` | corpo 0019 |
| `purge_legacy_contact` | `0022:141` | trigger BEFORE DELETE su `profiles` | solo righe proprie o con email confermata `0022:146-153` | rev `0022:175` | corpo 0016 |
| `purge_legacy_on_user_delete` | `0022:158` | trigger su `auth.users` `0016:441-442` | solo `old.id` e email confermata `0022:164-167` | rev `0022:176` | corpo 0016 |
| `pulisci_metadata_anagrafici_di(uuid)` | `0020:188` | void, helper | parametro libero: la difesa è il revoke; chiamata solo da definer | rev `0020:250` | sì |
| `pulisci_metadata_anagrafici` | `0019:415` | trigger | `new.id` | rev `0019:428` | sì |
| `allinea_claim_da_profiles_di(uuid)` | `0021:40` | void, helper | parametro libero: la difesa è il revoke | rev `0021:100` | corpo 0020 |
| `allinea_claim_da_profiles` | `0020:370` | trigger | `new.id` | rev `0020:383` | sì |
| `allinea_claim_da_profiles_su_metadata` | `0020:407` | trigger | `new.id` | rev `0020:420` | sì |
| `timbra_evento_consenso` | `0022:19` | trigger BEFORE INSERT su `consent_events` | `new.user_id`, già vincolato dalla policy | rev `0022:59` | no |
| `allinea_marketing_da_evento` | `0022:32` | trigger AFTER INSERT | idem | rev `0022:60` | no |
| `proteggi_marketing_profilo` | `0022:48` | trigger BEFORE INSERT/UPDATE su `profiles` | `new.id`, già vincolato dalla policy | rev `0022:61` | no |
| `nickname_disponibile(text)` | `0018:52` | RPC SQL `stable` | **esposta per scelta**: solo booleano, `0018:59-64`; motivazione `0018:22-30`; nessun limite (V4.3) | `0018:79-80` a anon, authenticated | sì |

Non definer: `set_updated_at` (`0005:8`), `search_path=''` da `0006:11`.
Nessuna regola RLS legge metadata modificabili dall'utente: `auth.jwt()` = 0 nelle migration.

## Appendice B — RLS e grant

| Tabella | Dati | RLS | Policy | Grant espliciti |
|---|---|---|---|---|
| `profiles` | anagrafica | `0001:24` | `own_select`, `own_insert`, `own_update`, `own_delete` su `auth.uid() = id` (`0006:15-19`, con WITH CHECK su update) | nessuno, default del progetto |
| `consent_events` | consensi | `0003:26` | select e insert propri (`0006:20-21`); nessun update o delete | nessuno, default del progetto |
| `policy_versions` | nessun dato personale | `0003:25` | select per authenticated `0003:29-30` | nessuno |
| `partner_refs` | codice collegato all'utente | `0008:39` | select e insert propri `0008:60-66` | `revoke all` poi `select, insert` a authenticated `0008:53-54` |
| `partner_ref_tombstones` | ref senza identità | `0008:82` | nessuna | `revoke all` `0008:88` |
| `legacy_contacts` | anagrafiche storiche | `0012:217` | nessuna | `revoke all` `0012:218` |

Sequenza `consent_events_server_order_seq`: `revoke all` da public, anon, authenticated, `0022:13`. Nessuna view nelle migration.

## Appendice C — Edge function

| Voce | `delete-account` | `purge-deletions` |
|---|---|---|
| Input | nessun corpo letto `index.ts:90-93`; solo POST `:74` | nessun corpo; nessun filtro sul metodo |
| Autenticazione | `Authorization` → `auth.getUser` `:76-88`; `verify_jwt=false` `config.toml:10-11` | `x-cron-secret` vs `CRON_SECRET`, confronto su digest `:16-25,110-115`; `verify_jwt=false` `config.toml:16-17` |
| CORS | `*` `:13-17` | nessuno |
| Timeout | nessuno proprio | 10 s solo sull'alert `:59` |
| Segreti | `SUPABASE_SECRET_KEYS` da env `:33-52`, letta dopo il controllo dell'header | idem `:67-87`, letta dopo il segreto |
| Errori pubblici | codici `:74-101` | `forbidden`, codici `:114-143` |
| Log | messaggio d'errore `:97` | messaggio e id utente `:134,151`; JSON con id `:52` |
| Stato | da ripubblicare col commit della build, `rilascio.md:118-132` | non schedulata, `config.toml:13-15`, `deletionPolicy.ts:21-23` |

Test: `edge-functions-test.yml` su `supabase/functions/**` con deno fmt, lint, test.

## Appendice D — Deep link `rahitalia`

- Schema `app.config.js:38`; `<data android:scheme="rahitalia"/>` nel manifest locale `:33`. Nessun App Link verificato: uno schema custom è registrabile da altre app, la difesa è PKCE.
- Accettati solo `reset-password`, `confirm-email`, `confirm-email-change`: `authRedirect.ts:80-95`. Altri URL ignorati: `useAuthDeepLink.ts:72-73`.
- Solo il codice della query, mai dal fragment: `authRedirect.ts:69-73`. Token impliciti mai usati: `detectSessionInUrl: false`.
- Dopo il recupero si naviga a una rotta fissa, nessun parametro passa dall'URL: `useAuthDeepLink.ts:92-94`.
- Nessuna prop `linking` nella navigazione: `git grep linking=|LinkingOptions|prefixes:` = 0.
- Link esterni con allowlist solo fuori dal dev: `useLinkHandler.ts:62-110`.

## Appendice E — Variabili nel bundle (solo nomi)

`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (`rilascio.md:139` la vuole `sb_publishable_`), `EXPO_PUBLIC_API_BASE_URL`, `_DEV`, `_STAGING`,
`EXPO_PUBLIC_SENTRY_DSN` (`App.tsx:30`), `EXPO_PUBLIC_ENABLE_DISPLAY_ZOOM_NORMALIZATION`, `EXPO_PUBLIC_PERFECT_STRICT_MODE`, `EXPO_PUBLIC_MAX_FONT_SCALE`,
`EXPO_PUBLIC_FONT_SCALE_UNLOCK_THRESHOLD`, `EXPO_PUBLIC_DISPLAY_ZOOM_TEST_FACTOR`, `EXPO_PUBLIC_UPDATES_CODE_SIGNING_CERTIFICATE`.
Solo server: `SUPABASE_SECRET_KEYS`, `SUPABASE_URL`, `CRON_SECRET`, `PURGE_ALERT_WEBHOOK`. Solo build: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `EXPO_TOKEN`.
I valori non sono stati letti. Il bundle reale non è stato aperto.

## Appendice F — `npm audit --omit=dev --json`

Eseguito il 02/11 nel worktree, exit 1. Totale 35: critical 0, high 3, moderate 24, low 8. Dipendenze: 808 prod.

| Gravità | Pacchetto | Arriva da | Nota |
|---|---|---|---|
| high | `image-size` 1.2.1 | `metro` | build |
| high | `node-forge` 1.4.0 | `@expo/cli`, `@expo/code-signing-certificates` | build; nessuna versione corretta per `rilascio.md:154-155` |
| high | `postcss` 8.4.49 | `@expo/metro-config` | build |
| moderate | `glob`, `minimatch` | `@expo/cli`, `@expo/config*`, `@expo/fingerprint` | non citati in `rilascio.md:146-157` |
| low | `deepmerge` 4.x | catena Expo | intervallo `>=4.2.0`; la 3.3.0 di `react-native-paper` è fuori intervallo |

Tutte indirette. Le altre voci moderate e low (`expo`, `react-native`, `expo-updates`, `expo-constants`, ...) sono segnalate solo perché dipendono da queste.
`expo-dev-client` resta nelle `dependencies`, escluso a build time. Che i tre high non entrino nell'app lo dice `rilascio.md:150-151`, misura del 25/10 non rifatta qui.

## Appendice G — Inventari eseguiti

| Controllo | Comando | Risultato |
|---|---|---|
| Voci checklist | `grep -c '^- \[ \]' pre-lancio.md` | 80 |
| Pagine statiche, 4 file | `grep -ci` di `<script`, `<form`, `<img`, `<nav`, `ld+json`, `sourceMappingURL`, `rel="icon"`, `rel="canonical"`, `property="og:`, `name="description"` | tutti 0 su 4; `<title`, `<h1`, `<html lang` = 1 su 4 |
| Link esterni pagine | `grep -oE '(src\|href)="https?://…'` | 2 per ciascuna informativa, 0 per le pagine di cancellazione |
| Contrasto | calcolo WCAG in node | `#7f8c8d` 3,48; `#34495e` 9,29; `#2c3e50` 10,98; `#333` 12,63 |
| Workflow | `git show HEAD:<file>` e conteggio di `permissions:`, `uses:` | V15.2 |
| Segreti | `git ls-files`, `git grep -lE`, `git log --all -G` con pattern `sb_secret_`, JWT, `sk-ant-`, `AKIA`, `ghp_`, chiavi private | V13.1; output oscurato |
| Licenze | `package-lock.json`, voci non dev | C.4 |
| SQL | `scratchpad/inventario-sql.mjs` | app. A e B |

## Limiti di questa raccolta

- Nessun contatto con Supabase, EAS, Sentry, sito: lo stato di produzione citato è quello scritto in `rilascio.md` e nelle migration, con date, non riletto.
- Nessuna prova eseguita: nessun DB locale, dispositivo, browser, build.
- Scansione segreti con pattern propri, non con uno scanner dedicato. Bundle e AAB non aperti.
- `android/` è una cartella locale generata, non è l'AAB di produzione.
- Le voci `passa-statico` dicono che il codice letto lo garantisce, non che sia stato osservato dal vivo.
