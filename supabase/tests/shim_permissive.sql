-- SHIM ambiente Supabase minimo per test locale (postgres:15 vanilla).
-- Replica: schema auth, auth.users, auth.uid() (legge il claim GUC come PostgREST),
-- ruoli anon/authenticated con i default privileges che Supabase concede in public.
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
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
