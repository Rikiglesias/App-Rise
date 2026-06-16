-- Migration 0001 — profiles (area donatori, Milestone 1 auth)
-- 1:1 con auth.users. RLS: ogni utente accede solo alla propria riga.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text not null,
  city text not null,
  province text not null,
  birth_date date not null,
  privacy_consent_at timestamptz not null,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Età minima 18+ (consenso GDPR semplificato)
  constraint adult check (birth_date <= (now()::date - interval '18 years'))
);

alter table public.profiles enable row level security;

create policy "own_select" on public.profiles
  for select using (auth.uid() = id);
create policy "own_insert" on public.profiles
  for insert with check (auth.uid() = id);
create policy "own_update" on public.profiles
  for update using (auth.uid() = id);
create policy "own_delete" on public.profiles
  for delete using (auth.uid() = id);
