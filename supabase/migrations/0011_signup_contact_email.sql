-- Migration 0011 — contact_email popolata alla NASCITA del profilo (F-EMAIL.8)
--
-- Il buco: chi si registra con email e password ottiene un profilo con
-- `contact_email` VUOTA. Il form non la chiede (sarebbe lo stesso indirizzo che ha
-- appena digitato, nel punto di massimo abbandono) e il trigger non la scriveva →
-- la colonna resta null per tutti quelli nati da quel canale.
--
-- Perché conta più di quanto sembri: `contact_email` non serve solo a scrivere alla
-- persona — è la CHIAVE con cui la riconosceremo nell'anagrafica importata dal
-- partner (decisione 2026-07-25). Un profilo senza quella colonna non si aggancia al
-- suo storico, e la promessa fatta nella lettera («la persona risulta già
-- registrata») non avrebbe implementazione per metà degli account.
--
-- Cosa fa: nel ramo email/password (marker `birth_date`, invariato dalla 0004) scrive
--   coalesce(nullif(v_meta->>'contact_email',''), <email dell'account>)
-- cioè: se il client la manda esplicita vince quella; altrimenti si usa la mail
-- dell'account, che SU QUESTO CANALE è reale e verificata dalla conferma email.
--
-- Guardia relay: se la mail dell'account fosse un alias Apple, scriverla in
-- `contact_email` sarebbe PEGGIO del null — renderebbe il profilo «completo» con un
-- indirizzo che non è quello vero, spegnendo il sollecito che esiste apposta per
-- raccoglierlo (`missingProfileFields`). Sul percorso email/password non può
-- accadere, ma la difesa costa una riga e vale anche per gli usi futuri del trigger.
--
-- BASE DI PARTENZA = la versione della 0007, non quella della 0004: `country` e
-- `nullif(province,'')` sono arrivati lì, e ripartire dal corpo vecchio li avrebbe
-- CANCELLATI (country è NOT NULL → ogni registrazione sarebbe fallita).
--
-- PRIVILEGI: la 0006 revoca EXECUTE da public/anon/authenticated per togliere la
-- superficie RPC (la funzione resta invocabile dal trigger). `CREATE OR REPLACE
-- FUNCTION` NON tocca ownership e permessi di una funzione esistente (doc ufficiale
-- PostgreSQL, CREATE FUNCTION), quindi la revoca sopravvive; la si ripete qui lo
-- stesso — è idempotente e rende questa migration autonoma anche se un giorno
-- venisse applicata su un DB dove la funzione non esiste ancora (lì nascerebbe con
-- EXECUTE a PUBLIC).
--
-- BACKFILL: NON incluso, di proposito. Copiare `auth.users.email` nei profili
-- esistenti scriverebbe l'ALIAS per gli utenti Apple-hide, cioè proprio quelli per
-- cui la mail vera serve. I profili già nati restano null e vengono chiusi dal
-- sollecito applicativo, che ora vede il campo.
--
-- RIESEGUIBILE (come 0003/0005/0008/0009/0010): `create or replace function` +
-- `drop trigger if exists` + `revoke` sono tutti no-op alla seconda esecuzione.
-- Rollback: riapplicare la 0007 (che è la versione precedente del corpo).
--
-- NB ORDINE DI RILASCIO: nessun vincolo. È additiva e retro-compatibile — senza
-- questa migration il codice attuale continua a funzionare, la colonna resta null
-- esattamente come oggi.

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
  -- La mail dell'account vale come recapito solo se è un indirizzo vero: un alias
  -- Apple Private Relay non è la mail della persona e non deve finire in colonna.
  v_account_email text := case
    when new.email like '%@privaterelay.appleid.com' then null
    else new.email
  end;
  v_contact_email text := coalesce(
    nullif(v_meta->>'contact_email', ''),
    v_account_email
  );
begin
  -- Marker del form email: birth_date è sempre presente nel signup email, mai nel social.
  if v_meta ? 'birth_date' then
    insert into public.profiles (
      id, first_name, last_name, phone, city, province, country,
      birth_date, privacy_consent_at, marketing_consent, contact_email
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
      v_marketing,
      v_contact_email
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

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
