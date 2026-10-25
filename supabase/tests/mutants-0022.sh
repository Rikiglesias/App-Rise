#!/usr/bin/env bash
# C79: un guasto per regola, sulla COPIA delle migration, su entrambi gli shim.
# Dalla cartella supabase/: bash tests/mutants-0022.sh
# SOLO=M6 bash tests/mutants-0022.sh seleziona un mutante (baseline sempre).
# SENZA_0022=1 bash tests/mutants-0022.sh prova la suite sullo schema precedente:
# l'esito deve essere ROSSO per asserzioni, non per Docker o sintassi SQL.
set -uo pipefail

CONTAINER="pgtest-mut0022-$$"
M=0022_consensi_server_e_oblio.sql
TEST=tests/0022_consensi_server_e_oblio.test.sql
SHIMS=(shim_permissive shim_restrictive)
SOLO="${SOLO:-}"
WORK=$(mktemp -d) || exit 1
# Canonicalizza prima di qualunque rimozione ricorsiva. Mai cancellare il repo.
WORK=$(cd "$WORK" && pwd -P) || exit 1
case "$WORK" in /?*) ;; *) echo 'ERRORE: directory temporanea non assoluta'; exit 1 ;; esac
cleanup() {
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  rm -rf -- "$WORK"
}
trap cleanup EXIT
trap 'exit 130' INT TERM
cp -r migrations "$WORK/migrations" || exit 1

run_suite() {
  local shim="$1" senza="${2:-0}" pronto=0 migration i
  local files=()
  : >"$WORK/suite.log" # un errore Docker non deve riusare il log del giro prima
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  docker run -d --name "$CONTAINER" -e POSTGRES_PASSWORD=test postgres:15-alpine >"$WORK/docker.log" 2>&1 || {
    tail -4 "$WORK/docker.log"; return 2;
  }
  for ((i=0; i<40; i++)); do
    if docker exec "$CONTAINER" pg_isready -U postgres -q >/dev/null 2>&1; then pronto=1; break; fi
    sleep 1
  done
  if [ "$pronto" -ne 1 ]; then echo 'ERRORE: Postgres non pronto entro 40s'; return 2; fi
  # Escludere il FILE, mai filtrare le righe SQL con grep -v 0022.
  for migration in "$WORK"/migrations/0*.sql; do
    if [ "$senza" = 1 ] && [ "${migration##*/}" = "$M" ]; then continue; fi
    files+=("$migration")
  done
  # Doppio apply anche nei mutanti: nessuna seconda copia sana che li annulli.
  if [ "$senza" != 1 ]; then files+=("$WORK/migrations/$M"); fi
  cat "tests/${shim}.sql" "${files[@]}" "$TEST" |
    docker exec -i -e PGOPTIONS='-c statement_timeout=20000 -c lock_timeout=10000' \
      "$CONTAINER" psql -X -U postgres -v ON_ERROR_STOP=1 >"$WORK/suite.log" 2>&1
}

# Modalità rossa: non produce MAI il messaggio di successo dei mutanti.
if [ "${SENZA_0022:-0}" = 1 ]; then
  rossi=0
  for shim in "${SHIMS[@]}"; do
    run_suite "$shim" 1
    code=$?
    if [ "$code" -ne 0 ] && grep -qE 'ERROR:.*T[0-9]+.*FAIL' "$WORK/suite.log"; then
      echo "rosso atteso senza 0022 [$shim]"
      tail -6 "$WORK/suite.log"
      rossi=$((rossi+1))
    else
      echo "rosso NON dimostrato [$shim], exit $code"
      tail -6 "$WORK/suite.log" 2>/dev/null || true
    fi
  done
  echo "$rossi/2 shim rossi sullo schema precedente"
  exit 1
fi

# Una suite già rossa non può uccidere un mutante in modo probante.
for shim in "${SHIMS[@]}"; do
  if ! run_suite "$shim" || ! grep -q 'NOTICE:.*ALL TESTS PASS 0022' "$WORK/suite.log"; then
    echo "BASELINE ROSSA [$shim]: mutanti non misurati"
    tail -6 "$WORK/suite.log" 2>/dev/null || true
    exit 1
  fi
  echo "baseline verde 0022 [$shim]"
done

eseguiti=0
vivi=0
run_mutante() {
  local nome="$1" atteso="$2" sedexpr="$3" shim code falliti=0
  if [ -n "$SOLO" ] && [ "${nome%% *}" != "$SOLO" ]; then return 0; fi
  eseguiti=$((eseguiti+1))
  cp "migrations/$M" "$WORK/migrations/$M" || return 1
  sed -i "$sedexpr" "$WORK/migrations/$M" || return 1
  if cmp -s "migrations/$M" "$WORK/migrations/$M"; then
    echo "$nome: MUTAZIONE INERTE"; return 1
  fi
  for shim in "${SHIMS[@]}"; do
    run_suite "$shim"
    code=$?
    if [ "$code" -ne 0 ] && grep -qE "ERROR:.*${atteso}" "$WORK/suite.log"; then
      echo "$nome [$shim]: UCCISO dal test previsto"
    else
      echo "$nome [$shim]: NON UCCISO dal test previsto (exit $code)"
      tail -6 "$WORK/suite.log" 2>/dev/null || true
      falliti=$((falliti+1))
    fi
  done
  [ "$falliti" -eq 0 ]
}

run_mutante 'M1 created_at dal client' 'T1.*FAIL' \
  's/new.created_at := now();/new.created_at := new.created_at;/' || vivi=$((vivi+1))
# Cade già T0: con la protezione anche su INSERT il profilo nasce false, e
# senza il sync l'evento «granted» della registrazione non lo riporta a true.
# (T2 cadrebbe comunque: la richiesta app è invalida, quindi la sua
# sotto-transazione non può mascherare l'assenza del sync.)
run_mutante 'M2 aggiornamento profilo tolto' 'T0.*FAIL' \
  's/where p.id = new.user_id/where false and p.id = new.user_id/' || vivi=$((vivi+1))
run_mutante 'M3 IS DISTINCT FROM tolto' 'T6.*FAIL' \
  's/and p.marketing_consent is distinct from v_marketing;/and true;/' || vivi=$((vivi+1))
run_mutante 'M4 BEFORE UPDATE tolto' 'T3.*FAIL' \
  '/^create trigger on_profile_marketing_guard before insert or update/,+1d' || vivi=$((vivi+1))
run_mutante 'M5 nessun evento non torna false' 'T4.*FAIL' \
  's/), false);/), new.marketing_consent);/' || vivi=$((vivi+1))
run_mutante 'M6 B8 legame oblio tolto' 'T7 B8.*FAIL' \
  's/set oblio_user_id = new.id/set oblio_user_id = null/' || vivi=$((vivi+1))
run_mutante 'M7 ordine server ignorato a parita di timestamp' 'T9.*FAIL' \
  's/, e.server_order desc//g' || vivi=$((vivi+1))
run_mutante 'M8 B8 vecchia email non verificata' 'T11.*FAIL' \
  's/if v_vecchia_provata and nullif/if nullif/' || vivi=$((vivi+1))
run_mutante 'M9 profilo ricreato senza protezione' 'T16.*FAIL' \
  's/before insert or update on public.profiles/before update on public.profiles/' || vivi=$((vivi+1))

if [ "$vivi" -ne 0 ] || [ "$eseguiti" -eq 0 ]; then
  echo "$vivi mutanti NON uccisi; $eseguiti selezionati"
  exit 1
fi
echo "tutti i mutanti uccisi dal test previsto ($eseguiti mutanti, 2 shim)"
