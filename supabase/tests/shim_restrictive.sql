-- SHIM v2 — come shim-supabase.sql MA SENZA `alter default privileges`.
-- Serve a provare che i grant ESPLICITI della migration bastano da soli: se il progetto
-- reale non concedesse automaticamente sulle tabelle nuove, il client dovrebbe comunque
-- poter usare partner_refs (grant esplicito) e NON vedere i tombstone (revoke esplicito).
create schema auth;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  raw_user_meta_data jsonb default '{}'::jsonb,
  raw_app_meta_data jsonb default '{}'::jsonb,
  email text
);

create function auth.uid() returns uuid
language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

create role anon nologin;
create role authenticated nologin;
grant usage on schema public to anon, authenticated;
grant usage on schema auth to anon, authenticated;
-- NIENTE alter default privileges: è il punto del test.
