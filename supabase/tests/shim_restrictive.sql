-- SHIM v2 — come shim-supabase.sql MA SENZA `alter default privileges`.
-- Serve a provare che i grant ESPLICITI della migration bastano da soli: se il progetto
-- reale non concedesse automaticamente sulle tabelle nuove, il client dovrebbe comunque
-- poter usare partner_refs (grant esplicito) e NON vedere i tombstone (revoke esplicito).
create schema auth;

-- `email_confirmed_at`: stesso default deliberato del gemello permissivo, stessa
-- avvertenza — chi testa la conferma scrive il valore a mano, o testa il caso opposto
-- credendo di aver testato questo. Le due copie vanno tenute allineate: divergere
-- significherebbe che una combinazione su due esercita un mondo diverso.
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  raw_user_meta_data jsonb default '{}'::jsonb,
  raw_app_meta_data jsonb default '{}'::jsonb,
  email text,
  email_confirmed_at timestamptz default now()
);

create function auth.uid() returns uuid
language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

create role anon nologin;
create role authenticated nologin;
grant usage on schema public to anon, authenticated;
grant usage on schema auth to anon, authenticated;
-- NIENTE alter default privileges: è il punto del test.
