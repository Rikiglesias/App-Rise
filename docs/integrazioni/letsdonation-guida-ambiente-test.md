# Login unico Rise — guida all'ambiente di test

Per il tecnico di Let's Donation. Descrive l'ambiente di **test**: un progetto separato dalla produzione, con
account di prova e nessun dato reale. Tutto quello che segue è stato provato da noi con un client di prova il
6 novembre 2026; dove una cosa non è stata provata, è scritto.

## Indirizzi

| Cosa | Indirizzo |
|---|---|
| Configurazione OIDC (discovery) | `https://khsojmjopyoadtbjnarw.supabase.co/auth/v1/.well-known/openid-configuration` |
| Issuer | `https://khsojmjopyoadtbjnarw.supabase.co/auth/v1` |
| Autorizzazione | `…/auth/v1/oauth/authorize` |
| Token | `…/auth/v1/oauth/token` |
| Informazioni utente (UserInfo) | `…/auth/v1/oauth/userinfo` |
| Chiavi pubbliche (JWKS) | `…/auth/v1/.well-known/jwks.json` |

Conviene leggere gli indirizzi dalla discovery, non scriverli a mano.

## Il giro

1. Authorization Code con PKCE (`code_challenge_method=S256`), `response_type=code`.
2. Scope: `openid email profile`. La discovery offre anche `offline_access` (refresh token): non l'abbiamo provato.
3. La persona accede (o si registra) sulla **nostra** pagina e approva. Al primo accesso vede la schermata di
   consenso; dalla volta dopo torna subito da voi.
4. Ritorno al vostro indirizzo con `code` e `state`. Il `code` vale **una volta sola**.
5. Scambio del codice allo sportello Token. Il vostro client sarà di tipo **riservato**: autenticazione
   `client_secret_basic` (credenziali in Basic auth), che è il valore predefinito.
6. `id_token` firmato **ES256**: verificate firma sulla JWKS (`kid` nell'intestazione), `iss`, `aud` = vostro
   `client_id`, `nonce`, `exp`.

Se la persona tocca «Non ora», tornate con `error=access_denied`.

## Cosa ricevete

| Dato | Dove | Note |
|---|---|---|
| `sub` | id_token, UserInfo | Identificativo fisso della persona. **Agganciate l'utente su questo**, non sull'email: l'email può cambiare |
| `email` | id_token, UserInfo | Email dell'account |
| `email_verified` | id_token, UserInfo | `true` per gli account di prova |
| `name` | id_token, UserInfo | Nome e cognome in una sola stringa. Se manca, il server mette l'email |
| `preferred_username` | id_token, UserInfo | Il nickname. **Assente** se la persona non l'ha scelto (account ld02) |
| `updated_at`, `auth_time` | id_token | Date in secondi Unix |
| `user_metadata` | solo UserInfo | Oggetto con i dati del profilo, tra cui `country` (codice paese, per esempio `IT`) |

I dati vi arrivano **a ogni accesso**: se la persona cambia nome o nickname da noi, li ricevete aggiornati al login
successivo. Non c'è un invio da parte nostra nel frattempo.

Nome e cognome separati, data di nascita e telefono **non** arrivano.

## Cose da sapere

- **Indirizzo di ritorno**: va registrato da noi **prima**, ed è confrontato carattere per carattere (niente
  caratteri jolly). Ci servono quelli esatti: ambiente locale e, più avanti, produzione.
- **Logout**: il server non offre un logout unico (`end_session_endpoint` non c'è). La sessione da voi la chiudete voi.
- **Rifare la prova del consenso**: su `https://rise-accesso-test.vercel.app/account` la persona vede i partner a cui
  ha dato il consenso e può ritirarlo; al login successivo la schermata ricompare. Lì c'è anche «Esci», per cambiare
  account di prova.
- **Server in beta**: il servizio di login di Supabase che usiamo è ancora in beta e può cambiare. L'ambiente di test
  serve anche a vederlo per tempo.
- **Email**: nel test la posta in uscita è limitata (poche mail all'ora). Le prove che mandano mail, come il cambio
  email, vanno fatte con calma e una alla volta.

## Account di prova

Caselle nostre, nomi inventati. Qui c'è solo la parte che distingue gli account (`+ld01` … `+ld10`): gli
indirizzi completi e le password ve li mandiamo a parte, insieme al `client_secret`, con un link che si apre una volta
sola.

| Account | Caso da provare |
|---|---|
| `+ld01` | Completo, email che da voi non esiste (primo accesso) |
| `+ld02` | Senza nickname: `preferred_username` non arriva |
| `+ld03` | Inseritelo voi nel vostro test come **già iscritto a Rise** (aggancio) |
| `+ld04` | Inseritelo voi nel vostro test come iscritto a **un'altra organizzazione** |
| `+ld05` | Cambio email |
| `+ld06` | Cambio di nome, cognome e nickname; poi nickname tolto |
| `+ld07` | Rifiuta il consenso («Non ora») |
| `+ld08` | Persona tra 14 e 17 anni (l'età non vi arriva) |
| `+ld09` | Cancellazione dell'account durante il test |
| `+ld10` | Paese estero (`country` = `CH` in `user_metadata`) |

## Cosa ci serve da voi

1. Gli indirizzi di ritorno esatti.
2. Quando parlate di «flag» del nickname, cosa intendete esattamente?
3. Vi serve il refresh token (`offline_access`)?
4. Avete limiti d'età, per esempio sulle gift card? L'età non è tra i dati che vi passiamo.
5. Quando pensate di fare le prove, così teniamo d'occhio i limiti di frequenza.
