-- Migration 0011 — policy_version server-authoritative su consent_events (finding 211 + 231)
-- Due falle collegate della stessa colonna consent_events.policy_version:
--   211 (drift): il re-consenso dipendeva da una COSTANTE compilata nell'app
--       (CURRENT_POLICY_VERSION). Se il DB pubblica una nuova versione MATERIALE
--       dell'informativa ma la costante resta vecchia, il gate confronta contro la
--       versione vecchia — già accettata — e NESSUNO viene re-invitato al consenso.
--   231 (forgery): la INSERT policy consent_own_insert valida solo user_id, non il
--       contenuto → un client via PostgREST poteva scrivere policy_version arbitrario,
--       falsificando CONTRO quale testo il consenso è stato dato (valore probatorio Art.7).
--
-- Fix WRITE (qui): un trigger BEFORE INSERT timbra policy_version = ultima versione
-- pubblicata (order by published_at desc), IGNORANDO il valore inviato dal client — stesso
-- pattern di 0008 fix#1 (created_at) e fix#2 (marketing_consent cache). Ogni evento registra
-- SEMPRE la versione realmente corrente al momento della scrittura, immune a drift e forgery.
-- Fix READ (lato app, coordinato): il gate di re-consenso legge la versione latest a runtime
-- da policy_versions invece della costante (useAuthActions.getCurrentPolicy).
--
-- SECURITY DEFINER (come 0008 fix#2 profiles_sync_marketing_consent): deriva la versione
-- dalla tabella AUTORITATIVA per QUALSIASI chiamante (utente/service_role/handle_new_user-
-- definer), non solo per chi può leggere policy_versions via RLS. Un INVOKER, in un contesto
-- senza SELECT, farebbe fallback silenzioso alla costante → drift non chiuso. Nessun SQL
-- dinamico, nessun input dal client usato, search_path pinnato, EXECUTE revocato → zero
-- superficie RPC/escalation. handle_new_user (0004/0007) e la RPC 0010 già timbrano la latest:
-- il trigger la ri-timbra con lo stesso valore (idempotente, nessun effetto collaterale).

create or replace function public.consent_events_stamp_policy_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_version text;
begin
  select version into v_version
  from public.policy_versions
  order by published_at desc
  limit 1;
  -- Se esiste una versione pubblicata la impone; altrimenti lascia il valore inviato
  -- (che la FK a policy_versions garantisce comunque valido). policy_versions è sempre
  -- seminata (0003), quindi in pratica l'override avviene sempre.
  if v_version is not null then
    new.policy_version := v_version;
  end if;
  return new;
end;
$$;

-- Rimuove la superficie RPC (il trigger fira comunque: l'esecuzione via trigger non richiede
-- il grant — stesso pattern di 0008/0006).
revoke execute on function public.consent_events_stamp_policy_version() from public, anon, authenticated;

drop trigger if exists consent_events_stamp_policy_version on public.consent_events;
create trigger consent_events_stamp_policy_version
  before insert on public.consent_events
  for each row execute function public.consent_events_stamp_policy_version();
