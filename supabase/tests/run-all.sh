#!/usr/bin/env bash
# Esegue TUTTE le coppie migration+test contro ENTRAMBI gli shim.
#
# Perché esiste: il 2026-07-26 la migration 0012 ha aggiunto un trigger su OGNI
# nascita di profilo, e le suite 0008-0011 non erano state rieseguite con la 0012
# in pipe. Poteva romperle tutte in silenzio. Il problema non era la disciplina di
# chi verifica: era che "riesegui tutto" costava quattro comandi a memoria, quindi
# si finiva per rieseguire solo la suite appena scritta.
#
# Uso, dalla cartella `supabase/`, con Docker attivo:
#   bash tests/run-all.sh
#
# Esce 1 al primo fallimento, stampando quale coppia e quale shim. Ogni giro parte
# da un container PULITO: la suite inserisce righe con id fissi e rilanciarla sullo
# stesso database fallirebbe sul setup.
set -uo pipefail

CONTAINER=pgtest-runall
PAIRS=(
  "0008_partner_refs"
  "0009_profiles_contact_email"
  "0010_profiles_minimo"
  "0011_signup_contact_email"
  "0012_legacy_contacts"
  "0013_contact_email_follows_account"
)
SHIMS=("shim_permissive" "shim_restrictive")

cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT

fallite=0

for pair in "${PAIRS[@]}"; do
  for shim in "${SHIMS[@]}"; do
    cleanup
    docker run -d --name "$CONTAINER" -e POSTGRES_PASSWORD=test postgres:15-alpine >/dev/null

    pronto=0
    for _ in $(seq 1 40); do
      if docker exec "$CONTAINER" pg_isready -U postgres -q; then pronto=1; break; fi
      docker exec "$CONTAINER" sleep 1
    done
    if [ "$pronto" -ne 1 ]; then
      echo "ERRORE: Postgres non è partito entro 40s"
      exit 1
    fi

    # La migration sotto test compare DUE volte (una nel glob, una esplicita): è il
    # test di rieseguibilità. Il glob è 0*.sql, non 000*.sql — con 000* le migration
    # dalla 0010 in poi verrebbero saltate in silenzio.
    log=$(cat "tests/${shim}.sql" migrations/0*.sql \
              "migrations/${pair}.sql" "tests/${pair}.test.sql" \
          | docker exec -i "$CONTAINER" psql -U postgres -v ON_ERROR_STOP=1 2>&1)

    pass=$(printf '%s' "$log" | grep -c 'PASS' || true)
    if printf '%s' "$log" | grep -qE 'FAIL|ERROR'; then
      echo "ROSSO  ${pair} [${shim}] — ${pass} PASS prima del fallimento:"
      printf '%s\n' "$log" | grep -E 'FAIL|ERROR' | head -3
      fallite=$((fallite + 1))
    else
      echo "verde  ${pair} [${shim}] — ${pass} PASS"
    fi
  done
done

echo "----------------------------------------"
if [ "$fallite" -ne 0 ]; then
  echo "${fallite} combinazioni ROSSE"
  exit 1
fi
echo "tutte verdi (${#PAIRS[@]} coppie × ${#SHIMS[@]} shim)"
