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
         fatto (`oidc-server-implementation-plan.md:146-148`). Resta solo la domanda 6, che ora
         copre ANCHE il rapporto gia' in essere.
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
         ancora eseguito» (`oidc-server-implementation-plan.md:5-6`), e due passi su quattro
         sono leve di Riccardo (chiavi asimmetriche + abilitazione della beta).

       RESTANO, e sono VERIFICATI:
       - `sub` come chiave (standard OIDC);
       - «da noi si entra solo dopo aver confermato l'indirizzo» -> `mailer_autoconfirm=false`
         sul progetto vivo + 0 login social nel codice (Google/Apple rimossi);
       - nessuno dei due entra nel DB dell'altro; i consensi restano di chi li raccoglie;
       - il limite del browser che non conosce la sessione dell'app.
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

Oggi la stessa persona compila due moduli e finisce in due archivi che non si parlano: cambia
indirizzo da una parte e dall'altra resta quello vecchio. Il punto d'arrivo è che sul nostro spazio
resti il solo pulsante «Entra con Rise Against Hunger», e che chi non ha ancora un account da voi
non compili un secondo modulo: i dati minimi per crearlo — nome e indirizzo — arrivano dall'accesso.

Dalla nostra parte mettiamo in piedi il ruolo di **OpenID Provider**.

---

## 2. Come ci dividiamo il lavoro

Dalla nostra parte spettano a noi l'OpenID Provider e le credenziali client dedicate a voi.

Una condizione riguarda tutti e due: sulla pagina del nostro spazio il pulsante di accesso e il
modulo di registrazione non possono convivere, e le due cose vanno insieme, non una dopo l'altra.
Finché restano tutte e due le strade, della stessa persona continuano a nascere due schede. Se lì
c'è un vincolo che lo impedisce, ce lo dite nella domanda 2.

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

Quattro punti. I primi due riguardano il modo in cui l'account resta agganciato nel tempo, il terzo
è un obbligo che ricade su di noi e ha bisogno di un vostro recapito, il quarto è il presupposto
con cui dimensioniamo i permessi.

- **Chiave di aggancio: `sub`.** È l'unico identificatore stabile che emettiamo. L'email no: le
  persone la cambiano. L'email serve una volta sola, al primo aggancio con una scheda che da voi
  esiste già; da lì in poi la persona resta agganciata al `sub`, anche se cambia indirizzo.
- **Utenti che da voi esistono già.** Chi ha già un account nel nostro spazio deve ritrovare
  quello al primo accesso, non trovarsene uno nuovo e vuoto: è l'aggancio sulla stessa email di
  cui sopra (domanda 4).
- **Cancellazioni.** Quando una persona chiede a noi la cancellazione, l'art. 19 del GDPR ci obbliga
  a comunicarvelo. La parte che invia la costruiamo noi; serve il canale su cui farla arrivare
  (domanda 5).
- **Uso del token.** L'identità si legge dall'ID token e da UserInfo, senza usare il token di
  accesso verso altre nostre funzioni. È la prassi; la nominiamo perché dalla nostra parte è il
  presupposto con cui impostiamo i permessi.

---

## 5. Cosa ci serve sapere da voi

Sei domande. Le prime due dicono quanto lavoro c'è davvero; la sesta è indipendente dal resto e ci
serve comunque.

1. **Dal vostro lato serve un client OpenID Connect.** Se ne avete già uno attivo con un altro
   fornitore ci adattiamo a quello. Se non c'è, è la parte da prevedere: diteci cosa comporta
   dalla vostra parte, così ci regoliamo sui tempi.
2. **Ci serve che sulla pagina del nostro spazio resti solo il pulsante**, dal momento in cui va
   online: finché restano tutte e due le strade, della stessa persona nascono due schede. C'è
   qualcosa che lo impedisce dalla vostra parte? Se sì, diteci cos'è: è la prima cosa che guardiamo
   insieme.
3. **Il meccanismo che usate con Zucchetti**: come fanno i loro dipendenti ad arrivare già
   registrati? Se è già un accesso unico come questo, ci basta capire come replicarlo.
4. **Chi ha già un account nel nostro spazio deve ritrovare quello**, non trovarsene uno nuovo e
   vuoto: al primo accesso il collegamento passa dalla stessa email. Dalla vostra parte esiste già,
   o è da prevedere? E gli account valgono per il singolo spazio o per tutta la piattaforma?
5. **Le cancellazioni**: oggi come le trattate, e a quale recapito possiamo comunicarvi quelle che
   arrivano a noi? Se il collegamento che mettiamo in piedi copre già anche questo, tanto meglio:
   diteci come.
6. **Il rapporto che abbiamo già oggi**: come è regolato il trattamento dei dati dei nostri
   sostenitori che stanno sulla vostra piattaforma? Dobbiamo poter dire se quei dati li trattate
   per conto nostro o come titolari autonomi, e tenere agli atti il documento che lo stabilisce.
   Se esiste già, ci basta una copia; se non c'è, è un adempimento che spetta a noi e ci farebbe
   comodo sistemarlo insieme.

---

## 6. Privacy

- **Nessuno dei due entra nel database dell'altro.** Durante l'accesso passa quello che lo standard
  prevede. Oltre a quello, dai link che portano dalla nostra app al vostro spazio arriva un codice
  di provenienza (`rise_ref`): non contiene nome, indirizzo né altri dati della persona, ma è
  **stabile**, quindi consente di ricondurre allo stesso sostenitore visite diverse. Per questo va
  trattato come un dato personale pseudonimizzato, non come un dato anonimo. Solo noi possiamo
  risalire da quel codice alla persona.
- **I consensi restano di chi li raccoglie.** I vostri moduli chiedono cose che noi non chiediamo (il
  nome pubblico, la visibilità nelle liste, le comunicazioni degli enti beneficiari): quelli
  continuate a raccoglierli voi, noi non possiamo né trasmetterli né darli per concessi.
- **Come si qualificano i due trattamenti** lo stiamo chiudendo con chi ci segue sul tema, e qui non
  lo diamo per deciso: vale sia per questo collegamento sia per il rapporto che abbiamo già oggi.
  Sul rapporto già in essere vi chiediamo in più un dato di fatto, ed è la domanda 6.

---

## Scheda dei dati

**Cosa emettiamo a ogni accesso** - solo i campi standard:

| Campo | Cosa contiene |
| --- | --- |
| `sub` | L'identificatore stabile, la chiave di aggancio. Non dice nulla sulla persona |
| `name` | Nome e cognome in una sola stringa. Può mancare |
| `email` | L'indirizzo dell'account. Da noi si accede solo dopo aver confermato l'indirizzo, quindi è sempre reale |
| `email_verified` | Il flag del nostro provider. La garanzia non poggia su questo, ma sul fatto che senza conferma non si entra |

**Se vi servono altri dati** oltre a questi - il telefono, per esempio - diteci quali e per farci
cosa. Non li mandiamo per abitudine: ogni dato in più è un dato in più da custodire per entrambi, e
prima di impegnarci guardiamo cosa il protocollo permette di trasportare davvero.

**Sui campi che il vostro modulo chiede e il nostro accesso non copre** (nome pubblico, visibilità
nelle liste, community): con la creazione automatica dell'account quei valori non arrivano da noi.
Ci interessa sapere come vengono impostati - con un valore predefinito, o chiedendoli alla persona
una volta entrata. Ci pesa soprattutto la visibilità, perché è l'unico di questi campi che ha un
effetto pubblico, e dobbiamo poter scrivere nella nostra informativa cosa succede.

**Un limite da conoscere prima**: chi arriva dalla nostra app apre il vostro sito nel browser del
telefono, che non conosce la sessione dell'app. Al primo giro l'accesso va rifatto lì; dopo resta.
