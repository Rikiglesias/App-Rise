-- Migration 0008 — integrità probatoria del consent ledger (fix login-loop, analisi 360°)
--
-- Chiude 2 falle di sicurezza/GDPR trovate dall'audit del login (bypass PostgREST del
-- client: RLS garantisce la PROPRIETÀ della riga ma non il CONTENUTO):
--
--  A. consent_events forgiabile: la INSERT policy (0003:37, riscritta 0006:21) valida
--     solo `auth.uid() = user_id`, non i campi. `created_at` ha `default now()` (0003:22)
--     ma il default si applica solo se la colonna è OMESSA → una POST diretta a
--     /rest/v1/consent_events può inviare un `created_at` FORGIATO (retrodatare una
--     revoca per contestare una campagna). Il ledger è dichiarato "prova immutabile"
--     Art.7 (0003:2-4): il timestamp deve fissarlo il SERVER.
--
--  B. marketing_consent scrivibile bypassando il ledger: `own_update` (0001:26) permette
--     al client di fare UPDATE diretto di `profiles.marketing_consent=true` via REST
--     SENZA il corrispondente evento nel ledger. La UI legge la CACHE `marketing_consent`
--     (non il ledger) → un consenso "attivo" senza prova reale. Il ledger consent_events
--     è la fonte di verità (0003:2-4): la cache va DERIVATA da esso, non fidata dal client.
--
-- Tutto idempotente (create or replace + drop trigger if exists).
-- ROLLBACK: drop trigger consent_events_stamp_created_at on public.consent_events;
--           drop function public.stamp_consent_created_at();
--           drop trigger profiles_sync_marketing_consent on public.profiles;
--           drop function public.sync_marketing_consent_cache();
-- NB: NON ancora applicata al DB live — applicare con `supabase db push` (o dashboard).

-- ─────────────────────────────────────────────────────────────────────────────
-- A. created_at del ledger fissato server-side (anti-retrodatazione)
-- ─────────────────────────────────────────────────────────────────────────────
-- Sovrascrive SEMPRE il created_at inviato dal client con l'ora server. Trasparente
-- per l'app (buildConsentInsert e handle_new_user non inviano created_at, si affidano
-- al default) e blocca un client che invii un timestamp forgiato. purpose/action
-- restano scelta legittima dell'utente sui PROPRI eventi: il vettore probatorio
-- critico è il TIMESTAMP, ed è quello che blindiamo.
create or replace function public.stamp_consent_created_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists consent_events_stamp_created_at on public.consent_events;
create trigger consent_events_stamp_created_at
  before insert on public.consent_events
  for each row execute function public.stamp_consent_created_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- B. marketing_consent derivato dal ledger (anti-bypass della cache)
-- ─────────────────────────────────────────────────────────────────────────────
-- `marketing_consent` su profiles è una CACHE: ad ogni UPDATE la ricalcoliamo
-- dall'ultimo evento 'marketing' del ledger, IGNORANDO il valore inviato dal client.
-- Effetti:
--  • flusso app (setMarketingConsent inserisce PRIMA l'evento, POI aggiorna la cache):
--    il trigger deriva dall'evento appena scritto → stesso valore, nessun cambiamento;
--  • UPDATE diretto malevolo via REST (marketing_consent=true senza evento):
--    il trigger deriva dal ledger (nessun 'granted') → false, la forgiatura è neutralizzata;
--  • self-heal: un qualsiasi UPDATE del profilo riallinea la cache al ledger.
-- Solo BEFORE UPDATE: l'INSERT (signup email da handle_new_user, o social da
-- CompleteProfileScreen) è già coerente (marketing_consent + eventuale evento 'marketing'
-- seminati insieme, 0004:50-55). SECURITY DEFINER (come handle_new_user): deriva dal
-- ledger AUTORITATIVO bypassando la RLS, così la cache è corretta per QUALSIASI chiamante
-- (utente, service_role, admin futuro), non solo per chi può leggere consent_events. Nessun
-- SQL dinamico, unico input = new.id (la riga stessa), search_path pinnato → zero escalation.
create or replace function public.sync_marketing_consent_cache()
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

drop trigger if exists profiles_sync_marketing_consent on public.profiles;
create trigger profiles_sync_marketing_consent
  before update on public.profiles
  for each row execute function public.sync_marketing_consent_cache();
