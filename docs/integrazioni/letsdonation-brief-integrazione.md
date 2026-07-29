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
         fra avvocati. Oggi il numero 6 indica i tre campi del loro modulo: non cercarlo li'.]
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
         ancora eseguito» (`oidc-server-implementation-plan.md:5-6`).
         [AGGIORNATO 2026-07-29: qui si diceva «due passi su quattro sono leve di Riccardo
         (chiavi asimmetriche + abilitazione della beta)». Le CHIAVI SONO GIA' ASIMMETRICHE
         (ES256, verificato sul progetto vivo) -> quella leva non esiste piu' e il passo 1 e'
         stato annullato nel piano. Resta UNA leva: accendere il server, oggi spento.]

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
        Interrogato il 2026-07-29: 2 utenti, **0 mai confermati** (quindi «non si entra prima di
        aver confermato» e' VERO e verificato) ma **1 dei 2 porta un alias
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

     🔑 DECISIONE PENDENTE DI RICCARDO, PORTATA QUI PERCHE' NON SI PERDA: il documento non dice
     MAI dove ATTERRA chi preme il pulsante (0 occorrenze di «pagina web», «browser», «da
     computer»). L'accesso avverra' su una NOSTRA PAGINA WEB ancora da costruire, che il piano
     chiama «il pezzo piu' grande» (`oidc-server-implementation-plan.md:77-78`). Era il punto 3
     della lettera, e la lettera NON si manda: la nota che lo custodiva vive in
     `letsdonation-proposta-operativa.md:8-14`, cioe' in un file marcato «NON SI MANDA» che chi
     genera questo PDF non apre. Percio' la annoto anche qui.
     Non e' stata aggiunta d'iniziativa: e' una promessa di architettura, la categoria che
     Riccardo ha fatto togliere. O la mette lui, o resta fuori consapevolmente.

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
- Un riferimento nostro per tutta la messa in opera.

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
- **Uso del token.** L'identità si legge dall'ID token e da UserInfo, senza usare il token di
  accesso verso altre nostre funzioni. È la prassi; la nominiamo perché è il presupposto con cui
  impostiamo i permessi.

---

## 5. Cosa ci serve sapere da voi

Sei domande. La prima dice quanto lavoro c'è davvero; la quarta è quella da cui dipende il
risultato.

1. **Come funziona il collegamento che avete con Zucchetti?** Come ci era stato raccontato, i loro
   dipendenti arrivano già registrati: se è un accesso unico come quello che proponiamo, a noi basta sapere
   come replicarlo — il nome del sistema, il documento che vi hanno dato, o chi l'ha collegato. Se invece funziona in un altro modo, dal vostro lato serve un
   client OpenID Connect: diteci cosa comporta, così ci regoliamo sui tempi.
2. **Cosa impedisce, oggi, di lasciare sulla pagina del nostro spazio il solo pulsante?** Il modulo va tolto nel
   momento stesso in cui il pulsante va online. Se c'è un vincolo tecnico che lo blocca, è la prima
   cosa che guardiamo insieme.
3. **Come si ricongiungono le due schede di una stessa persona?** Chi da voi ha già un account deve
   ritrovare quello, non trovarsene uno nuovo e vuoto. Quando l'email coincide il collegamento
   è immediato — dalla vostra parte esiste già, o è da prevedere?
   Ma non sempre coincide: chi ha donato anni fa può avere lasciato l'email del lavoro, o un'altra
   che oggi non usa più. **Quel caso va risolto, non solo segnalato**: dalla vostra parte
   come si fa a ricongiungere due schede quando le email sono diverse? Se lo strumento non
   esiste, mettiamolo fra le cose da prevedere insieme.
   Serve anche sapere se gli account valgono per il singolo spazio o per tutta la piattaforma.
4. **Quando un dato cambia da noi, il vostro lato lo rilegge?** A ogni accesso vi arrivano i valori
   aggiornati: ci serve sapere se li usate ogni volta o soltanto la prima, per creare l'account.
   Se valgono solo alla creazione, chi aggiorna l'indirizzo da noi continua a risultare da voi con
   quello vecchio, e il problema resta intero.
   Un dettaglio della stessa famiglia: il vostro lato pretende `email_verified: true` per creare
   l'account? Il campo lo emettiamo; se il suo valore è per voi bloccante, ditecelo ora e mettiamolo
   fra le cose da controllare nel giro di prova.
5. **Le cancellazioni**: oggi come le trattate, e a quale recapito possiamo comunicarvi quelle che
   arrivano a noi? Se il collegamento che mettiamo in piedi copre già anche questo, tanto meglio:
   diteci come.
6. **I tre campi del vostro modulo che il nostro accesso non copre**: il nickname, la scelta su come
   apparire nelle liste pubbliche e l'adesione a community e classifiche.
   Oggi li sceglie la persona mentre compila il modulo, e la visibilità in particolare è
   obbligatoria, senza opzione preselezionata. Quando sulla pagina del nostro spazio quel modulo non
   c'è più, l'account nasce dall'accesso con i dati che arrivano da noi — nome ed email — e quelle
   tre scelte non le fa più nessuno: con quale valore nascono, uno deciso da voi o chiesto alla
   persona dopo il primo ingresso?
   Ci pesa soprattutto la visibilità, l'unica delle tre con un effetto pubblico: qualunque sia la
   strada, dobbiamo poter scrivere nella nostra informativa cosa succede. E se la strada fosse
   chiederlo, basterebbe quella domanda dopo l'ingresso: non sarebbe un secondo modulo di
   registrazione, che è la cosa che vogliamo evitare a chi entra.
   **I vostri due consensi sulle comunicazioni** stanno nella stessa condizione: nessuno dei due vi
   arriva insieme all'accesso — quello sugli enti beneficiari da noi non esiste, e il nostro vale per
   le comunicazioni nostre, non per le vostre. Non essendoci, non c'è un «sì» della persona che
   possiate ereditare da noi.

---

## Scheda dei dati

**Cosa emettiamo a ogni accesso** - solo i campi standard:

| Campo | Cosa contiene |
| --- | --- |
| `sub` | La chiave di aggancio: individua la persona presso di noi in modo permanente. Non contiene nome né altri suoi dati, ma non è anonimo: è uno pseudonimo |
| `name` | Nome e cognome in una sola stringa. Non arriva mai vuoto: se il nostro sistema non l'avesse, al suo posto partirebbe l'indirizzo email — se lo vedete, ditecelo, perché come nome visibile non va |
| `email` | L'indirizzo dell'account, confermato: da noi non si entra prima di averlo confermato |
| `email_verified` | Il flag del nostro provider. La garanzia non poggia su questo, ma sul fatto che senza conferma non si entra |

**Se vi servono altri dati** oltre a questi - il telefono, per esempio - diteci quali e per farci
cosa. Non li mandiamo per abitudine: ogni dato in più è un dato in più da custodire per entrambi, e
prima di impegnarci guardiamo cosa il protocollo permette di trasportare davvero.
