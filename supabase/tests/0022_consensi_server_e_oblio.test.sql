-- C79: prima eseguire senza 0022 (rossi attesi T1/T2/T3/T4/T7), poi con
-- tutte le migration e 0022 ripetuta. Solo Postgres Docker, entrambi gli shim.
-- I GRANT qui sotto sono fixture: lo shim restrittivo non modella i privilegi
-- dell'app sulle tabelle 0001/0003. La migration NON concede questi permessi.
-- insert e delete come su Supabase, dove decidono le policy own_insert/own_delete (T16).
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert on public.consent_events to authenticated;

create function pg_temp.verifica(ok boolean, messaggio text) returns void
language plpgsql as $$
begin
  if ok is distinct from true then raise exception '% FAIL', messaggio; end if;
  raise notice '% PASS', messaggio;
end $$;

-- Due registrazioni reali: handle_new_user inserisce il profilo PRIMA degli eventi.
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data)
select ('00000000-0000-0000-0000-00000000220' || n)::uuid,
       'c79-' || n || '@example.test', now(),
       jsonb_build_object('first_name', 'Consenso', 'last_name', 'Server',
         'birth_date', '1990-01-01', 'country', 'IT', 'marketing_consent', n = 1)
from generate_series(1, 2) n;

-- T0: il sì non deve essere perso da un eventuale UPDATE prima del primo evento.
select pg_temp.verifica(
  (select marketing_consent from public.profiles where id = '00000000-0000-0000-0000-000000002201')
  and exists (select 1 from public.consent_events where user_id = '00000000-0000-0000-0000-000000002201'
               and purpose = 'marketing' and action = 'granted')
  and not (select marketing_consent from public.profiles where id = '00000000-0000-0000-0000-000000002202')
  and not exists (select 1 from public.consent_events where user_id = '00000000-0000-0000-0000-000000002202'
                   and purpose = 'marketing'), 'T0 registrazione col sì e col no');

-- T1: futuro, passato e NULL ignorati, per TUTTI i purpose, da ruolo client.
do $$
declare t timestamptz;
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000002202', true);
  set local role authenticated;
  foreach t in array array[now() + interval '10 years', now() - interval '10 years', null::timestamptz] loop
    insert into public.consent_events (user_id, purpose, action, policy_version, legal_basis, channel, created_at)
    select '00000000-0000-0000-0000-000000002202', p, 'withdrawn', 'privacy-2026-06-15', 'consent', 'c79-clock', t
    from unnest(array['marketing', 'privacy_notice', 'profiling']) p;
  end loop;
  reset role;
  perform pg_temp.verifica((select count(*) = 9 and bool_and(created_at = now())
    from public.consent_events where channel = 'c79-clock'), 'T1 futuro e passato: created_at del server');
exception when not_null_violation then
  raise exception 'T1 FAIL: created_at NULL del client non sovrascritto dal server';
end $$;

-- T2: revoca persistita; la seconda richiesta dell'app sul profilo FALLISCE.
-- Il fallimento è una sotto-transazione: non annulla l'evento già inserito.
do $$
declare fallito boolean := false;
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000002201', true);
  set local role authenticated;
  insert into public.consent_events (user_id, purpose, action, policy_version, legal_basis, channel)
  values ('00000000-0000-0000-0000-000000002201', 'marketing', 'withdrawn', 'privacy-2026-06-15', 'consent', 'c79-revoca');
  begin
    update public.profiles set marketing_consent = false, birth_date = current_date
    where id = '00000000-0000-0000-0000-000000002201';
  exception when check_violation then fallito := true;
  end;
  reset role;
  perform pg_temp.verifica(fallito and
    (select marketing_consent = false from public.profiles where id = '00000000-0000-0000-0000-000000002201')
    and exists (select 1 from public.consent_events where channel = 'c79-revoca'),
    'T2 revoca con aggiornamento del profilo fallito');
end $$;

-- T3: tentativo discordante respinto per riallineamento, senza errore dell'app.
do $$
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000002201', true);
  set local role authenticated;
  update public.profiles set marketing_consent = true where id = '00000000-0000-0000-0000-000000002201';
  reset role;
  perform pg_temp.verifica((select marketing_consent = false from public.profiles
    where id = '00000000-0000-0000-0000-000000002201'), 'T3 scrittura diretta discordante');
end $$;

-- Nessun evento marketing, anche se esistono eventi privacy: profilo ereditato
-- incoerente creato con INSERT (lo crea il superutente, come un dato storico). Un dato storico è
-- nato prima di on_profile_marketing_guard, che oggi lo correggerebbe già qui: i trigger si
-- spengono solo per questa riga, così l'UPDATE sotto prova davvero il riallineamento.
insert into auth.users (id, email, email_confirmed_at) values
  ('00000000-0000-0000-0000-000000002203', 'c79-no-event@example.test', now());
set session_replication_role = replica;
insert into public.profiles (id, first_name, last_name, birth_date, privacy_consent_at, marketing_consent)
values ('00000000-0000-0000-0000-000000002203', 'Senza', 'Evento', '1990-01-01', now(), true);
set session_replication_role = default;
insert into public.consent_events (user_id, purpose, action, policy_version, legal_basis, channel)
values ('00000000-0000-0000-0000-000000002203', 'privacy_notice', 'granted', 'privacy-2026-06-15', 'consent', 'c79-no-event');
select pg_temp.verifica((select marketing_consent from public.profiles
  where id = '00000000-0000-0000-0000-000000002203'), 'T4 preparazione: il dato storico parte discordante');
do $$
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000002203', true);
  set local role authenticated;
  update public.profiles set city = 'Roma' where id = '00000000-0000-0000-0000-000000002203';
  reset role;
  perform pg_temp.verifica((select marketing_consent = false and city = 'Roma' from public.profiles
    where id = '00000000-0000-0000-0000-000000002203'), 'T4 nessun evento marketing: false al primo salvataggio');
end $$;

-- T5: stesso valore dopo l'evento (app attuale) e consenso riaccordato.
do $$
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000002201', true);
  set local role authenticated;
  insert into public.consent_events (user_id, purpose, action, policy_version, legal_basis, channel)
  values ('00000000-0000-0000-0000-000000002201', 'marketing', 'granted', 'privacy-2026-06-15', 'consent', 'c79-granted');
  reset role;
  perform pg_temp.verifica((select marketing_consent from public.profiles
    where id = '00000000-0000-0000-0000-000000002201'), 'T5 evento granted aggiorna subito');
  set local role authenticated;
  update public.profiles set marketing_consent = true where id = '00000000-0000-0000-0000-000000002201';
  reset role;
  perform pg_temp.verifica((select marketing_consent from public.profiles
    where id = '00000000-0000-0000-0000-000000002201'), 'T5 app compatibile: stesso valore dopo evento');
end $$;

-- T6: misura gli UPDATE reali, non updated_at (now() è costante nella transazione).
create temporary table c79_scritture (id uuid);
create function pg_temp.conta_scritture() returns trigger language plpgsql as $$
begin insert into pg_temp.c79_scritture values (new.id); return new; end $$;
create trigger c79_conta_scritture after update on public.profiles
for each row execute function pg_temp.conta_scritture();
do $$
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000002201', true);
  set local role authenticated;
  insert into public.consent_events (user_id, purpose, action, policy_version, legal_basis, channel)
  values ('00000000-0000-0000-0000-000000002201', 'marketing', 'granted', 'privacy-2026-06-15', 'consent', 'c79-same');
  reset role;
  perform pg_temp.verifica((select count(*) = 0 from pg_temp.c79_scritture), 'T6 IS DISTINCT FROM evita UPDATE ridondanti');
end $$;
drop trigger c79_conta_scritture on public.profiles;

-- T7/B8: import TARDIVO su A, recapito B scelto, email account A -> C, delete.
-- B è di un terzo: NON deve diventare una chiave di rivendicazione o cancellazione.
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000002204', 'c79-a@example.test', now(),
   '{"first_name":"Cambio","last_name":"Email","birth_date":"1990-01-01","contact_email":"c79-b@example.test"}');
insert into public.legacy_contacts (email_norm, source, raw) values
  ('c79-a@example.test', 'c79-b8', '{"nome":"Cambio Email"}'),
  ('c79-b@example.test', 'c79-terzo', '{"nome":"Terzo"}');
select pg_temp.verifica(
  (select contact_email = 'c79-b@example.test' from public.profiles where id = '00000000-0000-0000-0000-000000002204')
  and (select claimed_by is null from public.legacy_contacts where email_norm = 'c79-a@example.test'),
  'T7 setup legacy_contacts: A non ancora rivendicata, recapito B');
update auth.users set email = 'c79-c@example.test' where id = '00000000-0000-0000-0000-000000002204';
select pg_temp.verifica(
  (select claimed_by is null from public.legacy_contacts where email_norm = 'c79-a@example.test')
  and (select contact_email = 'c79-b@example.test' from public.profiles where id = '00000000-0000-0000-0000-000000002204'),
  'T7 compatibilità 0013: nessun claim né cambio del recapito scelto');
delete from auth.users where id = '00000000-0000-0000-0000-000000002204';
select pg_temp.verifica(
  not exists (select 1 from public.legacy_contacts where email_norm in ('c79-a@example.test', 'c79-c@example.test')
                or claimed_by = '00000000-0000-0000-0000-000000002204' or source = 'c79-b8')
  and (select claimed_by is null from public.legacy_contacts where email_norm = 'c79-b@example.test'),
  'T7 B8 legacy_contacts: nessun dato utente sopravvive, terzo preservato');

-- T8: atomicità inversa: se FALLISCE il sync del trigger, fallisce anche l'evento.
create function pg_temp.nega_sync() returns trigger language plpgsql as $$
begin raise check_violation using message = 'c79 guasto simulato'; end $$;
create trigger c79_nega_sync before update on public.profiles
for each row execute function pg_temp.nega_sync();
do $$
declare fallito boolean := false;
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000002201', true);
  set local role authenticated;
  begin
    insert into public.consent_events (user_id, purpose, action, policy_version, legal_basis, channel)
    values ('00000000-0000-0000-0000-000000002201', 'marketing', 'withdrawn', 'privacy-2026-06-15', 'consent', 'c79-rollback');
  exception when check_violation then fallito := true;
  end;
  reset role;
  perform pg_temp.verifica(fallito and not exists (select 1 from public.consent_events where channel = 'c79-rollback')
    and (select marketing_consent from public.profiles where id = '00000000-0000-0000-0000-000000002201'),
    'T8 evento e profilo nella stessa transazione');
end $$;
drop trigger c79_nega_sync on public.profiles;

-- T9: now() uguale, UUID in ordine opposto: decide l'ordine SERVER, non il client.
do $$
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000002201', true);
  set local role authenticated;
  insert into public.consent_events (id, user_id, purpose, action, policy_version, legal_basis, channel)
  values ('ffffffff-ffff-ffff-ffff-fffffffffff1', '00000000-0000-0000-0000-000000002201', 'marketing', 'withdrawn', 'privacy-2026-06-15', 'consent', 'c79-tie');
  insert into public.consent_events (id, user_id, purpose, action, policy_version, legal_basis, channel)
  values ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000002201', 'marketing', 'granted', 'privacy-2026-06-15', 'consent', 'c79-tie');
  update public.profiles set marketing_consent = false where id = '00000000-0000-0000-0000-000000002201';
  reset role;
  perform pg_temp.verifica((select marketing_consent from public.profiles where id = '00000000-0000-0000-0000-000000002201'),
    'T9 ultimo evento anche a parità di now()');
end $$;

-- T10: RLS resta attiva anche se i trigger hanno privilegi di proprietario.
do $$
declare negato boolean := false;
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000002202', true);
  set local role authenticated;
  begin
    insert into public.consent_events (user_id, purpose, action, policy_version, legal_basis, channel)
    values ('00000000-0000-0000-0000-000000002201', 'marketing', 'withdrawn', 'privacy-2026-06-15', 'consent', 'c79-altrui');
  exception when insufficient_privilege then negato := true;
  end;
  reset role;
  perform pg_temp.verifica(negato and not exists (select 1 from public.consent_events where channel = 'c79-altrui'),
    'T10 evento altrui negato da RLS');
end $$;

-- T11: B8 non deve rubare schede da un indirizzo MAI verificato.
insert into auth.users (id, email, email_confirmed_at) values
  ('00000000-0000-0000-0000-000000002205', 'c79-vittima@example.test', null);
insert into public.legacy_contacts (email_norm, source) values ('c79-vittima@example.test', 'c79-vittima');
update auth.users set email = 'c79-attaccante@example.test' where id = '00000000-0000-0000-0000-000000002205';
delete from auth.users where id = '00000000-0000-0000-0000-000000002205';
select pg_temp.verifica((select claimed_by is null from public.legacy_contacts where email_norm = 'c79-vittima@example.test'),
  'T11 legacy_contacts: vecchia email non verificata protetta');

-- T12: nessuna nuova funzione richiamabile via RPC né permessi sulla sequenza.
select pg_temp.verifica(not exists (
  select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname in
    ('timbra_evento_consenso', 'allinea_marketing_da_evento', 'proteggi_marketing_profilo',
     'sync_contact_email_on_email_change', 'purge_legacy_contact', 'purge_legacy_on_user_delete')
    and (has_function_privilege('anon', p.oid, 'EXECUTE') or has_function_privilege('authenticated', p.oid, 'EXECUTE')
         or not (coalesce(p.proconfig, array[]::text[]) @> array['search_path=""']))
), 'T12 funzioni private e search_path vuoto');
select pg_temp.verifica(
  not has_sequence_privilege('anon', 'public.consent_events_server_order_seq', 'USAGE,SELECT,UPDATE')
  and not has_sequence_privilege('authenticated', 'public.consent_events_server_order_seq', 'USAGE,SELECT,UPDATE'),
  'T12 nessun permesso client sulla sequenza');

-- T13: il client non può bloccare l'ordine mandando un contatore enorme.
do $$
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000002201', true);
  set local role authenticated;
  insert into public.consent_events (user_id, purpose, action, policy_version, legal_basis, channel, server_order)
  values ('00000000-0000-0000-0000-000000002201', 'marketing', 'withdrawn', 'privacy-2026-06-15', 'consent', 'c79-spoof', 9223372036854775807);
  insert into public.consent_events (user_id, purpose, action, policy_version, legal_basis, channel)
  values ('00000000-0000-0000-0000-000000002201', 'marketing', 'granted', 'privacy-2026-06-15', 'consent', 'c79-after-spoof'),
         ('00000000-0000-0000-0000-000000002201', 'privacy_notice', 'withdrawn', 'privacy-2026-06-15', 'consent', 'c79-other-purpose');
  reset role;
  perform pg_temp.verifica((select marketing_consent from public.profiles where id = '00000000-0000-0000-0000-000000002201')
    and (select server_order < 9223372036854775807 from public.consent_events where channel = 'c79-spoof'),
    'T13 ordine non falsificabile, privacy non cambia marketing');
end $$;

-- T14: anche eliminare il SOLO profilo rimuove la copia storica su A.
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000002206', 'c79-profile-a@example.test', now(),
   '{"first_name":"Solo","last_name":"Profilo","birth_date":"1990-01-01","contact_email":"c79-b@example.test"}');
insert into public.legacy_contacts (email_norm, source) values ('c79-profile-a@example.test', 'c79-profile');
update auth.users set email = 'c79-profile-c@example.test' where id = '00000000-0000-0000-0000-000000002206';
delete from public.profiles where id = '00000000-0000-0000-0000-000000002206';
select pg_temp.verifica(not exists (select 1 from public.legacy_contacts where source = 'c79-profile')
  and exists (select 1 from auth.users where id = '00000000-0000-0000-0000-000000002206'),
  'T14 B8 cancellazione del solo profilo');

-- T15: se A viene poi rivendicata da un altro account, il vecchio legame
-- di oblio non può distruggere la sua scheda (né via purge né via FK).
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000002207', 'c79-reused-a@example.test', now(),
   '{"first_name":"Prima","last_name":"Persona","birth_date":"1990-01-01","contact_email":"c79-b@example.test"}');
insert into public.legacy_contacts (email_norm, source) values ('c79-reused-a@example.test', 'c79-reused');
update auth.users set email = 'c79-reused-c@example.test' where id = '00000000-0000-0000-0000-000000002207';
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000002208', 'c79-reused-a@example.test', now(),
   '{"first_name":"Seconda","last_name":"Persona","birth_date":"1990-01-01"}');
delete from public.profiles where id = '00000000-0000-0000-0000-000000002207';
delete from auth.users where id = '00000000-0000-0000-0000-000000002207';
select pg_temp.verifica((select claimed_by = '00000000-0000-0000-0000-000000002208'::uuid and oblio_user_id is null
  from public.legacy_contacts where source = 'c79-reused'), 'T15 B8 scheda rivendicata da un altro preservata');

-- T16: chi cancella il proprio profilo e lo ricrea col sì non si riscrive il
-- consenso marketing. Il registro dipende da auth.users e sopravvive al profilo:
-- dice «revocato», e il profilo nuovo deve dire lo stesso.
insert into auth.users (id, email, email_confirmed_at) values
  ('00000000-0000-0000-0000-000000002209', 'c79-ricrea@example.test', now());
do $$
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000002209', true);
  set local role authenticated;
  insert into public.profiles (id, first_name, last_name, birth_date, privacy_consent_at, marketing_consent)
  values ('00000000-0000-0000-0000-000000002209', 'Ricrea', 'Profilo', '1990-01-01', now(), false);
  insert into public.consent_events (user_id, purpose, action, policy_version, legal_basis, channel)
  values ('00000000-0000-0000-0000-000000002209', 'marketing', 'granted', 'privacy-2026-06-15', 'consent', 'c79-ricrea-si');
  insert into public.consent_events (user_id, purpose, action, policy_version, legal_basis, channel)
  values ('00000000-0000-0000-0000-000000002209', 'marketing', 'withdrawn', 'privacy-2026-06-15', 'consent', 'c79-ricrea-no');
  delete from public.profiles where id = '00000000-0000-0000-0000-000000002209';
  insert into public.profiles (id, first_name, last_name, birth_date, privacy_consent_at, marketing_consent)
  values ('00000000-0000-0000-0000-000000002209', 'Ricrea', 'Profilo', '1990-01-01', now(), true);
  reset role;
  perform pg_temp.verifica((select marketing_consent = false from public.profiles
    where id = '00000000-0000-0000-0000-000000002209')
    and exists (select 1 from public.consent_events where channel = 'c79-ricrea-no'),
    'T16 profilo ricreato dal client: vale il registro');
end $$;

do $$ begin raise notice 'ALL TESTS PASS 0022'; end $$;
