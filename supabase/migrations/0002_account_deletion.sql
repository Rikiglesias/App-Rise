-- Migration 0002 — cancellazione account (grace period opzionale, Milestone 3 GDPR)
-- NULL = account attivo; valorizzato = cancellazione programmata a +30 giorni.
-- L'hard-delete a scadenza è eseguito dalla Edge Function `purge-deletions` (Supabase Cron).
-- RLS: le policy esistenti own_update (set/clear) e own_select (lettura) coprono già questo campo.

-- Follow-up opzionale (a scala): indice parziale per il purge giornaliero
--   create index if not exists profiles_deletion_idx
--     on public.profiles (deletion_requested_at) where deletion_requested_at is not null;
alter table public.profiles
  add column if not exists deletion_requested_at timestamptz null;
