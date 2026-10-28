# Google Play — rilascio di App Rise (scheda nuova)

App nuova `org.riseagainsthunger.italia` («Rise Against Hunger Italia»), versione 1.3.0, account sviluppatore
dell'associazione (tipo **Organizzazione**, letto in Play Console il 01/10). Sostituisce la vecchia app 1.0 pubblicata
da OpenClick (Creareunapp), che si ritira solo dopo.

Ordine deciso da Riccardo il 12/10: **prima pubblichiamo la nuova, poi avvisiamo le persone di scaricarla, solo dopo
OpenClick toglie la vecchia.** Chi fa cosa: § «Chi fa cosa» in fondo. Testi della scheda: `scheda.md`. Risposte ai
moduli: `play-console-risposte.md`. Controllo automatico di questa pagina:
`node scripts/verifica-android-play.mjs C19 C20`.

I menu di Play Console cambiano nome ogni tanto: i percorsi qui sotto sono quelli delle guide Google lette a ottobre
2026.

## 1. Creare l'app in Play Console

- Chi: Simone (proprietario) o chi ha il permesso di amministratore.
- Play Console → **Tutte le app** → **Crea app**. Campi: `play-console-risposte.md` § «Creazione app».
- Prima di creare: account non più limitato (D-U-N-S, sito, telefoni: «Chi fa cosa» → Simone).

## 2. Primo invio su test interno

La build si fa con il profilo `production-store` (AAB firmato con la chiave di caricamento custodita da EAS).

```bash
cd "C:/Users/albie/Desktop/Programmi/RAH/App Rise"
npx eas build --platform android --profile production-store --non-interactive --no-wait
npx eas build:list --platform android --limit 1
```

Invio, due strade:

- **Con EAS** (serve la chiave del service account, «Chi fa cosa» → Simone):
  `npx eas submit --platform android --profile production-store --id <ID-DELLA-BUILD>`.
  `eas.json` manda la build sulla traccia `internal` con `releaseStatus: draft`: la release resta in **bozza** e si
  completa a mano in Play Console. Expo: «If this is your app's first submission, the default `eas submit` command
  works out of the box» (docs.expo.dev/submit/android).
- **A mano**: scaricare il file `.aab` da expo.dev (pagina della build) → Play Console → **Test** → **Test interno** →
  **Crea nuova release** → caricare il file.

Al primo caricamento Play Console propone la **firma dell'app da parte di Google**: accettare. La chiave di EAS diventa
la chiave di caricamento. Poi: aggiungere i tester interni (lista email) → **Rivedi release** → **Avvia
l'implementazione**.

## 3. Scheda e moduli

- Testi IT/EN: `scheda.md` (Crescita → Scheda dello Store principale; lingua predefinita italiano, poi inglese).
- Grafica: icona 512×512 e grafica in evidenza 1024×500 in `docs/store/google-play/grafica/`, screenshot
  1080×1920 in `docs/store/google-play/screenshot/` (it, en).
- Moduli di **Norme e programmi → Contenuti app**: incollare le risposte di `play-console-risposte.md`, sezione per
  sezione. La sezione «Accesso all'app» chiede le credenziali dell'account demo («Chi fa cosa» → Riccardo).

## 4. Rapporto pre-lancio

Google lo genera da solo quando si carica un app bundle (answer/9842757): prova l'app su telefoni veri e segnala
crash, problemi di accessibilità e di sicurezza. Per fargli vedere l'area personale servono le **credenziali**
dell'account demo: Testa e rilascia → Test → Report pre-lancio → Impostazioni → «Credenziali dell'account di test» →
**Fornisci credenziali**. Le credenziali si scrivono solo in
Play Console, mai nel repository. Prima di andare in produzione: zero crash nel rapporto, avvisi letti uno per uno.

## 5. Prima produzione al 100 %

- Produzione → **Crea nuova release** → **Aggiungi dalla libreria** la stessa build già provata sul test interno.
- Paesi: `play-console-risposte.md` § «Paesi».
- La prima pubblicazione va al **100 %**: il rilascio graduale «può essere utilizzato soltanto per gli aggiornamenti
  delle app e non per la loro prima pubblicazione» (support.google.com/googleplay/android-developer/answer/6346149).
- **Invia per la revisione**. La revisione di un'app nuova può richiedere diversi giorni.

## 6. Rilascio graduale degli aggiornamenti

Dalla versione successiva alla prima: Produzione → nuova release → percentuale iniziale (proposta: 20 %), poi 50 % e
100 % se Android vitals resta sotto le soglie (§ 11).

- Aumentare: scheda **Release** → **Gestisci implementazione** → **Aggiorna implementazione** → nuova percentuale →
  **Conferma aggiornamento**.
- Fermarlo: **Gestisci implementazione** → **Interrompi implementazione**. Fonte answer/6346149: «nessun altro utente
  riceverà la versione», chi l'ha già ricevuta la tiene. Per tornare indietro si pubblica una versione nuova con
  `versionCode` più alto (Play non installa versioni precedenti).

## 7. Account personale: ramo del test chiuso

Il nostro account è di tipo Organizzazione, quindi questo passo **non** serve. Vale solo se Play Console mostra in
Dashboard «Richiedi per la produzione» (segno che l'account è trattato come personale): Google chiede per gli «account
personali creati dopo il 13 novembre 2023» un test chiuso con «un minimo di 12 tester, attivi ininterrottamente per
almeno 14 giorni» (answer/14151465). Poi Dashboard → **Richiedi per la produzione**. In quel caso: Simone verifica il
tipo di account («Chi fa cosa» → Simone) prima di reclutare i 12 tester.

## 8. Gate prima dell'invio a Play

Prima di **Invia per la revisione** le pagine pubbliche devono mostrare il testo del repository. Il marcatore è la riga
«Ultimo aggiornamento» / «Last updated» di ogni file. Comando (Git Bash, dalla radice del repo; gli URL delle due pagine
di cancellazione li dà la sede USA):

```bash
cd "C:/Users/albie/Desktop/Programmi/RAH/App Rise"
controlla() {
  marcatore=$(grep -o 'class="last-updated">[^<]*' "$1" | sed 's/.*>//')
  if curl -fsSL "$2" | grep -qF "$marcatore"; then echo "OK      $2"; else echo "DIVERSA $2 (atteso: $marcatore)"; fi
}
controlla privacy-policy.html https://italy.riseagainsthunger.org/privacy-policy/
controlla docs/store/google-play/web/elimina-account.html "<URL-ELIMINA-ACCOUNT>"
controlla docs/store/google-play/web/delete-account.html "<URL-DELETE-ACCOUNT>"
for u in https://italy.riseagainsthunger.org/privacy-policy/ "<URL-ELIMINA-ACCOUNT>" "<URL-DELETE-ACCOUNT>"; do
  if curl -fsSL "$u" | grep -q 'da-validare'; then echo "BOZZA   $u"; fi
done
```

Tre righe `OK` e nessuna `BOZZA` ⇒ si invia. Una riga `DIVERSA` ⇒ la pagina pubblicata è vecchia: non inviare,
scrivere alla sede USA. Una riga `BOZZA` ⇒ nella pagina pubblicata resta il marcatore `da-validare` (i punti per la
consulente e la PEC, oggi in `privacy-policy.html` e `privacy-policy-en.html`): non inviare finché la consulente non
ha validato e la PEC non è scritta (leva PEC: Alberto, punto 3).
L'URL della pagina di cancellazione va anche in Sicurezza dei dati (`play-console-risposte.md`).

Prima dell'invio si controllano a mano anche due cose: la PEC a OpenClick è partita e la sua ricevuta di consegna è
salvata (serve per un eventuale ricorso, § 13); nella Panoramica di Play Console non c'è più l'avviso «Nome del
pacchetto non registrato» (verifica dello sviluppatore Android, APK di prova caricato il 22/10).

Funzioni Edge: prima dell'invio si pubblicano le due funzioni col codice del commit della build consegnata a Play
(Riccardo; la prima volta serve `npx supabase login`, che apre il browser). Comando (Git Bash, dalla radice del repo):

```bash
cd "C:/Users/albie/Desktop/Programmi/RAH/App Rise"
git log -1 --oneline   # deve essere il commit della build consegnata a Play
npx supabase functions deploy delete-account --project-ref yrsilvbuqhohgznpdles --no-verify-jwt --use-api
npx supabase functions deploy purge-deletions --project-ref yrsilvbuqhohgznpdles --no-verify-jwt --use-api
curl -s -X POST "https://yrsilvbuqhohgznpdles.supabase.co/functions/v1/delete-account" \
  -H "Authorization: Bearer x" -w " %{http_code}\n"
```

L'ultima riga deve stampare `{"error":"unauthorized"} 401`: è la risposta del nostro codice. Un testo diverso (per
esempio `Invalid JWT`) viene dal gateway e vuol dire che la verifica JWT è tornata accesa; un 500 con
`server_misconfigured` vuol dire che manca la chiave `SUPABASE_SECRET_KEYS`. In entrambi i casi non inviare.

Altri tre controlli prima dell'invio:

- **Cron**: in Supabase → Integrations → Cron, se c'è un job che chiama `purge-deletions`, nel suo comando non deve
  comparire una chiave vecchia (una lunga stringa che comincia con `eyJ`): le chiavi legacy sono disattivate dal
  06/07/2026 e il job fallirebbe. Oggi la funzione non è schedulata (`supabase/config.toml`).
- **Chiave dell'app**: `EXPO_PUBLIC_SUPABASE_ANON_KEY` della build e degli OTA deve cominciare con `sb_publishable_`.
  Una build o un OTA con la JWT `anon` (comincia con `eyJ`) non accede più a Supabase dal 06/07/2026: l'app si apre ma
  nessuno riesce ad accedere. Prima dell'avviso agli utenti (§ 14) lo stesso controllo sulla 1.2.9 iOS degli store:
  un accesso di prova dall'iPhone; se non entra, dirlo a Claude prima di mandare l'avviso.
- **Base giuridica del `rise_ref` approvata dall'avvocato** (Consulente, punto 1): senza il suo sì non si invia,
  perché dal primo giorno l'app manda il codice ai partner (a chi ha accettato l'informativa).

Dipendenze (C59, 25/10): `npm audit --omit=dev` non ha più avvisi sui pacchetti che entrano nell'app (`lodash`
4.18.1; `query-string` e `decode-uri-component` spariti con `@react-navigation/core` 7.24, che non li usa più; `uuid`
sparito con `xcode` 4, portato da `@expo/config-plugins` 54.0.6 e usato solo dal prebuild iOS). Correzioni solo
dentro i range già dichiarati, `package.json` invariato. Restano 8 avvisi, che nascono tutti da tre pacchetti usati
solo per costruire l'app: nelle source map di `expo export --platform android` `postcss`, `node-forge` e `image-size`
hanno 0 file (`lodash` 201, `expo-updates/build` 8: la sonda li vede). `expo`, `@expo/cli`, `@expo/metro-config`,
`expo-updates` e `@expo/code-signing-certificates` sono segnalati solo perché dipendono da quei tre.
`postcss` è fissato a `~8.4.32` da `@expo/metro-config` e anche l'ultima 8.4 ha l'avviso: si chiude solo con `expo`
58, salto di SDK fuori da questo rilascio. `node-forge` non ha nessuna versione corretta pubblicata (l'ultima, 1.4.0,
è dentro l'avviso) e lo usano solo gli script di firma in `expo-updates/cli`; npm propone di tornare a `expo-updates`
0.11 (oggi 29.x), non applicabile. `image-size` arriva da Metro, che chiede la 1.x, e la correzione esiste solo nella
2.x. Si riguardano al prossimo aggiornamento di SDK.

## 9. Aggiornamenti OTA

Gli aggiornamenti del solo JavaScript arrivano senza passare dallo store, ma solo alle installazioni con la stessa
versione nativa (`runtimeVersion: appVersion` ⇒ runtime `1.3.0`). Per Android si pubblica **solo** Android:

```bash
cd "C:/Users/albie/Desktop/Programmi/RAH/App Rise"
npx eas update --branch production --platform android --message "<cosa cambia>"
```

Rollback (l'aggiornamento appena pubblicato è sbagliato): rimette in onda quello precedente o, se non c'è, quello
contenuto nella build.

```bash
npx eas update:rollback <ID-DEL-GRUPPO> --platform android --message "rollback: <motivo>"
```

Una modifica nativa (permessi, librerie native, `app.config.js` lato Android) non passa mai via OTA: serve una build
nuova e un invio a Play.

## 10. Divieti

- **Niente `npm run update:production`** finché la 1.3.0 non è negli store su entrambe le piattaforme: lo script
  pubblica per tutte le piattaforme insieme.
- **Niente submit né OTA iOS** (`submit:ios`, `submit:all`, `--platform ios`, `--platform all`) finché iOS non è
  verificato a parte: la 1.2.9 iOS negli store ha moduli nativi diversi.
- Niente invio a Play con il gate del § 8 non tutto `OK`.

## 11. Android vitals nelle prime 2 settimane

Ogni giorno per le prime 2 settimane: Play Console → **Monitora e migliora** → **Android vitals** → Panoramica.
Soglie di Google (answer/9844486): arresti anomali percepiti ≥ 1,09 % degli utenti giornalieri, ANR percepiti ≥ 0,47 %
(≥ 8 % su un singolo modello di telefono). Sopra soglia l'app «è probabile che sia meno rilevabile su Google Play».
Un crash nuovo ⇒ fermare il rilascio graduale (§ 6) se ce n'è uno in corso, aprire il dettaglio dello stack, correggere.
I crash arrivano qui anche senza Sentry (spento al lancio).

## 12. Recensioni

Play Console → **Valutazioni e recensioni** → **Recensioni**. Rispondere entro due giorni lavorativi, in pubblico, nella
lingua della recensione, senza dati personali; un problema tecnico ⇒ invito a scrivere a `info@riseagainsthunger.it`.
Chi ha ancora la vecchia app e recensisce questa: rispondere con il testo del § 14.

## 13. Note per la revisione

Play Console non ha un campo libero per le note al revisore: le istruzioni si leggono in **Contenuti app → Accesso
all'app → Altre istruzioni** (answer/9859455). Testo da aggiungere lì, dopo le istruzioni di accesso:

> Questa app è la nuova app ufficiale di Rise Against Hunger Italia ETS, pubblicata dall'associazione con il proprio
> account. Sostituisce la versione precedente, realizzata e pubblicata per nostro conto dal fornitore OpenClick
> (Creareunapp) con identificativo `it.creareunapp.editor.android63da226b447a7`: il fornitore la ritirerà su nostra
> richiesta scritta dopo il lancio di questa.

In più, prima dell'invio in revisione, il modulo **«Provide advance notice to the Google Play App Review team»**
(support.google.com/googleplay/android-developer/contact/adv_note): Google accetta preavvisi solo nei casi che elenca,
fra cui lo stato di ente benefico e il permesso d'uso di proprietà intellettuale di terzi, e avverte che fuori da quei
casi può non rispondere. Qui vale come ente benefico: stesso testo della nota sopra, con la prova dello stato non profit
allegata: la scheda dell'associazione nel RUNTS (Registro unico nazionale del Terzo settore, repertorio 172977, iscritta
il 28/05/2026).

Se Google contesta un'imitazione del marchio o un doppione: ricorso dalla notifica di Play Console allegando la PEC
inviata a OpenClick («Chi fa cosa» → Alberto).

## 14. Avviso agli utenti della 1.0

Si manda dopo che la nuova è in produzione e prima del ritiro della vecchia, e si ripete una settimana prima della data
di ritiro. Testo per social, newsletter e sito:

> **La nostra app è cambiata.** Se usi l'app su un telefono Android, su Google Play trovi la nuova app «Rise Against
> Hunger Italia»: <LINK-SCHEDA-PLAY>. Per qualche settimana su Google Play ne troverai due con lo stesso nome: quella
> giusta è al link. Dal <DATA-RITIRO> la vecchia app verrà tolta da Google Play e non riceverà più aggiornamenti: una
> volta installata la nuova, puoi disinstallarla.

Su iPhone non cambia niente: l'app è la stessa, quindi il testo parla solo di Android. La vecchia app non aveva un
account per gli utenti: non c'è niente da trasferire, e l'avviso non deve dire il contrario.

Il link della scheda è `https://play.google.com/store/apps/details?id=org.riseagainsthunger.italia`. La
<DATA-RITIRO> cade almeno 7 giorni dopo la seconda PEC a OpenClick (quella che comunica la data, punto 2 della prima
PEC). Conviene fissarla almeno due settimane dopo il primo avviso, così fra il primo e la ripetizione passa una
settimana.

## Chi fa cosa

In ordine: prima ciò che sblocca il resto. Nessuna password o chiave va mai in questo file, in mail o in chat.

### Simone (proprietario dell'account Play)

1. **D-U-N-S** — fatto il 22/10: D&B ha chiuso la correzione (caso 34943597, «Rise Against Hunger Italia ETS», via
   dei Fornaciai 17, Bologna) e Simone ha confermato «Rivedi aggiornamento»; la verifica dell'organizzazione è chiusa.
   Se Play Console chiedesse di nuovo i dati dell'organizzazione: fotografare «Account sviluppatore → Informazioni
   personali → Dati dell'organizzazione» e «Visualizza profilo pagamenti» e mandare le foto a Riccardo. Non modificare
   nome, indirizzo o D-U-N-S direttamente in Play Console.
2. **Verifica del sito**: in «Dettagli account» il sito `https://italy.riseagainsthunger.org/` deve risultare
   verificato (la sede USA ha messo i tag; le mail di Google dell'08/10 e del 12/10 non lo segnalavano più). Se no:
   **Invia richiesta di verifica** dalla stessa pagina.
3. **Telefoni** — fatto: il numero di telefono di contatto è verificato con il codice via SMS (confermato il 22/10).
4. **Tipo di account** — fatto: «Organizzazione» (letto il 01/10). Se un giorno comparisse «Personale» ⇒ ramo del § 7.
5. **Service account** (un utente automatico che carica versioni dell'app senza password; serve solo per l'invio con
   `eas submit`, senza si carica a mano, § 2). In «Utenti e autorizzazioni» ce n'è già uno. **Prima di ogni altra
   cosa** si stabilisce di chi è il progetto Google Cloud che lo contiene («Chi fa cosa» → Riccardo, punto 8): chi ha
   accesso a quel progetto può crearsi una chiave e caricare versioni a nome dell'associazione.
   - Progetto dell'associazione (o di Riccardo, che lo gestisce per lei): lasciare al service account solo i permessi di
     rilascio su questa app (niente amministratore, niente «tutte le app»).
   - Proprietario non riconosciuto: **rimuovere** il service account da «Utenti e autorizzazioni» e caricare a mano.
   La chiave si carica solo su expo.dev → Credentials → Android → `org.riseagainsthunger.italia` → Service
   credentials. Mai mandarla per mail, in chat o nel repository.
6. **Posta di Creareunapp**: controllare, anche nello spam, se Creareunapp o OpenClick hanno risposto alla mail del
   24/09 e girare a Riccardo tutto ciò che arriva da loro.

### Alberto (presidente, legale rappresentante)

1. **PEC a OpenClick** dalla PEC dell'associazione, con Riccardo in copia: testo in fondo alla mail di Riccardo al team
   del 22/10 («Nuova app Android e chiusura con Creareunapp»). Si manda quando Riccardo dà il via, cioè dopo la risposta
   di Simone (punto 6) e dopo il controllo dell'indirizzo PEC di OpenClick sul registro INI-PEC.
2. **Seconda PEC** a OpenClick con la data di ritiro, almeno 7 giorni prima (punto 2 della prima PEC): si manda dopo il
   primo avviso agli utenti (§ 14); data e testo li prepara Riccardo.
3. **Dati dell'informativa**: la sede legale è quella del RUNTS (via dei Fornaciai 17, Bologna); quale PEC scrivere in
   `privacy-policy.html` (quella registrata al RUNTS o un'altra dell'ente) lo conferma l'associazione. Proposta: la PEC
   del RUNTS, `posta@pec.shnitalia.it`; con la conferma si sostituisce il segnaposto «PEC da inserire» nelle due
   informative. Testo per Alberto: «Ciao Alberto, nell'informativa dell'app va scritta la PEC dell'associazione. Al
   RUNTS risulta `posta@pec.shnitalia.it`: scriviamo questa o un'altra PEC dell'ente?». Innesco: prima di mandare
   l'informativa all'avvocato (Riccardo, punto 7), perché il testo che valida deve essere quello finale.

Lo status non profit non va più chiesto: l'associazione è iscritta al RUNTS (repertorio 172977, dal 28/05/2026) e la
scheda del registro è la prova da allegare al preavviso del § 13.

### Riccardo

1. **Mandare la mail al team** (bozza in Gmail aggiornata il 22/10, «Nuova app Android e chiusura con Creareunapp»;
   destinatari Alberto, Simone, Angelica).
2. **Build senza upload** (facoltativo, sblocca le build quando la rete è lenta): expo.dev → impostazioni utente →
   collegare l'account GitHub che vede il repository. Poi Claude lancia la build da GitHub.
3. **SMTP**: Supabase → Authentication → Emails → SMTP Settings con Resend; DKIM, SPF e DMARC sul dominio. Senza,
   le email di conferma e recupero non arrivano agli utenti esterni.
4. **Site URL e redirect**: Supabase → Authentication → URL Configuration: Site URL del sito (non `localhost`);
   In **Additional Redirect URLs** inserire tutti i redirect usati dal codice:
   `rahitalia://reset-password`, `rahitalia://confirm-email`, `rahitalia://confirm-email-change`.
   Controllare **sempre i modelli mail**, anche se erano già configurati: Supabase → Authentication → Emails →
   Templates, in ogni modello con un link di accesso (Confirm signup, Reset password, Change email, Magic Link,
   Invite user), il link deve usare `{{ .ConfirmationURL }}`. Non costruire link con token o con il solo
   `{{ .RedirectTo }}`: la verifica deve passare dal server prima del redirect PKCE all'app.
   Se manca, sostituire il collegamento con questo testo HTML:

   ```html
   <p>Conferma la richiesta e torna all'app Rise Against Hunger Italia:</p>
   <p><a href="{{ .ConfirmationURL }}">Conferma e apri l'app</a></p>
   ```

   Provare conferma iscrizione, recupero password e cambio email su telefono: richiedere il link dall'app,
   chiuderla, riaprirla dal link sullo **stesso dispositivo**. Il verificatore PKCE resta nello storage cifrato;
   dopo un secondo invio usare l'ultima email. Confermare entrambe le caselle nel cambio email sicuro.
   Verificare anche link scaduto e scambio fallito: l'app deve spiegare come proseguire.
5. **Account demo** per i revisori: registrarsi dall'app con una casella vera dell'associazione (mai un'email
   inventata: i rimbalzi bloccano l'invio), confermare l'email, compilare il profilo con dati di prova. Credenziali solo
   in Play Console (Accesso all'app e Rapporto pre-lancio).
6. **Numeri d'impatto**: i numeri ufficiali (Annual Report) per la schermata Impatto, da dare a Claude.
7. **Decisioni aperte** (già prese il 24/10: la gift card di Let's Donation **resta**, e Google la ammette senza la
   fatturazione di Play, answer/10281818; 0021 e 0022 **sì**, con un backup prima, punto 10):
   - Kosovo, Russia, Bielorussia: tenerli fra i paesi se Play Console li offre, o toglierli.
   - Codice di provenienza: per quanto tempo conservarlo (oggi senza scadenza: serve una migration).
   - Sentry: quando riaccenderlo (dopo il lancio, con progetto UE e informativa aggiornata).
   - Informativa: chi la manda all'avvocato e chi chiede alla sede USA di pubblicarla. È il passo che decide i tempi:
     senza le pagine pubblicate il gate del § 8 non passa.
8. **Service account dei caricamenti**: su questo PC c'è il file di una sua chiave (creato l'08/11/2025), quindi il
   progetto Google Cloud che lo contiene è raggiungibile dal tuo account Google. In Google Cloud Console, con il tuo
   account: aprire quel progetto → IAM e amministrazione → **IAM** (chi sono i proprietari) → **Service account** →
   **Chiavi** (quante chiavi attive ci sono). Tenere solo le persone dell'associazione e solo la chiave che si usa;
   le altre si **eliminano** da lì. Il file sul PC: caricarlo su expo.dev (vedi Simone, punto 5) e poi cancellarlo,
   oppure eliminare la chiave in Google Cloud se l'invio automatico non serve.
9. **Dopo il ritiro della vecchia app**: controllare che la sua pagina su Google Play non offra più «Installa» (o dia
   404) e che OpenClick abbia confermato per iscritto la cancellazione dei dati (punto 4 della PEC).
10. **Migration 0022 (consensi e oblio) sul database di produzione**: il sì per la 0021 e la 0022 l'hai dato il 24/10,
    «con backup prima». Ordine: prima le 0017-0021 (in produzione si arriva alla 0020, letto il 28/10), poi la 0022.
    Innesco: quando Claude conferma che i test della 0022 sono verdi sul database di prova e c'è il backup del giorno
    (con il piano Pro, punto 13, è automatico; sul piano free va fatto a mano e contiene dati personali: mai su GitHub).
    Come primo passo, PRIMA di toccare il database, questa query di sola lettura nel SQL Editor di Supabase, e il
    numero si riporta a Claude:

    ```sql
    select count(*) as profili_discordanti
    from public.profiles p
    where p.marketing_consent is distinct from coalesce((
      select e.action = 'granted'
      from public.consent_events e
      where e.user_id = p.id and e.purpose = 'marketing'
      order by e.created_at desc,
               coalesce((to_jsonb(e)->>'server_order')::bigint, 0) desc,
               e.id desc
      limit 1
    ), false);
    ```

    Se il numero non è 0: dopo la 0022 quei profili si riallineano all'ultimo evento al primo salvataggio, quindi si
    decide PRIMA come trattarli (nessuna correzione automatica). Poi si applica per intero
    `supabase/migrations/0022_consensi_server_e_oblio.sql` nel SQL Editor. Fra app e database non serve un ordine di
    rilascio: l'app oggi scrive sul profilo lo stesso valore dell'evento.

    Dopo la 0022 il profilo dice «sì» al marketing solo se lo dice l'ultimo evento del registro `consent_events`, e
    senza eventi dice `false`. Due conseguenze, scelte apposta:
    - Chi importa o ricrea profili in Supabase (oggi nessuno: l'ETL deciso va da Supabase verso Access e i profili
      li legge soltanto) scrive anche gli eventi `marketing` nel registro, altrimenti con la 0022
      `marketing_consent` diventa `false` per tutti i profili importati.
    - Scelta prudente: un `recordConsent` fallito dopo l'upsert lascia `false`, e il sì si ridà dal Profilo. Oggi
      nessuna schermata scrive il sì in quest'ordine: Completa profilo registra solo `privacy_notice`
      (`useProfileForm.ts`) e non tocca il marketing, la registrazione scrive profilo ed eventi nello stesso trigger
      (`0019`), l'interruttore del Profilo scrive prima l'evento (`AuthContext.tsx`, `setMarketingConsent`).
11. **Richieste di cancellazione da inoltrare ai partner**, ogni settimana dopo il lancio. Quando un account si
    elimina, la tabella `partner_ref_tombstones` tiene quale codice aveva la persona presso quale partner; nessun
    programma la legge. Nel SQL Editor di Supabase (sola lettura):
    `select partner, ref, deleted_at from public.partner_ref_tombstones where requested_at is null order by deleted_at;`
    Per ogni riga si scrive al partner (Let's Donation o Donorbox) chiedendo di cancellare i dati legati a quel codice,
    **entro un mese** dalla cancellazione (lo promettono le pagine di cancellazione, § 5); stesso tempo per le
    richieste che arrivano per email a `info@riseagainsthunger.it`. Segnare la data della richiesta (`requested_at`)
    e quella della conferma (`confirmed_at`) è una scrittura sul database: solo col tuo sì, quando si decide chi la fa.
12. **Nome dell'associazione su Let's Donation**: il nostro profilo su Let's Donation è ancora intestato «Onlus», mentre
    app e informative dicono «ETS» come il RUNTS. Si corregge nel back office di Let's Donation (chi ha l'accesso) o lo
    si chiede a loro. Testo pronto: «Buongiorno, dal 28/05/2026 l'associazione è iscritta al RUNTS come Rise Against
    Hunger Italia ETS (repertorio 172977). Potete aggiornare la denominazione del nostro profilo, oggi ancora "Onlus"?
    Grazie». Innesco: prima dell'invio a Play (§ 8), perché chi passa dall'app a Let's Donation vedrebbe due nomi.
13. **Piano Supabase Pro**: l'organizzazione «Rise Against Hunger» è sul piano free (letto il 28/10): gli account veri
    non hanno backup automatici, la protezione dalle password trapelate è spenta e il progetto va in pausa dopo una
    settimana senza uso. Pro costa da 25 $/mese e tiene un backup al giorno per 7 giorni. Il 24/10 hai chiesto di
    capire prima se è meglio Supabase o un altro fornitore: il confronto te lo prepara Claude (quelli del 23/06 e del
    23/10 dicevano di restare, perché cambiare vuol dire rifare accesso, consensi, regole di sicurezza e funzioni).
    Prima di attivarlo: in Organization → Projects deve restare solo App Rise (oggi c'è anche «Linkedin», inattivo:
    spostarlo in un'altra organizzazione) e la fattura va intestata all'associazione. Innesco: prima della 0021 e
    della 0022 (punto 10), e comunque prima dell'invio a Play (§ 8).
14. **Rettifica del brief a Let's Donation** (decisione tua, aperta dall'08/09): il brief mandato il 31/07 dice due
    cose che la call dell'08/09 ha smentito. Testo pronto, da mandare solo se decidi di sì: «Buongiorno, dopo la call
    dell'8 settembre due frasi del brief del 31 luglio non sono più corrette. 1) Chi non ha un account Let's Donation
    non lo crea "in quel momento": l'account nasce solo se quell'email non esiste già in tutto l'ecosistema Let's
    Donation, e oggi questo controllo non c'è da nessuna delle due parti. 2) Non si evita "un secondo modulo": i
    nostri utenti arrivano come account Smart e per gift card ed eventi devono completare il profilo da voi. Grazie,
    Riccardo». Innesco: prima di riprendere con Let's Donation il login unico o il preventivo del 23/09.
15. **Iscritti e attribuzione con Let's Donation** (tu con Let's Donation). Il modello di migrazione dei 1.352 iscritti
    di Rise su Let's Donation non torna: nella call dell'08/09 al passaggio gli account si cancellano e si ricreano,
    nel preventivo del 23/09 si collegano; serve solo se si fa il login unico (decisione del team aperta). Il
    collaudo dell'attribuzione serve invece da subito: dal telefono con l'app nuova si apre una pagina di Let's
    Donation dall'app (per esempio la gift card) e si controlla con loro che nel back office compaia il codice
    `rise_ref` dell'account; per Donorbox, dove il codice viaggia in `utm_content`, serve una piccola donazione vera.
    Testo pronto: «Buongiorno, la nuova app di Rise Against Hunger Italia apre le vostre pagine con un parametro
    rise_ref nell'indirizzo. Riuscite a vedere quel codice nel back office insieme all'acquisto o alla donazione?
    Possiamo fare una prova insieme?». Innesco: quando c'è la build di prova sul telefono, prima della produzione.

### Sede USA (Rick, Kevin)

Cosa devono fare: pubblicare l'informativa aggiornata su `/privacy-policy/` e le due pagine di cancellazione, poi
darci gli indirizzi (vanno nel gate del § 8 e in Sicurezza dei dati). Si chiede dopo il sì dell'avvocato
sull'informativa.

Se le pagine `web/elimina-account.html` e `web/delete-account.html` sono già state consegnate alla sede USA,
Riccardo deve mandare le versioni aggiornate e chiedere di sostituire quelle precedenti, anche se già pubblicate:
le istruzioni devono portare all'icona della persona in alto a destra («Area Donatori» / «Il mio profilo»; in inglese
«Donor Area» / «My profile»).

Testo da mandare (inglese), con i tre file in allegato:

> Hi Rick and Kevin,
> we are about to publish the new Rise Against Hunger Italia app on Google Play. Google requires two public pages on
> our site, and we need your help on site 10 (italy.riseagainsthunger.org):
>
> 1. Replace the content of `/privacy-policy/` with the attached `privacy-policy.html` (Italian).
> 2. Publish two new pages with the attached `elimina-account.html` (Italian) and `delete-account.html` (English),
>    for example at `/elimina-account/` and `/delete-account/`.
>    If you already received or published these pages, replace the previous versions with the updated attachments:
>    the instructions now direct users to the person icon at the top right of the app (Donor Area / My profile).
>
> Please reply with the final URLs: we have to enter them in Play Console. Nothing else on the network changes.
> Thank you!

### OpenClick (via PEC)

Con la PEC di Alberto si chiede: tenere pubblicata la vecchia app finché non la avvisiamo; ritirarla e disattivarla
alla data che comunichiamo via PEC almeno 7 giorni prima, con conferma scritta; non ripubblicarla e non usare più nome,
logo e contenuti. Il ritiro si chiede solo dopo il lancio della nuova e l'avviso agli utenti (§ 14).

### Consulente (avvocato dell'associazione)

Validare l'informativa (`privacy-policy.html` e `privacy-policy-en.html`): i punti marcati «da validare» nel testo
(base giuridica del precompilato verso Donorbox, conservazione del registro dei consensi, tempi di Expo, durata del
codice di provenienza). Solo dopo il suo sì la sede USA pubblica le pagine. Chi gliela manda: decisione aperta di
Riccardo (punto 7).

1. **Tre domande in più, anche per Let's Donation**, insieme ai punti di `docs/informativa-punti-aperti.md`. Testo
   pronto: «1) Con Let's Donation oggi non c'è nessun atto scritto: per i sostenitori che stanno nel nostro spazio sulla
   loro piattaforma siamo titolari autonomi o serve un accordo sul trattamento (DPA, art. 28 GDPR)? 2) L'app manda a
   Let's Donation e a Donorbox un codice di provenienza (`rise_ref`), solo a chi ha accettato l'informativa: su quale
   base giuridica, da scrivere nella tabella del § 3? 3) Revoca del codice e cancellazione dell'account: oggi chiediamo
   noi ai partner, entro un mese, di cancellare i dati legati al codice; Let's Donation ha detto che da loro esiste solo
   l'anonimizzazione. Basta così?». Innesco: insieme all'informativa (Riccardo, punto 7); la base giuridica del codice
   è anche nel gate del § 8.

### Comunicazione (Angelica)

Mandare l'avviso del § 14 su social, newsletter e sito quando la nuova app è in produzione. Ripeterlo una settimana
prima della data di ritiro della vecchia. Da guardare insieme a Simone quando la nuova è online: se dal pannello di
Creareunapp si può mettere un avviso con il link dentro la vecchia app, senza ripubblicarla (aggiungere, mai
cancellare: la vecchia deve restare su Google Play fino alla data di ritiro).
