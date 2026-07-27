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

     Il ragionamento integrale non e' andato perso, sta nei documenti NOSTRI:
       · scambio-dati-quadro.md ......... chi tiene cosa, cosa passa, prerequisiti, §8.1
       · identita-matrice-scenari.md .... gli scenari lato Let's Donation
       · app-gate-matrice.md ............ gli scenari lato nostro
       · ~/todos/partner-identita.md .... le decisioni e il perche' di ciascuna

     Stato: si manda INSIEME alla lettera (decisione di Riccardo, 2026-07-27: «dobbiamo andare
     entrambe assolutamente»). Prima la lettera, che spiega il perche' in una pagina; questa
     scheda e' l'allegato tecnico.
     Il nome del referente tecnico non e' confermato: non va scritto da nessuna parte.
-->

> Questa scheda descrive **il nostro lato** dell'integrazione: cosa mettiamo a disposizione, cosa
> va concordato fra noi, cosa ci serve sapere da voi. Come realizzarlo dalla vostra parte lo
> decidete voi.

---

## 1. L'obiettivo

Chi ha già un account Rise Against Hunger Italia entra nel nostro spazio sulla vostra piattaforma
**senza registrarsi una seconda volta**.

Oggi la stessa persona compila due moduli e finisce in due archivi che non si parlano: cambia
indirizzo da una parte e dall'altra resta quello vecchio. Dopo, sul nostro spazio resta il solo
pulsante «Entra con Rise Against Hunger»; chi non ha ancora un account da voi se lo vede creare in
quel momento, con i dati che arrivano dall'accesso.

Dalla nostra parte facciamo da **OpenID Provider**.

---

## 2. Come ci dividiamo il lavoro

| Chi | Cosa |
| --- | --- |
| **Noi** | Esponiamo l'OpenID Provider ed emettiamo le credenziali client dedicate a voi |
| **Voi** | Collegate il nostro provider alla pagina del nostro spazio da voi, con la soluzione che preferite |
| **Voi** | Lasciate lì il solo pulsante di accesso, al posto del modulo di registrazione |
| **Insieme** | Proviamo il giro completo con due o tre persone vere prima di aprire a tutti |

Sul terzo punto: parliamo solo della pagina del nostro spazio, e le due cose vanno insieme, non
una dopo l'altra. Finché restano tutte e due le strade, della stessa persona continuano a nascere
due schede. Se lì c'è un vincolo che lo impedisce, ce lo dite nella domanda 2.

---

## 3. Cosa mettiamo a disposizione

- Il documento di discovery (`.../.well-known/openid-configuration`), da cui il vostro lato legge
  endpoint e chiavi.
- `client_id` e `client_secret` dedicati a voi.
- L'autorizzazione dei redirect URI che ci indicate.
- Un riferimento nostro per tutta la messa in opera.

---

## 4. Cosa va concordato fra noi

Tre punti. I primi due riguardano il modo in cui l'account resta agganciato nel tempo; il terzo è
un obbligo che ricade su entrambi.

- **Chiave di aggancio: `sub`.** È l'unico identificatore stabile che emettiamo. L'email no: le
  persone la cambiano.
- **Utenti che da voi esistono già.** Al primo accesso vanno collegati all'account esistente sulla
  stessa email, invece di generarne uno nuovo. Ci serve sapere se il collegamento è disponibile dal
  vostro lato o se va previsto (domanda 4).
- **Cancellazioni.** Quando una persona chiede a noi la cancellazione, l'art. 19 del GDPR ci obbliga
  a comunicarvelo. La parte che invia la costruiamo noi: ci serve un recapito a cui scrivere e
  sapere come la trattate dalla vostra parte (domanda 5).

---

## 5. Cosa ci serve sapere da voi

Sei domande. Le prime due dicono quanto lavoro c'è davvero; la sesta è indipendente dal resto e ci
serve comunque.

1. **Il vostro lato può fare da client OpenID Connect?** Se avete già un'integrazione di questo
   tipo attiva con altri, ci adattiamo a quella.
2. **Il modulo di registrazione si può togliere dal nostro spazio?** Se qualcosa lo impedisce, qual
   è esattamente il pezzo che lo impedisce?
3. **Il meccanismo che usate con Zucchetti**: come fanno i loro dipendenti ad arrivare già
   registrati? Se è già un accesso unico come questo, gran parte del lavoro è fatta e ci basta
   capire come replicarlo.
4. **Il collegamento di un account esistente sull'email**: c'è già, o va previsto?
5. **Le cancellazioni**: oggi come le trattate, e a quale recapito possiamo comunicarvi quelle che
   arrivano a noi?
6. **Che accordo esiste già fra le nostre due società** per i dati dei nostri sostenitori che stanno
   sulla vostra piattaforma? Ci serve sapere se siete responsabili del trattamento per conto nostro
   (con un accordo firmato) o titolari autonomi, e poterne avere copia. È indipendente dal resto e
   va chiusa comunque.

---

## 6. Privacy

- Per questo collegamento **restiamo due titolari autonomi**: ciascuno resta responsabile dei propri
  trattamenti, con un accordo che delimita cosa passa. Lo scriviamo come proposta: la stiamo facendo
  verificare da chi ci segue sul punto.
- **Nessuno dei due entra nel database dell'altro.** L'unico scambio avviene durante l'accesso, ed è
  quello che lo standard prevede.
- **I consensi restano di chi li raccoglie.** I vostri moduli chiedono cose che noi non chiediamo (il
  nome pubblico, la visibilità nelle liste, le comunicazioni degli enti beneficiari): quelli
  continuate a raccoglierli voi, noi non possiamo né trasmetterli né darli per concessi.
- Il rapporto che abbiamo **già oggi** è un'altra cosa e questa sezione non lo qualifica: è la
  domanda 6.

---

## Scheda dei dati

**Cosa emettiamo a ogni accesso** - solo i campi standard:

| Campo | Cosa contiene |
| --- | --- |
| `sub` | L'identificatore stabile, la chiave di aggancio. Non dice nulla sulla persona |
| `name` | Nome e cognome in una sola stringa. Può mancare |
| `email` | L'indirizzo dell'account. Da noi si accede solo dopo aver confermato l'indirizzo, quindi è sempre reale |
| `email_verified` | Il flag del nostro provider. La garanzia non poggia su questo, ma sul fatto che senza conferma non si entra |

**Altri dati, se vi servono, li mandiamo noi nello stesso momento** - non serve chiederli alla
persona, sarebbe un modulo in più proprio dove ne stiamo togliendo uno.

- **Telefono**: è previsto dal protocollo come dato a sé (scope `phone`, claim `phone_number`); ci
  basta che lo richiediate.
- **Città, provincia, data di nascita**: si possono mandare, ma non sono coperti da uno scope
  standard - serve una configurazione dalla nostra parte, e ce ne prendiamo noi il carico.

Diteci quali vi servono davvero e per farci cosa: non li mandiamo tutti per abitudine, perché ogni
dato in più è un dato in più da custodire per entrambi.

**Un impegno che vi chiediamo di mettere per iscritto nell'accordo**: leggere l'identità solo da ID
token e UserInfo, senza usare quel token verso altre nostre funzioni. È la prassi, ma preferiamo che
sia scritta.

**Sui campi che il vostro modulo chiede e il nostro accesso non copre** (nome pubblico, visibilità
nelle liste, community): con la creazione automatica dell'account quei valori non arrivano da noi.
Ci interessa sapere se applicate un valore predefinito o se li chiedete alla persona una volta
entrata - soprattutto per la visibilità, dove un valore predefinito sbagliato farebbe comparire
qualcuno in pubblico col proprio nome senza che l'abbia scelto.

**Un limite da conoscere prima**: chi arriva dalla nostra app apre il vostro sito nel browser del
telefono, che non conosce la sessione dell'app. Al primo giro l'accesso va rifatto lì; dopo resta.

**Sull'età**: stiamo aprendo la registrazione anche ai minorenni, con le tutele che la legge prevede
per loro. Se sul vostro lato comporta qualcosa da sapere o da configurare, ditecelo.
