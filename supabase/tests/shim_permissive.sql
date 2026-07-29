-- SHIM ambiente Supabase minimo per test locale (postgres:15 vanilla).
-- Replica: schema auth, auth.users, auth.uid() (legge il claim GUC come PostgREST),
-- ruoli anon/authenticated con i default privileges che Supabase concede in public.
create schema auth;

-- ⚠️ `email_confirmed_at` ha qui un DEFAULT che in Supabase NON esiste (là nasce NULL e
-- si valorizza alla conferma, o subito se l'identità arriva da un provider OAuth). È
-- deliberato: le suite 0008→0015 parlano di persone che stanno usando l'app, cioè che
-- hanno confermato, e senza il default andrebbero riscritti una trentina di fixture per
-- un attributo che quelle suite non testano.
-- → CHI TESTA LA CONFERMA DEVE SCRIVERE IL VALORE A MANO: `email_confirmed_at => null`
--   per l'account non ancora confermato. Lasciarlo al default significa testare il caso
--   opposto e vederlo verde. La suite 0016 lo dichiara esplicitamente in ogni riga.
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
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
