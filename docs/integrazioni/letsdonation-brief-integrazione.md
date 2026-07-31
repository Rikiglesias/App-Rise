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

     NON toccato, benche' emerso: il silenzio sui MINORENNI. Il canonico diceva «va detto a loro»
     (`scambio-dati-quadro.md:206-210`) ma era ANTERIORE alla decisione del 27/07 di aprire ai
     minorenni: scrivere «siamo 18+» avrebbe annunciato al partner un limite che il proprietario
     aveva deciso di togliere, e scrivere il contrario sarebbe stato falso nel prodotto. Entrambi
     i rami non erano scrivibili -> restava fuori.
     AGGIORNAMENTO 30/07/2026: il ramo si e' sbloccato da solo. Il prodotto ORA dice 14 anni
     (migration 0019: `constraint eta_minima`; app: `MIN_AGE_YEARS`), e il canonico e' stato
     riallineato. Quindi «dai 14 anni» sarebbe finalmente scrivibile senza mentire.
     RESTA COMUNQUE FUORI da questa versione: e' una decisione di Riccardo, non una conseguenza
     tecnica, e il documento e' gia' al limite delle pagine. Da riproporre quando decide.
     ⚠️ PRECONDIZIONE PRIMA DI SCRIVERLO IN QUALSIASI DOCUMENTO IN USCITA: la 0019 non e'
     applicata al database vivo (fermo alla 0016) e l'informativa dice ancora un'altra cosa.

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

     PASSATA DEL 2026-07-30 - LE RICHIESTE DI RICCARDO, E IL DOCUMENTO DA 5 A 3 PAGINE.
     Quattro passaggi segnati da lui rileggendo il brief. TRE TOLTI, uno RISCRITTO:
       1. «Sta da noi perche' si possa entrare anche da computer... come Accedi con Google»
          -> TOLTO («non e' necessario dirlo»). Giustificava una scelta nostra che il partner
          non deve approvare. Registrato in frasi-ritirate.json.
       2. «Il pulsante apre la pagina, non l'applicazione» -> TOLTO («non serve dirlo»).
          ATTENZIONE: e' l'unico dei quattro che toglie una CONDIZIONE TECNICA VERA. Oggi
          regge da se' (nessun app-link in app.config.js), ma il giorno in cui ne
          registrassimo uno il giro da telefono si romperebbe e il partner non saprebbe che
          era una condizione. Vincolo NOSTRO, tracciato fuori dal brief.
       3. «L'aggancio per email tiene solo se confermato da tutt'e due le parti» -> TOLTO
          («non capisco perche' dirlo»). E' il taglio che COSTA DI PIU': era l'unico avviso
          di sicurezza rivolto a loro (agganciare schede con indirizzo mai confermato =
          consegnare la scheda di una persona a un'altra, la falla che noi abbiamo chiuso
          con la 0016). Costo dichiarato a Riccardo in chat PRIMA di eseguire il taglio.
       4. «Se il nostro accesso non risponde...» -> RISCRITTO, non tolto: la sua obiezione
          era «non capisco cosa voglia dire», cioe' un problema di scrittura. Il rischio e'
          reale (rimettere il modulo durante un blocco lascia account scollegati per sempre).
     Le tre frasi tolte sono ora in frasi-ritirate.json, provate con tre mutanti: rimettendole
     nel testo consegnato la generazione del PDF si ferma (3 su 3).

     ALTRE MODIFICHE DELLA STESSA PASSATA:
       - il nickname e' descritto al PRESENTE (Riccardo: «fai finta che sia gia' pronto»).
         PREREQUISITO REALE: 0017 e 0018 non sono applicate (DB alla 0016) -> vanno applicate
         PRIMA dell'invio, altrimenti il documento promette un campo che non esiste.
       - la MODERAZIONE del nickname passa a NOI (era attribuita al partner). Formula vera
         oggi: nessun filtro automatico, rimozione su segnalazione. Non scrivere mai «lo
         moderiamo» finche' un filtro non esiste davvero.
       - il PAESE: non viaggia nell'ID token (GenerateIDToken assegna solo name, picture,
         preferred_username, updated_at). La prima stesura di questa passata offriva la
         lettura da UserInfo come seconda strada: RITIRATA dopo il critico avversariale,
         perche' contraddiceva la promessa - nella stessa pagina - di ridurre UserInfo ai soli
         campi dell'accesso, e perche' dipende dalla bonifica dei metadata (0019) che non e'
         ancora decisa. Ora il brief CHIEDE se serve, senza promettere il come.
       - LE PAGINE, in due tempi: prima il testo asciugato del 19% a contenuto invariato, poi
         l'impaginazione (margini 20/18 -> 18/15 mm, interlinea 14.2 -> 13.4). Con quel giro il
         documento stava in 3 pagine, ma erano state sacrificate quattro cose che nessuno aveva
         chiesto di togliere.
       - RIAPERTO LA SERA STESSA da Riccardo: «tre pagine e mezza vanno bene comunque, pero' e'
         importante che ci sia di tutto l'importante». Rientrano quindi: il caso dei DUE ACCESSI
         CONTEMPORANEI, la regola che seguiamo gia' noi sul nickname occupato, la garanzia dietro
         email_verified (non e' il flag, e' che senza conferma non si entra) e il perche' non
         mandiamo dati per abitudine. STATO ATTUALE: 4 pagine, l'ultima di ~80 parole. Chiuderla
         significa togliere di nuovo esattamente quelle quattro cose: se qualcuno in futuro vuole
         ricompattare il documento, sappia che quello e' il prezzo, e che e' gia' stato scartato.

     ----------------------------------------------------------------------------------
     PASSATA DEL 2026-07-31 - tre rilievi di Riccardo sul PDF, piu' uno trovato allargando.

     1) 🔴 DUPLICAZIONE CANCELLAZIONI (suo rilievo): il tema stava in §4 come requisito e in §5
        come domanda 5. Sue parole: «non ha senso scriverlo entrambi... basta metterlo insieme
        cosi' non ci si perde». UNIFICATE nella domanda 5; il bullet di §4 e' uscito.
        ⚠️ QUESTA MOSSA RIBALTA UNA DECISIONE SUA DEL 28/07, e va saputo prima di rifarla al
        contrario: `710081a` aveva stabilito il contratto di forma «§4 dichiara il REQUISITO, §5
        porta il QUESITO», e `6c884dd` (passata anti-duplicazione voluta da lui) le aveva
        VALUTATE e TENUTE separate. Perche' il ribaltamento e' comunque giusto: quel fix doveva
        togliere il quesito dal §4 e ne ha lasciato un pezzo - «serve il canale su cui farla
        arrivare» E' la domanda 5, scritta due pagine prima. La duplicazione era reale e residua,
        non un capriccio di lettura.
        Scelto §5 e non §4 perche' cio' che manca e' una RISPOSTA loro (come le trattate + a quale
        recapito): e' il criterio canonico stesso («sale in §5 cio' che riguarda il loro sistema»).
        E perche' cosi' NESSUN numero cambia: 5 resta 5, 6 resta 6, «Sei domande» resta vero, e
        nessun rimando si rompe - la classe di errore della numerazione 7->5, gia' occorsa qui.

     2) IL GEMELLO CHE NESSUNO AVEVA CHIESTO (perimetro, zero-L): §4 duplicava §5 anche in un
        SECONDO punto. «Una persona, una scheda sola - **e aggiornata**... devono valere anche i
        dati che vi arrivano a ogni accesso, non quelli del primo giorno» e' la domanda 4 («il
        vostro lato lo rilegge?»), dichiarata dal cappello «quella da cui dipende il risultato».
        Prima lo pretendevamo, due pagine dopo lo chiedevamo come favore. E' la stessa coppia che
        `710081a` dichiarava di aver disinnescato («il §4 ripeteva il §5 in DUE punti»): sul
        recapito era rimasto un residuo (punto 1), qui era rimasto tutto.
        RIMEDIO: i due primi bullet di §4 sono stati FUSI in uno. La coda «e aggiornata» esce da
        §4 e vive dove chiede una risposta (domanda 4); il requisito «una scheda sola» sopravvive
        dentro il punto sul `sub`. NON si e' scritto «chi torna ritrova la sua scheda»: sarebbe
        stata una duplicazione NUOVA della domanda 3, che dice gia' quelle parole.
        NON toccata la terza coppia possibile, §4 `sub` <-> domanda 3: sono complementari (l'uno
        fissa la chiave DOPO l'aggancio, l'altra chiede COME si trova la scheda esistente).

     3) 🔴 LA PRECISAZIONE SU USERINFO ERA SCADUTA, e prometteva piu' del vero (suo rilievo: «fino
        a "ditecelo ora" non ho capito cosa vuol dire, assicurati che sia tutto giusto»).
        Due difetti distinti, non uno:
        · SCADUTA - diceva «**prima di attivare il servizio lo riduciamo** ai soli campi
          dell'accesso, e ve lo confermiamo quando e' fatto»: un impegno al FUTURO su una cosa
          fatta il 2026-07-31 (migration 0019 applicata al DB vivo). Un impegno che ci obbliga a
          mandare una conferma per un lavoro gia' concluso.
        · PIU' AMPIA DEL VERO - «ridotto ai SOLI campi dell'accesso» non e' quello che il codice
          fa. La 0019 toglie NOVE chiavi e solo quelle (`0019:382-385`); UserInfo continua a
          consegnare i `user_metadata` INTERI (`OAuthUserInfo`, `handlers.go:716-719`: assegnazione
          diretta della map, nessuna whitelist). Interrogato il DB vivo il 31/07: restano `email`,
          `email_verified`, `phone_verified`, `sub` - e sull'unico account Apple storico anche
          `iss`, `provider_id`, `custom_claims`. Nessuna anagrafica: la bonifica ha funzionato.
          Ma `phone_verified` e i contrassegni del provider NON sono «campi dell'accesso»: la
          promessa era da ritrattare davanti a loro.
        · INCOMPRENSIBILE - «ditecelo ora» non diceva PERCHE'. Ora il nesso c'e': ditecelo prima
          del collaudo *perche' un campo si comporta in modo diverso*, ed e' quello del capoverso
          successivo (l'indicatore di email verificata, che da UserInfo sparisce invece di valere
          «falso»). Il secondo capoverso e' stato agganciato al primo, non lasciato orfano.
        RISPETTATE le decisioni gia' prese: NON si elencano al partner i campi anagrafici (sarebbe
        la mappa della falla, `d03dd6e`); NON si riscrive «porta solo dati tecnici» (assoluto rotto
        quattro volte); la menzione dell'immagine di profilo RESTA con la formula aperta «per gli
        accessi che la forniscono», senza nominare i provider al presente (`f56d98c`).

     4) IMMAGINE DI PROFILO - domanda nuova di Riccardo («non avevo pensato all'immagine profilo»).
        ANALIZZATA, NON aggiunta al documento: e' una decisione di prodotto sua, e il brief non
        promette architettura. I fatti che servono a decidere, tutti verificati alla fonte:
        · NON ESISTE in nessuno strato del prodotto: 0 colonne DB, 0 bucket Storage (`select
          count(*) from storage.buckets` = 0 sul progetto vivo), 0 dipendenze picker, 0 scritture
          di `avatar_url`/`picture`. `git log -S` su tutti i branch: mai esistita, nemmeno prima
          della rimozione dei social. Oggi l'app mostra un'icona vettoriale (`HomeScreen.tsx:94`).
        · IL LORO MODULO NON LA CHIEDE: le 11 voci verificate dal vivo il 25/07
          (`scambio-dati-quadro.md:100-112`) non contengono nessun campo immagine. Non e' un buco
          da colmare come lo era il nickname.
        · IL CANALE OIDC E' GIA' PRONTO: `picture` e' claim standard con scope `profile`, e la
          0019 lo PRESERVA di proposito (`0019:62-64`). Si comporta come `preferred_username`, non
          come `name`: se manca viene OMESSO, nessun ripiego (`service.go:829-834`).
        · 🔴 MA NESSUNA VALIDAZIONE DELL'URL, in nessuno dei due sensi: in scrittura
          `PUT /user` fa un merge grezzo della map (`models/user.go:229-241`), in lettura il claim
          copia la stringa verbatim. Qualunque cosa scriva il client finisce nel claim - `javascript:`,
          `data:`, un host arbitrario - e da li' sulle loro pagine pubbliche.
        · E ROMPE UNA DICHIARAZIONE NOSTRA: `standards/legal-compliance.md:68` dice «Upload di
          contenuti utente (foto, file) - **assenti**». Aggiungerla obbliga a correggere quel
          documento e l'informativa, e a cancellare il file dallo Storage alla cancellazione
          dell'account (oggi `delete-account` non tocca lo Storage, che non esiste).
        VERDETTO PORTATO A RICCARDO: non aggiungerla ora. Il costo non e' un campo, e' una feature
        intera (bucket + policy + colonna + picker + resize + sync del claim + moderazione di
        contenuti VISIVI + informativa), e la moderazione e' di un altro ordine rispetto al
        nickname: «nessun filtro automatico, rimozione su segnalazione» regge su una parola, non
        su un'immagine che compare sulle liste pubbliche di un partner.
     ----------------------------------------------------------------------------------
-->

## 1. L'obiettivo

Chi ha già un account Rise Against Hunger Italia entra nel nostro spazio sulla vostra piattaforma
**senza registrarsi una seconda volta**. Oggi su quella pagina c'è il vostro modulo: chi lo compila
apre una scheda che con la nostra non ha alcun legame, e la stessa persona finisce in due archivi
che non si parlano — aggiorna i dati da una parte, dall'altra restano quelli vecchi.

Il punto d'arrivo è il solo pulsante «Entra con Rise Against Hunger»: chi ha già un account da noi
entra con quello, chi non ce l'ha lo crea in quel momento senza un secondo modulo — nome ed email
arrivano dall'accesso. Dalla nostra parte mettiamo in piedi il ruolo di **OpenID Provider**.

Il pulsante porta a una **pagina di accesso nostra**, che costruiremo: lì la persona entra o si
registra, e torna sulla vostra pagina **già riconosciuta**. Non è ancora pronta: quando lo sarà ve
lo comunichiamo.

---

## 2. Come ci dividiamo il lavoro

A noi spettano l'OpenID Provider e le credenziali client dedicate a voi. Una condizione riguarda
tutti e due: sulla pagina del nostro spazio il pulsante e il modulo di registrazione non possono
convivere — il pulsante online e il modulo tolto nello stesso momento, non una dopo l'altra. Prima
di aprire a tutti, proponiamo di provare il giro completo con due o tre persone vere.

**Sui tempi**: vorremmo arrivarci **il prima possibile**, ma non vi mettiamo una data davanti prima
di sapere cosa comporta dalla vostra: fateci le vostre valutazioni, diteci quanto vi serve, e
fissiamo insieme il giorno in cui il pulsante va online e il modulo viene tolto.

---

## 3. Cosa mettiamo a disposizione

Il provider lo mettiamo in piedi per questa integrazione. Vi arriveranno:

- il documento di discovery (`.../.well-known/openid-configuration`), con gli endpoint e l'indirizzo
  delle chiavi;
- `client_id` e `client_secret` dedicati a voi, e l'autorizzazione dei redirect URI che ci indicate;
- **una seconda coppia di credenziali per il collaudo**, con le redirect URI del vostro ambiente di
  prova: il giro di prova si fa con quelle, non con quelle di esercizio;
- un riferimento nostro per tutta la messa in opera.

Tre cose tecniche, meglio dirle ora che scoprirle al collaudo.

- **Gli scope da chiedere sono `openid email profile`.** L'indicatore di email verificata viaggia
  con `email`, il nome e il nickname con `profile`. Lo scope `phone` non serve: il telefono non è
  fra i campi che vi consegniamo. **Se vi servissero altri dati** — il telefono, per esempio —
  diteci quali e per farci cosa: non li mandiamo per abitudine, perché ogni dato in più è un dato in
  più da custodire per entrambi.
- **Le chiavi di firma cambiano.** Vanno lette dall'indirizzo che trovate nel discovery, non copiate
  nella vostra configurazione: oggi ce n'è una sola, ma il giorno in cui ruota chi l'ha copiata
  smette di validare i token, e sembrerà un guasto nostro.
- **Il nostro accesso non ha un endpoint di disconnessione** (`end_session_endpoint`): chi esce da
  noi non viene disconnesso anche da voi, e la sessione sulla vostra piattaforma resta in mano
  vostra come oggi. Se per voi è un problema, ditecelo prima di partire.

---

## 4. Cosa va concordato fra noi

- **La chiave di aggancio è il `sub`, non l'email.** È l'unico identificatore stabile che emettiamo;
  l'email le persone la cambiano. Serve una volta sola, al primo incontro con una scheda che da voi
  esiste già: da lì in poi la persona resta legata al `sub`, e resta **una scheda sola**.
- **Uso del token.** L'identità si legge dall'**ID token**, senza usare il token di accesso verso
  altre nostre funzioni: è la prassi. Se doveste leggerla da UserInfo, tenete conto della
  precisazione in fondo alla Scheda dei dati: quella risposta porta, accanto all'identità, una copia
  di quello che il nostro sistema di accesso tiene sull'account.
- **Tre casi da nominare prima del collaudo.** Se la persona **non dà il consenso** sulla nostra
  pagina torna da voi senza identità: è un esito normale, non un errore nostro.
  Gli **accessi contemporanei**: se per la stessa persona nuova ne partono due insieme, il `sub` è
  identico in entrambi, ed è quello che permette di riconoscere che si tratta della stessa persona,
  invece di aprire due schede. E il **`client_secret` ogni tanto lo cambiamo**: la rotazione la
  programmiamo insieme a voi, invece di farvela trovare fatta.
- **Se il nostro accesso si blocca.** Con una porta sola, per quel tempo su quella pagina non si
  entra: lo mettiamo in conto, e vi diamo un recapito per segnalarcelo. L'unica cosa da non fare è
  rimettere il modulo mentre aspettate — il blocco passa, gli account nati da quel modulo restano
  scollegati per sempre.

---

## 5. Cosa ci serve sapere da voi

Sei domande. La prima dice quanto lavoro c'è davvero; la quarta è quella da cui dipende il risultato.

1. **Come funziona il collegamento che avete con Zucchetti?** Ci era stato raccontato che i loro
   dipendenti arrivano già registrati: se è un accesso unico come questo, a noi basta sapere come
   replicarlo — il nome del sistema, il documento che vi hanno dato, o chi l'ha collegato. Se invece
   funziona in altro modo, dal vostro lato serve un client OpenID Connect: diteci cosa comporta, così
   ci regoliamo sui tempi.
2. **Cosa impedisce, oggi, di lasciare sulla pagina del nostro spazio il solo pulsante?** Il modulo
   va tolto nel momento stesso in cui il pulsante va online: se c'è un vincolo che lo blocca, è la
   prima cosa che guardiamo insieme. Sullo stesso schermo, una cosa che ci sta a cuore: chi arriva da
   un nostro link vorremmo trovasse l'accesso **come prima cosa, a tutto schermo**, mentre chi ci
   arriva per conto proprio lo troverebbe come pulsante fra i contenuti. È impostabile dalla vostra
   parte, e a quali condizioni? **La veste grafica la decidete voi**: a noi interessa solo che
   l'accesso si veda.
3. **Come si ricongiungono le due schede di una stessa persona?** Chi da voi ha già un account deve
   ritrovare quello, non trovarsene uno nuovo e vuoto. Quando l'email coincide immaginiamo sia
   immediato; il caso che ci interessa è l'altro, perché capiterà spesso: chi ha donato anni fa e
   oggi si registra da noi con un'email diversa da quella che avete in archivio.
4. **Quando un dato cambia da noi, il vostro lato lo rilegge?** A ogni accesso vi arrivano i valori
   aggiornati: ci serve sapere se li usate ogni volta o solo alla creazione dell'account. Se solo
   alla creazione, chi aggiorna l'email da noi continua a risultare da voi con quella vecchia.
   Della stessa famiglia: il vostro lato pretende `email_verified: true` per creare l'account? Il
   campo lo emettiamo; la garanzia però non sta nel flag, sta nel fatto che
   **senza conferma da noi non si entra**. Se per voi è una condizione bloccante ditecelo ora, così
   è fra le prime cose che guardiamo insieme quando proviamo il giro.
5. **Le cancellazioni.** Quando una persona chiede a noi di sparire, l'art. 19 del GDPR ci obbliga a
   dirvelo: la parte che invia la costruiamo noi, e resta da concordare il canale su cui farla
   arrivare. Oggi come le trattate, e a quale recapito possiamo comunicarvele? Se il collegamento
   che mettiamo in piedi copre già anche questo, diteci come.
6. **I due campi del vostro modulo che il nostro accesso non copre**: la scelta su come apparire
   nelle liste pubbliche e l'adesione a community e classifiche. Oggi le sceglie la persona sul
   vostro modulo, e la visibilità è obbligatoria, senza opzione preselezionata. Tolto il modulo,
   l'account nasce dall'accesso e quelle due scelte non le fa più nessuno: con quale valore nascono,
   uno deciso da voi o chiesto alla persona dopo il primo ingresso? Ci pesa soprattutto la
   visibilità, l'unica con un effetto pubblico: qualunque sia la strada, dobbiamo poter scrivere
   nella nostra informativa cosa succede. Se la strada fosse chiederlo, una domanda dopo l'ingresso
   non è un secondo modulo di registrazione.

   **Il nickname invece ve lo mandiamo noi**: da 2 a 30 caratteri, senza spazi ai bordi, nessun
   vincolo sui caratteri. È **facoltativo**, e quando manca non arriva vuoto — non c'è proprio.
   Molte persone non lo compilano, quindi l'assenza è un caso ordinario e non un errore: diteci
   cosa mostrate in quel caso. Tre cose:
   - **il contenuto è responsabilità nostra**, perché nasce nella nostra registrazione: non
     applichiamo un filtro automatico, ma se ve ne arriva uno offensivo, o che finge di essere
     qualcun altro, segnalatecelo — lo togliamo dal nostro lato e smette di arrivarvi;
   - **è unico da voi?** Da noi **sì**, e due scritture che differiscono per una sola maiuscola
     valgono come lo stesso nome. Resta la collisione con i nickname nati da voi, che non passano da
     noi: quando ve ne arriva uno già in uso, cosa fate? La strada che ci preoccupa è che l'accesso
     fallisca — il nickname non vale una registrazione persa. È la regola che seguiamo già da noi:
     se al momento della registrazione il nome scelto risulta occupato, **la persona entra comunque**
     e il nickname resta vuoto, da rimettere quando vuole;
   - **dove lo mostrate, e a chi?** Ci serve per la nostra informativa. Da voi il nickname è una
     delle opzioni della visibilità: se qualcuno sceglie di apparire col nickname e non ce l'ha, cosa
     compare al suo posto?

   **I vostri due consensi sulle comunicazioni** stanno nella stessa condizione: nessuno dei due vi
   arriva con l'accesso — quello sugli enti beneficiari da noi non esiste, e il nostro vale per le
   comunicazioni nostre, non per le vostre. Non essendoci, non c'è un «sì» che possiate ereditare.

   **Un terzo caso, di natura diversa: il Paese.** È obbligatorio nel vostro modulo e noi lo
   raccogliamo, ma non è fra i campi che l'accesso porta con sé: non è come la visibilità e le
   community, che da noi non esistono proprio — il Paese ce l'abbiamo, semplicemente non viaggia
   insieme all'identità. Non ha quindi senso chiederlo di nuovo alla persona, che l'ha già dato a
   noi: **se vi serve, ditecelo e ve lo facciamo arrivare** — è la stessa cosa detta per il
   telefono, e va concordata **prima** di attivare il servizio, perché tocca il modo in cui i dati
   vi vengono consegnati. Se trovate altri campi nella stessa condizione segnalateceli: l'elenco
   nasce da quello che vediamo della vostra pagina, non dal vostro schema.

**A chi rispondere.** Il riferimento per questa integrazione è **Riccardo**, che si raggiunge a
**albieri.riccardo02@gmail.com**: lì arrivano le risposte alle sei domande qui sopra e qualunque
chiarimento sul resto del documento.

---

## Scheda dei dati

**Cosa emettiamo a ogni accesso** - sono i campi dell'**identità**, tutti standard, e viaggiano
nell'**ID token**. I primi quattro ci sono sempre; l'ultimo solo se la persona l'ha compilato:

| Campo | Cosa contiene |
| --- | --- |
| `sub` | La chiave di aggancio: individua la persona presso di noi in modo permanente. Non contiene suoi dati, ma non è anonimo: è uno pseudonimo |
| `name` | Nome e cognome in una sola stringa. Non arriva mai vuoto: in mancanza partirebbe l'indirizzo email — se lo vedete ditecelo, come nome visibile non va |
| `email` | L'indirizzo dell'account, confermato |
| `email_verified` | Il flag del nostro provider. La garanzia non poggia su questo, ma sul fatto che senza conferma non si entra |
| `preferred_username` | Il nickname scelto dalla persona: da 2 a 30 caratteri, senza spazi ai bordi, unico da noi. È **facoltativo**, e quando manca non arriva vuoto: non c'è proprio — vale sia per chi non l'ha scelto, sia per chi l'ha cancellato dopo |

**Una precisazione su UserInfo.** La tabella descrive l'**ID token**, ed è da lì che vi chiediamo di
leggere l'identità: oltre ai campi elencati porta i dati tecnici del token (chi l'ha emesso, quando
scade, quando l'account è stato aggiornato l'ultima volta) e, per gli accessi che la forniscono,
l'indirizzo dell'immagine di profilo. La risposta di UserInfo, con lo scope `profile`, non porta le
stesse cose: accanto ai campi dell'identità c'è **una copia grezza di quello che il nostro sistema
di accesso tiene sull'account**. L'abbiamo già svuotata dei dati del profilo — quel che resta sono
contrassegni tecnici del nostro provider, non dati della persona. Resta comunque la strada che non
vi consigliamo: se un vostro vincolo vi obbligasse a percorrerla, **ditecelo prima del collaudo**,
perché un campo lì si comporta in modo diverso.

**Il campo è l'indicatore di email verificata**: da UserInfo, se l'email non è confermata, **non
compare affatto**, mentre nell'ID token c'è sempre. Conviene trattare l'assenza come «non
confermata».
