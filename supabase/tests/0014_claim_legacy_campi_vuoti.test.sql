-- TEST migration 0014 — il campo vuoto e la provincia estera.
-- Assert espliciti, mai vacui.
--
-- Questa suite nasce da un rilievo su un TEST, non su una migration: T16 della 0012
-- dichiarava di simulare «il profilo che nasce dall'upsert dell'app» e inseriva un
-- payload che l'app non manda mai (phone e city OMESSI, cioè NULL, mentre l'app li
-- manda pieni perché nei suoi form sono obbligatori). Era verde, e lo sarebbe rimasto
-- anche con la precompilazione rotta per la forma di vuoto che l'app produce davvero.
-- Le prove che contano qui sono quattro, e nessuna è quella «facile»:
--   · T2 — la stringa vuota: ROSSO sulla 0012, verde sulla 0014. È la prova che il
--     fix cambia qualcosa. Senza di lei questa migration sarebbe indistinguibile da
--     un no-op;
--   · T3/T5 — la provincia estera, nelle DUE direzioni (profilo estero con archivio
--     italiano, e archivio estero con profilo italiano): il bug vero;
--   · T7 — l'asse negativo del fix stesso: quando l'archivio non ha niente da dare,
--     un `''` in ingresso deve restare `''`, non diventare NULL. Un fix che
--     normalizza valori che nessuno gli ha chiesto di toccare è un fix che fa danni
--     altrove;
--   · T9 — il percorso `ON CONFLICT DO UPDATE`, cioè l'`upsert()` reale dell'app:
--     serve a fissare per iscritto che il trigger BEFORE INSERT scatta ANCHE lì. È
--     il comportamento su cui l'intestazione della 0012 diceva il falso.
--
-- Prerequisiti: 0001→0013 applicate, poi 0014. Uno dei due shim (permissive o
-- restrictive): la 0014 non concede grant, quindi l'esito deve essere identico.
-- Range di id dedicato (`…0100`+) per non collidere con le suite precedenti.

-- ---------------------------------------------------------------------------
-- T1 (IL PAYLOAD REALE DELL'APP, che a T16 della 0012 mancava): phone e city
-- arrivano PIENI, perché i form li rendono obbligatori. Nulla da colmare — e ciò
-- che conta è che l'aggancio avvenga lo stesso: il valore della 0012 è
-- `claimed_by`, non la precompilazione.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, province, country, source)
values ('00000000-0000-0000-0000-000000000101', 'reale@esempio.it',
        '+393330000001', 'Verona', 'VR', 'IT', 'access');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000110', 'reale@esempio.it');

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-000000000110',
  'Luca', 'Verdi', '+393339999999', 'Milano', 'MI', 'IT', '1990-05-05',
  now(), 'reale@esempio.it'
);

do $$
declare r record;
begin
  select p.phone, p.city, p.province, l.claimed_by
    into r
  from public.profiles p
  join public.legacy_contacts l on l.id = '00000000-0000-0000-0000-000000000101'
  where p.id = '00000000-0000-0000-0000-000000000110';

  if r.claimed_by is distinct from '00000000-0000-0000-0000-000000000110'::uuid then
    raise exception 'T1 FAIL: la riga storica non è stata rivendicata (claimed_by = %)',
      coalesce(r.claimed_by::text, '<null>');
  end if;
  if r.phone <> '+393339999999' or r.city <> 'Milano' or r.province <> 'MI' then
    raise exception 'T1 FAIL: l''archivio ha sovrascritto il form (%, %, %)',
      r.phone, r.city, r.province;
  end if;
  raise notice 'T1 PASS: payload reale — form vince, riga rivendicata comunque';
end $$;

-- ---------------------------------------------------------------------------
-- T2 (LA RAGIONE DELLA MIGRATION — rosso sulla 0012): campi inviati VUOTI.
-- `coalesce('', 'x')` vale `''`, quindi con la 0012 questi restavano vuoti e la
-- persona non vedeva mai i propri dati. Nessun errore, nessun log: solo il dato
-- che non arriva.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, province, country, source)
values ('00000000-0000-0000-0000-000000000102', 'vuoti@esempio.it',
        '+393330000002', 'Padova', 'PD', 'IT', 'access');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000111', 'vuoti@esempio.it');

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-000000000111',
  'Sara', 'Neri', '', '', '', 'IT', '1988-03-03', now(), 'vuoti@esempio.it'
);

do $$
declare r record;
begin
  select phone, city, province into r from public.profiles
   where id = '00000000-0000-0000-0000-000000000111';

  if r.phone is distinct from '+393330000002' then
    raise exception 'T2 FAIL: phone = %, atteso il valore storico (stringa vuota non colmata)',
      coalesce(r.phone, '<null>');
  end if;
  if r.city is distinct from 'Padova' then
    raise exception 'T2 FAIL: city = %, attesa Padova', coalesce(r.city, '<null>');
  end if;
  if r.province is distinct from 'PD' then
    raise exception 'T2 FAIL: province = %, attesa PD', coalesce(r.province, '<null>');
  end if;
  raise notice 'T2 PASS: i campi inviati vuoti sono colmati dall''archivio';
end $$;

-- ---------------------------------------------------------------------------
-- T3 (IL BUG VERO, direzione 1): profilo ESTERO. L'app mette `province` a NULL
-- apposta per chi risiede fuori dall'Italia. Il trigger leggeva quel NULL come
-- «da colmare» e ci scriveva una sigla italiana.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, province, country, source)
values ('00000000-0000-0000-0000-000000000103', 'estero@esempio.it',
        '+393330000003', 'Verona', 'VR', 'IT', 'access');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000112', 'estero@esempio.it');

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-000000000112',
  'Jean', 'Dupont', null, null, null, 'FR', '1985-07-07', now(), 'estero@esempio.it'
);

do $$
declare r record;
begin
  select phone, city, province, country into r from public.profiles
   where id = '00000000-0000-0000-0000-000000000112';

  if r.province is not null then
    raise exception 'T3 FAIL: provincia italiana (%) scritta su un profilo %', r.province, r.country;
  end if;
  -- Contro-prova sullo stesso record: il ramo estero deve togliere SOLO la
  -- provincia. Se togliesse anche telefono e città, il test sopra sarebbe verde
  -- per la ragione sbagliata e avremmo rotto la precompilazione per gli stranieri.
  if r.phone is distinct from '+393330000003' or r.city is distinct from 'Verona' then
    raise exception 'T3 FAIL: telefono/città non colmati per il profilo estero (%, %)',
      coalesce(r.phone, '<null>'), coalesce(r.city, '<null>');
  end if;
  raise notice 'T3 PASS: profilo estero — nessuna provincia, ma telefono e città sì';
end $$;

-- ---------------------------------------------------------------------------
-- T4 (NON-REGRESSIONE): profilo italiano con provincia mancante e archivio
-- italiano → la provincia si colma. È la funzione utile che T3 non deve aver
-- spento.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, province, country, source)
values ('00000000-0000-0000-0000-000000000104', 'italiano@esempio.it',
        '+393330000004', 'Trento', 'TN', 'IT', 'access');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000113', 'italiano@esempio.it');

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-000000000113',
  'Giulia', 'Conti', null, null, null, 'IT', '1992-09-09', now(), 'italiano@esempio.it'
);

do $$
declare r record;
begin
  select province into r from public.profiles
   where id = '00000000-0000-0000-0000-000000000113';
  if r.province is distinct from 'TN' then
    raise exception 'T4 FAIL: province = %, attesa TN', coalesce(r.province, '<null>');
  end if;
  raise notice 'T4 PASS: profilo italiano — la provincia si colma ancora';
end $$;

-- ---------------------------------------------------------------------------
-- T5 (IL BUG VERO, direzione 2 — la variante speculare): archivio ESTERO,
-- profilo italiano. Chiudere solo T3 avrebbe lasciato aperta questa: una
-- «provincia» francese scritta come sigla italiana.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, province, country, source)
values ('00000000-0000-0000-0000-000000000105', 'archivioestero@esempio.it',
        '+393330000005', 'Lyon', '69', 'FR', 'access');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000114', 'archivioestero@esempio.it');

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-000000000114',
  'Marco', 'Gialli', null, null, null, 'IT', '1979-11-11', now(),
  'archivioestero@esempio.it'
);

do $$
declare r record;
begin
  select province into r from public.profiles
   where id = '00000000-0000-0000-0000-000000000114';
  if r.province is not null then
    raise exception 'T5 FAIL: provincia straniera (%) scritta su un profilo italiano', r.province;
  end if;
  raise notice 'T5 PASS: archivio estero — la sua provincia non entra in un profilo italiano';
end $$;

-- ---------------------------------------------------------------------------
-- T6 (NON-REGRESSIONE del caso 0012): campi NULL, il percorso della
-- registrazione leggera. Funzionava prima e deve funzionare adesso.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, province, country, source)
values ('00000000-0000-0000-0000-000000000106', 'leggera@esempio.it',
        '+393330000006', 'Bologna', 'BO', null, 'access');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000115', 'leggera@esempio.it');

insert into public.profiles
  (id, first_name, last_name, birth_date, privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-000000000115',
  'Elena', 'Blu', '1995-02-02', now(), 'leggera@esempio.it'
);

do $$
declare r record;
begin
  select phone, city, province into r from public.profiles
   where id = '00000000-0000-0000-0000-000000000115';
  if r.phone is distinct from '+393330000006'
     or r.city is distinct from 'Bologna'
     or r.province is distinct from 'BO' then
    raise exception 'T6 FAIL: NULL non colmati (%, %, %)',
      coalesce(r.phone, '<null>'), coalesce(r.city, '<null>'), coalesce(r.province, '<null>');
  end if;
  raise notice 'T6 PASS: i NULL si colmano come prima — e country assente vale Italia';
end $$;

-- ---------------------------------------------------------------------------
-- T7 (ASSE NEGATIVO DEL FIX STESSO): l'archivio non ha telefono. Il campo
-- arrivato vuoto deve restare com'era — `''`, non NULL. Il fix riempie i buchi,
-- non normalizza valori che nessuno gli ha chiesto di toccare: un profilo che
-- passa da `''` a NULL cambia ciò che vedono i vincoli e le viste a valle.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, province, country, source)
values ('00000000-0000-0000-0000-000000000107', 'senzatel@esempio.it',
        null, 'Genova', null, 'IT', 'access');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000116', 'senzatel@esempio.it');

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-000000000116',
  'Paolo', 'Rosa', '', '', '', 'IT', '1975-04-04', now(), 'senzatel@esempio.it'
);

do $$
declare r record;
begin
  select phone, city, province into r from public.profiles
   where id = '00000000-0000-0000-0000-000000000116';
  if r.phone is distinct from '' then
    raise exception 'T7 FAIL: phone = %, doveva restare la stringa vuota',
      coalesce(r.phone, '<null>');
  end if;
  if r.province is distinct from '' then
    raise exception 'T7 FAIL: province = %, doveva restare la stringa vuota',
      coalesce(r.province, '<null>');
  end if;
  if r.city is distinct from 'Genova' then
    raise exception 'T7 FAIL: city = %, attesa Genova (l''archivio ce l''aveva)',
      coalesce(r.city, '<null>');
  end if;
  raise notice 'T7 PASS: senza niente da mettere, il valore in ingresso non si tocca';
end $$;

-- ---------------------------------------------------------------------------
-- T8 (GUARDIA RELAY, ereditata dalla 0012): un alias Apple non deve poter pescare
-- la riga storica di nessuno. La guardia è nel corpo riscritto: se un `create or
-- replace` la perdesse, qui si vede.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, province, country, source)
values ('00000000-0000-0000-0000-000000000108', 'abc123@privaterelay.appleid.com',
        '+393330000008', 'Napoli', 'NA', 'IT', 'access');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000117', 'abc123@privaterelay.appleid.com');

insert into public.profiles
  (id, first_name, last_name, birth_date, privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-000000000117',
  'Relay', 'Utente', '1991-01-01', now(), 'abc123@privaterelay.appleid.com'
);

do $$
declare r record;
begin
  select p.phone, l.claimed_by into r
  from public.profiles p
  join public.legacy_contacts l on l.id = '00000000-0000-0000-0000-000000000108'
  where p.id = '00000000-0000-0000-0000-000000000117';

  if r.claimed_by is not null then
    raise exception 'T8 FAIL: un alias relay ha rivendicato la riga storica';
  end if;
  if r.phone is not null then
    raise exception 'T8 FAIL: phone = %, l''alias non doveva pescare nulla', r.phone;
  end if;
  raise notice 'T8 PASS: la guardia relay è sopravvissuta al replace';
end $$;

-- ---------------------------------------------------------------------------
-- T9 (IL COMPORTAMENTO SU CUI LA 0012 DICEVA IL FALSO): `insert … on conflict do
-- update`, cioè l'`upsert()` che l'app usa in `useProfileForm.ts:287`.
-- L'intestazione della 0012 affermava che il trigger BEFORE INSERT «non ripassa
-- sui profili già esistenti». La documentazione PostgreSQL dice il contrario — «the
-- effects of all per-row BEFORE INSERT triggers are reflected in excluded values».
-- ⚠️ Ma questo NON significa «rivendica a ogni salvataggio»: l'upsert è solo di
-- `CompleteProfileScreen`, cioè del percorso di COMPLETAMENTO. La modifica dei dati
-- passa da `.update()` e non fa scattare nulla — è T13, ed è il test che dice quanto
-- vale davvero questa proprietà. Qui si fissa solo il verso positivo.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000118', 'primadellimport@esempio.it');

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-000000000118',
  'Prima', 'Import', '+393330000009', 'Torino', 'TO', 'IT', '1980-06-06',
  now(), 'primadellimport@esempio.it'
);

-- L'archivio arriva DOPO che la persona si è già registrata.
insert into public.legacy_contacts (id, email_norm, phone, city, province, country, source)
values ('00000000-0000-0000-0000-000000000109', 'primadellimport@esempio.it',
        '+393330000099', 'Asti', 'AT', 'IT', 'access');

do $$
declare n int;
begin
  select count(*) into n from public.legacy_contacts
   where id = '00000000-0000-0000-0000-000000000109' and claimed_by is not null;
  if n <> 0 then
    raise exception 'T9 SETUP FAIL: la riga risulta già rivendicata prima dell''upsert';
  end if;
end $$;

-- Lo stesso upsert che fa l'app quando la persona salva il profilo.
insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-000000000118',
  'Prima', 'Import', '+393330000009', 'Torino', 'TO', 'IT', '1980-06-06',
  now(), 'primadellimport@esempio.it'
)
on conflict (id) do update set
  first_name = excluded.first_name,
  last_name  = excluded.last_name,
  phone      = excluded.phone,
  city       = excluded.city,
  province   = excluded.province,
  country    = excluded.country;

do $$
declare r record;
begin
  select l.claimed_by, p.city into r
  from public.legacy_contacts l
  join public.profiles p on p.id = '00000000-0000-0000-0000-000000000118'
  where l.id = '00000000-0000-0000-0000-000000000109';

  if r.claimed_by is distinct from '00000000-0000-0000-0000-000000000118'::uuid then
    raise exception 'T9 FAIL: l''upsert non ha fatto scattare il BEFORE INSERT (claimed_by = %)',
      coalesce(r.claimed_by::text, '<null>');
  end if;
  -- E ciò che la persona ha scritto resta suo: l'archivio non le cambia la città
  -- sotto le mani solo perché è passata di lì.
  if r.city <> 'Torino' then
    raise exception 'T9 FAIL: l''archivio ha sovrascritto la città con %', r.city;
  end if;
  raise notice 'T9 PASS: l''upsert fa scattare il trigger e rivendica la riga, senza toccare i dati scritti';
end $$;

-- ---------------------------------------------------------------------------
-- T10 (IL GEMELLO DELLA 0013): dopo il cambio della mail dell'account il backfill
-- applica le stesse due regole. Qui il profilo è ESTERO: la provincia dell'archivio
-- italiano non deve entrare nemmeno da questa strada.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, province, country, source)
values ('00000000-0000-0000-0000-00000000010a', 'vecchiaestera@esempio.it',
        '+393330000010', 'Firenze', 'FI', 'IT', 'access');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000119', 'vecchiaestera@esempio.it');

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-000000000119',
  'Hans', 'Muller', '', null, null, 'DE', '1970-08-08', now(),
  'vecchiaestera@esempio.it'
);

-- La riga storica risulta già rivendicata alla nascita del profilo (stessa mail):
-- per far girare il ramo della 0013 serve una riga NON rivendicata sotto la mail
-- vecchia, quindi la si libera e si cambia indirizzo.
update public.legacy_contacts
   set claimed_by = null, claimed_at = null
 where id = '00000000-0000-0000-0000-00000000010a';

update public.profiles
   set phone = '', city = null, province = null
 where id = '00000000-0000-0000-0000-000000000119';

update auth.users set email = 'nuovaestera@esempio.it'
 where id = '00000000-0000-0000-0000-000000000119';

do $$
declare r record;
begin
  select p.phone, p.city, p.province, p.contact_email, l.claimed_by into r
  from public.profiles p
  join public.legacy_contacts l on l.id = '00000000-0000-0000-0000-00000000010a'
  where p.id = '00000000-0000-0000-0000-000000000119';

  if r.contact_email is distinct from 'nuovaestera@esempio.it' then
    raise exception 'T10 SETUP FAIL: la 0013 non ha spostato contact_email (%)',
      coalesce(r.contact_email, '<null>');
  end if;
  if r.claimed_by is distinct from '00000000-0000-0000-0000-000000000119'::uuid then
    raise exception 'T10 FAIL: la riga sotto la mail vecchia non è stata rivendicata';
  end if;
  if r.phone is distinct from '+393330000010' then
    raise exception 'T10 FAIL: phone = %, il vuoto non è stato colmato dal backfill',
      coalesce(r.phone, '<null>');
  end if;
  if r.province is not null then
    raise exception 'T10 FAIL: provincia italiana (%) scritta su un profilo tedesco', r.province;
  end if;
  raise notice 'T10 PASS: il backfill della 0013 applica le stesse due regole';
end $$;

-- ---------------------------------------------------------------------------
-- T10b (IL RAMO POSITIVO DEL GEMELLO, che T10 da solo non copre): stesso scenario
-- di T10 ma con un profilo ITALIANO — qui la provincia DEVE essere colmata. Senza
-- questo test, invertendo la condizione sulla provincia nel backfill della 0013 la
-- suite resterebbe verde e la funzione utile sparirebbe in silenzio (T10 prova solo
-- che NON scriva agli stranieri: metà della verità).
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, province, country, source)
values ('00000000-0000-0000-0000-00000000010b', 'vecchiaitaliana@esempio.it',
        '+393330000011', 'Firenze', 'FI', 'IT', 'access');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000011a', 'vecchiaitaliana@esempio.it');

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-00000000011a',
  'Anna', 'Toscana', '', null, null, 'IT', '1981-01-01', now(),
  'vecchiaitaliana@esempio.it'
);

update public.legacy_contacts
   set claimed_by = null, claimed_at = null
 where id = '00000000-0000-0000-0000-00000000010b';

update public.profiles
   set phone = '', city = null, province = null
 where id = '00000000-0000-0000-0000-00000000011a';

update auth.users set email = 'nuovaitaliana@esempio.it'
 where id = '00000000-0000-0000-0000-00000000011a';

do $$
declare r record;
begin
  select province, city, phone into r from public.profiles
   where id = '00000000-0000-0000-0000-00000000011a';
  if r.province is distinct from 'FI' then
    raise exception 'T10b FAIL: province = %, attesa FI dal backfill della 0013',
      coalesce(r.province, '<null>');
  end if;
  if r.city is distinct from 'Firenze' or r.phone is distinct from '+393330000011' then
    raise exception 'T10b FAIL: citta''/telefono non colmati (%, %)',
      coalesce(r.city, '<null>'), coalesce(r.phone, '<null>');
  end if;
  raise notice 'T10b PASS: il backfill colma ancora la provincia a un profilo italiano';
end $$;

-- ---------------------------------------------------------------------------
-- T13 (IL CONFINE CHE MANCAVA, e che ha corretto DUE volte l'intestazione della
-- 0012): l'app ha DUE percorsi di salvataggio del profilo e solo uno fa scattare
-- l'aggancio.
--   · completamento profilo → `useProfileForm.ts:287` → `.upsert()`  → SCATTA (T9)
--   · modifica profilo      → `AuthContext.tsx:295-298` → `.update()` → NON scatta
-- Qui si fissa il secondo, cioè il caso che rende ancora necessario il vincolo di
-- ordine sull'import: chi ha il profilo COMPLETO non passa più dal completamento, e
-- per quanti dati modifichi non rivendicherà mai la sua riga storica.
-- Se un domani qualcuno spostasse la modifica profilo su un upsert, questo test
-- diventerebbe rosso — ed è giusto così: quel cambiamento renderebbe obsoleta
-- l'avvertenza scritta nella 0012 e andrebbe riletta.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000011b', 'soloupdate@esempio.it');

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-00000000011b',
  'Completo', 'Utente', '+393330000012', 'Napoli', 'NA', 'IT', '1977-07-07',
  now(), 'soloupdate@esempio.it'
);

-- L'archivio arriva dopo, come in T9.
insert into public.legacy_contacts (id, email_norm, phone, city, province, country, source)
values ('00000000-0000-0000-0000-00000000010c', 'soloupdate@esempio.it',
        '+393330000099', 'Salerno', 'SA', 'IT', 'access');

-- Esattamente ciò che fa `updateProfile`: UPDATE mirato, nessun INSERT.
update public.profiles
   set city = 'Caserta'
 where id = '00000000-0000-0000-0000-00000000011b';

do $$
declare r record;
begin
  select l.claimed_by, p.city into r
  from public.legacy_contacts l
  join public.profiles p on p.id = '00000000-0000-0000-0000-00000000011b'
  where l.id = '00000000-0000-0000-0000-00000000010c';

  if r.claimed_by is not null then
    raise exception 'T13 FAIL: un UPDATE ha fatto scattare il BEFORE INSERT — allora l''avvertenza della 0012 e'' obsoleta e va riscritta';
  end if;
  if r.city <> 'Caserta' then
    raise exception 'T13 FAIL: l''update non ha scritto (city = %)', r.city;
  end if;
  raise notice 'T13 PASS: la modifica profilo non rivendica — il vincolo di ordine resta necessario';
end $$;

-- ---------------------------------------------------------------------------
-- T14 (LA FORMA REALE DEL FILE DA IMPORTARE): l'export del partner non scrive NULL
-- nelle celle vuote, scrive stringhe VUOTE — nel file del 2026-07-27 il paese manca
-- su 162 righe di 1352 e la provincia su 1330. Se il lato ARCHIVIO non fosse
-- insensibile al vuoto come quello del profilo, `coalesce(country,'IT')` su `''` non
-- varrebbe mai `'IT'` e la provincia non si colmerebbe per NESSUNO; peggio, un
-- telefono `''` dell'archivio verrebbe scritto sopra un NULL del profilo.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, province, country, source)
values ('00000000-0000-0000-0000-00000000010d', 'comeviene@esempio.it',
        '', 'Trieste', 'TS', '', 'access');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000011c', 'comeviene@esempio.it');

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values (
  '00000000-0000-0000-0000-00000000011c',
  'Come', 'Viene', null, null, null, 'IT', '1990-10-10', now(),
  'comeviene@esempio.it'
);

do $$
declare r record;
begin
  select phone, city, province into r from public.profiles
   where id = '00000000-0000-0000-0000-00000000011c';

  if r.phone is not null then
    raise exception 'T14 FAIL: phone = %, un vuoto dell''archivio e'' stato scritto sopra un NULL',
      quote_literal(r.phone);
  end if;
  if r.city is distinct from 'Trieste' then
    raise exception 'T14 FAIL: city = %, attesa Trieste', coalesce(r.city, '<null>');
  end if;
  if r.province is distinct from 'TS' then
    raise exception 'T14 FAIL: province = %, attesa TS — il paese vuoto dell''archivio ha bloccato il ramo',
      coalesce(r.province, '<null>');
  end if;
  raise notice 'T14 PASS: le celle vuote del file reale non rompono ne'' sporcano';
end $$;

-- ---------------------------------------------------------------------------
-- T11 (RIESEGUIBILITÀ): la migration compare due volte nella pipe del runner. I
-- trigger restano uno per tipo — questa migration non li ricrea, li lascia
-- puntare alla funzione sostituita, ed è il punto in cui un `create trigger`
-- dimenticato si vedrebbe.
-- ---------------------------------------------------------------------------
do $$
declare n int;
begin
  select count(*) into n from pg_trigger t
   join pg_class c on c.oid = t.tgrelid
   where not t.tgisinternal
     and c.relname = 'profiles'
     and t.tgname = 'on_profile_claim_legacy';
  if n <> 1 then
    raise exception 'T11 FAIL: % trigger on_profile_claim_legacy, atteso 1', n;
  end if;

  select count(*) into n from pg_trigger t
   join pg_class c on c.oid = t.tgrelid
   where not t.tgisinternal
     and c.relname = 'users'
     and t.tgname = 'on_auth_user_email_changed';
  if n <> 1 then
    raise exception 'T11 FAIL: % trigger on_auth_user_email_changed, atteso 1', n;
  end if;
  raise notice 'T11 PASS: un solo trigger per tipo dopo la riesecuzione';
end $$;

-- ---------------------------------------------------------------------------
-- T12 (SUPERFICIE RPC): le due funzioni riscritte non devono diventare
-- chiamabili. `create or replace` non ripristina i privilegi revocati, ma la
-- migration ripete la `revoke` per autonomia: qui si verifica l'esito, non
-- l'intenzione.
-- ---------------------------------------------------------------------------
do $$
declare v_claim boolean; v_sync boolean;
begin
  select has_function_privilege('authenticated', 'public.claim_legacy_contact()', 'EXECUTE')
    into v_claim;
  select has_function_privilege('authenticated', 'public.sync_contact_email_on_email_change()', 'EXECUTE')
    into v_sync;
  if v_claim or v_sync then
    raise exception 'T12 FAIL: superficie RPC aperta (claim=%, sync=%)', v_claim, v_sync;
  end if;
  raise notice 'T12 PASS: nessuna delle due funzioni è chiamabile da authenticated';
end $$;
