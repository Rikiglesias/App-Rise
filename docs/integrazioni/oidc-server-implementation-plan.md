# OIDC «Login con RAH» — piano di implementazione lato nostro (RAH = OpenID Provider)

> Piano di build del server OIDC su Supabase, per far accedere gli utenti RAH a Let's
> Donation (LD) senza secondo login. **Non ancora eseguito**: l'accensione dell'OAuth
> server è un cambio all'auth di **produzione** su una feature **beta** → decisione di
> Riccardo (leva), da fare **dopo** la risposta del fornitore al brief.
> Fonti: analisi workflow 5-agenti + premortem (memoria `integrazione-identita-partner.md`),
> brief `letsdonation-brief-integrazione.md`, docs Supabase OAuth 2.1 Server.

## Precondizioni (gate — NON partire prima)

- [ ] **Fornitore**: LD conferma (a) client OIDC su Joomla (plugin), (b) matching sul `sub`
      non l'email, (c) — preferito — SSO-only per-tenant (domande 4-5 del brief).
- [ ] **Decisione rischio-beta**: Riccardo accetta l'auth di produzione su Supabase OAuth
      2.1 Server (beta dal 26/11/2025) — oppure attende la GA. È la leva.
- [ ] **Field-test claim propagation** (bloccante tecnico): verificare sul campo che i claim
      custom `rise_ref` e l'email risolta arrivino davvero nell'`id_token`/UserInfo che il
      client OIDC legge. La doc Supabase conferma il Custom Access Token Hook sull'ACCESS
      token, NON garantisce la propagazione nell'id_token → **testare prima di impegnarsi**.

## Passi lato nostro (in ordine)

1. **Abilitare l'OAuth 2.1 / OpenID Provider su Supabase** (dashboard/config del progetto).
   Reversibile: si disabilita. → è questo lo step-leva (auth di produzione).
2. **Registrare il client LD**: `client_id` + `client_secret` dedicati, redirect URI che LD
   ci indica, scope/claim concessi. Il secret è un segreto → env/secret-manager, mai in
   repo/chat.
3. **Custom claims** via Custom Access Token Hook (o equivalente):
   - `sub` = UUID utente Supabase (stabile — già così).
   - **`email` = email RISOLTA**, NON il campo `contact_email` grezzo (vedi Correzione #1).
   - `rise_ref` = ref opaco per-utente (dal servizio `getOrCreatePartnerRef`).
   - `nome`, `cognome` dai claim profilo.
4. **Consent screen**: Supabase non la ospita → va costruita e mantenuta da noi (pagina web
   che elenca client + scope, l'utente approva). Superficie di sviluppo + sicurezza.
5. **Discovery + scope**: esporre `…/.well-known/openid-configuration`; documentare gli
   scope/claim disponibili per LD.
6. **Consegnare a LD** i parametri (discovery URL, client_id/secret, scope) e fare un giro
   di test end-to-end (login → JIT provisioning sul loro MySQL → aggancio sul `sub`).

## Correzioni ferree (dal premortem avversariale — NON dimenticarle)

- **#1 Email condizionale**: l'email-claim = `resolvePrefillEmail(contact_email ?? auth.email)`
  escludendo l'alias Apple relay (`src/shared/partner/partnerEmail.ts:41-48`). Il campo
  `contact_email` è NULL per la maggioranza (raccolto solo per gli Apple-relay,
  `validation.ts:143`). Mandare solo `contact_email` → email nulla per i non-relay → JIT
  rotto su LD (HikaShop richiede l'email).
- **#2 Doppio account native-first**: il matching sul `sub` NON deduplica contro un account
  nativo pre-esistente su LD (che non ha `sub`; l'email è inaffidabile per gli alias Apple).
  → mitigazione strutturale = SSO-only per-tenant (togliere il signup nativo, domanda 5 del
  brief). Se LD non può, il duplicato è un residuo da dichiarare.
- **#3 Consent screen a nostro carico**: non è plug-and-play (passo 4).
- **#4 Hedge migrazione IdP**: valutare un identificatore utente RAH STABILE come claim
  custom oltre al `sub` Supabase, così un domani cambiare IdP non rompe i link LD↔RAH.

## Rollback / reversibilità

- **Server OAuth**: disabilitabile dalla config Supabase → i client smettono di autenticare
  (LD ricade sul suo login nativo se non è stato tolto). Reversibile.
- **Client LD**: revocabile (elimina `client_id`/ruota il secret) → blocca solo LD.
- **SSO-only per-tenant**: se attivato lato LD e va male, LD riattiva il signup nativo. La
  reversibilità di questo pezzo è **lato loro**, non nostra → da concordare nel DSA.
- **Punto di non ritorno**: nessuno lato nostro (tutto reversibile). Lato LD, gli account già
  provisionati via JIT restano nel loro DB (normale, sono loro utenti).

## Rischi dichiarati

- **Beta** (medio-alto): possibili breaking change su endpoint/hook/config, nessuno SLA,
  prezzo post-GA ignoto. Login di produzione di una onlus su feature beta = rischio da
  accettare esplicitamente.
- **Accoppiamento di disponibilità** (se SSO-only-UNICO): provider giù → nessuno registra/
  fa checkout sul contesto RAH di LD. → tenere «Login con RAH» **primario** ma non
  strettamente unico finché beta, oppure prevedere un fallback.
- **Dipendenza dal fornitore**: tutto il percorso è gated sul fatto che LD costruisca e
  configuri il client OIDC (sul `sub`, per-tenant).

## GDPR

- Due titolari autonomi + Data Sharing Agreement (non Art.26, non Art.28). Liceità = il
  click dell'utente. Claim minimi (sub, nome, cognome, email risolta, rise_ref). Nessuna
  pre-creazione bulk. Informativa RAH aggiornata (dipende dal criterio 1 del goal
  partner-identita). Vedi memoria `gdpr-compliance`.
