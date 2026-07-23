-- TEST migration 0008 — partner_refs + tombstone. Assert espliciti, mai vacui:
-- ogni conteggio confrontato col valore ESATTO atteso; i test negativi falliscono
-- RUMOROSAMENTE se il vincolo non blocca.

-- Setup: 2 utenti social-style (senza birth_date → handle_new_user li salta, come nel reale)
insert into auth.users (id) values
  ('00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002');
insert into public.profiles (id, first_name, last_name, phone, city, province, birth_date, privacy_consent_at)
values
  ('00000000-0000-0000-0000-000000000001','Anna','Uno','111','Milano','MI','1990-01-01', now()),
  ('00000000-0000-0000-0000-000000000002','Bruno','Due','222','Roma','RM','1990-01-01', now());

-- Ref: user1 → donorbox attivo + letsdonation attivo + donorbox REVOCATO (storico); user2 → donorbox attivo
insert into public.partner_refs (ref, user_id, partner) values
  ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','donorbox'),
  ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','letsdonation');
insert into public.partner_refs (ref, user_id, partner, active, revoked_at) values
  ('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','donorbox', false, now());
insert into public.partner_refs (ref, user_id, partner) values
  ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','donorbox');

-- T1: unique parziale — secondo ref ATTIVO stesso (user, partner) DEVE fallire
do $$
begin
  begin
    insert into public.partner_refs (user_id, partner)
    values ('00000000-0000-0000-0000-000000000001','donorbox');
    raise exception 'T1 FAIL: doppio ref attivo accettato';
  exception when unique_violation then
    raise notice 'T1 PASS: unique parziale blocca il doppio attivo';
  end;
end $$;

-- T1b: ma un ref attivo DOPO una revoca è ammesso (ri-emissione): user1 aveva donorbox
-- revocato E attivo → già dimostrato dal setup (riga 1 + riga 3 coesistono). Assert esplicito:
do $$
declare n int;
begin
  select count(*) into n from public.partner_refs
  where user_id = '00000000-0000-0000-0000-000000000001' and partner = 'donorbox';
  if n <> 2 then raise exception 'T1b FAIL: attese 2 righe donorbox per user1 (attivo+revocato), trovate %', n; end if;
  raise notice 'T1b PASS: storico revocato coesiste con attivo';
end $$;

-- T2: check — active=false senza revoked_at DEVE fallire
do $$
begin
  begin
    insert into public.partner_refs (user_id, partner, active)
    values ('00000000-0000-0000-0000-000000000002','letsdonation', false);
    raise exception 'T2 FAIL: active=false senza revoked_at accettato';
  exception when check_violation then
    raise notice 'T2 PASS: check active⇔revoked_at';
  end;
end $$;

-- T3: partner fuori lista DEVE fallire
do $$
begin
  begin
    insert into public.partner_refs (user_id, partner)
    values ('00000000-0000-0000-0000-000000000002','evilcorp');
    raise exception 'T3 FAIL: partner non in lista accettato';
  exception when check_violation then
    raise notice 'T3 PASS: check partner';
  end;
end $$;

-- T4: delete DIRETTO su profiles (percorso own_delete) → tombstone con TUTTI i ref
-- di user1 (3, incluso il revocato) e cascade che svuota partner_refs
delete from public.profiles where id = '00000000-0000-0000-0000-000000000001';
do $$
declare n int;
begin
  select count(*) into n from public.partner_ref_tombstones
  where ref in ('10000000-0000-0000-0000-000000000001',
                '10000000-0000-0000-0000-000000000002',
                '10000000-0000-0000-0000-000000000003');
  if n <> 3 then raise exception 'T4 FAIL: tombstone ha % ref di user1, attesi 3', n; end if;
  select count(*) into n from public.partner_refs where user_id = '00000000-0000-0000-0000-000000000001';
  if n <> 0 then raise exception 'T4 FAIL: cascade non ha rimosso i ref (% residui)', n; end if;
  raise notice 'T4 PASS: tombstone 3/3 (incluso revocato) + cascade pulita';
end $$;

-- T5: percorso REALE deleteUser → delete auth.users → cascade profiles → trigger
delete from auth.users where id = '00000000-0000-0000-0000-000000000002';
do $$
declare n int;
begin
  select count(*) into n from public.partner_ref_tombstones
  where ref = '20000000-0000-0000-0000-000000000001';
  if n <> 1 then raise exception 'T5 FAIL: tombstone via cascade auth.users mancante (%)', n; end if;
  select count(*) into n from public.partner_refs;
  if n <> 0 then raise exception 'T5 FAIL: partner_refs non vuota (%)', n; end if;
  select count(*) into n from public.partner_ref_tombstones;
  if n <> 4 then raise exception 'T5 FAIL: tombstone totale % righe, attese 4', n; end if;
  raise notice 'T5 PASS: cascade auth.users → profiles → tombstone (4 totali)';
end $$;

-- T6: RLS dal punto di vista del client (role authenticated + claim sub)
insert into auth.users (id) values
  ('00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000004');
insert into public.profiles (id, first_name, last_name, phone, city, province, birth_date, privacy_consent_at)
values
  ('00000000-0000-0000-0000-000000000003','Carla','Tre','333','Torino','TO','1990-01-01', now()),
  ('00000000-0000-0000-0000-000000000004','Dario','Quattro','444','Bari','BA','1990-01-01', now());
insert into public.partner_refs (ref, user_id, partner) values
  ('30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','donorbox'),
  ('40000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000004','donorbox');

set role authenticated;
set "request.jwt.claim.sub" = '00000000-0000-0000-0000-000000000003';

-- T6a: select vede SOLO la propria riga (di 2 presenti)
do $$
declare n int;
begin
  select count(*) into n from public.partner_refs;
  if n <> 1 then raise exception 'T6a FAIL: authenticated vede % righe, attesa 1', n; end if;
  raise notice 'T6a PASS: select own-only';
end $$;

-- T6b: insert per ALTRO utente DEVE fallire (42501)
do $$
begin
  begin
    insert into public.partner_refs (user_id, partner)
    values ('00000000-0000-0000-0000-000000000004','letsdonation');
    raise exception 'T6b FAIL: insert cross-user accettato';
  exception when insufficient_privilege then
    raise notice 'T6b PASS: insert cross-user bloccato da RLS';
  end;
end $$;

-- T6c: insert per SE STESSO passa (flusso get-or-create dell'app) col ref dal default
insert into public.partner_refs (user_id, partner)
values ('00000000-0000-0000-0000-000000000003','letsdonation');
do $$
declare n int;
begin
  select count(*) into n from public.partner_refs
  where user_id = '00000000-0000-0000-0000-000000000003' and partner = 'letsdonation' and active;
  if n <> 1 then raise exception 'T6c FAIL: insert own non riuscito'; end if;
  raise notice 'T6c PASS: insert own + ref generato server-side';
end $$;

-- T6d: tombstone IRRAGGIUNGIBILE dal client. Col `revoke all` della migration il privilegio
-- SQL non esiste proprio → permission denied, barriera PIÙ FORTE del semplice "0 righe"
-- (che sarebbe il risultato se il grant ci fosse e filtrasse solo la RLS).
-- 4 righe esistono davvero: T5 le ha contate da postgres.
do $$
declare n int;
begin
  begin
    select count(*) into n from public.partner_ref_tombstones;
    raise exception 'T6d FAIL: il client ha potuto interrogare i tombstone (ha letto % righe)', n;
  exception when insufficient_privilege then
    raise notice 'T6d PASS: tombstone irraggiungibile (permission denied, non 0 righe)';
  end;
end $$;

-- T6e: revoca NON esercitabile dal client — doppia barriera: nessun privilegio UPDATE
-- (la migration concede solo select+insert) e nessuna policy update. La prima scatta per prima.
do $$
begin
  begin
    update public.partner_refs set active = false, revoked_at = now()
    where user_id = '00000000-0000-0000-0000-000000000003' and partner = 'donorbox';
    raise exception 'T6e FAIL: il client ha potuto eseguire un UPDATE su partner_refs';
  exception when insufficient_privilege then
    raise notice 'T6e PASS: update client negato (nessun privilegio UPDATE)';
  end;
end $$;

-- T6f: nemmeno il DELETE è concesso (stessa ragione), altrimenti un client potrebbe
-- cancellare i propri ref e spezzare la correlazione già inviata al partner.
do $$
begin
  begin
    delete from public.partner_refs where user_id = '00000000-0000-0000-0000-000000000003';
    raise exception 'T6f FAIL: il client ha potuto cancellare i propri ref';
  exception when insufficient_privilege then
    raise notice 'T6f PASS: delete client negato';
  end;
end $$;

reset role;

-- T7: la migration e' RIESEGUIBILE. Il runner concatena 0008 una seconda volta prima di
-- arrivare qui: se un `create table/index/policy/trigger` non fosse protetto da
-- `if not exists` / `drop if exists`, lo script sarebbe gia' morto con ON_ERROR_STOP.
-- Conta anche che la seconda passata non abbia DUPLICATO nulla.
do $$
declare n int;
begin
  select count(*) into n from pg_policies
  where schemaname = 'public' and tablename = 'partner_refs';
  if n <> 2 then raise exception 'T7 FAIL: % policy su partner_refs, attese 2', n; end if;

  select count(*) into n from pg_trigger
  where tgname = 'on_profile_deleted' and not tgisinternal;
  if n <> 1 then raise exception 'T7 FAIL: % trigger on_profile_deleted, atteso 1', n; end if;

  select count(*) into n from pg_indexes
  where schemaname = 'public' and tablename = 'partner_refs';
  -- pk + indice parziale unico + indice sulla FK
  if n <> 3 then raise exception 'T7 FAIL: % indici su partner_refs, attesi 3', n; end if;

  raise notice 'T7 PASS: migration rieseguibile, nessun oggetto duplicato';
end $$;

select 'ALL TESTS PASS' as esito;
