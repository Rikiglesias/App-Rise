-- Migration 0012 — email di contatto per utenti Apple Hide-My-Email
-- Con "Nascondi la mia email" (Sign in with Apple) la mail auth è una relay
-- @privaterelay.appleid.com: Apple inoltra al vero inbox SOLO da mittenti registrati nel
-- servizio relay e l'utente può disattivare l'alias in qualsiasi momento → affidarsi alla
-- relay è fragile per un'associazione donatori (ricevute, comunicazioni). Il form
-- "Completa profilo" chiede una mail di contatto REALE quando la mail auth è una relay;
-- qui aggiungiamo la colonna e la scriviamo nella STESSA transazione atomica del profilo.

alter table public.profiles
  add column if not exists contact_email text;

-- La firma della RPC cambia (nuovo parametro): in Postgres una funzione con arità diversa
-- è un OVERLOAD distinto, non un replace → droppiamo la 7-arg di 0010 e ricreiamo la 8-arg.
-- CREATE OR REPLACE da solo lascerebbe due funzioni omonime con firme diverse.
drop function if exists public.complete_social_profile(
  text, text, text, text, text, text, text
);

create or replace function public.complete_social_profile(
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_city text,
  p_province text,
  p_country text,
  p_birth_date text,
  p_contact_email text
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
  -- NON tocca marketing_consent (la verità sta nel ledger). contact_email = NULL se il client
  -- passa '' (utenti con mail auth già reale: email classica / Google).
  insert into public.profiles (
    id, first_name, last_name, phone, city, province, country,
    birth_date, contact_email, privacy_consent_at
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
    nullif(p_contact_email, ''),
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
    contact_email = excluded.contact_email,
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
revoke all on function public.complete_social_profile(
  text, text, text, text, text, text, text, text
) from public;
revoke all on function public.complete_social_profile(
  text, text, text, text, text, text, text, text
) from anon;
grant execute on function public.complete_social_profile(
  text, text, text, text, text, text, text, text
) to authenticated;
