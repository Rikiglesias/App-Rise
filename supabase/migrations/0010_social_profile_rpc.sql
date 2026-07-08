-- Migration 0010 — completamento profilo social atomico (finding 236/241, GDPR Art.7)
-- Per i signup social (Apple/Google) il trigger handle_new_user NON scatta (nessun
-- birth_date nei metadati): profilo + prova di consenso venivano scritti da DUE round-trip
-- client separati e NON transazionali (profiles.upsert poi consent_events.insert). Se il
-- secondo falliva (rete/RLS/timeout) restava un profilo donatore SENZA riga nel ledger
-- append-only — cioè senza la "verità probatoria" che 0003 dichiara obbligatoria (Art.7).
--
-- Fix: un'unica RPC che scrive profilo + evento privacy_notice nella STESSA transazione
-- (tutto-o-niente). SECURITY INVOKER (non DEFINER): l'atomicità è data dalla funzione =
-- singola transazione, mentre la RLS resta il confine (l'utente scrive solo le proprie
-- righe via auth.uid()). handle_new_user usa DEFINER solo perché gira nel trigger dove
-- auth.uid() è null; qui la sessione è attiva → nessun bisogno di elevare i privilegi.

create or replace function public.complete_social_profile(
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_city text,
  p_province text,
  p_country text,
  p_birth_date text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_version text;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  -- Upsert idempotente (retry-safe): l'id è SEMPRE l'utente autenticato (mai client-supplied).
  -- NON tocca marketing_consent: la verità sta nel ledger, riscriverla azzererebbe un consenso
  -- marketing già concesso (coerente con la cache derivata, vedi 0008).
  insert into public.profiles (
    id, first_name, last_name, phone, city, province, country,
    birth_date, privacy_consent_at
  )
  values (
    v_uid,
    p_first_name,
    p_last_name,
    p_phone,
    p_city,
    nullif(p_province, ''),
    coalesce(nullif(p_country, ''), 'IT'),
    p_birth_date::date,
    now()
  )
  on conflict (id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = excluded.phone,
    city = excluded.city,
    province = excluded.province,
    country = excluded.country,
    birth_date = excluded.birth_date,
    privacy_consent_at = excluded.privacy_consent_at;

  -- Versione informativa server-trusted (ultima pubblicata), come handle_new_user.
  select version into v_version
  from public.policy_versions
  order by published_at desc
  limit 1;

  -- GDPR Art.7: prova di consenso nello stesso commit del profilo (atomico).
  insert into public.consent_events
    (user_id, purpose, action, policy_version, legal_basis, channel)
  values
    (v_uid, 'privacy_notice', 'granted', v_version, 'consent', 'social_signup');
end;
$$;

-- Superficie minima: solo gli utenti autenticati possono invocarla (mai anon/public).
revoke all on function public.complete_social_profile(text, text, text, text, text, text, text) from public;
revoke all on function public.complete_social_profile(text, text, text, text, text, text, text) from anon;
grant execute on function public.complete_social_profile(text, text, text, text, text, text, text) to authenticated;
