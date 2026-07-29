-- TEST migration 0016 — l'archivio si muove solo su un indirizzo PROVATO.
--
-- Il cuore della suite è T1: riproduce la sequenza di quattro passi che rendeva
-- possibile il furto usa-e-getta, usando i trigger VERI (`on_auth_user_created` della
-- 0011 crea il profilo da sé) e non un insert costruito a mano. Se qualcuno un domani
-- toglie la guardia di conferma dal ramo A, T1 diventa rosso. È il suo unico scopo.
-- T2 fa lo stesso col gemello sul lato oblio: l'account mai confermato che viene
-- cancellato non porta via la scheda di nessuno.
-- Tutti gli altri provano che chiudendo l'attacco non si è rotto l'uso legittimo — su
-- ENTRAMBI i percorsi di aggancio, il ramo A (indirizzo già provato alla nascita del
-- profilo) e il ramo B (indirizzo provato alla conferma).
--
-- ⚠️ `email_confirmed_at` è scritto ESPLICITAMENTE in ogni riga di questa suite, mai
-- lasciato al default dello shim: qui è l'attributo sotto esame, e lasciarlo implicito
-- significherebbe testare il caso opposto e vederlo verde.
--
-- Prerequisiti: 0001→0015 applicate, poi 0016. Uno dei due shim.
-- Range di id dedicato (`…0300`+).

-- ---------------------------------------------------------------------------
-- T1 (ATTACCO — IL FURTO USA-E-GETTA, ramo A): Alice esiste solo nell'archivio.
-- Mallory chiama `signUp` con l'indirizzo di Alice e non conferma niente: la riga di
-- `auth.users` nasce con `email_confirmed_at = NULL`, il trigger della 0011 crea SUBITO
-- il profilo, e il BEFORE INSERT su `profiles` prova a rivendicare.
-- Serve solo una richiesta HTTP anonima: nessuna sessione, nessun click sulla mail.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, first_name, last_name, phone, city, province, country, source)
values ('00000000-0000-0000-0000-000000000301', 'alice2@esempio.it',
        'Alice', 'Vittima', '+393330000301', 'Trieste', 'TS', 'IT', 'access');

insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data)
values ('00000000-0000-0000-0000-000000000310', 'alice2@esempio.it', null,
        jsonb_build_object(
          'first_name', 'Mallory', 'last_name', 'Ostile',
          'birth_date', '1990-01-01', 'country', 'IT'));

do $$
declare r record;
begin
  select l.claimed_by, p.phone, p.city
    into r
    from public.legacy_contacts l
    left join public.profiles p on p.id = '00000000-0000-0000-0000-000000000310'
   where l.id = '00000000-0000-0000-0000-000000000301';

  if r.claimed_by is not null then
    raise exception 'T1 FAIL — FALLA APERTA: la scheda di Alice e'' stata rubata da un account MAI confermato (claimed_by = %)', r.claimed_by;
  end if;
  if r.phone is not null or r.city is not null then
    raise exception 'T1 FAIL — FALLA APERTA: un account mai confermato ha letto i dati di Alice (tel=%, citta=%)',
      coalesce(r.phone, '<null>'), coalesce(r.city, '<null>');
  end if;
  raise notice 'T1 PASS: una registrazione usa-e-getta non ruba ne'' legge la scheda altrui';
end $$;

-- ---------------------------------------------------------------------------
-- T2 (ATTACCO — IL GEMELLO, sul lato oblio): l'account fantasma di T1 viene cancellato.
-- È lo scenario di una pulizia degli account mai confermati, che prima o poi faremo:
-- non deve portarsi via la scheda della persona il cui indirizzo era stato usato.
-- ---------------------------------------------------------------------------
delete from auth.users where id = '00000000-0000-0000-0000-000000000310';

do $$
declare n int;
begin
  select count(*) into n from public.legacy_contacts
   where id = '00000000-0000-0000-0000-000000000301';
  if n <> 1 then
    raise exception 'T2 FAIL — FALLA APERTA: cancellando un account MAI confermato e'' sparita la scheda di Alice';
  end if;
  raise notice 'T2 PASS: un indirizzo mai provato non porta via la scheda di nessuno';
end $$;

-- ---------------------------------------------------------------------------
-- T3 (LEGITTIMO — RAMO B): Alice si registra davvero. Al signup non si aggancia (ed è
-- il punto di tutta la migration); si aggancia quando conferma, che è l'istante in cui
-- l'indirizzo smette di essere una dichiarazione. Il profilo a quel punto esiste già,
-- quindi il backfill deve avvenire in UPDATE.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data)
values ('00000000-0000-0000-0000-000000000311', 'alice2@esempio.it', null,
        jsonb_build_object(
          'first_name', 'Alice', 'last_name', 'Vittima',
          'birth_date', '1985-05-05', 'country', 'IT'));

do $$
declare v uuid;
begin
  select claimed_by into v from public.legacy_contacts
   where id = '00000000-0000-0000-0000-000000000301';
  if v is not null then
    raise exception 'T3 FAIL: agganciato PRIMA della conferma (claimed_by = %) — la guardia del ramo A non tiene', v;
  end if;
  raise notice 'T3a PASS: al signup non ancora confermato non si aggancia niente';
end $$;

-- La conferma: è l'unico evento che cambia lo stato del mondo.
update auth.users set email_confirmed_at = now()
 where id = '00000000-0000-0000-0000-000000000311';

do $$
declare r record;
begin
  select p.phone, p.city, p.province, l.claimed_by, l.claimed_at
    into r
    from public.profiles p
    join public.legacy_contacts l on l.id = '00000000-0000-0000-0000-000000000301'
   where p.id = '00000000-0000-0000-0000-000000000311';

  if r.claimed_by is distinct from '00000000-0000-0000-0000-000000000311'::uuid then
    raise exception 'T3 FAIL: alla conferma Alice non ha agganciato la propria scheda (claimed_by = %)',
      coalesce(r.claimed_by::text, '<null>');
  end if;
  if r.claimed_at is null then
    raise exception 'T3 FAIL: claimed_by valorizzato ma claimed_at no';
  end if;
  if r.phone is distinct from '+393330000301'
     or r.city is distinct from 'Trieste'
     or r.province is distinct from 'TS' then
    raise exception 'T3 FAIL: il backfill alla conferma non ha riempito il profilo (tel=%, citta=%, prov=%)',
      coalesce(r.phone, '<null>'), coalesce(r.city, '<null>'), coalesce(r.province, '<null>');
  end if;
  raise notice 'T3b PASS: alla conferma la persona vera aggancia e ritrova i suoi dati';
end $$;

-- ---------------------------------------------------------------------------
-- T4 (LEGITTIMO — RAMO A): il social. L'identità arriva da un provider che l'indirizzo
-- l'ha già verificato, quindi `email_confirmed_at` è valorizzato fin dall'INSERT e
-- l'aggancio deve avvenire alla nascita del profilo, riempiendo `new.*`.
-- Senza questo test la 0016 sarebbe verde anche avendo semplicemente spento il ramo A.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, province, country, source)
values ('00000000-0000-0000-0000-000000000302', 'social@esempio.it',
        '+393330000302', 'Udine', 'UD', 'IT', 'access');

insert into auth.users (id, email, email_confirmed_at)
values ('00000000-0000-0000-0000-000000000312', 'social@esempio.it', now());

-- Col social `handle_new_user` non crea il profilo (nessun `birth_date` nei metadata):
-- lo crea l'app quando la persona completa i dati. È il percorso vero.
insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date, privacy_consent_at)
values ('00000000-0000-0000-0000-000000000312',
        'Social', 'Utente', null, null, null, 'IT', '1992-02-02', now());

do $$
declare r record;
begin
  select p.phone, p.city, p.province, l.claimed_by
    into r
    from public.profiles p
    join public.legacy_contacts l on l.id = '00000000-0000-0000-0000-000000000302'
   where p.id = '00000000-0000-0000-0000-000000000312';

  if r.claimed_by is distinct from '00000000-0000-0000-0000-000000000312'::uuid then
    raise exception 'T4 FAIL: con indirizzo gia'' verificato dal provider il ramo A non ha agganciato (claimed_by = %)',
      coalesce(r.claimed_by::text, '<null>');
  end if;
  if r.phone is distinct from '+393330000302' or r.city is distinct from 'Udine' then
    raise exception 'T4 FAIL: il ramo A non ha riempito il profilo (tel=%, citta=%)',
      coalesce(r.phone, '<null>'), coalesce(r.city, '<null>');
  end if;
  raise notice 'T4 PASS: chi arriva con l''indirizzo gia'' provato si aggancia alla nascita del profilo';
end $$;

-- ---------------------------------------------------------------------------
-- T5 (IDEMPOTENZA — la clausola WHEN, non la guardia): la conferma è un EVENTO, non uno
-- stato da rileggere a ogni scrittura. Qui l'archivio arriva DOPO che la persona ha già
-- confermato; un successivo tocco di `email_confirmed_at` (una manutenzione, un riscrittura
-- dello stesso valore da parte di GoTrue) non deve rivendicare niente.
-- ⚠️ Senza la clausola WHEN questo test è ROSSO: il trigger firerebbe e prenderebbe la
-- riga. Il caso «archivio importato dopo» si chiude con la passata di riconciliazione
-- (0012 §4), non con un update casuale che nessuno ha chiesto.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, email_confirmed_at)
values ('00000000-0000-0000-0000-000000000313', 'dopo@esempio.it', now());

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date, privacy_consent_at)
values ('00000000-0000-0000-0000-000000000313',
        'Dopo', 'Import', null, null, null, 'IT', '1975-03-03', now());

-- L'archivio arriva ora, quando la persona è già dentro da tempo.
insert into public.legacy_contacts (id, email_norm, phone, city, country, source)
values ('00000000-0000-0000-0000-000000000303', 'dopo@esempio.it',
        '+393330000303', 'Lecce', 'IT', 'access');

update auth.users set email_confirmed_at = now()
 where id = '00000000-0000-0000-0000-000000000313';

do $$
declare v uuid;
begin
  select claimed_by into v from public.legacy_contacts
   where id = '00000000-0000-0000-0000-000000000303';
  if v is not null then
    raise exception 'T5 FAIL: un tocco di email_confirmed_at su un account GIA'' confermato ha rivendicato una riga (claimed_by = %) — manca la clausola WHEN sulla transizione', v;
  end if;
  raise notice 'T5 PASS: la conferma vale come transizione, non come stato riletto a ogni scrittura';
end $$;

-- ---------------------------------------------------------------------------
-- T6 (RIGA GIÀ DI UN ALTRO): la guardia `claimed_by is null` deve valere anche sul ramo
-- nuovo. Lo stato di partenza — una riga rivendicata da chi poi ha cambiato indirizzo —
-- si raggiunge dalla vita reale; qui lo si scrive direttamente, perché il punto sotto
-- esame è la guardia, non il modo di arrivarci.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, email_confirmed_at)
values ('00000000-0000-0000-0000-000000000314', 'primoarrivato@esempio.it', now());

insert into public.legacy_contacts
  (id, email_norm, phone, city, country, source, claimed_by, claimed_at)
values ('00000000-0000-0000-0000-000000000304', 'contesa@esempio.it',
        '+393330000304', 'Napoli', 'IT', 'access',
        '00000000-0000-0000-0000-000000000314', now());

insert into auth.users (id, email, email_confirmed_at)
values ('00000000-0000-0000-0000-000000000315', 'contesa@esempio.it', null);

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date, privacy_consent_at)
values ('00000000-0000-0000-0000-000000000315',
        'Secondo', 'Arrivato', null, null, null, 'IT', '1980-04-04', now());

update auth.users set email_confirmed_at = now()
 where id = '00000000-0000-0000-0000-000000000315';

do $$
declare r record;
begin
  select l.claimed_by, p.phone into r
    from public.legacy_contacts l
    join public.profiles p on p.id = '00000000-0000-0000-0000-000000000315'
   where l.id = '00000000-0000-0000-0000-000000000304';

  if r.claimed_by is distinct from '00000000-0000-0000-0000-000000000314'::uuid then
    raise exception 'T6 FAIL — FALLA APERTA: la conferma ha strappato una riga gia'' rivendicata (claimed_by = %)',
      coalesce(r.claimed_by::text, '<null>');
  end if;
  if r.phone is not null then
    raise exception 'T6 FAIL: i dati di una riga altrui sono finiti nel profilo del secondo arrivato (tel=%)', r.phone;
  end if;
  raise notice 'T6 PASS: chi arriva secondo non strappa la riga al primo';
end $$;

-- ---------------------------------------------------------------------------
-- T7 (GUARDIA RELAY sul ramo nuovo): un alias Apple non è la mail della persona, e la
-- guardia della 0015 non deve essere sopravvissuta solo sul ramo A.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, country, source)
values ('00000000-0000-0000-0000-000000000305', 'abc123@privaterelay.appleid.com',
        '+393330000305', 'Palermo', 'IT', 'access');

insert into auth.users (id, email, email_confirmed_at)
values ('00000000-0000-0000-0000-000000000316', 'abc123@privaterelay.appleid.com', null);

update auth.users set email_confirmed_at = now()
 where id = '00000000-0000-0000-0000-000000000316';

do $$
declare v uuid;
begin
  select claimed_by into v from public.legacy_contacts
   where id = '00000000-0000-0000-0000-000000000305';
  if v is not null then
    raise exception 'T7 FAIL: un alias relay ha pescato una riga storica alla conferma (claimed_by = %)', v;
  end if;
  raise notice 'T7 PASS: la guardia relay vale su entrambi i rami';
end $$;

-- ---------------------------------------------------------------------------
-- T8 (CAMBIO EMAIL DOPO LA CONFERMA). Premessa: Supabase non muove `email` finché la persona
-- non conferma, e `email_confirmed_at` resta valorizzato per tutto il percorso — quindi il
-- ramo nuovo NON deve firare.
-- ⚠️ VERIFICATA SOLO IN PARTE (una fonte): al completamento del cambio `email_confirmed_at`
-- viene SETTATO, non azzerato. Non ho trovato una fonte che escluda esplicitamente un
-- azzeramento intermedio → resta il residuo: se GoTrue lo azzerasse durante il flusso, la
-- guardia `v_vecchia_provata` del §4 farebbe smettere IN SILENZIO ogni cambio indirizzo
-- legittimo di portarsi dietro la riga d'archivio.
-- 🔴 Trovato cercando, e vale più della premessa stessa: con `GOTRUE_MAILER_AUTOCONFIRM=true`
-- il doppio-consenso del cambio email è **silenziosamente disabilitato**
-- (supabase/auth#2600) — cioè l'indirizzo si sposta SENZA che nessuno lo confermi. È
-- esattamente lo scenario contro cui il §4 esiste: quella guardia non è teorica. La 0013 continua a fare il suo (spostare il
-- recapito derivato), e la riga d'archivio registrata sotto l'indirizzo NUOVO resta non
-- rivendicata — è il residuo dichiarato nella 0015, fissato qui perché non cambi in
-- silenzio: si chiude nella passata di riconciliazione, non a colpi di trigger.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, email_confirmed_at)
values ('00000000-0000-0000-0000-000000000317', 'vecchia@esempio.it', now());

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values ('00000000-0000-0000-0000-000000000317',
        'Cambia', 'Indirizzo', null, null, null, 'IT', '1983-06-06', now(),
        'vecchia@esempio.it');

insert into public.legacy_contacts (id, email_norm, phone, city, country, source)
values ('00000000-0000-0000-0000-000000000306', 'nuova@esempio.it',
        '+393330000306', 'Genova', 'IT', 'access');

update auth.users set email = 'nuova@esempio.it'
 where id = '00000000-0000-0000-0000-000000000317';

do $$
declare r record;
begin
  select p.contact_email, l.claimed_by into r
    from public.profiles p
    join public.legacy_contacts l on l.id = '00000000-0000-0000-0000-000000000306'
   where p.id = '00000000-0000-0000-0000-000000000317';

  if r.contact_email is distinct from 'nuova@esempio.it' then
    raise exception 'T8 FAIL: la 0013 non sposta piu'' il recapito derivato (contact_email = %)',
      coalesce(r.contact_email, '<null>');
  end if;
  if r.claimed_by is not null then
    raise exception 'T8 FAIL: il cambio email ha rivendicato la riga sotto il NUOVO indirizzo (claimed_by = %) — comportamento cambiato senza deciderlo', r.claimed_by;
  end if;
  raise notice 'T8 PASS: il cambio email non fa firare il ramo della conferma, e la 0013 regge';
end $$;

-- ---------------------------------------------------------------------------
-- T9 (BACKFILL RITARDATO): conferma PRIMA che il profilo esista. Succede a chi entra
-- senza `birth_date` nei metadata: `handle_new_user` non crea la riga, il profilo nasce
-- più tardi dall'app. Il ramo B rivendica ma non ha un profilo da riempire; quando il
-- profilo nasce, il ramo A trova la riga GIÀ SUA e deve completare il backfill.
-- ⚠️ Senza la seconda lettura nel ramo A queste persone resterebbero con la riga
-- agganciata e il profilo vuoto: il modo peggiore di sbagliare, perché sembra a posto.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, province, country, source)
values ('00000000-0000-0000-0000-000000000307', 'tardivo@esempio.it',
        '+393330000307', 'Ancona', 'AN', 'IT', 'access');

insert into auth.users (id, email, email_confirmed_at)
values ('00000000-0000-0000-0000-000000000318', 'tardivo@esempio.it', null);

update auth.users set email_confirmed_at = now()
 where id = '00000000-0000-0000-0000-000000000318';

do $$
declare v uuid;
begin
  select claimed_by into v from public.legacy_contacts
   where id = '00000000-0000-0000-0000-000000000307';
  if v is distinct from '00000000-0000-0000-0000-000000000318'::uuid then
    raise exception 'T9 FAIL: la conferma senza profilo non ha rivendicato (claimed_by = %)',
      coalesce(v::text, '<null>');
  end if;
  raise notice 'T9a PASS: la conferma rivendica anche quando il profilo non esiste ancora';
end $$;

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date, privacy_consent_at)
values ('00000000-0000-0000-0000-000000000318',
        'Tardivo', 'Profilo', null, null, null, 'IT', '1978-09-09', now());

do $$
declare r record;
begin
  select phone, city, province into r from public.profiles
   where id = '00000000-0000-0000-0000-000000000318';
  if r.phone is distinct from '+393330000307'
     or r.city is distinct from 'Ancona'
     or r.province is distinct from 'AN' then
    raise exception 'T9 FAIL: il profilo nato dopo la conferma e'' rimasto vuoto (tel=%, citta=%, prov=%)',
      coalesce(r.phone, '<null>'), coalesce(r.city, '<null>'), coalesce(r.province, '<null>');
  end if;
  raise notice 'T9b PASS: il profilo nato dopo la conferma recupera comunque i suoi dati';
end $$;

-- ---------------------------------------------------------------------------
-- T10 (OBLIO LEGITTIMO ANCORA VIVO): la guardia del §3 non deve aver spento l'oblio per
-- chi l'indirizzo l'ha provato. È il test che impedisce di «chiudere» il gemello di T2
-- semplicemente non cancellando più niente.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, email_confirmed_at)
values ('00000000-0000-0000-0000-000000000319', 'oblio@esempio.it', now());

insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date, privacy_consent_at)
values ('00000000-0000-0000-0000-000000000319',
        'Oblio', 'Legittimo', '+393330000319', 'Bari', 'BA', 'IT', '1970-07-07', now());

-- L'archivio arriva dopo: la riga nasce orfana, mai rivendicata.
insert into public.legacy_contacts (id, email_norm, phone, city, country, source)
values ('00000000-0000-0000-0000-000000000308', 'oblio@esempio.it',
        '+393330000399', 'Matera', 'IT', 'access');

delete from auth.users where id = '00000000-0000-0000-0000-000000000319';

do $$
declare n int;
begin
  select count(*) into n from public.legacy_contacts
   where id = '00000000-0000-0000-0000-000000000308';
  if n <> 0 then
    raise exception 'T10 FAIL: chi ha confermato e cancella l''account non si porta piu'' via la sua riga storica';
  end if;
  raise notice 'T10 PASS: l''oblio raggiunge ancora le righe di chi l''indirizzo l''ha provato';
end $$;

-- ---------------------------------------------------------------------------
-- T11 (ATTACCO — LA QUARTA PORTA): il furto usa-e-getta con un passo in più. Mallory si
-- registra con l'indirizzo della vittima e NON conferma (il §1 le impedisce il claim),
-- poi sposta l'account sul proprio indirizzo: nello spostamento, la 0013 rivendicava la
-- riga registrata sotto l'indirizzo ABBANDONATO — cioè quello della vittima.
-- ⚠️ Se qualcuno toglie `v_vecchia_provata` dal §4, questo test diventa rosso. È il suo
-- unico scopo.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, phone, city, country, source)
values ('00000000-0000-0000-0000-000000000309', 'vittima4@esempio.it',
        '+393330000309', 'Verona', 'IT', 'access');

insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data)
values ('00000000-0000-0000-0000-000000000321', 'vittima4@esempio.it', null,
        jsonb_build_object(
          'first_name', 'Mallory', 'last_name', 'Quarta',
          'birth_date', '1991-11-11', 'country', 'IT'));

-- Lo spostamento sul proprio indirizzo. `email_confirmed_at` resta NULL: non ha mai
-- provato niente.
update auth.users set email = 'mallory4@esempio.it'
 where id = '00000000-0000-0000-0000-000000000321';

do $$
declare r record;
begin
  select l.claimed_by, p.phone, p.city into r
    from public.legacy_contacts l
    left join public.profiles p on p.id = '00000000-0000-0000-0000-000000000321'
   where l.id = '00000000-0000-0000-0000-000000000309';

  if r.claimed_by is not null then
    raise exception 'T11 FAIL — FALLA APERTA: cambiando indirizzo, un account MAI confermato ha rivendicato la riga della vittima (claimed_by = %)', r.claimed_by;
  end if;
  if r.phone is not null or r.city is not null then
    raise exception 'T11 FAIL — FALLA APERTA: i dati della vittima sono finiti nel profilo (tel=%, citta=%)',
      coalesce(r.phone, '<null>'), coalesce(r.city, '<null>');
  end if;
  raise notice 'T11 PASS: il cambio indirizzo non rivendica per conto di chi non ha mai confermato';
end $$;

-- ---------------------------------------------------------------------------
-- T12 (IL CAMBIO EMAIL LEGITTIMO NON È STATO SPENTO): chi l'indirizzo vecchio l'aveva
-- provato deve continuare a portarsi dietro la propria riga d'archivio quando cambia
-- indirizzo. Senza questo test, T11 sarebbe verde anche avendo semplicemente disattivato
-- la rivendicazione della 0013 — che è il pezzo senza il quale la 0013 REGREDIVA la 0012.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, email_confirmed_at)
values ('00000000-0000-0000-0000-000000000322', 'primaemail@esempio.it', now());

-- Profilo creato a mano con `contact_email` = mail dell'account, come fa la 0011 sul
-- canale email/password: è la condizione perché la 0013 riconosca il recapito DERIVATO.
insert into public.profiles
  (id, first_name, last_name, phone, city, province, country, birth_date,
   privacy_consent_at, contact_email)
values ('00000000-0000-0000-0000-000000000322',
        'Prima', 'Email', null, null, null, 'IT', '1982-12-12', now(),
        'primaemail@esempio.it');

-- ⚠️ L'ARCHIVIO ARRIVA **DOPO** IL PROFILO, e l'ordine è il test.
-- Nella prima stesura questa riga stava PRIMA: l'utente nasce già confermato, quindi il
-- ramo A la rivendicava all'INSERT del profilo, e al cambio email il §4 trovava
-- `claimed_by` già valorizzato e non faceva nulla — le tre asserzioni sotto passavano
-- anche cancellando l'intero blocco `if v_spostata and v_vecchia_provata`. Un test che
-- resta verde contro il codice che dovrebbe presidiare non presidia niente.
-- Mettendola qui, al momento della nascita del profilo non c'era niente da agganciare:
-- l'unica strada che può rivendicarla è la rivendicazione al cambio email, cioè il §4.
insert into public.legacy_contacts (id, email_norm, phone, city, country, source)
values ('00000000-0000-0000-0000-000000000310', 'primaemail@esempio.it',
        '+393330000310', 'Como', 'IT', 'access');

update auth.users set email = 'secondaemail@esempio.it'
 where id = '00000000-0000-0000-0000-000000000322';

do $$
declare r record;
begin
  select l.claimed_by, p.contact_email, p.phone, p.city into r
    from public.legacy_contacts l
    join public.profiles p on p.id = '00000000-0000-0000-0000-000000000322'
   where l.id = '00000000-0000-0000-0000-000000000310';

  if r.contact_email is distinct from 'secondaemail@esempio.it' then
    raise exception 'T12 FAIL: il recapito derivato non segue piu'' il cambio indirizzo (contact_email = %)',
      coalesce(r.contact_email, '<null>');
  end if;
  if r.claimed_by is distinct from '00000000-0000-0000-0000-000000000322'::uuid then
    raise exception 'T12 FAIL: chi aveva PROVATO il vecchio indirizzo non si porta piu'' dietro la sua riga (claimed_by = %)',
      coalesce(r.claimed_by::text, '<null>');
  end if;
  if r.phone is distinct from '+393330000310' or r.city is distinct from 'Como' then
    raise exception 'T12 FAIL: la riga e'' stata rivendicata ma i dati non sono stati recuperati (tel=%, citta=%)',
      coalesce(r.phone, '<null>'), coalesce(r.city, '<null>');
  end if;
  raise notice 'T12 PASS: la guardia non ha spento il cambio indirizzo legittimo';
end $$;

-- ---------------------------------------------------------------------------
-- T13 (RIESEGUIBILITÀ E SUPERFICIE): un solo trigger per nome dopo la seconda
-- applicazione, e nessuna funzione raggiungibile dal client.
-- ---------------------------------------------------------------------------
do $$
declare n int;
begin
  select count(*) into n from pg_trigger t
   join pg_class c on c.oid = t.tgrelid
   where not t.tgisinternal and c.relname = 'users'
     and t.tgname in ('on_auth_user_email_confirmed', 'on_auth_user_purge_legacy',
                      'on_auth_user_email_changed', 'on_auth_user_created');
  if n <> 4 then
    raise exception 'T13 FAIL: % trigger su auth.users, attesi 4 (conferma, oblio, cambio email, nascita)', n;
  end if;

  select count(*) into n from pg_trigger t
   join pg_class c on c.oid = t.tgrelid
   where not t.tgisinternal and c.relname = 'profiles'
     and t.tgname in ('on_profile_claim_legacy', 'on_profile_purge_legacy');
  if n <> 2 then
    raise exception 'T13 FAIL: % trigger di aggancio/oblio su profiles, attesi 2', n;
  end if;

  if has_function_privilege('authenticated', 'public.claim_legacy_on_email_confirmed()', 'EXECUTE')
     or has_function_privilege('anon', 'public.claim_legacy_on_email_confirmed()', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.claim_legacy_contact()', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.purge_legacy_on_user_delete()', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.sync_contact_email_on_email_change()', 'EXECUTE') then
    raise exception 'T13 FAIL: superficie RPC aperta dopo il replace';
  end if;
  raise notice 'T13 PASS: trigger unici, nessuna superficie RPC';
end $$;

-- ---------------------------------------------------------------------------
-- T14 (LA TABELLA CHE NON C'È — deve restare ULTIMO): se questa migration girasse senza
-- la 0012, o dopo un suo rollback, la conferma della registrazione morirebbe su
-- «relation does not exist» e nessuno riuscirebbe più ad attivare il proprio account.
-- Si prova togliendo la tabella per davvero, non fidandosi del blocco EXCEPTION scritto.
-- Dopo questo test il database è mutilato: nient'altro può seguire.
-- ---------------------------------------------------------------------------
drop table public.legacy_contacts cascade;

-- Nessun `birth_date` nei metadata: `handle_new_user` non crea il profilo, quindi non si
-- entra in `claim_legacy_contact()`, che dichiara una variabile di tipo
-- `public.legacy_contacts` e non sopravviverebbe alla tabella mancante. Qui sotto esame
-- c'è il ramo della conferma, ed è quello che si esercita.
insert into auth.users (id, email, email_confirmed_at)
values ('00000000-0000-0000-0000-000000000320', 'senzatabella@esempio.it', null);

do $$
begin
  begin
    update auth.users set email_confirmed_at = now()
     where id = '00000000-0000-0000-0000-000000000320';
  exception when others then
    raise exception 'T14 FAIL: senza legacy_contacts la conferma dell''account fallisce (%) — nessuno potrebbe piu'' attivarsi', sqlerrm;
  end;

  if not exists (select 1 from auth.users
                  where id = '00000000-0000-0000-0000-000000000320'
                    and email_confirmed_at is not null) then
    raise exception 'T14 FAIL: la conferma non ha avuto effetto';
  end if;
  raise notice 'T14 PASS: senza la tabella dell''archivio la conferma passa comunque';
end $$;
