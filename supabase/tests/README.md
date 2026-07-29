# Test delle migration

> ⚠️ Se un giorno il progetto adottasse la Supabase CLI, sappi che `supabase test db` esegue i file
> di questa cartella con pg_prove aspettandosi **pgTAP**. Questi sono SQL puro con assert in
> PL/pgSQL (scelta voluta: nessuna dipendenza, basta Docker) e con quel comando fallirebbero.
> In quel caso spostarli in `supabase/migration-tests/`, non riscriverli per forza.

Verifica delle migration SQL su un Postgres pulito, senza bisogno della Supabase CLI né di
toccare il progetto remoto. Serve solo Docker.

## Perché due shim

Le migration girano su Supabase, dove esistono lo schema `auth`, la funzione `auth.uid()` e i
ruoli `anon` / `authenticated`. Su un Postgres vanilla non ci sono: li ricrea uno *shim*.

Gli shim sono **due** e differiscono su un punto solo — se il progetto conceda automaticamente i
privilegi sulle tabelle nuove (`alter default privileges`):

| File | Scenario |
|---|---|
| `shim_permissive.sql` | i default privileges concedono tutto sulle tabelle nuove |
| `shim_restrictive.sql` | nessun default privilege: valgono solo i grant scritti nella migration |

**Una migration corretta deve dare lo stesso esito in entrambi.** Non è pedanteria: la prima
stesura della `0008` passava solo con lo shim permissivo, e quel verde nascondeva che il client
conservava `UPDATE`/`DELETE` sulla tabella (vedi PR #61). Uno shim scritto dalla stessa persona che
scrive il test tende a contenere le stesse assunzioni del test: girare in due ambienti opposti è
ciò che rompe il circolo.

## Eseguirle TUTTE (modo consigliato)

```bash
bash tests/run-all.sh
```

Esegue ogni coppia migration+test contro **entrambi** gli shim, con container pulito a ogni giro,
ed esce `1` alla fine se almeno una combinazione è rossa (le esegue tutte: serve il quadro intero,
non il primo sintomo). Usalo sempre quando la migration nuova tocca una superficie **condivisa**
(un trigger o un constraint su una tabella che anche altre suite scrivono): lì il rischio non è la
suite nuova, sono le altre. Il 2026-07-26 la `0012` ha aggiunto un trigger su ogni nascita di
profilo e le suite `0008`-`0011` non erano state rieseguite: andò bene, ma per fortuna verificata
dopo, non prima.

## Come si esegue una coppia sola

Dalla cartella `supabase/`, con Docker attivo. Sostituire `<SHIM>` con uno dei due file e
`<MIGRATION>`/`<TEST>` con la coppia migration+test da verificare.

```bash
docker run -d --name pgtest -e POSTGRES_PASSWORD=test postgres:15-alpine
until docker exec pgtest pg_isready -U postgres; do sleep 2; done

cat tests/<SHIM> \
    migrations/0*.sql \
    migrations/<MIGRATION> \
    tests/<TEST> \
  | docker exec -i pgtest psql -U postgres -v ON_ERROR_STOP=1

docker rm -f pgtest
```

> ⚠️ Il glob è `migrations/0*.sql`, **non** `migrations/000*.sql` come diceva questa pagina fino al
> 2026-07-26. Con `000*` le migration dalla `0010` in poi venivano saltate in silenzio: il test girava
> su uno schema più vecchio del reale e poteva essere verde per il motivo sbagliato.

Coppie disponibili:

| `<MIGRATION>` | `<TEST>` |
|---|---|
| `0008_partner_refs.sql` | `0008_partner_refs.test.sql` |
| `0009_profiles_contact_email.sql` | `0009_profiles_contact_email.test.sql` |
| `0010_profiles_minimo.sql` | `0010_profiles_minimo.test.sql` |
| `0011_signup_contact_email.sql` | `0011_signup_contact_email.test.sql` |
| `0012_legacy_contacts.sql` | `0012_legacy_contacts.test.sql` |
| `0013_contact_email_follows_account.sql` | `0013_contact_email_follows_account.test.sql` |
| `0014_claim_legacy_campi_vuoti.sql` | `0014_claim_legacy_campi_vuoti.test.sql` |
| `0015_aggancio_su_email_verificata.sql` | `0015_aggancio_su_email_verificata.test.sql` |
| `0016_claim_su_email_confermata.sql` | `0016_claim_su_email_confermata.test.sql` |

> 🔴 **Per le coppie da 0012 a 0015 la ricetta qui sopra NON basta.** Riapplicare la migration sotto
> test (la seconda occorrenza nella pipe, quella che prova la rieseguibilità) riporta indietro il
> corpo delle funzioni che le migration successive hanno sostituito: la suite girerebbe contro
> codice che in produzione non esiste più, e sarebbe verde per il motivo sbagliato. Vanno **accodate
> a mano le migration successive** che toccano quelle funzioni — 0012/0013 → `0014 0015 0016`,
> 0014 → `0015 0016`, 0015 → `0016`. È esattamente ciò che fa la variabile `extra` in
> `run-all.sh`: **la via consigliata resta `bash tests/run-all.sh`**, che le accoda da sé; la ricetta
> a mano serve solo per iterare in fretta su UNA suite mentre la si scrive.

Nota: la migration sotto test compare **due volte** nella pipe (una dentro `migrations/0*.sql`,
una esplicita in `<MIGRATION>`). È voluto — è il test `T7`, che verifica la rieseguibilità e che la
seconda passata non duplichi oggetti. Chi applica la migration lo fa incollandola a mano nel SQL
Editor, dove un secondo tentativo è uno scenario concreto.

## Come si legge l'esito

Ogni test stampa `NOTICE: Tn PASS: …`. Un fallimento solleva un'eccezione e, con
`ON_ERROR_STOP=1`, ferma tutto: **niente output finale `ALL TESTS PASS` significa test rosso**,
anche se le righe precedenti erano verdi. Conteggio atteso per migration (più la riga di esito,
sempre l'ultima):

- **0008**: **14** righe `PASS` — 13 test (`T1, T1b, T2, T3, T4, T5, T6a-T6f, T7`) + esito.
- **0009**: **9** righe `PASS` — 8 test (`T1, T2, T3, T4, T4b, T5, T6, T7`) + esito. 0009 non
  concede grant, quindi dà lo STESSO esito coi due shim: è la prova che è grant-indipendente.
- **0010**: **9** righe `PASS` — 6 blocchi di test + esito, ma `T3` stampa **dentro un ciclo** (una
  riga per colonna verificata), quindi le righe sono più dei blocchi.
- **0011**: **8** righe `PASS` — 7 test (`T1-T7`) + esito.
- **0012**: **22** righe `PASS` — 21 test (`T1-T21`) + esito. `T21` presidia il ramo ① dell'oblio
  (riga rivendicata + cancellazione del solo profilo, dove la cascata non passa): sta qui e non
  nella suite della 0013 perché la funzione vive in questa migration. Come 0009 e 0011 non concede
  grant → stesso esito coi due shim (misurato: 22/22, 0 FAIL su entrambi, 2026-07-26).
- **0013**: **15** righe `PASS` — 12 blocchi (`T1-T8` più `T6b`, `T7b`, `T7c`, `T7d`), di cui `T2`
  stampa **due** righe (colonna non toccata · nessuna rivendicazione) e `T7b` altre **due**
  (riaggancio · cancellazione) + esito. Non concede grant → stesso esito coi due shim (misurato:
  15/15, 0 FAIL su entrambi, 2026-07-26).
- **0014**: **15** righe `PASS` (misurato 15/15 su entrambi gli shim, 2026-07-29).
- **0015**: **8** righe `PASS` — `T1-T8`, di cui le prime tre sono l'ATTACCO via `contact_email`
  (misurato 8/8 su entrambi, 2026-07-29).
- **0016**: **16** righe `PASS` — 14 blocchi (`T1-T14`), di cui `T3` e `T9` stampano **due** righe
  ciascuno (prima/dopo la conferma · rivendicazione senza profilo, poi backfill alla nascita).
  `T14` **droppa `legacy_contacts`** per provare davvero la guardia `undefined_table`, quindi deve
  restare l'ultimo: dopo di lui il database è mutilato e nient'altro può seguire.

⚠️ **`auth.users.email_confirmed_at` negli shim ha un default `now()` che in Supabase NON esiste**
(là nasce NULL e si valorizza alla conferma, o subito se l'identità viene da un provider OAuth). È
deliberato — le suite 0008→0015 parlano di persone che stanno usando l'app, cioè che hanno
confermato — ma ha un prezzo: **chi scrive una suite che tocca la conferma deve scrivere il valore a
mano**, altrimenti testa il caso opposto e lo vede verde. La 0016 lo dichiara in ogni riga.

⚠️ **Un verde al primo giro non è una prova.** La 0016 è stata validata rompendo apposta le **cinque**
difese, una per volta, e verificando che ogni versione mutilata morisse sul test previsto (guardia
del ramo A → `T1`; clausola `WHEN` → `T5`; guardia dell'oblio → `T2`; seconda lettura → `T9b`;
guardia del §4 sul cambio email → `T11`). Una suite che resta verde contro il codice rotto non sta
presidiando niente.

⚠️ **E un test può essere vacuo senza sembrarlo.** `T12` nella prima stesura inseriva la riga
d'archivio PRIMA del profilo: il ramo A la rivendicava subito, e le sue asserzioni passavano anche
cancellando l'intero blocco che il test doveva presidiare. L'ha trovato un critico avversariale, non
la suite. Quando un test verifica un percorso TARDIVO (rivendicazione al cambio email, backfill
differito), controllare che lo stato di partenza non sia già stato risolto da un percorso PRECEDENTE
— altrimenti si misura il percorso sbagliato.

⚠️ I conteggi sopra sono **misurati eseguendo le suite**, non contati leggendo i sorgenti. Contare i
`raise notice` nel file dà il numero SBAGLIATO ogni volta che una notice sta dentro un ciclo o un
ramo condizionale: è già successo con la 0010 (contata 7, in realtà 9). Se un giorno vanno
riverificati, si rilanciano — non si rileggono.

Il container va **creato pulito a ogni giro**: la suite inserisce utenti con id fissi, quindi
rilanciarla sullo stesso database fallisce subito sul setup (chiave duplicata) e stampa zero
`PASS`. Se vedi zero, controlla prima di aver rimosso il container precedente.

Gli assert sono scritti per fallire rumorosamente: confrontano conteggi con il valore esatto atteso
e i test negativi catturano l'eccezione specifica (`unique_violation`, `check_violation`,
`insufficient_privilege`), così un permesso negato non viene scambiato per un filtro che funziona.
