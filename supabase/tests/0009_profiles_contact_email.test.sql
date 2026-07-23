-- TEST migration 0009 — profiles.contact_email. Assert espliciti, mai vacui.
-- 0009 non concede grant (solo colonna + check): è grant-agnostica, quindi il test
-- opera a livello superuser e dà lo STESSO esito coi due shim (è ciò che prova che
-- la migration non dipende dai default privileges del progetto). La RLS di profiles
-- NON è testata qui: sotto lo shim restrittivo profiles non ha privilegi client
-- (grant ereditati, item differito "finestra dedicata") → un test RLS fallirebbe per
-- privilegio mancante, non per il merito di 0009.

-- Setup: un utente + profilo (contact_email non fornito → default null).
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000a1');
insert into public.profiles (id, first_name, last_name, phone, city, province, birth_date, privacy_consent_at)
values
  ('00000000-0000-0000-0000-0000000000a1','Ada','Test','111','Milano','MI','1990-01-01', now());

-- T1: la colonna esiste, è nullable e ha default null (nessun rewrite/backfill).
do $$
declare v_nullable text; v_default text; v_type text;
begin
  select is_nullable, column_default, data_type into v_nullable, v_default, v_type
  from information_schema.columns
  where table_schema='public' and table_name='profiles' and column_name='contact_email';
  if v_nullable is null then raise exception 'T1 FAIL: colonna contact_email assente'; end if;
  if v_nullable <> 'YES' then raise exception 'T1 FAIL: contact_email non nullable (%)', v_nullable; end if;
  if v_default is not null then raise exception 'T1 FAIL: default inatteso (%)', v_default; end if;
  if v_type <> 'text' then raise exception 'T1 FAIL: tipo % invece di text (rewrite risk)', v_type; end if;
  raise notice 'T1 PASS: contact_email text nullable, default null';
end $$;

-- T2: il profilo appena creato ha contact_email null (nessun valore imposto).
do $$
declare v text;
begin
  select contact_email into v from public.profiles where id = '00000000-0000-0000-0000-0000000000a1';
  if v is not null then raise exception 'T2 FAIL: contact_email non è null sul profilo esistente (%)', v; end if;
  raise notice 'T2 PASS: profilo esistente con contact_email null';
end $$;

-- T3: un'email valida è accettata.
update public.profiles set contact_email = 'contatto@rise.it'
where id = '00000000-0000-0000-0000-0000000000a1';
do $$
declare v text;
begin
  select contact_email into v from public.profiles where id = '00000000-0000-0000-0000-0000000000a1';
  if v <> 'contatto@rise.it' then raise exception 'T3 FAIL: email valida non salvata (%)', v; end if;
  raise notice 'T3 PASS: email valida accettata';
end $$;

-- T4: un valore palesemente non-email è RIFIUTATO dal check (rumorosamente).
do $$
begin
  begin
    update public.profiles set contact_email = 'non-una-email'
    where id = '00000000-0000-0000-0000-0000000000a1';
    raise exception 'T4 FAIL: valore non-email accettato';
  exception when check_violation then
    raise notice 'T4 PASS: check rifiuta il non-email';
  end;
end $$;

-- T4b: anche un'email con spazio interno è rifiutata (il regex esclude \s).
do $$
begin
  begin
    update public.profiles set contact_email = 'a b@rise.it'
    where id = '00000000-0000-0000-0000-0000000000a1';
    raise exception 'T4b FAIL: email con spazio accettata';
  exception when check_violation then
    raise notice 'T4b PASS: check rifiuta lo spazio interno';
  end;
end $$;

-- T5: tornare a null è ammesso (l'utente svuota il campo).
update public.profiles set contact_email = null
where id = '00000000-0000-0000-0000-0000000000a1';
do $$
declare v text;
begin
  select contact_email into v from public.profiles where id = '00000000-0000-0000-0000-0000000000a1';
  if v is not null then raise exception 'T5 FAIL: null non accettato (%)', v; end if;
  raise notice 'T5 PASS: null ammesso';
end $$;

-- T6: un insert con contact_email valido in un colpo solo passa.
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000000a2');
insert into public.profiles (id, first_name, last_name, phone, city, province, birth_date, privacy_consent_at, contact_email)
values ('00000000-0000-0000-0000-0000000000a2','Bea','Test','222','Roma','RM','1990-01-01', now(), 'bea@rise.it');
do $$
declare v text;
begin
  select contact_email into v from public.profiles where id = '00000000-0000-0000-0000-0000000000a2';
  if v <> 'bea@rise.it' then raise exception 'T6 FAIL: insert con contact_email non riuscito (%)', v; end if;
  raise notice 'T6 PASS: insert con contact_email valido';
end $$;

-- T7: la migration è RIESEGUIBILE. Il runner concatena 0009 una seconda volta prima
-- di arrivare qui: se `add column`/`add constraint` non fossero protetti, lo script
-- sarebbe già morto con ON_ERROR_STOP. Conta che non ci sia UN check duplicato né
-- una colonna doppia.
do $$
declare n int;
begin
  select count(*) into n from information_schema.columns
  where table_schema='public' and table_name='profiles' and column_name='contact_email';
  if n <> 1 then raise exception 'T7 FAIL: % colonne contact_email, attesa 1', n; end if;

  select count(*) into n from pg_constraint
  where conname = 'profiles_contact_email_chk' and conrelid = 'public.profiles'::regclass;
  if n <> 1 then raise exception 'T7 FAIL: % check profiles_contact_email_chk, atteso 1', n; end if;

  raise notice 'T7 PASS: migration rieseguibile, nessun oggetto duplicato';
end $$;

select 'ALL TESTS PASS' as esito;
