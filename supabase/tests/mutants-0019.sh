#!/usr/bin/env bash
# MUTATION TESTING della suite 0019 — «il verde al primo giro non conta».
#
# Rompe le difese della migration UNA PER VOLTA e pretende che il test previsto diventi
# rosso. Un mutante che sopravvive è un test che non presidia niente.
#
# ⚠️ IL FILE VERO NON VIENE MAI TOCCATO: `migrations/` viene copiata in una directory
# temporanea e la mutazione si applica ALLA COPIA (stessa precauzione di
# mutants-0017/0018, nata da un restore fallito in silenzio il 2026-07-29).
#
# ⚠️ DUE MUTANTI USANO `0,/…/s//…/` (sostituzione della PRIMA occorrenza): la chiamata
# `perform public.pulisci_metadata_anagrafici_di(new.id);` compare IDENTICA in due punti
# — dentro `handle_new_user` e dentro il trigger di pulizia — e un sed globale le
# spegnerebbe entrambe, misurando un guasto diverso da quello dichiarato. La prima
# occorrenza nel file è quella di `handle_new_user`.
#
# Uso, dalla cartella `supabase/`, con Docker attivo:
#   bash tests/mutants-0019.sh
set -uo pipefail

CONTAINER=pgtest-mut0019
SHIM=tests/shim_permissive.sql
WORK=$(mktemp -d)
trap 'docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; rm -rf "$WORK"' EXIT

# Ogni mutante: etichetta | REGEX che deve comparire nel log | file da mutare | sed.
# Il criterio di morte è una REGEX e non un semplice «Tn FAIL» perché un mutante può
# uccidere il test facendo esplodere il motore invece di far fallire un'asserzione (M6).
# `SOLO=M6 bash tests/mutants-0019.sh` esegue un mutante solo. Serve quando un mutante
# si comporta in modo diverso dentro lo script e fuori: senza, l'unico modo di indagare è
# rifare a mano il giro e sperare di replicarlo uguale.
SOLO="${SOLO:-}"

run_mutante() {
  local nome="$1" atteso="$2" target="$3" sedexpr="$4"

  if [ -n "$SOLO" ] && [ "${nome#"$SOLO"}" = "$nome" ]; then
    return 0
  fi

  rm -rf "$WORK/migrations"
  cp -r migrations "$WORK/migrations"
  sed -i "$sedexpr" "$WORK/migrations/${target}"

  # Guardia anti-mutante-inerte: se il sed non ha cambiato NIENTE, il giro misurerebbe il
  # codice originale. È il modo in cui una mutazione mente.
  if diff -q "migrations/${target}" "$WORK/migrations/${target}" >/dev/null; then
    echo "⚠️  ${nome}: MUTAZIONE INERTE — l'ancora del sed non ha matchato niente."
    return 2
  fi

  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  docker run -d --name "$CONTAINER" -e POSTGRES_PASSWORD=test postgres:15-alpine >/dev/null
  for _ in $(seq 1 40); do
    docker exec "$CONTAINER" pg_isready -U postgres -q && break
    docker exec "$CONTAINER" sleep 1
  done

  local log
  log=$(cat "$SHIM" "$WORK"/migrations/0*.sql \
            tests/0019_eta_minima_e_bonifica_metadata.test.sql \
        | docker exec -i "$CONTAINER" psql -U postgres -v ON_ERROR_STOP=1 2>&1)

  # 🔴 GUARDIA «IL GIRO NON È GIRATO», aggiunta il 2026-07-30 dopo che questo script
  # aveva dichiarato SOPRAVVISSUTI due mutanti che, applicati a mano, morivano subito.
  # Un container che non parte fa stampare a Docker «Error response from daemon…» —
  # minuscolo, quindi invisibile al grep di `ERROR` — e un log senza nemmeno un PASS
  # veniva letto come «il codice rotto non disturba nessuno». È la stessa lezione già
  # scritta in run-all.sh («una suite che non gira non è una suite che passa»), che non
  # era mai stata propagata qui: il primo mutante muore sempre presto, quindi si pretende
  # solo che QUALCOSA sia girato, non un numero minimo di PASS.
  # ⚠️ HERE-STRING, NON `printf | grep`: con `set -o pipefail`, `grep -q` esce al primo
  # match e chiude la pipe, `printf` muore di SIGPIPE (141) e la PIPELINE restituisce 141
  # — cioè «non trovato» — pur avendo trovato. Succede solo con log abbastanza grandi da
  # non stare nel buffer della pipe: qui il mutante della ricorsione ne produce 119 KB, e
  # per questo risultava «non misurato» mentre a mano moriva regolarmente. Gli altri sette
  # avevano log piccoli e non lo mostravano. Vale per TUTTI i grep di questo file.
  if ! grep -qE 'PASS|FAIL|ERROR' <<< "$log"; then
    echo "⚠️  ${nome}: NON MISURATO — la suite non è girata affatto (container/psql muto):"
    # Le ULTIME righe, non le prime: l'inizio è sempre lo shim che crea lo schema, uguale
    # per tutti i giri, e non dice niente su dove il giro si è fermato.
    printf '%s\n' "$log" | tail -4
    return 3
  fi

  if grep -qE "${atteso}" <<< "$log"; then
    echo "✅ ${nome}: UCCISO — «${atteso}»"
    return 0
  fi
  if grep -qE 'FAIL|ERROR' <<< "$log"; then
    echo "🟡 ${nome}: rosso, ma FUORI BERSAGLIO (atteso «${atteso}»):"
    printf '%s\n' "$log" | grep -E 'FAIL|ERROR' | head -2
    return 1
  fi
  echo "🔴 ${nome}: SOPRAVVISSUTO — nessun test si accorge del codice rotto"
  return 1
}

M=0019_eta_minima_e_bonifica_metadata.sql
# 🔴 DAL 2026-07-31 TRE MUTANTI NON MUTANO PIÙ QUESTO FILE, e la ragione va capita prima di
# «semplificare» rimettendoli su `$M`. La migration **0020** riscrive con `create or
# replace` due oggetti definiti qui — `handle_new_user` e `pulisci_metadata_anagrafici_di`
# — e il `cat` di questo script applica TUTTE le migration in ordine. Mutare la 0019
# significherebbe quindi mutare codice che, tre file dopo, viene sovrascritto: la
# mutazione sparisce, la suite resta verde, e lo script direbbe «SOPRAVVISSUTO» su una
# difesa che invece funziona benissimo. Un mutante che misura il file sbagliato è la
# stessa classe di guasto del mutation test vacuo del 2026-07-30 (registro indicizzato sul
# nome del file: zero voci, tre falsi verdi).
# ⇒ REGOLA: il mutante colpisce il file che definisce l'oggetto PER ULTIMO. I test di
#   riferimento restano quelli della 0019, perché è la 0019 a dover essere presidiata.
#   Quando una 0021 riscriverà di nuovo quelle funzioni, questa variabile va aggiornata.
M20=0020_claim_nickname_da_profiles.sql
vivi=0

# M1 — la soglia torna a 18: è il guasto che la fase esiste per togliere. Lo vede T1, il
#      solo test che si registra con esattamente 14 anni compiuti.
#      ⚠️ Il criterio NON è «T1 FAIL»: l'insert di T1 sta fuori da un blocco che cattura
#      (deve riuscire, non fallire con grazia), quindi il vincolo lo respinge con un ERROR
#      di Postgres e `ON_ERROR_STOP` ferma la suite prima che il `do` possa dire FAIL.
#      Morte giusta, messaggio diverso — stessa ragione per cui il criterio è una regex.
run_mutante "M1 soglia di nuovo a 18" 'violates check constraint "eta_minima"' "$M" \
  "s/interval '14 years'/interval '18 years'/" || vivi=$((vivi+1))

# M2 — il vincolo viene CANCELLATO invece che abbassato: è l'errore probabile di chi legge
#      «togliamo il limite dei 18 anni» e fa la cosa letterale. T1 e T3 restano verdi
#      (entrambi entrano), e a vederlo è solo T2 — che è la ragione per cui T2 esiste.
run_mutante "M2 vincolo cancellato, non abbassato" "T2 FAIL" "$M" \
  "s/check (birth_date <= (now()::date - interval '14 years'))/check (true)/" || vivi=$((vivi+1))

# M3 — via la pulizia dalla nascita del profilo (PRIMA occorrenza: `handle_new_user`).
#      Il trigger di aggiornamento resta, quindi T8 continua a passare: a vedere il buco è
#      solo T5, che guarda i metadata subito dopo la registrazione.
#      ⚠️ Target `$M20` e non `$M`: dal 2026-07-31 è la 0020 l'ultima a definire
#      `handle_new_user` (vedi il blocco in testa). Nella 0020 quella riga compare una
#      volta sola, ma la forma `0,/…/` resta perché costa nulla ed è a prova del giorno in
#      cui ricomparisse una seconda chiamata.
run_mutante "M3 nessuna pulizia alla nascita" "T5 FAIL" "$M20" \
  '0,/^  perform public.pulisci_metadata_anagrafici_di(new.id);$/s//  -- mutante M3/' \
  || vivi=$((vivi+1))

# M4 — SPOSTATO in `mutants-0020.sh` (N12) il 2026-07-31, e la ragione va letta prima di
#      rimetterlo qui. Misurava «la pulizia porta via `preferred_username`, e T6 se ne
#      accorge». Dalla 0020 quel guasto non è più possibile in due modi diversi: il claim
#      viene RIDERIVATO da `profiles` due righe dopo la pulizia (quindi T6 resterebbe
#      verde comunque), e le chiavi protette vengono tolte dalla lista a prescindere da
#      cosa ci si scriva dentro. Misurandolo si è scoperto che, senza quel filtro, la
#      mutazione non fa fallire un test: manda il database in `stack depth limit
#      exceeded`, perché i due trigger si rimpallano la stessa chiave all'infinito.
#      ⇒ il mutante utile oggi non è «togli il claim dalla lista», è «togli il FILTRO»:
#      vive come N12 nella suite della 0020, dov'è la difesa che presidia.

# M5 — il presidio smette di guardare la colonna giusta. È il trigger che in produzione
#      farà probabilmente tutto il lavoro (GoTrue riscrive la riga dopo l'INSERT): se
#      ascolta l'evento sbagliato, chiunque rimetta quelle chiavi con un UPDATE le lascia
#      lì per sempre. Lo vede T8.
#      ⚠️ La prima stesura RINOMINAVA il trigger invece di cambiarne l'evento: il trigger
#      veniva creato lo stesso, col nome nuovo, e continuava a funzionare — a fallire era
#      T10, che prova a disabilitarlo per nome. Rosso fuori bersaglio: misurava
#      «il nome è cambiato», non «il presidio è sparito».
run_mutante "M5 presidio sull'evento sbagliato" "T8 FAIL" "$M" \
  's/^  after update of raw_user_meta_data on auth.users$/  after update of email on auth.users/' \
  || vivi=$((vivi+1))

# M6 — via la guardia che ferma la ricorsione. Il trigger aggiorna la stessa colonna che
#      lo fa scattare: senza il filtro, si richiama all'infinito. Non muore
#      un'asserzione — muore il motore, ed è il modo giusto di morire per questo mutante.
#      ⚠️ È anche la prova che la guardia NON è cosmetica: senza, la prima registrazione
#      del mondo reale fallirebbe.
#      ⚠️ Target `$M20`: è la 0020 l'ultima a definire `pulisci_metadata_anagrafici_di`.
run_mutante "M6 ricorsione senza guardia" "stack depth limit exceeded" "$M20" \
  's/^     and raw_user_meta_data ?| v_chiavi;$/     ;/' || vivi=$((vivi+1))

# M7 — via `check_violation` dall'exception del §3: si torna esattamente al difetto
#      ereditato dalla 0016. Un CHECK futuro su `phone` bloccherebbe il CAMBIO EMAIL.
#      L'ancora è la riga a sei spazi, che è solo quella nuova (l'altra sta sulla stessa
#      riga di `exception`).
run_mutante "M7 §3 senza check_violation" "T11 FAIL" "$M" \
  's/^      when check_violation then$/      when unique_violation then/' || vivi=$((vivi+1))

# M8 — torna il tipo composito nel §4: `v_legacy public.legacy_contacts` si risolve alla
#      COMPILAZIONE, quindi dopo un rollback della 0012 nessuno può più registrarsi. È il
#      difetto ② della 0016, e la sua suite lo SCHIVA di proposito: senza T13 nessun test
#      al mondo lo vedrebbe.
run_mutante "M8 §4 col tipo composito" "T13 FAIL" "$M" \
  's/^  v_trovata boolean := false;$/  v_trovata boolean := false;\n  v_legacy public.legacy_contacts;/' \
  || vivi=$((vivi+1))

echo "----------------------------------------"
if [ "$vivi" -ne 0 ]; then
  echo "${vivi} mutanti NON uccisi — la suite non presidia quanto sembra"
  exit 1
fi
echo "tutti i mutanti uccisi dal test previsto"
