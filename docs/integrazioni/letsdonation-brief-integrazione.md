# Rise Against Hunger Italia — Brief di integrazione per Let's Donation

> Documento da condividere con Let's Donation S.r.l. — consegnato a **Michele Placucci**, che lo
> gira al team tecnico (referente tecnico: Fabrizio Palai).
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
  login ed è uno **pseudonimo** (dato personale pseudonimizzato, cons. 26 GDPR), non un
  identificativo diretto leggibile: serve solo a ricondurre a posteriori l'ordine al nostro utente.
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

- **Noi** = OpenID Provider (OIDC). La nostra piattaforma auth (Supabase) **esporrà** un
  server OAuth 2.1 / OpenID Connect standard — lo abilitiamo per l'integrazione:
  `authorization code` + **PKCE**, ID token, endpoint UserInfo, documento di discovery.
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
`sub` (id opaco stabile — la chiave di aggancio), `name` (claim OIDC standard = **stringa unica** col nome completo, quando disponibile; niente `given_name`/`family_name` separati → lo splittate voi) ed `email`.
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
5. **Prominenza sul nostro spazio (è la richiesta che conta).** Non vi chiediamo di *togliere*
   la registrazione col form — sappiamo che è parte del sistema e vale per tutti gli enti. Vi
   chiediamo di **invertire l'ordine** sul nostro tenant: «Entra con RAH» come **pulsante
   principale**, e il form nativo relegato a link secondario. Oggi sulle vostre pagine il
   rapporto è l'inverso — «Non sei ancora registrato? Clicca qui» è già un link secondario
   sotto il form — quindi la struttura per farlo esiste: è una questione di template del
   tenant, non del sistema di autenticazione.
   **Punto importante — un pulsante solo, per chi ha già l'account E per chi non l'ha.** Non
   serve un secondo pulsante «Registrati»: «Entra con RAH» porta alla **nostra** pagina, che
   gestisce entrambi i casi — se l'utente ha già un account RAH accede, se non l'ha **lo crea
   lì, da noi** — e poi rientra da voi già autenticato. Funziona come «Accedi con Google»: chi
   non ha l'account Google lo crea su Google, non sul sito che sta visitando. Quindi il
   percorso di registrazione **non deve puntare al form nativo**: per noi è essenziale che il
   nuovo utente nasca nella nostra anagrafica (siamo noi il titolare del rapporto col donatore,
   e la nostra informativa/i nostri consensi si raccolgono da noi).
   Per l'utente il risultato è: **un solo percorso visibile, nessuna seconda registrazione**.
   *(Se poi fosse configurabile per-tenant renderlo l'unico metodo, per noi sarebbe l'ideale —
   ma non è una precondizione.)*
5-bis. **Collegamento degli account (evita i doppioni senza togliere nulla).** Se una persona
   ha già un account vostro con l'email X e poi entra con «Login con RAH» portando la stessa
   email X, il vostro sistema può **collegare** i due account invece di crearne un secondo?
   È la prassi standard dei login social. Copre tutti i casi tranne gli utenti Apple con
   «Nascondi la mia email» (lì l'email è un alias, non combacia): per quelli resta l'aggancio
   sul `sub`.
6. **Il precedente Zucchetti** — ci avete raccontato che con la piattaforma Zucchetti il link
   è nel loro portale e i dipendenti «arrivano già registrati». Vorremmo capire **come** è
   fatto quel pezzo: se esiste già qualcosa di riusabile, risparmiamo lavoro a entrambi.
   Guardando lo spazio pubblico Zucchetti l'accesso ci sembra con **email e password**, e in
   registrazione c'è un campo **«Gruppo Aziendale»** — quindi ci chiediamo se «già registrati»
   significhi che il link **pre-associa l'azienda** (e la registrazione la fa comunque
   l'utente), oppure se esista anche un **accesso automatico** dal portale aziendale. In
   concreto:
   - c'è un **single sign-on** (il partner dichiara l'identità dell'utente e voi aprite la
     sessione: SAML, OIDC, oppure un link firmato con un token)? Se sì, con quale protocollo?
   - oppure gli account arrivano da un **flusso dati** (anagrafiche/welfare bonus) e/o la
     registrazione resta manuale con l'azienda pre-selezionata?
   - quel meccanismo è riusabile per un ente come noi, o è specifico del canale welfare?

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
