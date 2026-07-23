<!-- Generato 2026-07-22 da panel multi-agente (20 agenti). Claim verificati in prima persona: iframe Donorbox, prefill+utm_content, 301 welfare4charity->letsdonation, privacy-policy.html. NB: il fornitore usa MySQL (non SQL Server come scritto in alcune tabelle) - confermato da Riccardo, coerente con Joomla/PHP. -->

# RACCOMANDAZIONE FINALE — integrazione Rise ↔ piattaforme esterne

Per: Riccardo · Data: 22/07/2026 · Non è consulenza legale (i punti 🔷 vanno validati da chi assiste l'associazione)

---

## 1. La decisione, in 5 righe

**Nessun database viene aperto, in nessuna delle due direzioni: entrambe le tue idee vanno scartate.** La correzione che cambia tutto: i soldi **non passano da Let's Donation** — `RISE_URLS.donation` punta a `italy.riseagainsthunger.org/donaora/`, che incorpora **Donorbox**, dove si dona **senza registrarsi** e dove prefill e chiave di correlazione **funzionano già oggi, con sforzo del fornitore pari a zero** *(verificato)*. Quindi: costruiamo subito la parte che non dipende da nessuno (Donorbox), e a Let's Donation — che copre solo shop, gift card, eventi, progetti — chiediamo **una cosa sola**: che un codice opaco che gli passiamo nell'URL venga conservato **sull'ordine** e restituito nell'export che già producono. Prima di far partire qualunque riga di codice va riscritta l'informativa, che oggi dichiara il falso: `privacy-policy.html` afferma che l'app «NON raccoglie alcun dato personale» mentre Supabase Auth, `profiles` e `consent_events` esistono e sono in produzione.

---

## 2. Le tue due idee: verdetto

Termini usati qui: **DPA** = accordo scritto fra chi decide come usare i dati e chi li tratta per suo conto (art. 28 GDPR). **Multi-tenant** = una sola installazione software condivisa fra tanti clienti, separati solo da una colonna nel database.

| | Idea A — noi leggiamo il loro SQL Server | Idea B — loro leggono il nostro Supabase |
|---|---|---|
| **Verdetto** | **NO** | **NO, mai** |
| Risolve la doppia registrazione? | **No.** Leggere un database è un travaso di dati, non un login. L'utente si registrerebbe due volte esattamente come oggi | **No.** E non risolve nemmeno il ritorno dei dati: siamo noi ad aver bisogno dei loro, non il contrario |
| Cosa dirà il fornitore | No. Il loro database è **condiviso fra oltre 1.000 enti** *(multi-tenancy verificata via DNS: `ithesiagroup`, `percorsisenzeta`, `zucchettipeoplecare` risolvono tutti sullo stesso IP)*. Per dartelo dovrebbero costruire e mantenere per sempre una vista filtrata solo per te, gratis | No, e ha ragione: diventerebbe importatore di dati con un canale permanente verso un DB che non controlla. Rischio suo, beneficio tuo |
| Conseguenza tecnica concreta | Ti leghi al loro **schema fisico**. Il giorno in cui rinominano una colonna, la tua integrazione si rompe **in produzione, senza preavviso**, e tu non hai nessun contratto che glielo vieti | Un ruolo Postgres esterno vive **fuori** dalla RLS pensata per i token utente. Una view in Postgres è `security definer` per default: se sbagli, **bypassa le policy** e espone tutto |
| Conseguenza legale concreta | Un `WHERE` sbagliato o un bug di isolamento **loro** ti fa leggere donatori di **altre onlus**: trattamento senza base giuridica + notifica di violazione + profilo **penale art. 615-ter c.p.** (Cass. SS.UU. 41210/2017: il reato esiste anche con credenziali legittime, se accedi per finalità estranee) 🔷 | Diventano responsabili ex art. 28 → **DPA obbligatorio** (che oggi non hai). Se gli rubano la credenziale, la violazione riguarda **dati di cui sei titolare tu**: le 72 ore per notificare al Garante partono da quando **loro** te lo dicono |
| Uscita a 6 mesi | Settimane: ogni query, ogni join, ogni assunzione sul loro schema va riscritta | Settimane + audit: ruoli, view, allowlist, log |
| Sostituto corretto | **Export del tuo tenant** o endpoint HTTP in lettura | **Nessuno: non serve.** Non hanno bisogno dei tuoi dati |

**In una riga:** entrambe creano un canale **permanente e largo** per soddisfare un bisogno **istantaneo e stretto**. È la classe di soluzione sbagliata, prima ancora del dettaglio.

---

## 3. La soluzione consigliata — flusso utente

Un solo concetto nuovo: **`rise_ref`** = una stringa casuale di ~16 byte (es. `r_7QK3F9ZB2XW…`) che generiamo noi. **Non contiene nome né email, non apre sessioni, non autentica nulla.** Se finisce in un log o in un link condiviso, il danno massimo è che una donazione venga attribuita alla persona sbagliata. Mai un furto di account. È questa proprietà che rende superflue A e B.

⚠️ Nella comunicazione col fornitore **non scrivere mai** «non è un dato personale»: uno pseudonimo **resta dato personale** (considerando 26 GDPR), e metterlo per iscritto a un terzo lo farebbe uscire dal perimetro dei suoi obblighi. Si dice: *«identificativo pseudonimo, resta dato personale e va trattato come tale»*.

### 3A — Canale donazioni (Donorbox) — qui non serve il permesso di nessuno

1. L'utente, già loggato nell'app, tocca **Dona**.
2. **Guardia Apple.** Se l'email di sessione finisce in `@privaterelay.appleid.com` e `profiles.contact_email` è vuota → si passa da `CompleteProfileScreen`. **Non usciamo mai dall'app con un indirizzo relay**: Apple accetta posta solo da mittenti registrati nel tuo account Developer, quindi le ricevute del fornitore rimbalzerebbero. ⚠️ **Correzione 2026-07-23**: questo documento affermava che la funzione `isApplePrivateRelayEmail()` «esiste già ed è testata (verificato: `src/shared/auth/appleRelay.ts`)». **Falso**: il file non esiste e la stringa `privaterelay` non compare in `src/` (0 match). Va scritta. Stessa verifica su `profiles.contact_email`: **non esiste**, né in `supabase/migrations/` né nel tipo del profilo — la «regola email» richiede quindi anche una migration che aggiunga il campo, non solo codice app.
3. **Schermata onesta, una volta per utente.** «Le donazioni sono gestite da Donorbox (Stati Uniti) per conto di Rise. Ti portiamo lì con i dati già compilati.» Alla conferma si registra un evento di **informativa**, non di consenso (vedi §7).
4. L'app genera `rise_ref`, lo salva, e apre il browser di sistema (`WebBrowser.openBrowserAsync`, non una WebView) con: `first_name`, `last_name`, `email`, `utm_source=app-rise`, `utm_content=<rise_ref>`.

   ⚠️ **Correzione 2026-07-23 — NON su `/donaora/`.** Il documento diceva di passare i parametri alla pagina WordPress. **Non funziona, verificato:**
   - l'iframe dentro `/donaora/` ha src **fisso**: `https://donorbox.org/embed/dona-ora-rah?show_content=true` — i parametri della pagina ospitante non entrano;
   - nessuno script della pagina li travasa: `location.search` / `URLSearchParams` / `getParameterByName` = **0 occorrenze** nei 211 KB di HTML;
   - le [docs Donorbox](https://donorbox.zendesk.com/hc/en-us/articles/360020559931-How-to-pre-fill-fields-in-the-donation-form) confermano che prefill e UTM vanno sull'**URL Donorbox**, non su quello della pagina che lo incorpora.

   **Destinazione corretta**: un URL `donorbox.org` diretto (il dominio è già in allowlist). Due candidati, e la differenza NON è ancora dimostrata:
   - `https://donorbox.org/embed/dona-ora-rah?...` — **è quello su cui il prefill e `utm_content` sono stati verificati davvero**;
   - `https://donorbox.org/dona-ora-rah?...` — pagina ospitata e brandizzata (HTTP 200, `lang="it"`, title «RAH - Dona ora | Rise Against Hunger Italia»), migliore per l'utente, ma di essa è stato verificato **solo che risponde**: il form è renderizzato via JavaScript, quindi il prefill lì non è osservabile con una richiesta HTTP semplice.

   ⚠️ Non dare per scontato che il prefill funzioni identico sui due: sono URL diversi. Prima di scegliere la pagina ospitata va aperta in un browser con i parametri e guardato se i campi arrivano compilati — verifica di un minuto, che evita di ripetere esattamente l'errore corretto due paragrafi sopra (dare per «verificato» ciò che è stato provato altrove). Se non fosse confermata, si usa l'embed, che è già provato.

   **Motivo in più per non passare da `/donaora/`**: quella pagina monta **Google Tag Manager** (`GTM-5JBRPXW`) e **HubSpot** (`js.hs-scripts.com/8926509.js`). Nome, cognome ed email nella query string finirebbero nell'URL di pagina che quei tag leggono → dati personali a due destinatari in più, non dichiarati nell'informativa. (Risponde alla domanda aperta «pixel di terzi su `/donaora/`?»: sì, due.)

   **Residuo del criterio 7** (richiede ancora la donazione test da 1 €): che `utm_content` compaia davvero sulla riga della donazione restituita da `GET /api/v1/donations`. La domanda «i parametri sopravvivono all'iframe WordPress?» è invece **chiusa: no** — e non serve provarla, si cambia destinazione.
5. L'utente dona. **Nessuna registrazione, nessuna password, nessun secondo account.**
6. Torna nell'app col pulsante «Fine» del browser. Vede: «Grazie, stiamo registrando la tua donazione.» Nessun numero mostrato finché non è verificato.
7. Un lavoro schedulato interroga l'API Donorbox `GET /api/v1/donations?date_from=<cursore>`, legge `utm_content`, e scrive la donazione **collegata all'utente**.
8. Se `utm_content` manca o non risolve: **non ingeriamo la riga** (vedi §7, art. 14). Contiamo solo l'aggregato.

### 3B — Canale shop / gift card / eventi (Let's Donation) — attrito ridotto, non eliminato

1. L'utente tocca **Shop** o **Eventi**.
2. **Lo mandiamo direttamente alla pagina prodotto/evento, mai su `/register`.** Chi vuole comprare si registra al checkout, dove la motivazione è massima. Questa singola modifica riduce l'abbandono e **non richiede il permesso di nessuno**.
3. L'URL porta `?utm_source=app-rise&utm_content=<rise_ref>` (o il nome del campo sorgente che useranno loro).
4. Oggi: l'utente si registra da loro come sempre. Il ref viene ignorato. **Ma noi sappiamo quanti utenti mandiamo, e quel numero è l'unico argomento negoziale che pesa.**
5. Domani, se accettano: il ref finisce sull'**ordine** e torna nell'export. Da lì gli acquisti sono riconciliati.
6. **Non costruiamo nessun ponte di sessione, nessun login federato.** Se un giorno vorranno fare loro l'SSO (vedi §5 livello IDEALE), il `rise_ref` diventa la chiave e non si migra niente.

---

## 4. Cosa costruiamo noi — e quanto costa

**Gate esplicito**: la Fase 1 si fa **subito**. La Fase 2 si costruisce **solo se** la Fase 1 mostra almeno **~100 donazioni/mese** che arrivano dall'app. Sotto quel numero, un export CSV trimestrale scaricato a mano dal pannello Donorbox è la scelta corretta, e un webhook che nessuno guarda per otto mesi è peggio di nessun webhook.

### Fase 0 — bloccante, prima di qualunque codice

| Cosa | Dove | Sforzo |
|---|---|---|
| Riscrittura integrale di `privacy-policy.html` + allineamento del documento realmente mostrato (`RISE_URLS.privacyPolicy` punta al sito, non al file nel repo) | repo + sito | 2 g + revisione legale |
| Popolare `policy_versions.body` (oggi è `NULL`: il ledger dei consensi punta a un testo non conservato → prova probatoria vuota) | migration | 0,5 g |
| Verificare **region Supabase** e **region ingest Sentry** in dashboard | 10 minuti, e possono invalidare tutto il resto | — |

### Fase 1 — vale da sola, non dipende da nessuno

| Cosa | Dove | Sforzo |
|---|---|---|
| Migrazione URL `welfare4charity.com` → `letsdonation.com` **+ `donorbox.org` in allowlist, nello stesso commit** | `src/shared/constants/urls.ts`, `src/shared/hooks/useLinkHandler.ts`, `useActionButtonsData.ts:113` | 0,5 g |
| URL e allowlist letti da **config remota** (EAS Update o riga Supabase), coi valori attuali come fallback compilato | app | 0,5 g |
| `partner_refs` **storica**: `primary key(ref)`, `active bool`, `revoked_at`, indice parziale unico su `(user_id, partner) where active` — così il ref è davvero ri-emettibile senza perdere lo storico | migration | 0,5 g |
| `disclosure_events` separata (o `action='informed'` aggiunto al check **prima** del primo insert) | migration | 0,5 g |
| Schermata onesta pre-redirect + costruzione URL con guardia relay Apple | app | 1 g |
| **Tracciamento del click «Dona»** per canale — è il numero che decide tutto il resto | app + tabella | 0,5 g |
| Trigger `before delete on public.profiles` che scrive un **tombstone senza foreign key** (`ref`, `partner`, `requested_at`, `confirmed_at`) | migration | 0,5 g |

**Totale Fase 1: ~4 giorni.** Costo ricorrente: **zero**.

⚠️ Trappola verificata: `useLinkHandler.ts` fa `if (__DEV__) return true`. Se aggiorni gli URL senza toccare l'allowlist, **i pulsanti funzionano sulla tua macchina e muoiono in produzione**. Va fatto in un commit unico, con un test.

⚠️ Il **tombstone senza FK** e il **trigger su `profiles`** non sono raffinatezze. Oggi ci sono **due** percorsi di cancellazione: `delete-account` (immediato) e `purge-deletions` (grace 30 giorni). Se metti la propagazione dentro la sola Edge Function, metà delle cancellazioni non propaga e non te ne accorgi. E se la tabella dei ref ha `on delete cascade`, quando devi chiedere la cancellazione al partner **il ref non esiste più**: non puoi più dire *cosa* cancellare.

### Fase 2 — solo dopo il gate

| Cosa | Dove | Sforzo |
|---|---|---|
| Tabella `donations` con `unique(source, external_id)` e `user_id … on delete set null` | migration | 1 g |
| Edge Function `donorbox-sync`: pull con cursore **persistito in tabella** (mai calcolato da `max(occurred_at)`), validazione di schema, dead-letter table | `supabase/functions/` | 2 g |
| **Allarme sul silenzio** (deadman): `last_ok_at < now() − 6h` → notifica. Tutti i guasti veri si presentano come *assenza* di dati, e una soglia percentuale non scatta mai su zero righe | Edge Function + cron | 0,5 g |
| «Le mie donazioni» + «Collega una donazione» in app | app | 2 g |
| Estendere `ExportPayload` in `src/shared/auth/dataExport.ts` **nello stesso commit** (altrimenti «Esporta i miei dati» risponde in modo incompleto a una richiesta art. 15) | app | 0,5 g |

**Totale Fase 2: ~6 giorni** + **17 $/mese** (API Donorbox, da confermare sul piano attivo).

---

## 5. Cosa chiediamo a loro — tre livelli

| | Richiesta | Perché è formulata così | Sforzo loro |
|---|---|---|---|
| **MINIMO** | Che il campo **sorgente/campagna che già esiste sugli ordini** sia valorizzabile da URL e **compaia nell'export che già ci danno** | Non chiediamo una colonna nuova sull'anagrafica: quella tabella è **condivisa fra tutti i tenant**, e un concetto tuo in uno schema globale crea un precedente che loro non vogliono. L'ordine è comunque il posto giusto: quello che ti serve correlare sono **transazioni**, non persone | ore, se il campo c'è già |
| **BUONO** | Un **webhook** (= loro chiamano un nostro indirizzo appena succede qualcosa) firmato **HMAC-SHA256** (= firma calcolata con un segreto condiviso, che dimostra che il messaggio viene da loro) sul **corpo grezzo**, con un identificativo evento per non contare due volte | È già nel loro perimetro di prodotto e per tenant è **configurazione**, non sviluppo. È l'unica richiesta che il loro CTO ha detto di accettare così com'è | configurazione |
| **IDEALE** | SSO — ma **nel verso loro**: **«Accedi con Let's Donation»**, loro identity provider, noi consumatori | Chiedere a loro di *verificare la nostra firma* significa chiedergli una route pubblica che **crea-o-recupera** un utente su account condivisi fra tenant: la loro review di sicurezza la blocca, ed è giusto che la blocchi. Nel verso opposto è il flusso che già gestiscono. **Il costo lo paghi tu**: l'anagrafica autoritativa del donatore-che-compra non è più la tua. Da valutare, non da promettere | settimane, a contratto |

**Prima domanda da fare, vale più di tutte le altre:** *«Come vi arriva il dipendente dal portale welfare Zucchetti? Se c'è già un meccanismo di ingresso autenticato, riusiamo quello.»* Loro hanno confermato che **esiste**. Se è riusabile, l'SSO passa da sviluppo a configurazione.

**Tre regole per la conversazione**, che valgono quanto le richieste:
1. **Una mail, una richiesta.** Cinque punti numerati + domande su data residency = la mail esce dalle mani del tecnico e finisce in quelle del legale, dove muore per sei settimane.
2. **Non dirgli qual è il suo stack.** Il fingerprint pubblico dice Laravel/PHP, loro dicono che il core è .NET/SQL Server. Non è verificabile da fuori, e una stima di sforzo scritta da te su un sistema che non conosci ti toglie credibilità. Mai «sono tre righe».
3. **Aggancia la richiesta alla loro migrazione di dominio in corso** (301 da `welfare4charity` a `letsdonation`, verificato): *«già che state rifacendo le rotte, questo è il momento»*. È l'unico argomento che sposta davvero una priorità.

E prima della call: **scopri chi è il referente commerciale, quanto paga l'associazione e quando scade il contratto.** Nessuna di queste richieste si decide sul merito tecnico.

---

## 6. Piano B e Piano C

### Piano B — loro non fanno nulla (scenario più probabile)

Sblocca comunque il ~70% del valore, **senza chiedere niente**:

1. **Tutta la Fase 1** (§4): è già indipendente da loro.
2. **Puntare alle pagine prodotto invece che a `/register`** — il loro CTO l'ha esplicitamente incoraggiato.
3. **Canale Donorbox completo**: prefill + correlazione + storico in app. Qui gli obiettivi (a), (b) e (c) sono risolti davvero, e lì passa il denaro.
4. **Export CSV del loro pannello, scaricato a mano** ogni trimestre, riconciliato per email quando possibile. Peggiore in UX, zero rischio, reversibile in un pomeriggio.
5. **«Collega una donazione»** in app: l'utente rivendica una donazione fatta fuori dall'app (dal sito, da WhatsApp, a un evento), approvata in automatico solo se l'email coincide con una sua email verificata.
6. **Il numero**: dopo 60 giorni sai quanti utenti mandi loro ogni mese. Torni con quel numero. È l'unico argomento che pesa più di qualunque riga di codice.

### Piano C — fallback estremo (nemmeno l'export)

- Il canale Let's Donation resta **non riconciliato**, e lo dichiari: la voce in app si chiama onestamente **«Le donazioni fatte da questa app»**, non «Le mie donazioni».
- Schermata onesta prima del redirect: *«Il negozio solidale è gestito da un partner. Il primo acquisto richiede un account lì — un minuto.»* L'utente che **sa perché** gli si chiede un secondo account non si sente truffato: riduce l'abbandono più di qualunque trucco tecnico.
- Rivendicazione manuale + riconciliazione a mano su ricevuta.
- **In nessuno scenario, nemmeno qui, si apre un database.** Se l'alternativa è «accesso al DB o niente», la risposta corretta è **niente**.

---

## 7. GDPR — cosa serve **prima** di far partire qualunque cosa

🔷 Tutta la sezione va validata da avvocato/DPO.

**Ordine non negoziabile.** Il piano naturale dice «facciamo subito la parte che non dipende da nessuno». Ma quella parte spedisce nome, cognome ed email a un fornitore **statunitense**. Base giuridica, informativa e contratto vengono **prima del primo byte**, non in parallelo.

| # | Cosa | Stato oggi | Perché blocca |
|---|---|---|---|
| 1 | **Riscrivere l'informativa** | `privacy-policy.html:29` dice «NON raccoglie alcun dato personale»; `:92` dice che i diritti GDPR «non sono applicabili» | È una dichiarazione pubblica falsa che **nega i diritti dell'interessato**, su un'app già distribuita. Indebolisce a ritroso ogni consenso raccolto. Non richiede il permesso di nessun fornitore per essere sanata |
| 2 | **Elenco completo dei destinatari** | Mancano **Supabase, Sentry, Google, Apple, Expo/EAS**, oltre a Donorbox e Let's Donation | L'app manda a Sentry l'UUID dell'utente (`AuthContext.tsx`), che è la chiave di join di tutto |
| 3 | **Region Supabase + region Sentry** | **Assunto, mai verificato** | 10 minuti in dashboard. Se una delle due è negli USA, il quadro dei trasferimenti cambia di segno |
| 4 | **DPA + clausole di trasferimento** per Donorbox (USA) e Supabase | Assenti | Donorbox è **già in produzione oggi**: è un problema che esiste a prescindere da questo progetto |
| 5 | **Qualificare il rapporto con Let's Donation** | Nessun atto scritto. La loro privacy policy — che è un **template identico su altri tenant** — vi dichiara unilateralmente «titolari autonomi» | È la posizione peggiore delle tre: se il Garante legge contitolarità (art. 26) manca l'accordo; se legge art. 28 manca il DPA. In entrambi i casi la violazione è formale e imputata **all'associazione** |
| 6 | **Consenso ≠ informativa** | `consent_events.action` ammette solo `granted`/`withdrawn` | Registrare una disclosure come *consenso concesso* crea un consenso **non revocabile** (art. 7.3) e **condizionato al servizio** (art. 7.4) → invalido, e contamina i consensi veri, in una tabella append-only dove **non si corregge** |
| 7 | **Non ingerire le donazioni non correlate** | Il piano naturale le ingeriva tutte | Sono persone che non hanno mai visto la tua informativa → scatta l'**art. 14**. Ingerire solo ciò che ha `rise_ref` elimina il problema alla radice, e con esso il rischio «mini-CRM» |
| 8 | **Cancellazione propagata (artt. 17 e 19)** | `delete-account` cancella solo dentro Supabase | Serve il tombstone senza FK + il trigger unico (§4). E va detto all'utente che **una donazione ricorrente resta attiva**: se non puoi annullarla tu, l'unica cosa onesta è darle il link per farlo |
| 9 | **Eccezione fiscale** | Non dichiarata | Le ricevute hanno conservazione decennale: non si **cancellano**, si **limitano** (art. 18). Va scritto, non improvvisato al primo che lo chiede |
| 10 | **Registro dei trattamenti (art. 30)** | Non esiste | Due ore su un foglio. Senza, ogni discorso di conformità è indimostrabile |

**Base giuridica, in breve.** Il passaggio di nome/cognome/email **nel momento in cui l'utente tocca «Dona»** sta in **art. 6.1.b** (servizio richiesto dall'interessato): campi minimi, innescato dal suo gesto, destinatario **nominato in informativa**, nessun consenso separato. 🔷 Attenzione: se lo scopo del prefill è ridurre l'attrito, la finalità è di conversione, non di esecuzione — in quel caso serve un legittimo interesse documentato o un consenso. **Un sync anagrafico massivo «casomai un giorno donino» non regge su nessuna base.** Quello è il confine da non superare.

---

## 8. Failure modes

| Cosa può andare storto | Cosa facciamo |
|---|---|
| **Il fornitore non risponde / dice no a tutto** | Piano B. Nessuna riga di Fase 1 è stata scritta per lui |
| **L'API Donorbox cambia formato** *(è successo davvero, in uno scenario simulato a 12 mesi)* | Validazione di schema all'ingresso, **dead-letter table**, e risposta comunque 2xx così non ci disattivano l'endpoint. Cursore in tabella, mai calcolato dai dati |
| **Il sync smette di funzionare in silenzio** | **Allarme deadman** su `last_ok_at`. Una soglia percentuale (es. «unmatched > 30%») **non scatta mai** se non arriva nessuna riga: è il guasto più frequente e il più invisibile |
| **Loro chiudono il 301 e dismettono `welfare4charity.com`** | URL e allowlist in config remota, non compilati nel binario. Altrimenti servono giorni di review Apple per riparare quattro bottoni morti |
| **Gli UTM non passano dall'iframe WordPress** | **Primo test da fare**, prima di scrivere codice. Se non passano: puntare direttamente all'embed Donorbox, ma allora l'URL **deve** stare in config remota, perché uno slug di campagna archiviato nel pannello romperebbe il pulsante «Dona» di tutte le installazioni |
| **Utente cancella l'account** | Trigger unico su `profiles` → tombstone senza FK → coda letta sia dalla propagazione al partner sia dall'ETL verso Access. `donations.user_id` con `on delete set null`, altrimenti la cancellazione **fallisce con errore 500 in faccia a chi esercita l'art. 17** |
| **Donazione ricorrente dopo la cancellazione** | L'identificativo del donatore Donorbox sta nel **tombstone**, non in una riga cancellata, così l'ingest la riconosce e la scarta. E la schermata di cancellazione avvisa che il ricorrente resta attivo |
| **Il ref viene copiato da un log / condiviso** | Attribuzione sbagliata di una donazione. **Mai accesso, mai sessione, mai impersonificazione.** È il motivo per cui questo disegno regge dove un token di sessione sarebbe fragile |
| **Data breach dal loro lato** | I ref si ruotano: `partner_refs` è storica, si mette `active = false` e si ri-emette senza perdere le correlazioni passate. Serve una clausola di notifica reciproca **≤ 24h** nell'accordo, prima del primo invio |
| **Email diversa fra i due sistemi** | Irrilevante: il join è sul ref, non sull'email. Con Apple private relay una persona ha **tre** email diverse — il match per email fallisce **in silenzio**, che è il modo peggiore di sbagliare |
| **Utente già registrato da loro** | Se il ref sta sull'**ordine** (§5 MINIMO), funziona identico: non c'è nessun account da fondere. È il motivo per cui la richiesta «salvalo sull'anagrafica al login» va abbandonata |
| **Doppio account (stessa persona, due profili Rise)** | Non risolvibile tecnicamente, né qui né con un SSO. Fusione manuale in Access, come già oggi |

---

## 9. Domande aperte — solo il fornitore può rispondere

### Canale tecnico (nella call della settimana prossima)

1. Come arriva a voi l'utente dal portale welfare Zucchetti? Token firmato, punchout, altro — e possiamo riusare quel meccanismo invece di costruire qualcosa di nuovo?
2. Sugli ordini/registrazioni esiste già un campo **sorgente/campagna** valorizzabile da URL? Se sì, quale nome di parametro leggete, e compare già nell'export?
3. L'export del nostro tenant è **self-service** dal pannello o lo produce il vostro supporto? Con che formato e che cadenza?
4. Avete un **webhook in uscita** su ordine/donazione completata? Con quale schema di firma, quale politica di ritentativi e quale identificativo di evento?
5. Per gift card ed eventi esiste (o è attivabile) un acquisto **senza creazione di account**?
6. Il vostro **«Accedi con Let's Donation»** esiste come prodotto? Se sì, cosa serve per attivarlo su un tenant e cosa restituisce al consumatore?
7. Confermate che il redirect da `riseagainsthunger.org.welfare4charity.com` resterà attivo almeno 12 mesi?

### Canale commerciale/legale (mail separata, **dopo** il sì tecnico)

8. Pacchetto DPA / accordo standard: qual è il documento e chi lo firma?
9. Ubicazione fisica dei server e dei backup; eventuali trasferimenti fuori dallo Spazio Economico Europeo, con quale garanzia.
10. Elenco dei sub-fornitori che trattano dati dei nostri donatori, e preavviso sui nuovi.
11. Notifica di violazione dei dati verso di noi entro **24 ore** (le nostre 72 partono da quando ce lo dite voi).
12. Isolamento fra i tenant della piattaforma: quali garanzie, quali verifiche di sicurezza.
13. Retention: dichiarate 10 anni / 24 mesi marketing — allineabile o motivata?
14. Come esercita un nostro utente la cancellazione presso di voi, e con quali tempi di riscontro.
15. Se dopo tutto questo serve sviluppo custom: preventivo e tempi, per iscritto.

---

## 10. Cosa non sappiamo ancora

| Fatto | Qualificatore | Come si chiude |
|---|---|---|
| Prefill Donorbox (`first_name/last_name/email`) funziona sull'embed | **Verificato** (i valori tornano nell'HTML) | — |
| `utm_content` finisce nel campo nascosto della donazione e torna nell'API | **Verificato** (dump dei campi hidden + README API Donorbox) | — |
| Gli stessi parametri sopravvivono all'iframe dentro `/donaora/` | **Non verificato** | Donazione di prova da 1 € con ref noto. **Primo test in assoluto** |
| Il piano Donorbox dell'associazione include l'accesso API (17 $/mese) | **Assunto** | Dashboard Donorbox, 2 minuti |
| Il webhook Donorbox è firmato | **Non verificato** | Se non lo è: trattarlo come semplice segnale e rileggere la verità dall'API autenticata |
| Region del progetto Supabase `yrsilvbuq…` | **Assunto** | Dashboard, 5 minuti. **Può invalidare l'impianto** |
| Region di ingest Sentry | **Assunto** | Dashboard, 5 minuti |
| Il core Let's Donation è SQL Server | **Dichiarato dal fornitore, non verificabile da fuori** — il layer web mostra impronte Laravel/PHP | Domanda 2 del canale commerciale. **Irrilevante se non apriamo database** — ed è un motivo in più per non aprirli |
| `?rise_ref=` arriva davvero alla loro applicazione | **Non dimostrato**: un HTTP 200 prova solo che il framework non rifiuta un parametro extra. Una cache che normalizza la chiave lo scarterebbe prima dell'origin | Domanda 2 del canale tecnico |
| Chi produce l'export Let's Donation oggi, e cosa contiene | **Ignoto** | Guardare nel pannello **prima** della call: se il campo sorgente c'è già, la richiesta minima è già soddisfatta |
| Referente commerciale, importo e scadenza contratto | **Ignoto** | Chiedere in associazione. Determina se «roadmap» significa «tre mesi» o «mai» |
| Tracker presenti sulla pagina WordPress `/donaora/` | **Non verificato** | Se ci sono pixel di terzi, un identificativo per-utente negli UTM finisce da soggetti fuori da qualunque accordo. Da controllare o da bypassare |

---

## Se dovessi salvare una sola cosa

Non `rise_ref`. **L'informativa.** Finché `privacy-policy.html` dice a un'app in produzione che non raccoglie dati personali e che i diritti GDPR non sono applicabili, ogni discussione su firme e webhook è ottimizzazione sopra un problema che esiste **oggi** e che non richiede il permesso di nessun fornitore per essere risolto.

---
---

# === BOZZA EMAIL AL FORNITORE ===

**A:** referente tecnico Let's Donation
**Oggetto:** App Rise Against Hunger Italia — una richiesta sul tracciamento sorgente

---

Buongiorno,

sono Riccardo, sviluppo l'app di Rise Against Hunger Italia. I nostri sostenitori si registrano nell'app e da lì arrivano alle vostre pagine (shop solidale, gift card, eventi, progetti).

Vorremmo riconoscere che una persona che acquista da voi è la stessa che si è registrata da noi, **senza farla registrare due volte** e senza scambiare dati anagrafici più del necessario.

**Non vi chiediamo accessi a database, in nessuna direzione, né credenziali, né aperture di rete.**

**La richiesta, una sola.** Quando mandiamo un utente da voi aggiungiamo in query string un identificativo pseudonimo casuale (nessun nome, nessuna email — resta comunque un dato personale ai sensi del GDPR e va trattato come tale). Vorremmo che venisse conservato **sull'ordine** e restituito nell'export che già ci fornite.

Prima di chiedervi di costruire qualcosa, la domanda vera è: **avete già un campo sorgente/campagna sugli ordini, valorizzabile da URL?** Se sì, ci basta sapere quale parametro leggete e se compare già nell'export: non serve nessuno sviluppo.

**Domande tecniche:**

1. Come arriva a voi l'utente dal portale welfare Zucchetti? Se esiste già un ingresso autenticato, preferiamo riusare quello invece di farvi costruire qualcosa di nuovo.
2. Esiste già un campo sorgente/campagna sugli ordini valorizzabile da URL? Quale nome di parametro leggete?
3. Quel campo compare nell'export del nostro tenant? E l'export è self-service dal pannello o lo produce il vostro supporto?
4. Avete un webhook in uscita a ordine/donazione completata? Con quale schema di firma, quale politica di ritentativi e quale identificativo di evento per l'idempotenza?
5. Per gift card ed eventi è attivabile un acquisto senza creazione di account?
6. Esiste un vostro «Accedi con Let's Donation» attivabile su un tenant? Se il tema è il single sign-on, ci interessa valutarlo in quella direzione.
7. I nostri link puntano ancora a `riseagainsthunger.org.welfare4charity.com` e funzionano grazie al vostro redirect. Stiamo migrando agli URL `letsdonation.com`: confermate che il redirect resterà attivo per almeno 12 mesi?

Vedo che state migrando il dominio: se c'è un momento buono per infilarci il tracciamento sorgente, probabilmente è questo.

Vi va una call tecnica di **30 minuti** la prossima settimana? Le richieste contrattuali e di protezione dati le faremo arrivare separatamente al vostro riferimento commerciale, per non appesantire questa conversazione.

Grazie,

**Riccardo**
Rise Against Hunger Italia