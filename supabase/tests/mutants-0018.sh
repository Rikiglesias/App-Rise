#!/usr/bin/env bash
# MUTATION TESTING della suite 0018 — «il verde al primo giro non conta».
#
# Rompe le difese della funzione `nickname_disponibile` UNA PER VOLTA e pretende che il
# test previsto diventi rosso. Un mutante che sopravvive è un test che non presidia niente.
#
# ⚠️ IL FILE VERO NON VIENE MAI TOCCATO: `migrations/` viene copiata in una directory
# temporanea e la mutazione si applica ALLA COPIA (stessa precauzione di mutants-0017.sh,
# nata da un restore fallito in silenzio il 2026-07-29).
#
# ⚠️ UN MUTANTE MUTA ANCHE LA 0017 (M8): l'allineamento fra la funzione e l'indice è una
# proprietà che vive in DUE file, e per provarla bisogna poter rompere l'altro.
#
# Uso, dalla cartella `supabase/`, con Docker attivo:
#   bash tests/mutants-0018.sh
# ⚠️ I `grep` sul log usano una HERE-STRING e non `printf | grep -q`: con `set -o
# pipefail`, `grep -q` esce al primo match e chiude la pipe, `printf` muore di SIGPIPE
# (141) e la pipeline restituisce «non trovato» pur avendo trovato — cioè un mutante
# MORTO viene dichiarato SOPRAVVISSUTO. Si innesca solo con log grandi (uno stack trace
# basta). Scoperto sulla 0019 il 2026-07-30 e propagato qui.
set -uo pipefail

CONTAINER=pgtest-mut0018
SHIM=tests/shim_permissive.sql
WORK=$(mktemp -d)
trap 'docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; rm -rf "$WORK"' EXIT

# Ogni mutante: etichetta | REGEX che deve comparire nel log | file da mutare | sed.
#
# Il criterio di morte è una REGEX e non un semplice «Tn FAIL» per un motivo concreto:
# il mutante che toglie i grant non fa fallire un'asserzione, fa fallire la CHIAMATA
# («permission denied»), e un criterio che sapesse solo cercare «FAIL» lo dichiarerebbe
# fuori bersaglio pur essendo morto della morte giusta.
run_mutante() {
  local nome="$1" atteso="$2" target="$3" sedexpr="$4"

  rm -rf "$WORK/migrations"
  cp -r migrations "$WORK/migrations"
  sed -i "$sedexpr" "$WORK/migrations/${target}"

  # Guardia anti-mutante-inerte: se il sed non ha cambiato NIENTE, il giro misurerebbe
  # il codice originale. È il modo in cui una mutazione mente.
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
  log=$(cat "$SHIM" "$WORK"/migrations/0*.sql tests/0018_nickname_disponibile.test.sql \
        | docker exec -i "$CONTAINER" psql -U postgres -v ON_ERROR_STOP=1 2>&1)

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

M=0018_nickname_disponibile.sql
vivi=0

# M1 — via `security definer`: la funzione legge con i privilegi di CHI CHIAMA, quindi
#      per `anon` le policy di `profiles` nascondono tutto e la risposta diventa sempre
#      «libero». È il guasto centrale, e l'unico test che può vederlo è T2, perché è
#      l'unico che chiede da `anon` un nickname che ESISTE.
run_mutante "M1 security definer" "T2 FAIL" "$M" \
  's/^security definer$/security invoker/' || vivi=$((vivi+1))

# M2 — via `lower()` dal confronto: «MARIO» diventa un nome diverso da «Mario», il
#      modulo lo dichiara libero e poi l'indice (che invece normalizza) lo respinge.
run_mutante "M2 confronto senza lower" "T3 FAIL" "$M" \
  's/where lower(nickname) = lower(btrim(p_nickname))/where nickname = btrim(p_nickname)/' || vivi=$((vivi+1))

# M3 — via `btrim()`: uno spazio incollato in fondo basta a far sembrare libero un
#      nickname preso. Sono proprio i valori che arrivano da un incolla.
run_mutante "M3 input non ripulito" "T4 FAIL" "$M" \
  's/lower(btrim(p_nickname))/lower(p_nickname)/' || vivi=$((vivi+1))

# M4 — via l'esclusione di chi chiede: in «modifica profilo» il proprio nickname
#      risulterebbe occupato da sé stessi, e salvare senza toccarlo darebbe errore.
run_mutante "M4 esclusione di chi chiede" "T7 FAIL" "$M" \
  's/^      and id is distinct from (select auth.uid())$/      and true/' || vivi=$((vivi+1))

# M5 — l'esclusione smette di guardare l'IDENTITÀ e guarda solo se c'è un'autenticazione:
#      chiunque sia loggato si vedrebbe libero QUALUNQUE nickname, compresi quelli altrui.
#      Scelto apposta perché lascia T7 verde: senza T8, questo buco passerebbe.
run_mutante "M5 esclusione cieca all'identita'" "T8 FAIL" "$M" \
  's/^      and id is distinct from (select auth.uid())$/      and (select auth.uid()) is null/' || vivi=$((vivi+1))

# M6 — via il `revoke`: EXECUTE resta concesso a PUBLIC come da default di Postgres. Il
#      comportamento non cambia di una virgola (i test 1-8 restano verdi): a vederlo è
#      solo T11, che guarda i privilegi invece del risultato.
run_mutante "M6 revoke da PUBLIC" "T11 FAIL" "$M" \
  's/^revoke all on function/-- revoke all on function/' || vivi=$((vivi+1))

# M7 — via i grant espliciti: con il revoke ancora attivo, `anon` non può più CHIAMARE la
#      funzione. Muore T1 e non T10, ed è corretto così: T1 è il primo che prova a
#      chiamarla da `anon`, cioè il primo a sbattere contro il permesso mancante. T10
#      resta nella suite come dichiarazione esplicita del contratto, non come rete.
run_mutante "M7 grant a anon/authenticated" "permission denied for function nickname_disponibile" "$M" \
  's/^grant execute on function/-- grant execute on function/' || vivi=$((vivi+1))

# M8 — si rompe l'ALTRO lato dell'allineamento: l'indice della 0017 smette di
#      normalizzare le maiuscole mentre la funzione continua a farlo. Nessun test di
#      comportamento della 0018 se ne accorge (la funzione risponde come sempre): a
#      vederlo è solo T12, che mette le due regole una contro l'altra sui dati veri.
#      È il mutante che dimostra perché T12 esiste.
run_mutante "M8 indice 0017 senza lower (divergenza)" "T12 FAIL" "0017_profiles_nickname.sql" \
  's/on public.profiles (lower(nickname))/on public.profiles (nickname)/' || vivi=$((vivi+1))

echo "----------------------------------------"
if [ "$vivi" -ne 0 ]; then
  echo "${vivi} mutanti NON uccisi — la suite non presidia quanto sembra"
  exit 1
fi
echo "tutti i mutanti uccisi dal test previsto"
