-- TEST migration 0010 — profilo minimo (phone/city nullable). Assert espliciti, mai vacui.
-- Come la 0009, la 0010 non concede grant (solo metadati di colonna): è grant-agnostica,
-- quindi opera a livello superuser e deve dare lo STESSO esito coi due shim.
--
-- Il test non si limita a rileggere `information_schema` — quello direbbe soltanto che
-- la migration ha scritto ciò che dice di scrivere. Prova il COMPORTAMENTO che serve al
-- prodotto: che un profilo possa NASCERE senza telefono né città, che i campi che NON
-- devono cedere continuino a rifiutare il null, e che il completamento successivo
-- funzioni.

-- T1: phone e city sono nullable; i campi che reggono l'identità e l'età minima NON lo sono.
-- L'asse negativo è la metà che conta: una 0010 troppo generosa (che liberasse anche
-- first_name o birth_date) passerebbe un test scritto solo in positivo.
do $$
declare r record; v_atteso text;
begin
  for r in
    select column_name, is_nullable
    from information_schema.columns
    where table_schema='public' and table_name='profiles'
      and column_name in ('phone','city','first_name','last_name','birth_date',
                          'country','privacy_consent_at','province')
  loop
    v_atteso := case r.column_name
                  when 'phone' then 'YES'
                  when 'city' then 'YES'
                  when 'province' then 'YES'   -- già nullable dalla 0007 (paesi esteri)
                  else 'NO'
                end;
    if r.is_nullable <> v_atteso then
      raise exception 'T1 FAIL: %.is_nullable = %, atteso %', r.column_name, r.is_nullable, v_atteso;
    end if;
  end loop;
  raise notice 'T1 PASS: phone/city/province nullable, gli altri ancora NOT NULL';
end $$;

-- T2: un profilo MINIMO nasce davvero — senza phone, senza city, senza province.
-- È il comportamento per cui la migration esiste.
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000000b1');
insert into public.profiles (id, first_name, last_name, birth_date, privacy_consent_at)
values ('00000000-0000-0000-0000-0000000000b1','Ada','Minima','1990-01-01', now());
do $$
declare v_phone text; v_city text; v_country text;
begin
  select phone, city, country into v_phone, v_city, v_country
  from public.profiles where id = '00000000-0000-0000-0000-0000000000b1';
  if v_phone is not null then raise exception 'T2 FAIL: phone non è null (%)', v_phone; end if;
  if v_city is not null then raise exception 'T2 FAIL: city non è null (%)', v_city; end if;
  -- country è NOT NULL con default: il profilo minimo non deve inciamparci.
  if v_country is null then raise exception 'T2 FAIL: country null su profilo minimo'; end if;
  raise notice 'T2 PASS: profilo minimo creato (phone/city null, country dal default: %)', v_country;
end $$;

-- T3: i campi che NON cedono rifiutano ancora il null, uno per uno.
-- Senza questo, una migration che liberasse troppo resterebbe verde.
do $$
declare c text; cols text[] := array['first_name','last_name','birth_date'];
begin
  foreach c in array cols loop
    begin
      execute format(
        'insert into auth.users (id) values (%L)',
        '00000000-0000-0000-0000-0000000000c1');
    exception when unique_violation then null;  -- già inserito da un giro precedente
    end;
    begin
      execute format(
        'insert into public.profiles (id, first_name, last_name, birth_date, privacy_consent_at)
         values (%L, %s, %s, %s, now())',
        '00000000-0000-0000-0000-0000000000c1',
        case when c = 'first_name' then 'null' else quote_literal('X') end,
        case when c = 'last_name'  then 'null' else quote_literal('Y') end,
        case when c = 'birth_date' then 'null' else quote_literal('1990-01-01') end);
      raise exception 'T3 FAIL: insert accettato con % = null', c;
    exception when not_null_violation then
      raise notice 'T3 PASS: % rifiuta ancora il null', c;
    end;
  end loop;
end $$;

-- T4: il COMPLETAMENTO differito funziona — da null a valore, che è il senso di D-a
-- («nullable ≠ opzionale per sempre»).
update public.profiles set phone = '+393331234567', city = 'Bologna', province = 'BO'
where id = '00000000-0000-0000-0000-0000000000b1';
do $$
declare v_phone text; v_city text;
begin
  select phone, city into v_phone, v_city
  from public.profiles where id = '00000000-0000-0000-0000-0000000000b1';
  if v_phone <> '+393331234567' then raise exception 'T4 FAIL: phone non aggiornato (%)', v_phone; end if;
  if v_city <> 'Bologna' then raise exception 'T4 FAIL: city non aggiornata (%)', v_city; end if;
  raise notice 'T4 PASS: completamento differito dei campi mancanti';
end $$;

-- T5: si può tornare a null (l'utente svuota un campo non obbligatorio in rettifica).
update public.profiles set phone = null where id = '00000000-0000-0000-0000-0000000000b1';
do $$
declare v text;
begin
  select phone into v from public.profiles where id = '00000000-0000-0000-0000-0000000000b1';
  if v is not null then raise exception 'T5 FAIL: null rifiutato in update (%)', v; end if;
  raise notice 'T5 PASS: ritorno a null ammesso';
end $$;

-- T6: la migration è RIESEGUIBILE. Il runner concatena 0010 una seconda volta prima di
-- arrivare qui: `drop not null` su una colonna già nullable è un no-op, quindi con
-- ON_ERROR_STOP lo script sarebbe già morto se non lo fosse. Qui si verifica che il
-- secondo giro non abbia cambiato nulla d'altro.
do $$
declare n int;
begin
  select count(*) into n from information_schema.columns
  where table_schema='public' and table_name='profiles'
    and column_name in ('phone','city') and is_nullable = 'YES';
  if n <> 2 then raise exception 'T6 FAIL: % colonne nullable fra phone/city, attese 2', n; end if;
  raise notice 'T6 PASS: migration rieseguibile, stato invariato al secondo giro';
end $$;

select 'ALL TESTS PASS' as esito;
