-- TEST migration 0019 — si entra dai 14, e l'anagrafica non resta nei metadata.
--
-- I test che contano davvero sono T2, T7 e T8.
--   · T2 è la ragione per cui questa fase non è «togliere un vincolo»: sotto i 14 si resta
--     FUORI. Se qualcuno cancellasse il CHECK invece di abbassarlo, T1/T3 resterebbero
--     verdi e solo T2 diventerebbe rosso.
--   · T7 pretende che il profilo nasca COMPLETO: la pulizia non deve costare i dati.
--     ⚠️ Precisazione onesta, scoperta scrivendo i mutanti: l'ordine fra pulizia e insert
--     NON è fragile come sembra, perché `handle_new_user` legge i metadata in `v_meta`
--     una volta sola, nel DECLARE — una copia locale che nessun UPDATE su `auth.users`
--     può più toccare. Quella copia è una difesa implicita: chi un domani sostituisse
--     `v_meta->>` con una rilettura di `new.raw_user_meta_data` la perderebbe, e T7 è
--     l'unico test che se ne accorgerebbe.
--   · T8 presidia il punto che regge davvero la bonifica: il trigger AFTER UPDATE. In
--     produzione è probabile che sia LUI a fare il lavoro, perché GoTrue riscrive la riga
--     dopo l'INSERT (discussioni Supabase #20714/#22158) annullando la pulizia di T5.
--     Qui gira Postgres nudo, GoTrue non c'è: T5 e T8 provano i due punti separatamente,
--     ed è l'unico modo per sapere quale dei due è ancora vivo.
--
-- ⚠️ CIÒ CHE QUESTA SUITE NON PUÒ PROVARE, e va detto invece di lasciarlo credere: che in
-- produzione i metadata risultino puliti DOPO il passaggio di GoTrue. Si vede solo con una
-- registrazione vera, dopo l'apply. Qui si prova che entrambe le difese funzionano.
--
-- ⚠️ I profili di prova nascono dal trigger `handle_new_user` (insert in `auth.users` con
-- `birth_date` nei metadata, il marker del form email): stessa strada delle suite 0011-0018.
--
-- Prerequisiti: 0001→0018 applicate, poi 0019. Uno dei due shim.
-- Range di id dedicato (`…0600`+).

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE A — L'ETÀ MINIMA (§1)
-- ═══════════════════════════════════════════════════════════════════════════

-- ---------------------------------------------------------------------------
-- T1: chi ha compiuto 14 anni OGGI entra. Con il vincolo vecchio veniva respinto, ed è
-- il criterio della fase: la data è calcolata, non scritta a mano, perché una data fissa
-- diventa falsa il giorno dopo averla scritta.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000601', 'quattordici@esempio.it',
   jsonb_build_object('first_name', 'Quattordici', 'last_name', 'Esatto',
                      'phone', '+393330000601', 'city', 'Bologna',
                      'province', 'BO', 'country', 'IT',
                      'birth_date', to_char((now()::date - interval '14 years')::date, 'YYYY-MM-DD'),
                      'marketing_consent', false,
                      'preferred_username', 'quattordicenne'));

do $$
begin
  if not exists (select 1 from public.profiles
                  where id = '00000000-0000-0000-0000-000000000601') then
    raise exception 'T1 FAIL: chi ha compiuto 14 anni oggi non riesce a registrarsi';
  end if;
  raise notice 'T1 PASS: a 14 anni compiuti si entra';
end $$;

-- ---------------------------------------------------------------------------
-- T2: chi li compie DOMANI resta fuori. È il test che distingue «soglia abbassata» da
-- «vincolo cancellato», e senza di lui la differenza non si vedrebbe da nessuna parte.
-- L'insert deve FALLIRE: va eseguito dentro un blocco che cattura, altrimenti
-- `ON_ERROR_STOP=1` ferma l'intera suite sul comportamento corretto.
-- ---------------------------------------------------------------------------
do $$
declare v_entrato boolean := false;
begin
  begin
    insert into auth.users (id, email, raw_user_meta_data) values
      ('00000000-0000-0000-0000-000000000602', 'tredici@esempio.it',
       jsonb_build_object('first_name', 'Quasi', 'last_name', 'Quattordici',
                          'phone', '+393330000602', 'city', 'Bologna',
                          'province', 'BO', 'country', 'IT',
                          'birth_date', to_char((now()::date - interval '14 years' + interval '1 day')::date, 'YYYY-MM-DD')));
    v_entrato := true;
  exception when check_violation then
    raise notice 'T2 PASS: sotto i 14 anni non si entra (il vincolo respinge)';
  end;

  if v_entrato then
    raise exception 'T2 FAIL — VINCOLO CANCELLATO INVECE CHE ABBASSATO: si è registrato chi compie 14 anni domani';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- T3: chi ha 30 anni entra come prima. Non-regressione: senza, un vincolo scritto al
-- contrario («almeno 14 anni» diventato «al massimo 14») passerebbe T1 e T2.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000603', 'trenta@esempio.it',
   jsonb_build_object('first_name', 'Trenta', 'last_name', 'Anni',
                      'phone', '+393330000603', 'city', 'Bologna',
                      'province', 'BO', 'country', 'IT',
                      'birth_date', to_char((now()::date - interval '30 years')::date, 'YYYY-MM-DD')));

do $$
begin
  if not exists (select 1 from public.profiles
                  where id = '00000000-0000-0000-0000-000000000603') then
    raise exception 'T3 FAIL: un trentenne non riesce più a registrarsi (vincolo invertito?)';
  end if;
  raise notice 'T3 PASS: chi è ben sopra la soglia entra come prima';
end $$;

-- ---------------------------------------------------------------------------
-- T4: il vincolo vecchio non è rimasto accanto al nuovo. Un `add constraint` senza il
-- `drop` corrispondente lascia DUE check attivi: il più restrittivo continuerebbe a
-- decidere, e T1 sarebbe rosso — ma se un domani i due vivessero su colonne diverse
-- nessuno se ne accorgerebbe. Qui si guarda il catalogo, non il comportamento.
-- ---------------------------------------------------------------------------
do $$
declare v_vecchio int; v_nuovo int;
begin
  select count(*) into v_vecchio from pg_constraint
   where conrelid = 'public.profiles'::regclass and conname = 'adult';
  select count(*) into v_nuovo from pg_constraint
   where conrelid = 'public.profiles'::regclass and conname = 'eta_minima';

  if v_vecchio <> 0 then
    raise exception 'T4 FAIL: il vincolo `adult` (18 anni) è ancora sulla tabella';
  end if;
  if v_nuovo <> 1 then
    raise exception 'T4 FAIL: `eta_minima` presente % volte, atteso 1', v_nuovo;
  end if;
  raise notice 'T4 PASS: un solo vincolo di età, ed è quello nuovo';
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE B — LA BONIFICA DEI METADATA (§2)
-- ═══════════════════════════════════════════════════════════════════════════

-- ---------------------------------------------------------------------------
-- T5: dopo la nascita, l'anagrafica non è più nei metadata. È la superficie che UserInfo
-- consegna INTERA a chi ha lo scope `profile`: finché quelle chiavi restano lì, sono
-- consegnabili a un partner.
-- (Usa il profilo di T1, già nato.)
--
-- ⚠️ `country` NON è più in questo elenco dal 2026-07-31, e non è una svista: la
-- **migration 0020** lo esclude dalla bonifica per decisione di Riccardo — il modulo del
-- partner lo chiede come obbligatorio, quindi lo raccoglierebbe comunque e tenerlo fuori
-- costava loro un campo da richiedere di nuovo. La chiave non è stata persa: è ora
-- presidiata al rovescio dal **T11 della suite 0020**, che pretende che RESTI. Se un
-- domani la 0020 venisse tolta, questa riga va rimessa com'era.
-- (`tests/run-all.sh` mette sempre la 0020 in coda a questa coppia, per questo motivo.)
-- ---------------------------------------------------------------------------
do $$
declare v_rimaste text[];
begin
  select array_agg(k order by k) into v_rimaste
    from auth.users u,
         lateral jsonb_object_keys(u.raw_user_meta_data) k
   where u.id = '00000000-0000-0000-0000-000000000601'
     and k in ('first_name','last_name','phone','city','province',
               'birth_date','marketing_consent','contact_email');

  if v_rimaste is not null then
    raise exception 'T5 FAIL: l''anagrafica è rimasta nei metadata dopo la registrazione: %', v_rimaste;
  end if;
  raise notice 'T5 PASS: nessuna chiave anagrafica nei metadata dopo la nascita del profilo';
end $$;

-- ---------------------------------------------------------------------------
-- T6: i due claim OIDC NON vengono portati via dalla pulizia. `name` e
-- `preferred_username` sono l'unica ragione per cui i metadata esistono nel nostro
-- disegno: una pulizia troppo larga spegnerebbe il nickname sui siti dei partner senza
-- rompere niente di visibile da qui.
-- ---------------------------------------------------------------------------
do $$
declare v_meta jsonb;
begin
  select raw_user_meta_data into v_meta from auth.users
   where id = '00000000-0000-0000-0000-000000000601';

  if not (v_meta ? 'preferred_username') then
    raise exception 'T6 FAIL: la pulizia ha portato via `preferred_username` — il claim del nickname non arriverebbe più al partner';
  end if;
  if v_meta->>'preferred_username' <> 'quattordicenne' then
    raise exception 'T6 FAIL: `preferred_username` alterato (%)', v_meta->>'preferred_username';
  end if;
  raise notice 'T6 PASS: i claim OIDC restano nei metadata';
end $$;

-- ---------------------------------------------------------------------------
-- T7: il profilo è nato COMPLETO. Se la pulizia girasse PRIMA dell'insert, il profilo
-- nascerebbe con i campi vuoti e nessun altro test se ne accorgerebbe: T5 sarebbe verde
-- (i metadata sono puliti!), T1 pure (la riga esiste!). È il test dell'ORDINE.
-- ---------------------------------------------------------------------------
do $$
declare r public.profiles;
begin
  select * into r from public.profiles
   where id = '00000000-0000-0000-0000-000000000601';

  if r.first_name is distinct from 'Quattordici'
     or r.last_name is distinct from 'Esatto'
     or r.phone is distinct from '+393330000601'
     or r.city is distinct from 'Bologna'
     or r.province is distinct from 'BO'
     or r.birth_date is distinct from (now()::date - interval '14 years')::date then
    raise exception 'T7 FAIL — PULIZIA PRIMA DEL CONSUMO: il profilo è nato incompleto (nome=%, tel=%, città=%, prov=%, nascita=%)',
      coalesce(r.first_name,'<null>'), coalesce(r.phone,'<null>'),
      coalesce(r.city,'<null>'), coalesce(r.province,'<null>'), coalesce(r.birth_date::text,'<null>');
  end if;
  if r.nickname is distinct from 'quattordicenne' then
    raise exception 'T7 FAIL: il nickname non è arrivato in colonna (%)', coalesce(r.nickname,'<null>');
  end if;
  raise notice 'T7 PASS: il profilo è nato completo — la pulizia è avvenuta DOPO il consumo';
end $$;

-- ---------------------------------------------------------------------------
-- T8: il presidio vero. Qualcuno rimette le chiavi con un UPDATE — che è ciò che fa
-- GoTrue quando riscrive la riga, e ciò che farebbe un secondo `signUp` sullo stesso
-- indirizzo non confermato. Devono sparire di nuovo, senza che nessuno le rimuova a mano.
-- ---------------------------------------------------------------------------
update auth.users
   set raw_user_meta_data = raw_user_meta_data
       || jsonb_build_object('first_name', 'Rientrata', 'phone', '+393339999999',
                             'birth_date', '2000-01-01')
 where id = '00000000-0000-0000-0000-000000000601';

do $$
declare v_meta jsonb;
begin
  select raw_user_meta_data into v_meta from auth.users
   where id = '00000000-0000-0000-0000-000000000601';

  if v_meta ?| array['first_name','phone','birth_date'] then
    raise exception 'T8 FAIL — PRESIDIO ASSENTE: le chiavi rimesse con un UPDATE sono restate (%)', v_meta;
  end if;
  if not (v_meta ? 'preferred_username') then
    raise exception 'T8 FAIL: il giro di pulizia ha portato via anche i claim';
  end if;
  raise notice 'T8 PASS: le chiavi rimesse da un UPDATE vengono ripulite dal trigger';
end $$;

-- ---------------------------------------------------------------------------
-- T9: nessuna ricorsione infinita, e nessun danno collaterale. Il trigger aggiorna la
-- stessa colonna che lo fa scattare: la guardia deve fermarlo al secondo giro. Se non
-- ci fosse, questo UPDATE morirebbe su «stack depth limit exceeded» — e siccome un
-- UPDATE di soli claim è la cosa più comune che l'app fa (`updateUser({data:{name}})`),
-- sarebbe l'app a smettere di funzionare, non i test.
-- ---------------------------------------------------------------------------
update auth.users
   set raw_user_meta_data = raw_user_meta_data || jsonb_build_object('name', 'Nome Nuovo')
 where id = '00000000-0000-0000-0000-000000000601';

do $$
declare v_meta jsonb;
begin
  select raw_user_meta_data into v_meta from auth.users
   where id = '00000000-0000-0000-0000-000000000601';

  -- ⚠️ IL VALORE ATTESO È CAMBIATO con la **migration 0020**, e il test resta pieno.
  -- Prima si pretendeva di ritrovare `Nome Nuovo`: `name` era una copia che il client
  -- scriveva e nessuno controllava. Dalla 0020 `name` è DERIVATO da `profiles`, quindi un
  -- valore scritto a mano viene riportato a quello del profilo — ed è il punto: il T14b
  -- della suite 0020 pretende esattamente questo, perché senza, chiunque abbia una
  -- sessione potrebbe comparire sulle liste del partner con un nome non suo.
  -- Ciò che questo test presidia — «aggiornare i claim NON innesca ricorsione» — è
  -- intatto: se la catena di trigger non terminasse, qui non arriveremmo affatto.
  if v_meta->>'name' is distinct from 'Quattordici Esatto' then
    raise exception 'T9 FAIL: dopo un aggiornamento del solo claim `name` il valore non è quello derivato da `profiles` (%)', v_meta;
  end if;
  raise notice 'T9 PASS: aggiornare i claim non innesca ricorsione, e `name` torna quello del profilo';
end $$;

-- ---------------------------------------------------------------------------
-- T10: il backfill. Le righe nate PRIMA di questa migration non passano da nessun
-- trigger: se la pulizia non le raggiungesse, resterebbero esposte per sempre — ed è il
-- caso che nessuno verifica, perché «da adesso funziona».
-- Si ricostruisce lo stato pre-migration disattivando i due trigger (l'unico modo di
-- avere una riga sporca in un database dove la migration è già passata), poi si chiama la
-- STESSA funzione che il backfill chiama. Non una copia della sua query: la funzione.
-- ---------------------------------------------------------------------------
alter table auth.users disable trigger on_auth_user_created;
alter table auth.users disable trigger on_auth_user_metadata_pulizia;

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000604', 'vecchia@esempio.it',
   jsonb_build_object('first_name', 'Nata', 'last_name', 'Prima',
                      'phone', '+393330000604', 'city', 'Bologna',
                      'birth_date', '1980-05-05', 'marketing_consent', true,
                      'name', 'Nata Prima', 'preferred_username', 'anziana'));

alter table auth.users enable trigger on_auth_user_created;
alter table auth.users enable trigger on_auth_user_metadata_pulizia;

do $$
declare v_meta jsonb;
begin
  select raw_user_meta_data into v_meta from auth.users
   where id = '00000000-0000-0000-0000-000000000604';
  if not (v_meta ? 'first_name') then
    raise exception 'T10 SETUP FAIL: la riga sporca non è sporca — il test sarebbe vacuo';
  end if;

  perform public.pulisci_metadata_anagrafici_di('00000000-0000-0000-0000-000000000604');

  select raw_user_meta_data into v_meta from auth.users
   where id = '00000000-0000-0000-0000-000000000604';

  if v_meta ?| array['first_name','last_name','phone','city','birth_date','marketing_consent'] then
    raise exception 'T10 FAIL: il backfill non ripulisce le righe preesistenti (%)', v_meta;
  end if;
  if v_meta->>'name' is distinct from 'Nata Prima' then
    raise exception 'T10 FAIL: il backfill ha portato via il claim `name` (%)', v_meta;
  end if;
  -- ⚠️ `preferred_username` NON è più fra i claim che ci si aspetta di ritrovare qui, e
  -- non è una regressione: dalla **migration 0020** quel claim è DERIVATO da
  -- `public.profiles`, e questa riga di prova nasce con i trigger disabilitati, quindi un
  -- profilo non ce l'ha. Appena la pulizia qui sopra tocca i metadata, il presidio della
  -- 0020 si sveglia e toglie un claim che non ha nulla dietro — che è esattamente il suo
  -- mestiere (T6 della suite 0020 lo pretende).
  -- Il test non ha perso copertura: la domanda «il backfill porta via i claim?» resta, ed
  -- è presidiata da `name`, che nessuno derivà. Se un domani la 0020 venisse tolta, qui va
  -- rimessa la condizione su `preferred_username` (`tests/run-all.sh` mette sempre la 0020
  -- in coda a questa coppia, per questo motivo).
  if v_meta ? 'preferred_username' then
    raise exception 'T10 FAIL: un claim senza profilo dietro è sopravvissuto al giro dei presidi (%)', v_meta;
  end if;
  raise notice 'T10 PASS: le righe preesistenti vengono ripulite, `name` resta, il claim derivato senza profilo no';
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE C — I DUE DIFETTI EREDITATI DALLA 0016 (§3 e §4)
-- ═══════════════════════════════════════════════════════════════════════════

-- ---------------------------------------------------------------------------
-- T11 (§3): un CHECK futuro su una colonna dell'anagrafica non deve impedire alla persona
-- di CAMBIARE INDIRIZZO EMAIL. Lo scenario è quello scritto nella 0016 e mai testato:
-- i valori del backfill vengono da un archivio importato di qualità ignota; il giorno in
-- cui su `phone` comparisse un vincolo, l'errore risalirebbe fino all'`update auth.users
-- set email` che ha fatto scattare il trigger.
-- Qui il CHECK viene aggiunto per davvero, e poi tolto: lasciarlo cambierebbe il mondo
-- dei test successivi.
--
-- ⚠️ L'ORDINE DI QUESTE QUATTRO ISTRUZIONI NON È INDIFFERENTE, e la prima stesura di
-- questo test è morta proprio lì: mettendo la riga d'archivio PRIMA del profilo, il
-- backfill avveniva già alla nascita (utente confermato ⇒ ramo A della 0016), il profilo
-- nasceva col telefono dell'archivio, e l'`add constraint` falliva su una riga esistente
-- — «check constraint is violated by some row», prima ancora di arrivare al cambio email.
-- La riga d'archivio deve comparire DOPO che il profilo esiste: così l'unica occasione di
-- scriverla in colonna resta il cambio indirizzo, che è ciò che il test misura.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data)
values ('00000000-0000-0000-0000-000000000611', 'vecchia611@esempio.it', now(),
        jsonb_build_object('first_name', 'Cambio', 'last_name', 'Indirizzo'));

-- Profilo a mano (niente `birth_date` nei metadata ⇒ il trigger non lo crea), con
-- `contact_email` uguale alla mail dell'account: è la condizione perché il §4 riconosca
-- il recapito DERIVATO e prosegua fino al ramo della rivendicazione.
insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values ('00000000-0000-0000-0000-000000000611', 'Cambio', 'Indirizzo',
        null, null, null, 'IT', '1985-03-03', now(), 'vecchia611@esempio.it');

insert into public.legacy_contacts (id, email_norm, phone, city, country, source)
values ('00000000-0000-0000-0000-000000000610', 'vecchia611@esempio.it',
        'TELEFONO-CHE-IL-CHECK-RIFIUTA', 'Rimini', 'IT', 'access');

alter table public.profiles
  add constraint check_futuro_su_phone
  check (phone is null or phone not like 'TELEFONO-CHE-IL-CHECK-RIFIUTA%');

do $$
declare v_email text;
begin
  begin
    update auth.users set email = 'nuova611@esempio.it'
     where id = '00000000-0000-0000-0000-000000000611';
  exception when others then
    raise exception 'T11 FAIL — CAMBIO EMAIL BLOCCATO: un CHECK su `phone` impedisce di cambiare indirizzo (%)', sqlerrm;
  end;

  select email into v_email from auth.users
   where id = '00000000-0000-0000-0000-000000000611';
  if v_email is distinct from 'nuova611@esempio.it' then
    raise exception 'T11 FAIL: il cambio indirizzo non ha avuto effetto (%)', coalesce(v_email,'<null>');
  end if;

  -- E il recapito derivato ha comunque seguito l'account: il blocco che lo sposta è
  -- SEPARATO da quello del backfill, quindi il fallimento del secondo non deve portarsi
  -- via il primo. Senza questo controllo, «non è esploso» sarebbe verde anche se la
  -- guardia avesse spento l'intera funzione.
  if (select contact_email from public.profiles
       where id = '00000000-0000-0000-0000-000000000611') is distinct from 'nuova611@esempio.it' then
    raise exception 'T11 FAIL: il recapito derivato non ha seguito il cambio indirizzo';
  end if;

  -- ⚠️ COSA SI PERDE, ed è giusto saperlo: il blocco con EXCEPTION è una
  -- sotto-transazione, quindi l'errore sul backfill annulla ANCHE la rivendicazione fatta
  -- due righe sopra (`claimed_by` torna null). Il fix compra «la persona può cambiare
  -- indirizzo», non «la rivendicazione sopravvive lo stesso»: è il compromesso dichiarato
  -- nella 0016 per il gemello, e vale identico qui.
  if (select phone from public.profiles
       where id = '00000000-0000-0000-0000-000000000611') is not null then
    raise exception 'T11 FAIL: il telefono che il CHECK rifiuta è finito in colonna';
  end if;
  raise notice 'T11 PASS: un CHECK sull''anagrafica non blocca il cambio di indirizzo';
end $$;

alter table public.profiles drop constraint check_futuro_su_phone;

-- ---------------------------------------------------------------------------
-- T12: superficie. Le due funzioni nuove non devono essere chiamabili da `anon` o
-- `authenticated`: `pulisci_metadata_anagrafici_di` scrive su `auth.users`, ed è
-- `security definer` — esposta, sarebbe un modo per far scrivere il database a chiunque.
-- ---------------------------------------------------------------------------
do $$
declare n int;
begin
  select count(*) into n
    from pg_proc p
   where p.pronamespace = 'public'::regnamespace
     and p.proname in ('pulisci_metadata_anagrafici', 'pulisci_metadata_anagrafici_di')
     and (has_function_privilege('anon', p.oid, 'EXECUTE')
          or has_function_privilege('authenticated', p.oid, 'EXECUTE'));
  if n <> 0 then
    raise exception 'T12 FAIL: % funzioni di pulizia sono chiamabili dal client', n;
  end if;

  -- ⚠️ SEI, non cinque, dal 2026-07-31: la **migration 0020** aggiunge
  -- `on_auth_user_metadata_claim_allineamento`, che deriva i claim da `public.profiles`.
  -- Il numero è scritto a mano di proposito — è un INVENTARIO: se un domani ne comparisse
  -- uno che nessuno ha deciso, questo test è l'unico posto dove si vedrebbe. Chi aggiunge
  -- un trigger su `auth.users` aggiorna questa riga E l'elenco nel messaggio, così il
  -- prossimo che legge sa quali sono i sei attesi.
  select count(*) into n from pg_trigger
   where tgrelid = 'auth.users'::regclass and not tgisinternal;
  if n <> 6 then
    raise exception 'T12 FAIL: % trigger su auth.users, attesi 6 (nascita, conferma, cambio email, oblio, pulizia metadata, allineamento claim)', n;
  end if;
  raise notice 'T12 PASS: nessuna superficie RPC, sei trigger su auth.users';
end $$;

-- ---------------------------------------------------------------------------
-- T13 (§4 — DEVE RESTARE ULTIMO): senza `public.legacy_contacts`, una REGISTRAZIONE deve
-- comunque riuscire. Prima della 0019 non riusciva: `claim_legacy_contact` dichiarava una
-- variabile di tipo `public.legacy_contacts`, un tipo composito che si risolve alla
-- COMPILAZIONE della funzione — cioè prima che qualunque EXCEPTION possa intervenire.
-- Dopo un rollback della 0012, nessuno avrebbe più potuto registrarsi.
-- ⚠️ È il percorso che la suite della 0016 SCHIVA di proposito (il suo T14 evita di far
-- nascere profili dopo il drop, e testa la conferma): finché non esisteva questo test,
-- il difetto non poteva essere visto da nessuno.
--
-- 🔴 E NON BASTA IL DROP: serve una SESSIONE NUOVA, verificato dal vivo il 2026-07-30
-- perché il mutante che rimette il tipo composito sopravviveva. Un tipo composito si
-- risolve quando PL/pgSQL compila la funzione, e la compilazione è messa in cache **per
-- sessione**: in una connessione che ha già eseguito la funzione, il tipo resta risolto
-- anche dopo che la tabella è sparita, e la guardia `undefined_table` sembra funzionare.
-- Dalla connessione successiva arriva invece `type "legacy_contacts" does not exist`
-- alla compilazione — cioè, in produzione, dal primo client che si collega dopo.
-- Il `\c` qui sotto è quella connessione nuova, ed è la differenza fra un test che
-- presidia e un test che si autoconvince.
-- ---------------------------------------------------------------------------
drop table public.legacy_contacts cascade;
\c postgres

do $$
begin
  begin
    insert into auth.users (id, email, raw_user_meta_data) values
      ('00000000-0000-0000-0000-000000000620', 'senzaarchivio@esempio.it',
       jsonb_build_object('first_name', 'Senza', 'last_name', 'Archivio',
                          'phone', '+393330000620', 'city', 'Bologna',
                          'province', 'BO', 'country', 'IT',
                          'birth_date', '1995-06-06'));
  exception when others then
    raise exception 'T13 FAIL: senza legacy_contacts la registrazione fallisce (%) — nessuno potrebbe più iscriversi', sqlerrm;
  end;

  if not exists (select 1 from public.profiles
                  where id = '00000000-0000-0000-0000-000000000620') then
    raise exception 'T13 FAIL: la registrazione non ha creato il profilo';
  end if;
  raise notice 'T13 PASS: senza la tabella dell''archivio ci si registra comunque';
end $$;
