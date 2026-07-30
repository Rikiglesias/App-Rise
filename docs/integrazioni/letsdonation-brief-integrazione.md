# Accesso unico Rise Against Hunger Italia - scheda di integrazione

<!-- NOTE INTERNE - NON contenuto del documento.
     Regola imparata a spese nostre: il convertitore PDF rende i blockquote VERBATIM e salta solo
     i commenti HTML come questo. Un'intestazione interna scritta con «>» finisce in PRIMA PAGINA
     dal destinatario. E' gia' successo sulla proposta (PR #101) e su questo file.
     Tutto cio' che non deve leggere il partner va QUI, mai in «>».

     ----------------------------------------------------------------------------------
     RISCRITTO IL 2026-07-27 (sera) SU RICHIESTA DI RICCARDO - secondo giro.
     Parole sue: «il problema del secondo e' che spieghi loro come fare il loro lavoro ed e'
     molto banale step by step trattandoli come scemi. Rivedi come consegnarglielo.»

     COSA C'ERA CHE NON ANDAVA (misurato sulla versione precedente, non a impressione):
       - registro in SECONDA PERSONA IMPERATIVA: «Attivate», «Togliete», «Riconoscete»,
         «Dentro ci mettete tre cose». E' il registro del manuale d'istruzioni.
       - :75-77 spiegava a un fornitore Joomla come si installa un componente Joomla;
       - :83-87 spiegava perche' non si aggancia un'identita' all'email - prima cosa che sa
         chiunque abbia integrato un IdP;
       - :67-68 STIMAVA IL LORO EFFORT («e' configurazione, non sviluppo») senza conoscere il
         loro stack: presuntuoso, e se poi e' sviluppo abbiamo sminuito il loro lavoro;
       - :53-54 spiegava cos'e' OIDC («come entrare con Google, non c'e' niente da inventare»):
         nella LETTERA a Michele funziona (non e' tecnico), qui e' didascalico;
       - :161 dettava la logica del loro codice («non deve far rifiutare la creazione»).

     IL RIMEDIO, che e' di CORNICE e non di righe: il documento non descrive piu' «cosa dovete
     fare voi», descrive COSA EMETTIAMO NOI + COSA VA CONCORDATO. Il «come lo realizzate» torna
     a loro, che e' dove deve stare. La cornice e' dichiarata in apertura, cosi' si legge subito.
     I due vincoli veri (aggancio su `sub`, linking per email) NON sono stati tolti - sono
     requisiti d'integrazione legittimi - ma stanno in §4 come punti da concordare, asciutti,
     senza la spiegazione elementare del perche'.

     CORRETTA anche una CONTRADDIZIONE FRA I DUE DOCUMENTI IN USCITA (trovata in questo giro):
     la lettera prometteva «l'indirizzo che vi arriva e' sempre verificato», questa scheda
     diceva che `email_verified` «puo' valere false». Un tecnico lo nota e chiede quale vale.
     Ora la scheda distingue il FATTO (senza conferma non si entra) dal FLAG del provider.
     ----------------------------------------------------------------------------------

     ----------------------------------------------------------------------------------
     RIDOTTO AGLI IMPEGNI FERMI IL 2026-07-28 - terzo giro e mezzo, invio FERMATO da Riccardo.
     Regola: memoria `documenti-verso-partner.md` - il primo contatto CHIEDE CAPACITA', non
     PROMETTE ARCHITETTURA. Ogni riga tolta e' un impegno che potremmo dover ritrattare
     DAVANTI A LORO. Ogni verdetto e' verificato alla fonte, non a impressione:

       TOLTI (impegni non fermi):
       - §6 «restiamo due titolari autonomi» -> posizione PROPOSTA in conferma legale, non un
         fatto (`oidc-server-implementation-plan.md:153-156`). [AGGIORNATO 2026-07-29: la domanda 6
         DI ALLORA, che copriva anche il rapporto gia' in essere, e' stata RIMOSSA il 28/07 - materia
         fra avvocati. Oggi il numero 6 indica i campi del loro modulo: non cercarlo li'.
         AGGIORNATO 2026-07-29 sera: erano TRE, ora sono DUE - il nickname lo mandiamo noi
         (decisione di Riccardo: lo stiamo costruendo e sara' pronto prima della loro risposta).]
       - scheda dati, «Citta', provincia, data di nascita ... ce ne prendiamo noi il carico»
         -> REFUTATO dalla nostra stessa verifica del 2026-07-24: i claim custom NON raggiungono
         il client OIDC (`oidc-server-implementation-plan.md:18-22`). Non era «non fermo»: era
         una promessa che oggi crediamo IMPOSSIBILE sullo stack scelto.
       - scheda dati, «Telefono: ci basta che lo richiediate» -> il telefono vive in
         `public.profiles` (`0001_profiles.sql:8`), NON in `auth.users`: il claim standard
         `phone_number` non uscirebbe. Sul progetto `phone_autoconfirm=false`, provider Twilio
         -> servirebbe un percorso di verifica SMS mai costruito. Ora e' una DOMANDA.
       - «Un impegno che vi chiediamo di mettere per iscritto nell'accordo» -> materia di
         contratto, non di primo brief. La sostanza tecnica resta come 4o punto di §4.
         🔴 **RIENTRATA il 29/07 sera** con `84c8763`, dentro il 4o punto di §4, mentre si
         riscriveva quel punto per chiudere un ALTRO problema — cioe' esattamente la classe
         `riscrittura-resuscita-decisione-precedente`, terza occorrenza su questo file.
         **RI-TOLTA il 30/07** dopo una review a 7 lenti che l'ha ripresa da tre angoli
         indipendenti. Verificato dopo: nel CORPO la parola «accordo» ha **0 occorrenze**, la
         sostanza tecnica e' intatta («si legge dall'ID token... e' la prassi»), e la richiesta
         vive dove le compete: `scambio-dati-quadro.md` § domanda 16 «Sull'accordo», canale dei
         legali. ⚠️ Lezione: una nota che dichiara una rimozione va VERIFICATA nel testo, non
         creduta — questa nota e' rimasta vera un giorno e falsa il successivo.
       - «Sull'eta': stiamo aprendo la registrazione anche ai minorenni» -> FALSO nel prodotto
         oggi: `constraint adult` in `0001_profiles.sql:17` e `validateAdult` in
         `validation.ts:25` (usata a :83 signup e :148 profilo). Deciso != rilasciato.
       - §2, le righe «Voi: Collegate…» / «Voi: Lasciate li'…» della tabella -> e' il difetto
         gia' corretto una volta (dire a loro come fare il proprio lavoro), tornato in forma di
         tabella. La CONDIZIONE vera (pulsante su e modulo giu' INSIEME, invariante I7) resta,
         come condizione che riguarda entrambi.
       - cappello, «Come realizzarlo dalla vostra parte lo decidete voi» -> meta-testo, rilievo
         letterale di Riccardo.

       AL FUTURO, non piu' al presente (esistono sulla carta, non in produzione):
       - §1 «facciamo da OpenID Provider» -> «il ruolo e' quello di»; §3 dichiara che il
         provider lo mettiamo in piedi PER questa integrazione. Il piano e' esplicito: «Non
         ancora eseguito» (`oidc-server-implementation-plan.md:4-6`).
         [AGGIORNATO 2026-07-29: qui si diceva «due passi su quattro sono leve di Riccardo
         (chiavi asimmetriche + abilitazione della beta)». Le CHIAVI SONO GIA' ASIMMETRICHE
         (ES256, verificato sul progetto vivo) -> quella leva non esiste piu' e il passo 1 e'
         stato annullato nel piano.
         ⚠️ CORRETTO SUBITO DOPO dal secondo critico: NON scrivere «resta una sola leva,
         accendere il server». Accendere il server non e' nemmeno eseguibile da solo — il passo 2
         vuole `authorization_url_path`, cioe' il path della pagina consent CHE NON ESISTE
         (`oidc-server-implementation-plan.md:76-78`, «il pezzo piu' grande»). Il vero elenco:
         costruire la pagina consent, poi accendere il server, piu' la decisione rischio-beta
         (`:59-60`) e le leve infra Vercel + allow-list dei redirect (`:93`). Correggere una
         premessa stantia con un'altra premessa comoda e' lo stesso errore al contrario.]

       RESTANO, e sono VERIFICATI:
       - `sub` come chiave (standard OIDC);
       - «da noi si entra solo dopo aver confermato l'indirizzo» -> `mailer_autoconfirm=false`
         sul progetto vivo + 0 login social nel codice (Google/Apple rimossi);
       - nessuno dei due entra nel DB dell'altro; i consensi restano di chi li raccoglie.

     TOLTO IL 2026-07-28 (rilievo Riccardo, «continuo a non capire cosa serve»): il paragrafo sul
     limite del browser che non conosce la sessione dell'app. Tre motivi, il terzo decisivo:
       1) non e' ne' un requisito ne' una domanda ne' una condizione -> non fa il lavoro del brief;
       2) era scritto male (troppe casistiche implicite per chi legge);
       3) **conteneva un'affermazione FALSA**: «da quella volta in poi il browser se la ricorda» -
          non regge con altro telefono, altro browser, navigazione in incognito o dati cancellati.
     Il tema NON e' perso: vive in `app-gate-matrice.md` (D5), `identita-matrice-scenari.md`
     (righe 122 e 202) e `scambio-dati-quadro.md` (196, 669). Torna quando si progetta la NOSTRA
     pagina web di accesso, che e' il posto dove quel comportamento conta davvero.
     ----------------------------------------------------------------------------------

     ----------------------------------------------------------------------------------
     TOLTO IL 2026-07-29 - §6 PRIVACY INTERA (rilievo Riccardo: «togli il punto 6, che non serve,
     quindi la privacy toglie completamente tutto e basta»). Coerente con la sua posizione del
     28/07 («se ne occuperanno comunque gli avvocati») e con la decisione gia' registrata in
     `scambio-dati-quadro.md` (139, 163, 739): la qualificazione giuridica e' materia fra le due
     societa', FUORI dal brief tecnico. Cosa spariva con la sezione, e dove e' finito:
       - «Come si qualificano i due trattamenti» -> era gia' un non-detto («non lo diamo per
         deciso»): esce e basta, e' il tema delegato ai legali;
       - «I consensi restano di chi li raccoglie» -> la SOSTANZA utile («non possiamo darli per
         concessi») migra nella domanda 6, dove serve a qualcosa. ⚠️ CORRETTO IL 2026-07-29 dal
         critico avversariale: alla prima stesura questa riga era FALSA - la migrazione era stata
         dichiarata qui ma il corpo del brief aveva ZERO occorrenze di «consenso» (grep). Ora la
         frase c'e' davvero, in coda alla domanda 6. Lezione: una nota che dichiara dove e' finita
         una cosa va verificata NEL TESTO, non solo nell'intenzione.
       - il `rise_ref` e la sua natura di pseudonimo -> ESCE DAL BRIEF, ed e' l'unica perdita
         reale: il codice viaggia GIA' oggi sui link verso di loro (`usePartnerExit.ts:133`,
         `partnerRefService.ts:52-71`), quindi il documento ora tace su un dato che gli mandiamo.
         Non e' un buco di coerenza (il brief ridotto parla solo dell'accesso unico: 0 occorrenze
         di attribuzione/UTM/ordini, verificato con grep), ma se l'attribuzione rientra nello
         scambio va rimesso. Il testo canonico sopravvive in `scambio-dati-quadro.md:134`.
       - RIMANDO RIPARATO: la riga `sub` della Scheda dei dati diceva «uno pseudonimo, come il
         `rise_ref`» - un paragone a una cosa che il documento non nominava piu'. E' la classe
         di errore gia' vista con la numerazione 7->5 delle domande.

     SPOSTATO nella stessa passata: il blocco «Sui campi che il vostro modulo chiede e il nostro
     accesso non copre» era in coda alla Scheda dei dati ed e' diventato la DOMANDA 6 di §5.
     Tre motivi, il terzo e' la prova sul campo:
       1) e' una domanda sul comportamento del LORO sistema -> la casa e' §5 (criterio: sale in §5
          cio' che riguarda il loro sistema, resta accanto alla tabella cio' che riguarda i dati
          che emettiamo NOI - per questo «se vi servono altri dati» NON si e' mosso);
       2) §5 dichiarava «Cinque domande» mentre di domande ce n'erano sei sparse -> lo stesso
          difetto gia' corretto due volte («§4 REQUISITO, §5 QUESITO»);
       3) RICCARDO NON L'HA CAPITA leggendo il PDF, e l'ha letta come «loro chiedono queste cose
          in piu' e vorrebbero continuare a chiederle» - che e' la formula della §6, non di questo
          blocco. Due passaggi sullo stesso elenco a due pagine di distanza si contaminano.

     CORRETTI due DIFETTI DI CONTENUTO trovati mentre si spostava (verificati alla fonte, non
     riscritti a impressione):
       - i due elenchi NON dicevano la stessa cosa: §6 elencava «le comunicazioni degli enti
         beneficiari» (che e' un consenso MARKETING, `identita-matrice-scenari.md:179`), la Scheda
         dati elencava «community» (che e' un campo di PROFILO). Presentati come lo stesso elenco.
         L'elenco vero e' quello di `scambio-dati-quadro.md:211-213`: nickname · visibilita' nelle
         liste pubbliche · adesione a community e classifiche.
         [AGGIORNATO 2026-07-29 sera: il NICKNAME e' uscito da questo elenco - lo mandiamo noi come
         claim `preferred_username` (migration 0017 + syncNicknameClaim, verificato alla fonte che
         il server auth lo trasporta). Restano DUE: visibilita' e community/classifiche.]
       - mancava il FATTO che rende la domanda ineludibile: da loro la visibilita' e'
         **obbligatoria e senza valore predefinito** (`scambio-dati-quadro.md:872-877`), quindi
         oggi la sceglie sempre la persona e togliendo il modulo qualcuno deve continuare a
         chiederla. Senza quel fatto la domanda si legge come una curiosita'.
     NON si e' scritto «qualunque sia la risposta va bene»: e' la resa travestita da trasparenza
     che Riccardo ha gia' bocciato sulla domanda 4 («e ci basta saperlo»).

     🧪 CRITICO AVVERSARIALE sulla passata del 29/07 - 9 finding, TUTTI fondati, TUTTI applicati
     (nessun falso positivo, nessun waive). I tre che contano:
       1) 🔴 REGRESSIONE MIA: la domanda 6 riscritta aveva REINTRODOTTO lo scenario di danno («se
          nascesse gia' attiva, la persona comparirebbe in una lista senza averlo scelto»). Quella
          frase era stata tolta DI PROPOSITO il 28/07 con `e59e26a` («e' un avvertimento a non
          combinare guai»), e il testo che Riccardo mi ha citato NON la conteneva: l'ho rimessa io
          riscrivendo. Ora tolta di nuovo; resta la sola ragione NOSTRA, quella ratificata.
          Classe: riscrivere una voce = rischio di resuscitare cio' che una passata precedente
          aveva deciso di togliere -> prima di riscrivere, `git log -S` sulla frase.
       2) 🔴 IL QUARTO ELEMENTO MANCAVA: la domanda apriva con «i TRE campi» come lista chiusa, ma
          `scambio-dati-quadro.md:108-110,123-124` verifica dal vivo che non coperti sono anche i
          DUE CONSENSI sulle comunicazioni (quello agli enti beneficiari «non esiste da noi»).
          Aggiunta la frase in coda. Senza, il partner poteva presumerli concessi.
       3) PERIMETRO: «quando quello non c'e' piu'» era globale; il canonico vieta la formula «il
          vostro modulo va rimosso dalla piattaforma» (`scambio-dati-quadro.md:687`: non e'
          ottenibile e non e' cio' che chiediamo). Ora e' «sulla pagina del nostro spazio».
     Gli altri sei: §1 prometteva «senza compilare un secondo modulo» e la domanda 6 sembrava
     contraddirlo -> qualificata («una scelta sola dopo l'ingresso, non un secondo modulo») · la
     nota interna :47-48 rimandava a una «domanda 6» che oggi indica altro · la lettera non nominava
     il caso degli indirizzi diversi che la scheda dichiara «va risolto» · 2 rimandi stale nella
     memoria di progetto · la soglia di `md2pdf-brief.py` era giustificata con una premessa FALSA
     (le matrici NON hanno tutte decine di righe: 8 tabelle su 11 di `app-gate-matrice.md` ne hanno
     <=8) -> la condizione e' passata dal CONTEGGIO RIGHE all'ALTEZZA REALE misurata.
     ----------------------------------------------------------------------------------

     ----------------------------------------------------------------------------------
     PASSATA DEL 2026-07-29 (sera) - AUDIT 360 PRIMA DELL'INVIO, due correzioni.

     1) 🔴 RECIDIVA, trovata con `git log`: la domanda 1 diceva «per voi e' QUASI NIENTE DA FARE».
        E' la STIMA DEL LAVORO ALTRUI che Riccardo aveva gia' fatto togliere il 28/07 con
        `b05169e` («gran parte del lavoro e' fatta» -> via), rientrata la sera stessa in `6c884dd`
        in forma PIU' assertiva mentre si fondevano le vecchie domande 1 e 3.
        Viola una regola RATIFICATA: `letsdonation-donorbox-identita.md` § «Tre regole per la
        conversazione», n.2 - «una stima di sforzo scritta da te su un sistema che non conosci ti
        toglie credibilita'. Mai "sono tre righe"». E le note qui sopra la elencano gia' come
        difetto corretto (:20-21). Sta in PRIMA PAGINA, nella domanda che il cappello dichiara
        portante, e la legge il tecnico che sa se e' vero.
        Ripristinata ESATTAMENTE la forma lasciata da `b05169e`. Il cappello di §5 («La prima dice
        quanto lavoro c'e' davvero») regge ancora: dichiara che la domanda RIVELA lo sforzo, non
        che lo stima.
        Classe: la stessa gia' a ledger il 29/07 mattina (`riscrittura-resuscita-decisione-
        precedente`). Il presidio non e' un'altra error-memory: e' `git log -S` sulla frase PRIMA
        di riscrivere una voce, che infatti l'ha trovata.

     2) «nome e indirizzo» -> «nome ed email», nelle DUE occorrenze (§1 e domanda 6).
        «Indirizzo» compariva 8 volte in TRE significati: l'email (5), l'URL delle chiavi (1) e
        questa coppia (2). In un documento sui dati che attraversano il confine, «nome e
        indirizzo» e' la coppia canonica dell'anagrafica POSTALE - e su una piattaforma che
        emette ricevute fiscali e' la lettura naturale. La prima occorrenza sta a pagina 1 e la
        tabella che disambigua a pagina 3. Il canonico non dice mai «nome e indirizzo»: dice
        «nome, cognome ed email» (`scambio-dati-quadro.md:496,634,672`).

     3) 🔴 «quindi e' SEMPRE reale» sulla riga `email`: assoluto SMENTITO dal database vivo.
        Interrogato il 2026-07-29: 2 utenti. 🔴 **CORREZIONE della notte del 29/07: sono 2 su 2
        CONFERMATI, non «0 mai confermati» come diceva questa nota** - e l'inferenza che ne
        seguiva («quindi non si entra prima di aver confermato e' VERO») non seguiva comunque dal
        numero. La frase resta vera, ma per un'altra prova: l'utente registrato con email ha
        confermato **59 minuti dopo** la creazione (`email_confirmed_at - created_at = 3540s`),
        il che dimostra che l'auto-conferma del server e' SPENTA. Il fatto che regge e'
        l'altro: **1 dei 2 porta un alias
        `@privaterelay.appleid.com`** - un indirizzo che INOLTRA, non quello della persona. Nato
        l'08/07, cioe' PRIMA che i social uscissero dal codice il 26/07. La verifica del 28/07
        aveva guardato il CODICE («0 login social») e ne aveva dedotto il DATABASE: togliere i
        pulsanti non cancella le identita' gia' nate. E' la classe zero-M, sul dato piu' esposto
        del documento.
        NON si e' messo il carve-out che il canonico prescrive (`scambio-dati-quadro.md:681`,
        «per le persone iscritte prima di luglio 2026 puo' essere un alias»): consegnerebbe al
        partner una debolezza scritta per DUE ACCOUNT DI PROVA su un progetto pre-lancio con zero
        utenti reali. Si e' tolta l'INFERENZA e lasciato il FATTO: «L'indirizzo dell'account,
        confermato: da noi non si entra prima di averlo confermato». Vero al 100%, oggi e dopo il
        lancio (nessun nuovo account puo' piu' nascere con un alias), e non promette un'identita'
        fra indirizzo e persona che il matching non deve dare per scontata.
        Il caso «indirizzo che non coincide» resta comunque coperto: e' il secondo ramo della
        domanda 3, che lo dichiara «da risolvere, non solo segnalare».
        🔑 STRADA PIU' PULITA, ma e' una scrittura sul database di produzione e quindi decisione
        di Riccardo: cancellare l'account di prova con l'alias. Fatto quello, la frase forte
        tornerebbe vera e verificata.

     4) 🔴 «`name` PUO' MANCARE» era falso, e il modo in cui e' falso e' peggio dell'assenza: il
        claim non arriva mai vuoto perche' **il server ripiega sull'indirizzo email** quando la
        chiave non c'e' - lo dice il nostro stesso piano (`oidc-server-implementation-plan.md:90-92`).
        Il partner che legge «puo' mancare» prepara un ripiego proprio; invece riceve una stringa
        PIENA che e' un'email, e la scrive dove va il nome. Su una piattaforma con LISTE PUBBLICHE
        di donatori - le stesse della domanda 6 - e' un indirizzo email esposto in pubblico.
        Ora la riga dice cosa succede davvero e chiede di segnalarlo.

     5) La domanda 2 era l'unico punto senza il confine: «lasciare sulla pagina il solo pulsante».
        Ovunque altrove il documento dice «sulla pagina del NOSTRO SPAZIO», perche' il canonico
        vieta la formula larga (`scambio-dati-quadro.md:687`: «Il vostro modulo va rimosso dalla
        piattaforma» - «non e' ottenibile e non e' cio' che chiediamo»). Una domanda viene
        inoltrata da sola a un tecnico: fuori dal suo paragrafo si legge come «togliete il
        modulo dal sito». Aggiunte tre parole.

     ✅ SCIOLTA DA RICCARDO IL 2026-07-29: la PAGINA WEB NOSTRA ENTRA nel documento. Parole sue:
     «un bottone deve indirizzare al nostro [sito]. Una pagina di login che dobbiamo creare noi. E
     la pagina di login deve reindirizzare di nuovo alla loro pagina, pero' gia' loggati».
     Era rimasta fuori perche' e' una promessa di architettura (la categoria che lui stesso aveva
     fatto togliere) e la nota che la custodiva viveva in `letsdonation-proposta-operativa.md:8-14`,
     un file marcato «NON SI MANDA» che chi genera questo PDF non apre. Ora sta in §1, scritta al
     FUTURO e con la riserva esplicita («non perche' sia gia' pronta»), perche' la pagina non
     esiste: e' «il pezzo piu' grande» del piano (`oidc-server-implementation-plan.md:77-78`).
     Nella stessa richiesta, due cose in piu' che sono andate nella domanda 2:
       · chi arriva da un NOSTRO link deve trovare l'accesso a TUTTO SCHERMO; chi arriva per conto
         suo, un pulsante. Posta come domanda di fattibilita', non come istruzione;
       · la VESTE GRAFICA e' loro («anche i colori, tutto quello che vedra' loro»). Detto
         esplicitamente: e' una concessione che costa nulla e toglie un motivo di attrito.

     NON toccato, benche' emerso: il silenzio sui MINORENNI. Il canonico dice «va detto a loro»
     (`scambio-dati-quadro.md:206-210`) ma e' ANTERIORE alla decisione del 27/07 di aprire ai
     minorenni: oggi scrivere «siamo 18+» annuncerebbe al partner un limite che il proprietario
     ha deciso di togliere, e scrivere il contrario sarebbe falso nel prodotto (`constraint adult`
     vivo in `0001_profiles.sql:17`). Entrambi i rami non sono scrivibili -> resta fuori, e va
     riallineato il canonico, non il brief.

     STATO DELL'INVIO, verificato in questa passata: il provider OIDC e' SPENTO sul progetto vivo
     (`oauth/authorize` -> `feature_disabled`), ma le chiavi di firma sono GIA' asimmetriche
     (ES256): il piano le dava «da migrare» ed e' stato corretto. Il documento parla al futuro
     ovunque, quindi non promette nulla che non regga.
     ----------------------------------------------------------------------------------

     Il ragionamento integrale non e' andato perso, sta nei documenti NOSTRI:
       · scambio-dati-quadro.md ......... chi tiene cosa, cosa passa, prerequisiti, §8.1
       · identita-matrice-scenari.md .... gli scenari lato Let's Donation
       · app-gate-matrice.md ............ gli scenari lato nostro
       · ~/todos/partner-identita.md .... le decisioni e il perche' di ciascuna

     Stato: RIAPERTO il 2026-07-28. Il 27/07 Riccardo aveva deciso «dobbiamo andare entrambe
     assolutamente» (lettera + scheda); il 28/07 ha rimesso in discussione la lettera («serve
     solo il brief per i tecnici, a Michele gliel'ho gia' detto»). Controproposta in attesa di
     risposta: il testo della lettera diventa il CORPO DELL'EMAIL e questa scheda resta l'unico
     allegato. Finche' non risponde, non si manda nulla.
     Se si sceglie quella via, verificare che sopravvivano nel testo che resta: l'invariante I7
     (pulsante su e modulo giu' INSIEME) e «da noi si entra solo dopo aver confermato
     l'indirizzo» - oggi stanno in ENTRAMBI i documenti.
     Il nome del referente tecnico non e' confermato: non va scritto da nessuna parte.
-->

> Questa scheda descrive **il nostro lato** dell'integrazione: cosa mettiamo a disposizione, cosa
> va concordato fra noi, cosa ci serve sapere da voi.

---

## 1. L'obiettivo

Chi ha già un account Rise Against Hunger Italia entra nel nostro spazio sulla vostra piattaforma
**senza registrarsi una seconda volta**.

Oggi sulla pagina del nostro spazio c'è il vostro modulo di registrazione, e chi lo compila apre
una scheda che con la nostra non ha alcun legame: la stessa persona finisce in due archivi che non
si parlano, e quando aggiorna i suoi dati da una parte, dall'altra restano quelli vecchi.

Il punto d'arrivo è che su quella pagina ci sia il solo pulsante «Entra con Rise Against Hunger»:
chi ha già un account da noi entra con quello, e chi non ce l'ha lo crea in quel momento senza
compilare un secondo modulo — i dati minimi, nome ed email, arrivano dall'accesso.

Dalla nostra parte mettiamo in piedi il ruolo di **OpenID Provider**.

Dove porta il pulsante: a una **pagina di accesso nostra**, che costruiremo. Lì la persona
entra con l'account che ha già, oppure lo crea in quel momento se non ce l'ha, e torna sulla vostra
pagina **già riconosciuta**. Sta da noi perché si possa entrare anche da computer, senza avere la
nostra app, e perché chi si registra la prima volta lo faccia da noi: è la stessa cosa che succede
con «Accedi con Google», dove chi non ha l'account lo crea su Google, non sul sito che sta
visitando. Ve lo diciamo perché è un pezzo del disegno, non perché sia già pronta: quando lo sarà
ve lo comunichiamo.

---

## 2. Come ci dividiamo il lavoro

Dalla nostra parte spettano a noi l'OpenID Provider e le credenziali client dedicate a voi.

Una condizione riguarda tutti e due: sulla pagina del nostro spazio il pulsante di accesso e il
modulo di registrazione non possono convivere, e le due cose vanno insieme — il pulsante online e
il modulo tolto nello stesso momento, non una dopo l'altra.

Prima di aprire a tutti, proponiamo di provare il giro completo con due o tre persone vere.

---

## 3. Cosa mettiamo a disposizione

Il nostro provider lo mettiamo in piedi per questa integrazione: qui sotto c'è quello che vi
arriverà dalla nostra parte.

- Il documento di discovery (`.../.well-known/openid-configuration`), che contiene gli endpoint e
  l'indirizzo delle chiavi.
- `client_id` e `client_secret` dedicati a voi.
- L'autorizzazione dei redirect URI che ci indicate.
- **Una seconda coppia di credenziali per il collaudo**, con le redirect URI del vostro ambiente di
  prova: il giro con
  le due o tre persone si fa con quelle, non con le credenziali che poi restano in esercizio.
- Un riferimento nostro per tutta la messa in opera.

Tre cose della parte tecnica: meglio dirle ora che scoprirle al collaudo.

- **Gli scope da chiedere sono `openid email profile`.** L'indicatore di email verificata viaggia
  con `email`, il nome e il nickname con `profile`. Lo scope `phone` non serve: il numero di
  telefono non è fra i campi che vi consegniamo (in fondo alla Scheda dei dati c'è come chiederlo,
  se vi servisse, e cosa cambia leggendo da UserInfo invece che dall'ID token).
- **Le chiavi di firma cambiano.** Vanno lette dall'indirizzo che trovate nel discovery, non copiate
  nella vostra configurazione: oggi ce n'è una sola, ma il giorno in cui ruota chi l'ha copiata
  smette di validare i token, e sembrerà un guasto nostro.
- **Il nostro accesso non ha un endpoint di disconnessione** (`end_session_endpoint`): chi esce da
  noi non viene disconnesso anche da voi, e la sessione sulla vostra piattaforma resta in mano
  vostra come oggi. Se per voi è un problema, ditecelo prima di partire.

---

## 4. Cosa va concordato fra noi

- **La chiave di aggancio è il `sub`, non l'email.** È l'unico identificatore stabile che
  emettiamo; l'email le persone la cambiano. L'email serve una volta sola, al primo incontro con
  una scheda che da voi esiste già: da lì in poi la persona resta legata al `sub`.
- **Una persona, una scheda sola — e aggiornata.** L'aggancio tiene fermo *quale* account è; perché
  serva a qualcosa devono valere anche i dati che vi arrivano a ogni accesso, non quelli del primo
  giorno.
- **Le cancellazioni.** Quando una persona chiede a noi di sparire, l'art. 19 del GDPR ci obbliga a
  dirvelo. La parte che invia la costruiamo noi; serve il canale su cui farla arrivare.
- **Uso del token.** L'identità si legge dall'**ID token**, senza usare il token di accesso verso
  altre nostre funzioni: è la prassi. Se
  preferite leggerla da UserInfo, tenete
  conto della precisazione in fondo alla Scheda dei dati: quella risposta contiene anche un blocco
  che nell'ID token non c'è.
- **Tre casi del flusso che vale la pena nominare prima del collaudo.** Il **rifiuto**: se la
  persona non dà il consenso sulla nostra pagina, torna da voi senza identità — è un esito normale
  del giro, non un errore nostro. Gli **accessi contemporanei**: se per la stessa persona nuova ne
  partono due insieme, il `sub` che vi arriva è identico in entrambi, ed è quello che permette di
  riconoscere che si tratta della stessa persona. La **rotazione del `client_secret`**: ogni tanto
  lo cambiamo, e la programmiamo insieme a voi invece di farvela trovare fatta.
- **Se il nostro accesso non risponde.** Tolto il modulo, per quel tempo su quella pagina non si
  entra e non ci si registra: è la conseguenza di avere una porta sola, e la accettiamo, perché due
  porte ricreano le due anagrafiche che stiamo unendo. Da parte nostra sorvegliamo il servizio e vi
  diamo un recapito per segnalarci un blocco. Quello che chiediamo è di non rimettere il modulo come
  rimedio: l'accesso torna, mentre gli account nati nel frattempo da un secondo modulo restano
  scollegati per sempre.

---

## 5. Cosa ci serve sapere da voi

Sei domande, più due richieste puntuali segnate nel testo. La prima dice quanto lavoro c'è davvero;
la quarta è quella da cui dipende il
risultato.

1. **Come funziona il collegamento che avete con Zucchetti?** Come ci era stato raccontato, i loro
   dipendenti arrivano già registrati: se è un accesso unico come quello che proponiamo, a noi basta sapere
   come replicarlo — il nome del sistema, il documento che vi hanno dato, o chi l'ha collegato. Se
   invece funziona in un altro modo, dal vostro lato serve un client OpenID Connect: diteci cosa
   comporta, così ci regoliamo sui tempi.
2. **Cosa impedisce, oggi, di lasciare sulla pagina del nostro spazio il solo pulsante?** Il modulo va tolto nel
   momento stesso in cui il pulsante va online. Se c'è un vincolo che lo blocca, è la prima
   cosa che guardiamo insieme.
   Sullo stesso schermo, una cosa che ci sta a cuore: chi arriva su quella pagina passando da un
   nostro link — dalla nostra app o da altrove — vorremmo trovasse l'accesso **come prima cosa, a tutto schermo**,
   invece di doverlo cercare; chi ci arriva per conto proprio lo troverebbe come pulsante fra i
   contenuti. È impostabile dalla vostra parte, e a quali condizioni?
   **La veste grafica la decidete voi**: colori e forma sono i vostri, a noi interessa solo che
   l'accesso si veda.
3. **Come si ricongiungono le due schede di una stessa persona?** Chi da voi ha già un account deve
   ritrovare quello, non trovarsene uno nuovo e vuoto. Quando l'email coincide immaginiamo sia
   immediato; il caso che ci interessa è l'altro, perché capiterà spesso: chi ha donato anni fa e
   oggi si registra da noi con un'email diversa da quella che avete in archivio. Come lo gestite?
   Una condizione, che vale soprattutto per voi: l'aggancio per email tiene solo se quell'indirizzo
   è **confermato da tutt'e due le parti**. Dalla nostra lo è sempre. Se dalla vostra esistono schede
   con un indirizzo mai confermato, agganciarle a chi si presenta con lo stesso indirizzo significa
   consegnare la scheda di una persona a un'altra. Lo segnaliamo perché è un caso che abbiamo appena
   chiuso dalla nostra parte.
4. **Quando un dato cambia da noi, il vostro lato lo rilegge?** A ogni accesso vi arrivano i valori
   aggiornati: ci serve sapere se li usate ogni volta o soltanto la prima, per creare l'account.
   Se valgono solo alla creazione, chi aggiorna l'email da noi continua a risultare da voi con
   quella vecchia, e il problema resta intero.
   Un dettaglio della stessa famiglia: il vostro lato pretende `email_verified: true` per creare
   l'account? Il campo lo emettiamo; la garanzia però non sta nel flag, sta nel fatto che senza
   conferma da noi non si entra. Se per voi è una condizione bloccante ditecelo ora, così è fra le
   prime cose che guardiamo insieme quando proviamo il giro.
5. **Le cancellazioni**: oggi come le trattate, e a quale recapito possiamo comunicarvi quelle che
   arrivano a noi? Se il collegamento che mettiamo in piedi copre già anche questo, tanto meglio:
   diteci come.
6. **I due campi del vostro modulo che il nostro accesso non copre**: la scelta su come apparire
   nelle liste pubbliche e l'adesione a community e classifiche.
   Oggi la visibilità e la community le sceglie la persona mentre compila il vostro modulo, e la
   visibilità in particolare è obbligatoria, senza opzione preselezionata. Quando sulla pagina del
   nostro spazio quel modulo non c'è più, l'account nasce dall'accesso con i dati che arrivano da noi
   — nome ed email, più il nickname quando la persona l'ha scelto — e quelle due scelte non le fa
   più nessuno: con quale valore nascono, uno deciso da voi o chiesto alla persona dopo il primo
   ingresso?
   Ci pesa soprattutto la visibilità, l'unica delle due con un effetto pubblico: qualunque sia la
   strada, dobbiamo poter scrivere nella nostra informativa cosa succede. E se la strada fosse
   chiederlo, basterebbe quella domanda dopo l'ingresso: non sarebbe un secondo modulo di
   registrazione, che è la cosa che vogliamo evitare a chi entra.

   **Il nickname invece ve lo mandiamo noi** — lo stiamo aggiungendo alla nostra registrazione, e
   **vi confermiamo noi il giorno in cui è attivo**. Non è un buco permanente da aggirare, ma non
   legatelo all'accensione: se il campo non fosse ancora online il giorno dello scambio, l'accesso
   funziona lo stesso e il nickname arriva dopo.
   Resta **facoltativo** anche quando sarà attivo, quindi un comportamento per l'assenza vi serve
   comunque, e ce l'abbiamo presente: **chi si è registrato da noi prima che il campo esistesse non
   ce l'ha**, e potrebbe non metterlo mai. Per un po' l'assenza sarà la norma, non l'eccezione.
   Quattro cose che vi servono per accoglierlo:
   - **la forma**: da 2 a 30 caratteri, senza spazi ai bordi. Sui caratteri non poniamo vincoli e
     **non filtriamo i contenuti** — se sul vostro sito è testo pubblico, la moderazione è vostra;
   - **quando manca**, il campo non arriva vuoto: non c'è proprio. Vale sia per chi non l'ha scelto,
     sia per chi l'ha cancellato dopo — ed è la stessa cosa vista da voi, quindi diteci cosa mostrate
     in quel caso;
   - **è unico da voi?** Da noi oggi no: due persone possono sceglierne uno uguale. E anche se lo
     rendessimo unico fra i nostri, resterebbe la collisione con i nickname di chi si è registrato
     da voi, che non passano da noi. Quindi la domanda è: quando ve ne arriva uno già in uso, cosa
     fate — lo modificate voi, lo ignorate, o altro? L'unica strada che ci preoccupa è che l'accesso
     fallisca: chi entra deve poter entrare, il nickname non vale una registrazione persa;
   - **dove lo mostrate, e a chi?** Ci serve per scrivere nella nostra informativa cosa succede al
     dato che vi mandiamo. Notiamo che da voi il nickname è una delle opzioni della visibilità nelle
     liste pubbliche: se qualcuno sceglie di apparire col nickname e il nickname non c'è, cosa
     compare al suo posto?

   **I vostri due consensi sulle comunicazioni** stanno nella stessa condizione delle due scelte qui
   sopra: nessuno dei due vi
   arriva insieme all'accesso — quello sugli enti beneficiari da noi non esiste, e il nostro vale per
   le comunicazioni nostre, non per le vostre. Non essendoci, non c'è un «sì» della persona che
   possiate ereditare da noi.

   **Un terzo caso, di natura diversa: il Paese.** È obbligatorio nel vostro modulo e noi lo
   raccogliamo, ma **non ve lo consegniamo con l'accesso**: nell'ID token arrivano i dati
   dell'identità — identificativo, nome, email, nickname — e il Paese non è fra questi. Quindi non è
   come i due campi elencati all'inizio («non ce l'abbiamo»), è «ce l'abbiamo e non passa di lì».
   Con quale valore nasce l'account, e vi serve che ve lo facciamo arrivare in altro modo?
   Se leggendo trovate altri campi del vostro modulo nella stessa condizione, segnalateceli:
   l'elenco nasce da quello che vediamo noi della vostra pagina, non dal vostro schema.

---

## Scheda dei dati

**Cosa emettiamo a ogni accesso** - sono i campi dell'**identità**, tutti standard, e viaggiano
nell'**ID token**. I primi quattro ci sono sempre; l'ultimo solo se la persona l'ha compilato:

| Campo | Cosa contiene |
| --- | --- |
| `sub` | La chiave di aggancio: individua la persona presso di noi in modo permanente. Non contiene nome né altri suoi dati, ma non è anonimo: è uno pseudonimo |
| `name` | Nome e cognome in una sola stringa. Non arriva mai vuoto: se il nostro sistema non l'avesse, al suo posto partirebbe l'indirizzo email — se lo vedete, ditecelo, perché come nome visibile non va |
| `email` | L'indirizzo dell'account, confermato: da noi non si entra prima di averlo confermato |
| `email_verified` | Il flag del nostro provider. La garanzia non poggia su questo, ma sul fatto che senza conferma non si entra |
| `preferred_username` | Il nickname scelto dalla persona. **Lo stiamo aggiungendo alla nostra registrazione**, e vi confermiamo noi il giorno in cui è attivo. Da 2 a 30 caratteri, senza spazi ai bordi; sui caratteri non poniamo vincoli e non filtriamo i contenuti. È **facoltativo**: quando manca non arriva vuoto, semplicemente non c'è — e manca sia per chi non l'ha scelto, sia per chi si è registrato prima che il campo esistesse, sia per chi l'ha cancellato dopo |

**Una precisazione su UserInfo.** La tabella qui sopra descrive l'**ID token**, ed è da lì che vi
chiediamo di leggere l'identità: oltre ai campi elencati porta i dati tecnici del token (chi l'ha
emesso, quando scade, quando l'account è stato aggiornato l'ultima volta) e, per gli accessi che la
forniscono, l'indirizzo dell'immagine di profilo. La risposta di
UserInfo, con lo scope `profile`, porta in più **un blocco dell'account che non fa parte
dell'identità**: **prima di attivare il servizio lo riduciamo ai soli campi dell'accesso**, e ve lo
confermiamo quando è fatto. Se per un vostro vincolo doveste leggere da UserInfo invece che dall'ID
token, ditecelo ora, così lo teniamo presente nel collaudo.

Una seconda differenza, che riguarda la domanda 4. Da noi il caso non si presenta - non si entra
prima di aver confermato - ma per completezza: nell'ID token l'indicatore di email verificata
c'è **sempre**, anche quando vale «falso». Nella risposta di UserInfo, invece, quando l'email non è
confermata quel campo **non compare affatto**. Se il vostro controllo si aspetta un valore e trova
un campo assente, conviene trattare l'assenza come «non confermata».

**Se vi servono altri dati** oltre a questi - il telefono, per esempio - diteci quali e per farci
cosa. Non li mandiamo per abitudine: ogni dato in più è un dato in più da custodire per entrambi, e
prima di impegnarci guardiamo cosa il protocollo permette di trasportare davvero.
