# Rise Against Hunger Italia — Brief di integrazione per Let's Donation

> Documento da condividere con Let's Donation S.r.l. (referente tecnico: Fabrizio Palai).
> Obiettivo: collegare gli utenti dell'app Rise Against Hunger Italia alla piattaforma
> Let's Donation **senza costringerli a una seconda registrazione**, e riconoscere che
> un ordine/donazione arriva da un nostro utente. Nessun accesso reciproco ai database.

---

## 1. Contesto in due righe

Abbiamo un'app (iOS/Android) con account propri dei donatori (autenticazione gestita
da noi). Quando dall'app mandiamo l'utente sul vostro shop / gift card / eventi / progetti,
oggi lui **si registra una seconda volta** e noi **non sappiamo** che quell'ordine è suo.
Vorremmo chiudere questi due buchi. Sono due integrazioni indipendenti: si possono fare
in ordine, la prima è leggera.

---

## 2. Richiesta A — Attribuzione dell'ordine (leggera, probabilmente zero sviluppo)

Quando apriamo un vostro link, vi passiamo in query string dei parametri UTM standard:

```
https://letsdonation.com/…?utm_source=rah-app&utm_campaign=<codice-opaco-per-utente>
```

- `utm_campaign` = un **codice opaco per-utente** generato da noi (`rise_ref`). Non è un
  login e non contiene dati personali leggibili: serve solo a ricondurre a posteriori
  l'ordine al nostro utente.
- Le vostre landing sono **pagine-categoria** (lo shop, gli eventi…), a 2-3 click dal
  checkout: quindi non basta "salvare il parametro sull'ordine". Serve che li
  **catturiate all'atterraggio (in sessione)** e li **stampiate sull'ordine**, poi
  disponibili in **export** e/o **webhook**.

**Le 3 domande che ci sbloccano:**
1. Il campo sorgente/campagna sull'**ordine** è valorizzabile da URL (UTM) e appare
   nell'**export**?
2. Esiste (o si può attivare) un **webhook "ordine completato"** che includa quel campo?
3. In alternativa, un **campo sorgente custom** sull'ordine va bene? (NON chiediamo
   colonne nuove sull'anagrafica: sappiamo che è una tabella condivisa fra i tenant.)

---

## 3. Richiesta B — "Login con RAH" (OpenID Connect)

L'utente arriva su Let's Donation e fa login **con il suo account RAH**, one-tap, senza
creare un secondo account. Funziona come un "Accedi con Google", ma l'identity provider
siamo noi.

- **Noi** = OpenID Provider (OIDC). La nostra piattaforma auth (Supabase) espone un
  server OAuth 2.1 / OpenID Connect standard: `authorization code` + **PKCE**, ID token,
  endpoint UserInfo, documento di discovery.
- **Voi** = client OIDC sul vostro Joomla (esistono plugin OIDC maturi, es.
  miniOrange / OpenID Connect per Joomla). Aggiungete un pulsante "Login con RAH".
- **Matching identità**: **mai sull'email**. Alcuni nostri utenti usano "Nascondi la mia
  email" di Apple → l'email è un alias diverso per ogni servizio. L'identità stabile è il
  **`sub`** (identificativo opaco) dell'ID token: è quella la chiave di aggancio.
- **La nostra preferenza: «Login con RAH» come percorso primario di accesso sul nostro
  spazio.** Se un utente si registrasse prima col vostro form nativo e **poi** con "Login
  con RAH", si creerebbero **due account non collegabili in modo affidabile**: il matching
  è sul `sub`, che l'account nativo non ha, e l'email non è una chiave affidabile (alias
  Apple). Rendere il nostro login l'ingresso principale sul nostro tenant elimina il
  problema alla radice e fa di RAH la fonte unica dell'identità.

**Dati (claim) che vi trasmettiamo al login**, solo quelli standard OIDC necessari:
`sub` (id opaco stabile — la chiave di aggancio), `name` (nome e cognome, quando disponibile) ed `email`.
Niente di più. Il `rise_ref` **non** viaggia sul login: è il codice di attribuzione della
Richiesta A (query string UTM sull'ordine), un canale separato.

> Nota sull'email: per gli utenti che usano "Nascondi la mia email" di Apple l'`email` è un
> alias `@privaterelay.appleid.com` che **inoltra** al loro indirizzo reale (la posta arriva
> comunque). È lo standard OIDC: vi passiamo l'email dell'account così com'è.

**Cosa vi forniremo per configurare il client** (quando entrambe le parti sono pronte):
- Discovery URL (`…/.well-known/openid-configuration`)
- `client_id` + `client_secret` dedicati a voi
- Redirect URI da whitelistare (ce le indicate voi)
- Scope/claim disponibili

**Cosa ci serve sapere da voi:**
1. Il vostro Joomla può fare da **client OIDC**? Con quale plugin/versione?
2. Riuscite ad aggiungere un pulsante "Login con RAH" nel flusso di registrazione/checkout?
3. Quali **redirect URI** dobbiamo autorizzare?
4. Il plugin può usare il **`sub`** come chiave di identità (creazione al primo accesso
   via JIT provisioning, aggancio sul `sub` agli accessi successivi), **non l'email**?
5. Sul **nostro spazio (tenant)**, «Login con RAH» può diventare l'**unico** metodo di
   registrazione/accesso — cioè disabilitare la registrazione/login nativi **solo per i
   nostri utenti/le nostre campagne**, senza toccare gli altri enti? Se **non** è
   configurabile per-tenant, ditecelo: teniamo il login nativo e ci regoliamo di conseguenza.

---

## 4. Inquadramento privacy (GDPR)

- Siamo **due titolari autonomi**: ciascuno resta titolare dei propri trattamenti. **Non**
  contitolarità (Art. 26) e **non** responsabile del trattamento (Art. 28).
- La liceità della trasmissione poggia sul **click dell'utente**: è lui che avvia il login /
  l'apertura del link. Trasparenza dichiarata nella nostra informativa.
- Serve un **accordo di condivisione dati** (Data Sharing Agreement) fra le due società,
  che circoscriva quali dati passano, per quale finalità, per quanto tempo.
- Nessuna pre-creazione massiva di account "per conto" dei nostri utenti.

---

## 5. Ordine consigliato

1. **Richiesta A** (attribuzione): è quasi certamente configurazione, si può fare subito e
   vale anche da sola.
2. **Richiesta B** ("Login con RAH"): la avviamo in parallelo: voi verificate il client
   OIDC lato Joomla, noi prepariamo il server e le credenziali; poi ci scambiamo i
   parametri tecnici e un giro di test.

Argomento a vostro favore: la piattaforma è multi-tenant (>1.000 enti). Sia l'attribuzione
sia il "Login con [ente]" li costruite **una volta** e valgono per tutti.
