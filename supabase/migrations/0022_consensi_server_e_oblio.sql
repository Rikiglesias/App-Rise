-- C79 — timestamp server, cache marketing transazionale, oblio dopo cambio email.
-- SOLO nel repo: applicazione remota separata, dopo 0017-0021 e preflight C20.
-- Nessun UPDATE massivo di profiles o dei timestamp storici: gli scostamenti
-- preesistenti vanno contati e sottoposti a Riccardo PRIMA dell'applicazione.
--
-- now() è l'inizio transazione: eventi distinti possono avere lo stesso valore.
-- server_order è deciso dal trigger, mai dal client; 0 per gli eventi storici
-- (a parità di timestamp storico resta il tie-break id DESC, anche nel preflight).
-- La sequenza non viene resettata al secondo apply. Nessun nuovo grant.
begin;

create sequence if not exists public.consent_events_server_order_seq;
revoke all on sequence public.consent_events_server_order_seq from public, anon, authenticated;
alter table public.consent_events add column if not exists server_order bigint not null default 0;
create index if not exists consent_events_marketing_latest_idx
  on public.consent_events (user_id, created_at desc, server_order desc, id desc)
  where purpose = 'marketing';

create or replace function public.timbra_evento_consenso()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  -- Serializza gli eventi dello stesso profilo con gli UPDATE diretti. NO KEY
  -- UPDATE non confligge con il KEY SHARE della FK; nessun lock globale.
  if new.purpose = 'marketing' then
    perform 1 from public.profiles where id = new.user_id for no key update;
  end if;
  new.created_at := now();
  new.server_order := nextval('public.consent_events_server_order_seq'::regclass);
  return new;
end $$;

create or replace function public.allinea_marketing_da_evento()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_marketing boolean;
begin
  select e.action = 'granted' into v_marketing
    from public.consent_events e
   where e.user_id = new.user_id and e.purpose = 'marketing'
   order by e.created_at desc, e.server_order desc, e.id desc limit 1;
  update public.profiles p
     set marketing_consent = v_marketing
   where p.id = new.user_id
     and p.marketing_consent is distinct from v_marketing;
  -- Nessun catch: se il profilo non si aggiorna, anche l'INSERT viene annullato.
  return new;
end $$;

create or replace function public.proteggi_marketing_profilo()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.marketing_consent := coalesce((
    select e.action = 'granted' from public.consent_events e
     where e.user_id = new.id and e.purpose = 'marketing'
     order by e.created_at desc, e.server_order desc, e.id desc limit 1
  ), false);
  return new;
end $$;

revoke execute on function public.timbra_evento_consenso() from public, anon, authenticated;
revoke execute on function public.allinea_marketing_da_evento() from public, anon, authenticated;
revoke execute on function public.proteggi_marketing_profilo() from public, anon, authenticated;
drop trigger if exists on_consent_stamp_server on public.consent_events;
create trigger on_consent_stamp_server before insert on public.consent_events
  for each row execute function public.timbra_evento_consenso();
drop trigger if exists on_consent_marketing_sync on public.consent_events;
create trigger on_consent_marketing_sync after insert on public.consent_events
  for each row when (new.purpose = 'marketing') execute function public.allinea_marketing_da_evento();
-- UPDATE, non INSERT: alla registrazione il profilo precede gli eventi (0019).
-- Ogni UPDATE, anche solo city: una cache ereditata discordante va riallineata.
drop trigger if exists on_profile_marketing_guard on public.profiles;
create trigger on_profile_marketing_guard before update on public.profiles
  for each row execute function public.proteggi_marketing_profilo();

-- B8: la 0013 T2 vieta il CLAIM quando il recapito è scelto (B diverso da A).
-- Conserviamo quel contratto: questo legame serve SOLO all'oblio, senza claim
-- né precompilazione. Solo old.email verificata, mai contact_email dichiarata.
-- SET NULL è intenzionale: se nel frattempo un ALTRO utente rivendica la scheda,
-- i purge sotto la preservano e la FK non deve cancellarla per cascata.
alter table public.legacy_contacts add column if not exists oblio_user_id uuid
  references auth.users(id) on delete set null;
create index if not exists legacy_contacts_oblio_user_idx on public.legacy_contacts (oblio_user_id);

-- Corpo più recente: 0019. Claim/precompilazione restano subordinati a v_spostata.
create or replace function public.sync_contact_email_on_email_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_cambiata boolean := new.email is distinct from old.email;
  v_nuova_valida boolean := new.email is not null
    and new.email not like '%@privaterelay.appleid.com';
  v_vecchia_provata boolean := old.email_confirmed_at is not null;
  v_spostata boolean := false;
begin
  if not v_cambiata then return new; end if;
  -- Salva il legame prima di perdere A, anche con recapito B o non aggiornabile.
  -- Il catch riguarda SOLO l'assenza della tabella (rollback 0012).
  if v_vecchia_provata and nullif(btrim(old.email), '') is not null
     and lower(btrim(old.email)) not like '%@privaterelay.appleid.com' then
    begin
      update public.legacy_contacts set oblio_user_id = new.id
       where email_norm = lower(btrim(old.email)) and claimed_by is null
         and oblio_user_id is null;
    exception when undefined_table then null;
    end;
  end if;
  if not v_nuova_valida then return new; end if;
  begin
    update public.profiles set contact_email = btrim(new.email)
     where id = new.id and contact_email is not null
       and lower(btrim(contact_email)) = lower(btrim(old.email));
    v_spostata := found;
  exception when check_violation then return new;
  end;
  if v_spostata and v_vecchia_provata then
    begin
      update public.legacy_contacts set claimed_by = new.id, claimed_at = now()
       where email_norm = lower(btrim(old.email)) and claimed_by is null;
      if found then
        update public.profiles p
           set phone = case when nullif(btrim(p.phone), '') is null
                              and nullif(btrim(l.phone), '') is not null then l.phone else p.phone end,
               city = case when nullif(btrim(p.city), '') is null
                             and nullif(btrim(l.city), '') is not null then l.city else p.city end,
               province = case when coalesce(nullif(btrim(p.country), ''), 'IT') = 'IT'
                                 and coalesce(nullif(btrim(l.country), ''), 'IT') = 'IT'
                                 and nullif(btrim(p.province), '') is null
                                 and nullif(btrim(l.province), '') is not null then l.province else p.province end
          from public.legacy_contacts l
         where p.id = new.id and l.email_norm = lower(btrim(old.email));
      end if;
    exception when undefined_table or check_violation then return new;
    end;
  end if;
  return new;
end $$;

-- Corpi più recenti: 0016. La cancellazione del SOLO profilo deve coprire B8
-- come quella dell'account. L'indirizzo verificato corrente resta coperto.
create or replace function public.purge_legacy_contact()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_key text; v_confermata boolean;
begin
  begin
    delete from public.legacy_contacts
     where claimed_by = old.id or (oblio_user_id = old.id and claimed_by is null);
  exception when undefined_table then return old;
  end;
  select lower(btrim(u.email)), u.email_confirmed_at is not null into v_key, v_confermata
    from auth.users u where u.id = old.id;
  if v_key is not null and v_key <> '' and coalesce(v_confermata, false) then
    delete from public.legacy_contacts where email_norm = v_key and claimed_by is null;
  end if;
  return old;
end $$;

create or replace function public.purge_legacy_on_user_delete()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_key text := lower(btrim(old.email));
begin
  begin
    -- BEFORE DELETE vede ancora il legame, prima del SET NULL della FK.
    delete from public.legacy_contacts
     where oblio_user_id = old.id and (claimed_by is null or claimed_by = old.id);
    if v_key is not null and v_key <> '' and old.email_confirmed_at is not null then
      delete from public.legacy_contacts where email_norm = v_key and claimed_by is null;
    end if;
  exception when undefined_table then return old;
  end;
  return old;
end $$;

revoke execute on function public.sync_contact_email_on_email_change() from public, anon, authenticated;
revoke execute on function public.purge_legacy_contact() from public, anon, authenticated;
revoke execute on function public.purge_legacy_on_user_delete() from public, anon, authenticated;
commit;

-- Rollback (solo dopo decisione): togliere i tre trigger on_consent_stamp_server,
-- on_consent_marketing_sync, on_profile_marketing_guard e le rispettive funzioni;
-- ripristinare SOLO purge_legacy_contact/purge_legacy_on_user_delete dalla 0016 e
-- sync_contact_email_on_email_change dalla 0019, NON le migration intere.
-- Conservare le colonne/indici/sequenza finché non si è deciso come trattare i
-- legami di oblio già registrati. Rimuoverli subito riaprirebbe B8 sui dati vivi.
