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

## Come si esegue

Dalla cartella `supabase/`, con Docker attivo. Sostituire `<SHIM>` con uno dei due file e
`<MIGRATION>`/`<TEST>` con la coppia migration+test da verificare.

```bash
docker run -d --name pgtest -e POSTGRES_PASSWORD=test postgres:15-alpine
until docker exec pgtest pg_isready -U postgres; do sleep 2; done

cat tests/<SHIM> \
    migrations/000*.sql \
    migrations/<MIGRATION> \
    tests/<TEST> \
  | docker exec -i pgtest psql -U postgres -v ON_ERROR_STOP=1

docker rm -f pgtest
```

Coppie disponibili:

| `<MIGRATION>` | `<TEST>` |
|---|---|
| `0008_partner_refs.sql` | `0008_partner_refs.test.sql` |
| `0009_profiles_contact_email.sql` | `0009_profiles_contact_email.test.sql` |

Nota: la migration sotto test compare **due volte** nella pipe (una dentro `migrations/000*.sql`,
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

Il container va **creato pulito a ogni giro**: la suite inserisce utenti con id fissi, quindi
rilanciarla sullo stesso database fallisce subito sul setup (chiave duplicata) e stampa zero
`PASS`. Se vedi zero, controlla prima di aver rimosso il container precedente.

Gli assert sono scritti per fallire rumorosamente: confrontano conteggi con il valore esatto atteso
e i test negativi catturano l'eccezione specifica (`unique_violation`, `check_violation`,
`insufficient_privilege`), così un permesso negato non viene scambiato per un filtro che funziona.
