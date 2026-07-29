<!--
=====================================================================================
🛑 NON SI MANDA — DECISIONE DI RICCARDO, 2026-07-29: «la lettera non la manderò».
Verso Let's Donation parte la SOLA scheda tecnica (`letsdonation-brief-integrazione.md`),
che rilegge e manda LUI. Il PDF di questa lettera è stato TOLTO da `C:\tmp` perché un
allegato pronto è un invio per sbaglio; questo file resta per il ragionamento che porta.

⚠️ COSA SI PERDE, se non rientra altrove: il **punto 3** è l'UNICO posto in cui diciamo al
partner che l'accesso avverrà su una NOSTRA PAGINA WEB ancora da costruire (per entrare
anche da computer, senza app). Verificato il 2026-07-29: nella scheda ZERO occorrenze di
«pagina web», «da computer», «browser». Per chi collega l'accesso non è un dettaglio: è
dove atterra la persona che preme il pulsante. Portato a Riccardo, che decide se farlo
entrare nella scheda — NON aggiunto d'iniziativa: è una promessa di architettura, la
categoria che lui stesso aveva fatto togliere (`documenti-verso-partner.md`).
Gli altri 4 punti sono già coperti dalla scheda: Zucchetti -> domanda 1 · «prepariamo
l'accesso» -> §3 · modulo tolto insieme -> §2 + domanda 2 · ricongiungimento -> domanda 3.
=====================================================================================

Storia precedente (resta come contesto):
Questo era il documento DA MANDARE a Michele Placucci (Let's Donation); al 2026-07-26 non è
ancora stato inviato (confermato da Riccardo).
AGGIORNATO 2026-07-26 dopo la rimozione del login Google/Apple: il punto 5 aveva un «caso da
prevedere» che era interamente il caso Apple «Nascondi la mia email». Con email+password come
unico ingresso quel caso NON esiste più, e la promessa diventa più forte, non più debole:
l'indirizzo che arriva a loro è sempre reale e confermato. Se un domani i social rientrassero,
quel paragrafo va rimesso PRIMA di ripubblicare.
AGGIORNATO 2026-07-27 (sera): la scheda tecnica `letsdonation-brief-integrazione.md` si manda
INSIEME a questa lettera - decisione di Riccardo, «dobbiamo andare entrambe assolutamente». La riga
precedente diceva «si consegna su richiesta, non adesso» ed era anteriore alla decisione.
RIAPERTO 2026-07-28: Riccardo ha rimesso in discussione QUESTA lettera («serve solo il brief per i
tecnici, a Michele gliel'ho gia' detto»). Controproposta in attesa di risposta: questo testo
diventa il CORPO DELL'EMAIL e la scheda resta l'unico allegato. Finche' non risponde non si manda
nulla, e la decisione del 27/07 qui sopra NON e' piu' quella corrente.
Se si sceglie quella via, verificare che sopravvivano nel testo che resta: l'invariante I7
(pulsante su e modulo giu' INSIEME, punto 4) e «da noi si entra solo dopo aver confermato
l'indirizzo» - oggi stanno in ENTRAMBI i documenti.
Stessa passata: tolta la parola «istruzioni» dal punto 2 (era la stessa cornice paternalistica per
cui la scheda tecnica e' stata riscritta) e tolta dal punto 4 la diagnosi su come sia fatto il loro
sito. Perimetro degli scenari:
`identita-matrice-scenari.md` (lato loro) e `app-gate-matrice.md` (lato nostro).
AGGIORNATO 2026-07-28: passata di RIDUZIONE AGLI IMPEGNI FERMI (invio fermato da Riccardo).
Regola: `documenti-verso-partner.md` — il primo contatto chiede capacità, non promette
architettura. Due righe cambiate, verificate alla fonte:
  - punto 3: diceva al PRESENTE «il pulsante apre una nostra pagina web». Quella pagina NON
    esiste (0 next.config/vercel.json/web in repo) e l'hosting non e' nemmeno deciso
    (`oidc-server-implementation-plan.md:77-78`: «e' il pezzo piu' grande»). Ora e' al futuro.
  - punto 5: prometteva il COMPORTAMENTO DEL LORO SISTEMA («entra e ritrova quello che aveva»),
    mentre la scheda tecnica lo CHIEDE come domanda 4. Contraddizione fra i due documenti in
    uscita, la seconda trovata. Ora e' un requisito piu' una domanda.
  - RESTA come promessa, ed e' VERIFICATA sul vivo: «da noi si entra solo dopo aver confermato
    l'indirizzo» -> `mailer_autoconfirm=false` sul progetto + 0 login social nel codice.
Tutto ciò che sta FUORI da questo commento lo legge il destinatario: prima di rigenerare il
PDF, rileggere la prima pagina come la leggerebbe lui.
-->

# Un ingresso solo, come mi raccontavi per Zucchetti

Ciao Michele,

ti riassumo in una pagina quello che ci siamo detti, così chi ci mette le mani da voi parte da
qualcosa di scritto.

Come mi dicevi, con Zucchetti il link sta nel loro portale e chi arriva da lì è già registrato. Se
funziona così, per noi è la strada giusta: il link lo mettiamo nella nostra app, la persona fa
l'account da noi una volta sola, e sul vostro spazio entra con quello — senza compilare una seconda
registrazione. Cambia solo che al posto del portale c'è la nostra app.

In pratica servono cinque cose.

1. Ci raccontate com'è fatto quel passaggio da voi. Va bene in qualunque forma: il nome del sistema
   che usate, il documento che vi hanno dato, o il contatto di chi l'ha collegato. Se invece da voi
   funziona in un altro modo, dimmelo e la strada la troviamo insieme.

2. Noi prepariamo il nostro accesso e vi passiamo quello che serve per collegarlo, insieme alla
   scheda tecnica per chi ci mette le mani.

3. Sulla pagina del nostro spazio compare il pulsante «Entra con Rise Against Hunger». L'accesso
   avverrà su una **pagina web nostra**, che dobbiamo ancora costruire: servirà a entrare anche da
   computer, senza avere l'app, e chi non ha ancora un account da noi potrà farlo lì in quel
   momento, tornando poi sulla vostra pagina già riconosciuto. Te la nomino perché è un pezzo del
   disegno, non perché sia pronta: quando lo sarà ve lo diciamo.

4. Nello stesso momento in cui il pulsante va online, il vostro modulo di registrazione su quella
   pagina viene tolto. Le due cose vanno insieme, non una dopo l'altra: finché restano tutte e due,
   della stessa persona nascono due schede che si allontanano subito — cambia indirizzo da una parte
   e dall'altra resta quello vecchio. Parlo solo della pagina del nostro spazio: se lì c'è un
   vincolo tecnico, dimmi quale ed è la prima cosa che guardiamo insieme.
   Perché una scheda sola basti davvero, serve anche che i dati aggiornati che vi mandiamo a ogni
   accesso vengano riletti, e non usati soltanto la prima volta: è la quarta domanda della scheda.

5. Chi ha già un account nel nostro spazio non dovrebbe rifare la registrazione: al primo accesso
   col nostro pulsante dovrebbe ritrovare quello, invece di trovarsene uno nuovo e vuoto. Il
   collegamento passa dalla stessa email, che dalla nostra parte è sempre reale: da noi si entra
   solo dopo averla confermata. Se questo collegamento dalla vostra parte non è già previsto, è la
   cosa che guardiamo per prima. Quando invece l'indirizzo non coincide — chi ha donato anni fa può
   averne lasciato un altro — serve comunque un modo per ricongiungere le due schede: è la terza
   domanda della scheda.

Riccardo
