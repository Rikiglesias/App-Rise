-- Migration 0008 — integrità probatoria del consent ledger (GDPR Art.7)
-- Chiude 2 falle emerse dall'audit login 360° (login-loop, 2026-07-07):
--   #1  consent_events.created_at è forgiabile via PostgREST → un client può retrodatare
--       o falsificare la cronologia dei consensi (distrugge il valore probatorio del ledger).
--   #2  profiles.marketing_consent è PATCHabile via REST bypassando il ledger → la cache
--       e la verità probatoria (consent_events) divergono senza lasciare traccia immutabile.
--
-- Entrambi i fix sono TRIGGER: backward-compatible con l'app corrente e self-contained
-- (nessun REVOKE di colonna, nessun cambio applicativo, nessun rischio di ordine di deploy).
-- L'app legittima scrive l'evento nel ledger PRIMA della cache (AuthContext.setMarketingConsent)
-- e il signup semina il ledger server-side (handle_new_user, 0004) → i trigger li lasciano passare.
-- Tutto idempotente (create or replace / drop trigger if exists).

-- ============================================================================
-- FIX #1 — created_at server-authoritative su consent_events
-- ----------------------------------------------------------------------------
-- La INSERT policy `consent_own_insert` valida SOLO user_id (0003:37-38). created_at ha
-- `default now()` ma PostgREST permette al client di fornirlo nel payload → retrodatazione.
-- L'immutabilità (nessuna policy UPDATE/DELETE) protegge gli eventi già scritti; questo trigger
-- protegge il TIMESTAMP al momento della scrittura, timbrandolo lato server e ignorando
-- qualunque valore inviato dal client. purpose/action restano vincolati dai CHECK di 0003/0004,
-- policy_version dalla FK a policy_versions, user_id dalla RLS.
-- ============================================================================
create or replace function public.consent_events_stamp_created_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Sempre server-side: qualsiasi created_at dal client viene scartato.
  new.created_at := now();
  return new;
end;
$$;

-- Rimuove la superficie RPC (il trigger fira comunque: l'esecuzione via trigger non richiede
-- il grant — stesso pattern di 0006 su handle_new_user/set_updated_at).
revoke execute on function public.consent_events_stamp_created_at() from public, anon, authenticated;

drop trigger if exists consent_events_stamp_created_at on public.consent_events;
create trigger consent_events_stamp_created_at
  before insert on public.consent_events
  for each row execute function public.consent_events_stamp_created_at();

-- ============================================================================
-- FIX #2 — profiles.marketing_consent = cache DERIVATA dal ledger (self-heal)
-- ----------------------------------------------------------------------------
-- `own_update` (0001:26 + 0006:17) permette al client di PATCHare profiles.marketing_consent
-- via REST senza scrivere in consent_events → cache e verità probatoria divergono. A ogni
-- UPDATE ricalcoliamo marketing_consent dall'ultimo evento 'marketing' del ledger, IGNORANDO
-- il valore inviato dal client:
--  • flusso app (setMarketingConsent inserisce PRIMA l'evento, POI aggiorna la cache): il
--    trigger deriva dall'evento appena scritto → stesso valore, nessun effetto collaterale;
--  • UPDATE diretto malevolo (marketing_consent=true senza evento): deriva dal ledger
--    (nessun 'granted') → false, forgiatura neutralizzata;
--  • self-heal: qualunque UPDATE del profilo riallinea la cache al ledger.
-- Scelto SYNC (sovrascrive) invece di GUARD (rifiuta): non rompe mai il flusso legittimo e
-- tiene marketing_consent una cache sempre coerente, fedele al design (0003:4). Consolidamento
-- di due 0008 divergenti (login-loop, opzione A): approccio sync + revoke execute.
-- Solo BEFORE UPDATE: l'INSERT (signup email `handle_new_user`, o social da CompleteProfile)
-- semina già marketing_consent + eventuale evento 'marketing' insieme e coerenti (0004:50-55).
-- SECURITY DEFINER (come handle_new_user): deriva dal ledger AUTORITATIVO bypassando la RLS,
-- così la cache è corretta per QUALSIASI chiamante (utente/service_role/admin), non solo per
-- chi può leggere consent_events. Nessun SQL dinamico, unico input = new.id, search_path
-- pinnato, EXECUTE revocato → zero superficie RPC/escalation.
-- ============================================================================
create or replace function public.profiles_sync_marketing_consent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.marketing_consent := coalesce((
    select ce.action = 'granted'
    from public.consent_events ce
    where ce.user_id = new.id
      and ce.purpose = 'marketing'
    order by ce.created_at desc
    limit 1
  ), false);
  return new;
end;
$$;

revoke execute on function public.profiles_sync_marketing_consent() from public, anon, authenticated;

-- Consolidamento idempotente: rimuove gli oggetti delle due versioni divergenti di questo 0008
-- (guard/reject + naming della migration parallela) così la ri-applicazione è pulita da
-- qualsiasi stato precedente.
drop trigger if exists profiles_guard_marketing_consent on public.profiles;
drop function if exists public.profiles_guard_marketing_consent();
drop trigger if exists profiles_sync_marketing_consent on public.profiles;
drop function if exists public.sync_marketing_consent_cache();
drop function if exists public.stamp_consent_created_at();
create trigger profiles_sync_marketing_consent
  before update on public.profiles
  for each row execute function public.profiles_sync_marketing_consent();
