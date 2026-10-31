# App Store Connect — risposte campo per campo

App iOS esistente «Rise Against Hunger Italia» (<https://apps.apple.com/it/app/id6447248221>), bundle
`it.creareunapp.editor.ios63da226b4447c` (`app.config.js:120-122`). In vendita c'è la 1.2.9 del 25/11/2025,
con «Dati non raccolti» ed età 4+ (pagina pubblica letta il 30/10/2026). Nessuna build EAS di questo progetto ha
prodotto quella versione: le build iOS su EAS partono da giugno 2026 e sono tutte interne. Cosa manda la 1.2.9,
quindi, non si misura da questo repository.

Ogni risposta descrive la **1.3.0**, la prima versione iPhone con l'account. I dati sono gli stessi della versione
Android: l'elenco dei campi sta in `../google-play/play-console-risposte.md` § «Tipi di dati», qui si traduce nelle
voci di Apple. Se cambia il codice (dati raccolti, partner, login), questa pagina si aggiorna nello stesso commit.
Nessun controllo automatico per ora (per Android c'è `node scripts/verifica-android-play.mjs C17`).

Fonti lette il 31/10/2026: [App privacy details](https://developer.apple.com/app-store/app-privacy-details/),
[Age ratings values and definitions](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions),
[Set an app age rating](https://developer.apple.com/help/app-store-connect/manage-app-information/set-an-app-age-rating),
[App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).

## Quando si cambiano

Apple: «You may update your answers at any time, and you do not need to submit an app update in order to change
your answers». Lettura mia: le risposte sulla privacy sono dell'app, non della singola versione. Si cambiano subito
prima di inviare la 1.3.0 alla revisione; per i giorni della revisione la scheda della 1.2.9 mostrerà i dati della
1.3.0. Scarto accettato: dichiarare in più per qualche giorno è meno grave che dichiarare in meno.

## Informazioni sull'app

| Campo | Risposta |
| --- | --- |
| Nome | Rise Against Hunger Italia |
| Categoria principale | Stile di vita, come su Play (decisione del 12/10). Quella attuale della 1.2.9 non è stata letta |
| Contenuti di terzi | Sì, con i diritti necessari: la mappa del mondo usa i confini di Natural Earth (pubblico dominio) tramite `world-atlas` (`package.json:132`). Le immagini in `assets/` sono dell'associazione |

## Classificazione per età

Il questionario è cambiato nel 2025: fasce 4+, 9+, 13+, 16+, 18+ e domande nuove su controlli e funzionalità. Le
risposte servivano entro il 31/01/2026 per continuare a inviare aggiornamenti (avviso
[developer.apple.com/news/?id=ks775ehf](https://developer.apple.com/news/?id=ks775ehf), riportato da più testate;
il testo dell'avviso non è stato riletto). La 1.2.9 è precedente, quindi all'invio della 1.3.0 il questionario va
compilato.

| Sezione | Voce | Risposta | Perché |
| --- | --- | --- | --- |
| Controlli nell'app | Controllo parentale | No | |
| Controlli nell'app | Verifica dell'età (Age Assurance) | No | Apple: «Mechanism to confirm an individual's age». L'app chiede la data di nascita e blocca l'account sotto i 14 anni, ma l'età è dichiarata, non confermata; gli esempi di Apple sono tutti di verifica (API, stima, documento). Scelta mia: dire Sì farebbe credere a una protezione che non c'è. La voce non cambia la fascia |
| Funzionalità | Navigazione web senza restrizioni | No | I link si aprono in Safari (`Linking.openURL`, `src/shared/hooks/useLinkHandler.ts:135`); nell'app non c'è un browser |
| Funzionalità | Contenuti degli utenti, Social media, Messaggi e chat | No | Nessuna chat, commento o profilo pubblico |
| Funzionalità | Pubblicità | No | Nessuna promozione a pagamento |
| Temi per adulti | Volgarità, Paura, Alcol tabacco droghe | Nessuno | |
| Medico o benessere | Informazioni mediche, Salute e benessere | Nessuno | |
| Sessualità o nudità | Tutte | Nessuno | La voce «temi maturi» comprende «real-world issues»: i numeri sulla fame e i paesi serviti non hanno immagini né racconti crudi. Scelta mia: Nessuno |
| Violenza | Tutte | Nessuno | |
| Attività basate sul caso | Gioco d'azzardo, simulato, Concorsi, Loot box | Nessuno | |

**Fascia calcolata: 4+**, la stessa di oggi. «Age Categories and Override»: **Non applicabile**.

Perché non alzarla. Apple obbliga a farlo solo in un caso: «If your app has a EULA with minimum age requirements
that exceed the rating that Apple calculated, you must override». L'app usa la licenza standard di Apple (nel
repository non esistono termini d'uso propri) e i 14 anni (`privacy-policy.html:491`,
`src/shared/auth/validation.ts:35`) valgono per creare l'account, mentre l'app si usa anche senza. Scartato 13+
(il pubblico scelto su Play): non coincide comunque con i 14 anni e toglierebbe l'app a chi ha i controlli
parentali sotto i 13 senza un motivo di contenuto. Scartato 16+: escluderebbe chi a 14 e 15 anni può registrarsi.

Quando cambia:

- se l'associazione pubblica termini d'uso con un'età minima, alzare la fascia diventa obbligatorio;
- **App Rise 2**: badge, punti e status di Hunger Hero rientrano in «Contests» («the achievement of personal
  goals»); con frequenza «Frequent» la fascia sale a 13+. Il questionario si rifà con la v2 (goal `app-rise-v2`).

## Privacy dell'app

### Informativa

`https://italy.riseagainsthunger.org/privacy-policy/`, lo stesso indirizzo dichiarato a Play e aperto dall'app
(`src/shared/constants/urls.ts:33`).

### Tracciamento: No

Apple: «"Tracking" refers to linking data collected from your app about a particular end-user or device […] with
Third-Party Data for targeted advertising or advertising measurement purposes, or sharing data […] with a data
broker».

- Nessuna libreria pubblicitaria, nessun accesso all'identificativo pubblicitario (`NSUserTrackingUsageDescription`
  assente da `app.config.js`), quindi nessuna richiesta di permesso al tracciamento.
- Il codice di provenienza va a Donorbox (`utm_content`) e a Let's Donation (`rise_ref`) per riconoscere i
  contributi arrivati dall'app (`src/shared/partner/partnerUrls.ts`). Non si unisce a dati di altre aziende per
  pubblicità mirata né per misurare la pubblicità, e nessuno dei due è un data broker.
- Residuo: se un giorno quei codici servissero a misurare campagne pubblicitarie, la risposta diventa Sì e
  serve la richiesta di permesso.

### Tipi di dati raccolti

«Collect» per Apple: dati che escono dal telefono e restano accessibili a noi o ai partner il cui codice è
nell'app (qui Supabase ed Expo) oltre il tempo della richiesta. Dati personali per legge = collegati all'identità.

| Voce Apple | Campi | Collegato all'identità | Per tracciare | Finalità |
| --- | --- | --- | --- | --- |
| Informazioni di contatto → Nome | `first_name`, `last_name`, `nickname` | Sì | No | Funzionalità dell'app |
| Informazioni di contatto → Indirizzo email | `email`, `contact_email` | Sì | No | Funzionalità dell'app; Pubblicità o marketing dello sviluppatore (solo con `marketing_consent`) |
| Informazioni di contatto → Numero di telefono | `phone` | Sì | No | Funzionalità dell'app |
| Informazioni di contatto → Indirizzo fisico | `city`, `province`, `country` | Sì | No | Funzionalità dell'app |
| Contenuti dell'utente → Assistenza clienti | testo che la persona scrive in «Segnala un problema» | Sì | No | Funzionalità dell'app |
| Identificativi → ID utente | id dell'account, codice di provenienza | Sì | No | Funzionalità dell'app; Analisi (riconoscere i contributi arrivati dall'app) |
| Identificativi → ID dispositivo | identificativo casuale dell'installazione inviato da `expo-updates` (`EAS-Client-ID`) | Sì | No | Funzionalità dell'app |
| Diagnostica → Dati sugli arresti anomali | riga registrata dalla schermata d'errore: ora UTC, ramo `ErrorBoundary`, nome dell'errore | Sì | No | Funzionalità dell'app |
| Diagnostica → Altri dati diagnostici | versione, aggiornamento, sistema e dispositivo, lingua, scala del testo, finestra, ultimi codici d'errore filtrati | Sì | No | Funzionalità dell'app |
| Altri dati → Altri tipi di dati | `birth_date`, `privacy_consent`, `marketing_consent` | Sì | No | Funzionalità dell'app (età minima, registro dei consensi) |

Non raccolti: salute e fitness, informazioni finanziarie, posizione (precisa e approssimativa), informazioni
sensibili, contatti, email o messaggi, foto o video, audio, contenuti di gioco, altri contenuti dell'utente,
cronologia di navigazione e di ricerca, acquisti, dati d'uso (interazioni, dati pubblicitari, altri), dati sulle
prestazioni, ambiente circostante, corpo.

Etichetta che ne esce: **Dati usati per tracciarti**: nessuno. **Dati collegati a te**: informazioni di contatto,
contenuti dell'utente, identificativi, diagnostica, altri dati. **Dati non collegati a te**: nessuno.

### Perché così (scelte che un confronto con Play fa notare)

- **Finalità della diagnostica.** Apple mette «minimize app crashes» e «perform customer support» dentro
  «App Functionality»; Play chiamava gli stessi dati «Analisi». Stessi dati, due vocabolari.
- **Diagnostica e Assistenza clienti dichiarate anche se partono solo con la mail.** La divulgazione facoltativa
  vale solo se tutti e quattro i criteri sono veri; il quarto chiede che i dati siano forniti «in your app's
  interface» con il nome dell'utente in evidenza nel modulo. Qui il modulo è l'app di posta, non la nostra. Scelta
  mia, prudente.
- **ID dispositivo collegato.** Expo lo descrive come «a random identifier for one installation of your app» da
  trattare come dato pseudonimo ([docs.expo.dev/eas/observe/reference/client-id](https://docs.expo.dev/eas/observe/reference/client-id/));
  per Apple i dati personali secondo la legge contano come collegati.
- **Città, provincia e paese** vanno in «Indirizzo fisico», non in «Posizione»: li scrive la persona, l'app non usa
  la localizzazione.
- **Data di nascita e consensi**: Apple non ha una voce propria, quindi «Altri tipi di dati».
- **Apple non chiede cosa è «condiviso».** Chiede cosa raccogliamo noi e chi ha codice nell'app. Donorbox e Let's
  Donation si aprono in Safari: ciò che ricevono (nome, email, codice di provenienza) è già nelle voci sopra.

## Informazioni per la revisione

- **Accesso richiesto: Sì.** Linea guida 2.1: «include demo account info (and turn on your back-end service!)».
  L'account demo lo crea Riccardo; le credenziali si scrivono solo in App Store Connect, mai in questo repository.
- **Note per il revisore** (da incollare):

  > The app can be used without an account: Home, Impact, Actions and About Us are open to everyone. The personal area
  > requires sign-in: tap the person icon at the top right of Home, Impact or Actions ("Donor Area") and sign in with
  > the demo account below. Donations open the Donorbox page in Safari: the app does not collect funds
  > (Guideline 3.2.2(iv)). Rise Against Hunger Italia ETS is a registered Italian non-profit (RUNTS no. 172977).

- 🔴 **Server acceso per tutta la revisione.** Il database è sul piano gratuito di Supabase, che si ferma da solo
  quando resta inattivo: il 30/10 era `INACTIVE`, il 31/10 `ACTIVE_HEALTHY` dopo la riattivazione. Prima
  dell'invio e ogni giorno della revisione si controlla lo stato; la soluzione stabile è il piano a pagamento
  (decisione con costi, di Riccardo).
- **Contatto**: chi segue la pubblicazione, come per Play (`../google-play/rilascio.md` § «Chi fa cosa»).

## Login e account

- **4.8, servizi di login**: l'app usa solo email e password (login social tolto il 26/07/2026,
  `app.config.js:249-251`). Rientra in «Your app exclusively uses your company's own account setup and sign-in
  systems»: «Accedi con Apple» non è richiesto.
- **5.1.1(v)**: chi crea un account lo elimina dall'app (`DeleteAccountScreen`); senza account l'app si usa lo stesso.

## Crittografia

`ITSAppUsesNonExemptEncryption: false` (`app.config.js:129`): l'app usa solo l'HTTPS del sistema.

## Donazioni e acquisti

| Cosa fa l'app | Regola | Esito |
| --- | --- | --- |
| «Dona» → pagina Donorbox in Safari | 3.2.2(iv): chi non è «approved nonprofit» raccoglie fondi solo fuori dall'app, «such as via Safari or SMS», e l'app deve essere gratuita | Ammesso. Diventare «approved nonprofit» (3.2.1(vi)) permetterebbe le donazioni nell'app con Apple Pay: non serve ora |
| Shop solidale ed eventi di confezionamento di Let's Donation | 3.1.3(e): beni fisici e servizi consumati fuori dall'app si pagano senza acquisto in app | Ammesso |
| Gift card di Let's Donation | 3.1.1: l'acquisto in app è obbligatorio solo per gift card digitali «redeemed for digital goods or services» vendute nell'app | Lettura mia: valgono per donazioni ed eventi, non per contenuti dell'app, e si comprano sul sito. Se il revisore obietta, il pulsante si nasconde su iOS |

## Venditore

La pagina pubblica mostra il venditore «Onlus». Il D-U-N-S è già passato a ETS (caso D&B chiuso il 22/10/2026).
Che il nome nell'account Apple Developer si aggiorni da solo non è verificato: si chiede al supporto Apple Developer.
Azione di Riccardo.

## Manifesto privacy

`app.config.js` non ha `ios.privacyManifests`. Da dove arrivi il `PrivacyInfo.xcprivacy` dell'app non è verificato:
si controlla sulla build 1.3.0 prima dell'invio, con `unzip -l <file>.ipa | grep -i PrivacyInfo.xcprivacy`, che deve
elencare anche `Payload/<nome>.app/PrivacyInfo.xcprivacy`.

## Prezzo e disponibilità

Gratuita (la chiede anche la 3.2.2(iv)). Paesi: i 42 europei di oggi, misurati il 09/10 (elenco in
`../google-play/play-console-risposte.md` § «Paesi»).

## Prima di inviare la 1.3.0

1. Account demo creato e provato (Riccardo).
2. Database `ACTIVE_HEALTHY`, e acceso fino alla fine della revisione.
3. Questionario dell'età compilato come sopra.
4. Privacy dell'app aggiornata come sopra.
5. `PrivacyInfo.xcprivacy` presente nella build.
6. Nome del venditore: richiesta al supporto Apple Developer partita.
