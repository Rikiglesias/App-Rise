-- Migration 0009 — data minimization dei PII nei metadati auth (GDPR Art.5(1)(c))
-- Chiude finding privacy dell'audit login 360° (login-loop, 2026-07-07, finding 216):
--   signUp() passa first_name/last_name/phone/city/province/birth_date in options.data →
--   Supabase li memorizza in auth.users.raw_user_meta_data e li espone come claim
--   `user_metadata` in OGNI JWT di access token (persistito su device, inviato a ogni
--   richiesta PostgREST/Edge Function). Supabase sconsiglia esplicitamente PII in
--   user_metadata. Dopo che handle_new_user copia i dati nella tabella profiles (protetta
--   da RLS), i valori RESTANO duplicati e ridondanti nei metadati.
--
-- FIX: al termine di handle_new_user (che gira AFTER INSERT su auth.users, 0004:63-65)
-- si rimuovono i campi PII da raw_user_meta_data con un self-UPDATE. È sicuro:
--   • AFTER INSERT: la riga auth.users esiste già → l'UPDATE la trova;
--   • il trigger è solo ON INSERT → l'UPDATE NON lo ri-scatena (nessuna ricorsione);
--   • i dati NON si perdono: sono già in public.profiles (unica fonte letta dall'app);
--   • nessun consumer legge questi metadati dopo il signup (l'app usa profiles; exportData
--     usa user.email/created_at/identities, non user_metadata).
-- Backward-compatible: la firma e il comportamento di creazione profilo/consensi sono
-- INVARIATI rispetto a 0007 (country incluso). Idempotente (create or replace).
--
-- NB: marketing_consent e country restano nei metadati (non PII; marketing_consent è già
-- nel ledger consent_events + cache profiles, ma non è un dato anagrafico identificativo).

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
  if v_meta ? 'birth_date' then
    insert into public.profiles (
      id, first_name, last_name, phone, city, province, country,
      birth_date, privacy_consent_at, marketing_consent
    )
    values (
      new.id,
      v_meta->>'first_name',
      v_meta->>'last_name',
      v_meta->>'phone',
      v_meta->>'city',
      nullif(v_meta->>'province', ''),
      coalesce(nullif(v_meta->>'country', ''), 'IT'),
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

    -- Data minimization: i dati anagrafici sono ora in profiles (RLS) → si rimuovono dai
    -- metadati auth per non esporli come claim JWT. Self-UPDATE su una riga già inserita
    -- (AFTER INSERT); non ri-scatena questo trigger (solo ON INSERT).
    update auth.users
    set raw_user_meta_data = raw_user_meta_data
      - 'first_name' - 'last_name' - 'phone' - 'city' - 'province' - 'birth_date'
    where id = new.id;
  end if;

  return new;
end;
$$;

-- Il trigger on_auth_user_created (0004) resta invariato (già AFTER INSERT): questa
-- migration ridefinisce solo il corpo della funzione.

-- ============================================================================
-- BACKFILL OPZIONALE (utenti ESISTENTI) — NON eseguito automaticamente.
-- ----------------------------------------------------------------------------
-- La ridefinizione sopra minimizza solo i signup FUTURI. Per rimuovere i PII già
-- duplicati nei metadati degli utenti esistenti, eseguire MANUALMENTE lo statement
-- seguente DOPO aver verificato che ogni utente interessato abbia il profilo in
-- public.profiles (i dati NON vanno persi). Il guard `exists(...profiles...)` evita di
-- strippare metadati di eventuali righe senza profilo. È una mutazione di massa su
-- auth.users della base donatori LIVE: eseguirla deliberatamente, non in migration
-- automatica (stessa cautela di 0008 sul backfill).
--
--   update auth.users u
--   set raw_user_meta_data = u.raw_user_meta_data
--     - 'first_name' - 'last_name' - 'phone' - 'city' - 'province' - 'birth_date'
--   where u.raw_user_meta_data ? 'birth_date'
--     and exists (select 1 from public.profiles p where p.id = u.id);
-- ============================================================================
