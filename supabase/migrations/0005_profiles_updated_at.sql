-- Migration 0005 — profiles.updated_at auto-mantenuto (fix S11)
-- 0001 imposta updated_at solo col default now() all'INSERT; nessun meccanismo lo
-- aggiorna sugli UPDATE (updateProfile, cache setMarketingConsent, scheduleDeletion,
-- cancelScheduledDeletion) → la colonna resta stale rispetto all'ultima modifica.
-- Trigger BEFORE UPDATE idempotente (create or replace + drop/create del trigger):
-- ri-eseguibile senza errori. NON modifica 0001 (già applicata).

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Rollback:
--   drop trigger if exists profiles_set_updated_at on public.profiles;
--   drop function if exists public.set_updated_at();
