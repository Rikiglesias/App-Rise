# Rise Against Hunger Italia — Come colleghiamo i due accessi

<!-- NOTE INTERNE — NON contenuto del documento.
     Regola imparata a spese nostre: il convertitore PDF rende i blockquote VERBATIM e salta solo
     i commenti HTML come questo. Un'intestazione interna scritta con «>» finisce in PRIMA PAGINA
     dal destinatario. È già successo sulla proposta (PR #101) e su questo file.
     Tutto ciò che non deve leggere il partner va QUI, mai in «>».

     ----------------------------------------------------------------------------------
     RISCRITTO DA CAPO IL 2026-07-27 SU RICHIESTA DI RICCARDO.
     Parole sue: «è assolutamente troppo lungo, quello per i tecnici non ha senso. Non deve
     essere così dettagliato, deve esserci scritto in modo pragmatico quello che devono fare,
     punto. Devi immedesimarti sia in me che in loro.»
     Prima erano 458 righe di RAGIONAMENTO (perché la cosa serve, quali scenari esistono, quali
     alternative sono state scartate). Un fornitore con un Joomla e altri dieci clienti non
     legge 25 pagine per capire se il lavoro è mezza giornata o due mesi: chiude il file.
     Ora il documento risponde a tre domande e basta — cosa dovete fare, cosa vi diamo, cosa ci
     serve sapere.
     ⚠️ IL RAGIONAMENTO NON È ANDATO PERSO, sta dove deve stare (documenti NOSTRI):
       · scambio-dati-quadro.md ......... chi tiene cosa, cosa passa, prerequisiti, §8.1
       · identita-matrice-scenari.md .... gli scenari lato Let's Donation
       · app-gate-matrice.md ............ gli scenari lato nostro
       · ~/todos/partner-identita.md .... le decisioni e il perché di ciascuna
     Se qualcuno chiede «dov'è finita l'analisi», la risposta è: lì, dove serve a noi.
     Le 22 domande sono diventate 6. Le altre 16 non sono sparite: erano rifiniture che si
     risolvono da sole una volta che il meccanismo è deciso, e chiederle tutte insieme faceva
     sembrare la richiesta un progetto invece che una configurazione. Restano nei documenti
     nostri e si pongono al momento giusto.
     La numerazione riparte da 1: NON esiste più il vincolo di non rinumerare, perché i tracker
     che citavano «la domanda 18» sono stati aggiornati al nuovo numero (ora è la 6).
     ----------------------------------------------------------------------------------

     Stato: si manda INSIEME alla lettera (decisione di Riccardo, 2026-07-27: «dobbiamo andare
     entrambe assolutamente»). Prima la lettera, che spiega il perché in una pagina; questo
     spiega il come.
     Il nome del referente tecnico non è confermato: non va scritto da nessuna parte.
-->

> **In una riga**: vorremmo che chi ha già un account Rise Against Hunger Italia entrasse nel
> nostro spazio sulla vostra piattaforma **senza doversi registrare una seconda volta**.

---

## 1. Cosa cambia, in concreto

**Oggi.** Una persona si registra da noi. Poi arriva sul nostro spazio da voi e trova un secondo
modulo di registrazione. Compila di nuovo tutto. Ora esiste in due archivi che non si parlano.

**Dopo.** Sul nostro spazio c'è **un solo** pulsante: «Entra con Rise Against Hunger». Chi lo preme
viene da noi, si identifica, e torna da voi **già dentro**. Se da voi non aveva un account, gli
viene creato in quel momento con i dati che vi passiamo. Non deve compilare niente.

È lo stesso meccanismo con cui si entra in mille siti con Google, solo che al posto di Google ci
siamo noi. Si chiama OpenID Connect ed è uno standard: non c'è niente da inventare.

---

## 2. Chi fa cosa

| | Chi | Cosa |
| --- | --- | --- |
| 1 | **Noi** | Vi diamo l'indirizzo di configurazione e le due chiavi di accesso |
| 2 | **Voi** | Attivate sul nostro spazio il collegamento con quelle chiavi |
| 3 | **Voi** | Togliete il modulo di registrazione dal nostro spazio, lasciando il solo pulsante |
| 4 | **Insieme** | Proviamo con due o tre persone vere prima di aprire a tutti |

Sono quattro passi. Il grosso è il punto 2, ed è configurazione, non sviluppo — a meno che il
vostro Joomla non abbia già il componente adatto, ed è la prima cosa che vi chiediamo (domanda 1).

---

## 3. I passi dalla vostra parte, in dettaglio

**Passo 1 — Attivare il collegamento.**
Vi serve un componente Joomla che sappia fare da «client OpenID Connect». Ne esistono diversi,
gratuiti e a pagamento. Dentro ci mettete tre cose che vi diamo noi: l'indirizzo di configurazione,
un identificativo e una chiave segreta. Da lì il componente fa tutto da sé.

**Passo 2 — Dire al sistema come riconoscere la persona.**
Quando qualcuno entra, vi arrivano quattro informazioni (l'elenco esatto è nella scheda in fondo).
Due regole, e sono le uniche due cose delicate di tutto il lavoro:

- **Riconoscete la persona dall'identificativo, non dall'email.** L'identificativo che vi mandiamo
  non cambia mai; l'email invece la gente la cambia. Se agganciate l'account all'email, il giorno
  in cui una persona cambia indirizzo vi si sdoppia l'account.
- **Se quella persona da voi ha già un account con la stessa email, collegatelo** invece di crearne
  uno nuovo. Altrimenti chi è già vostro cliente si ritrova due schede e non capisce perché.

**Passo 3 — Un solo ingresso.**
Sul nostro spazio il modulo di registrazione va tolto: resta solo il pulsante. Non è per togliervi
una strada, è perché due strade per la stessa cosa sono esattamente il problema che stiamo
risolvendo. Se sul vostro sistema questo si fa da template, per noi va benissimo così.

**Passo 4 — Una cosa che serve dopo, non subito.**
Le persone cambiano indirizzo, cambiano idea sulle comunicazioni, e qualcuna chiede di essere
cancellata. Quando una persona ci chiede la cancellazione, **la legge ci obbliga a dirlo anche a
voi** (art. 19 del GDPR: chi ha comunicato dei dati deve informare chi li ha ricevuti). Ci basta un
indirizzo a cui mandarvi un messaggio con il codice della persona; la parte che invia la
costruiamo noi. È l'unico punto di tutto il documento in cui l'obbligo è di entrambi.

---

## 4. Cosa vi diamo noi

- L'indirizzo di configurazione (`…/.well-known/openid-configuration`), da cui il vostro
  componente legge da solo tutto il resto.
- Un identificativo e una chiave segreta dedicati a voi.
- Gli indirizzi di ritorno da autorizzare.
- Una persona di riferimento durante la messa in opera.

---

## 5. Cosa ci serve sapere da voi

Sono sei domande. Le prime due decidono se il lavoro è di mezza giornata o di più; la sesta è
indipendente da tutto il resto e ci serve comunque.

1. **Il vostro Joomla può fare da client OpenID Connect?** Con quale componente e quale versione?
   Se ne avete già uno in uso con altri, ci adattiamo a quello.
2. **Il modulo di registrazione si può togliere dal nostro spazio?** Se qualcosa lo impedisce,
   qual è esattamente il pezzo che lo impedisce?
3. **Il meccanismo che usate con Zucchetti**: come fanno i loro dipendenti ad arrivare già
   registrati? Se è già un accesso unico come quello di cui parliamo, gran parte del lavoro è
   fatta e ci basta capire come replicarlo.
4. **Il collegamento di un account esistente sull'email**: c'è già, o si può attivare?
5. **Quando una persona chiede la cancellazione dei dati, oggi come funziona da voi?** E c'è un
   indirizzo a cui possiamo comunicarvi le cancellazioni che ci chiedono a noi?
6. **Che accordo esiste già fra le nostre due società** per i dati dei nostri sostenitori che
   stanno sulla vostra piattaforma? Ci serve sapere se siete responsabili del trattamento per
   conto nostro (con un accordo firmato) o titolari autonomi, e poterne avere copia. È
   indipendente dal resto e va chiusa comunque.

---

## 6. Privacy, in breve

- Per questo collegamento **restiamo due titolari autonomi**: ciascuno resta responsabile dei
  propri trattamenti, con un accordo che delimita cosa passa. Lo scriviamo come proposta: la
  stiamo facendo verificare da chi ci segue sul punto.
- **Nessuno dei due entra nel database dell'altro.** L'unico scambio avviene durante l'accesso, ed
  è quello che lo standard prevede.
- **I consensi restano di chi li raccoglie.** I vostri moduli chiedono cose che noi non chiediamo
  (il nome pubblico, la visibilità nelle liste, le comunicazioni degli enti beneficiari): quelli
  continuate a raccoglierli voi, noi non possiamo né trasmetterli né darli per concessi.
- Il rapporto che abbiamo **già oggi** è un'altra cosa e questa sezione non lo qualifica: è la
  domanda 6.

---

## Scheda tecnica

Per chi mette le mani nella configurazione. Se non vi serve, il documento finisce sopra.

**Cosa vi arriva a ogni accesso** — solo i campi standard, niente di più:

| Campo | Cosa contiene |
| --- | --- |
| `sub` | L'identificativo stabile. **È la chiave su cui agganciare l'account.** Non dice nulla sulla persona |
| `name` | Nome e cognome in **una sola stringa** (la divisione la fate voi). Può mancare: il sistema deve reggerlo |
| `email` | L'indirizzo dell'account, sempre reale e confermato: da noi si entra solo dopo aver cliccato il messaggio di conferma |
| `email_verified` | Indica se l'indirizzo risulta confermato. **Può valere `false`**: non deve far rifiutare la creazione dell'account |

**Se vi serve altro — telefono, città, provincia — ve lo mandiamo noi nello stesso momento.**
Non dovete chiedere niente alla persona: sarebbe un modulo in più proprio dove stiamo togliendo
quello che c'è. Tecnicamente si aggiunge alla lista qui sopra, con i nomi che il protocollo prevede
già (`phone_number`, `address`, `birthdate`).

Diteci **quali di questi vi servono davvero** e per farci cosa: non li mandiamo tutti per abitudine,
perché ogni dato in più è un dato in più da custodire per entrambi. Ma quelli che servono al
servizio arrivano da noi, al primo accesso e a ogni accesso successivo, senza che la persona debba
scrivere niente due volte.

**Un impegno che vi chiediamo di mettere per iscritto nell'accordo**: leggere l'identità solo dai
dati dell'accesso (ID token e UserInfo), senza usare quel token per chiamare altre nostre
funzioni. È la prassi, ma preferiamo che sia scritta.

**Sui campi che il vostro modulo chiede e il nostro accesso non copre** (nome pubblico, visibilità
nelle liste, community): con la creazione automatica dell'account quei valori non arrivano da noi.
Ci interessa sapere se applicate un valore predefinito o se li chiedete alla persona una volta
entrata — soprattutto per la visibilità, dove un valore predefinito sbagliato farebbe comparire
qualcuno in pubblico col proprio nome senza che l'abbia scelto.

**Un limite da conoscere prima**: chi arriva dalla nostra app apre il vostro sito nel browser del
telefono, che non conosce la sessione dell'app. Al primo giro deve fare l'accesso lì; dopo resta.

**Sull'età**: stiamo aprendo la registrazione anche ai minorenni, con le tutele che la legge
prevede per loro. Se sul vostro lato questo comporta qualcosa da sapere o da configurare, ditecelo.
