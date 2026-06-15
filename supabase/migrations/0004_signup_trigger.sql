-- Migration 0004 — signup server-side (M6, fix Cluster A review pre-PR)
-- Con "Confirm email" ON, auth.signUp() NON restituisce sessione → l'insert profilo/consenso
-- lato client è bloccato da RLS (auth.uid() è null). Si ripristina l'approccio idiomatico Supabase
-- (design originale M1): un trigger SECURITY DEFINER su auth.users crea profilo + semina il ledger
-- consensi (Art.7) da raw_user_meta_data. Server-trusted: il client non può saltare la prova.

-- Crea il profilo e gli eventi di consenso iniziali per i signup EMAIL/PASSWORD.
-- Il social (Apple/Google) NON porta questi metadati → il trigger lo salta e il profilo
-- lo crea CompleteProfileScreen da sessione attiva (RLS soddisfatta).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb := new.raw_user_meta_data;
  v_version text;
  v_marketing boolean := coalesce((v_meta->>'marketing_consent')::boolean, false);
begin
  -- Marker del form email: birth_date è sempre presente nel signup email, mai nel social.
  if v_meta ? 'birth_date' then
    insert into public.profiles (
      id, first_name, last_name, phone, city, province,
      birth_date, privacy_consent_at, marketing_consent
    )
    values (
      new.id,
      v_meta->>'first_name',
      v_meta->>'last_name',
      v_meta->>'phone',
      v_meta->>'city',
      v_meta->>'province',
      (v_meta->>'birth_date')::date,
      now(),
      v_marketing
    );

    -- Versione informativa = ultima pubblicata (server-trusted, non client-supplied).
    select version into v_version
    from public.policy_versions
    order by published_at desc
    limit 1;

    insert into public.consent_events
      (user_id, purpose, action, policy_version, legal_basis, channel)
    values
      (new.id, 'privacy_notice', 'granted', v_version, 'consent', 'signup');

    if v_marketing then
      insert into public.consent_events
        (user_id, purpose, action, policy_version, legal_basis, channel)
      values
        (new.id, 'marketing', 'granted', v_version, 'consent', 'signup');
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- S4: vincola legal_basis ai soli valori ammessi (integrità probatoria del ledger Art.7).
alter table public.consent_events
  drop constraint if exists consent_legal_basis_chk;
alter table public.consent_events
  add constraint consent_legal_basis_chk check (legal_basis in ('consent', 'contract'));

-- S3: indice parziale per la query giornaliera di purge (purge-deletions Edge Function),
-- evita il full scan su profiles man mano che la tabella cresce.
create index if not exists profiles_deletion_idx
  on public.profiles (deletion_requested_at)
  where deletion_requested_at is not null;
