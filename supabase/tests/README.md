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
