-- TEST migration 0017 — il nickname, e soprattutto: il nickname NON uccide il signup.
--
-- Il cuore della suite è T1. La migration introduce un CHECK su una colonna che viene
-- riempita da un trigger con un valore che arriva dal CLIENT: è la configurazione in cui
-- un campo decorativo e facoltativo può far fallire l'INSERT di `profiles` e quindi la
-- registrazione intera. La clemenza del trigger (valore fuori forma → null, non errore)
-- è la difesa, e T1/T2/T4 sono i test che la presidiano: se qualcuno la toglie
-- credendo di «rendere più rigoroso» il codice, diventano rossi.
--
-- La seconda metà della suite guarda altrove: la 0017 fa `create or replace` di
-- `handle_new_user`, cioè riscrive per intero una funzione che 0011/0013/0014 avevano
-- già corretto. Il 2026-07-29 un corpo copiato dalla migration sbagliata ha regredito in
-- silenzio un fix, con la suite della migration nuova tutta verde: T11 è la rete contro
-- quella classe, dentro questa suite. La rete GRANDE è `run-all.sh`, che dalla 0017 in
-- poi riesegue la coppia 0011 con questa migration in coda.
--
-- ⚠️ `email_confirmed_at` resta al default dello shim: qui non è l'attributo sotto
-- esame (lo è nella 0016) e l'archivio storico non viene mai popolato, quindi nessun
-- aggancio interferisce.
--
-- Prerequisiti: 0001→0016 applicate, poi 0017. Uno dei due shim.
-- Range di id dedicato (`…0400`+).

-- ---------------------------------------------------------------------------
-- T1 (IL CUORE — UN NICKNAME TROPPO LUNGO NON DEVE UCCIDERE LA REGISTRAZIONE).
-- 31 caratteri: fuori dal CHECK `nickname_forma`. Se il trigger propagasse il valore
-- invece di scartarlo, l'INSERT su `profiles` violerebbe il CHECK, `handle_new_user`
-- solleverebbe, e la registrazione fallirebbe — per un campo che nessuno è obbligato a
-- compilare. È la classe di guasto peggiore: si manifesta solo su input strani.
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    insert into auth.users (id, email, raw_user_meta_data)
    values ('00000000-0000-0000-0000-000000000401', 'lungo@esempio.it',
            jsonb_build_object(
              'first_name', 'Nome', 'last_name', 'Lungo',
              'birth_date', '1990-01-01', 'country', 'IT',
              'preferred_username', repeat('a', 31)));
  exception when others then
    raise exception 'T1 FAIL — REGISTRAZIONE UCCISA da un nickname di 31 caratteri (%) — la clemenza del trigger non c''e'' piu''', sqlerrm;
  end;
end $$;

do $$
declare r record;
begin
  select id, nickname, first_name into r from public.profiles
   where id = '00000000-0000-0000-0000-000000000401';

  if r.id is null then
    raise exception 'T1 FAIL: il profilo non e'' nato affatto';
  end if;
  if r.nickname is not null then
    raise exception 'T1 FAIL: un nickname fuori forma e'' stato salvato invece di essere scartato (nickname = %)', r.nickname;
  end if;
  if r.first_name is distinct from 'Nome' then
    raise exception 'T1 FAIL: il profilo e'' nato monco (first_name = %)', coalesce(r.first_name, '<null>');
  end if;
  raise notice 'T1 PASS: un nickname di 31 caratteri viene scartato, la registrazione riesce';
end $$;

-- ---------------------------------------------------------------------------
-- T2 (TROPPO CORTO): un solo carattere. Stesso principio di T1 sull'altro estremo —
-- senza questo, si potrebbe «chiudere» T1 validando solo il limite superiore.
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    insert into auth.users (id, email, raw_user_meta_data)
    values ('00000000-0000-0000-0000-000000000402', 'corto@esempio.it',
            jsonb_build_object(
              'first_name', 'Nome', 'last_name', 'Corto',
              'birth_date', '1990-01-01', 'country', 'IT',
              'preferred_username', 'x'));
  exception when others then
    raise exception 'T2 FAIL — REGISTRAZIONE UCCISA da un nickname di 1 carattere (%)', sqlerrm;
  end;
end $$;

do $$
declare v text;
begin
  select nickname into v from public.profiles
   where id = '00000000-0000-0000-0000-000000000402';
  if v is not null then
    raise exception 'T2 FAIL: un nickname di 1 carattere e'' stato salvato (nickname = %)', v;
  end if;
  raise notice 'T2 PASS: un nickname di 1 carattere viene scartato, la registrazione riesce';
end $$;

-- ---------------------------------------------------------------------------
-- T3 (LEGITTIMO): il caso per cui la migration esiste. Senza questo test, tutti i
-- precedenti sarebbero verdi anche avendo semplicemente scritto `v_nickname := null`.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values ('00000000-0000-0000-0000-000000000403', 'valido@esempio.it',
        jsonb_build_object(
          'first_name', 'Riccardo', 'last_name', 'Valido',
          'birth_date', '1990-01-01', 'country', 'IT',
          'preferred_username', 'RiccardoRAH'));

do $$
declare v text;
begin
  select nickname into v from public.profiles
   where id = '00000000-0000-0000-0000-000000000403';
  if v is distinct from 'RiccardoRAH' then
    raise exception 'T3 FAIL: il nickname valido non e'' arrivato in colonna (nickname = %)', coalesce(v, '<null>');
  end if;
  raise notice 'T3 PASS: un nickname valido finisce in colonna';
end $$;

-- ---------------------------------------------------------------------------
-- T4 (SPAZI AI BORDI — il caso che distingue «pulire» da «rifiutare»). Il CHECK vieta
-- gli spazi ai bordi. Un trigger che validasse SENZA ripulire farebbe fallire l'INSERT
-- su un valore che la persona ha semplicemente incollato: il valore va trimmato e
-- salvato, non scartato e nemmeno propagato così com'è.
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    insert into auth.users (id, email, raw_user_meta_data)
    values ('00000000-0000-0000-0000-000000000404', 'spazi@esempio.it',
            jsonb_build_object(
              'first_name', 'Nome', 'last_name', 'Spazi',
              'birth_date', '1990-01-01', 'country', 'IT',
              'preferred_username', '   Incollato   '));
  exception when others then
    raise exception 'T4 FAIL — REGISTRAZIONE UCCISA da un nickname con spazi ai bordi (%) — manca il btrim prima del CHECK', sqlerrm;
  end;
end $$;

do $$
declare v text;
begin
  select nickname into v from public.profiles
   where id = '00000000-0000-0000-0000-000000000404';
  if v is distinct from 'Incollato' then
    raise exception 'T4 FAIL: gli spazi ai bordi non sono stati ripuliti (nickname = [%])', coalesce(v, '<null>');
  end if;
  raise notice 'T4 PASS: gli spazi ai bordi si ripuliscono, non fanno fallire niente';
end $$;

-- ---------------------------------------------------------------------------
-- T5 (SOLO SPAZI, e STRINGA VUOTA): entrambi significano «non ne voglio uno». Dopo il
-- btrim restano zero caratteri: devono diventare null, non una stringa vuota — che
-- violerebbe il CHECK (0 caratteri, fuori da 2-30) e ucciderebbe l'insert.
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    insert into auth.users (id, email, raw_user_meta_data)
    values ('00000000-0000-0000-0000-000000000405', 'solospazi@esempio.it',
            jsonb_build_object(
              'first_name', 'Nome', 'last_name', 'SoloSpazi',
              'birth_date', '1990-01-01', 'country', 'IT',
              'preferred_username', '     '));

    insert into auth.users (id, email, raw_user_meta_data)
    values ('00000000-0000-0000-0000-000000000406', 'vuoto@esempio.it',
            jsonb_build_object(
              'first_name', 'Nome', 'last_name', 'Vuoto',
              'birth_date', '1990-01-01', 'country', 'IT',
              'preferred_username', ''));
  exception when others then
    raise exception 'T5 FAIL — REGISTRAZIONE UCCISA da un nickname vuoto o di soli spazi (%)', sqlerrm;
  end;
end $$;

do $$
declare n int;
begin
  select count(*) into n from public.profiles
   where id in ('00000000-0000-0000-0000-000000000405',
                '00000000-0000-0000-0000-000000000406')
     and nickname is null;
  if n <> 2 then
    raise exception 'T5 FAIL: nickname vuoto/di soli spazi non e'' diventato null (% righe su 2 corrette)', n;
  end if;
  raise notice 'T5 PASS: vuoto e soli-spazi diventano null, la registrazione riesce';
end $$;

-- ---------------------------------------------------------------------------
-- T6 (CHIAVE ASSENTE — il caso NORMALE, visto che il campo è facoltativo): nessun
-- `preferred_username` nei metadata. È anche il percorso di TUTTE le registrazioni
-- fatte prima di questa migration.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values ('00000000-0000-0000-0000-000000000407', 'assente@esempio.it',
        jsonb_build_object(
          'first_name', 'Nome', 'last_name', 'Assente',
          'birth_date', '1990-01-01', 'country', 'IT'));

do $$
declare r record;
begin
  select id, nickname into r from public.profiles
   where id = '00000000-0000-0000-0000-000000000407';
  if r.id is null then
    raise exception 'T6 FAIL: senza la chiave nickname il profilo non nasce piu''';
  end if;
  if r.nickname is not null then
    raise exception 'T6 FAIL: nickname valorizzato senza che nessuno lo avesse chiesto (%)', r.nickname;
  end if;
  raise notice 'T6 PASS: senza la chiave il nickname resta null e la registrazione e'' normale';
end $$;

-- ---------------------------------------------------------------------------
-- T7 (I BORDI ESATTI, 2 e 30 — cioè: LE DUE COPIE DELLA REGOLA NON DIVERGONO).
-- La forma è «between 2 and 30», estremi inclusi, ed è scritta DUE volte: nel CHECK
-- della colonna e nella clemenza del trigger. La migration lo dice a chiare lettere —
-- «se le due regole divergeranno, a rompersi è la registrazione». Questo è il test che
-- se ne accorge: basta che una delle due si stringa di un carattere perché un valore
-- legittimo superi la clemenza e vada a sbattere sul CHECK.
-- ⚠️ Gli insert stanno DENTRO un blocco che cattura di proposito. Senza, la violazione
-- del CHECK uscirebbe come `ERROR` grezzo di Postgres e il log direbbe solo «violates
-- check constraint»: chi lo legge non saprebbe quale test presidiava cosa. Un mutante
-- ucciso senza nome è un mutante che non insegna niente (successo il 2026-07-30 sulla
-- prima stesura di questa suite, ledger `mutante-che-crasha-rosso-fuori-bersaglio`).
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    insert into auth.users (id, email, raw_user_meta_data)
    values ('00000000-0000-0000-0000-000000000408', 'bordi1@esempio.it',
            jsonb_build_object('first_name', 'Nome', 'last_name', 'Due',
              'birth_date', '1990-01-01', 'country', 'IT',
              'preferred_username', 'ab'));

    insert into auth.users (id, email, raw_user_meta_data)
    values ('00000000-0000-0000-0000-000000000409', 'bordi2@esempio.it',
            jsonb_build_object('first_name', 'Nome', 'last_name', 'Trenta',
              'birth_date', '1990-01-01', 'country', 'IT',
              'preferred_username', repeat('b', 30)));
  exception when others then
    raise exception 'T7 FAIL — LE DUE REGOLE DIVERGONO: un nickname di 2 o 30 caratteri (entrambi legittimi) e'' passato dalla clemenza del trigger ed e'' stato respinto dal CHECK (%) — la registrazione muore su un valore valido', sqlerrm;
  end;
end $$;

do $$
declare r record;
begin
  select
    (select nickname from public.profiles where id = '00000000-0000-0000-0000-000000000408') as due,
    (select nickname from public.profiles where id = '00000000-0000-0000-0000-000000000409') as trenta
  into r;

  if r.due is distinct from 'ab' then
    raise exception 'T7 FAIL: un nickname di 2 caratteri (il minimo ammesso) e'' stato scartato (%)', coalesce(r.due, '<null>');
  end if;
  if r.trenta is distinct from repeat('b', 30) then
    raise exception 'T7 FAIL: un nickname di 30 caratteri (il massimo ammesso) e'' stato scartato (%)', coalesce(r.trenta, '<null>');
  end if;
  raise notice 'T7 PASS: i due bordi della forma, 2 e 30, sono ammessi';
end $$;

-- ---------------------------------------------------------------------------
-- T8 (IL CHECK IN COLONNA ESISTE DAVVERO — e in UPDATE non c'è clemenza).
-- Due cose in un test. Primo: senza il CHECK, T1/T2/T4 sarebbero verdi anche con un
-- trigger che non valida niente — la clemenza non avrebbe nulla da presidiare, e la
-- suite starebbe misurando il nulla. Secondo: la clemenza vive SOLO in
-- `handle_new_user`. Su un UPDATE diretto — cioè quando la persona modifica il proprio
-- profilo dall'app — il CHECK morde e l'operazione fallisce.
-- ⇒ Il form DEVE validare prima di scrivere (`validateNickname`,
--    `src/shared/auth/validation.ts:42`): qui è fissato che senza quella validazione
--    l'utente riceverebbe un errore di database.
-- ---------------------------------------------------------------------------
do $$
declare colpito boolean := false;
begin
  begin
    update public.profiles set nickname = repeat('c', 31)
     where id = '00000000-0000-0000-0000-000000000403';
  exception when check_violation then
    colpito := true;
  end;

  if not colpito then
    raise exception 'T8 FAIL: il CHECK nickname_forma non esiste o non morde in UPDATE — la difesa in profondita'' non c''e''';
  end if;
  raise notice 'T8 PASS: il CHECK esiste e in UPDATE non perdona (il form deve validare prima)';
end $$;

do $$
declare colpito boolean := false;
begin
  begin
    update public.profiles set nickname = '  bordi  '
     where id = '00000000-0000-0000-0000-000000000403';
  exception when check_violation then
    colpito := true;
  end;

  if not colpito then
    raise exception 'T8 FAIL: il CHECK accetta spazi ai bordi in UPDATE — la colonna puo'' contenere valori non ripuliti';
  end if;
  raise notice 'T8b PASS: il CHECK rifiuta anche gli spazi ai bordi';
end $$;

-- ---------------------------------------------------------------------------
-- T9 (NULL SEMPRE AMMESSO): il campo è facoltativo, e deve poter tornare vuoto. Chi ha
-- messo un nickname e cambia idea deve poterlo togliere.
-- ---------------------------------------------------------------------------
do $$
declare v text;
begin
  update public.profiles set nickname = null
   where id = '00000000-0000-0000-0000-000000000403';

  select nickname into v from public.profiles
   where id = '00000000-0000-0000-0000-000000000403';
  if v is not null then
    raise exception 'T9 FAIL: il nickname non si puo'' togliere (nickname = %)', v;
  end if;
  raise notice 'T9 PASS: il nickname si puo'' sempre togliere';
end $$;

-- ---------------------------------------------------------------------------
-- T10 (IL SOCIAL NON PASSA DI QUI): senza `birth_date` nei metadata `handle_new_user`
-- non crea il profilo, anche se il nickname c'è. Il valore non va perso in un errore:
-- semplicemente non c'è ancora un profilo dove metterlo, e lo scriverà l'app.
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    insert into auth.users (id, email, raw_user_meta_data)
    values ('00000000-0000-0000-0000-000000000410', 'social17@esempio.it',
            jsonb_build_object('preferred_username', 'DalSocial'));
  exception when others then
    raise exception 'T10 FAIL: un accesso social con nickname nei metadata fallisce (%)', sqlerrm;
  end;
end $$;

do $$
declare n int;
begin
  select count(*) into n from public.profiles
   where id = '00000000-0000-0000-0000-000000000410';
  if n <> 0 then
    raise exception 'T10 FAIL: il profilo social e'' stato creato dal trigger (attesi 0, trovati %)', n;
  end if;
  raise notice 'T10 PASS: il social non crea profilo, e il nickname nei metadata non rompe niente';
end $$;

-- ---------------------------------------------------------------------------
-- T11 (NON-REGRESSIONE DEL CORPO RISCRITTO — la rete contro l'errore del 2026-07-29).
-- La 0017 fa `create or replace` di `handle_new_user`: se il corpo fosse stato copiato
-- da una migration più vecchia, i fix di 0011/0013/0014 sparirebbero e NESSUN test del
-- nickname se ne accorgerebbe. Qui si esercitano i tre comportamenti che quella
-- funzione deve ancora avere, in un colpo solo:
--   (a) `contact_email` derivato dalla mail dell'account (0011);
--   (b) la guardia Apple Private Relay: un alias non è un recapito (0015 e prima);
--   (c) `consent_events` scritti al signup, con `marketing` solo se prestato.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values ('00000000-0000-0000-0000-000000000411', 'regressione@esempio.it',
        jsonb_build_object(
          'first_name', 'Non', 'last_name', 'Regredito',
          'birth_date', '1990-01-01', 'country', 'IT',
          'marketing_consent', true,
          'preferred_username', 'Integro'));

insert into auth.users (id, email, raw_user_meta_data)
values ('00000000-0000-0000-0000-000000000412', 'xyz789@privaterelay.appleid.com',
        jsonb_build_object(
          'first_name', 'Alias', 'last_name', 'Apple',
          'birth_date', '1990-01-01', 'country', 'IT'));

do $$
declare r record; n_privacy int; n_marketing int;
begin
  select nickname, contact_email into r from public.profiles
   where id = '00000000-0000-0000-0000-000000000411';
  if r.nickname is distinct from 'Integro' then
    raise exception 'T11 FAIL: il nickname non e'' arrivato (%)', coalesce(r.nickname, '<null>');
  end if;
  if r.contact_email is distinct from 'regressione@esempio.it' then
    raise exception 'T11 FAIL (a): il corpo riscritto ha perso il recapito derivato della 0011 (contact_email = %)',
      coalesce(r.contact_email, '<null>');
  end if;

  select contact_email into r.contact_email from public.profiles
   where id = '00000000-0000-0000-0000-000000000412';
  if r.contact_email is not null then
    raise exception 'T11 FAIL (b): il corpo riscritto ha perso la guardia Apple relay — un alias e'' finito in contact_email (%)',
      r.contact_email;
  end if;

  select count(*) into n_privacy from public.consent_events
   where user_id = '00000000-0000-0000-0000-000000000411'
     and purpose = 'privacy_notice' and action = 'granted';
  select count(*) into n_marketing from public.consent_events
   where user_id = '00000000-0000-0000-0000-000000000411'
     and purpose = 'marketing' and action = 'granted';
  if n_privacy <> 1 or n_marketing <> 1 then
    raise exception 'T11 FAIL (c): il corpo riscritto ha perso la registrazione dei consensi (privacy=%, marketing=%)',
      n_privacy, n_marketing;
  end if;

  select count(*) into n_marketing from public.consent_events
   where user_id = '00000000-0000-0000-0000-000000000412' and purpose = 'marketing';
  if n_marketing <> 0 then
    raise exception 'T11 FAIL (c): consenso marketing registrato per chi non l''ha prestato (% eventi)', n_marketing;
  end if;

  raise notice 'T11 PASS: il corpo riscritto conserva recapito derivato, guardia relay e consensi';
end $$;

-- ---------------------------------------------------------------------------
-- T12 (RIESEGUIBILITÀ E SUPERFICIE): la migration gira due volte nel giro di test.
-- Una colonna sola, un CHECK solo, e nessuna funzione nuova raggiungibile dal client.
-- ---------------------------------------------------------------------------
do $$
declare n int;
begin
  select count(*) into n from information_schema.columns
   where table_schema = 'public' and table_name = 'profiles' and column_name = 'nickname';
  if n <> 1 then
    raise exception 'T12 FAIL: % colonne nickname su profiles, attesa 1', n;
  end if;

  select count(*) into n from pg_constraint
   where conrelid = 'public.profiles'::regclass and conname = 'nickname_forma';
  if n <> 1 then
    raise exception 'T12 FAIL: % vincoli nickname_forma dopo la seconda applicazione, atteso 1', n;
  end if;

  if has_function_privilege('authenticated', 'public.handle_new_user()', 'EXECUTE')
     or has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE') then
    raise exception 'T12 FAIL: handle_new_user e'' diventata chiamabile dal client dopo il replace';
  end if;

  select count(*) into n from pg_trigger t
   join pg_class c on c.oid = t.tgrelid
   where not t.tgisinternal and c.relname = 'users' and t.tgname = 'on_auth_user_created';
  if n <> 1 then
    raise exception 'T12 FAIL: % trigger on_auth_user_created, atteso 1', n;
  end if;

  raise notice 'T12 PASS: colonna e vincolo unici, nessuna superficie RPC, trigger unico';
end $$;
