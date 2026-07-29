<!-- markdownlint-disable MD029 -->
<!-- MD029 disabilitata di proposito: le domande di §9.3 sono numerate 1-21 di seguito anche quando
     un'intestazione in grassetto le raggruppa, perché quei numeri sono CITATI per numero nel brief
     e nel tracker del goal («domanda 14», «domanda 19»). Rinumerare per blocco romperebbe i
     riferimenti fra documenti. -->

# Scambio dati e database — quadro unico

> **Cos'è questo documento.** La vista d'insieme su **quali dati attraversano il confine** fra Rise
> Against Hunger Italia e le piattaforme esterne, **chi tiene quale archivio**, e per ogni opzione
> tecnica valutata **l'esito e il motivo**. Nasce come risposta alla domanda «cosa scriviamo a Let's
> Donation sui dati?» e copre anche Donorbox e il gestionale Access, perché lo scambio non si capisce
> guardando un solo lato.
>
> **Documenti sorella** (questo non li sostituisce): `identita-matrice-scenari.md` = gli scenari lato
> Let's Donation · `app-gate-matrice.md` = dove sta il cancello dell'account lato nostro ·
> `letsdonation-brief-integrazione.md` = il documento tecnico per i loro sviluppatori ·
> `letsdonation-proposta-operativa.md` = la pagina da mandare a Michele ·
> `oidc-server-implementation-plan.md` = il piano di implementazione dell'accesso federato.
> Tracker: `~/todos/partner-identita.md`.
>
> **Marcatori:** `[V]` verificato alla fonte (codice, database, pagina reale, documento ufficiale) ·
> `[A]` assunto o riferito a voce, va confermato · `[C]` due nostre fonti divergono, e lo dichiaro.
> Aggiornato: 2026-07-25.

---

## 0. La cosa da sapere prima di tutte le altre

**L'app che le persone hanno sul telefono è quella del 20 novembre 2025.** L'ultimo rilascio è il
commit `3d9a112` (`[ota] v1.2.8`), e nel repository non esiste nessun tag di versione successivo `[V]`.

Tutto il lavoro degli ultimi mesi — il codice di provenienza verso i partner, la precompilazione della
donazione, il registro dei consensi collegato al profilo, l'email di contatto chiesta a tutti,
la schermata di cancellazione dell'account — vive **solo su `master`**. Il commit che introduce il
codice di provenienza lato app è `9c836e5` del **23 luglio 2026**: otto mesi dopo l'ultimo rilascio `[V]`.

Due conseguenze che cambiano il modo di parlare e di pianificare:

1. **Al partner non si dice «oggi vi mandiamo».** Se i loro tecnici cercassero il parametro nei log non
   troverebbero nulla, e la nostra credibilità andrebbe con quella frase. Si dice: *«è pronto, partirà
   col primo rilascio»*.
2. **Il primo rilascio è un evento con una lista di controllo, non un dettaglio.** Alcune cose che oggi
   non fanno danno lo farebbero il giorno della pubblicazione — la prima è il pulsante «Elimina
   account» (§7). La lista è in §8.1.

---

## 1. Il quadro

L'associazione ha oggi **tre archivi di persone che non si parlano**: il nostro (l'app, su Supabase),
quello di Let's Donation (gift card, donazioni ai progetti, cashback dello shop, eventi) e quello di
Donorbox (donazioni in denaro, dove non serve nemmeno registrarsi). La stessa persona può esistere in
tutti e tre con dati diversi, e nessuno dei tre sa degli altri. A valle c'è un quarto archivio, interno:
il gestionale Access sul server dell'associazione.

Lo scambio dati serve a **due cose distinte**, da tenere separate anche a voce:

- **Far entrare la persona una volta sola**, con un account che nasce da noi, così che anagrafica e
  consensi siano nostri e non si sdoppino. È l'accesso federato («Entra con Rise Against Hunger»).
- **Sapere quali ordini e quali donazioni arrivano dall'app**, cosa che oggi non sappiamo. È
  l'attribuzione, e non ha niente a che vedere con l'accesso.

Il perimetro è stretto per scelta: **nessuno dei due entra nel database dell'altro**, non chiediamo
credenziali sul loro e non ne diamo sul nostro.

Per l'associazione il guadagno è una sola anagrafica da mantenere, i consensi raccolti e revocabili in
un posto solo, e la possibilità di dire quanto vale l'app. In cambio arrivano tre obblighi non
aggirabili: l'informativa privacy va pubblicata **prima** di trasmettere qualsiasi cosa, serve un
accordo scritto con Let's Donation, e la titolarità dei dati — quindi la responsabilità — resta
dell'associazione, non dei fornitori.

**Stato al 25 luglio 2026:** il codice di provenienza è scritto e la sua parte database è attiva sul
nostro server, ma non è in nessuna versione pubblicata `[V]`; nessuno lo raccoglie dall'altra parte;
l'accesso federato **non esiste** né da noi né da loro; il documento di una pagina per Michele è pronto
e **non è ancora stato inviato**.

---

## 2. Chi tiene quale archivio

| Archivio | Proprietario | Cosa contiene | Cosa l'altra parte può vedere |
|---|---|---|---|
| **Supabase — nostro backend** (Germania, Francoforte, region verificata 07/07/2026 `[V]`) | Rise Against Hunger Italia, **titolare del trattamento**; Supabase è responsabile | Account (`auth.users`: l'email vive qui, non in `profiles`) · anagrafica `profiles`: nome, cognome, data di nascita col controllo dei 18 anni, telefono, città, provincia, paese, email di contatto alternativa, data del consenso privacy, consenso marketing, data di richiesta cancellazione · registro dei consensi `consent_events` (sola aggiunta) · versioni dell'informativa `policy_versions` · codici di provenienza `partner_refs` · lapidi di cancellazione `partner_ref_tombstones` | **Nessun accesso diretto.** Ogni tabella **con dati personali** è leggibile solo alla riga del proprio utente; la tabella delle lapidi non è raggiungibile da nessun client; l'elenco delle versioni dell'informativa (nessun dato personale) è leggibile per intero da qualunque utente autenticato `[V]`. **Eccezione dichiarata:** con l'accesso federato attivo, nel giro standard del protocollo il loro sistema riceve un gettone con i pieni poteri dell'utente, che gli scope non limitano — l'unica barriera sono le nostre regole di riga. Mitigazioni: impegno contrattuale a leggere l'identità solo dal token di identità `[da sottoscrivere]`, verifica riga per riga delle regole `[da fare]`, durata breve del gettone — ma su Supabase la scadenza è **impostazione di progetto**, valida per tutte le sessioni: un valore dedicato ai soli token del partner è `[A]` da verificare |
| **Let's Donation — Joomla** (motore e-commerce presumibilmente HikaShop `[A]`, da confermare con loro), installazione multi-inquilino | Let's Donation S.r.l., Bologna, P.IVA 03188581205 (partner Zucchetti). **Titolare autonomo** | Account nativi creati col loro modulo — campi verificati dal vivo sul nostro tenant il 25/07, elenco completo in §2.1 `[V]` · ordini di gift card · donazioni in denaro ai progetti (sul progetto «Un Pasto in Sospeso \| Bologna»: 47 donazioni, 259,10 € `[V]`) · attivazioni cashback dello shop — lì **da loro non nasce alcun ordine**, l'acquisto è su un negozio terzo `[V]` · iscrizioni a eventi (oggi **zero eventi attivi** sul nostro spazio `[V]`) · in futuro gli account creati al primo accesso federato | **Nessun accesso al loro database, in nessuna direzione.** Ciò che ci serve passa da canali espliciti: campo sorgente sull'ordine, export, webhook, conferme scritte. La loro installazione è condivisa fra molti enti — loro parlano di oltre mille `[A]`; verificata è la multi-inquilinità (tenant diversi rispondono sullo stesso indirizzo di rete), non il numero. Motore: **MySQL**, riferito a voce da loro, coerente con l'impronta Joomla/PHP `[A]`; la dicitura «SQL Server» in alcune nostre tabelle vecchie è un residuo già corretto alla fonte, non una divergenza aperta. Irrilevante finché non si apre nessun database, e da non citare mai a loro |
| **Donorbox** (società statunitense) | Donorbox. Titolare autonomo | Le donazioni fatte dalla pagina ospitata da loro, con nome, cognome, email e importo che precompiliamo noi, più il nostro codice nel campo di campagna | Nessun accesso al nostro database. Noi possiamo leggere le donazioni via loro API (fase successiva, ~17 $/mese `[A]`, da confermare sul piano attivo). Che il nostro codice torni sul record della donazione **non è verificato**: serve una donazione reale da 1 € `[A]` |
| **Access (`.accdb`) sul server Windows dell'associazione** | L'associazione. **Resta il master anagrafico interno** | Anagrafica donatori/soci storica. Lo **schema reale è ignoto**: è il bloccante numero uno di quel lavoro `[V]` | **Nessun accesso dei partner, in nessuna forma.** Non è esposto a internet e non lo sarà. Flusso a senso unico, dal nostro cloud verso Access, con un programma che gira **sul server** (il cloud non può scrivere in un file Access locale). Deve portare anche consensi e richieste di cancellazione. Stato: **deciso e progettato, non costruito**, in pausa dal 17/07 `[V]` |
| **Google e Apple** — ⚠️ **flusso STORICO, chiuso il 26/07/2026** | Titolari autonomi | *Fino al 26/07/2026*: l'identificativo e l'email con cui la persona accedeva; con Apple, eventualmente un alias di inoltro | **Dal 26/07/2026 l'ingresso è solo email e password**: nessun dato ci entra più da loro, e nessun account nuovo può nascere da lì `[V]` (nessun riferimento ai due sistemi di accesso nel codice dell'app). Restano gli account **nati prima**, che portano ancora l'indirizzo ricevuto allora — è da lì che nasce il problema dell'alias citato più avanti. Non è più «l'unico caso in cui un dato personale ci entra da un terzo»: da un canale **automatico** oggi non ci entra da nessuno. Resta previsto un ingresso **una-tantum e manuale** — il riordino delle anagrafiche storiche, §3.1 — che non è un collegamento fra sistemi ma un caricamento deciso da noi |
| **Sentry**, diagnostica errori (società statunitense) | Sentry | **Solo i crash di render, senza identificativo dell'utente**: nella nostra app non esiste nessuna chiamata che associ l'errore alla persona (zero occorrenze di `setUser` in tutto il progetto), e l'invio è spento del tutto se manca la chiave d'ambiente `[V]` | Nessun accesso. ⚠️ **Correzione di una premessa nostra**: un nostro documento più vecchio dava per verificato che l'app mandasse a Sentry l'identificativo dell'utente. **Non è vero.** Non va scritto nell'informativa. Regione di ingestione e conservazione restano `[A]` da verificare |
| **Expo** (società statunitense) | Expo / 650 Industries | Informazioni tecniche sulla versione installata per la distribuzione degli aggiornamenti; nessun dato dell'account `[V]` | Nessun accesso |
| **Fornitore delle email di servizio** | Oggi il servizio integrato nel backend | Le email che confermano l'account — cioè quelle su cui poggia tutto l'ingresso unico | Il servizio integrato è **adatto solo allo sviluppo** (due email l'ora, reputazione condivisa, i rimbalzi fanno scattare restrizioni): prima del lancio si passa a un fornitore dedicato, già scelto, con l'autenticazione del dominio configurata. Regione e accordo: da recuperare, come per la diagnostica errori |
| *(da costruire)* **Pagina web di accesso e consenso**, su indirizzo Vercel gratuito | Noi. **Mai** su `riseagainsthunger.org`, che è di Rise Against Hunger USA `[V]` | Le schermate di approvazione e registrazione da web | Let's Donation la usa come punto di partenza del login, non ne vede il contenuto |

### 2.1 Cosa chiede il loro modulo di registrazione, oggi

Verificato dal vivo sul nostro tenant il 25/07/2026, leggendo la pagina reale `[V]`. Serve perché
**è la lista di ciò che l'accesso federato deve sostituire** — e tre voci non le abbiamo.

| Campo del loro modulo | Obbligatorio | Ce l'abbiamo? |
|---|---|---|
| Nome, Cognome | sì | sì |
| **Nickname** | no | **no** |
| Paese | sì | sì |
| Email | sì | sì |
| Password + conferma (minimo 6 caratteri) | sì | sì, con regole più severe (8 caratteri, maiuscola, speciale) |
| Consenso all'informativa — **la loro** | sì | il nostro consenso punta alla nostra informativa |
| Consenso comunicazioni commerciali del Titolare | no | `marketing_consent` |
| **Consenso comunicazioni agli Enti del Terzo Settore beneficiari delle donazioni** | no | **no, non esiste da noi** |
| **«Come desideri apparire nelle liste pubbliche?»** nome e cognome / nickname o anonimo | **sì, e nessuna opzione è preselezionata** | **no** |
| Mostrami nella community · Mostrami nelle classifiche | no | **no** |
| reCAPTCHA | — | — |

Non chiedono **data di nascita, telefono, città, provincia**: noi sì. Quindi «l'anagrafica completa sta
da noi» non è una posizione negoziale, è un fatto verificabile.

**Nessun pulsante di accesso con provider esterni sulla loro pagina** `[V]`: il nostro sarebbe il primo.

**Il buco che questa verifica ha aperto.** Se la persona nasce da noi e sul loro sito «arriva già
dentro», **chi le fa scegliere come apparire nelle liste pubbliche?** È un campo obbligatorio del loro
modulo, senza valore predefinito, e con l'accesso federato quel dato non arriva da noi perché non
l'abbiamo. Due uscite: loro applicano un default — e allora una persona potrebbe comparire
pubblicamente col nome senza averlo scelto, che è un problema di privacy **loro**, sul loro sito —
oppure glielo chiedono una volta al primo ingresso. Vale identico per i loro due consensi marketing,
di cui quello agli enti beneficiari non ha nessun corrispondente da noi. → **richieste 19 e 20 in §9.3**.

---

## 3. Cosa attraversa il confine, dato per dato

### 3.1 Cosa è pronto e partirà col primo rilascio — oggi nessuna versione pubblicata lo invia

| Dato | Direzione | Meccanismo | A quale condizione parte | Base giuridica | Qualif. |
|---|---|---|---|---|---|
| Codice di provenienza (`rise_ref`: sigla casuale generata dal nostro database, una per persona e per partner) | noi → Let's Donation | Parametro nell'indirizzo (`rise_ref=…`) aggiunto al link prima di aprire il browser | A **ogni** uscita verso shop, gift card, progetti, eventi, registrazione community. Solo se la persona ha fatto l'accesso **e** ha un profilo; per l'ospite il link parte identico, senza codice. Alla prima uscita c'è una schermata informativa: se annulla, non esce nulla | Non dichiarata nel codice; la liceità poggia sul gesto della persona che avvia il passaggio. Il codice **resta un dato personale** (pseudonimo, non anonimo) | `[V]` sul codice, **non pubblicato** |
| Lo stesso codice, riga distinta | noi → Donorbox | Parametro `utm_content` sull'indirizzo della pagina di donazione ospitata | A ogni tocco di «Dona». Se il codice manca, il parametro non viene aggiunto | come sopra | idem |
| Nome, cognome | noi → Donorbox | Parametri di precompilazione del modulo | **Due condizioni insieme:** esiste il profilo **e** risulta positivamente registrato il consenso all'informativa nella versione corrente. Se lo stato del consenso è ignoto (rete, errore), la precompilazione non parte e l'uscita procede vuota | Servizio richiesto dall'interessato, con **riserva dichiarata dalle nostre fonti**: se la finalità è ridurre l'attrito, serve un legittimo interesse documentato o un consenso. Tutta la parte legale è «da far validare» | idem |
| Email | noi → Donorbox | Parametro di precompilazione | Le condizioni sopra, **più**: se l'indirizzo risolto è un alias Apple «Nascondi la mia email» **non parte affatto**. Regola: email di contatto scelta dall'utente, altrimenti email dell'account | come sopra | idem |
| Importo suggerito | noi → Donorbox | Parametro di precompilazione | Con l'uscita verso la donazione | — | idem |
| **Niente in ingresso AUTOMATICO** da Let's Donation e Donorbox: nessun webhook, nessuna lettura, nessun canale di ritorno nel codice | — | — | Vero sul codice. **Non più vero sul piano operativo (2026-07-25)**: è deciso un **riordino manuale delle anagrafiche storiche** dentro il nostro database, così chi c'era già risulta riconosciuto. Prerequisiti: informativa pubblicata, base giuridica e Art.14 chiariti con la consulente, e la certezza che i consensi raccolti altrove **non** si trasferiscono. *(Fanno eccezione anche i fornitori di accesso: da Google e Apple ci arriva identificativo ed email — §2)* | — | `[C]` sul codice. **Origine CHIARITA il 2026-07-26** (Riccardo, dopo Michele): l'elenco si esporta **da soli** dal back office del nostro spazio sulla piattaforma del partner, voce «Sostenitori» → «Esporta», e sono persone che hanno donato **a noi** — non è un elenco che il partner ci consegna `[V]`. Resta `[A]` la **qualificazione giuridica**: chi è titolare di quei dati mentre stanno lì dipende dal contratto fra le due società, e nessun atto scritto risulta (`letsdonation-donorbox-identita.md:173`) → **fuori dal brief (decisione Riccardo 2026-07-28)**: la qualificazione è materia fra le due società e i rispettivi legali, non una domanda al referente tecnico |
| **Anagrafica storica riordinata** — il posto dove atterra, e come si ricollega alla persona | ingresso una-tantum → noi | Tabella separata `legacy_contacts`, **fuori** dall'elenco dei profili: un record storico non diventa un account e nessuno gli manda un «reimposta la password». Quando quella persona si registra da sé, il collegamento avviene **da solo**, riconoscendola dall'indirizzo email, e i campi che ha lasciato vuoti vengono precompilati dal suo storico. Quello che scrive lei vince sempre | Nessuna riga caricata finché i prerequisiti della riga sopra non sono soddisfatti: a tabella vuota il comportamento è identico a oggi. **I consensi non si ereditano**: la riga precompila dati, il consenso resta quello raccolto alla registrazione. Se la persona cancella l'account sparisce anche la sua riga storica — sia quella che aveva collegato, sia quella rimasta scollegata **che porta la stessa email di contatto**. ⚠️ **Resta fuori** la riga che porta un indirizzo diverso da quello con cui si è registrata: per il database è un'altra persona, e non viene né collegata né cancellata. **Residuo RISTRETTO il 2026-07-26 (migration 0013)**: se la persona porta la mail del suo account su quell'indirizzo, ora la mail di contatto lo segue — quindi la cancellazione la raggiunge. Prima no: la chiave dell'oblio restava a un indirizzo abbandonato e la riga sopravviveva (provato end-to-end, T7 della suite). Resta scoperto solo chi quell'indirizzo non lo adotta mai. Si chiude del tutto con la passata di ricollegamento, da progettare insieme al caricamento | Da definire con la consulente insieme all'origine dei dati (riga sopra) | `[V]` sul meccanismo (esiste e ha 20 prove automatiche, incluse due sulla cancellazione), `[A]` sulla base giuridica |
| ⚠️ **Vincolo di ordine, non tecnico ma operativo** | — | — | **Corretto DUE volte il 2026-07-27, e la seconda ha smontato la prima.** ① Qui si leggeva «il collegamento scatta solo quando il profilo nasce»: falso. ② Poi «scatta ogni volta che la persona salva il proprio profilo»: **troppo ottimista**. La verità, verificata sul codice: nell'app ci sono **due** modi di salvare, e solo uno collega — il **completamento** del profilo collega, la **modifica** dei dati no (sono due strade tecniche diverse). E la schermata di completamento viene proposta **solo a chi ha il profilo incompleto**. → Chi si è registrato prima del caricamento e ha il profilo **completo** non si ricollegherà mai da solo, per quanti dati modifichi: ed è la maggioranza, perché chi si iscrive dall'app deve compilare tutto. **Quindi il vincolo resta forte: il riordino va fatto prima che comincino le registrazioni vere** — prima del primo rilascio, dopo l'informativa. La passata di ricollegamento una-tantum oggi non esiste e servirebbe a tutti costoro. Da non confondere con il **pre-caricamento di anagrafiche verso il partner** (§5.1): quello è il verso opposto, noi → loro, ed è escluso | — | `[V]` (provato: il collegamento sul completamento, e il **non**-collegamento sulla modifica) |
| Che il codice arrivi davvero alla loro applicazione | noi → Let's Donation | — | **Verificato** che lo mandiamo e che il reindirizzamento dal dominio vecchio conserva i parametri. Che il valore raggiunga la loro applicazione **non è dimostrato** (un HTTP 200 prova solo che non viene rifiutato) `[A]`. In ogni caso **nessuno lo raccoglie** | — | `[A]` |
| Che il codice torni sul record della donazione Donorbox | Donorbox → noi | Loro API | **Non verificato.** Serve una donazione reale da 1 € | — | `[A]` |
| Flag «avviso già mostrato» | resta sul dispositivo | Memoria locale, chiave separata per utente | Non attraversa nessun confine | — | `[V]` |

### 3.2 Cosa passerà con l'accesso federato — che **non è attivo**, né da noi né da loro

| Dato | Direzione | Meccanismo | Condizione | Qualif. |
|---|---|---|---|---|
| Identificativo opaco e stabile (`sub`) | noi → LD | Informazione standard nel token di identità e sull'endpoint delle informazioni utente | Quando la persona tocca «Entra con Rise Against Hunger» e approva sulla **nostra** pagina. È la chiave con cui il loro sistema la riconosce agli accessi successivi | `[V]` sul contenuto, `[A]` sul flusso: non esiste |
| Nome completo, stringa unica (`name`) | noi → LD | idem | Al login. **Non arriva mai vuoto** (corretto 2026-07-29: qui si diceva «se disponibile»): quando la chiave manca, il server ripiega sull'**indirizzo email** dell'account — quindi il rischio non è l'assenza, è un'email finita dove va il nome. Nome e cognome separati non esistono nello standard: li dividono loro | idem |
| Email dell'account (`email`) | noi → LD | idem | Al login. Con «Nascondi la mia email» è un alias `@privaterelay.appleid.com` che **inoltra** alla casella vera. L'email di contatto raccolta in app **non è trasmissibile come informazione a parte** — ma **dal 2026-07-25 la strada è un'altra** (F-EMAIL.23): l'indirizzo vero, una volta verificato, **diventa l'email dell'account**, quindi è questo campo a portarlo. Fino ad allora parte l'alias | idem |
| Indicatore «email verificata» (`email_verified`) | noi → LD | idem | Al login. Va chiesto che il loro sistema non lo pretenda sull'alias Apple | `[V]` sul dato, `[A]` sul loro comportamento |
| **Gettone tecnico con i pieni poteri dell'utente** | noi → LD | Scambio standard del protocollo allo sportello dei token | **Inevitabile per costruzione**: non è «glielo diamo o no». Gli scope non lo limitano lato dati; l'autorizzazione dipende interamente dalle nostre regole di riga | `[V]` |
| Account creato dal loro sistema al primo accesso | effetto lato loro | Creazione al volo | Che il loro negozio accetti un alias Apple per creare l'account **è un assunto** da confermare | `[A]` |
| Informazioni personalizzate nel token (codice di provenienza, email reale) | **nessuna** | Escluso: verificato su documentazione ufficiale che le informazioni personalizzate finiscono solo nel gettone di accesso, mai nel token di identità né sull'endpoint utente — quindi non raggiungerebbero il loro sistema | Mai | `[V]` |
| Campo sorgente catturato all'atterraggio, stampato sull'ordine, presente nell'export | LD → noi | Campo sull'ordine + export o webhook | **Richiesta**, non esistente | `[A]` |
| Indicatore «persona entrata dal nostro accesso» nell'export | LD → noi | Campo nell'export | **Richiesta.** Per chi entra dal nostro accesso vale più del codice nell'indirizzo: l'attribuzione è certa per costruzione | `[A]` |
| Export (o webhook) delle donazioni ai progetti sul nostro spazio | LD → noi | Export o webhook | **Richiesta**, conseguenza obbligata della convivenza dei due canali di donazione | `[A]` |
| Propagazione di una richiesta di cancellazione | noi → LD | **Meccanismo ignoto.** Da noi la struttura dati è pronta (una lapide senza vincoli, che sopravvive alla cancellazione e conserva il minimo: quale codice, presso chi) ma **nessun programma la legge** | Alla cancellazione dell'account | `[V]` che manca |
| Dati chiesti dall'iscrizione a un evento | noi ↔ LD | Da chiarire | Quando ci saranno eventi: oggi zero | `[A]` |
| Elenchi di persone in blocco **fra le due organizzazioni**, pre-creazione di account sullo spazio dell'altro, credenziali sui database | **nessuna** | Esclusi in modo esplicito, in entrambe le direzioni | Mai | `[V]` |
| Riordino delle anagrafiche storiche **dentro il nostro archivio** | interno | Caricamento manuale deciso da Riccardo (2026-07-25) | Non è un trasferimento fra le due società e **non crea account**: crea schede, e l'account nasce quando è la persona a entrare. Origine chiarita il 2026-07-26: export **self-service dal nostro back office** sul loro tenant, non una consegna del partner. Ma «da dove lo scarico» non risponde a «di chi è»: se il contratto qualifica Let's Donation come **titolare autonomo** su quei dati, il caricamento resta un passaggio fra titolari (con Art. 14 a carico nostro); se è **responsabile ex art. 28**, è un nostro archivio che rientra a casa. Nessun atto scritto risulta → **fuori dal brief (decisione Riccardo 2026-07-28)**: la qualificazione è materia fra le due società e i rispettivi legali, non una domanda al referente tecnico | `[A]` sulla qualificazione, `[V]` sull'origine |

---

## 4. Come funziona, raccontato a voce

> **Nulla di quanto segue è attivo oggi: è come funzionerà quando entrambe le parti l'avranno
> costruito.** La nostra pagina web non esiste, il nostro server di accesso non è accesso, il loro
> client non c'è.

1. La persona sta su una pagina del nostro spazio dentro il loro sito — una gift card, un progetto, un
   evento — e toccherà **«Entra con Rise Against Hunger»**.
2. **Il loro sito la manderà sulla nostra pagina web.** Non sull'app: da un computer fisso l'app non
   c'è, e un collegamento che tenta di aprirla sarebbe un vicolo cieco.
3. **Sulla nostra pagina succederà una cosa sola**, a seconda dei casi: se ha già un account nostro
   accede; se non l'ha **lo crea da noi** — nome, data di nascita per la maggiore età, consenso
   all'informativa, e accesso con **email e password** (dal 26/07/2026 è l'unico ingresso: Apple e
   Google sono stati rimossi — vedi §0). È come «Accedi con Google»: chi non ha
   l'account Google lo crea su Google, non sul sito che sta visitando.
4. **Le mostreremo cosa stiamo per condividere e le chiederemo di approvare.** Se rifiuta, torna sul
   loro sito con un errore leggibile e non parte nulla.
5. **Tornerà sul loro sito con un codice usa-e-getta**, che da solo non contiene nessun dato personale.
6. **Il loro sistema scambierà quel codice con il nostro, da server a server**, con una parola d'ordine
   consegnata solo a loro. In risposta riceverà le **quattro informazioni** che ci interessano — un
   identificativo opaco, il nome, l'email dell'account e l'indicatore che l'email è verificata — **e,
   per come è fatto il protocollo, anche un gettone tecnico con i pieni poteri dell'utente, che non si
   può togliere**: su quello chiediamo l'impegno scritto a non usarlo.
7. **Al primo accesso il loro sistema creerà l'utente** e lo **aggancerà all'identificativo opaco**,
   non all'email. Dal secondo accesso lo riconosce da quello.
8. **La persona sarà dentro il loro sito, autenticata, senza aver compilato una seconda registrazione.**

**Cinque precisazioni che vanno dette, perché sono vere.**

- **La sessione dell'app non è la sessione del browser.** Se parte dall'app, il browser esterno non la
  conosce: il primo accesso sulla pagina web va fatto lì. Dopo resta.
- **Chi ha già un account fatto col loro modulo** e poi entra dal nostro accesso, se nessuno collega i
  due, si ritrova **due account**. Per questo chiediamo il collegamento sull'email. Per chi usa
  «Nascondi la mia email» nemmeno quello basta, perché l'alias non combacia: quel caso resta fuori.
- **Chi apre il link dentro il browser interno di un social** (Instagram, Facebook): ⚠️ **residuo
  STORICO, non più attivo dal 26/07/2026.** Il problema era che Google rifiuta i browser incorporati;
  con email e password come unico ingresso quel rifiuto non ha più soggetto. Resta valido solo se un
  giorno i social rientrassero: allora la nostra pagina dovrà riconoscere quel contesto e offrire
  «apri nel browser».
- **Chi ha meno di diciotto anni.** Il limite è nostro, scritto come vincolo nel nostro database; il
  loro modulo non chiede l'età. Con un solo ingresso il limite si estende anche a gift card ed eventi
  sul loro spazio, dove oggi un minorenne passerebbe. Va detto a loro (tocca la loro conversione) e
  deciso da noi: lo accettiamo, o prevediamo un percorso col consenso di chi ha la responsabilità
  genitoriale?
- **Tre campi del loro modulo non ce li abbiamo** (nickname, scelta di visibilità pubblica, adesione a
  community e classifiche) e la visibilità è obbligatoria da loro: qualcuno deve chiederla al primo
  ingresso. Vedi §2.1.

### Il canale dell'attribuzione — un'altra cosa, non un accesso

Quando l'app apre un link verso il loro sito ci attacca **un codice opaco**, uno per persona. Serve a
una cosa sola: **ricondurre a posteriori un ordine alla persona giusta**. Non è un accesso, non apre
nessuna sessione; nel caso peggiore — se finisse in un registro o in un link condiviso — il danno
massimo è una donazione attribuita alla persona sbagliata. Mai un furto d'account. È questa proprietà
che ha reso superflua l'idea di collegare i due database.

Il dettaglio tecnico che va detto ai loro sviluppatori, perché senza quello il lavoro si farebbe nel
punto sbagliato: **le pagine dove atterriamo sono pagine-categoria**, a due o tre clic dall'acquisto, e
il parametro non sopravvive al percorso — tanto meno al giro dell'accesso, che esce dal sito e rientra
su un altro indirizzo. Va **catturato all'arrivo, tenuto in sessione, stampato sull'ordine**.

Due limiti da dichiarare: sullo **shop col cashback** da loro non nasce nessun ordine (l'acquisto è su
un negozio terzo e la conferma torna dalla rete di affiliazione con settimane di ritardo, tipicamente
30-90 giorni `[A]`), quindi lì l'aggancio va cercato sull'**attivazione del cashback**; e per una
**newsletter di massa o un codice a barre stampato** un codice per-persona è impossibile: si scende a un
codice di campagna.

*Nota interna:* il parametro che l'app invia si chiama `rise_ref`. Il brief prometteva `utm_campaign`:
se loro confermano di lavorare con i parametri di campagna standard, è **una riga di codice nostra** da
cambiare, e va cambiata.

---

## 5. Tutte le opzioni valutate, con l'esito e il motivo

### 5.1 Come fa la persona a non registrarsi due volte?

**Collegare i due database — noi leggiamo il loro. → SCARTATA.**
Quattro motivi che si sommano. **Non risolve il problema**: leggere un database è un travaso di dati,
non un accesso — la persona si registrerebbe due volte come oggi. La loro installazione è condivisa fra
molti enti, quindi dovrebbero costruire e mantenere per sempre una vista filtrata solo per noi, gratis.
Ci legherebbe alla forma fisica del loro schema: il giorno che rinominano una colonna l'integrazione si
rompe in produzione senza preavviso, e nessun contratto glielo vieta. E un filtro sbagliato o un
difetto di isolamento loro ci farebbe leggere donatori di altre organizzazioni, con trattamento senza
base giuridica e notifica di violazione a nostro carico. *Deciso da Riccardo, su analisi con evidenza.*

**Il contrario — loro leggono il nostro Supabase. → SCARTATA, più netta.**
Non risolve la doppia registrazione e non risolve il ritorno dei dati (siamo noi ad avere bisogno dei
loro). Un ruolo esterno sul nostro database vivrebbe **fuori** dalle regole di riga pensate per i token
degli utenti, e una vista mal costruita esporrebbe tutto. Giuridicamente li renderebbe responsabili del
trattamento, con obbligo di accordo che non esiste: se rubassero loro la credenziale, la violazione
riguarderebbe dati di cui siamo titolari noi, e le nostre 72 ore partirebbero da quando ce lo dicono
loro. *Deciso da Riccardo, su analisi con evidenza.*

**Lo strumento che collega database esterni come tabelle locali. → SCARTATA — terza volta che torna.**
Strumento reale e disponibile, ma la documentazione ufficiale dice la cosa peggiore: quel meccanismo
**non applica le regole di riga**. Più multi-inquilino, motore non nativamente supportato, e soprattutto
**non è un accesso**, quindi non toglie la seconda registrazione. *Analisi con evidenza alla fonte
(documentazione ufficiale); idea riportata da Riccardo per la terza volta, risposta nostra archiviata —
nessuna ratifica scritta.*

**Mandargli le anagrafiche in blocco (file, pre-caricamento degli account). → SCARTATA.**
**Account non è sessione**: anche creando l'account per conto della persona, quando arriva non è
autenticata, quindi il doppio accesso resta. Su una piattaforma condivisa l'email è unica per
installazione, quindi si generano collisioni fra inquilini. E la pre-creazione in blocco è la posizione
più esposta sul piano privacy: si creerebbero «account per conto di altri». Corollario: se il
meccanismo che usano con Zucchetti fosse un pre-caricamento di anagrafiche, **non ci serve**.
*Analisi con evidenza, 24/07.*

**Acquisto come ospite, senza account, su gift card ed eventi. → SCARTATA da Riccardo.**
Tecnicamente era la strada più leggera, con argomenti forti: il motore del loro negozio la supporta
nativamente, l'account forzato causa fra il 26 e il 35% degli abbandoni, e il codice di provenienza
funziona anche per l'ospite. Scartata per una ragione di dominio, non tecnica: **servono i dati
completi di tutti**, soprattutto per gli eventi. La scelta ha un **costo noto**, ed è giusto che sia
registrato. *Deciso da Riccardo, 24/07.*

**Accesso federato, noi fornitore di identità e loro consumatore. → SCELTA.**
Dà un account persistente e un ingresso in un tocco, fa nascere ogni persona **da noi** — che è la
priorità dell'associazione: siamo noi il titolare del rapporto con chi ci sostiene, e informativa e
consensi si raccolgono da noi — e la chiave di aggancio è robusta. *Scelta di Riccardo, con richiamo a
un accordo verbale in chiamata; base tecnica verificata su documentazione ufficiale.*

**L'accesso nel verso opposto — «Accedi con Let's Donation». → APERTA, solo in quel verso.**
È l'unico verso in cui non chiediamo loro di costruire una porta pubblica che crea o recupera utenti su
account condivisi fra inquilini. Il costo però lo paghiamo noi: **l'anagrafica autoritativa di chi
compra non sarebbe più la nostra**. Da valutare, non da promettere. *Non deciso.*

**Un solo ingresso sul nostro spazio: il loro modulo non esposto come strada alternativa. → SCELTA
nostra, da confermare a loro.**
Due ragioni, **nessuna tecnica**. Sui dati: le anagrafiche doppie divergono subito — cambia indirizzo in
una e non nell'altra, revoca un consenso da noi e da loro resta attivo, chiede la cancellazione e non
possiamo darle seguito su un'anagrafica che non governiamo. Sulla persona: chi arriva non sa che
esistono due archivi, vede due modi di entrare e ne sceglie uno a caso; se sbaglia si ritrova un
secondo account senza storico e senza consensi, e non capisce perché — per una persona poco pratica è
il punto in cui abbandona. La distinzione fra il loro sistema e il nostro è nostra, non sua: non deve
vederla. Argomento di fattibilità pronto: **è una scelta del modello grafico del nostro spazio, non del
loro sistema di accesso** — la struttura esiste già, dato che «Non sei ancora registrato? Clicca qui» è
a sua volta un collegamento secondario sotto il modulo. *Deciso da Riccardo; dichiarato già concordato
in chiamata con Michele.*

**Come ci accorgiamo se torna indietro.** Il patto vive nel modello grafico del nostro spazio, su una
piattaforma che loro aggiornano per tutti: un aggiornamento può rimettere il loro modulo o far sparire
il nostro pulsante **senza avvisarci**, e lo scopriremmo dai conti sbagliati. È lo stesso rischio che
usiamo come argomento decisivo per scartare la lettura del loro database, e qui va coperto: un
controllo automatico periodico che apra la pagina di accesso del nostro spazio e verifichi che ci sia il
nostro pulsante e non il loro modulo; e nell'accordo, l'impegno ad avvisarci prima di modifiche al
nostro spazio. → richiesta 21 in §9.3.

**Ammorbidire la richiesta a «percorso principale, non unico», usando come argomento un'eventuale
indisponibilità dei nostri sistemi. → SCARTATA e RITIRATA: era un errore.**
Il patto era già stato accettato in chiamata, e un «lo vedo difficile» non annulla un accordo. Ma il
vero problema è l'argomento: dire a un terzo «il vostro modulo è la nostra via di fuga» gli **regala la
giustificazione** per tenersi una registrazione parallela nel suo archivio — esattamente il doppio
archivio che vogliamo eliminare — e ci indebolisce. La continuità di servizio si gestisce in casa:
monitoraggio del nostro punto di accesso e riesposizione temporanea del percorso nativo **su nostra
richiesta**, con procedura scritta (chi la attiva, in quanto tempo). *Correzione di Riccardo, 25/07,
registrata come errore mio.*

> ⚠️ **Contraddizione da chiudere PRIMA di mandare qualsiasi cosa.** Il piano canonico contiene ancora
> la contingenza in tre punti, e in **uno la instrada nell'accordo con loro** («la reversibilità di
> questo pezzo è lato LD, da concordare nell'accordo»): cioè la via di fuga è già indirizzata al tavolo
> del partner, che è ciò che la decisione vincolante vieta. Va riscritta come contingenza **interna** e
> va cancellato ogni riferimento al ripiego dal materiale destinato all'accordo e ai loro tecnici.

**Chiedere loro di rimuovere il modulo dalla piattaforma. → SCARTATA, non ottenibile.**
Hanno già risposto che non è togliibile, e la piattaforma è condivisa: nessuna personalizzazione per noi
che non valga per tutti. La richiesta corretta riguarda **solo il nostro spazio**. *Vincolo esterno,
risposta del 24/07.*

**Riusare il meccanismo che già usano con Zucchetti. → APERTA, ed è la prima domanda.**
Se dal portale Zucchetti i dipendenti «arrivano già registrati» e quel meccanismo è un accesso
federato, **hanno già la cosa che stiamo chiedendo**: la richiesta smette di essere «costruite
qualcosa» e diventa «rifacciamo con noi quello che fate già», l'obiezione «lo vedo difficile» cade da
sé, e ci risparmia la parte più pesante. Livello di certezza: l'ha detto Michele **a voce** e la
ricostruzione è di Riccardo `[A]`; sullo spazio pubblico di Zucchetti si vede solo accesso con email e
password e, in registrazione, un campo «Gruppo Aziendale», il che suggerisce una **pre-associazione**
dell'azienda più che un'autenticazione `[A]`. Le due cose possono convivere, quindi si **chiede**, non
si afferma. E non va attribuito a Let's Donation ciò che è configurazione della piattaforma welfare di
Zucchetti. *Rilettura di Riccardo, 25/07; verifica indipendente sulle pagine pubbliche il 25/07.*

### 5.2 Su cosa agganciamo le due identità?

**Sull'email. → SCARTATA.** Chi usa «Nascondi la mia email» ha un alias **diverso per ogni servizio**:
come chiave è inaffidabile e il confronto fallisce **in silenzio**, il modo peggiore di sbagliare.
*Analisi con evidenza (forum sviluppatori Apple).*

**Sull'identificativo opaco e stabile del protocollo. → SCELTA.** È stabile e non contiene attributi
della persona — ma la individua in modo permanente, quindi è uno **pseudonimo**, non un dato anonimo
(cons. 26; stessa qualifica del `rise_ref`, memoria `integrazione-identita-partner`). Nota di
linguaggio, dopo l'errore del 28/07: «opaco» significa illeggibile da chi non ha la nostra tabella,
**non** «non riconducibile a una persona» — non usare l'uno per l'altro nei documenti verso terzi.
Ma la domanda a loro non va posta come «potete usare l'identificativo?», che si presta a un no
generico: va posta come **«potete mappare quell'identificativo sul nome utente di Joomla, così che
l'aggancio agli accessi successivi non dipenda dall'email?»**, perché la mappatura dei campi è cosa che
la loro estensione sa già fare. Dettaglio utile per non farsi rispondere con un link alla
documentazione generica: **quel dettaglio specifico non è documentato pubblicamente**, e conviene dirlo.

**Collegare l'account nativo preesistente sull'email. → DA CHIEDERE A LORO.** È la prassi degli accessi
social e copre tutti i casi tranne uno: chi ha un account nativo **e** usa l'alias Apple non è
collegabile né sull'email né sull'identificativo — restano due account. Si risolve solo se hanno un
«collega il mio account» nel profilo utente. Richiesta **aggiunta di recente**, perché il documento
prometteva il ritrovamento dello storico senza avere il meccanismo per farlo.

**Infilare informazioni personalizzate nel token. → SCARTATA, e ha riscritto il piano.** Verificato su
documentazione ufficiale che finiscono **solo** nel gettone di accesso, mai nel token di identità né
sull'endpoint utente — che è ciò che l'estensione di Joomla legge. Doppio motivo per non costruire quel
pezzo: non serve, e il gettone di accesso non va consegnato a un terzo per leggere dati. Conseguenze: il
codice di provenienza **esce dal login** e resta sul canale dell'attribuzione; l'email reale dietro
l'alias non è trasmissibile **come informazione a parte** (l'alias inoltra, quindi la posta arriva).
*Analisi con evidenza alla fonte, 24/07.* **Aggiornamento 25/07**: quel limite non è più definitivo —
la via è far diventare l'indirizzo vero, verificato, **l'email dell'account** (F-EMAIL.23), così è il
campo standard a portarlo. Resta vero che non si può infilare in un'informazione personalizzata.

**Nome come stringa unica invece di nome e cognome separati. → SCELTA (è la forma standard).**
Trappola trovata **leggendo il codice sorgente del server di autenticazione, non la documentazione**:
quel campo viene letto da **una sola chiave** dei metadati e, se la chiave manca, non arriva vuoto —
**ci finisce l'email dell'account**. Per chi entra con Apple nascondendo la mail, il partner avrebbe
visto come nome il suo alias `@privaterelay.appleid.com`. Chiuso scrivendo noi quella chiave alla
registrazione, al completamento del profilo dopo l'accesso social e a ogni correzione del nome.
*Analisi con evidenza, chiusa il 25/07.*

### 5.3 Come colleghiamo un ordine, o una donazione, a chi viene dall'app?

**Una colonna nuova sull'anagrafica del loro sistema. → SCARTATA.** Quella tabella è condivisa fra
tutti gli enti: un concetto nostro in uno schema globale crea un precedente che non vogliono. E
l'oggetto giusto è un altro: **ciò che ci serve correlare sono transazioni, non persone**.

**Il campo sorgente/campagna già esistente sull'ordine, valorizzabile dall'indirizzo e presente
nell'export. → SCELTA come forma della richiesta.** Prima di chiederlo conviene guardare nel pannello:
se c'è, la richiesta minima è già soddisfatta. *(La stima di cosa comporti per loro la lasciamo a loro:
una stima scritta da noi ci toglie credibilità.)*

**«Salvate il parametro sull'ordine», detto così. → SCARTATA perché ingenua.** Le destinazioni sono
pagine-categoria a due o tre clic dall'acquisto: al momento dell'ordine il parametro non c'è più. E il
giro dell'accesso esce dal sito e rientra su un altro indirizzo. Formulazione corretta: **catturare
all'arrivo, tenere in sessione, stampare sull'ordine, esporre nell'export**.

**La stessa formula per lo shop col cashback. → SCARTATA e riformulata.** Da loro **non nasce nessun
ordine**: la persona attiva il cashback e compra su un negozio terzo, e il valore torna dalla rete di
affiliazione con settimane di ritardo. La richiesta va spostata sull'**evento di attivazione** e deve
reggere fino alla conferma differita.

**Un indicatore «persona entrata dal nostro accesso» nell'export. → DA CHIEDERE, e vale più di tutto
il resto.** Se il loro sistema crea l'account agganciato al nostro identificativo, **ogni ordine di
quella persona è nostro per costruzione**: l'attribuzione diventa certa senza nessun codice
nell'indirizzo, e rende superflue tutte le fragilità di quel canale. Il codice resta necessario solo per
chi non passa dall'accesso e per le campagne.

**Attribuzione per-persona su newsletter di massa e codici stampati. → IMPOSSIBILE.** Un invio di massa
ha un solo indirizzo, una stampa è uguale per tutti. Si scende a un codice di campagna.

**Un webhook «ordine completato». → DA CHIEDERE.** Nella forma: firmato con un segreto condiviso, sul
corpo grezzo, con un identificativo dell'evento per non contare due volte. *In una nostra fonte si
legge che il loro referente tecnico avrebbe detto di accettarla così com'è: non è riconducibile a
nessuna comunicazione registrata `[A]` — non ci appoggiamo sopra e non si usa come leva in chiamata.*

**Export delle donazioni ai progetti. → DA CHIEDERE, conseguenza obbligata di una decisione.** Qui una
premessa nostra era **sbagliata** ed è stata corretta alla fonte: si credeva «Donorbox per il denaro,
Let's Donation per acquisti ed eventi», mentre **su Let's Donation si dona in denaro davvero** (47
donazioni, 259,10 € su un solo progetto, verificato sulle pagine pubbliche). Riccardo ha deciso che i
due canali **convivono** — «è una cosa in più che l'utente può scegliere» — e la conseguenza obbligata è
che senza export quel denaro **resta invisibile a noi**. *Decisione di Riccardo, 25/07.*

**Leggere subito le donazioni Donorbox nel nostro database. → RINVIATA dietro un cancello numerico.**
Costa circa sei giorni più un abbonamento (~17 $/mese `[A]`). Si costruisce solo se il tracciamento
mostra almeno un centinaio di donazioni al mese dall'app; sotto quella soglia un foglio scaricato a
mano ogni tre mesi è la scelta corretta, e un webhook che nessuno guarda per otto mesi è peggio di
nessun webhook. Il numero che decide non esiste ancora e va misurato **dopo** l'informativa, perché è
tracciamento di comportamento. *Decisione vincolante di Riccardo.*

**Far entrare nel nostro archivio le donazioni prive del codice di provenienza. → SCARTATA.** Sono
persone che non hanno mai visto la nostra informativa: prenderle dentro farebbe scattare l'obbligo di
informarle a posteriori. Prendendo solo ciò che ha il codice il problema si elimina alla radice, e con
esso il rischio di costruire per sbaglio un archivio di contatti. Delle altre si conta solo il totale.

### 5.4 Dove nasce l'account, e quanto pesa nascere?

**Registrazione ospitata da noi, non sul loro modulo. → SCELTA.** Siamo noi il titolare del rapporto, e
informativa e consensi si raccolgono da noi. Errore trovato in bozza: un collegamento secondario «Non
hai un account? Registrati con email» che puntava al **loro** modulo avrebbe fatto nascere la persona
nella loro anagrafica, con i loro consensi. Corretto in **un solo pulsante**: decide la nostra pagina.
*Precisazione vincolante di Riccardo, 25/07.*

**Profilo completo obbligatorio alla nascita (undici voci). → SCARTATA.** Con un solo ingresso il
nostro modulo diventa **il solo cancello** anche per chi voleva soltanto una gift card: undici voci
contro le poche del loro modulo sono l'imbuto che ucciderebbe la richiesta stessa che stiamo facendo.
Riccardo: «servono tutti quei dati, prima o poi» → **profilo minimo alla nascita più completamento
obbligatorio differito**. Fraintendimento da evitare: *facoltativo alla nascita non vuol dire
facoltativo per sempre* — senza un meccanismo che chiuda il profilo alla prima occasione utile, «prima
o poi» diventa «mai». *Deciso da Riccardo, 25/07.*

**Rendere facoltativi anche cognome, data di nascita, paese, data del consenso. → SCARTATA, per quattro
motivi diversi.** Il cognome no, perché il nome che consegniamo ai partner nasce da lì. La data di
nascita no, perché è la prova dei 18 anni — e c'è una **trappola verificata**: è anche il segnale che fa
scattare la creazione del profilo, quindi togliendola dal modulo il profilo **non nascerebbe affatto,
in silenzio**. Il paese no, perché viene sempre valorizzato in automatico. La data del consenso no,
perché senza consenso il profilo non deve nascere. Facoltativi solo telefono e città.

**Alleggerire il modulo prima di applicare la modifica al database di produzione. → SCARTATA: c'è un
ordine obbligato.** La modifica esiste nel codice ma **non è applicata al database vero** — verificato
il 25/07: il registro delle migrazioni del progetto live **elenca** solo la 0008 e la 0009 `[V]`, ma le
precedenti (0001-0007) **sono applicate** — sono state eseguite fuori dal registro, e infatti l'app
funziona. Il fatto verificato allora era che **la 0010 non era applicata** `[V, al 25/07]`. Il comando che
rimuove un vincolo è bloccato dalla nostra protezione e va eseguito a mano dal pannello. Se si
alleggerisce il modulo prima, va in produzione una registrazione che **viola un vincolo e fallisce**.

> ✅ **Superato il 26/07/2026**: la modifica **è stata applicata** al database di produzione
> (registro `20260726090451`; ricontrollato sullo schema vivo il 29/07 — telefono, città e provincia
> risultano facoltativi). L'ordine obbligato descritto qui sopra è stato rispettato ed è quello che
> ha portato all'apply: il blocco resta come storia della decisione, non come stato attuale.
> Lo stato attuale è la riga «FATTE il 26/07/2026» più avanti in questo stesso documento.

**Ospitare la pagina di accesso su `riseagainsthunger.org`. → SCARTATA.** Quel dominio è di Rise
Against Hunger USA. Scelta: un indirizzo gratuito su Vercel, spostabile in seguito. *Verificato il
25/07 che i due indirizzi italiani dell'associazione non esistono (nessuna risposta dai nomi di
dominio), quindi un dominio proprio non c'è: la voce «da confermare» altrove è superata.*

### 5.5 Consensi, informativa, diritti delle persone

**Trasmettere i dati precompilati «perché la persona ha fatto l'accesso». → SCARTATA, in tre passaggi.**
Prima bastava la sessione: chi entra con Apple o Google e non completa il profilo non ha prova del
consenso, ma la sua email finiva comunque a un terzo. Poi «se ha il profilo va bene»: vale solo alla
nascita del profilo, quindi chi non aveva riaccettato un'informativa cambiata continuava a trasmettere.
Poi il punto più sottile: «devo bloccare la schermata?» e «posso trasmettere a un terzo?» **non sono la
stessa domanda** — la prima risponde «no» anche a chi non ha mai accettato nulla, se il cambiamento non
è sostanziale. Regola finale: si trasmette solo con **presenza positiva** del consenso alla versione
corrente; «non lo so ancora» non basta. Principio registrato: *l'assenza di un obbligo di
ri-accettazione non è un consenso.* *Cinque giri di revisione avversariale, 25/07.*

**Registrare la schermata informativa pre-uscita come un consenso. → SCARTATA.** È trasparenza, non
consenso: registrarla creerebbe un consenso non revocabile e condizionato al servizio — invalido — e
sporcherebbe il registro dei consensi veri, che è un archivio a sola aggiunta.

**Estendere quella schermata all'uscita verso Donorbox. → APERTA, decide Riccardo.** La situazione è
l'opposto di come dovrebbe essere: la schermata si mostra **solo** sul ramo Let's Donation, dove viaggia
un codice; l'uscita verso Donorbox, che trasmette nome, cognome ed email, **va dritta al browser senza
mostrare nulla**. Nel frattempo l'informativa deve dire il vero: la schermata è annunciata solo per
Let's Donation.

**Propagare la cancellazione con una lapide senza vincoli e un solo innesco. → SCELTA per la struttura,
PROCESSO MANCANTE.** La lapide non ha vincoli perché deve **sopravvivere** alla cancellazione e
conservare il minimo per poter chiedere la rimozione al partner — quale codice, presso chi — senza
sapere più di chi era. L'innesco è uno solo, sul profilo, perché così copre **entrambi** i percorsi di
cancellazione: metterlo in uno solo avrebbe lasciato metà delle cancellazioni senza propagazione, senza
accorgersene. Verificato in due scenari di privilegi opposti, quattordici controlli ciascuno. **Ma
nessun programma legge quella tabella**, e c'è un problema a monte, in §7.

**Inquadramento: due titolari autonomi con un accordo di condivisione dati. → SCELTA, in conferma
legale.** Non contitolarità, perché esporrebbe l'associazione a **responsabilità solidale** su
trattamenti che riguardano donatori di altre organizzazioni, che non vediamo e non controlliamo. Non
responsabile del trattamento, perché Let's Donation decide da sé finalità e mezzi. La liceità della
trasmissione poggia sul clic della persona. Nota: la loro informativa **ci dichiara unilateralmente**
titolari autonomi — è una dichiarazione loro, non un accordo. Va confermato dalla consulente, perché
**cambia il documento da chiedere**: quindi l'accordo si nomina a loro come *proposta*, non come cosa
già decisa.

**Informativa: pubblicarla dopo e attivare intanto. → SCARTATA. È un cancello.** Stato reale: i due
file nel nostro progetto sono **già riscritti** (PR #57), con zero occorrenze delle frasi false; quella
che le persone leggono davvero — la pagina sul sito — **dichiara ancora il falso** (dice che l'app non
raccoglie dati personali e che i diritti non sono applicabili, mentre autenticazione, anagrafica e
registro dei consensi sono nel codice). **Quattro bersagli, non tre**: i due file, la pagina sul sito, e
**una riga nuova nella tabella delle versioni dell'informativa sul database**. Vincolo di rilascio: quella
riga e l'alzata del numero di versione dentro l'app devono uscire **nella stessa release** — se si
pubblica sul database senza alzare il numero nell'app, ogni nuovo iscritto finisce sulla schermata
«riaccetta l'informativa» e perde la precompilazione.

**Mandare al legale tutti i punti in dubbio. → SCARTATA: fatto un triage.** Dei dieci punti evidenziati,
sei si chiudono senza parere (quattro sono dati da recuperare, due decisioni già prese da scrivere). Al
legale vanno **quattro domande e una conferma**: come formulare i trasferimenti fuori dall'Unione e
quale garanzia citare per ciascun fornitore statunitense; quanto conservare il registro dei consensi
dopo la chiusura dell'account (l'ipotesi di dieci anni è nostra e non è motivata); se sia dovuta la
nomina di un responsabile della protezione dei dati; **se il tracciamento per canale e l'attribuzione
degli ordini siano profilazione** (il nostro registro dei consensi prevede da sempre una finalità
«profilazione» che nessuna schermata raccoglie, e vogliamo contare le uscite per canale e ricondurre
ordini e donazioni alla singola persona: serve un consenso separato e una valutazione d'impatto, o
basta un legittimo interesse documentato? Da chiudere **prima** di accendere il tracciamento); più la
conferma dell'inquadramento con Let's Donation.

**I diritti diversi dalla cancellazione.** Le richieste delle persone (accesso, rettifica,
cancellazione, revoca) hanno **trenta giorni** per la risposta, e la cancellazione deve raggiungere
**tutte** le copie: il nostro database, Access e le copie di sicurezza. Due lacune concrete:

- **L'export dei propri dati è incompleto**: restituisce account, profilo e storico dei consensi, ma
  **non i codici di provenienza emessi né a quale partner sono andati**, che l'informativa dichiara fra
  i dati trattati `[V]`. Va esteso nella stessa release in cui l'informativa va online.
- **La revoca di un codice di provenienza è promessa e non esiste**: l'informativa dice alla persona che
  può chiederne l'annullamento, e nel programma la colonna che lo segnerebbe **non è usata da nessuna
  parte** (zero occorrenze) `[V]`. Serve: chi riceve la richiesta, come si annulla, e cosa si risponde
  se il codice è già uscito.

### 5.6 Che cancelli mettiamo dentro l'app?

**Chiudere l'app dietro un account, con un cancello all'avvio. → SCARTATA con evidenza, non per
prudenza.** **Perde donazioni** sull'unica strada dove il denaro passa senza registrazione: la
donazione da ospite funziona e l'uscita procede comunque, solo senza precompilazione — un cancello lì
non protegge nulla e costa donazioni non recuperabili, perché la persona non torna. **Duplica un
cancello che esiste già**: per le destinazioni Let's Donation serve un account loro, che con l'ingresso
unico nasce dal nostro accesso, quindi un cancello nostro prima sarebbe una seconda soglia in fila. E
**non serve al solo caso che lo richiederebbe** — l'iscrizione a un evento — che oggi ha zero flussi
attivi. *Analisi con evidenza, 25/07. Nella stessa stesura è stata corretta un'affermazione falsa:
«Donorbox è l'unico canale che incassa» — su Let's Donation si dona in denaro.*

**Profilo completo al momento dell'iscrizione a un evento. → SCELTA, da costruire quando servirà.** È
l'unico posto dove i dati completi servono davvero: senza, l'associazione ha un iscritto di cui non sa
nulla. Costa attrito nel momento peggiore, ed è accettato **solo lì**.

**Chiedere i dati mancanti «alla prima occasione utile». → SCELTA, ma il pezzo è costruito e non
collegato.** Il meccanismo che calcola cosa manca esiste; **la lista dei campi mancanti non ha nessun
consumatore fuori dai test**, e il richiamo è agganciato a una sola schermata: il profilo. Chi non apre
il profilo non incontra mai la richiesta. Regola generale che vale oltre questo lavoro: **un presidio si
giudica da quante persone lo attraversano, non da com'è scritto** — e con lo stesso difetto convivono
anche l'accesso e la riaccettazione dell'informativa, montati tutti e tre dentro la schermata del
profilo. Dove mettere il richiamo è una decisione di prodotto di Riccardo.

**Collegamenti diretti che aprono l'app da un link. → APERTI e oggi inesistenti.** Nel progetto non c'è
nessuna delle dichiarazioni necessarie: zero occorrenze, verificate. **Non basta un file sul dominio,
serve su entrambi i lati** — il file sul loro dominio **e** la dichiarazione dentro la nostra app, che
oggi manca. Finché mancano, un link non apre l'app: apre il browser. Da qui, e non da una preferenza,
segue che l'ingresso dal sito è una pagina web.

### 5.7 Come teniamo allineato l'Access interno?

**Collegare l'app direttamente ad Access. → IMPOSSIBILE.** Il sistema che pubblica il gestionale da
remoto pubblica l'**interfaccia**, non il dato: non c'è nessuna interfaccia di programmazione. Access è
un database a file, raggiungibile solo con driver locali da Windows, e non è esponibile in sicurezza su
internet trattandosi di dati di donatori.

**Access resta il master, e il flusso va dall'app verso Access. → SCELTA.** *Deciso da Riccardo,
23/06.* Da qui segue il vincolo che fa da spina dorsale: **il cloud non può scrivere dentro un file
Access locale**, quindi il programma di allineamento deve girare **sul server** dove Access vive.

**Trasferimento incrementale programmato sul server, con aggiornamento non duplicante. → SCELTA.**
*Scelta tecnica nostra*, sulla decisione di Riccardo qui sopra: trattandosi di dati personali serve
poter **aggiornare** (non solo aggiungere), serve **propagare le cancellazioni**, e serve un **registro**
delle operazioni. La chiave di aggiornamento è l'identificativo del profilo.

**La strada leggera dentro Access (tabelle collegate più aggiunta programmata). → SCARTATA.** Fragile, e
non gestisce né aggiornamenti né cancellazioni: essendo di fatto una sola aggiunta, non copre nessuno
dei tre requisiti.

**Uno strumento commerciale senza scrivere codice. → APERTA come riserva.** Tecnicamente valido; il
freno è che è a pagamento.

**Portare consensi e richieste di cancellazione dentro Access. → OBBLIGO, non opzione.** I consensi
devono arrivare **perché l'attività fatta dal gestionale li rispetti**, e la cancellazione deve
raggiungere **tutte** le copie. Oggi esiste il campo che segna la richiesta, **manca il processo** che
la propaga. «Tutto per sempre» è un rischio: la conservazione va definita.

**Ospitare noi tutto il backend sul server dell'associazione, per «tenere i dati in casa». →
SCARTATA.** L'app deve comunque raggiungere il database da internet, quindi significherebbe **esporre
su internet il server che contiene i dati dei donatori**, e prendersi in carico sicurezza, copie,
disponibilità e aggiornamenti. L'obiettivo vero — dati in Unione Europea — è già raggiunto col servizio
gestito in Germania. Osservazione decisiva: **la scelta del backend è indipendente dall'allineamento
verso Access** — qualunque database si usi, il programma sul server serve ugualmente.

**Costruire il programma di allineamento prima di avere lo schema reale. → SCARTATA di proposito.** La
parte di aggiornamento dipende dallo schema vero e dal dialetto di Access (che non ha un comando unico
di fusione: prima aggiornare, poi inserire) e non è collaudabile senza il file.

**Un flusso all'inverso, da Access verso il nostro database, che scriva i consensi. → NON nel perimetro,
ma trappola da segnare.** Da noi il consenso marketing è una **copia derivata** dal registro: un
aggiornamento della sola copia verrebbe **ricalcolato e ignorato**. Regola: **il consenso si scrive nel
registro, non nella copia.**

### 5.8 Scelte minori con conseguenze

- **Pagina di donazione ospitata da Donorbox invece del riquadro incorporato → SCELTA.** Verificata dal
  vivo il 24/07: riempie davvero il modulo coi dati precompilati e conserva il nostro codice
  nell'indirizzo, propagandolo ai riquadri interni dove la donazione è registrata.
- **Passare i dati attraverso la nostra pagina del sito che incorpora Donorbox → SCARTATA, per due
  motivi indipendenti.** Tecnico: quel riquadro ha un indirizzo fisso e i parametri della pagina che lo
  ospita non entrano — verificato leggendo l'intera pagina, e la documentazione di Donorbox dice che
  vanno sull'indirizzo di Donorbox. Privacy: su quella pagina ci sono **due strumenti di tracciamento di
  terzi** che leggono l'indirizzo — nome, cognome ed email nella riga di indirizzo finirebbero a due
  destinatari **non dichiarati nell'informativa**.
- **Configurazione modificabile a distanza per indirizzi e lista dei domini permessi.** Il canale esiste
  già ed è il meccanismo di aggiornamento a distanza dell'app, attivo. Regola: lista e indirizzi nello
  stesso rilascio, con controllo automatico — in sviluppo la lista è disattivata e un errore si vedrebbe
  solo in produzione. **Limite dichiarato**: chi ha una versione vecchia non riceve l'aggiornamento e
  resta coperto solo dai reindirizzamenti del partner, che vanno quindi mantenuti almeno dodici mesi.
- **Accendere ora la funzione di accesso federato del nostro fornitore → RINVIATA.** È in fase
  sperimentale da fine novembre 2025, la disponibilità generale è slittata, il prezzo futuro è ignoto,
  non c'è garanzia di servizio e sono possibili cambiamenti incompatibili. Mettere l'accesso di
  produzione di un'associazione su una funzione sperimentale è un rischio da accettare
  **esplicitamente**. Attenuante reale: oggi tutte le tabelle hanno zero righe.
- **Chiavi di firma simmetriche → SCARTATE, prerequisito rigido:** con quell'algoritmo il token di
  identità **non si genera**. Vanno migrate ad asimmetriche prima di ogni altra cosa, e la migrazione è
  un'operazione sull'autenticazione di produzione.
- **Limitare i poteri del gettone tramite gli scope → NON FUNZIONA.** Gli scope non limitano l'accesso
  ai dati: l'autorizzazione dipende dalle regole di riga. Restano: verifica riga per riga, revoca e
  rotazione delle credenziali del client, clausola nell'accordo.
- **Mandare a Let's Donation il documento tecnico lungo → SCARTATO.** Si manda un documento di **una
  pagina**; il tecnico si consegna **su richiesta dei loro tecnici**. L'ordine è stato corretto: **apre
  il login**, l'attribuzione chiude, marcata non urgente.
- **Nomi propri nei documenti → VIETATI oltre a Michele.** Il nome del referente tecnico **non è
  confermato**.
- **Nomenclatura delle richieste → discrepanza da sapere** `[C]`: i documenti interni usano sigle da R1
  a R10, il documento per loro ha domande numerate. Chi legge i due testi insieme deve saperlo.

---

## 6. I limiti, e le cose che NON possiamo promettere

| Non dire | Perché è falso o dannoso | Dire invece |
|---|---|---|
| «Oggi vi mandiamo il codice di provenienza» | Non è in nessuna versione pubblicata: l'app installata è di novembre 2025. Se cercano il parametro nei log non trovano nulla | «È pronto e partirà col primo rilascio» |
| «Nei dati non entra nessuno dei due» / «un identificativo, il nome e l'email, e nient'altro» | Nel giro standard il loro sistema riceve un gettone con i pieni poteri dell'utente: gli scope non lo limitano. L'assoluto è già stato corretto **tre volte** | «Nessuno dei due entra nel database dell'altro. Al momento dell'accesso vi arrivano quattro informazioni **più i dati tecnici che il protocollo scambia**: su quelli chiediamo l'impegno scritto di leggere l'identità solo dal token di identità» |
| «Tre informazioni» | Con gli scope richiesti sono **quattro**: identificativo, email, indicatore di email verificata, nome | «Quattro informazioni, più i dati tecnici del protocollo» |
| «E quando apre il vostro spazio è già dentro» | La sessione dell'app non passa al browser esterno: al primo giro l'accesso va rifatto | «Entra con quello, senza compilare una seconda registrazione» |
| «Ritrova il suo storico invece di farsi un secondo account» | Senza collegamento degli account chi ha già un profilo nativo se ne ritrova un secondo; con l'alias Apple il collegamento automatico **non è possibile** | Trasformarlo in richiesta: «potete collegare i due account?» — e dichiarare il caso che resta fuori |
| «Il codice di provenienza è anonimo» | È casuale ma **non anonimo**: resta riconducibile alla persona, quindi è dato personale | «Identificativo opaco, non contiene nome né email, non apre sessioni: resta comunque un dato personale» |
| «L'app avvisa prima di ogni uscita verso un partner» | È l'opposto del vero: la schermata è solo sul ramo Let's Donation; l'uscita verso Donorbox, che manda nome, cognome ed email, non mostra nulla | Nell'informativa dire il vero |
| «Ogni nostro account ha la prova del consenso» | Valeva per chi entrava con Apple o Google: l'account nasceva subito, profilo e prova solo al completamento. **Con i due sistemi rimossi (26/07/2026) il caso non può più nascere**: chi si registra con email e password crea profilo e prova nella stessa operazione. Resta il passato: sul database quattro consensi marketing e **zero** consensi all'informativa | Non affermarlo per gli account vecchi finché non sono sistemati |
| «I nostri dati stanno tutti in Unione Europea» | Solo il database delle persone. Diagnostica, donazioni, distribuzione dell'app e posta sono società statunitensi | «I dati dell'account risiedono in Germania. Alcuni fornitori sono statunitensi e le garanzie sono in definizione con la consulente» |
| «Alla cancellazione propaghiamo la richiesta al partner» | Esiste solo la struttura dati: **nessun programma la legge** | «Conserviamo il minimo per potervi chiedere la rimozione; il canale va concordato» |
| «Elimina account funziona in tutti e due i modi» | Il programma della cancellazione **subito** è pubblicato e risponde `[V]` (26/07/2026), ma il percorso completo — persona reale che preme il pulsante e sparisce dal database — **non è ancora stato provato** `[A]`: serve un account usa-e-getta. Quella **fra trenta giorni** non funziona: il programma esiste ma **non lo avvia nessuno**, vedi §7 | «La cancellazione immediata è pubblicata, la proviamo end-to-end prima del rilascio; quella programmata si accende prima del rilascio» |
| «Il codice di provenienza si annulla su richiesta» | È promesso nell'informativa, ma **il processo non esiste** e la colonna non è usata da nessuna parte | Costruire il processo, o correggere l'informativa |
| «La cancellazione è definitiva» | La lapide sopravvive **per costruzione**, e il registro dei consensi si conserva come prova | Dichiarare le due eccezioni per nome |
| «L'accesso unico è attivo» | Nel nostro progetto **non esiste** nessun punto di accesso di quel tipo | «Il server di accesso non è ancora attivo: si accende dopo la vostra conferma e una decisione interna» ⚠️ *corretto 2026-07-29: qui si nominava anche «la migrazione delle nostre chiavi di firma». **Non esiste più**: le chiavi sono già asimmetriche (ES256) sul progetto vivo. Annunciare al partner un prerequisito che abbiamo già soddisfatto ci fa sembrare più lontani di quanto siamo* |
| ~~«Vi arriva sempre il nome»~~ **RIALLINEATA 2026-07-29: la riga da non dire è l'ALTRA** | La formula «arriva se disponibile, tollerate l'assenza» era **sbagliata in modo pericoloso**: il campo non arriva mai vuoto, perché **senza la chiave il server ci mette l'indirizzo email dell'account** (`identita-matrice-scenari.md:170`; sincronizzazione viva su `AuthContext.tsx:216,306` e `useProfileForm.ts:356`). Dire «tollerate l'assenza» fa preparare al partner un ripiego per un caso che non capita, e non lo mette in guardia da quello che capita: un'email scritta dove va il nome, sulle loro liste pubbliche | «Il nome non arriva mai vuoto: se non l'avessimo, al suo posto partirebbe l'indirizzo email — segnalatecelo, perché come nome visibile non va» |
| «Vi mandiamo l'email reale» **oggi** | Vero per chiunque si registri **dal 26/07/2026**: l'accesso è solo con email e password, quindi l'indirizzo dell'account è reale per costruzione. Resta falso per gli account **nati prima con «Nascondi la mia email»**, che portano un alias — il quale però **inoltra** | «Arriva l'email dell'account. Per le persone iscritte prima di luglio 2026 con la funzione Apple può essere un alias che inoltra: confermateci che il vostro sistema lo accetta. A quelle chiediamo l'indirizzo vero e lo sostituiamo» |
| «I nostri link puntano ancora al dominio vecchio, stiamo migrando» | Falso: nel codice la migrazione è **chiusa**, con un test che fallisce se un indirizzo regredisce. Il residuo vero sono le **versioni già installate** | «Il codice punta già ai vostri nuovi indirizzi; restano le versioni installate sui telefoni, che si appoggiano al vostro reindirizzamento» |
| «La rotazione della parola d'ordine disconnette tutti gli utenti federati» | Blocca i **nuovi** accessi: le sessioni già aperte sul loro Joomla non decadono da sole | «Interrompe i nuovi accessi finché non aggiornate il valore; le sessioni aperte non decadono» |
| «Sono tre righe» / qualsiasi stima del loro sforzo | Non conosciamo il loro sistema: una stima scritta da noi ci toglie credibilità | Chiedere se il campo o il webhook esistono già, e **lasciare a loro la stima** |
| «Il portale Zucchetti usa un accesso federato, quindi ce l'avete già» | È un'ipotesi da confermare | «Come mi dicevi, da lì arrivano già registrati: ci confermate com'è fatto?» |
| «L'ordine dello shop col cashback porterà il codice» | Da loro quell'ordine **non nasce** | Spostare l'aggancio sull'attivazione del cashback |
| «Il vostro modulo va rimosso dalla piattaforma» | Non è ottenibile e non è ciò che chiediamo | «Che non sia una strada alternativa **nel nostro spazio**» |
| «Il vostro modulo ci serve come via di fuga» | Non è falsa: è **autolesiva**. Legittima la registrazione parallela | Non citarla affatto |
| «Sappiamo quanti utenti passano da quale canale» | Quel numero non esiste ancora | «Le scelte sono argomentate sul codice, non misurate sul traffico» |

---

## 7. Il problema che il primo rilascio farebbe emergere

**Aggiornato il 26/07/2026: metà del problema è chiusa, metà no.**

I programmi di cancellazione sono due, entrambi entrati il 15/06/2026: uno cancella **subito**
(`delete-account`), l'altro cancella **fra trenta giorni** chi lo ha chiesto (`purge-deletions`).
Fino al 26/07/2026 **nessuno dei due era pubblicato** sul servizio in produzione: il pulsante avrebbe
chiamato qualcosa che non esisteva.

**Cosa è stato sistemato.** Sono stati pubblicati entrambi `[V]`. Che esistano davvero non è stato dato
per buono: sono stati chiamati dall'esterno senza credenziali, e ognuno ha risposto con il proprio
rifiuto previsto (`401` il primo, `403` il secondo) invece del «non esiste» di prima `[V]`.

**Attenzione a quanto vale questa prova.** Dimostra che i programmi ci sono e rispondono, **non** che
la cancellazione va a buon fine: il `401` arriva dal filtro che sta davanti, prima che il programma
esegua una sola riga. Il percorso vero — persona reale che preme il pulsante, l'account sparisce, la
lapide viene scritta — **non è ancora stato provato** `[A]`. Serve un account usa-e-getta, ed è da fare
prima del rilascio.

**Cosa NON è ancora sistemato.** Il programma che cancella dopo trenta giorni è pubblicato ma **non lo
avvia nessuno**: sul servizio non sono installati gli strumenti che lo chiamerebbero a orario, e la sua
parola d'ordine non è impostata `[V]`. Finché resta così, chi chiede la cancellazione programmata vede
la richiesta accettata, ma **i suoi dati restano oltre il termine che gli abbiamo promesso** — ed è il
termine scritto nell'informativa.

**Resta anche un secondo punto**: nel repository **non esiste nessun processo automatico che ripubblichi
questi programmi** `[V]`. Oggi la pubblicazione è a mano, quindi una correzione al loro codice **non
arriva in produzione da sola**: chi la fa deve ricordarsi di pubblicarla.

→ **Accendere l'esecuzione periodica è un prerequisito del rilascio**, non un lavoro successivo. Sta in
§8.1.

---

## 8. Cosa manca dalla nostra parte

### 8.1 Prerequisiti del primo rilascio

| Cosa | Chi lo sblocca |
|---|---|
| **FATTO il 26/07/2026** — pubblicare le due funzioni di cancellazione `[V]`: entrambe pubblicate e verificate chiamandole dall'esterno (§7) | — |
| **Accendere l'esecuzione periodica della cancellazione a trenta giorni** — il programma c'è ma non lo avvia nessuno, quindi oggi quei dati restano oltre il termine promesso (§7). Nell'ordine: ① impostare la sua parola d'ordine ② installare gli strumenti che chiamano a orario ③ creare l'appuntamento giornaliero. Invertire ① e ③ produce solo un rifiuto al giorno nei registri | Riccardo (la parola d'ordine è un segreto: la imposta lui) · Noi (il resto) |
| **FATTE il 26/07/2026** — le due modifiche al database: telefono e città facoltativi (0010) ed email di contatto scritta alla nascita del profilo (0011). Ricontrollato sul database vivo lo stesso giorno: telefono e città risultano facoltativi `[V]` | — |
| **Pubblicare l'informativa riscritta — quattro bersagli**, con la riga nuova nella tabella delle versioni **nella stessa release** che alza il numero di versione nell'app | Noi (testo, rilascio) · consulente (le risposte) · chi ha le chiavi del sito (pubblicazione) |
| **Estendere l'export dei propri dati** ai codici di provenienza emessi e ai partner a cui sono andati, nella stessa release dell'informativa | Noi |
| **Estendere l'export dei propri dati anche alla riga di anagrafica storica** (`legacy_contacts` con `claimed_by` = la persona). Oggi l'export legge solo profilo e registro dei consensi, e quella tabella è irraggiungibile dal client per costruzione (nessuna policy + revoke): dopo l'import una persona avrebbe presso di noi telefono, città, data di nascita e il record originale intero, **senza vederli nel proprio export** — cioè un Art. 15/20 incompleto. Serve una lettura via `service_role`. L'insieme si allarga a ogni cambio di indirizzo da quando esiste la `0013` | Noi |
| **Chiudere la base giuridica del riordino delle anagrafiche storiche, e se serve l'informativa Art. 14.** Non è un dettaglio rinviabile a dopo: è la condizione che autorizza il caricamento della riga sotto, e quel caricamento ha un vincolo di ordine rigido. Si chiude insieme alla domanda di fatto su **chi è titolare** di quelle persone sulla piattaforma del partner (**fuori dal brief dal 2026-07-28** — materia legale fra le società: responsabile ex art. 28 con accordo firmato, o titolare autonomo?) | La consulente (base giuridica) · Riccardo / Let's Donation (l'atto che qualifica il rapporto) |
| **Caricare le anagrafiche storiche PRIMA che comincino le registrazioni vere** (§3.1, vincolo di ordine). **Chi ha già il profilo completo non si ricollega mai da solo** — collega solo il *completamento* del profilo, non la *modifica* (corretto due volte il 27/07/2026: prima si diceva «solo quando il profilo nasce», poi «a ogni salvataggio»; entrambe sbagliate, la seconda per eccesso di ottimismo) → **e nessuno se ne accorge**. Il meccanismo esiste, è provato (**21 prove** per la `0012` + **12** per la `0013`, cioè 22 e 15 righe verdi contando la riga d'esito, su due configurazioni di privilegi opposte) ed è ora **acceso sul database vivo: `0012` e `0013` applicate il 27/07/2026, nell'ordine** `[V]`. La `0014` corregge il corpo di due di esse (il campo vuoto letto come pieno, la provincia italiana scritta agli stranieri) e la `0015` sposta la chiave d'aggancio su un indirizzo verificato: **entrambe applicate al database vivo la sera del 27/07/2026** (registro `20260727232604` e `20260727232639`), con 0 profili e 0 righe in `legacy_contacts` al momento dell'apply — nessun dato reale toccato. Il vincolo d'ordine resta e va letto così: **il caricamento delle anagrafiche va fatto DOPO la `0014`** (già soddisfatto), altrimenti le celle vuote dell'export (162 righe senza paese, 1330 senza provincia) verrebbero trattate come valori veri. ⚠️ **Il residuo della `0015`** (il furto di `claimed_by` con una registrazione anonima, tracciato il 28/07) **ha ora il suo rimedio scritto e provato: la `0016`** — l'aggancio non avviene più quando l'indirizzo è *dichiarato* in un signup ma quando è *provato*, su due rami (chi arriva già verificato dal provider, e chi conferma dopo), con la stessa guardia estesa ai due percorsi di cancellazione. 16 asserzioni verdi su entrambe le configurazioni di privilegi, e le cinque difese verificate una per una rompendole apposta (ogni versione mutilata muore sul test previsto). ✅ **APPLICATA AL DATABASE VIVO il 29/07/2026** (registro `20260729140217`), con 0 profili e 0 righe in `legacy_contacts` al momento dell'apply — **nessun dato reale toccato**; verificati dopo: 8 trigger tutti abilitati, la guardia del ramo B presente nella definizione del trigger, advisor invariati. 🔴 **Il caricamento delle anagrafiche non è più bloccato dalla sicurezza**: restano i prerequisiti **informativa pubblicata + base giuridica chiusa**, che non sono codice. Dettaglio in `~/todos/partner-identita.md`, § «F-0015.2». **Il file è pronto**: `scripts/prepara-import-legacy.py` produce l'SQL delle 1352 persone, provato eseguendolo. Serve prima la riga qui sopra | Noi (`0014` + caricamento) |
| **Ripulire i dati di prova**: quattro consensi marketing e zero consensi all'informativa, con zero profili | Riccardo (sul database) |

### 8.2 Cancelli che bloccano la trasmissione dei dati

| Cosa | Chi lo sblocca |
|---|---|
| **La pagina dell'informativa che le persone leggono davvero** vive su `italy.riseagainsthunger.org` — lo stesso dominio che è di Rise Against Hunger USA. **Chi ha le chiavi di quel sito non è dichiarato da nessuna parte**: va identificato *prima* di promettere una data. È la dipendenza più esposta di tutto il piano | Riccardo / l'associazione |
| **Quattro domande e una conferma alla consulente**, inclusa quella sulla profilazione (§5.5) | La consulente |
| **Quattro dati da recuperare**: accordo firmato del fornitore del database; regione e conservazione della diagnostica errori (mai verificate, e la conservazione va letta dal pannello, non assunta); regione e accordo del fornitore email; posta certificata e sede legale dell'associazione | Riccardo / l'associazione |
| **Accordo di condivisione dati con Let's Donation.** Nel documento in uscita ci impegniamo per iscritto a prepararlo, e **una nostra bozza non esiste** (verificato: nel repository non c'è nessun testo d'accordo). Deve contenere l'impegno sull'uso del gettone e la notifica di violazione entro ventiquattro ore. Da trattare come consegna con una data | Noi (bozza) · consulente (ratifica) |
| **Invio del documento di una pagina a Michele.** È pronto e non è mai stato mandato | Riccardo |

### 8.3 Lavori tecnici, in ordine di dipendenza

| Cosa | Chi lo sblocca |
|---|---|
| **Collegare il richiamo del profilo mancante fuori dalla schermata del profilo.** Oggi costruito e non collegato: chi non apre il profilo non lo incontra mai | Riccardo (dove) · noi (realizzazione) |
| **Portare il controllo del consenso dal profilo al punto in cui i dati partono.** Stesso difetto su accesso e riaccettazione | Riccardo (estensione) · noi |
| **Chiudere il buco sulla prova del consenso** per chi entra con Apple o Google e abbandona: raccogliere consenso e maggiore età **prima** di creare l'account (più corretta), oppure cancellare periodicamente gli account senza profilo | Riccardo (scelta) · noi |
| **Il processo che annulla un codice di provenienza su richiesta**, promesso nell'informativa e inesistente | Riccardo (chi risponde) · noi (il pezzo) |
| **Il processo che propaga la cancellazione al partner.** Struttura pronta, nessun programma la legge | Noi · Let's Donation (canale) |
| **La donazione di prova da 1 €** | Riccardo |
| ~~**Migrare le chiavi di firma ad asimmetriche**~~ **GIÀ FATTO — verificato il 2026-07-29 sul progetto vivo**: il JWKS pubblica una sola chiave `ES256` e la legacy `HS256` è disabilitata. Non è più una leva né un lavoro | — (chiuso) |
| **Decidere se accettare l'accesso di produzione su una funzione sperimentale**, dopo la risposta del fornitore | Riccardo |
| **Verificare l'impostazione della conferma email del progetto**: l'affermazione «con la conferma attiva la registrazione non restituisce una sessione» viene da un commento nostro, non dall'impostazione reale | Noi |
| **Costruire la pagina web di accesso, registrazione e consenso**, incluso il riconoscimento del browser interno dei social con percorso alternativo | Riccardo (leve) · noi |
| **Verificare riga per riga le regole di accesso al database**, prima di accendere qualsiasi cosa: sono l'unica barriera al gettone | Noi |
| **Il controllo periodico sulla pagina di accesso del nostro spazio**, per accorgersi se il loro modulo torna o il nostro pulsante sparisce | Noi |
| **La configurazione dei collegamenti diretti**, oggi assente su entrambi i lati | Noi · Let's Donation |
| **Il tracciamento delle uscite per canale**, dopo l'informativa e dopo la risposta sulla profilazione | Noi |
| **Estendere la schermata informativa all'uscita verso le donazioni** — il ramo che manda più dati e non mostra nulla | Riccardo |
| **Se confermano i parametri di campagna standard:** rinominare il parametro che l'app invia | Noi |

### 8.4 Il gestionale interno (Access) — in pausa, non chiuso

| Cosa | Chi lo sblocca |
|---|---|
| **Lo schema reale del file Access.** Bloccante numero uno. Lo strumento per estrarlo è pronto, alla seconda versione; va portato sul server, lanciato, e va consegnata **la struttura, mai i dati dei donatori** | Riccardo |
| **Quali tabelle allineare** (anagrafica e registro consensi; le versioni dell'informativa sì o no) | Riccardo |
| **Accesso e ambiente del server** per installare il programma e programmare le esecuzioni | Riccardo / referente informatico |
| **Semantica della cancellazione nel gestionale**: record cancellato o reso anonimo? | Riccardo (scelta del titolare) |
| **Il programma di allineamento vero.** Non pre-costruito di proposito: dipende dallo schema | Noi, appena arriva lo schema |
| **Conservazione dei dati nel gestionale**: donazioni ~dieci anni per obblighi fiscali, marketing fino a revoca, inattivi cancellati o resi anonimi | L'associazione + noi |
| **Registro dei trattamenti, procedura per le violazioni, sicurezza del server** | L'associazione + noi |

### 8.5 Cose che restano fuori e non si risolvono

- Chi si iscrive a Let's Donation **fuori** dal nostro spazio nasce da loro: non lo sapremo mai.
- Chi ha un account nativo **e** usa l'alias Apple resta con due account, salvo un «collega il mio
  account» nel loro profilo utente.
- L'email reale dietro l'alias Apple non è trasmissibile **come informazione a parte**; la via
  decisa (F-EMAIL.23) è farla diventare l'email dell'account, e finché non è implementata parte
  l'alias.
- Dal computer fisso non esiste alcun collegamento diretto all'app.
- L'attribuzione per singola persona su una newsletter di massa o un codice stampato **non è possibile**.
- Il gettone tecnico che il partner riceve al login **non si elimina**: si contiene.
- Rimandato: mettere in relazione le tre identità e il doppio conteggio fra i due canali di denaro.

### 8.6 Se la risposta è no

| Se rifiutano… | Cosa facciamo |
|---|---|
| **L'accesso federato** | Si scende, in quest'ordine: ① login social solo con Google sul loro lato (sul web non c'è l'obbligo Apple, e vale per tutti gli enti della piattaforma) ② collegamento monouso via email, che per accessi rari basta ③ solo come ultima cosa si resta com'è, con la doppia registrazione |
| **L'impegno scritto sull'uso del gettone** | **Non accendiamo l'accesso federato.** Restano la verifica delle regole di riga e la durata breve, e non bastano da sole a giustificare l'apertura |
| **L'alias Apple in registrazione** | Quel segmento non può nascere dal nostro accesso: si decide se accettare che per loro resti il percorso nativo (in contrasto con l'ingresso unico) o rinunciare a quel gruppo. La scelta va messa per iscritto |
| **Il campo sorgente** | Ripiego: campo personalizzato sull'ordine |
| **Il webhook** | Export scaricato a mano, con la cadenza concordata |
| **Un solo ingresso nel nostro spazio** | Si chiede quale sia esattamente il pezzo che lo impedisce; se è nostro lo risolviamo noi. Resta il controllo periodico per accorgersi delle regressioni |

---

## 9. Cosa scrivere a loro

### 9.1 La riga da dire a Michele adesso, se chiede dei dati

> Sui dati la cosa è semplice, e la sintetizzo così.
>
> Nessuno dei due entra nel database dell'altro: non vi chiediamo credenziali sul vostro e non ve ne
> diamo sul nostro. Al momento dell'accesso arrivano al vostro sistema quattro cose — un codice
> identificativo, il nome, l'email dell'account e l'indicazione che l'email è verificata — più i dati
> tecnici che il meccanismo di accesso si scambia da solo fra i due sistemi. Su quei dati tecnici
> chiediamo un impegno da mettere per iscritto: usarli solo per riconoscere la persona, senza
> interrogare i nostri sistemi.
>
> Il codice di provenienza — una sigla casuale che non contiene nome né email e serve solo a capire,
> dopo, che un ordine arriva dalla nostra app — è già pronto nella nostra app e partirà col primo
> aggiornamento che pubblichiamo.
>
> Due cose le mettiamo a posto noi: prima di accendere l'accesso aggiorniamo la nostra informativa
> privacy, e proponiamo un accordo scritto fra le due società su quali dati passano, per quale scopo e
> per quanto tempo. Lo stiamo facendo verificare da chi ci assiste sulla privacy: appena abbiamo la
> conferma vi mandiamo noi la bozza.

*Pronto da incollare. Non nomina nessun referente tecnico, perché quel nome non è confermato.*

### 9.2 Il testo per i loro sviluppatori, quando chiederanno i dettagli

> **Accesso federato — «Entra con Rise Against Hunger»**
>
> Quando entrambe le parti sono pronte, noi faremo da fornitore di identità (OpenID Connect su
> OAuth 2.1, authorization code + PKCE) e voi da client sul vostro Joomla. **Il nostro server di
> accesso oggi non è attivo**: si accende dopo la vostra conferma e una decisione interna. A quel
> punto vi forniremo: discovery URL
> (`…/.well-known/openid-configuration`), `client_id` e `client_secret` dedicati, gli scope da
> richiedere (`openid email profile`) e le redirect URI da autorizzare. Il segreto va scambiato per
> canale sicuro fra tecnici, non su chat.
>
> **Claim disponibili:** solo quelli standard determinati dagli scope — `sub`, `email`,
> `email_verified`, `name`. Claim custom non sono disponibili: non raggiungono `id_token` né UserInfo,
> quindi non progettate su quel presupposto.
>
> - `sub` — identificativo opaco e stabile. **È la chiave di matching**: agganciate l'utente sul `sub`,
>   non sull'email. Richiesta precisa: il plugin deve poter mappare il `sub` sull'username Joomla (o su
>   un attributo di identità equivalente), così che il riconoscimento agli accessi successivi non
>   dipenda dall'email. Nella documentazione pubblica dei plugin più diffusi troviamo il provisioning al
>   primo accesso e la mappatura degli attributi, non questo dettaglio.
> - `name` — nome completo in una stringa unica; nome e cognome li separate voi. **Non arriva mai
>   vuoto**: se il nostro sistema non l'avesse, al suo posto partirebbe l'indirizzo email — se lo
>   vedete segnalatecelo, perché come nome visibile non va.
> - `email` — è l'email dell'account. Per gli utenti Apple Private Relay è, in questa prima fase, un
>   alias `@privaterelay.appleid.com` che **inoltra** all'indirizzo reale: confermateci che il
>   provisioning lo accetti e che non pretenda `email_verified` sull'alias (un nostro utente non ancora
>   confermato può presentare `email_verified: false`). Dal primo rilascio chiediamo a quelle persone
>   l'indirizzo vero, lo facciamo verificare e diventa l'email del loro account: da quel momento questo
>   campo porta l'indirizzo reale.
>
> **Uso dell'access token.** Nel flusso standard il vostro client riceve al token endpoint un access
> token con i privilegi dell'utente; gli scope non lo limitano lato dati. Vi chiediamo di leggere
> l'identità **esclusivamente** da `id_token` e UserInfo, e di non chiamare le nostre API con quel
> token. Lo mettiamo nell'accordo.
>
> **Campi del vostro modulo che il login non copre.** Il vostro form di registrazione chiede tre cose
> che noi non abbiamo: il nickname, la scelta su come apparire nelle liste pubbliche (che è
> obbligatoria e senza valore predefinito) e l'adesione a community e classifiche. Con la creazione
> dell'utente al primo accesso quei valori non arrivano da noi: ci serve sapere se applicate un default
> — e quale — o se li chiedete alla persona una volta entrata. Lo stesso vale per i vostri due consensi
> marketing: nessuno dei due può arrivarvi da noi — quello sugli enti beneficiari da noi non esiste
> proprio, l'altro esiste ma vale per le nostre comunicazioni, non per le vostre — e non vanno
> presunti concessi.
>
> **Casi limite da coprire:** se l'utente nega il consenso sulla nostra schermata rientrate con un
> errore leggibile; il provisioning al primo accesso deve essere idempotente sul `sub` (due schede, due
> login concorrenti); la rotazione del `client_secret` interrompe i **nuovi** accessi federati — lo
> scambio del codice fallisce finché non aggiornate il valore, mentre le sessioni già aperte sul vostro
> Joomla non decadono da sole — quindi la finestra la concordiamo in anticipo.
>
> **Account preesistenti.** Se un utente ha già un account creato col vostro modulo con la stessa email
> e poi entra col nostro accesso, chiediamo il collegamento dei due account invece della creazione di un
> secondo. Resta escluso chi usa l'alias Apple: lì l'email non combacia — se avete un «collega il mio
> account» nel profilo utente, copre anche quello.
>
> **Attribuzione — canale separato, non c'entra col login**
>
> Sui link che l'app apre verso il vostro sito viaggia un parametro con un codice opaco per utente (si
> chiama `rise_ref`; possiamo rinominarlo nei parametri di campagna standard se per voi è più comodo).
> Non è un login e non apre nessuna sessione: serve solo a ricondurre a posteriori un ordine alla
> persona giusta. È già nel codice dell'app e **partirà col primo rilascio che pubblichiamo**.
>
> Tre precisazioni operative:
>
> 1. **La cattura va fatta all'atterraggio**, in sessione, prima e indipendentemente dal login: le
>    landing sono pagine-categoria a due o tre clic dall'ordine, e il giro di autenticazione esce dal
>    sito e rientra su una redirect URI — il parametro si perde se non è già in sessione.
> 2. Il valore va poi **stampato sull'ordine** e reso disponibile nell'export (o nel webhook).
> 3. **Il charity shop è diverso**: è una vetrina di cashback verso merchant terzi, l'acquisto avviene
>    fuori e da voi non nasce un ordine — lì l'aggancio va cercato sull'evento di attivazione del
>    cashback, e deve reggere fino alla conferma differita della rete affiliate.
>
> **Nota sui domini.** Il codice dell'app punta già ai vostri nuovi indirizzi. Restano le versioni già
> installate sui telefoni, che puntano al dominio precedente e si appoggiano al vostro reindirizzamento
> — che conserva i parametri, verificato. Per quelle vi chiediamo di mantenerlo attivo almeno dodici
> mesi.

### 9.3 Le domande a cui ci serve una risposta

**Bloccanti — le prime cinque sbloccano tutto il resto.**

1. **Il meccanismo Zucchetti: come fanno i dipendenti ad «arrivare già registrati»?** È un accesso
   federato — e con quale protocollo — oppure un pre-caricamento di anagrafiche? Ed è riusabile per un
   ente come noi, o è legato al canale welfare?
   *Perché ci serve:* se è un accesso federato, avete già la cosa che stiamo chiedendo e gran parte del
   lavoro non è da costruire ma da riusare. Se è un pre-caricamento, a noi non serve.
2. **Un solo ingresso sul nostro spazio:** la registrazione col modulo si può non esporre sulle nostre
   pagine, via modello grafico del tenant? Se qualcosa lo impedisce, qual è esattamente il pezzo?
   *Perché ci serve:* è la condizione perché di una persona esista una scheda sola. Se il blocco è su un
   pezzo che possiamo risolvere noi, lo risolviamo noi.
3. **Il vostro Joomla può fare da client OpenID Connect? Con quale plugin e quale versione?**
   *Perché ci serve:* la fattibilità dipende dalla versione, e da lì tutto il resto della configurazione.
4. **Il plugin può mappare il `sub` sull'username** (creazione al primo accesso, riconoscimento sul
   `sub` dopo), e non sull'email?
   *Perché ci serve:* è il punto delicato. Con l'alias Apple l'email non è una chiave affidabile, e un
   aggancio sbagliato produce account duplicati che nessuno riesce più a riconciliare.
5. **Quali redirect URI dobbiamo autorizzare?**
   *Perché ci serve:* senza quelle non possiamo emettere le credenziali del client.

**Sui dati e sull'anagrafica.**

6. **Collegamento degli account sull'email:** c'è, o si può attivare? E avete un «collega il mio
   account» nel profilo utente?
   *Perché ci serve:* senza, chi ha già un account vostro se ne ritrova un secondo, senza storico. Il
   secondo pezzo è l'unica via per chi usa l'alias Apple.
7. **Il vostro sistema accetta un alias `@privaterelay.appleid.com` per creare l'account, o pretende
   un'email verificata?**
   *Perché ci serve:* se la pretende, tutto il segmento di chi entra con Apple nascondendo la mail non
   riesce a registrarsi.
8. **L'anagrafica lato vostro viene aggiornata dai dati del login a ogni accesso, o solo alla
   creazione?**
   *Perché ci serve:* decide se una correzione di nome o email fatta da noi si propaga, o se le due
   schede divergono col tempo.
9. **Gli account creati per questa via nascono con i consensi marketing a «no»? E in che momento viene
   presentata la vostra informativa?**
   *Perché ci serve:* nell'inquadramento che vi proponiamo — due titolari autonomi, ancora da
   confermare fra le parti — la vostra informativa deve comparire nel vostro momento e non può
   essere assorbita dalla nostra. E i consensi non vanno presunti concessi.
10. **Se una persona chiede a noi la cancellazione, esiste un modo per propagarvela?**
    *Perché ci serve:* è un punto in cui oggi non possiamo dare seguito completo a una richiesta di
    cancellazione, e vogliamo chiuderlo.

**Sull'attribuzione e sui dati di ritorno.**

11. **Avete già un campo sorgente/campagna sugli ordini, valorizzabile dall'indirizzo web? E compare
    nell'export?**
    *Perché ci serve:* se esiste, sapremmo già quale parametro leggete.
12. **L'export del nostro spazio: chi lo produce, cosa contiene, ed è disponibile dal pannello o lo
    genera il vostro supporto?**
    *Perché ci serve:* è il canale con cui i dati tornano a noi senza che nessuno acceda al database di
    nessuno.
13. **Avete un webhook «ordine completato»?** Con quale schema di firma, quale politica di ritentativi e
    quale identificativo di evento per non contare due volte?
    *Perché ci serve:* è l'alternativa in tempo reale all'export; la valutazione di cosa comporti la
    lasciamo a voi.
14. **Le donazioni in denaro ai progetti sul nostro spazio sono esportabili — o inviabili via webhook —
    con la stessa attribuzione?**
    *Perché ci serve:* oggi quel denaro arriva a noi come risultato ma non come dato.
15. **Quando l'accesso col nostro sistema sarà attivo, l'export può esporre un indicatore che marca le
    persone entrate da quel percorso?**
    *Perché ci serve:* per quelle l'attribuzione diventa certa e non serve più nessun codice
    nell'indirizzo. Vale più di tutte le altre domande di questa sezione.

**Sull'accordo.**

16. **L'impegno a leggere l'identità solo da token di identità e informazioni utente: potete
    confermarlo per iscritto nell'accordo?**
    *Perché ci serve:* è l'unica barriera disponibile sui dati tecnici che il protocollo vi consegna
    comunque. Per iscritto è una barriera; a voce è un auspicio.
17. **Confermate la qualificazione come due titolari autonomi, e siete disponibili a sottoscrivere un
    accordo di condivisione dati?**
    *Perché ci serve:* la vostra informativa ci dichiara titolari autonomi, ma è una dichiarazione
    unilaterale, non un accordo.
18. **Notifica di violazione dei dati verso di noi entro ventiquattro ore** — e, quando arriveremo agli
    eventi, quali dati chiede l'iscrizione e se sono esportabili.
    *Perché ci serve:* le nostre settantadue ore per notificare all'autorità partono da quando ce lo
    dite voi.
19. **I tre campi del vostro modulo che il login non copre** (nickname, scelta di visibilità nelle liste
    pubbliche, adesione a community e classifiche): applicate un default o li chiedete alla persona?
    *Perché ci serve:* la visibilità è obbligatoria nel vostro modulo e non ha un valore predefinito.
    Se applicate un default, una persona potrebbe comparire pubblicamente senza averlo scelto.
20. **I vostri due consensi marketing** (comunicazioni del Titolare, comunicazioni degli enti
    beneficiari): come vengono raccolti per chi entra dal nostro accesso?
    *Perché ci serve:* nessuno dei due può arrivare da noi — quello sugli enti beneficiari nel nostro
    archivio non esiste, l'altro esiste (`marketing_consent`) ma vale per le NOSTRE comunicazioni, non
    per le loro — e un consenso non si presume. ⚠️ Fino al 2026-07-29 questa riga diceva «non hanno un
    corrispondente nel nostro archivio»: **falso** per il secondo, e contraddiceva la tabella §2.1
    (:107-108) di questo stesso documento. Gemello corretto in `letsdonation-brief-integrazione.md`.
21. **Ci avvisate prima di modifiche al nostro spazio?** Il patto sull'ingresso unico vive nel modello
    grafico del tenant, che aggiornate per tutti.
    *Perché ci serve:* un aggiornamento potrebbe rimettere il vostro modulo o far sparire il nostro
    pulsante, e ce ne accorgeremmo dai conti sbagliati.

**Da recuperare senza chiedere a loro:** chi è il referente commerciale, quanto paga l'associazione,
quando scade il contratto — determina se «lo mettiamo in roadmap» significa tre mesi o mai. E prima
della chiamata: guardare nel pannello se il campo sorgente e l'export esistono già.

---

## 10. Provenienza di questo documento

Prodotto il 25/07/2026 da una lettura parallela di undici fonti (i cinque documenti sorella, il tracker
del goal, la memoria di progetto su integrazione/GDPR/Access, il codice vivo, l'informativa pubblica) e
sottoposto a tre revisioni avversariali indipendenti — promesse non mantenibili, perimetro mancante,
fedeltà alla fonte — per **trentotto** rilievi, nove di gravità alta, tutti affrontati. Le verifiche di
stato più pesanti (ultimo rilascio, funzioni pubblicate, migrazioni applicate, `setUser`, revoca del
codice, policy di lettura, campi del modulo partner) sono state **rieseguite a mano** alla fonte, non
accettate dai revisori: una di esse ha corretto un revisore, che dava per rotta oggi una cancellazione
il cui pulsante non è ancora nelle mani di nessuno.
