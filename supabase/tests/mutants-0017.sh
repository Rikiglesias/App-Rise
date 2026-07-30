#!/usr/bin/env bash
# MUTATION TESTING della suite 0017 — «il verde al primo giro non conta».
#
# Rompe le difese della migration 0017 UNA PER VOLTA e pretende che il test previsto
# diventi rosso. Un mutante che sopravvive è un test che non presidia niente.
#
# ⚠️ IL FILE VERO NON VIENE MAI TOCCATO. L'intera cartella `migrations/` viene copiata
# in una directory temporanea e la mutazione si applica ALLA COPIA: un restore che
# fallisce in silenzio (già successo il 2026-07-29) qui non può lasciare il repo
# mutato, perché il repo non è mai stato scritto.
#
# Uso, dalla cartella `supabase/`, con Docker attivo:
#   bash tests/mutants-0017.sh
set -uo pipefail

CONTAINER=pgtest-mut0017
SHIM=tests/shim_permissive.sql
ORIG=migrations/0017_profiles_nickname.sql
WORK=$(mktemp -d)
trap 'docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; rm -rf "$WORK"' EXIT

# Ogni mutante: etichetta | test che DEVE morire | espressione sed applicata alla copia
# della 0017. Le espressioni sono ancorate a testo che esiste davvero nel file: se la
# migration cambia e un'ancora non matcha più, il controllo qui sotto lo dichiara.
run_mutante() {
  local nome="$1" atteso="$2" sedexpr="$3"

  rm -rf "$WORK/migrations"
  cp -r migrations "$WORK/migrations"
  sed -i "$sedexpr" "$WORK/migrations/0017_profiles_nickname.sql"

  # Guardia anti-mutante-inerte: se il sed non ha cambiato NIENTE, il giro
  # misurerebbe il codice originale e stamperebbe «sopravvissuto» per un motivo
  # sbagliato. È il modo in cui una mutazione mente.
  if diff -q "$ORIG" "$WORK/migrations/0017_profiles_nickname.sql" >/dev/null; then
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
  log=$(cat "$SHIM" "$WORK"/migrations/0*.sql tests/0017_profiles_nickname.test.sql \
        | docker exec -i "$CONTAINER" psql -U postgres -v ON_ERROR_STOP=1 2>&1)

  if printf '%s' "$log" | grep -q "${atteso} FAIL"; then
    echo "✅ ${nome}: UCCISO da ${atteso}"
    return 0
  fi
  if printf '%s' "$log" | grep -qE 'FAIL|ERROR'; then
    echo "🟡 ${nome}: rosso, ma NON su ${atteso} (fuori bersaglio):"
    printf '%s\n' "$log" | grep -E 'FAIL|ERROR' | head -2
    return 1
  fi
  echo "🔴 ${nome}: SOPRAVVISSUTO — ${atteso} resta verde contro il codice rotto"
  return 1
}

vivi=0

# M1 — via la clemenza del trigger: un nickname fuori forma viene propagato al CHECK,
#      che fa fallire l'INSERT e quindi la registrazione. È il guasto peggiore.
run_mutante "M1 clemenza del trigger" "T1" \
  's/^    v_nickname := null;$/    v_nickname := v_nickname;/' || vivi=$((vivi+1))

# M2 — via il btrim: un valore incollato con spazi passa la lunghezza ma viola
#      `nickname = btrim(nickname)`.
run_mutante "M2 btrim" "T4" \
  "s/nullif(btrim(coalesce(v_meta->>'preferred_username', '')), '')/nullif(coalesce(v_meta->>'preferred_username', ''), 'ZZ_MAI')/" || vivi=$((vivi+1))

# M3 — il bordo INFERIORE della clemenza nel trigger si allenta: un nickname di 1
#      carattere non viene più scartato, supera il trigger e va a sbattere sul CHECK.
#      M1 toglie la clemenza intera, M5 stringe il CHECK: questo isola il terzo punto,
#      cioè la soglia bassa della copia che sta nel trigger.
#
#      ⚠️ NON si muta più il `nullif(…, '')`: quella è una mutazione EQUIVALENTE, non un
#      buco della suite. Togliendolo, `''` arriva alla clemenza subito sotto, che lo
#      scarta comunque perché 0 caratteri sono meno di 2 — il comportamento osservabile
#      non cambia in nessun caso, quindi nessun test può accorgersene ed è giusto così.
#      Provato il 2026-07-30: «M3 sopravvissuto» era il verdetto corretto su una domanda
#      mal posta. Il `nullif` resta nel codice come difesa ridondante dichiarata.
run_mutante "M3 bordo 2 della clemenza nel trigger" "T2" \
  's/char_length(v_nickname) < 2 or/char_length(v_nickname) < 1 or/' || vivi=$((vivi+1))

# M4 — via il CHECK in colonna: la difesa in profondità sparisce e la clemenza del
#      trigger non presidia più niente.
run_mutante "M4 CHECK nickname_forma" "T8" \
  's/^    or (char_length(nickname) between 2 and 30 and nickname = btrim(nickname))$/    or true/' || vivi=$((vivi+1))

# M5 — il bordo superiore del CHECK diventa esclusivo: 30 caratteri, legittimi, vengono
#      rifiutati. È il modo in cui le due copie della regola iniziano a divergere.
run_mutante "M5 bordo 30 del CHECK" "T7" \
  's/between 2 and 30 and nickname = btrim(nickname)/between 2 and 29 and nickname = btrim(nickname)/' || vivi=$((vivi+1))

# M6 — il nickname non viene più scritto in colonna: la migration non fa più il suo
#      lavoro, e tutti i test «non deve rompere» resterebbero verdi.
run_mutante "M6 scrittura in colonna" "T3" \
  's/^      v_nickname                                          -- NUOVO (0017)$/      null                                                -- NUOVO (0017)/' || vivi=$((vivi+1))

# M7 — il corpo riscritto perde la guardia Apple Private Relay: è ESATTAMENTE la classe
#      di regressione del 2026-07-29 (corpo copiato dalla migration sbagliata).
run_mutante "M7 guardia relay nel corpo riscritto" "T11" \
  "s/when new.email like '%@privaterelay.appleid.com' then null/when false then null/" || vivi=$((vivi+1))

echo "----------------------------------------"
if [ "$vivi" -ne 0 ]; then
  echo "${vivi} mutanti NON uccisi — la suite non presidia quanto sembra"
  exit 1
fi
echo "tutti i mutanti uccisi dal test previsto"
