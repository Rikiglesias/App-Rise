# Il cancello dell'account, lato nostro — matrice azione × stato × dispositivo

> **Cos'è.** La mappa di **cosa pretende l'app Rise Against Hunger Italia da una persona**, azione
> per azione: quando le chiediamo di accedere, quando le chiediamo dei dati, quando non le
> chiediamo niente — e cosa si perde in ogni ramo. È il lato **nostro** della stessa domanda
> che `identita-matrice-scenari.md` ha mappato sul lato Let's Donation.
>
> **Perché esiste.** La matrice precedente ha risposto a «cosa accade a chi passa da noi a LD».
> Non ha mai risposto a «dove sta il cancello **da noi**»: le sue famiglie A (ingresso), B (stato)
> e F (device) descrivono l'utente *quando è già uscito*, non la soglia che gli mettiamo davanti.
> È lo stesso buco di metodo della volta prima, spostato di lato — diagnosi di Riccardo, 2026-07-25:
> «tornare indietro per capire tutti i processi, ci sono tante strade da intrecciare».
> La domanda è nata da una proposta concreta («chiudere l'app dietro un account»): questo documento
> esiste perché quella proposta non si valuti a intuito.
>
> **Come si legge.** Le tabelle della Parte 2 hanno le stesse colonne della matrice sorella:
> *cosa accade oggi* · *cosa vogliamo* · *provvedimento* (🔧 nostro codice · 📨 richiesta a LD ·
> ⚠️ residuo accettato · 🔑 leva umana) · *come si verifica*. Ogni affermazione è **[V]** se
> verificata alla fonte in questa analisi, **[A]** se assunta.
>
> **Documenti collegati.** Lato partner: `identita-matrice-scenari.md` (famiglie A/B/D/F citate qui
> per non duplicarle). Piano OIDC: `oidc-server-implementation-plan.md`. Binding: `~/todos/partner-identita.md`
> (fase F-APP-GATE).
>
> Stato: prima stesura 2026-07-25, verificata sul codice di `master` @ `523513e`.

---

## Parte 0 — Com'è fatto il cancello oggi

Tutto verificato sul codice, non sulla memoria: la fase precedente ha spostato righe in
`ProfileScreen`, e le citazioni sono ancorate ai **nomi**, non ai numeri di riga.

### 0.1 L'app è aperta, e il cancello è uno solo

| Fatto | Evidenza |
| --- | --- |
| Le tre schede in basso — impatto, home, contribuisci — sono raggiungibili **da ospite**, senza nessun controllo | [V] `BottomTabNavigator.tsx` → `ImpactTab` / `HomeTab` / `InfoTab`, nessuna guardia |
| L'unica soglia è la scheda **Profilo**: se la sessione non è autenticata, al suo posto compare il login | [V] `ProfileScreen` → `if (status === 'unauthenticated') return <LoginScreen />` |
| Tre schermate post-login (completa profilo, modifica, cancella) rimbalzano su Profilo | [V] `useRequireAuth` in `CompleteProfileScreen` / `ProfileEditScreen` / `DeleteAccountScreen` |
| `LoginScreen` **e** `ReConsentScreen` sono montati **solo** dentro `ProfileScreen` | [V] grep su `src/`: nessun altro punto di montaggio |
| Quattro rotte registrate non sono raggiungibili da nessun punto dell'app | [V] `CharityShop`, `CharityGiftCard`, `Calendario`, `Tracciabilita` → schermata «in sviluppo», **zero** chiamate a `navigate` fuori dai test |

**La conseguenza che conta**: il gate del **riconsenso** non è debole, è *irraggiungibile* per chi
non apre il profilo. Non è una svista di questa fase: è la stessa osservazione già registrata il
2026-07-25 («esiste già e copre anche il consenso mai dato, ma è collegato solo a ProfileScreen»),
e vale identica per il meccanismo di completamento profilo costruito ieri — vedi **C3**, è il
finding centrale di questa analisi.

### 0.2 Cosa pretende ogni azione, oggi

| Azione dell'utente | Dove vive | Cosa pretendiamo oggi | Cosa parte davvero | Da ospite |
| --- | --- | --- | --- | --- |
| **Dona** (denaro) | pulsante, scheda contribuisci | **niente** | codice di provenienza + nome/cognome/email **solo se** esiste il profilo **e** il consenso è un `ok` esplicito | funziona: il ref è `null`, l'uscita parte comunque [V] |
| **Charity shop** (cashback) | pulsante | **niente** | solo il codice di provenienza | funziona, ref `null` [V] |
| **Gift card** | pulsante | **niente** | idem | funziona, ref `null` [V] |
| **Progetti** (denaro su LD) | pulsante | **niente** | idem | funziona, ref `null` [V] |
| **Eventi / calendario** | pulsante | **niente** | idem | funziona, ref `null` [V] |
| **Registrazione community** | pulsante | **niente** | idem | funziona, ref `null` [V] |
| **Tracciabilità** | pulsante | **niente** | nulla (sito Rise, non è un partner) | funziona |
| **Profilo** | scheda | **accesso** | — | vede il login |
| Completa profilo · modifica · cancella | schermate | **accesso** | — | rimbalzo su Profilo |

[V] `useActionButtonsData` (sei uscite partner) + `usePartnerExit` (`openDonation`, `exitLetsDonation`).
La schermata di avviso pre-uscita si mostra **una volta**, e solo sul ramo Let's Donation — anche
all'ospite (il flag è salvato su una chiave condivisa quando l'utente manca) [V] `disclosureFlag`.

### 0.3 Il peso del cancello, ricontato in questa fase

Due numeri diversi che è facile confondere, ed è la confusione che rende sbagliate le decisioni:

| Cosa | Quante voci | Fonte |
| --- | --- | --- |
| **Il form** di registrazione chiede | **11** obbligatorie: nome, cognome, email, password, conferma, telefono, paese, città, provincia (solo Italia), data di nascita, consenso | [V] `validateSignUpForm` |
| **Il database** pretenderà, **una volta applicata** la migration 0010 | **4**: nome, cognome, data di nascita, data del consenso (più `country`, che ha un default, e `marketing_consent`, che ha un default) | [V] `0001` + `0007` (country, default `'IT'`) + `0010` (`phone`/`city` nullable) + `0007` (`province` già nullable) |

Quindi il profilo **potrà** nascere con quattro voci più le credenziali: il resto è una scelta del
form, non un vincolo tecnico. È esattamente lo spazio che P2 deve occupare.

> ⚠️ **La migration 0010 è in `master` ma NON è applicata al database di produzione** (l'`alter …
> drop not null` è bloccato dal guard MCP → va eseguita dal SQL Editor del Dashboard; è una leva
> umana, tracciata nel binding). Finché non lo è, il database pretende ancora **sei** voci: chi
> legge il «4» qui sopra e alleggerisce il modulo prima dell'apply manda in produzione un signup
> che **viola il NOT NULL e fallisce**. L'ordine è scritto anche in testa alla migration: prima la
> migration, poi il form leggero.

**Trappola verificata, da non far scoprire a valle**: nel trigger che crea il profilo, la condizione
di ingresso è `if v_meta ? 'birth_date'` — la data di nascita non è solo la prova del 18+, è **il
marcatore che distingue il signup email dal social** [V] `0004_signup_trigger.sql`. Chi
«alleggerisse» il form togliendo la data di nascita otterrebbe un signup che **non crea alcun
profilo, in silenzio**. Al contrario, `phone` e `city` si possono smettere di inviare senza toccare
il trigger: `v_meta->>'phone'` restituisce `null`, e la colonna ora lo accetta [V].

### 0.4 I collegamenti diretti all'app non esistono ancora

| Fatto | Evidenza |
| --- | --- |
| L'app dichiara **solo** uno schema privato (`rahitalia://`), usato per il reset password | [V] `app.config.js` → `scheme: 'rahitalia'` |
| **Nessun** collegamento universale è configurato: zero occorrenze di `associatedDomains`, `applinks:`, `autoVerify`, `intentFilters` in tutto il repository | [V] grep su tutto il repo, escluse le dipendenze |

**Correzione a come era scritto nel binding**: il requisito non è solo «il file di associazione sul
loro dominio». Serve **su entrambi i lati** — il file sul dominio *e* la dichiarazione dentro la
nostra app, che oggi non c'è. Finché mancano, un link su un dominio qualsiasi (nostro o loro) non
apre l'app: apre il browser. Da questo, e non da una preferenza, segue che **l'ingresso dal sito è
una pagina web** (conclusione già presa da Riccardo, qui confermata con l'evidenza che mancava).

---

## Parte 1 — Gli assi

Gli otto dettati nel brief di fase, più tre emersi scrivendo (gli esempi erano un seme, non il
perimetro).

| # | Asse | Perché cambia la risposta |
| --- | --- | --- |
| 1 | **Punto di partenza** | app · sito · QR · newsletter · link condiviso: decide se un cancello è pure *visibile* |
| 2 | **Dispositivo** | telefono con l'app · telefono senza l'app · desktop: il terzo caso rende il collegamento diretto impossibile per costruzione |
| 3 | **Stato della persona** | ospite · autenticato senza profilo · profilo parziale · profilo completo · riconsenso dovuto (cinque, non due) |
| 4 | **Destinazione** | i quattro modelli di transazione della matrice sorella (§0.2): denaro Donorbox · denaro LD · gift card · cashback · evento |
| 5 | **Dove nasce l'account** | app · pagina web (da costruire) · form nativo LD |
| 6 | **Dove si raccoglie il consenso** | e soprattutto: chi lo incontra davvero |
| 7 | **Continuità di sessione** | l'app e il browser esterno non condividono la sessione |
| 8 | **Cosa si perde nel ramo** | una donazione · un dato · una persona · una prova di consenso: non sono la stessa perdita |
| **9** | **Momento del cancello** | *(nuovo)* all'avvio · al tocco dell'azione · alla prima occasione utile dopo: stesso cancello, tre costi molto diversi |
| **10** | **Raggiungibilità del presidio** | *(nuovo)* un controllo montato su una schermata che nessuno apre è codice che esiste e non protegge |
| **11** | **Reversibilità** | *(nuovo)* un cancello si può togliere senza passare dagli store (aggiornamento OTA), ma resta un cambio di comportamento visibile: si annuncia, non si sperimenta |

---

## Parte 2 — La matrice

### Famiglia G — Dove sta il cancello, azione per azione

La risposta non è una: **dipende dalla destinazione**, e il cancello per metà delle destinazioni
esiste già ed è di qualcun altro.

| # | Azione | Oggi | Cosa dovrebbe pretendere | Perché (cosa si perde altrimenti) | Provvedimento | Verifica |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | **Donare denaro** (Donorbox) | niente | **niente, mai** | È l'unico canale dove si dona **senza account**: un cancello qui non protegge nulla e costa donazioni. (Non è l'unico che incassa — su LD si dona in denaro ai progetti, §0.1 della matrice sorella — ma è l'unico dove il denaro passa senza registrazione) | ⚠️ nessun cancello, per decisione · 🔧 al più un invito al login **non bloccante** dentro l'avviso pre-uscita (che su questo ramo oggi non c'è: D9 della matrice sorella) | Uscita da ospite: continua a partire, prefill assente [V] `partnerRefService`: `if (!userId) return null` |
| G2 | **Donare denaro su LD** (progetti) | niente | niente da parte nostra | Il cancello è **loro** — su tutte e quattro le destinazioni LD l'account è necessario [V, §0.2 della matrice sorella] — e con l'invariante I7 quell'account nasce dal nostro accesso: aggiungerne uno nostro prima significa **due cancelli in fila** per la stessa persona | 🔧 il gate vive sulla pagina web del login, non nell'app · 📨 I7 | Percorso reale: un solo modulo da compilare, non due |
| G3 | **Gift card** | niente | niente da parte nostra | Identico a G2. È anche l'acquisto più impulsivo: due soglie lo uccidono | come G2 | idem |
| G4 | **Charity shop** (cashback) | niente | niente da parte nostra | Identico, e qui l'ordine non nasce nemmeno su LD (§0.2 matrice sorella) | come G2 | idem |
| G5 | **Iscrizione a un evento** | niente | **profilo completo**, al momento dell'iscrizione | È l'unico posto dove i dati completi servono davvero (è la ragione della decisione D-a). Senza, l'associazione ha un iscritto di cui non sa nulla | 🔧 richiesta dei campi mancanti **prima dell'uscita verso l'evento**, non prima dell'app · ⚠️ oggi zero eventi attivi sul tenant: il presidio si costruisce quando il flusso esiste | Uscita eventi con profilo parziale → i campi vengono chiesti prima |
| G6 | **Registrazione community** | niente | niente da parte nostra | Come G2 | come G2 | idem |
| G7 | **Vedere i propri dati** (profilo, esportazione, cancellazione) | accesso | accesso | Sono dati personali: senza sessione non c'è niente da mostrare | ✅ già così | — |
| G8 | **Chiudere l'app dietro un account** (la proposta all'origine di questa fase) | — | **no** | Perderebbe le donazioni da ospite (G1), aggiungerebbe un secondo cancello dove ce n'è già uno (G2-G4, G6), e non servirebbe per il solo caso che lo richiede (G5), che ha un momento più tardo e più efficace | ⚠️ **scartata con evidenza**, non per prudenza: l'unica destinazione che pretende dati è quella con zero flussi attivi oggi | La donazione da ospite parte: `getOrCreatePartnerRef` → `null` e l'uscita procede [V] |

### Famiglia M — Il momento del cancello

Stesso presidio, tre momenti, tre costi. È l'asse che la proposta iniziale non conteneva e che
scioglie la domanda.

| # | Momento | Cosa costa | Cosa protegge | Verdetto |
| --- | --- | --- | --- | --- |
| M1 | **All'avvio** (app chiusa) | Ogni donazione da ospite e ogni visita informativa: l'app diventa inaccessibile a chi non ha ancora deciso nulla | Niente che non sia protetto altrove | ❌ scartato (G8) |
| M2 | **Al tocco dell'azione** | Attrito nel momento peggiore: l'intenzione è già espressa, la soglia arriva dopo | Solo la destinazione che lo richiede | ✅ **solo per G5** (evento) |
| M3 | **Alla prima occasione utile dopo** | Quasi nulla sull'intenzione; richiede un posto dove il sollecito sia **visto** | I dati che servono all'associazione, senza tassare l'ingresso | ✅ **per i campi mancanti** — ed è il pezzo che oggi è costruito ma non collegato (C3) |

### Famiglia D — Dispositivo e continuità

| # | Caso | Oggi | Provvedimento | Verifica |
| --- | --- | --- | --- | --- |
| D1 | Telefono **con** l'app installata, link dal nostro sito | Il link apre il browser: nessun collegamento universale è configurato [V] | 🔧 se un giorno si vuole l'apertura diretta: file di associazione sul dominio **+** dichiarazione nell'app (oggi manca la seconda) | Toccare il link su un telefono con l'app: cosa si apre |
| D2 | Telefono **senza** l'app | Un link universale che non trova l'app aprirebbe la pagina web, **non** lo store | 🔧 se si vuole portare allo store serve una **pagina-ponte nostra** che riconosca il dispositivo · ⚠️ altrimenti: si resta sul web, che è la scelta già fatta (login web-first, I4) | — |
| D3 | **Desktop** | Il collegamento diretto non esiste per costruzione | ⚠️ residuo strutturale: dal desktop si passa **sempre** dalla pagina web | — |
| D4 | Browser dentro un social | Vedi A8 della matrice sorella (Google blocca OAuth dai webview) | 🔧 rilevamento + ripiego, sulla pagina web | — |
| D5 | Dall'app al browser esterno | La sessione dell'app **non** è quella del browser: il primo passaggio richiede un accesso | ⚠️ da **dichiarare**, non da promettere risolto · 🔧 valutare una sessione autenticata condivisa (F1 della matrice sorella) | Uscita dall'app → la pagina riconosce l'utente? |

### Famiglia C — Chi incontra davvero i presidi

Il cuore di questa fase. Un presidio non vale per come è scritto, ma per **quante persone lo
attraversano**.

| # | Presidio | Dove è montato | Chi lo incontra | Provvedimento | Verifica |
| --- | --- | --- | --- | --- | --- |
| C1 | **Riconsenso** (informativa cambiata in modo sostanziale) | solo `ProfileScreen` [V] | solo chi apre il profilo | 🔧 collegarlo dove i dati partono davvero, cioè prima dell'uscita che li trasmette (l'aggancio esiste: la guardia del prefill richiede già un consenso esplicito) · 🔑 se debba **bloccare** altro oltre al profilo è una decisione di design, non un fix | Informativa marcata sostanziale → utente che non apre il profilo: cosa vede prima di donare |
| C2 | **Prova del consenso alla nascita** | trigger per il signup email; `CompleteProfileScreen` per il social | chi completa; **non** chi abbandona | già tracciato come D2-bis nella matrice sorella (buco Art. 7 di oggi, non del flusso web futuro) | `auth.users` senza riga in `profiles` |
| **C3** | **Completamento del profilo parziale** (costruito ieri, PR #93) | `getProfileCompletion` è consumato **solo** in `ProfileScreen`; `missingProfileFields` — la lista ordinata di cosa manca — **non ha nessun consumatore** fuori dai test [V] | solo chi apre il profilo | 🔧 **il pezzo che manca a P2**: il sollecito va dove la persona passa (home, o prima dell'azione che quei dati richiede), non dove potrebbe non entrare mai · 🔑 dove esattamente = decisione di design | Utente con profilo parziale che **non** apre il profilo: incontra la richiesta? Oggi **no** |

**Perché C3 è la stessa classe di errore già a ledger**: la migration 0010 e lo stato a quattro
valori sono la *condizione* del profilo minimo; il commento in testa a `profileCompletion.ts` lo
dice esplicitamente («*nullable ≠ opzionale per sempre*: senza qualcosa che chieda i campi
mancanti, "prima o poi" diventa "mai"»). Quel qualcosa è stato scritto e agganciato all'unica
schermata che l'utente-tipo non apre — la stessa superficie sbagliata di C1. Il meccanismo non è
sbagliato: è **non collegato**. Va detto così, non come «fatto».

### Famiglia P — Cosa si perde, ramo per ramo

Le perdite non sono equivalenti, e trattarle come tali è ciò che fa scegliere male.

| Perdita | Quando accade | Reversibile? | Peso |
| --- | --- | --- | --- |
| **Una donazione** | un cancello davanti a un'azione che oggi funziona da ospite (M1/G1) | No: la persona non torna | Massimo — è l'unica strada dove il denaro passa senza registrazione |
| **Un dato** (telefono, città) | profilo minimo senza sollecito raggiungibile (C3) | Sì: si può chiedere dopo, se qualcosa lo chiede | Alto, ma recuperabile |
| **Una persona** | doppio cancello in fila (G2-G4): abbandona a metà | No | Alto |
| **Una prova di consenso** | account senza profilo (C2), o informativa cambiata mai riaccettata (C1) | Solo raccogliendola di nuovo | Massimo sul piano legale: è ciò che rende lecito tutto il resto |

---

## Parte 3 — Cosa se ne deriva

### 3.1 Le decisioni

| # | Decisione | Chi decide | Stato |
| --- | --- | --- | --- |
| A1 | L'app **resta aperta**; nessun cancello all'avvio | AI, con evidenza (G8) | **presa** — scartata la chiusura, non per prudenza ma perché perde G1 e duplica G2-G4 |
| A2 | Le destinazioni Let's Donation **non** ricevono un cancello nostro: il gate è quello loro, che con I7 nasce dal nostro accesso | AI (segue da I7) | **presa** |
| A3 | L'unico gate «al tocco» è l'**iscrizione a un evento**, e si costruisce quando esisteranno eventi | AI + 🔑 conferma quando il flusso esiste | presa, differita |
| A4 | **Dove** mettere il sollecito del profilo parziale (home · prima dell'azione · entrambi) | 🔑 **Riccardo** — cambia ciò che l'utente vede | **aperta**, è il prossimo passo di P2 |
| A5 | Se il **riconsenso** debba bloccare qualcosa oltre al profilo | 🔑 **Riccardo** — idem | **aperta** (già nota come residuo) |

### 3.2 Aggiunte al piano di build

- **P2-resto** guadagna un pezzo che non era scritto: non solo il form leggero, ma **collegare il
  sollecito** dove viene visto (C3). Senza, l'alleggerimento del form è una perdita di dati netta.
- **P7 (nuovo)** — portare il presidio del consenso dalla schermata del profilo al punto in cui i
  dati partono (C1). Piccolo, e chiude un residuo aperto da giorni.
- **F1.8** (tracciamento click per canale) resta dopo l'informativa, invariato.
- **Igiene, fuori tema**: quattro rotte registrate e mai raggiunte (§0.1). Segnalate, non toccate:
  non è dead code creato da questa fase.

### 3.3 Residui dichiarati

1. Dal desktop si passa sempre dalla pagina web: nessun collegamento diretto è possibile (D3).
2. Dall'app al browser il primo accesso va rifatto, finché non si valuta la sessione condivisa (D5).
3. Il collegamento diretto ai domini richiede configurazione su entrambi i lati e non è configurato
   su nessuno dei due (§0.4): oggi non esiste, e va detto così anche a LD.
4. Il gate degli eventi non si può verificare dal vivo: zero eventi attivi sul tenant.

---

## Appendice — Metodo e limiti

**Come è stata fatta.** Ogni fatto della Parte 0 è stato letto sul codice di `master` @ `523513e`
in questa fase, non ripreso dal binding: le citazioni sono ancorate ai **nomi** di funzione e
schermata, perché i numeri di riga di questo stesso file sono già slittati quattro volte in un
turno precedente. Le famiglie A, B, D, F della matrice sorella sono **citate**, non ricopiate.

**Cosa non copre.** La pagina web non esiste ancora: tutto ciò che la riguarda è progetto, non
osservazione. Il comportamento reale dei collegamenti diretti non è stato provato su dispositivo
(non c'è niente da provare: la configurazione è assente). Il lato Let's Donation resta nella
matrice sorella.

**Il limite da tenere presente.** Questo documento risponde a «dove sta il cancello». Non risponde
a «quanti utenti passano da dove»: quel numero non esiste ancora — è F1.8, e va dopo l'informativa
perché è tracciamento comportamentale. Fino ad allora le scelte qui sono argomentate, non misurate.
