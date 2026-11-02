#!/usr/bin/env bash
# Un guasto per regola della 0023, sulla COPIA delle migration.
# Dalla cartella supabase/: bash tests/mutants-0023.sh
# SOLO=M3 bash tests/mutants-0023.sh seleziona un mutante (baseline sempre).
# Stesso impianto di mutants-0022.sh: baseline verde, mutazione che deve mordere,
# ucciso solo se cade il test previsto.
set -uo pipefail

CONTAINER="pgtest-mut0023-$$"
M=0023_privilegi_minimi.sql
TEST=tests/0023_privilegi_minimi.test.sql
SHIMS=(shim_permissive shim_restrictive)
SOLO="${SOLO:-}"
WORK=$(mktemp -d) || exit 1
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
  local shim="$1" pronto=0 i
  : >"$WORK/suite.log"
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  docker run -d --name "$CONTAINER" -e POSTGRES_PASSWORD=test postgres:15-alpine >"$WORK/docker.log" 2>&1 || {
    tail -4 "$WORK/docker.log"; return 2;
  }
  for ((i=0; i<40; i++)); do
    if docker exec "$CONTAINER" pg_isready -U postgres -q >/dev/null 2>&1; then pronto=1; break; fi
    sleep 1
  done
  if [ "$pronto" -ne 1 ]; then echo 'ERRORE: Postgres non pronto entro 40s'; return 2; fi
  cat "tests/${shim}.sql" "$WORK"/migrations/0*.sql "$WORK/migrations/$M" "$TEST" |
    docker exec -i -e PGOPTIONS='-c statement_timeout=20000 -c lock_timeout=10000' \
      "$CONTAINER" psql -X -U postgres -v ON_ERROR_STOP=1 >"$WORK/suite.log" 2>&1
}

# Una suite già rossa non può uccidere un mutante in modo probante.
for shim in "${SHIMS[@]}"; do
  if ! run_suite "$shim" || ! grep -q 'NOTICE:.*ALL TESTS PASS 0023' "$WORK/suite.log"; then
    echo "BASELINE ROSSA [$shim]: mutanti non misurati"
    tail -6 "$WORK/suite.log" 2>/dev/null || true
    exit 1
  fi
  echo "baseline verde 0023 [$shim]"
done

eseguiti=0
vivi=0
# $4 = shim su cui il guasto esiste: senza default privileges anon non ha nulla da
# perdere, quindi il mutante su anon si misura solo sullo shim permissivo.
run_mutante() {
  local nome="$1" atteso="$2" sedexpr="$3" shims="${4:-${SHIMS[*]}}" shim code falliti=0
  if [ -n "$SOLO" ] && [ "${nome%% *}" != "$SOLO" ]; then return 0; fi
  eseguiti=$((eseguiti+1))
  cp "migrations/$M" "$WORK/migrations/$M" || return 1
  sed -i "$sedexpr" "$WORK/migrations/$M" || return 1
  if cmp -s "migrations/$M" "$WORK/migrations/$M"; then
    echo "$nome: MUTAZIONE INERTE"; return 1
  fi
  for shim in $shims; do
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

run_mutante 'M1 anon conserva i privilegi' 'T1.*FAIL' \
  '/^  from anon, authenticated;$/s/anon, //' shim_permissive || vivi=$((vivi+1))
run_mutante 'M2 authenticated puo svuotare profiles' 'T2.*FAIL' \
  's/^grant select, insert, update, delete on public.profiles to authenticated;$/grant select, insert, update, delete, truncate on public.profiles to authenticated;/' \
  || vivi=$((vivi+1))
run_mutante 'M3 registro consensi modificabile' 'T2.*FAIL' \
  's/^grant select, insert on public.consent_events to authenticated;$/grant select, insert, update on public.consent_events to authenticated;/' \
  || vivi=$((vivi+1))
run_mutante 'M4 ref scelto dal client' 'T2.*FAIL' \
  's/^grant insert (user_id, partner) on public.partner_refs to authenticated;$/grant insert on public.partner_refs to authenticated;/' \
  || vivi=$((vivi+1))
run_mutante 'M5 limite tolto su city' 'T9.*FAIL' \
  '/char_length(city) <= 200/d' || vivi=$((vivi+1))
run_mutante 'M6 limite tolto su channel' 'T9.*FAIL' \
  's/  and char_length(channel) <= 64//' || vivi=$((vivi+1))
# La sonda deve vedere la fuga: RLS spenta su profiles = A legge anche B.
run_mutante 'M7 RLS spenta su profiles' 'T6a.*FAIL' \
  's/^commit;$/alter table public.profiles disable row level security; commit;/' || vivi=$((vivi+1))
run_mutante 'M8 policy di consent_events aperta' 'T6b.*FAIL' \
  's/^commit;$/alter table public.consent_events disable row level security; commit;/' || vivi=$((vivi+1))

if [ "$vivi" -ne 0 ] || [ "$eseguiti" -eq 0 ]; then
  echo "$vivi mutanti NON uccisi; $eseguiti selezionati"
  exit 1
fi
echo "tutti i mutanti uccisi dal test previsto ($eseguiti mutanti)"
