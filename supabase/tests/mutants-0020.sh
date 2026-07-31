#!/usr/bin/env bash
# MUTATION TESTING della suite 0020 — «il verde al primo giro non conta».
#
# Rompe le difese della migration UNA PER VOLTA e pretende che il test previsto diventi
# rosso. Un mutante che sopravvive è un test che non presidia niente.
#
# ⚠️ IL FILE VERO NON VIENE MAI TOCCATO: `migrations/` viene copiata in una directory
# temporanea e la mutazione si applica ALLA COPIA (precauzione nata da un restore fallito
# in silenzio il 2026-07-29).
#
# Uso, dalla cartella `supabase/`, con Docker attivo:
#   bash tests/mutants-0020.sh
#   SOLO=N4 bash tests/mutants-0020.sh    # un mutante solo
set -uo pipefail

CONTAINER=pgtest-mut0020
SHIM=tests/shim_permissive.sql
WORK=$(mktemp -d)
trap 'docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; rm -rf "$WORK"' EXIT

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
            tests/0020_claim_nickname_da_profiles.test.sql \
        | docker exec -i "$CONTAINER" psql -U postgres -v ON_ERROR_STOP=1 2>&1)

  # 🔴 GUARDIA «IL GIRO NON È GIRATO» (lezione del 2026-07-30): un container che non parte
  # fa stampare a Docker «Error response from daemon…» — minuscolo, invisibile al grep di
  # `ERROR` — e un log senza nemmeno un PASS verrebbe letto come «il codice rotto non
  # disturba nessuno».
  # ⚠️ HERE-STRING, NON `printf | grep`: con `set -o pipefail`, `grep -q` esce al primo
  # match e chiude la pipe, `printf` muore di SIGPIPE (141) e la PIPELINE restituisce 141
  # — cioè «non trovato» — pur avendo trovato. Si innesca solo con log grandi, ed è
  # esattamente il caso del mutante della ricorsione (N2), che ne produce un centinaio di
  # KB. Vale per TUTTI i grep di questo file.
  if ! grep -qE 'PASS|FAIL|ERROR' <<< "$log"; then
    echo "⚠️  ${nome}: NON MISURATO — la suite non è girata affatto (container/psql muto):"
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

M=0020_claim_nickname_da_profiles.sql
vivi=0

# N1 — la derivazione sa solo SCRIVERE, mai cancellare: il ramo `null` mette la chiave a
#      JSON null invece di toglierla. È l'errore probabile di chi scrive la funzione
#      pensando al caso normale. T1, T5b e T7 restano verdi (il nickname vero funziona), e
#      a vederlo è T2 — cioè proprio il caso della promessa al partner.
#      ⚠️ LA PRIMA STESURA MISURAVA UN'ALTRA COSA. Sostituiva la rimozione della chiave con
#      una scrittura a JSON null, e moriva per `stack depth limit exceeded` invece che su
#      T2. Il motivo è strutturale e vale la pena saperlo: la guardia confronta lo stato
#      con il valore ATTESO, quindi se l'azione non raggiunge quello stato, l'update si
#      ripete all'infinito. Morte giusta, bersaglio sbagliato: T2 sarebbe rimasto senza
#      nessun mutante che lo presidia. Questa versione esce PRIMA dell'update, che rompe
#      la difesa senza toccare la coerenza fra guardia e azione.
run_mutante "N1 non tocca i metadata se manca il nickname" "T2 FAIL" "$M" \
  's/^  select p.nickname,$/  if true then return; end if;\n  select p.nickname,/' \
  || vivi=$((vivi+1))

# N2 — via la guardia dal WHERE. È il mutante che prova che la guardia NON è cosmetica:
#      i due trigger scrivono la colonna che li fa scattare, e `update of colonna` scatta
#      sul SET, non sul valore cambiato. Non muore un'asserzione — muore il motore, ed è
#      il modo giusto di morire per questo mutante.
run_mutante "N2 ricorsione senza guardia" "stack depth limit exceeded" "$M" \
  's/^     and u.raw_user_meta_data is distinct from v_nuovo;$/     ;/' || vivi=$((vivi+1))

# N3 — via la faccia B (il trigger su `auth.users`). È il presidio contro chi scrive il
#      claim scavalcando `profiles`: `syncNicknameClaim`, o `PUT /user` chiamato a mano.
#      La nascita continua a funzionare, quindi T1/T2/T3 restano verdi: lo vede solo T5.
run_mutante "N3 nessun presidio sui metadata" "T5 FAIL" "$M" \
  's/^  after update of raw_user_meta_data on auth.users$/  after update of email on auth.users/' \
  || vivi=$((vivi+1))

# N4 — via la faccia A (il trigger su `profiles`). È il caso del completamento profilo
#      dopo il login social, che scrive `profiles` e non sincronizza il nickname. Tutto il
#      resto resta verde: lo vedono T7 e T8.
run_mutante "N4 il claim non segue profiles" "T7 FAIL" "$M" \
  's/^  after insert or update of nickname, country, first_name, last_name on public.profiles$/  after insert or update of city on public.profiles/' \
  || vivi=$((vivi+1))

# N5 — l'allineamento non viene chiamato alla nascita.
#      ⚠️ IL BERSAGLIO È T6, NON T2, e la differenza dice CHI copre davvero cosa — misurato
#      il 2026-07-31, non dedotto. Per chi un profilo ce l'ha (T2: nickname occupato) la
#      faccia A scatta sull'insert in `profiles` e riallinea lo stesso, quindi T2 resta
#      verde. A scoprirsi è l'utente del login SOCIAL (T6): non passa dal ramo
#      `birth_date`, nessun profilo nasce, nessuna faccia A si sveglia — e un
#      `preferred_username` scritto dal provider resterebbe nei metadata per sempre.
#      ⇒ questa chiamata esiste per loro. Il commento in migration lo dice con le stesse
#      parole: se un domani sembrasse codice in più, è questo mutante la risposta.
#      ⚠️ IL RANGE NON È DECORATIVO: la chiamata `perform … allinea_claim_da_profiles_di
#      (new.id);` compare TRE volte, identica — una per faccia più questa. Un sed globale
#      le spegnerebbe tutte e misurerebbe «nessun allineamento da nessuna parte», che è il
#      guasto di N3+N4+N5 insieme e non dice quale dei tre punti presidia cosa. Il range
#      parte dalla chiamata alla pulizia, che nel file esiste solo dentro
#      `handle_new_user`, e isola quindi la terza occorrenza. Stessa cautela dell'M3 della
#      0019, per la stessa ragione.
run_mutante "N5 nessun allineamento alla nascita" "T6 FAIL" "$M" \
  '/perform public.pulisci_metadata_anagrafici_di(new.id);/,$ s/^  perform public.allinea_claim_da_profiles_di(new.id);$/  -- mutante N5/' \
  || vivi=$((vivi+1))

# N6 — RIMOSSO il 2026-07-31, dopo averlo misurato: SOPRAVVIVEVA, e non per una lacuna
#      della suite. Rimetteva `country` nella lista della bonifica, ma il filtro dei claim
#      protetti lo toglie di nuovo — la mutazione non arriva mai a produrre un effetto.
#      È la prova che il filtro fa il suo mestiere, non che T11 sia scoperto: T11 è
#      presidiato da N8b, e il filtro da N11/N12. Rimetterlo qui significherebbe tenere in
#      suite un mutante che non può che sopravvivere, cioè un rosso permanente che col
#      tempo si impara a ignorare.

# N7 — la derivazione TROPPO LARGA: cancella sempre il claim invece di derivarlo. Passa
#      T2, T3, T5, T6, T8 e T10 — cioè sei test su dieci — e spegnerebbe il nickname per
#      TUTTI, che è il motivo per cui la 0017 esiste. Lo vedono T1 e T5b.
#      ⚠️ Come N1, la prima stesura (`when v_nickname is null` → `when true`) moriva di
#      ricorsione per la stessa ragione: l'azione cancellava mentre la guardia continuava
#      a pretendere il valore di `profiles`. Qui invece si spegne la LETTURA, così azione
#      e guardia restano coerenti e a fallire è il test giusto.
run_mutante "N7 la derivazione non legge profiles" "T1 FAIL" "$M" \
  's/^  select p.nickname,$/  select null::text,/' \
  || vivi=$((vivi+1))

# N8 — il trigger della faccia A smette di ascoltare `country`: la derivazione continua a
#      calcolarlo, ma nessuno la sveglia quando il Paese cambia in `profiles`. È il più
#      subdolo dei due lati, perché il valore resta giusto alla nascita e a ogni modifica
#      del nickname — diverge solo per chi cambia il SOLO Paese. Lo vede T13.
run_mutante "N8 il Paese non sveglia la derivazione" "T13 FAIL" "$M" \
  's/^  after insert or update of nickname, country, first_name, last_name on public.profiles$/  after insert or update of nickname, first_name, last_name on public.profiles/' \
  || vivi=$((vivi+1))

# N8b — l'altro lato dello stesso campo: il trigger scatta ma la derivazione non LEGGE più
#       il Paese, quindi la chiave sparisce dai metadata invece di restare vecchia. N8 e
#       N8b sono i due punti che il commento in migration segnala come «da cambiare
#       INSIEME»: un mutante solo non proverebbe che servono entrambi.
run_mutante "N8b la derivazione non legge il Paese" "T11 FAIL" "$M" \
  "s/^         nullif(btrim(p.country), ''),\$/         null::text,/" \
  || vivi=$((vivi+1))

# N9 — via la seconda condizione della guardia, quella che distingue «chiave assente» da
#      «chiave presente con valore JSON null» (`->>` le rende identiche). Il claim non è
#      sbagliato, ma resta una chiave in più nella superficie che UserInfo consegna
#      intera — cioè il problema che la 0019 esiste per ridurre. Lo vede solo T10.
#      ⚠️ IL CRITERIO È UNA REGEX A DUE RAMI, e non per prudenza: misurandolo si è visto
#      che a morire per primo è **T2**, non T10. Senza `strip_nulls`, il nickname scartato
#      in registrazione lascia la chiave presente col valore null — e T2, che controlla la
#      PRESENZA della chiave, è più avanti nella suite di T10 e scatta prima. Morte
#      giusta, rilevatore diverso: entrambi i rami valgono, e accettarli tutti e due tiene
#      il mutante valido anche se un domani l'ordine dei test cambia.
run_mutante "N9 la chiave null resta" "T2 FAIL|T10 FAIL" "$M" \
  's/|| jsonb_strip_nulls(jsonb_build_object(/|| (jsonb_build_object(/' \
  || vivi=$((vivi+1))

# N10 — l'allineamento gira PRIMA della pulizia e PRIMA che l'insert in `profiles` abbia
#       fatto effetto: legge una riga che non c'è ancora e cancella il claim di tutti. È
#       l'errore di ordine, gemello di quello che la 0019 presidia con il suo T7. Lo vede
#       T1, che è l'unico a pretendere un claim PRESENTE dopo una registrazione normale.
# N10 — RIMOSSO il 2026-07-31, dopo due misurazioni. Voleva provare che l'ordine conta:
#       spostare l'allineamento PRIMA dell'insert in `profiles` gli farebbe leggere una
#       riga che non c'è ancora. La prima stesura sopravviveva per un difetto suo
#       (aggiungeva invece di spostare); corretta quella, **sopravvive lo stesso** — e
#       questa volta ha ragione il codice: il trigger della faccia A scatta sull'insert in
#       `profiles` e riallinea subito dopo, quindi l'ordine non è più una difesa.
#       Mutante EQUIVALENTE (README, punto 3) → si toglie, non si adatta la suite.
#       Ciò che resta vero — la chiamata alla nascita serve agli utenti SENZA profilo — è
#       presidiato da N5, che lo misura per la via giusta.

# N11 — via il filtro dei claim protetti, e `name` finisce nella bonifica. È il più
#       pericoloso dei due esiti possibili: `name` NON viene riderivato da nessuno, e se
#       manca il server auth ci mette l'EMAIL dell'account come ripiego — al partner
#       arriverebbe un indirizzo al posto di un nome, senza che si rompa nulla di
#       visibile. Lo vede solo T14.
#       ⚠️ DUE sostituzioni in un sed solo: togliere il filtro senza sporcare la lista non
#       cambierebbe alcun comportamento (il filtro è una difesa in profondità: a liste
#       disgiunte non fa niente), e il mutante misurerebbe il nulla.
# ⚠️ RIMOSSO nella stessa sessione in cui era nato, dopo averlo misurato. Fino a quando
#    `name` era solo PROTETTO, toglierlo dal filtro lo faceva sparire dai metadata e T14 lo
#    vedeva. Da quando `name` è anche DERIVATO (la derivazione lo riscrive), la stessa
#    mutazione non fa più sparire nulla: innesca la contesa fra i due presidi, cioè muore
#    di `stack depth limit exceeded` esattamente come N12 — misurando due volte la stessa
#    cosa. Il caso che presidiava («`name` sparisce ⇒ il server ripiega sull'email») è ora
#    coperto da N13, che lo produce per la via giusta.

# N12 — stesso filtro, altra chiave: `preferred_username` nella bonifica. Qui l'esito NON
#       è un claim perduto ma una RICORSIONE — la pulizia lo toglie, l'allineamento lo
#       rimette da `profiles`, e ognuno dei due UPDATE risveglia l'altro. Le guardie
#       individuali non fermano nulla, perché entrambi trovano sempre qualcosa da fare.
#       In produzione sarebbe uno stack overflow sulla REGISTRAZIONE.
#       È il mutante che ha SCOPERTO il problema (era l'M4 della 0019, che si aspettava un
#       banale «T6 FAIL»), ed è il motivo per cui il filtro esiste.
run_mutante "N12 niente filtro, ricorsione fra i due presidi" "stack depth limit exceeded" "$M" \
  "s/^   where not (k = any (v_protetti));\$/   ;/; s/    'birth_date', 'marketing_consent', 'contact_email'/    'birth_date', 'marketing_consent', 'contact_email', 'preferred_username'/" \
  || vivi=$((vivi+1))

# N13 — `name` viene CANCELLATO anche quando il profilo non c'è: il ramo che lo protegge
#       sparisce e la chiave finisce a JSON null. È il guasto PIÙ pericoloso dell'intera
#       migration, perché non si vede da nessuna parte: il server auth non omette il claim
#       `name`, ci mette l'EMAIL dell'account come ripiego — e per un utente Apple che
#       nasconde la mail, al partner arriva il suo alias privaterelay al posto del nome.
#       Lo vede solo T14, sull'utente social senza profilo.
run_mutante "N13 \`name\` cancellato senza profilo" "T14 FAIL" "$M" \
  's/case when v_nome is null then/case when false then/' || vivi=$((vivi+1))

# N14 — `name` non viene derivato affatto: si torna al buco che questa migration chiude,
#       cioè un claim che chiunque abbia una sessione può scrivere a piacere e che arriva
#       al partner così com'è. T14 resta VERDE (il claim non viene toccato, ed è ciò che
#       quel test pretende): a vederlo sono T14b e T14c.
run_mutante "N14 \`name\` non derivato da profiles" "T14b FAIL" "$M" \
  "s/else jsonb_build_object('name', v_nome) end/else '{}'::jsonb end/" \
  || vivi=$((vivi+1))

# N15 — il trigger ascolta il nome ma non il cognome: il claim si ricompone quando cambia
#       `first_name` e resta indietro quando cambia solo `last_name`. Guasto parziale e
#       quindi difficile da notare a occhio. Lo vede solo T14c.
run_mutante "N15 il cognome non sveglia la derivazione" "T14c FAIL" "$M" \
  's/^  after insert or update of nickname, country, first_name, last_name on public.profiles$/  after insert or update of nickname, country, first_name on public.profiles/' \
  || vivi=$((vivi+1))

echo "----------------------------------------"
if [ "$vivi" -ne 0 ]; then
  echo "${vivi} mutanti NON uccisi — la suite non presidia quanto sembra"
  exit 1
fi
echo "tutti i mutanti uccisi dal test previsto"
