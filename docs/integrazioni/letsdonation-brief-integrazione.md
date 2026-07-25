# Rise Against Hunger Italia — Brief di integrazione per Let's Donation

> **Documento tecnico di supporto, NON ancora inviato.** Si consegna **su richiesta** del team
> tecnico di Let's Donation, tramite Michele Placucci. Quello che si manda adesso è
> `letsdonation-proposta-operativa.md` (una pagina). Il nome del referente tecnico non è
> confermato: non va scritto da nessuna parte.
>
> **Quello che ci interessa davvero, e in quest'ordine**: come una persona entra nel nostro
> spazio senza doversi registrare due volte, quali dati passano fra noi e voi, chi tiene cosa,
> e che percorso fa concretamente. L'attribuzione degli ordini viene dopo: è utile a noi, non
> è urgente, e sta in fondo.
>
> Riscritto il 2026-07-25 a valle di una mappatura completa degli scenari.

---

## 1. Il contesto in due righe

Abbiamo un'app iOS/Android con account propri dei donatori: l'autenticazione la gestiamo noi.
Quando dall'app mandiamo una persona sul vostro shop, sulle gift card, sugli eventi o sui
progetti, oggi **si registra una seconda volta**. È il problema che vogliamo chiudere.

Non vi chiediamo di cambiare la piattaforma: vi chiediamo di **accettare il nostro login** come
il modo in cui una persona entra nel nostro spazio, e ci occupiamo noi di tutta la parte di
identità. È quanto ci eravamo detti in chiamata: gli account di chi sostiene Rise Against Hunger
Italia nascono da noi, una volta sola.

---

## 2. «Login con RAH» — come funziona

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

### 2.1 Un solo pulsante, per chi ha già l'account e per chi non ce l'ha

Non serve un secondo pulsante «Registrati». «Entra con RAH» porta alla **nostra** pagina, che
gestisce entrambi i casi: se la persona ha già un account RAH accede, se non ce l'ha **lo crea
lì, da noi**, e poi rientra da voi già autenticata. Come con «Accedi con Google»: chi non ha
l'account Google lo crea su Google, non sul sito che sta visitando.

Per noi questo è essenziale: siamo noi il titolare del rapporto con chi ci sostiene, e la nostra
informativa e i nostri consensi si raccolgono da noi. Quindi il percorso di registrazione **non
deve puntare al vostro form nativo**.

### 2.2 Sul nostro spazio, un solo ingresso

È il punto su cui ci eravamo già trovati d'accordo in chiamata, e lo confermiamo: sul **nostro
tenant** l'unico percorso di registrazione è «Entra con RAH». Non due strade in parallelo.

Due ragioni, e nessuna delle due è tecnica.

**Le anagrafiche doppie divergono subito.** Se una persona può iscriversi anche col form, di lei
esistono due schede: una da voi e una da noi. Cambia indirizzo in una e non nell'altra; revoca un
consenso da noi e da voi resta; ci chiede la cancellazione e noi non possiamo darle seguito su
un'anagrafica che non governiamo. Con un solo ingresso la scheda è una, ed è la nostra: siamo noi
il titolare del rapporto con chi ci sostiene, ed è da noi che si raccolgono informativa e consensi.

**Chi arriva non sa che esistono due database.** Vede due modi di entrare e ne sceglie uno a caso.
Se sbaglia si ritrova un secondo account, senza il suo storico e senza i consensi che abbiamo
raccolto noi — e non capisce perché. Per una persona poco pratica è esattamente il punto in cui
abbandona. La distinzione fra il vostro sistema e il nostro è nostra, non sua: non deve vederla.

Detto senza giri: **due pulsanti di accesso sulla stessa pagina non hanno ragione di esistere.**
Non è una questione di quale sia più in evidenza — è che la scelta non dovrebbe nemmeno esserci.

In concreto: dal nostro spazio il form nativo non deve essere raggiungibile come alternativa.
Sappiamo che è **template del tenant, non sistema di autenticazione** — la struttura per farlo
esiste già, dato che oggi «Non sei ancora registrato? Clicca qui» è a sua volta un link
secondario sotto il form.

Se c'è un vincolo tecnico che lo impedisce, ci è utile sapere **quale**: se il blocco è su un
pezzo che possiamo risolvere noi, lo risolviamo noi.

Resta un caso a parte, ed è l'unico: chi ha **già** un account vostro creato col form prima di
tutto questo. Quelli non si buttano via, si collegano (§2.4).

### 2.3 Forse una parte l'avete già fatta: il caso Zucchetti

Prima di parlare di cose da costruire, una domanda che può cambiare tutto il resto — e che
mettiamo qui, non in fondo, perché se la risposta è quella che speriamo il lavoro da fare è molto
meno di quanto sembra.

Ci avete raccontato che con la piattaforma Zucchetti il link sta nel loro portale e i dipendenti
**«arrivano già registrati»**. Se esiste già un meccanismo che fa entrare una persona nel vostro
spazio senza che si registri da voi, allora quello che vi stiamo chiedendo **non è una cosa nuova**:
è la stessa cosa, con noi al posto di Zucchetti. Non vi chiediamo di inventare, vi chiediamo di
riusare.

Vorremmo quindi capire **come è fatto** quel pezzo. Guardando lo spazio pubblico Zucchetti
l'accesso ci sembra con email e password, e in registrazione c'è un campo «Gruppo Aziendale»:
questo ci fa pensare che il link possa **pre-associare l'azienda** lasciando comunque la
registrazione alla persona. Ma è un'ipotesi nostra, dedotta da fuori, e vorremmo la vostra
risposta. In concreto:

- esiste un **single sign-on** — il partner dichiara l'identità e voi aprite la sessione (SAML,
  OIDC, oppure un link firmato con un token)? Se sì, con quale protocollo?
- oppure gli account arrivano da un **flusso dati** (anagrafiche, welfare bonus) e la
  registrazione resta manuale con l'azienda pre-selezionata?
- e in ogni caso: **quel meccanismo è riusabile per un ente come noi**, o è legato al canale
  welfare?

Se è un single sign-on, è già la risposta alla nostra richiesta e possiamo partire da lì. Se è un
pre-caricamento di anagrafiche, non ci serve — a noi non serve mandarvi elenchi di persone, serve
che la singola persona entri con il suo account nostro.

### 2.4 Collegare gli account invece di duplicarli

Se una persona ha già un account vostro con l'email X e poi entra con «Login con RAH» portando la
stessa email X, il vostro sistema può **collegare** i due account invece di crearne un secondo?
È la prassi standard dei login social. Copre tutti i casi tranne chi usa «Nascondi la mia email»
— lì l'alias non combacia e resta l'aggancio sul `sub`.

---

## 3. Il percorso dell'utente, caso per caso

È la parte che ci interessa vedere chiara prima di costruire. Sei situazioni reali.

| Chi arriva | Cosa succede |
| --- | --- |
| **Ha un account RAH, non ha un account vostro** | Tocca «Entra con RAH» → la nostra pagina lo riconosce → torna da voi autenticato. Voi create l'utente al primo accesso, agganciato al `sub`. Dal secondo accesso in poi lo ritrovate |
| **Non ha nessuno dei due** | Tocca «Entra con RAH» → sulla nostra pagina **crea l'account da noi** (con la nostra informativa e i nostri consensi) → torna da voi autenticato, e da lì è il caso sopra |
| **Ha già un account vostro, con la stessa email** | È il caso in cui serve il **collegamento** (§2.4): altrimenti si ritrova due account e non capisce perché |
| **Ha già un account vostro, ma usa «Nascondi la mia email»** | L'alias non combacia con l'email che aveva usato da voi: i due account **non sono collegabili automaticamente**. Restano due. Se avete un «collega il mio account» nel profilo utente, ci risolve anche questo |
| **Atterra sul nostro spazio da un motore di ricerca**, senza venire dall'app | Con un solo ingresso (§2.2) entra da «Entra con RAH» come tutti, e l'account nasce da noi. È una persona in più che diventa nostra, e con due strade l'avremmo persa |
| **Si iscrive a Let's Donation da un percorso che non tocca il nostro spazio** | Nasce da voi e per noi resta invisibile. **Lo accettiamo**: non è una persona che stiamo perdendo, è una che non era ancora nostra |

---

## 4. Quali dati passano, e chi tiene cosa

**Nessuno dei due entra nel database dell'altro.** Non vi chiediamo credenziali sul vostro database
e non ve ne diamo sul nostro. L'unico scambio avviene al momento del login, con i dati che il
protocollo prevede — un identificativo, il nome e l'email — più i token tecnici dell'accesso, per
i quali vale l'impegno descritto qui sotto.

**Cosa vi trasmettiamo al login** — solo i claim standard OpenID Connect:

| Dato | A cosa serve |
| --- | --- |
| `sub` | Identificativo opaco e stabile. È **la chiave di aggancio**: non dice nulla sulla persona |
| `name` | Nome completo in **una stringa unica** (niente nome e cognome separati: li dividete voi) |
| `email` | L'email dell'account, così com'è |

Niente telefono, niente indirizzo, niente data di nascita. Sui token tecnici che il protocollo
scambia durante l'accesso vale il punto **H11** del nostro perimetro: nel flusso standard il vostro
client riceve un token con i privilegi dell'utente, quindi l'impegno che chiediamo di mettere
nell'accordo è di leggere l'identità **solo** da ID token e UserInfo, senza chiamare le nostre API
con quel token.

> Sull'email: per chi usa «Nascondi la mia email» di Apple è un alias
> `@privaterelay.appleid.com` che **inoltra** all'indirizzo vero — la posta arriva comunque. È lo
> standard OIDC e vi passiamo quello che l'account ha.

**Chi tiene cosa:**

- **Noi** teniamo l'anagrafica completa di chi si registra da noi, l'informativa che ha accettato
  e la prova dei consensi. Siamo titolari di quel trattamento.
- **Voi** tenete l'account sulla vostra piattaforma, gli ordini e tutto ciò che riguarda le
  transazioni. Siete titolari del vostro.
- **Nessuno dei due** entra nei dati dell'altro.

---

## 5. Cosa ci serve sapere da voi

**La prima è quella che può farci risparmiare più lavoro**, le prime cinque sbloccano il resto, le
altre servono per rifinire.

1. **Il meccanismo Zucchetti** (§2.3): come fanno i dipendenti ad «arrivare già registrati»? È un
   single sign-on — e con quale protocollo — oppure un pre-caricamento di anagrafiche? Ed è
   riusabile per noi? *Se è un single sign-on, gran parte di quanto segue è già risolta.*
2. **Un solo ingresso** sul nostro tenant (§2.2): la registrazione col form si può non esporre sul
   nostro spazio, via template? Se qualcosa lo impedisce, qual è esattamente il pezzo?
3. Il vostro Joomla può fare da **client OIDC**? Con quale plugin e versione?
4. Il plugin può **mappare il `sub` sull'username** (creazione al primo accesso, aggancio sul
   `sub` agli accessi successivi), **non sull'email**?
5. Quali **redirect URI** dobbiamo autorizzare?
6. **Collegamento degli account** sull'email (§2.4): c'è o si può attivare?
7. Il vostro sistema accetta un'email alias `@privaterelay.appleid.com` per creare l'account, o
   pretende un'email verificata?
8. L'anagrafica viene aggiornata dai dati del login **a ogni accesso** o solo alla creazione?
9. Gli account creati per questa via nascono con i consensi marketing a **no**, e in che momento
   viene presentata la **vostra** informativa?
10. Se una persona chiede a noi la cancellazione, esiste un modo per propagarvela?
11. Quando ci saranno eventi sul nostro spazio, **quali dati** chiede l'iscrizione?
12. Le **donazioni in denaro ai progetti** sul nostro spazio sono esportabili — o inviabili via
    webhook — con la stessa attribuzione della domanda 1? Oggi quel denaro arriva a noi come
    risultato ma non come dato: senza l'export non sappiamo ricondurlo a chi l'ha fatto.
13. Sull'impegno di leggere l'identità **solo** da ID token e UserInfo (sez. 4): è una cosa che
    potete confermare per iscritto nell'accordo?

**Cosa vi forniremo noi**, quando entrambe le parti sono pronte: discovery URL
(`…/.well-known/openid-configuration`), `client_id` e `client_secret` dedicati a voi, le redirect
URI da autorizzare, scope e claim disponibili.

---

## 6. Inquadramento privacy

- Siamo **due titolari autonomi**: ciascuno resta titolare dei propri trattamenti. Non
  contitolarità (art. 26) e non responsabile del trattamento (art. 28).
- La liceità della trasmissione poggia sul **click della persona**: è lei che avvia il login. Lo
  dichiareremo nella nostra informativa **prima di attivare il login**: oggi il documento copre i
  dati che già viaggiano verso i partner, non ancora quelli del futuro «Entra con RAH».
- Serve un **accordo di condivisione dati** fra le due società, che circoscriva quali dati
  passano, per quale finalità e per quanto tempo.
- Nessuna pre-creazione massiva di account «per conto» dei nostri utenti.

---

## 7. In coda: riconoscere che un ordine arriva da noi

Non è urgente e non tocca il login. La mettiamo per completezza, perché quando il login funziona
questa diventa quasi gratis.

Quando apriamo un vostro link aggiungiamo all'indirizzo un **codice opaco generato da noi**, uno
per persona (oggi l'app lo invia come `rise_ref`; possiamo rinominarlo nei parametri UTM standard
se per voi è più comodo — è una riga di codice da parte nostra). Serve solo a ricondurre a
posteriori un ordine alla persona giusta: non è un login e non apre nessuna sessione.

Due cose da sapere se un giorno ci mettete mano:

- **la cattura va fatta all'atterraggio, non al checkout**: le vostre landing sono pagine-
  categoria, a due o tre click dall'ordine, e il parametro a quel punto non c'è più;
- **il charity shop è diverso**: è una vetrina di cashback verso merchant terzi, l'acquisto
  avviene fuori e da voi non nasce un ordine — lì l'aggancio andrebbe cercato sull'attivazione
  del cashback.

E una domanda che vale più di tutto il resto: quando il «Login con RAH» sarà attivo, l'export può
esporre **un indicatore che marca le persone entrate con quel percorso**? Per quelle,
l'attribuzione è certa senza bisogno di nessun codice nell'indirizzo.
