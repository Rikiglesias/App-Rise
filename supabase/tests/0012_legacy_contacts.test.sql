-- TEST migration 0012 — legacy_contacts e l'aggancio dell'anagrafica storica.
-- Assert espliciti, mai vacui.
--
-- Il test non rilegge il sorgente della funzione (direbbe solo che la migration ha
-- scritto ciò che dice di scrivere): fa nascere utenti veri accanto a righe storiche
-- vere e guarda cosa ne esce. Le metà che contano davvero sono l'asse negativo — che
-- il form VINCA sull'archivio, che una riga già rivendicata non venga strappata, che
-- l'alias Apple non agganci nulla, che i consensi NON si ereditino, e che la
-- cancellazione dell'account porti via anche la riga storica.
--
-- Prerequisiti: 0001→0011 applicate, poi 0012. Uno dei due shim (permissive o
-- restrictive): la 0012 non concede grant, quindi l'esito deve essere identico.

-- ---------------------------------------------------------------------------
-- Setup: l'archivio storico, come arriverebbe dall'import.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts
  (id, email_norm, first_name, last_name, phone, city, province, country, birth_date, source)
values
  ('00000000-0000-0000-0000-0000000000f1', 'storico@esempio.it',
   'Giulia', 'Neri', '+393339990001', 'Bologna', 'BO', 'IT', '1975-06-06', 'access'),
  ('00000000-0000-0000-0000-0000000000f2', 'completo@esempio.it',
   'Paolo', 'Gialli', '+393339990002', 'Firenze', 'FI', 'IT', '1970-07-07', 'access'),
  ('00000000-0000-0000-0000-0000000000f3', 'gia.preso@esempio.it',
   'Marco', 'Blu', '+393339990003', 'Napoli', 'NA', 'IT', '1988-08-08', 'access'),
  ('00000000-0000-0000-0000-0000000000f4', 'maiuscole@esempio.it',
   'Sara', 'Viola', '+393339990004', 'Genova', 'GE', 'IT', '1995-09-09', 'access'),
  ('00000000-0000-0000-0000-0000000000f5', 'abc123xyz@privaterelay.appleid.com',
   'Trappola', 'Relay', '+393339990005', 'Palermo', 'PA', 'IT', '1991-10-10', 'access');

-- ---------------------------------------------------------------------------
-- T1: la persona si registra con la mail che sta nell'archivio → la riga viene
-- rivendicata E i campi che il form ha lasciato vuoti vengono colmati.
-- È la ragione per cui tutta questa fase esiste.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e1',
  'storico@esempio.it',
  jsonb_build_object(
    'first_name', 'Giulia', 'last_name', 'Neri',
    'country', 'IT', 'birth_date', '1975-06-06'
  )  -- niente phone/city/province: dopo la 0010 sono facoltativi
);

do $$
declare r record;
begin
  select p.phone, p.city, p.province, l.claimed_by, l.claimed_at
    into r
  from public.profiles p
  join public.legacy_contacts l on l.id = '00000000-0000-0000-0000-0000000000f1'
  where p.id = '00000000-0000-0000-0000-0000000000e1';

  if r.claimed_by is distinct from '00000000-0000-0000-0000-0000000000e1'::uuid then
    raise exception 'T1 FAIL: claimed_by = %, atteso l''utente appena nato', coalesce(r.claimed_by::text, '<null>');
  end if;
  if r.claimed_at is null then
    raise exception 'T1 FAIL: claimed_by valorizzato ma claimed_at null';
  end if;
  if r.phone is distinct from '+393339990001'
     or r.city is distinct from 'Bologna'
     or r.province is distinct from 'BO' then
    raise exception 'T1 FAIL: campi non colmati (phone=%, city=%, province=%)',
      coalesce(r.phone, '<null>'), coalesce(r.city, '<null>'), coalesce(r.province, '<null>');
  end if;
  raise notice 'T1 PASS: riga storica rivendicata e campi vuoti colmati';
end $$;

-- ---------------------------------------------------------------------------
-- T2 (ASSE NEGATIVO): quello che la persona ha appena scritto VINCE sull'archivio.
-- Se questo assert cade, un dato vecchio sovrascrive silenziosamente un dato
-- fresco fornito dall'interessato: non è un recupero, è una regressione.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e2',
  'completo@esempio.it',
  jsonb_build_object(
    'first_name', 'Paolo', 'last_name', 'Gialli',
    'phone', '+393338880002', 'city', 'Prato', 'province', 'PO',
    'country', 'IT', 'birth_date', '1970-07-07'
  )
);

do $$
declare r record;
begin
  select phone, city, province into r from public.profiles
  where id = '00000000-0000-0000-0000-0000000000e2';
  if r.phone is distinct from '+393338880002'
     or r.city is distinct from 'Prato'
     or r.province is distinct from 'PO' then
    raise exception 'T2 FAIL: l''archivio ha sovrascritto il form (phone=%, city=%, province=%)',
      coalesce(r.phone, '<null>'), coalesce(r.city, '<null>'), coalesce(r.province, '<null>');
  end if;
  raise notice 'T2 PASS: il form vince sull''archivio';
end $$;

-- ---------------------------------------------------------------------------
-- T3 (ASSE NEGATIVO): una riga GIÀ rivendicata non viene strappata. La guardia
-- `and claimed_by is null` è ciò che rende l'operazione ripetibile senza danni.
-- ---------------------------------------------------------------------------
update public.legacy_contacts
   set claimed_by = '00000000-0000-0000-0000-0000000000e1',
       claimed_at = now()
 where id = '00000000-0000-0000-0000-0000000000f3';

insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e3',
  'gia.preso@esempio.it',
  jsonb_build_object(
    'first_name', 'Marco', 'last_name', 'Blu',
    'country', 'IT', 'birth_date', '1988-08-08'
  )
);

do $$
declare r record;
begin
  select l.claimed_by, p.phone into r
  from public.legacy_contacts l
  join public.profiles p on p.id = '00000000-0000-0000-0000-0000000000e3'
  where l.id = '00000000-0000-0000-0000-0000000000f3';

  if r.claimed_by is distinct from '00000000-0000-0000-0000-0000000000e1'::uuid then
    raise exception 'T3 FAIL: la riga è stata strappata al primo rivendicante (claimed_by=%)',
      coalesce(r.claimed_by::text, '<null>');
  end if;
  if r.phone is not null then
    raise exception 'T3 FAIL: il profilo nuovo ha pescato dati da una riga non sua (phone=%)', r.phone;
  end if;
  raise notice 'T3 PASS: una riga già rivendicata non si strappa';
end $$;

-- ---------------------------------------------------------------------------
-- T4: l'aggancio è insensibile alle maiuscole nella mail dell'account. È il motivo
-- per cui la colonna si chiama email_norm: 'Mario@X.it' e 'mario@x.it' sono la
-- stessa persona, e due righe che non si riconoscono sono il difetto che questa
-- fase esiste per evitare.
-- Sugli SPAZI non c'è un test perché non possono arrivare fin qui: la CHECK
-- `profiles_contact_email_chk` (0009) rifiuta qualunque email che contenga spazi,
-- e il profilo non nascerebbe affatto. Il `btrim` nella 0012 resta come difesa
-- ridondante, non come comportamento verificabile da qui.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e4',
  'MAIUSCOLE@Esempio.IT',
  jsonb_build_object(
    'first_name', 'Sara', 'last_name', 'Viola',
    'country', 'IT', 'birth_date', '1995-09-09'
  )
);

do $$
declare v uuid;
begin
  select claimed_by into v from public.legacy_contacts
  where id = '00000000-0000-0000-0000-0000000000f4';
  if v is distinct from '00000000-0000-0000-0000-0000000000e4'::uuid then
    raise exception 'T4 FAIL: nessun aggancio con mail in maiuscolo (claimed_by=%)',
      coalesce(v::text, '<null>');
  end if;
  raise notice 'T4 PASS: l''aggancio è insensibile alle maiuscole';
end $$;

-- ---------------------------------------------------------------------------
-- T5 (ASSE NEGATIVO): un alias Apple Private Relay non aggancia NIENTE. La 0011
-- lo azzera prima di arrivare in colonna; qui si verifica che non venga usato
-- nemmeno come chiave di ricerca — altrimenti basterebbe conoscere un alias per
-- pescare la riga storica di qualcun altro.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e5',
  'abc123xyz@privaterelay.appleid.com',
  jsonb_build_object(
    'first_name', 'Luca', 'last_name', 'Verdi',
    'country', 'IT', 'birth_date', '1991-10-10'
  )
);

do $$
declare r record;
begin
  select l.claimed_by, p.phone, p.contact_email into r
  from public.legacy_contacts l
  join public.profiles p on p.id = '00000000-0000-0000-0000-0000000000e5'
  where l.id = '00000000-0000-0000-0000-0000000000f5';

  if r.claimed_by is not null then
    raise exception 'T5 FAIL: un alias relay ha rivendicato una riga storica';
  end if;
  if r.phone is not null then
    raise exception 'T5 FAIL: profilo colmato da una riga mai rivendicata (phone=%)', r.phone;
  end if;
  if r.contact_email is not null then
    raise exception 'T5 FAIL: regressione 0011, l''alias è finito in contact_email';
  end if;
  raise notice 'T5 PASS: l''alias Apple non aggancia e non viene scritto';
end $$;

-- ---------------------------------------------------------------------------
-- T6 (Art. 7): i consensi NON si ereditano. La riga storica precompila dei dati,
-- non porta con sé un consenso. L'utente T1 ha rivendicato una riga: deve avere
-- ESATTAMENTE il consenso raccolto alla registrazione, né uno in più né uno di
-- provenienza diversa.
-- ---------------------------------------------------------------------------
do $$
declare n_privacy int; n_tot int; v_consent timestamptz;
begin
  select count(*) filter (where purpose = 'privacy_notice'), count(*)
    into n_privacy, n_tot
  from public.consent_events
  where user_id = '00000000-0000-0000-0000-0000000000e1';

  if n_privacy <> 1 or n_tot <> 1 then
    raise exception 'T6 FAIL: % eventi di consenso (% privacy), atteso 1 e 1', n_tot, n_privacy;
  end if;

  select privacy_consent_at into v_consent from public.profiles
  where id = '00000000-0000-0000-0000-0000000000e1';
  if v_consent is null then
    raise exception 'T6 FAIL: privacy_consent_at nullo su un profilo appena nato';
  end if;
  raise notice 'T6 PASS: nessun consenso ereditato dall''archivio';
end $$;

-- ---------------------------------------------------------------------------
-- T7 (OBLIO): cancellato l'account, la riga storica rivendicata sparisce con lui.
-- È la ragione per cui claimed_by è `on delete cascade` e non `set null`: con
-- set null la cancellazione dipenderebbe da un trigger che legge una colonna che
-- le azioni FK possono aver già azzerato (l'ordine fra azioni referenziali sullo
-- stesso delete non è garantito da PostgreSQL) → sparizione mancata, in silenzio.
-- ---------------------------------------------------------------------------
delete from auth.users where id = '00000000-0000-0000-0000-0000000000e4';

do $$
declare n int;
begin
  select count(*) into n from public.legacy_contacts
  where id = '00000000-0000-0000-0000-0000000000f4';
  if n <> 0 then
    raise exception 'T7 FAIL: la riga storica è sopravvissuta alla cancellazione dell''account';
  end if;
  raise notice 'T7 PASS: l''oblio arriva anche all''archivio storico';
end $$;

-- ---------------------------------------------------------------------------
-- T8 (ASSE NEGATIVO): una riga MAI rivendicata NON viene toccata dalla
-- cancellazione di un altro account. La cascata deve colpire solo chi ha
-- rivendicato, non svuotare l'archivio.
-- ---------------------------------------------------------------------------
do $$
declare n int;
begin
  select count(*) into n from public.legacy_contacts
  where id = '00000000-0000-0000-0000-0000000000f5' and claimed_by is null;
  if n <> 1 then
    raise exception 'T8 FAIL: la riga mai rivendicata non è più al suo posto (n=%)', n;
  end if;
  raise notice 'T8 PASS: la cascata colpisce solo le righe rivendicate';
end $$;

-- ---------------------------------------------------------------------------
-- T9: il CHECK di normalizzazione RIFIUTA una riga importata male. Senza, la riga
-- entrerebbe e non verrebbe agganciata mai — un fallimento invisibile.
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    insert into public.legacy_contacts (email_norm, source)
    values ('  Sporca@Esempio.IT ', 'access');
    raise exception 'T9 FAIL: una email non normalizzata è stata accettata';
  exception when check_violation then
    null;  -- atteso
  end;

  begin
    insert into public.legacy_contacts (email_norm, source) values ('', 'access');
    raise exception 'T9 FAIL: una email vuota è stata accettata';
  exception when check_violation then
    null;  -- atteso
  end;

  raise notice 'T9 PASS: il CHECK ferma le righe importate male';
end $$;

-- ---------------------------------------------------------------------------
-- T10: claimed_by e claimed_at si muovono insieme. Uno stato a metà renderebbe
-- impossibile sapere QUANDO una riga è stata rivendicata (e il conteggio delle
-- non rivendicate mentirebbe).
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    update public.legacy_contacts
       set claimed_by = '00000000-0000-0000-0000-0000000000e1', claimed_at = null
     where id = '00000000-0000-0000-0000-0000000000f5';
    raise exception 'T10 FAIL: claim a metà accettato';
  exception when check_violation then
    null;  -- atteso
  end;
  raise notice 'T10 PASS: il claim non può restare a metà';
end $$;

-- ---------------------------------------------------------------------------
-- T11 (SUPERFICIE): il client non vede questa tabella. Sono dati di persone che
-- non hanno un account e non hanno acconsentito a nulla presso di noi: una
-- lettura «per email» direbbe a chiunque se un certo indirizzo è nel nostro
-- archivio. RLS è attiva e senza policy, ma qui si verifica anche il GRANT —
-- perché con default privileges permissivi i ruoli client lo erediterebbero.
-- ---------------------------------------------------------------------------
do $$
declare v boolean; n int;
begin
  foreach v in array array[
    has_table_privilege('anon',          'public.legacy_contacts', 'SELECT'),
    has_table_privilege('anon',          'public.legacy_contacts', 'INSERT'),
    has_table_privilege('authenticated', 'public.legacy_contacts', 'SELECT'),
    has_table_privilege('authenticated', 'public.legacy_contacts', 'INSERT'),
    has_table_privilege('authenticated', 'public.legacy_contacts', 'UPDATE'),
    has_table_privilege('authenticated', 'public.legacy_contacts', 'DELETE')
  ] loop
    if v then
      raise exception 'T11 FAIL: un ruolo client ha privilegi su legacy_contacts';
    end if;
  end loop;

  select count(*) into n from pg_policies
  where schemaname = 'public' and tablename = 'legacy_contacts';
  if n <> 0 then
    raise exception 'T11 FAIL: % policy su legacy_contacts, attese 0', n;
  end if;

  if not (select relrowsecurity from pg_class where oid = 'public.legacy_contacts'::regclass) then
    raise exception 'T11 FAIL: RLS non attiva su legacy_contacts';
  end if;
  raise notice 'T11 PASS: nessun accesso client, RLS attiva, zero policy';
end $$;

-- ---------------------------------------------------------------------------
-- T12 (NON-REGRESSIONE): la 0012 NON riscrive `handle_new_user`, e questo test è la
-- prova che quel corpo è rimasto quello della 0011. Se un domani qualcuno la
-- riscrivesse ripartendo dalla 0007 o dalla 0004, contact_email e la guardia relay
-- sparirebbero — e dalla 0004 anche country e la provincia estera. Tutto verificato
-- in un colpo solo, su un profilo estero.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e6',
  'pierre@exemple.fr',
  jsonb_build_object(
    'first_name', 'Pierre', 'last_name', 'Dupont',
    'phone', '+33123456789', 'city', 'Parigi', 'province', '',
    'country', 'FR', 'birth_date', '1980-03-03'
  )
);

do $$
declare r record;
begin
  select country, province, contact_email into r from public.profiles
  where id = '00000000-0000-0000-0000-0000000000e6';
  if r.country is distinct from 'FR' then
    raise exception 'T12 FAIL: country = %, atteso FR', coalesce(r.country, '<null>');
  end if;
  if r.province is not null then
    raise exception 'T12 FAIL: province = %, attesa null per l''estero', r.province;
  end if;
  if r.contact_email is distinct from 'pierre@exemple.fr' then
    raise exception 'T12 FAIL: contact_email = %, regressione sulla 0011', coalesce(r.contact_email, '<null>');
  end if;
  raise notice 'T12 PASS: country, provincia estera e contact_email sopravvivono al replace';
end $$;

-- ---------------------------------------------------------------------------
-- T13 (NON-REGRESSIONE): il SOCIAL non porta `birth_date` → nessun profilo creato
-- dal trigger, e quindi nessun aggancio. Se questo assert cade, il trigger ha
-- iniziato a creare profili senza consenso raccolto: buco Art. 7.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e7',
  'storico@esempio.it',
  jsonb_build_object('name', 'Social User')
);

do $$
declare n int;
begin
  select count(*) into n from public.profiles
  where id = '00000000-0000-0000-0000-0000000000e7';
  if n <> 0 then
    raise exception 'T13 FAIL: il trigger ha creato % profili per un signup social', n;
  end if;
  raise notice 'T13 PASS: il social resta fuori dal trigger e non aggancia';
end $$;

-- ---------------------------------------------------------------------------
-- T14: la superficie RPC resta chiusa (0006 + ripetuta qui per autonomia).
-- ---------------------------------------------------------------------------
do $$
declare v boolean;
begin
  foreach v in array array[
    has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE'),
    has_function_privilege('authenticated', 'public.handle_new_user()', 'EXECUTE'),
    has_function_privilege('anon', 'public.claim_legacy_contact()', 'EXECUTE'),
    has_function_privilege('authenticated', 'public.claim_legacy_contact()', 'EXECUTE'),
    has_function_privilege('anon', 'public.purge_legacy_contact()', 'EXECUTE'),
    has_function_privilege('authenticated', 'public.purge_legacy_contact()', 'EXECUTE')
  ] loop
    if v then
      raise exception 'T14 FAIL: EXECUTE su una funzione del signup è ancora concesso';
    end if;
  end loop;
  raise notice 'T14 PASS: nessun EXECUTE per anon/authenticated';
end $$;

-- ---------------------------------------------------------------------------
-- T15: la migration è RIESEGUIBILE. Il runner la concatena una seconda volta
-- prima di arrivare qui; qui si verifica che il secondo giro non abbia lasciato
-- DUE trigger (che farebbe partire l'insert del profilo due volte) né duplicato
-- l'indice sulla FK.
-- ---------------------------------------------------------------------------
do $$
declare n int;
begin
  select count(*) into n from pg_trigger
  where tgrelid = 'auth.users'::regclass
    and tgname = 'on_auth_user_created'
    and not tgisinternal;
  if n <> 1 then
    raise exception 'T15 FAIL: % trigger on_auth_user_created, atteso 1', n;
  end if;

  select count(*) into n from pg_trigger
  where tgrelid = 'public.profiles'::regclass
    and tgname in ('on_profile_claim_legacy', 'on_profile_purge_legacy')
    and not tgisinternal;
  if n <> 2 then
    raise exception 'T15 FAIL: % trigger legacy su profiles, attesi 2 (aggancio + oblio)', n;
  end if;

  select count(*) into n from pg_indexes
  where schemaname = 'public' and indexname = 'legacy_contacts_claimed_by_idx';
  if n <> 1 then
    raise exception 'T15 FAIL: % indici legacy_contacts_claimed_by_idx, atteso 1', n;
  end if;
  raise notice 'T15 PASS: un solo trigger e un solo indice dopo la riesecuzione';
end $$;

-- ---------------------------------------------------------------------------
-- T16 (IL CASO CHE HA SPOSTATO IL TRIGGER): un profilo può nascere anche
-- dall'`upsert` dell'app (`useProfileForm.ts:287`), senza passare da
-- `handle_new_user`. Finché l'aggancio viveva dentro quella funzione, chi arrivava
-- da qui non vedeva mai il proprio storico — in silenzio, senza errori. Qui si
-- simula esattamente quel percorso: utente SENZA `birth_date` nei metadati (il
-- trigger su auth.users non crea nulla), profilo inserito a mano dopo.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, province, source)
values ('00000000-0000-0000-0000-0000000000f6', 'daapp@esempio.it',
        '+393339990006', 'Verona', 'VR', 'access');

insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e8',
  'daapp@esempio.it',
  jsonb_build_object('name', 'Nato Dall App')   -- niente birth_date → nessun profilo
);

do $$
declare n int;
begin
  select count(*) into n from public.profiles
  where id = '00000000-0000-0000-0000-0000000000e8';
  if n <> 0 then
    raise exception 'T16 SETUP FAIL: il profilo esiste già, il percorso simulato non è quello dell''app';
  end if;
end $$;

insert into public.profiles
  (id, first_name, last_name, birth_date, privacy_consent_at, country, contact_email)
values (
  '00000000-0000-0000-0000-0000000000e8',
  'Nato', 'DallApp', '1983-04-04', now(), 'IT', 'daapp@esempio.it'
);

do $$
declare r record;
begin
  select p.phone, p.city, p.province, l.claimed_by
    into r
  from public.profiles p
  join public.legacy_contacts l on l.id = '00000000-0000-0000-0000-0000000000f6'
  where p.id = '00000000-0000-0000-0000-0000000000e8';

  if r.claimed_by is distinct from '00000000-0000-0000-0000-0000000000e8'::uuid then
    raise exception 'T16 FAIL: profilo nato dall''app, riga storica NON rivendicata (claimed_by=%)',
      coalesce(r.claimed_by::text, '<null>');
  end if;
  if r.phone is distinct from '+393339990006'
     or r.city is distinct from 'Verona'
     or r.province is distinct from 'VR' then
    raise exception 'T16 FAIL: campi non colmati sul percorso app (phone=%, city=%, province=%)',
      coalesce(r.phone, '<null>'), coalesce(r.city, '<null>'), coalesce(r.province, '<null>');
  end if;
  raise notice 'T16 PASS: anche il profilo nato dall''app aggancia il suo storico';
end $$;

-- ---------------------------------------------------------------------------
-- T17 (IL PERCORSO REALE DELL'APP): T16 inserisce come superuser, ma l'app scrive
-- come `authenticated`, con RLS attiva su `profiles` e ZERO privilegi su
-- `legacy_contacts`. Che il trigger funzioni comunque è la premessa su cui poggia
-- tutto il meccanismo — `security definer` gira come proprietario della funzione e
-- quindi supera sia i grant mancanti sia la RLS — e va VERIFICATA, non assunta.
-- Se questo assert cade, l'aggancio funziona solo nei test e mai nell'app.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, province, source)
values ('00000000-0000-0000-0000-0000000000f7', 'comeapp@esempio.it',
        '+393339990007', 'Trieste', 'TS', 'access');

insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e9',
  'comeapp@esempio.it',
  jsonb_build_object('name', 'Come L App')   -- niente birth_date → nessun profilo dal trigger
);

-- Precondizione DICHIARATA, non ambientale: nel progetto reale `authenticated` può
-- scrivere su `profiles` grazie ai default privileges di Supabase (è ciò che modella
-- lo shim permissivo); lo shim restrittivo li toglie di proposito, e senza questo
-- grant il test misurerebbe l'assenza di un permesso su `profiles` invece del
-- comportamento del trigger. Il grant è scaffolding del test: viene revocato subito
-- dopo, e non tocca `legacy_contacts` (su cui T11 pretende zero privilegi).
grant select, insert on public.profiles to authenticated;

set role authenticated;
set "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000000e9';

insert into public.profiles
  (id, first_name, last_name, birth_date, privacy_consent_at, country, contact_email)
values (
  '00000000-0000-0000-0000-0000000000e9',
  'Come', 'LApp', '1986-06-06', now(), 'IT', 'comeapp@esempio.it'
);

reset role;
revoke select, insert on public.profiles from authenticated;

do $$
declare r record;
begin
  select p.phone, p.city, l.claimed_by into r
  from public.profiles p
  join public.legacy_contacts l on l.id = '00000000-0000-0000-0000-0000000000f7'
  where p.id = '00000000-0000-0000-0000-0000000000e9';

  if r.claimed_by is distinct from '00000000-0000-0000-0000-0000000000e9'::uuid then
    raise exception 'T17 FAIL: scrivendo come authenticated la riga NON è stata rivendicata (claimed_by=%)',
      coalesce(r.claimed_by::text, '<null>');
  end if;
  if r.phone is distinct from '+393339990007' or r.city is distinct from 'Trieste' then
    raise exception 'T17 FAIL: campi non colmati sul percorso authenticated (phone=%, city=%)',
      coalesce(r.phone, '<null>'), coalesce(r.city, '<null>');
  end if;
  raise notice 'T17 PASS: l''aggancio regge anche scrivendo come authenticated';
end $$;

-- Pulizia: le righe di prova non devono sopravvivere al test. I profili scendono
-- per cascata (profiles.id references auth.users on delete cascade, 0001), e con
-- loro le righe storiche rivendicate (claimed_by on delete cascade, 0012).
delete from auth.users where id in (
  '00000000-0000-0000-0000-0000000000e1',
  '00000000-0000-0000-0000-0000000000e2',
  '00000000-0000-0000-0000-0000000000e3',
  '00000000-0000-0000-0000-0000000000e5',
  '00000000-0000-0000-0000-0000000000e6',
  '00000000-0000-0000-0000-0000000000e7',
  '00000000-0000-0000-0000-0000000000e8',
  '00000000-0000-0000-0000-0000000000e9'
);
delete from public.legacy_contacts where source = 'access';

-- ---------------------------------------------------------------------------
-- T19 (OBLIO SULLE RIGHE MAI RIVENDICATE): chi si è registrato PRIMA che l'archivio
-- venisse caricato non rivendica nulla — il suo profilo è già nato e il trigger di
-- aggancio non ripassa. Se cancella l'account, la cascata su `claimed_by` non vede
-- quella riga: resteremmo con una seconda copia dei suoi dati, più vecchia di quella
-- che ci ha dato lui, invisibile nel suo export e sopravvissuta alla cancellazione.
-- Qui si verifica che il trigger di oblio la porti via lo stesso.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000ea',
  'prima.dell.import@esempio.it',
  jsonb_build_object(
    'first_name', 'Prima', 'last_name', 'DellImport',
    'country', 'IT', 'birth_date', '1979-09-09'
  )
);

-- L'archivio arriva DOPO: la riga nasce già orfana, nessuno la rivendicherà mai.
insert into public.legacy_contacts (id, email_norm, phone, city, source)
values ('00000000-0000-0000-0000-0000000000f8', 'prima.dell.import@esempio.it',
        '+393339990008', 'Bari', 'access');

do $$
declare v uuid;
begin
  select claimed_by into v from public.legacy_contacts
  where id = '00000000-0000-0000-0000-0000000000f8';
  if v is not null then
    raise exception 'T19 SETUP FAIL: la riga risulta rivendicata, lo scenario non è quello voluto';
  end if;
end $$;

delete from auth.users where id = '00000000-0000-0000-0000-0000000000ea';

do $$
declare n int;
begin
  select count(*) into n from public.legacy_contacts
  where id = '00000000-0000-0000-0000-0000000000f8';
  if n <> 0 then
    raise exception 'T19 FAIL: riga storica NON rivendicata sopravvissuta alla cancellazione dell''account';
  end if;
  raise notice 'T19 PASS: l''oblio raggiunge anche le righe mai rivendicate';
end $$;

-- ---------------------------------------------------------------------------
-- T20 (IL CONFINE DELL'OBLIO, e il residuo dichiarato): la cancellazione porta via
-- solo le righe che corrispondono a QUELLA persona. Due assert opposti:
--   a) una riga con un'altra email NON viene toccata (altrimenti cancelleremmo i dati
--      di terzi ogni volta che qualcuno chiude il suo account);
--   b) ed è esattamente il RESIDUO dichiarato nella migration: se la riga storica
--      porta un indirizzo diverso da quello di registrazione, non viene né agganciata
--      né cancellata. Per il database è un'altra persona. Lo chiude solo la
--      riconciliazione, che va progettata con l'import.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, city, source)
values ('00000000-0000-0000-0000-0000000000f9', 'altra.persona@esempio.it', 'Lecce', 'access');

insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000eb',
  'chi.si.cancella@esempio.it',
  jsonb_build_object(
    'first_name', 'Chi', 'last_name', 'SiCancella',
    'country', 'IT', 'birth_date', '1981-01-01'
  )
);
delete from auth.users where id = '00000000-0000-0000-0000-0000000000eb';

do $$
declare n int;
begin
  select count(*) into n from public.legacy_contacts
  where id = '00000000-0000-0000-0000-0000000000f9' and claimed_by is null;
  if n <> 1 then
    raise exception 'T20 FAIL: cancellato un account, è sparita la riga di un''altra persona';
  end if;
  raise notice 'T20 PASS: l''oblio non tracima su righe di altri (residuo email-diversa confermato)';
end $$;

delete from public.legacy_contacts where id = '00000000-0000-0000-0000-0000000000f9';

-- ---------------------------------------------------------------------------
-- T21 (RAMO ① DELL'OBLIO — la sentinella deve stare nel file che POSSIEDE la
-- funzione): una riga RIVENDICATA sparisce anche quando si cancella il SOLO
-- profilo. Su quel percorso la cascata su `claimed_by` non passa, perché la riga
-- di `auth.users` resta: senza il ramo ① di `purge_legacy_contact` i dati storici
-- della persona sopravvivrebbero alla sua cancellazione.
-- Perché qui e non altrove: il ramo ① vive in QUESTA migration. Finora l'unico
-- test che lo presidiava stava nella suite della 0013 (T7d) → svuotandolo, questa
-- coppia restava verde su entrambi gli shim. In un file che ha già pagato due
-- regressioni da `create or replace` con rebase del corpo, la sentinella lontana
-- dalla funzione è una sentinella che non si vede.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000fa',
  'ramo-uno@esempio.it',
  jsonb_build_object(
    'first_name', 'Rita', 'last_name', 'Longo',
    'phone', '+393339990010', 'city', 'Ancona', 'province', 'AN',
    'country', 'IT', 'birth_date', '1984-04-04'
  )
);

insert into public.legacy_contacts (id, email_norm, first_name, source, claimed_by, claimed_at)
values ('00000000-0000-0000-0000-0000000000fb', 'archivio-di-rita@esempio.it',
        'Rita', 'access', '00000000-0000-0000-0000-0000000000fa', now());

-- Solo il profilo: l'utente auth resta, quindi la cascata NON scatta.
delete from public.profiles where id = '00000000-0000-0000-0000-0000000000fa';

do $$
declare n int; u int;
begin
  select count(*) into u from auth.users
   where id = '00000000-0000-0000-0000-0000000000fa';
  if u <> 1 then
    raise exception 'T21 SETUP FAIL: l''utente auth doveva restare (la cascata non deve entrarci)';
  end if;
  select count(*) into n from public.legacy_contacts
   where id = '00000000-0000-0000-0000-0000000000fb';
  if n <> 0 then
    raise exception 'T21 FAIL: riga rivendicata sopravvissuta alla cancellazione del solo profilo (Art. 17)';
  end if;
  raise notice 'T21 PASS: il ramo ① copre il percorso own_delete, dove la cascata non passa';
end $$;

-- ---------------------------------------------------------------------------
-- T18 (IL ROLLBACK È UNA PROMESSA, QUINDI SI TESTA): la procedura di
-- disinstallazione scritta nell'intestazione della migration deve lasciare un
-- database in cui ci si registra ancora.
-- Va per ULTIMO perché smonta gli oggetti che tutti i test precedenti usano.
--
-- Perché esiste: la prima versione dell'intestazione diceva
-- `drop table public.legacy_contacts cascade;` e basta. È FALSO e rompe le
-- iscrizioni — il CASCADE non porta via il trigger (che dipende dalla FUNZIONE,
-- non dalla tabella) e il corpo di una funzione plpgsql si risolve a ogni
-- esecuzione, non alla creazione: il primo profilo inserito muore con «relation
-- does not exist», dentro `handle_new_user`. Scoperto provandolo, non leggendolo.
-- Si disinstalla dal consumatore verso il produttore: trigger, funzione, tabella.
-- ---------------------------------------------------------------------------
drop trigger if exists on_profile_claim_legacy on public.profiles;
drop trigger if exists on_profile_purge_legacy on public.profiles;
drop function if exists public.claim_legacy_contact();
drop function if exists public.purge_legacy_contact();
drop table if exists public.legacy_contacts;

-- Si verificano ENTRAMBE le operazioni che i due trigger intercettavano: la nascita
-- di un profilo E la sua cancellazione. Provare solo l'inserimento lascerebbe passare
-- un rollback che ha dimenticato il trigger di oblio: l'errore comparirebbe alla
-- prima cancellazione di account, cioè nel momento peggiore.
insert into auth.users (id, email, raw_user_meta_data)
values ('00000000-0000-0000-0000-0000000000ff', 'dopo.rollback@esempio.it',
  jsonb_build_object('first_name', 'Dopo', 'last_name', 'Rollback',
                     'country', 'IT', 'birth_date', '1990-01-01'));

do $$
declare v text;
begin
  select contact_email into v from public.profiles
  where id = '00000000-0000-0000-0000-0000000000ff';
  if v is distinct from 'dopo.rollback@esempio.it' then
    raise exception 'T18 FAIL: dopo il rollback la REGISTRAZIONE è rotta (contact_email=%)',
      coalesce(v, '<null>');
  end if;
end $$;

delete from auth.users where id = '00000000-0000-0000-0000-0000000000ff';

do $$
declare n int;
begin
  select count(*) into n from public.profiles
  where id = '00000000-0000-0000-0000-0000000000ff';
  if n <> 0 then
    raise exception 'T18 FAIL: dopo il rollback la CANCELLAZIONE è rotta';
  end if;
  raise notice 'T18 PASS: dopo il rollback ci si registra e ci si cancella ancora';
end $$;

select 'ALL TESTS PASS' as esito;
