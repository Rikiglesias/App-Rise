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
-- FIX #2 — profiles.marketing_consent deve derivare dal ledger (cache non forgiabile)
-- ----------------------------------------------------------------------------
-- `own_update` (0001:26 + 0006:17) permette al client di PATCHare profiles.marketing_consent
-- via REST senza scrivere in consent_events → cache e verità probatoria divergono. Questo
-- trigger rifiuta ogni CAMBIO di marketing_consent che NON corrisponde all'ultimo evento
-- 'marketing' dell'utente nel ledger (sia opt-in sia opt-out sono verificati). Poiché l'app
-- inserisce l'evento PRIMA di aggiornare la cache, il flusso legittimo passa; un PATCH diretto
-- senza evento coerente viene rifiutato.
-- SECURITY INVOKER: la SELECT su consent_events rispetta la RLS `consent_own_select`
-- (auth.uid() = user_id = new.id, perché own_update ammette solo la propria riga).
-- PERIMETRO (non un buco probatorio): il guard copre il path UPDATE. Un DELETE+INSERT della
-- propria riga profiles (own_delete + own_insert, 0001:28/25) può reinserire marketing_consent
-- divergente senza passare dal guard — edge AUTO-INFLITTO che tocca solo la CACHE; il ledger
-- consent_events (verità probatoria, append-only) resta immutato. Chiusura in profondità
-- (guard BEFORE INSERT + riordino di handle_new_user a eventi-prima-di-profilo) = follow-up.
-- L'ordinamento per created_at è affidabile per i dati scritti da qui in avanti (Fix #1 lo
-- timbra server-side); eventuali eventi pre-0008 con timestamp forgiato non sono normalizzati.
-- ============================================================================
create or replace function public.profiles_guard_marketing_consent()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  ledger_state boolean;
begin
  -- Interviene solo quando marketing_consent cambia davvero (edit profilo/altri campi = pass-through).
  if new.marketing_consent is distinct from old.marketing_consent then
    select (ce.action = 'granted')
      into ledger_state
      from public.consent_events ce
      where ce.user_id = new.id
        and ce.purpose = 'marketing'
      order by ce.created_at desc
      limit 1;

    -- Nessun evento marketing nel ledger ⇒ stato derivato = false (default probatorio).
    ledger_state := coalesce(ledger_state, false);

    if new.marketing_consent is distinct from ledger_state then
      raise exception
        'marketing_consent deve derivare da consent_events: registra prima l''evento nel ledger'
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.profiles_guard_marketing_consent() from public, anon, authenticated;

drop trigger if exists profiles_guard_marketing_consent on public.profiles;
create trigger profiles_guard_marketing_consent
  before update on public.profiles
  for each row execute function public.profiles_guard_marketing_consent();
