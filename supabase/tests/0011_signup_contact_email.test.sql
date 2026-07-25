-- TEST migration 0011 — contact_email alla nascita del profilo. Assert espliciti, mai vacui.
--
-- Il test NON si limita a rileggere il sorgente della funzione (direbbe solo che la
-- migration ha scritto ciò che dice di scrivere): fa nascere utenti veri e guarda la
-- riga che ne esce. Le tre metà che contano sono l'asse negativo — che l'alias Apple
-- NON venga scritto, che il social continui a non creare profili, e che i campi
-- arrivati con la 0007 (country, province estera) non siano stati persi nel replace.
--
-- Prerequisiti: 0001→0010 applicate, poi 0011. Uno dei due shim (permissive o
-- restrictive): la 0011 non concede grant, quindi l'esito deve essere identico.

-- ---------------------------------------------------------------------------
-- T1: registrazione EMAIL/PASSWORD → contact_email = la mail dell'account.
-- È il buco che la migration chiude: prima la colonna restava null.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000c1',
  'mario@esempio.it',
  jsonb_build_object(
    'first_name', 'Mario', 'last_name', 'Rossi',
    'phone', '+393331234567', 'city', 'Roma', 'province', 'RM',
    'country', 'IT', 'birth_date', '1990-01-01'
  )
);

do $$
declare v text;
begin
  select contact_email into v from public.profiles
  where id = '00000000-0000-0000-0000-0000000000c1';
  if v is distinct from 'mario@esempio.it' then
    raise exception 'T1 FAIL: contact_email = %, atteso mario@esempio.it', coalesce(v, '<null>');
  end if;
  raise notice 'T1 PASS: la mail dell''account finisce in contact_email';
end $$;

-- ---------------------------------------------------------------------------
-- T2: se il client manda contact_email nei metadati, VINCE quella.
-- (Il coalesce esiste perché un giorno il form potrebbe chiederla esplicita.)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000c2',
  'account@esempio.it',
  jsonb_build_object(
    'first_name', 'Anna', 'last_name', 'Bianchi',
    'phone', '+393331234568', 'city', 'Milano', 'province', 'MI',
    'country', 'IT', 'birth_date', '1985-05-05',
    'contact_email', 'scelta@esempio.it'
  )
);

do $$
declare v text;
begin
  select contact_email into v from public.profiles
  where id = '00000000-0000-0000-0000-0000000000c2';
  if v is distinct from 'scelta@esempio.it' then
    raise exception 'T2 FAIL: contact_email = %, atteso scelta@esempio.it', coalesce(v, '<null>');
  end if;
  raise notice 'T2 PASS: la mail scelta dal client ha la precedenza';
end $$;

-- ---------------------------------------------------------------------------
-- T3 (ASSE NEGATIVO, il più importante): un alias Apple Private Relay NON deve
-- finire in contact_email. Scriverlo renderebbe il profilo «completo» con un
-- indirizzo che non è quello della persona, e spegnerebbe il sollecito che serve
-- proprio a raccogliere quello vero.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000c3',
  'abc123xyz@privaterelay.appleid.com',
  jsonb_build_object(
    'first_name', 'Luca', 'last_name', 'Verdi',
    'phone', '+393331234569', 'city', 'Torino', 'province', 'TO',
    'country', 'IT', 'birth_date', '1992-02-02'
  )
);

do $$
declare v text;
begin
  select contact_email into v from public.profiles
  where id = '00000000-0000-0000-0000-0000000000c3';
  if v is not null then
    raise exception 'T3 FAIL: contact_email = %, atteso null (alias relay)', v;
  end if;
  raise notice 'T3 PASS: l''alias Apple non viene scritto come recapito';
end $$;

-- ---------------------------------------------------------------------------
-- T4 (NON-REGRESSIONE sul replace): country e la provincia estera arrivano dalla
-- 0007. Ripartire dal corpo della 0004 li avrebbe cancellati, e con country NOT
-- NULL ogni registrazione sarebbe fallita. Qui si verifica che siano ancora vivi.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000c4',
  'pierre@exemple.fr',
  jsonb_build_object(
    'first_name', 'Pierre', 'last_name', 'Dupont',
    'phone', '+33123456789', 'city', 'Parigi', 'province', '',
    'country', 'FR', 'birth_date', '1980-03-03'
  )
);

do $$
declare r record;
begin
  select country, province, contact_email into r from public.profiles
  where id = '00000000-0000-0000-0000-0000000000c4';
  if r.country is distinct from 'FR' then
    raise exception 'T4 FAIL: country = %, atteso FR', coalesce(r.country, '<null>');
  end if;
  if r.province is not null then
    raise exception 'T4 FAIL: province = %, attesa null per l''estero', r.province;
  end if;
  if r.contact_email is distinct from 'pierre@exemple.fr' then
    raise exception 'T4 FAIL: contact_email = %', coalesce(r.contact_email, '<null>');
  end if;
  raise notice 'T4 PASS: country e provincia estera sopravvivono al replace';
end $$;

-- ---------------------------------------------------------------------------
-- T5 (NON-REGRESSIONE): il SOCIAL non porta `birth_date` → nessun profilo creato
-- dal trigger (lo crea l'app da sessione attiva). Se questo assert cade, il
-- trigger ha iniziato a creare profili senza consenso raccolto: buco Art.7.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000c5',
  'social@esempio.it',
  jsonb_build_object('name', 'Social User')
);

do $$
declare n int;
begin
  select count(*) into n from public.profiles
  where id = '00000000-0000-0000-0000-0000000000c5';
  if n <> 0 then
    raise exception 'T5 FAIL: il trigger ha creato % profili per un signup social', n;
  end if;
  raise notice 'T5 PASS: il social resta fuori dal trigger';
end $$;

-- ---------------------------------------------------------------------------
-- T6: la superficie RPC resta chiusa. La 0006 revoca EXECUTE da anon/authenticated;
-- il replace non tocca i permessi (doc PostgreSQL), ma la 0011 li ri-revoca per
-- essere autonoma. Qui si verifica l'ESITO, non l'intenzione.
-- ---------------------------------------------------------------------------
do $$
declare v boolean;
begin
  foreach v in array array[
    has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE'),
    has_function_privilege('authenticated', 'public.handle_new_user()', 'EXECUTE')
  ] loop
    if v then
      raise exception 'T6 FAIL: EXECUTE su handle_new_user è ancora concesso';
    end if;
  end loop;
  raise notice 'T6 PASS: nessun EXECUTE per anon/authenticated';
end $$;

-- ---------------------------------------------------------------------------
-- T7: la migration è RIESEGUIBILE. Il runner la concatena una seconda volta prima
-- di arrivare qui (con ON_ERROR_STOP lo script sarebbe già morto); qui si verifica
-- che il secondo giro non abbia lasciato DUE trigger sulla stessa tabella, che
-- farebbe partire l'insert del profilo due volte.
-- ---------------------------------------------------------------------------
do $$
declare n int;
begin
  select count(*) into n from pg_trigger
  where tgrelid = 'auth.users'::regclass
    and tgname = 'on_auth_user_created'
    and not tgisinternal;
  if n <> 1 then
    raise exception 'T7 FAIL: % trigger on_auth_user_created, atteso 1', n;
  end if;
  raise notice 'T7 PASS: un solo trigger dopo la riesecuzione';
end $$;

-- Pulizia: le righe di prova non devono sopravvivere al test. I profili scendono
-- per cascata (profiles.id references auth.users on delete cascade, 0001).
delete from auth.users where id in (
  '00000000-0000-0000-0000-0000000000c1',
  '00000000-0000-0000-0000-0000000000c2',
  '00000000-0000-0000-0000-0000000000c3',
  '00000000-0000-0000-0000-0000000000c4',
  '00000000-0000-0000-0000-0000000000c5'
);

select 'ALL TESTS PASS' as esito;
