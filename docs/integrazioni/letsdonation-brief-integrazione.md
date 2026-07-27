# Rise Against Hunger Italia — Brief di integrazione per Let's Donation

<!-- NOTE INTERNE — NON contenuto del documento.
     Regola imparata a spese nostre: il convertitore PDF rende i blockquote VERBATIM e salta solo
     i commenti HTML come questo. Un'intestazione interna scritta con «>» finisce in PRIMA PAGINA
     dal destinatario. È già successo sulla proposta (PR #101) e questo file aveva lo stesso
     difetto: il PDF in C:/tmp conteneva questa nota, incluso il nome del referente — dentro la
     frase che vieta di scriverlo. Tutto ciò che non deve leggere il partner va QUI, mai in «>».

     AGGIORNATO 2026-07-26 — rimozione del login Google/Apple (decisione di Riccardo, PR #120).
     Sono cadute 4 affermazioni che descrivevano il caso «Nascondi la mia email»: la motivazione
     dell'aggancio sul `sub` (ora è quella vera e più generale: le persone cambiano indirizzo),
     l'impegno a raccogliere l'indirizzo reale, la riga della tabella §2.4 e il riquadro sull'email.
     La domanda 7 NON è stata cancellata ma RISCRITTA sullo stesso tema (email_verified): il
     numero si conserva perché scambio-dati-quadro.md:4 vieta di rinumerare — altri tracker
     citano le domande per numero.
     Attenzione al verso: la rimozione RAFFORZA la proposta (l'indirizzo che arriva al partner è
     sempre reale e verificato). Se un domani i social rientrassero, quei 4 punti vanno rimessi.

     AGGIUNTO 2026-07-27 — §4.1 «Dopo il primo accesso» + domande 19-22 (fase F-SYNC, richiesta di
     Riccardo). Il brief descriveva solo la NASCITA dell'identità, non il suo ciclo di vita: con due
     anagrafiche separate ogni evento non propagato è una divergenza silenziosa. La sezione è entrata
     DENTRO la §4 e le domande in CODA alla §5 proprio per non rinumerare (stesso vincolo di sopra).
     Il gradino 1 delle tre opzioni è già coperto dalla domanda 8 preesistente: non duplicarlo.
     Fonti dietro le scelte, per chi le rimette in discussione: l'obbligo di propagare la cancellazione
     è l'art. 19 GDPR (comunicazione a ogni destinatario), NON l'art. 17(2) che riguarda i dati resi
     pubblici — è la differenza che rende l'obbligo applicabile al nostro caso. I nomi degli eventi
     vengono da OpenID RISC 1.0 (Final 2025-09-02, schemas.openid.net/secevent/risc/event-type/).
     Lato nostro il canale si costruisce con i Database Webhooks Supabase, che girano su pg_net:
     ⚠️ verificato il 2026-07-27 che pg_net è DISPONIBILE ma NON INSTALLATO sul nostro progetto →
     abilitarlo è un prerequisito, non una cosa che abbiamo già. Nel documento infatti si scrive
     «la costruiamo noi», mai «ce l'abbiamo».

     Stato: documento tecnico di supporto, NON ancora inviato. Si consegna su richiesta del loro
     team tecnico. Quello che si manda adesso è letsdonation-proposta-operativa.md (una pagina).
     ⚠️ CONTRADDIZIONE APERTA (rilevata 2026-07-27, da sciogliere con Riccardo): il lastchat #31
     registra come decisione vincolante «cosa si manda a Michele: i DUE PDF», mentre questa nota e
     il binding (partner-identita.md, § ZUCCHETTI) dicono che il brief NON si manda adesso perché
     «troppo lungo e complicato» — parole sue del 25/07. Due fonti contro una. Con l'aggiunta di
     oggi il brief è ancora più lungo, quindi la domanda conta.
     Il nome del referente tecnico non è confermato: non va scritto da nessuna parte.
     Quadro d'insieme su dati e archivi: scambio-dati-quadro.md.
     Riscritto il 2026-07-25 a valle di una mappatura completa degli scenari; intestazione resa
     invisibile al destinatario il 2026-07-25.
-->

> **Quello che ci interessa davvero, e in quest'ordine**: come una persona entra nel nostro
> spazio senza doversi registrare due volte, quali dati passano fra noi e voi, chi tiene cosa,
> e che percorso fa concretamente. L'attribuzione degli ordini viene dopo: è utile a noi, non
> è urgente, e sta in fondo.

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

**L'identità si aggancia sul `sub`, mai sull'email.** L'indirizzo cambia — la persona passa a una
casella nuova, o ne usa una diversa da quella con cui si era registrata — e ogni volta che cambia,
un aggancio basato sull'email crea un secondo account invece di riconoscere il primo.
L'identificativo stabile è il **`sub`** dell'ID token: non cambia mai, per tutta la vita
dell'account.

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

**Quando**: le due cose vanno insieme — il modulo si toglie **nello stesso momento** in cui il
pulsante va online, non dopo un periodo di prova. Ogni giorno in cui convivono produce
anagrafiche doppie che poi qualcuno deve riconciliare a mano.

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
È la prassi standard dei login social.

Due cose che facciamo noi perché il collegamento funzioni davvero. **Sono il disegno con cui
partiamo al primo rilascio, non quello che l'app installata fa oggi**:

- **le anagrafiche di chi si è registrato finora le sistemiamo dalla nostra parte** — sono i nostri
  sostenitori e l'elenco ce lo esportiamo da soli, dal back office del nostro spazio: non vi
  chiediamo di prepararci nulla — così quelle persone risultano riconosciute quando entrano col
  pulsante (e se mancano dati che oggi chiediamo, glieli chiediamo noi al primo accesso). Atterrano
  in una tabella separata dai profili: restano **schede**, e l'account nasce solo quando è la
  persona a entrare. Il lavoro parte quando la nostra informativa aggiornata è pubblicata, e resta
  legato alla risposta alla domanda 18;
- **l'indirizzo che vi arriva è sempre reale e verificato.** Da noi si entra solo con email e
  password, e l'indirizzo si conferma cliccando il messaggio che mandiamo: nessun alias, nessuna
  casella mascherata da riconciliare in un secondo momento. Non dovete prevedere nulla di
  speciale per gli indirizzi anonimizzati dei fornitori di identità.

Dal primo accesso in poi, però, l'aggancio stabile è il **`sub`**, non l'indirizzo: una persona
può cambiare email, e il `sub` no.

---

## 3. Il percorso dell'utente, caso per caso

È la parte che ci interessa vedere chiara prima di costruire. Sei situazioni reali.

| Chi arriva | Cosa succede |
| --- | --- |
| **Ha un account RAH, non ha un account vostro** | Tocca «Entra con RAH» → la nostra pagina lo riconosce → torna da voi autenticato. Voi create l'utente al primo accesso, agganciato al `sub`. Dal secondo accesso in poi lo ritrovate |
| **Non ha nessuno dei due** | Tocca «Entra con RAH» → sulla nostra pagina **crea l'account da noi** (con la nostra informativa e i nostri consensi) → torna da voi autenticato, e da lì è il caso sopra |
| **Ha già un account vostro, con la stessa email** | È il caso in cui serve il **collegamento** (§2.4): altrimenti si ritrova due account e non capisce perché |
| **Ha già un account vostro, con un indirizzo diverso da quello che usa da noi** | L'email non basta a riconoscerlo e nasce un secondo account. Non è un caso esotico: succede a chi si era registrato da voi anni fa con una casella che oggi non usa più. Serve il **collegamento dal profilo** (§2.4) oppure l'aggancio sul `sub`, che non cambia mai. Se l'anagrafica viene aggiornata dai dati del login a **ogni** accesso (domanda 8), il disallineamento si chiude da solo al primo rientro |
| **Atterra sul nostro spazio da un motore di ricerca**, senza venire dall'app | Con un solo ingresso (§2.2) entra da «Entra con RAH» come tutti, e l'account nasce da noi. È una persona in più che diventa nostra, e con due strade l'avremmo persa |
| **Si iscrive a Let's Donation da un percorso che non tocca il nostro spazio** | Nasce da voi e per noi resta invisibile. **Lo accettiamo**: non è una persona che stiamo perdendo, è una che non era ancora nostra |

---

## 4. Quali dati passano, e chi tiene cosa

**Nessuno dei due entra nel database dell'altro.** Non vi chiediamo credenziali sul vostro database
e non ve ne diamo sul nostro. L'unico scambio avviene al momento del login, con i dati che il
protocollo prevede — un identificativo, il nome quando c'è, l'email dell'account e l'indicazione
che è verificata — più i token tecnici dell'accesso, per i quali vale l'impegno descritto qui
sotto.

**Cosa vi trasmettiamo al login** — solo i claim standard OpenID Connect:

| Dato | A cosa serve |
| --- | --- |
| `sub` | Identificativo opaco e stabile. È **la chiave di aggancio**: non dice nulla sulla persona |
| `name` | Nome completo in **una stringa unica** (niente nome e cognome separati: li dividete voi). Può mancare: il vostro sistema deve tollerarne l'assenza |
| `email` | L'email dell'account, così com'è |
| `email_verified` | Indica se quell'indirizzo risulta confermato da noi. Può essere `false`: il provisioning non deve rifiutarlo |

Niente telefono, niente indirizzo, niente data di nascita. Sui token tecnici che il protocollo
scambia durante l'accesso vale il punto **H11** del nostro perimetro: nel flusso standard il vostro
client riceve un token con i privilegi dell'utente, quindi l'impegno che chiediamo di mettere
nell'accordo è di leggere l'identità **solo** da ID token e UserInfo, senza chiamare le nostre API
con quel token.

> Sull'email: lo standard consegna l'email **dell'account**. Da noi si entra solo con email e
> password, e quell'indirizzo la persona lo conferma cliccando il messaggio che le mandiamo →
> quello che vi arriva è sempre un indirizzo reale e verificato, mai una casella mascherata.
> Resta il caso di chi da voi ha un indirizzo **diverso** da quello che usa da noi: lì non serve
> una verifica in più, serve il collegamento dell'account (§2.4) o l'aggancio sul `sub`.

**Chi tiene cosa:**

- **Noi** teniamo l'anagrafica completa di chi si registra da noi, l'informativa che ha accettato
  e la prova dei consensi. Siamo titolari di quel trattamento.
- **Voi** tenete l'account sulla vostra piattaforma, gli ordini e tutto ciò che riguarda le
  transazioni. Siete titolari del vostro.
- **Nessuno dei due** entra nei dati dell'altro.

### 4.1 Dopo il primo accesso: che succede quando qualcosa cambia

Tutto quello scritto fin qui riguarda **come una persona entra**. Ma un'anagrafica non sta ferma:
la gente cambia indirizzo email, cambia idea sulle comunicazioni, e a volte chiede di essere
cancellata. Da quel momento in poi abbiamo **due schede della stessa persona in due database
diversi**, e ogni cambiamento che non passa dall'una all'altra le fa divergere **senza che nessuno
se ne accorga**. È lo stesso problema che il pulsante unico risolve alla nascita, spostato in
avanti nel tempo.

Questa parte non è un dettaglio da rimandare: contiene l'unico punto in cui **entrambi abbiamo un
obbligo di legge**, ed è la cancellazione.

**Cosa cambia dalla nostra parte, e cosa ne vedete voi oggi**

| Cosa succede da noi | Cosa vedreste voi oggi | Quanto può aspettare |
| --- | --- | --- |
| **La persona chiede la cancellazione dei suoi dati** | Niente. Resterebbe nel vostro database dopo averci chiesto di sparire | 🔴 **Non può aspettare.** È l'unico caso con un obbligo per entrambi (vedi sotto) |
| Revoca il consenso alle comunicazioni | Niente: continuereste a scriverle | 🔴 Giorni, non mesi. Ogni messaggio in più è un trattamento senza base |
| Cambia l'indirizzo email | Niente finché non rientra da voi | 🟡 Al prossimo accesso va bene, **se** aggiornate l'anagrafica dai dati del login (domanda 8) |
| Cambia nome o cognome | Come sopra | 🟡 Al prossimo accesso |
| Completa il profilo che aveva lasciato a metà | Come sopra | 🟡 Al prossimo accesso |
| Sospendiamo o blocchiamo un account | Niente: da voi resta attivo | 🟠 Subito, se il motivo è un abuso |

**Cosa cambia dalla vostra parte, e cosa ne sappiamo noi**

| Cosa succede da voi | Cosa ne sappiamo | La domanda vera |
| --- | --- | --- |
| La persona cancella l'account **da voi** | Niente | Il codice di provenienza che le avevamo associato resta valido? Lo teniamo o lo buttiamo? |
| Cambia i consensi raccolti dal **vostro** form (nickname, visibilità nelle liste, community) | Niente: sono campi che noi non abbiamo | Sono vostri e restano vostri — ma se una persona ci chiede «cosa avete su di me», dobbiamo saper dire che quelli stanno da voi |
| Completa un ordine o una donazione | Niente: oggi il codice viaggia in una direzione sola | Torna indietro qualcosa, o resta così? |

**Situazioni che non sono eventi, ma stati che nascono già disallineati**

- Chi si era registrato da voi **prima** del pulsante, con un indirizzo diverso da quello che usa
  da noi: sono due schede che non si riconoscono. Si chiude con il collegamento del §2.4, non da solo.
- Chi ha **meno di 18 anni** ed è già registrato da voi: da noi non può entrare (domanda 17),
  quindi resta una scheda vostra che il nostro sistema non vedrà mai.
- Chi ha **perso l'accesso alla propria casella email**: oggi resta bloccato fuori da entrambi i
  sistemi, perché l'email è la chiave di riconoscimento per tutti e due.
- Chi dona **da ospite**, senza account: nessun collegamento è possibile, ed è voluto.
- Una richiesta di **accesso ai propri dati**: chi risponde, e l'elenco che consegniamo comprende
  anche quello che sta da voi? Oggi la risposta onesta è che ciascuno risponde del proprio.

**Il punto con obbligo di legge, e perché lo mettiamo per primo.** Quando una persona ci chiede la
cancellazione, la norma non ci chiede solo di cancellare i nostri archivi: l'**art. 19 del GDPR**
obbliga chi ha comunicato quei dati a informare **ogni destinatario** a cui li ha comunicati, salvo
che sia impossibile o richieda uno sforzo sproporzionato. Con il «Login con RAH» voi diventate un
destinatario. Un modo per dirvelo deve esistere — e vale anche nel verso opposto, per i dati che
avete comunicato voi.

**Come si parlano i due sistemi, in tre gradini.** Non serve fare tutto: ogni gradino ha senso da
solo, e il primo probabilmente ce l'avete già.

1. **Al prossimo accesso** — costo zero, è già dentro il login. Se a ogni accesso aggiornate
   l'anagrafica con i dati che arrivano (domanda 8), email e nome si riallineano da soli. Copre
   quasi tutto **tranne** ciò che non può aspettare che la persona rientri: se ha chiesto di essere
   cancellata, non rientrerà mai.
2. **Un indirizzo che ci dite voi, dove mandarvi le poche cose urgenti** — è il gradino che chiude
   la cancellazione e la revoca dei consensi. Vi mandiamo un messaggio con dentro il codice della
   persona e cosa è successo; voi rispondete che l'avete ricevuto. Costruiamo noi la parte che
   invia; a voi serve solo un indirizzo che riceve. **Se dovessimo sceglierne uno solo, è questo.**
3. **Tutti gli altri eventi**, se un domani vi interessa: stessa strada del gradino 2, con più tipi
   di messaggio.

**Sulla forma: non ne inventiamo una nostra.** Esiste uno standard che descrive esattamente questi
eventi — si chiama *OpenID Shared Signals*, e la parte che ci riguarda (*RISC*) è diventata
definitiva a settembre 2025. Ha già un nome per ciascuna delle cose che ci servono: account
cancellato (`account-purged`), account disattivato (`account-disabled`), identificativo cambiato
(`identifier-changed`). Noi useremmo quei nomi. Se per voi è più comodo un messaggio JSON semplice
concordato fra noi due, per noi va bene lo stesso: l'importante è che il canale esista, non che sia
elegante. Lo diciamo perché scegliere uno standard già scritto costa meno che discutere un formato,
e perché se un giorno userete una libreria che lo implementa, funziona senza rifare niente.

**Una cosa che non si sposta con un messaggio: i consensi.** Se una persona revoca un consenso da
noi, noi possiamo dirvelo; ma un consenso raccolto da voi, sul vostro form, resta vostro e non
possiamo né trasmetterlo né presumerlo (è già la domanda 15). Il canale serve a **non tenere
attivo** un trattamento che è stato revocato, non a spostare consensi da un archivio all'altro.

---

## 5. Cosa ci serve sapere da voi

**La prima è quella che può farci risparmiare più lavoro**, le prime cinque sbloccano il resto, le
altre servono per rifinire. **Fa eccezione la 18**: non è una rifinitura, è un documento che ci
serve comunque, anche se del login non se ne facesse nulla.

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
7. Per creare l'account **vi basta il claim `email_verified`** che vi mandiamo noi, o il vostro
   sistema fa comunque partire una sua verifica dell'indirizzo? Se ne fa una sua, la persona
   riceve due mail di conferma per la stessa registrazione, e la seconda sembra un errore.
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
14. **I campi del vostro form che il login non copre.** La vostra registrazione chiede tre cose che
    noi non raccogliamo: il **nickname**, la scelta su **come apparire nelle liste pubbliche** (che è
    obbligatoria e non ha un valore preselezionato) e l'adesione a **community e classifiche**. Con la
    creazione dell'utente al primo accesso quei valori non arrivano da noi: applicate un default — e
    quale — oppure li chiedete alla persona una volta entrata? *La scelta di visibilità ci sembra la
    più delicata: con un default, una persona potrebbe comparire pubblicamente col proprio nome senza
    averlo scelto.*
15. **I vostri due consensi marketing** (comunicazioni commerciali del Titolare; comunicazioni degli
    Enti del Terzo Settore beneficiari delle donazioni): come vengono raccolti per chi entra dal
    nostro accesso? Non hanno un corrispondente nel nostro archivio, quindi non possiamo trasmetterli
    — e un consenso non si presume concesso.
16. **Ci avvisate prima di modifiche al nostro spazio?** L'ingresso unico della domanda 2 vive nel
    template del nostro tenant, che aggiornate per tutti gli enti: un aggiornamento potrebbe
    rimettere il form o far sparire il nostro pulsante, e ce ne accorgeremmo tardi.

17. **Il limite dei 18 anni vi crea un problema?** La nostra registrazione è riservata ai
    maggiorenni (lo verifichiamo alla data di nascita), quindi con un solo ingresso chi ha meno di
    18 anni non può più iscriversi sul nostro spazio: niente gift card, niente iscrizione agli
    eventi da lì. Non è un vincolo tecnico vostro, è una scelta nostra, ma ricade sulla vostra
    conversione ed è giusto che lo sappiate prima e non dopo. Se per voi è un problema reale,
    ditecelo: si ragiona su come gestirlo.

18. **Il rapporto che abbiamo già oggi: come lo qualifica il contratto?** Sul nostro spazio, dentro
    la vostra piattaforma, ci sono i nostri sostenitori, e dal back office li esportiamo noi. Per
    quei dati siete **responsabile del trattamento per conto nostro** (art. 28, con un accordo
    firmato) oppure **titolare autonomo**? Non è una domanda da girare a un legale: si risponde con
    un documento. Ci serve sapere quale atto esiste fra le due società e poterne avere copia. È
    indipendente dal «Login con RAH» e va chiusa comunque, perché è la stessa risposta che ci dice
    come trattare le anagrafiche del §2.4.

**Le quattro qui sotto riguardano il §4.1** — cosa succede *dopo* il primo accesso. La 19 è
l'unica del gruppo che ha un obbligo di legge dietro; le altre tre servono a capire da dove si
parte, e una risposta «no, non ce l'abbiamo» è una risposta utile quanto un sì.

19. **Quando una persona chiede la cancellazione dei propri dati, oggi come funziona da voi?** E
    soprattutto: **c'è un modo per dirvelo da parte nostra?** Se una persona si cancella da noi,
    l'art. 19 ci chiede di informare i destinatari a cui abbiamo comunicato i suoi dati, e con il
    login diventate uno di quelli. Ci basterebbe un indirizzo a cui mandare un messaggio con il
    codice della persona; la parte che invia la costruiamo noi. *Vale anche nel verso opposto: se
    si cancella da voi, ce lo fate sapere?*
20. **Supportate già qualche standard per lo scambio di questi eventi** — SCIM, OpenID Shared
    Signals/RISC — o lo fate con altri partner in un modo vostro? Se esiste già qualcosa ci
    adattiamo noi. Se non c'è niente, per noi va bene anche il messaggio più semplice possibile:
    non è una richiesta di costruire un'infrastruttura.
21. **Il codice di provenienza sull'ordine** (`rise_ref`, §7): se la persona cancella l'account da
    voi, quel codice resta attaccato agli ordini passati? Ci interessa perché è un dato che
    riconduce a una persona, e se lei ha chiesto di sparire deve sparire anche dove è riferito.
22. **La revoca del consenso alle comunicazioni**: se una persona che è entrata dal nostro accesso
    revoca da noi il consenso a essere contattata, avete un modo per recepirlo? Non parliamo di
    trasferire consensi — quelli restano di chi li raccoglie (domanda 15) — ma di **fermare** un
    invio che non ha più base.

**Cosa vi forniremo noi**, quando entrambe le parti sono pronte: discovery URL
(`…/.well-known/openid-configuration`), `client_id` e `client_secret` dedicati a voi, le redirect
URI da autorizzare, scope e claim disponibili.

---

## 6. Inquadramento privacy

- **Per il «Login con RAH» vi proponiamo di restare due titolari autonomi**: ciascuno titolare dei
  propri trattamenti, con un accordo di condivisione dati a delimitare cosa passa. Non
  contitolarità (art. 26) e non responsabile del trattamento (art. 28). Lo scriviamo come
  **proposta e non come cosa già decisa**: la vostra informativa ci dichiara titolari autonomi, ma
  è una dichiarazione unilaterale, non un accordo fra le parti, e la stiamo facendo verificare.
- **Il rapporto che abbiamo già oggi è un'altra cosa, e questa riga non lo qualifica.** Il nostro
  spazio dentro la vostra piattaforma ospita i nostri sostenitori: per quei dati il ruolo di
  ciascuno dipende da cosa dice il contratto già in essere, e non lo diamo per scontato in nessuna
  delle due direzioni. È la domanda 18 del §5, ed è indipendente dal login.
- La liceità della trasmissione poggia sul **click della persona**: è lei che avvia il login. Lo
  dichiareremo nella nostra informativa **prima di attivare il login**. Detto con precisione: la
  versione riscritta — che copre sia i dati già diretti ai partner sia quelli dell'«Entra con RAH» —
  è pronta ma **non è ancora online**; viene pubblicata prima del primo rilascio, ed è per noi un
  prerequisito, non un adempimento successivo.
- Serve un **accordo di condivisione dati** fra le due società, che circoscriva quali dati
  passano, per quale finalità e per quanto tempo.
- Nessuna pre-creazione massiva di account «per conto» di nessuno, in nessuna delle due
  direzioni: né noi creiamo utenze sul vostro spazio, né vi chiediamo elenchi di persone. Il
  riordino delle anagrafiche del §2.4 riguarda **i nostri archivi** e non crea account: sono
  schede, e l'account nasce solo quando è la persona a entrare.

---

## 7. In coda: riconoscere che un ordine arriva da noi

Non è urgente e non tocca il login. La mettiamo per completezza, perché quando il login funziona
questa diventa quasi gratis.

Quando apriamo un vostro link aggiungiamo all'indirizzo un **codice opaco generato da noi**, uno
per persona (nel codice si chiama `rise_ref`; parte col primo rilascio, che non è ancora
avvenuto — possiamo rinominarlo nei parametri UTM standard
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
