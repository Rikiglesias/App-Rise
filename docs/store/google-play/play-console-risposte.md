# Play Console — risposte campo per campo

App nuova `org.riseagainsthunger.italia` («Rise Against Hunger Italia»). Le risposte si incollano in Play Console
dall'account dell'associazione; chi fa cosa e in che ordine sta in `rilascio.md` § «Chi fa cosa».
Controllo automatico: `node scripts/verifica-android-play.mjs C17`.

Ogni risposta descrive l'app così com'è nella versione 1.3.0. Se cambia il codice (dati raccolti, partner, login),
questa pagina si aggiorna nello stesso commit.

## Creazione app

| Campo | Risposta |
| --- | --- |
| Nome app | Rise Against Hunger Italia |
| Lingua predefinita | Italiano – it-IT |
| App o gioco | App |
| Senza costi o a pagamento | Senza costi |
| Dichiarazioni (norme per gli sviluppatori, leggi USA sull'esportazione) | Accettare entrambe |

## Impostazioni della scheda

| Campo | Risposta |
| --- | --- |
| Categoria | Stile di vita (decisione del 12/10, binding § Sintesi F0) |
| Tag | Facoltativi: nessuno |
| Email | `info@riseagainsthunger.it` |
| Sito web | <https://italy.riseagainsthunger.org> |
| Telefono | Vuoto (facoltativo; i telefoni dell'account si verificano a parte, vedi «Chi fa cosa» → Simone) |

Testi della scheda: `scheda.md`. Grafica (icona 512, grafica in evidenza, screenshot): `rilascio.md` § «Scheda e moduli».

## URL delle norme sulla privacy

`https://italy.riseagainsthunger.org/privacy-policy/` — lo stesso indirizzo che l'app apre
(`src/shared/constants/urls.ts:25`). La pagina deve mostrare il testo di `privacy-policy.html` aggiornato
(la pubblica la sede USA dopo il sì della consulente: «Chi fa cosa» → Sede USA, Consulente).

## Accesso all'app

- Risposta: «Tutte le funzionalità o alcune sono limitate».
- Istruzioni per i revisori (da incollare):
  «L'app si usa senza account: Home, Impatto, Contribuisci e Chi siamo sono aperti a tutti. L'area personale
  (Profilo) richiede l'accesso: toccare l'icona del profilo in alto a destra nella Home e accedere con le credenziali
  qui sotto.»
- Credenziali: l'account demo lo crea Riccardo («Chi fa cosa» → Riccardo, account demo). Le credenziali si scrivono
  solo in Play Console, mai in questo repository.

## Annunci

«No, la mia app non contiene annunci.» Nessuna libreria pubblicitaria nel progetto.

## ID pubblicità

«No» alla domanda sull'uso dell'ID pubblicità. Il permesso `com.google.android.gms.permission.AD_ID` è bloccato in
`app.config.js` (`blockedPermissions`) e assente dal manifest finale (controllo C11).

## Classificazione dei contenuti

Questionario IARC, categoria «Tutti gli altri tipi di app». Risposte:

| Domanda | Risposta | Perché |
| --- | --- | --- |
| Violenza, sangue, paura | No | Contenuti informativi sull'associazione |
| Sessualità, nudità | No | |
| Linguaggio volgare | No | |
| Sostanze controllate (droghe, alcol, tabacco) | No | |
| Gioco d'azzardo, simulato o reale | No | |
| Gli utenti possono interagire o scambiarsi contenuti | No | Nessuna chat, commento o profilo pubblico |
| Condivide la posizione dell'utente | No | L'app non accede alla posizione |
| Acquisti di beni digitali | No | Donazioni e acquisti avvengono su siti esterni, nel browser |
| Navigazione web senza restrizioni | No | L'app apre solo pagine dei partner nel browser del telefono |

## Pubblico di destinazione

- Fasce d'età: 13-15, 16-17, 18 e oltre (decisione del 12/10). Un account si crea solo da 14 anni
  (`src/shared/auth/validation.ts:35`, vincolo del database nella migration 0019).
- «L'app potrebbe attirare involontariamente i bambini?»: No — contenuti su fame nel mondo, volontariato e donazioni,
  nessun personaggio o gioco.

## App di notizie

«No, la mia app non è un'app di notizie.»

## Sicurezza dei dati

Fonte delle definizioni: support.google.com/googleplay/android-developer/answer/10787469.
«Raccolta» = dati trasmessi dall'app fuori dal dispositivo. «Condivisione» = dati trasferiti a terzi, con eccezioni:
fornitori che trattano i dati per conto nostro (Supabase, Expo); trasferimento «su un'azione specifica avviata
dall'utente, quando l'utente si aspetta ragionevolmente» che i dati vengano condivisi, o dopo un avviso in evidenza
nell'app con consenso.

### Domande generali

| Domanda | Risposta |
| --- | --- |
| L'app raccoglie o condivide dati utente dei tipi richiesti? | Sì |
| Tutti i dati sono criptati in transito? | Sì (HTTPS verso Supabase ed Expo) |
| Metodi di creazione dell'account | Nome utente e password (email e password) |
| URL per la richiesta di eliminazione dell'account | Pagina `elimina-account.html` pubblicata dalla sede USA (indirizzo definitivo: «Chi fa cosa» → Sede USA) |
| Si possono chiedere di eliminare alcuni dati senza eliminare l'account? | No: dall'app si elimina l'account intero; per altro si scrive a `info@riseagainsthunger.it` |

### Tipi di dati

Ogni campo inviato al profilo da `useSignUpForm.ts` è nella colonna «Campi».

| Tipo (Play Console) | Campi | Raccolto | Condiviso | Facoltativo | Finalità |
| --- | --- | --- | --- | --- | --- |
| Informazioni personali → Nome | `first_name`, `last_name`, `nickname` | Sì | No (vedi Donorbox sotto) | Sì: l'app si usa senza account | Funzionalità dell'app, Gestione dell'account |
| Informazioni personali → Indirizzo email | `email`, `contact_email` | Sì | No (vedi Donorbox sotto) | Sì: l'app si usa senza account | Gestione dell'account, Funzionalità dell'app, Comunicazioni dello sviluppatore (solo con `marketing_consent`) |
| Informazioni personali → ID utente | id dell'account, codice di provenienza | Sì | **Sì**: il codice di provenienza va a Donorbox e Let's Donation | Sì: solo con un account | Raccolta: Gestione dell'account. Condivisione: Analisi (riconoscere i contributi arrivati dall'app) |
| Informazioni personali → Indirizzo | `city`, `province`, `country` | Sì | No | Sì: l'app si usa senza account | Gestione dell'account |
| Informazioni personali → Numero di telefono | `phone` | Sì | No | Sì: l'app si usa senza account | Gestione dell'account |
| Informazioni personali → Altre informazioni | `birth_date`, `privacy_consent`, `marketing_consent` | Sì | No | Sì: l'app si usa senza account | Prevenzione di frodi, sicurezza e conformità (età minima 14, registro dei consensi) |
| ID dispositivo o altri ID | identificativo casuale dell'installazione per gli aggiornamenti (Expo, `EAS-Client-ID`) | Sì | No (Expo è un fornitore) | No: lo manda ogni avvio | Funzionalità dell'app |

Non raccolti: posizione, informazioni finanziarie, salute e fitness, messaggi, foto e video, audio, file e
documenti, calendario, contatti, attività nelle app, navigazione web, informazioni e prestazioni dell'app (nessun
servizio di segnalazione errori), altri ID dispositivo. La password non è un tipo di dato di Play Console: rientra nel
metodo «Nome utente e password».

### Condivisione verso Donorbox e Let's Donation (motivazione)

- **Donorbox — nome, cognome, email: non dichiarati come condivisi.** Prima del primo invio l'app mostra un avviso
  («Stai per uscire dall'app»: nome, cognome ed email nell'indirizzo; scelta «Continua senza i miei dati»,
  `src/locales/it.ts:372-375`) e lo fa solo se l'utente ha un account, un profilo e il consenso all'informativa
  in vigore (`src/shared/partner/usePartnerExit.ts:151-173`). È il caso dell'eccezione di answer/10787469:
  trasferimento su azione avviata dall'utente (tocco su «Dona») dopo avviso in evidenza e consenso.
- **Codice di provenienza → Donorbox (`utm_content`) e Let's Donation (`rise_ref`): dichiarato come condiviso**
  (`src/shared/partner/partnerUrls.ts:68-87`). Gli avvisi non lo nominano, quindi l'utente non può aspettarsi il
  trasferimento: l'eccezione non si applica. Se in futuro gli avvisi lo spiegheranno, si potrà rivalutare.
- **Let's Donation — nessun dato anagrafico**: riceve solo il codice di provenienza.

## Funzionalità finanziarie

«La mia app non offre funzionalità finanziarie.» Le donazioni si fanno sulla pagina web di Donorbox, aperta nel
browser del telefono; l'app non gestisce pagamenti né conti.

## App sanitarie

«No, la mia app non ha funzionalità sanitarie.»

## App governative

«No, la mia app non è un'app governativa e non è sviluppata per conto di un ente governativo.»

## Paesi

Gli stessi 42 paesi europei dell'app iOS (misurati il 09/10): i 27 dell'Unione europea, Regno Unito, Svizzera,
Norvegia, Islanda, Albania, Bosnia ed Erzegovina, Montenegro, Macedonia del Nord, Serbia, Kosovo, Moldavia, Ucraina,
Bielorussia, Russia, Turchia. Kosovo, Russia e Bielorussia potrebbero non comparire nell'elenco di Play Console:
la scelta su quelli è di Riccardo («Chi fa cosa» → Riccardo, decisioni aperte).

## Norme sui pagamenti

Fonte: support.google.com/googleplay/android-developer/answer/9858738, sezione 3 (casi in cui il sistema di
fatturazione di Google Play **non** si deve usare).

| Cosa fa l'app | Regola | Esito |
| --- | --- | --- |
| Pulsante «Dona» → pagina Donorbox nel browser | 3.2: «tax exempt donations» | Ammesso, a condizione che le donazioni all'associazione siano esenti: lo conferma Alberto («Chi fa cosa» → Alberto) |
| Shop solidale di Let's Donation (prodotti fisici) | 3.1: «purchase or rental of physical goods» | Ammesso |
| Eventi di confezionamento su Let's Donation | 3.1: «purchase of physical services» | Ammesso |
| Gift card di Let's Donation | Non trattate esplicitamente | Decisione aperta di Riccardo: tenere il pulsante o toglierlo prima del lancio («Chi fa cosa» → Riccardo, decisioni aperte) |
