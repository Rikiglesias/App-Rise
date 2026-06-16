-- Migration 0003 — consent ledger append-only (Milestone 4, GDPR Art.7)
-- Onere della prova (Art.7(1), EDPB §107-108): non basta un boolean su profiles;
-- serve un registro IMMUTABILE di ogni evento di consenso con la VERSIONE del testo mostrato.
-- profiles.marketing_consent resta come CACHE dello stato corrente; la verità probatoria è qui.

-- policy_versions creata PRIMA (consent_events.policy_version la referenzia).
create table if not exists public.policy_versions (
  version text primary key,                       -- es. 'privacy-2026-06-15'
  body text,                                      -- testo archiviato (o url)
  is_material boolean not null default true,      -- true => richiede re-consenso al cambio
  published_at timestamptz not null default now()
);

create table if not exists public.consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null check (purpose in ('privacy_notice','marketing','profiling')),
  action text not null check (action in ('granted','withdrawn')),
  policy_version text not null references public.policy_versions(version),
  legal_basis text not null,                      -- 'consent' | 'contract'
  channel text not null,                          -- es. 'ios:signup', 'android:profile_toggle'
  created_at timestamptz not null default now()
);

alter table public.policy_versions enable row level security;
alter table public.consent_events enable row level security;

-- policy_versions: lettura per utenti autenticati; scrittura solo lato admin/migration.
create policy "policy_versions_read" on public.policy_versions
  for select to authenticated using (true);

-- consent_events: l'utente legge e inserisce solo i propri eventi.
-- NESSUNA policy update/delete => ledger immutabile (immutabilità probatoria).
-- La cancellazione avviene solo via cascade (chiusura account) o job retention service_role.
create policy "consent_own_select" on public.consent_events
  for select using (auth.uid() = user_id);
create policy "consent_own_insert" on public.consent_events
  for insert with check (auth.uid() = user_id);

-- Stato corrente derivabile leggendo l'ultimo evento per (user, purpose).
create index if not exists consent_events_user_purpose_idx
  on public.consent_events (user_id, purpose, created_at desc);

-- Seed della prima versione policy (idempotente).
insert into public.policy_versions (version, body, is_material)
values ('privacy-2026-06-15', null, true)
on conflict (version) do nothing;
