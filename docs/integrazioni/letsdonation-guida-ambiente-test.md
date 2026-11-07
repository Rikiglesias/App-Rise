# Login unico Rise — guida all'ambiente di test

Per il tecnico di Let's Donation. Descrive l'ambiente di **test**: un progetto separato dalla produzione, con
account di prova (nomi inventati, caselle email nostre di prova) e nessun dato di donatori. Tutto quello che segue
è stato provato da noi il 6 e il 7 novembre 2026 con client di prova pubblici e riservati; dove una cosa non è
stata provata, è scritto.

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

1. Authorization Code con PKCE (`code_challenge_method=S256`), `response_type=code`. **PKCE è obbligatorio** anche per
   il client riservato: senza, il server rifiuta subito con «PKCE flow requires both code_challenge and
   code_challenge_method». Molte librerie lato server lo tengono spento di default: va acceso.
2. Scope: `openid email profile`. Non serve chiedere `offline_access`: il refresh token arriva comunque.
3. La persona accede (o si registra) sulla **nostra** pagina e approva. Al primo accesso vede la schermata di
   consenso; dalla volta dopo, se ha ancora la sessione Rise aperta, torna subito da voi, altrimenti prima accede.
4. Ritorno al vostro indirizzo con `code` e `state`: controllate che `state` sia quello che avete mandato. Il
   `code` vale **una volta sola**.
5. Scambio del codice all'endpoint token, insieme al `code_verifier` del PKCE; il `client_secret` resta sul vostro
   server. Il vostro client sarà di tipo **riservato**: autenticazione
   `client_secret_basic` (credenziali in Basic auth), che è il valore predefinito. Il metodo deve essere quello
   registrato: senza credenziali il server risponde «client is registered for 'client_secret_basic' but 'none' was
   used». Se la vostra libreria manda le credenziali nel corpo (`client_secret_post`), ditecelo prima: si può
   registrare il client così (previsto dalla documentazione di Supabase, non provato da noi).
6. `id_token` firmato **ES256**: verificate firma sulla JWKS (`kid` nell'intestazione), `iss`, `aud` = vostro
   `client_id`, `nonce`, `exp`.

Se la persona tocca «Non ora», tornate con `error=access_denied`.

## Cosa ricevete

| Dato | Dove | Note |
|---|---|---|
| `sub` | id_token, UserInfo | Identificativo fisso della persona. **Agganciate l'utente su questo**, non sull'email: l'email può cambiare |
| `email` | id_token, UserInfo | Email dell'account |
| `email_verified` | id_token, UserInfo | `true` per gli account di prova |
| `name` | id_token, UserInfo | Nome e cognome in una sola stringa. Se manca, il server mette l'email: se al posto del nome vedete un indirizzo, ditecelo e non mostratelo come nome |
| `preferred_username` | id_token, UserInfo | Il nickname. **Assente** se la persona non l'ha scelto (account ld02) |
| `updated_at`, `auth_time` | id_token | Date in secondi Unix |
| `user_metadata` | solo UserInfo | Oggetto con queste chiavi: `country` (codice paese, per esempio `IT`), `name`, `preferred_username`, `sub`, `email`, `email_verified`, `phone_verified`. La chiave `email` **resta quella della registrazione** dopo un cambio email: per l'email usate sempre il campo `email` di primo livello. Se usare `country` al posto del paese che avete già, lo concordiamo |

I dati vi arrivano **a ogni accesso**: se la persona cambia nome, nickname o email da noi, li ricevete aggiornati al
login successivo, sempre con lo stesso `sub`. Non c'è un invio da parte nostra nel frattempo. Senza aspettare un nuovo login potete usare il refresh
token: il rinnovo dà un nuovo access token (non un nuovo `id_token`) e con quello UserInfo restituisce i dati
aggiornati. Il refresh token cambia a ogni rinnovo: conservate sempre l'ultimo.

`email_verified` è sempre `true`: in produzione senza conferma dell'email da noi non si entra. **Nel test la
conferma è spenta** (vedi «Email» qui sotto), quindi qui `true` non dimostra che la casella sia stata verificata.
`phone_verified` è sempre `false`: il telefono non lo raccogliamo.

Nome e cognome separati, data di nascita e telefono **non** arrivano.

## Cose da sapere

- **Indirizzo di ritorno**: va registrato da noi **prima**, ed è confrontato carattere per carattere (niente
  caratteri jolly). Ci servono quelli esatti: ambiente locale e, più avanti, collaudo.
- **Errori dell'endpoint token**: non sono nel formato standard OAuth. Arrivano con HTTP `400` anche per credenziali
  sbagliate, con i campi `error_code` (per esempio `invalid_credentials`) e `msg` (per esempio «invalid client
  credentials») al posto di `error` ed `error_description`: se la vostra libreria legge solo questi ultimi, aggiungete
  i primi.
- **Logout**: il server non offre un logout unico (`end_session_endpoint` non c'è). La sessione da voi la chiudete voi.
- **Rifare la prova del consenso**: su `https://rise-accesso-test.vercel.app/account` la persona vede i partner a cui
  ha dato il consenso e può ritirarlo; al login successivo la schermata ricompare. Lì c'è anche «Esci», per cambiare
  account di prova.
- **Server in beta**: il servizio di login di Supabase che usiamo è ancora in beta e può cambiare. L'ambiente di test
  serve anche a vederlo per tempo.
- **Email**: nel test non parte nessuna mail: la registrazione non chiede conferma e il cambio email è immediato.

## Simulare i cambi

Su `https://rise-accesso-test.vercel.app/account`, entrando con un account di prova, la persona cambia i **suoi** dati
come farà nell'app. Poi rifate il login dal vostro sito e guardate cosa arriva.

- **I miei dati**: nome, cognome, nickname. Il nickname vuoto lo toglie: `preferred_username` non arriva più. Il
  nickname è unico senza distinguere maiuscole e minuscole: se è già di un altro account il cambio è rifiutato.
- **Email dell'account**: nel test il cambio vale subito, senza verificare la nuova casella; nell'app vale solo dopo la
  conferma dal link che la persona riceve per email. Un'email già usata da un altro account è rifiutata. Dopo il cambio si entra con l'email nuova e la
  stessa password.
- **Elimina l'account**: l'account sparisce subito, con profilo e consensi; da quel momento il login con quell'email
  non riesce. Da parte nostra non vi arriva nessun avviso. Cosa succede ai vostri token già emessi (rinnovo, UserInfo)
  non l'abbiamo ancora provato: è il caso dell'account `+ld09`. Se vi serve di nuovo, lo ricreiamo noi. Non è l'oblio
  presso di voi: la cancellazione dei dati da voi passa dalla vostra API, che resta il passo successivo come detto
  nella call.
- **Riporta ai valori di partenza**: per rifare le prove da capo senza chiederci niente. Rimette nome, cognome,
  nickname, paese ed email dell'account di prova come erano all'inizio, ritira tutti i consensi e chiude
  tutte le sessioni, comprese quelle aperte dal partner: dopo, il refresh token del partner non vale più (provato
  col client pubblico di prova: `refresh_token_not_found`). Non vale per un account eliminato.

## Account di prova

Caselle nostre, nomi inventati. Qui c'è solo la parte che distingue gli account (`+ld01` … `+ld10`): gli
indirizzi completi e le password ve li mandiamo a parte, con un link che si apre una volta sola, così potete provare
subito col client pubblico; il `client_secret` del vostro client arriva allo stesso modo, quando lo registriamo.

| Account | Caso da provare |
|---|---|
| `+ld01` | Completo; email da non inserire nel vostro test (primo accesso) |
| `+ld02` | Senza nickname: `preferred_username` non arriva |
| `+ld03` | Create voi, nel vostro test, una scheda con questa email **nello spazio Rise** (aggancio) |
| `+ld04` | Create voi, nel vostro test, una scheda con questa email **in un'altra organizzazione** |
| `+ld05` | Cambio email (da `/account`) |
| `+ld06` | Cambio di nome, cognome e nickname; poi nickname tolto (da `/account`) |
| `+ld07` | Rifiuta il consenso («Non ora») |
| `+ld08` | Di riserva, per un caso in più che vi serva |
| `+ld09` | Cancellazione dell'account durante il test (da `/account`) |
| `+ld10` | Paese estero (`country` = `CH` in `user_metadata`) |

## Provare subito, senza il vostro client

Mentre registriamo il vostro client potete già fare il giro con un client **pubblico** di prova (PKCE, nessun
segreto), che accetta come ritorno solo gli indirizzi di due strumenti standard.

| Cosa | Valore |
| --- | --- |
| `client_id` | `ed9d2123-4d59-491b-88cd-b7ae9b93dbb0` |
| Ritorni registrati | `https://oidcdebugger.com/debug`, `https://oauth.pstmn.io/v1/callback`, `https://oauth.pstmn.io/v1/browser-callback` |

- **OIDC Debugger** (`https://oidcdebugger.com`): Authorize URI = l'indirizzo di autorizzazione qui sopra; Redirect
  URI lasciato `https://oidcdebugger.com/debug`; Client ID qui sopra; Scope `openid email profile`; Response type
  `code`; «Use PKCE?» con SHA-256 e Token URI = l'endpoint token; Response mode `query`. Dopo accesso e consenso lo
  strumento scambia il codice nel browser e mostra `id_token`, access token e refresh token. Provato da noi il 7/11.
- **Postman**: OAuth 2.0, Grant type «Authorization Code (With PKCE)», Callback URL
  `https://oauth.pstmn.io/v1/callback` (o `…/browser-callback` con «Authorize using browser»), Auth URL e Access
  Token URL qui sopra, Client ID qui sopra, Client Secret vuoto, Code Challenge Method SHA-256, Scope
  `openid email profile`, Client Authentication «Send client credentials in body». Abbiamo provato che il server
  accetta il ritorno di Postman e che lo scambio del codice con PKCE riesce; Postman stesso non l'abbiamo usato.
- Il consenso a questo client compare su `/account` col nome «Strumenti di prova (OIDC Debugger, Postman)».
- È un client di sola prova, solo in questo ambiente: il vostro sarà riservato (vedi «Il giro»), e in produzione non
  ci sono ritorni verso siti di terzi.

## Cosa ci serve da voi

1. Gli indirizzi di ritorno esatti del vostro ambiente locale e, quando ci sarà, del vostro collaudo. Per la
   produzione il client sarà un altro, con credenziali sue, come scritto nel documento di luglio.
2. Come la vostra libreria si autentica all'endpoint token: `client_secret_basic` (credenziali in Basic auth, quello
   che abbiamo provato) o `client_secret_post` (nel corpo della richiesta: previsto dalla documentazione, lo
   proviamo prima di confermarvelo). Registriamo il client di conseguenza.
