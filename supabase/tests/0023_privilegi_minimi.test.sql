-- TEST migration 0023 — privilegi minimi e batteria a due account (passata pre-lancio,
-- voci V2.1, V8.2, V8.4, V8.5). Assert espliciti: ogni negativo fallisce rumorosamente.

insert into auth.users (id) values
  ('00000000-0000-0000-0000-00000000230a'),
  ('00000000-0000-0000-0000-00000000230b');
insert into public.profiles (id, first_name, last_name, phone, city, province, birth_date, privacy_consent_at)
values
  ('00000000-0000-0000-0000-00000000230a','Anna','Uno','111','Milano','MI','1990-01-01', now()),
  ('00000000-0000-0000-0000-00000000230b','Bruno','Due','222','Roma','RM','1990-01-01', now());
insert into public.consent_events (user_id, purpose, action, policy_version, legal_basis, channel)
values
  ('00000000-0000-0000-0000-00000000230a','privacy_notice','granted','privacy-2026-06-15','consent','test:a'),
  ('00000000-0000-0000-0000-00000000230b','privacy_notice','granted','privacy-2026-06-15','consent','test:b');
insert into public.partner_refs (ref, user_id, partner) values
  ('b0000000-0000-0000-0000-000000002301','00000000-0000-0000-0000-00000000230b','donorbox');

-- T1: anon non ha nessun privilegio su nessuna tabella.
do $$
declare t text; p text;
begin
  foreach t in array array['public.profiles','public.consent_events','public.policy_versions',
                           'public.partner_refs','public.partner_ref_tombstones','public.legacy_contacts'] loop
    foreach p in array array['select','insert','update','delete','truncate','references','trigger'] loop
      if has_table_privilege('anon', t, p) then
        raise exception 'T1 FAIL: anon ha % su %', p, t;
      end if;
    end loop;
  end loop;
  raise notice 'T1 PASS: anon senza privilegi';
end $$;

-- T2: authenticated ha esattamente ciò che l'app usa, valore per valore.
do $$
declare v record;
begin
  for v in select * from (values
    ('public.profiles','select',true), ('public.profiles','insert',true),
    ('public.profiles','update',true), ('public.profiles','delete',true),
    ('public.profiles','truncate',false), ('public.profiles','references',false),
    ('public.profiles','trigger',false),
    ('public.consent_events','select',true), ('public.consent_events','insert',true),
    ('public.consent_events','update',false), ('public.consent_events','delete',false),
    ('public.consent_events','truncate',false), ('public.consent_events','references',false),
    ('public.consent_events','trigger',false),
    ('public.policy_versions','select',true), ('public.policy_versions','insert',false),
    ('public.policy_versions','update',false), ('public.policy_versions','delete',false),
    ('public.policy_versions','truncate',false),
    ('public.partner_refs','select',true), ('public.partner_refs','insert',false),
    ('public.partner_refs','update',false), ('public.partner_refs','delete',false),
    ('public.partner_refs','truncate',false)
  ) as x(t, p, atteso) loop
    if has_table_privilege('authenticated', v.t, v.p) is distinct from v.atteso then
      raise exception 'T2 FAIL: authenticated, % su %: atteso %', v.p, v.t, v.atteso;
    end if;
  end loop;
  raise notice 'T2 PASS: privilegi di authenticated esatti';
end $$;

-- T3: su partner_refs l'inserimento vale solo per user_id e partner.
do $$
begin
  if not has_column_privilege('authenticated', 'public.partner_refs', 'user_id', 'insert')
     or not has_column_privilege('authenticated', 'public.partner_refs', 'partner', 'insert') then
    raise exception 'T3 FAIL: user_id o partner non inseribili';
  end if;
  if has_column_privilege('authenticated', 'public.partner_refs', 'ref', 'insert')
     or has_column_privilege('authenticated', 'public.partner_refs', 'active', 'insert') then
    raise exception 'T3 FAIL: ref o active scrivibili dal client';
  end if;
  raise notice 'T3 PASS: colonne di partner_refs';
end $$;

-- T4: lato anon, la lettura e il TRUNCATE falliscono davvero, non solo sulla carta.
set role anon;
set "request.jwt.claim.sub" = '';
do $$
declare n int;
begin
  begin
    select count(*) into n from public.profiles;
    raise exception 'T4 FAIL: anon legge profiles (% righe)', n;
  exception when insufficient_privilege then null;
  end;
  begin
    truncate public.profiles cascade;
    raise exception 'T4 FAIL: anon svuota profiles';
  exception when insufficient_privilege then null;
  end;
  raise notice 'T4 PASS: anon respinto';
end $$;
reset role;

-- T5: nemmeno un utente collegato può svuotare una tabella.
set role authenticated;
set "request.jwt.claim.sub" = '00000000-0000-0000-0000-00000000230a';
do $$
declare t text;
begin
  foreach t in array array['public.profiles','public.consent_events','public.policy_versions','public.partner_refs'] loop
    begin
      execute format('truncate %s cascade', t);
      raise exception 'T5 FAIL: authenticated svuota %', t;
    exception when insufficient_privilege then null;
    end;
  end loop;
  raise notice 'T5 PASS: TRUNCATE negato';
end $$;

-- T6: batteria a due account, A contro i dati di B.
do $$
declare n int;
begin
  select count(*) into n from public.profiles;
  if n <> 1 then raise exception 'T6a FAIL: A vede % profili, atteso 1', n; end if;
  select count(*) into n from public.consent_events;
  if n <> 1 then raise exception 'T6b FAIL: A vede % eventi, atteso 1', n; end if;
  select count(*) into n from public.partner_refs;
  if n <> 0 then raise exception 'T6c FAIL: A vede % ref di B', n; end if;

  update public.profiles set first_name = 'Intruso'
    where id = '00000000-0000-0000-0000-00000000230b';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'T6d FAIL: A modifica il profilo di B'; end if;

  delete from public.profiles where id = '00000000-0000-0000-0000-00000000230b';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'T6e FAIL: A cancella il profilo di B'; end if;

  begin
    insert into public.consent_events (user_id, purpose, action, policy_version, legal_basis, channel)
    values ('00000000-0000-0000-0000-00000000230b','marketing','granted','privacy-2026-06-15','consent','test:falso');
    raise exception 'T6f FAIL: A scrive un consenso a nome di B';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.partner_refs (user_id, partner)
    values ('00000000-0000-0000-0000-00000000230b','letsdonation');
    raise exception 'T6g FAIL: A crea un ref per B';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.consent_events set channel = 'alterato';
    raise exception 'T6h FAIL: il registro dei consensi è modificabile';
  exception when insufficient_privilege then null;
  end;

  begin
    delete from public.consent_events;
    raise exception 'T6i FAIL: il registro dei consensi è cancellabile';
  exception when insufficient_privilege then null;
  end;
  raise notice 'T6 PASS: A non tocca i dati di B';
end $$;

-- T7: i flussi veri dell'app funzionano ancora.
do $$
declare n int; v_ref uuid;
begin
  update public.profiles set first_name = 'Anna Maria', deletion_requested_at = null
    where id = '00000000-0000-0000-0000-00000000230a';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'T7a FAIL: update del proprio profilo (% righe)', n; end if;

  -- useProfileForm: upsert dell'intero profilo.
  insert into public.profiles (id, first_name, last_name, phone, city, province, birth_date, privacy_consent_at)
  values ('00000000-0000-0000-0000-00000000230a','Anna','Uno','333','Milano','MI','1990-01-01', now())
  on conflict (id) do update set phone = excluded.phone;
  if (select phone from public.profiles where id = '00000000-0000-0000-0000-00000000230a') <> '333' then
    raise exception 'T7b FAIL: upsert del proprio profilo';
  end if;

  insert into public.consent_events (user_id, purpose, action, policy_version, legal_basis, channel)
  values ('00000000-0000-0000-0000-00000000230a','marketing','granted','privacy-2026-06-15','consent','android:profile_toggle');

  insert into public.partner_refs (user_id, partner)
  values ('00000000-0000-0000-0000-00000000230a','donorbox')
  returning ref into v_ref;
  if v_ref is null then raise exception 'T7c FAIL: ref non generato dal server'; end if;

  select count(*) into n from public.policy_versions where version = 'privacy-2026-06-15';
  if n <> 1 then raise exception 'T7d FAIL: policy_versions illeggibile'; end if;
  raise notice 'T7 PASS: flussi dell''app intatti';
end $$;

-- T8: il client non sceglie il valore del ref.
do $$
begin
  begin
    insert into public.partner_refs (ref, user_id, partner)
    values ('a0000000-0000-0000-0000-000000002302','00000000-0000-0000-0000-00000000230a','letsdonation');
    raise exception 'T8 FAIL: ref scelto dal client accettato';
  exception when insufficient_privilege then null;
  end;
  raise notice 'T8 PASS: ref solo dal server';
end $$;

-- T9: limiti di lunghezza, al confine esatto.
do $$
declare c text;
begin
  foreach c in array array['first_name','last_name','phone','city','province','country'] loop
    execute format('update public.profiles set %I = repeat(%L, 200) where id = %L',
                   c, 'x', '00000000-0000-0000-0000-00000000230a');
    begin
      execute format('update public.profiles set %I = repeat(%L, 201) where id = %L',
                     c, 'x', '00000000-0000-0000-0000-00000000230a');
      raise exception 'T9 FAIL: % oltre il limite accettato', c;
    exception when check_violation then null;
    end;
  end loop;
  begin
    insert into public.consent_events (user_id, purpose, action, policy_version, legal_basis, channel)
    values ('00000000-0000-0000-0000-00000000230a','marketing','withdrawn','privacy-2026-06-15','consent', repeat('x', 65));
    raise exception 'T9 FAIL: channel oltre il limite accettato';
  exception when check_violation then null;
  end;
  begin
    insert into public.consent_events (user_id, purpose, action, policy_version, legal_basis, channel)
    values ('00000000-0000-0000-0000-00000000230a','marketing','withdrawn','privacy-2026-06-15', repeat('x', 65), 'test');
    raise exception 'T9 FAIL: legal_basis oltre il limite accettato';
  exception when check_violation then null;
  end;
  raise notice 'T9 PASS: limiti di lunghezza';
end $$;
reset role;

do $$ begin raise notice 'ALL TESTS PASS 0023'; end $$;
