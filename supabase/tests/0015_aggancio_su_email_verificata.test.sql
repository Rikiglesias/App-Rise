-- TEST migration 0015 — l'archivio si aggancia a un indirizzo verificato.
--
-- Questa suite è scritta come un ATTACCO, non come una verifica. Le prime tre prove
-- mettono in scena la persona ostile: un account vero che scrive nel proprio profilo
-- l'indirizzo di qualcun altro, e prova a leggerne i dati, a rubarne la scheda e a
-- cancellargliela. Sono le tre strade riprodotte dal vivo dall'audit del 2026-07-27.
-- ⚠️ Se un domani qualcuno riporta la chiave su `contact_email`, T1/T2/T3 diventano
-- rossi. È il loro unico scopo: sono l'allarme, non la documentazione.
-- Le altre provano che chiudendo l'attacco non si è rotto l'uso legittimo.
--
-- Prerequisiti: 0001→0014 applicate, poi 0015. Uno dei due shim.
-- Range di id dedicato (`…0200`+).

-- ---------------------------------------------------------------------------
-- Preparazione: Alice esiste solo nell'archivio storico (non si è ancora registrata:
-- è la posizione di tutte e 1352 le persone del file). Mallory ha un account vero.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, first_name, last_name, phone, city, province, country, source)
values ('00000000-0000-0000-0000-000000000201', 'alice@esempio.it',
        'Alice', 'Vittima', '+393330000201', 'Trieste', 'TS', 'IT', 'access');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000210', 'mallory@esempio.it');

-- Mallory crea il proprio profilo dichiarando come recapito l'indirizzo di Alice.
-- Il database lo accetta: `profiles_contact_email_chk` controlla la FORMA, non la
-- proprietà. È esattamente ciò che l'app permette di scrivere dal profilo.
insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-000000000210',
  'Mallory', 'Ostile', null, null, null, 'IT', '1990-01-01', now(),
  'alice@esempio.it'
);

-- ---------------------------------------------------------------------------
-- T1 (ATTACCO — LETTURA): i dati di Alice non devono finire nel profilo di Mallory.
-- ---------------------------------------------------------------------------
do $$
declare r record;
begin
  select phone, city, province into r from public.profiles
   where id = '00000000-0000-0000-0000-000000000210';

  if r.phone is not null or r.city is not null or r.province is not null then
    raise exception 'T1 FAIL — FALLA APERTA: Mallory ha letto i dati di Alice (tel=%, citta=%, prov=%)',
      coalesce(r.phone, '<null>'), coalesce(r.city, '<null>'), coalesce(r.province, '<null>');
  end if;
  raise notice 'T1 PASS: dichiarare l''indirizzo di un altro non ne rivela i dati';
end $$;

-- ---------------------------------------------------------------------------
-- T2 (ATTACCO — FURTO DELLA SCHEDA): la riga di Alice deve restare NON rivendicata,
-- altrimenti quando Alice si registra davvero non trova più il suo storico, in
-- silenzio, e non ha un account con cui accorgersene.
-- ---------------------------------------------------------------------------
do $$
declare v uuid;
begin
  select claimed_by into v from public.legacy_contacts
   where id = '00000000-0000-0000-0000-000000000201';

  if v is not null then
    raise exception 'T2 FAIL — FALLA APERTA: la scheda di Alice risulta rivendicata da %', v;
  end if;
  raise notice 'T2 PASS: la scheda di Alice non e'' stata rubata';
end $$;

-- ---------------------------------------------------------------------------
-- T3 (ATTACCO — CANCELLAZIONE): Mallory cancella il PROPRIO profilo (percorso
-- `own_delete`, che l'app espone). La riga di Alice deve sopravvivere.
-- ---------------------------------------------------------------------------
delete from public.profiles where id = '00000000-0000-0000-0000-000000000210';

do $$
declare n int;
begin
  select count(*) into n from public.legacy_contacts
   where id = '00000000-0000-0000-0000-000000000201';

  if n <> 1 then
    raise exception 'T3 FAIL — FALLA APERTA: Mallory ha cancellato la scheda di Alice';
  end if;
  raise notice 'T3 PASS: cancellarsi non porta via la scheda di un altro';
end $$;

-- ---------------------------------------------------------------------------
-- T4 (USO LEGITTIMO): Alice si registra DAVVERO, con il suo indirizzo. Ora deve
-- agganciarsi e ritrovare i propri dati. Senza questo test, T1-T3 sarebbero verdi
-- anche se avessimo semplicemente spento l'aggancio.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000211', 'alice@esempio.it');

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-000000000211',
  'Alice', 'Vittima', null, null, null, 'IT', '1985-05-05', now(),
  'alice@esempio.it'
);

do $$
declare r record;
begin
  select p.phone, p.city, p.province, l.claimed_by into r
  from public.profiles p
  join public.legacy_contacts l on l.id = '00000000-0000-0000-0000-000000000201'
  where p.id = '00000000-0000-0000-0000-000000000211';

  if r.claimed_by is distinct from '00000000-0000-0000-0000-000000000211'::uuid then
    raise exception 'T4 FAIL: Alice non ha agganciato la propria scheda (claimed_by = %)',
      coalesce(r.claimed_by::text, '<null>');
  end if;
  if r.phone is distinct from '+393330000201' or r.city is distinct from 'Trieste' then
    raise exception 'T4 FAIL: i dati storici non sono stati recuperati (%, %)',
      coalesce(r.phone, '<null>'), coalesce(r.city, '<null>');
  end if;
  raise notice 'T4 PASS: la persona vera si aggancia e ritrova i suoi dati';
end $$;

-- ---------------------------------------------------------------------------
-- T5 (IL RECAPITO SCELTO NON È PIÙ UNA CHIAVE, ed è voluto): chi si registra con un
-- indirizzo e dichiara come recapito un altro, si aggancia sull'indirizzo
-- dell'ACCOUNT. Fissa la conseguenza dichiarata nella 0015: `contact_email` resta un
-- recapito (a cosa scriviamo), non una prova (chi sei).
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, country, source)
values ('00000000-0000-0000-0000-000000000202', 'recapito@esempio.it',
        '+393330000202', 'Udine', 'IT', 'access');

insert into public.legacy_contacts (id, email_norm, phone, city, country, source)
values ('00000000-0000-0000-0000-000000000203', 'accesso@esempio.it',
        '+393330000203', 'Gorizia', 'IT', 'access');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000212', 'accesso@esempio.it');

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-000000000212',
  'Due', 'Indirizzi', null, null, null, 'IT', '1988-08-08', now(),
  'recapito@esempio.it'
);

do $$
declare r record;
begin
  select p.city,
         (select claimed_by from public.legacy_contacts where id = '00000000-0000-0000-0000-000000000202') as riga_recapito,
         (select claimed_by from public.legacy_contacts where id = '00000000-0000-0000-0000-000000000203') as riga_accesso
    into r
  from public.profiles p
  where p.id = '00000000-0000-0000-0000-000000000212';

  if r.riga_recapito is not null then
    raise exception 'T5 FAIL — FALLA APERTA: agganciata la riga del recapito DICHIARATO';
  end if;
  if r.riga_accesso is distinct from '00000000-0000-0000-0000-000000000212'::uuid then
    raise exception 'T5 FAIL: non agganciata la riga dell''indirizzo di ACCESSO';
  end if;
  if r.city is distinct from 'Gorizia' then
    raise exception 'T5 FAIL: city = %, attesa Gorizia (dalla riga dell''accesso)',
      coalesce(r.city, '<null>');
  end if;
  raise notice 'T5 PASS: vince l''indirizzo dell''account, non quello dichiarato';
end $$;

-- ---------------------------------------------------------------------------
-- T6 (OBLIO LEGITTIMO, ramo delle righe MAI rivendicate): chi si è registrato prima
-- del caricamento e poi cancella l'account deve portarsi via anche la riga storica
-- registrata sotto il suo indirizzo. È il motivo per cui il §4 della 0012 esiste, e
-- il fix non deve averlo spento.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000213', 'primadellarchivio@esempio.it');

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-000000000213',
  'Prima', 'Archivio', '+393330000213', 'Bari', 'BA', 'IT', '1970-07-07', now(),
  'primadellarchivio@esempio.it'
);

-- L'archivio arriva dopo: la riga nasce orfana.
insert into public.legacy_contacts (id, email_norm, phone, city, country, source)
values ('00000000-0000-0000-0000-000000000204', 'primadellarchivio@esempio.it',
        '+393330000299', 'Lecce', 'IT', 'access');

delete from public.profiles where id = '00000000-0000-0000-0000-000000000213';

do $$
declare n int;
begin
  select count(*) into n from public.legacy_contacts
   where id = '00000000-0000-0000-0000-000000000204';
  if n <> 0 then
    raise exception 'T6 FAIL: la riga storica e'' sopravvissuta alla cancellazione del suo proprietario';
  end if;
  raise notice 'T6 PASS: l''oblio raggiunge ancora le righe mai rivendicate';
end $$;

-- ---------------------------------------------------------------------------
-- T7 (GUARDIA RELAY): un alias Apple non pesca la riga di nessuno. La guardia ora
-- vive sull'indirizzo dell'account, dove gli alias effettivamente stanno.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, country, source)
values ('00000000-0000-0000-0000-000000000205', 'xyz789@privaterelay.appleid.com',
        '+393330000205', 'Palermo', 'IT', 'access');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000214', 'xyz789@privaterelay.appleid.com');

insert into public.profiles
  (id, first_name, last_name, birth_date, privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-000000000214',
  'Relay', 'Utente', '1991-01-01', now(), 'xyz789@privaterelay.appleid.com'
);

do $$
declare r record;
begin
  select p.phone, l.claimed_by into r
  from public.profiles p
  join public.legacy_contacts l on l.id = '00000000-0000-0000-0000-000000000205'
  where p.id = '00000000-0000-0000-0000-000000000214';

  if r.claimed_by is not null or r.phone is not null then
    raise exception 'T7 FAIL: un alias relay ha pescato una riga storica';
  end if;
  raise notice 'T7 PASS: la guardia relay e'' sopravvissuta al cambio di chiave';
end $$;

-- ---------------------------------------------------------------------------
-- T8 (RIESEGUIBILITÀ): un solo trigger per tipo dopo la seconda applicazione.
-- ---------------------------------------------------------------------------
do $$
declare n int;
begin
  select count(*) into n from pg_trigger t
   join pg_class c on c.oid = t.tgrelid
   where not t.tgisinternal and c.relname = 'profiles'
     and t.tgname in ('on_profile_claim_legacy', 'on_profile_purge_legacy');
  if n <> 2 then
    raise exception 'T8 FAIL: % trigger di aggancio/oblio, attesi 2', n;
  end if;

  if has_function_privilege('authenticated', 'public.claim_legacy_contact()', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.purge_legacy_contact()', 'EXECUTE') then
    raise exception 'T8 FAIL: superficie RPC aperta dopo il replace';
  end if;
  raise notice 'T8 PASS: due trigger, nessuna superficie RPC';
end $$;
