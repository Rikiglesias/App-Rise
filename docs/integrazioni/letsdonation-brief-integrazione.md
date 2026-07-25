# Rise Against Hunger Italia — Brief di integrazione per Let's Donation

> Documento per Let's Donation S.r.l. — consegnato a **Michele Placucci**, che lo gira al team
> tecnico (referente tecnico: Fabrizio Palai).
>
> Obiettivo: fare in modo che chi ci sostiene dall'app Rise Against Hunger Italia arrivi sul
> nostro spazio Let's Donation **senza doversi registrare una seconda volta**, e che noi
> possiamo riconoscere che un ordine o una donazione arriva da una persona nostra.
> Nessun accesso reciproco ai database, in nessuna direzione.
>
> Riscritto il 2026-07-25 a valle della mappatura completa degli scenari
> (`identita-matrice-scenari.md`): le richieste qui sotto sono quelle definitive.

---

## 1. Il contesto in due righe

Abbiamo un'app iOS/Android con account propri dei donatori: l'autenticazione la gestiamo noi.
Quando dall'app mandiamo una persona sul vostro shop, sulle gift card, sugli eventi o sui
progetti, oggi succedono due cose che vorremmo chiudere: **si registra una seconda volta**, e
**noi non sappiamo** che quell'ordine o quella donazione è sua.

Sono due integrazioni indipendenti. Si possono fare in ordine: la prima è leggera.

---

## 2. Richiesta A — Riconoscere che un ordine arriva da noi

Quando apriamo un vostro link vi passiamo dei parametri UTM standard in query string:

```text
https://…letsdonation.com/…?utm_source=rah-app&utm_campaign=<codice-opaco-per-utente>
```

`utm_campaign` è un **codice opaco generato da noi**, uno per persona. Non è un login e non
apre nessuna sessione. È uno **pseudonimo** ai sensi del considerando 26 GDPR — non un
identificativo leggibile — e serve solo a ricondurre l'ordine, a posteriori, alla persona
giusta.

**A1 — La cattura deve avvenire all'atterraggio, non al checkout.** Le vostre landing sono
pagine-categoria (lo shop, gli eventi, i progetti), a due o tre click dal checkout: «salvate il
parametro sull'ordine» non basta, perché a quel punto il parametro non c'è più. Serve che li
**catturiate all'arrivo, in sessione**, e li stampiate poi sull'ordine.

**A2 — E deve sopravvivere al login.** Se la persona atterra e poi fa l'accesso, il giro di
autenticazione esce dal sito e rientra: se il parametro non è già stato messo in sessione al
primo atterraggio, si perde per strada. È la ragione per cui insistiamo sul punto A1.

**A3 — Il charity shop è un caso a parte.** Abbiamo guardato come funziona: non è un negozio
con ordini vostri, è una vetrina di cashback verso oltre mille e-commerce partner, e l'acquisto
avviene sul sito del merchant. Lì un «ordine su cui salvare l'UTM» non esiste. Per quel flusso
la domanda è diversa: **a quale evento possiamo agganciare l'attribuzione** — l'attivazione del
cashback, immaginiamo — e **regge fino alla conferma differita** che arriva dalla rete
affiliate settimane dopo?

**Le domande che ci sbloccano:**

1. Il campo sorgente/campagna sull'**ordine** è valorizzabile dagli UTM e appare nell'**export**?
2. Esiste (o si può attivare) un **webhook «ordine completato»** che includa quel campo?
3. In alternativa va bene un **campo sorgente custom** sull'ordine? (Non vi chiediamo colonne
   nuove sull'anagrafica: sappiamo che è una tabella condivisa fra i tenant.)
4. Per il **charity shop**: a cosa si aggancia l'attribuzione, visto che l'ordine è del merchant?
5. **Le donazioni ai progetti** rientrano nello stesso export? Ce lo chiediamo perché abbiamo
   visto che sui nostri progetti si dona già in denaro — sono donazioni che oggi non vediamo.

---

## 3. Richiesta B — «Login con RAH» (OpenID Connect)

La persona arriva sul nostro spazio Let's Donation e accede **con il suo account RAH**, senza
crearne un secondo. Funziona esattamente come un «Accedi con Google», solo che l'identity
provider siamo noi.

- **Noi** = OpenID Provider. La nostra piattaforma di autenticazione (Supabase) **esporrà** un
  server OAuth 2.1 / OpenID Connect standard: `authorization code` + **PKCE**, ID token,
  endpoint UserInfo, documento di discovery.
- **Voi** = client OIDC sul vostro Joomla. Esistono plugin maturi (miniOrange OAuth Client e
  altri) che gestiscono la creazione dell'utente al primo accesso e la mappatura degli attributi.

**L'identità si aggancia sul `sub`, mai sull'email.** Alcune persone usano «Nascondi la mia
email» di Apple: l'email è un alias diverso per ogni servizio, quindi come chiave è inaffidabile.
L'identificativo stabile è il **`sub`** dell'ID token.

> **La domanda tecnica precisa**, perché sappiamo che è la parte delicata: il vostro plugin
> permette di **mappare il claim `sub` sull'username Joomla** (o su un attributo di identità
> equivalente), così che l'aggancio ai successivi accessi non dipenda dall'email? Nella
> documentazione pubblica dei plugin più diffusi troviamo la creazione utente al primo accesso
> e la mappatura degli attributi custom, ma non questo dettaglio.

**I dati che vi trasmettiamo al login** sono solo i claim standard OIDC: `sub` (l'identificativo
opaco, la chiave di aggancio), `name` (nome completo in una stringa unica — niente
`given_name`/`family_name` separati, li dividete voi) ed `email`. Nient'altro. Il codice di
attribuzione della Richiesta A **non** viaggia sul login: è un canale separato.

> Nota sull'email: per chi usa «Nascondi la mia email» di Apple l'`email` è un alias
> `@privaterelay.appleid.com` che **inoltra** all'indirizzo vero, quindi la posta arriva
> comunque. È lo standard OIDC: vi passiamo l'email dell'account così com'è.

### 3.1 Un solo pulsante, per chi ha già l'account e per chi non ce l'ha

Non serve un secondo pulsante «Registrati». «Entra con RAH» porta alla **nostra** pagina, che
gestisce entrambi i casi: se la persona ha già un account RAH accede, se non ce l'ha **lo crea
lì, da noi**, e poi rientra da voi già autenticata. Come con «Accedi con Google»: chi non ha
l'account Google lo crea su Google, non sul sito che sta visitando.

Per noi questo è essenziale: siamo noi il titolare del rapporto con chi ci sostiene, e la nostra
informativa e i nostri consensi si raccolgono da noi. Quindi il percorso di registrazione **non
deve puntare al vostro form nativo**.

### 3.2 Quello che vi chiediamo sul nostro spazio

**Invertire l'ordine, non togliere niente.** Non vi chiediamo di eliminare la registrazione col
form: sappiamo che è parte del sistema e vale per tutti gli enti. Vi chiediamo che sul **nostro
tenant** «Entra con RAH» sia il **pulsante principale** e il form nativo un link secondario.
Oggi il rapporto è l'inverso — «Non sei ancora registrato? Clicca qui» è già un link secondario
sotto il form — quindi la struttura per farlo esiste: è una questione di template del tenant,
non di sistema di autenticazione.

Aggiungiamo una cosa che gioca a favore di entrambi: **il vostro form deve restare**. Il nostro
server OIDC si appoggia a una funzionalità ancora in beta; se un giorno fosse indisponibile,
quel form è la via di fuga che tiene aperto il vostro spazio. Non è un ripiego, è la ragione per
cui non vi chiediamo di toglierlo.

**Collegare gli account invece di duplicarli.** Se una persona ha già un account vostro con
l'email X e poi entra con «Login con RAH» portando la stessa email X, il vostro sistema può
**collegare** i due account invece di crearne un secondo? È la prassi standard dei login social.
Copre tutti i casi tranne chi usa «Nascondi la mia email» — lì l'alias non combacia e resta
l'aggancio sul `sub`.

### 3.3 Cosa vi forniremo

Quando entrambe le parti sono pronte: discovery URL
(`…/.well-known/openid-configuration`), `client_id` e `client_secret` dedicati a voi, le
redirect URI da autorizzare (ce le indicate voi), scope e claim disponibili.

### 3.4 Cosa ci serve sapere da voi

1. Il vostro Joomla può fare da **client OIDC**? Con quale plugin e versione?
2. Riuscite ad aggiungere il pulsante «Login con RAH» nel flusso di accesso e di checkout?
3. Quali **redirect URI** dobbiamo autorizzare?
4. Il plugin può **mappare il `sub` sull'username** (creazione al primo accesso, aggancio sul
   `sub` agli accessi successivi), **non sull'email**?
5. **Inversione di prominenza** sul nostro tenant: fattibile via template?
6. **Collegamento degli account** sull'email: c'è o si può attivare?
7. Il vostro sistema accetta un'email alias `@privaterelay.appleid.com` per creare l'account, o
   pretende un'email verificata?
8. L'anagrafica viene aggiornata dai dati del login **a ogni accesso** o solo alla creazione?
9. Gli account creati per questa via nascono con i consensi marketing a **no**, e in che momento
   viene presentata la **vostra** informativa?
10. Se una persona chiede a noi la cancellazione, esiste un modo per propagarvela?
11. Quando ci saranno eventi sul nostro spazio, **quali dati** chiede l'iscrizione e sono
    esportabili?

### 3.5 Il precedente Zucchetti

Ci avete raccontato che con la piattaforma Zucchetti il link sta nel loro portale e i dipendenti
«arrivano già registrati». Vorremmo capire **come** è fatto quel pezzo: se esiste già qualcosa
di riusabile, risparmiamo lavoro a entrambi.

Guardando lo spazio pubblico Zucchetti l'accesso ci sembra con email e password, e in
registrazione c'è un campo «Gruppo Aziendale» — quindi ci chiediamo se «già registrati»
significhi che il link **pre-associa l'azienda** (e la registrazione la fa comunque la persona),
oppure se esista anche un **accesso automatico** dal portale aziendale. In concreto:

- c'è un **single sign-on** (il partner dichiara l'identità e voi aprite la sessione: SAML,
  OIDC, o un link firmato con un token)? Se sì, con quale protocollo?
- oppure gli account arrivano da un **flusso dati** (anagrafiche, welfare bonus) e la
  registrazione resta manuale con l'azienda pre-selezionata?
- quel meccanismo è riusabile per un ente come noi, o è specifico del canale welfare?

---

## 4. Inquadramento privacy

- Siamo **due titolari autonomi**: ciascuno resta titolare dei propri trattamenti. Non
  contitolarità (art. 26) e non responsabile del trattamento (art. 28).
- La liceità della trasmissione poggia sul **click della persona**: è lei che avvia il login o
  apre il link. Lo dichiariamo nella nostra informativa.
- Serve un **accordo di condivisione dati** fra le due società, che circoscriva quali dati
  passano, per quale finalità e per quanto tempo.
- Nessuna pre-creazione massiva di account «per conto» dei nostri utenti.

---

## 5. Ordine consigliato

1. **Richiesta A** — è quasi certamente configurazione, si può fare subito e vale anche da sola.
2. **Richiesta B** — in parallelo: voi verificate il client OIDC lato Joomla, noi prepariamo il
   server e le credenziali; poi ci scambiamo i parametri tecnici e facciamo un giro di test.

Un argomento a vostro favore: la piattaforma è multi-tenant, oltre mille enti. Sia l'attribuzione
sia il «Login con [ente]» li costruite **una volta** e valgono per tutti.
