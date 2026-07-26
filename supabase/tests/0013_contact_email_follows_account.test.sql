-- TEST migration 0013 — la mail di contatto segue il cambio della mail dell'account.
-- Assert espliciti, mai vacui.
--
-- Il test non rilegge il sorgente della funzione (direbbe solo che la migration ha
-- scritto ciò che dice di scrivere): cambia mail a utenti veri e guarda la riga che
-- ne esce. Le prove che contano davvero sono tre, e nessuna è quella «facile»:
--   · T2, l'asse negativo: un recapito SCELTO dalla persona non deve muoversi;
--   · T7, il motivo per cui la migration esiste: senza di lei una riga storica
--     sopravvive alla cancellazione dell'account;
--   · T8, il rollback ESEGUITO per davvero — non dichiarato nell'intestazione e mai
--     provato, che è l'errore costato un giro con la 0012.
--
-- Prerequisiti: 0001→0012 applicate, poi 0013. Uno dei due shim (permissive o
-- restrictive): la 0013 non concede grant, quindi l'esito deve essere identico.
--
-- Nota sullo shim: `auth.users` locale non ha `new_email` e nessuno simula la
-- conferma. È corretto così — il trigger reagisce all'EFFETTO (la mail è cambiata),
-- non alla richiesta, quindi il fatto sotto test è esattamente `update … set email`.

-- ---------------------------------------------------------------------------
-- T1: il caso DERIVATO. Chi si registra con email/password ha `contact_email`
-- uguale alla mail dell'account (la scrive la 0011). Se cambia la mail, la
-- colonna deve seguirla.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e1',
  'vecchia@esempio.it',
  jsonb_build_object(
    'first_name', 'Mario', 'last_name', 'Rossi',
    'phone', '+393331110001', 'city', 'Roma', 'province', 'RM',
    'country', 'IT', 'birth_date', '1990-01-01'
  )
);

update auth.users set email = 'nuova@esempio.it'
 where id = '00000000-0000-0000-0000-0000000000e1';

do $$
declare v text;
begin
  select contact_email into v from public.profiles
   where id = '00000000-0000-0000-0000-0000000000e1';
  if v is distinct from 'nuova@esempio.it' then
    raise exception 'T1 FAIL: contact_email = %, attesa nuova@esempio.it', coalesce(v, '<null>');
  end if;
  raise notice 'T1 PASS: la mail derivata segue il cambio dell''account';
end $$;

-- ---------------------------------------------------------------------------
-- T2 (ASSE NEGATIVO, il più importante): un recapito SCELTO dalla persona non è
-- una copia della credenziale, ed è una sua decisione. Cambiare la mail di
-- accesso non la revoca: la colonna NON si deve muovere.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e2',
  'accesso@esempio.it',
  jsonb_build_object(
    'first_name', 'Anna', 'last_name', 'Bianchi',
    'phone', '+393331110002', 'city', 'Milano', 'province', 'MI',
    'country', 'IT', 'birth_date', '1985-05-05',
    'contact_email', 'scelta@esempio.it'
  )
);

update auth.users set email = 'accesso-nuovo@esempio.it'
 where id = '00000000-0000-0000-0000-0000000000e2';

do $$
declare v text;
begin
  select contact_email into v from public.profiles
   where id = '00000000-0000-0000-0000-0000000000e2';
  if v is distinct from 'scelta@esempio.it' then
    raise exception 'T2 FAIL: il recapito scelto è stato sovrascritto (ora %)', coalesce(v, '<null>');
  end if;
  raise notice 'T2 PASS: il recapito scelto dalla persona non viene toccato';
end $$;

-- ---------------------------------------------------------------------------
-- T3: colonna VUOTA resta vuota. Un profilo nato prima della 0011 (o da un canale
-- che non la scrive) non deve essere «completato» di nostra iniziativa: sarebbe un
-- dato che la persona non ci ha mai dato, e spegnerebbe il sollecito che esiste
-- apposta. RESIDUO DICHIARATO, non una svista: chi ha la colonna vuota resta senza
-- recapito finché non lo scrive lui.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e3',
  'abc999xyz@privaterelay.appleid.com',
  jsonb_build_object(
    'first_name', 'Luca', 'last_name', 'Verdi',
    'phone', '+393331110003', 'city', 'Torino', 'province', 'TO',
    'country', 'IT', 'birth_date', '1992-02-02'
  )
);

do $$
declare v text;
begin
  select contact_email into v from public.profiles
   where id = '00000000-0000-0000-0000-0000000000e3';
  if v is not null then
    raise exception 'T3 SETUP FAIL: la 0011 doveva lasciare la colonna vuota, invece c''è %', v;
  end if;
end $$;

update auth.users set email = 'uscito.dal.relay@esempio.it'
 where id = '00000000-0000-0000-0000-0000000000e3';

do $$
declare v text;
begin
  select contact_email into v from public.profiles
   where id = '00000000-0000-0000-0000-0000000000e3';
  if v is not null then
    raise exception 'T3 FAIL: colonna vuota riempita di nostra iniziativa (ora %)', v;
  end if;
  raise notice 'T3 PASS: la colonna vuota resta vuota (residuo dichiarato)';
end $$;

-- ---------------------------------------------------------------------------
-- T4: un update che NON cambia la mail non deve fare nulla. Due varianti, perché
-- `update of email` fira anche quando la colonna è nella lista degli aggiornati
-- col valore identico: senza la guardia lavoreremmo a ogni update che la sfiora.
-- ---------------------------------------------------------------------------
-- Il valore in colonna si mette con maiuscole DIVERSE dalla mail dell'account: se
-- la guardia `v_cambiata` sparisse, `set email = email` rientrerebbe nel ramo di
-- riallineo e **normalizzerebbe le maiuscole**, che è l'unico effetto osservabile
-- della guardia. Senza questa accortezza l'assert sarebbe vacuo — riscriverebbe lo
-- stesso identico valore e resterebbe verde anche a guardia rimossa.
update public.profiles set contact_email = 'Nuova@Esempio.IT'
 where id = '00000000-0000-0000-0000-0000000000e1';

update auth.users
   set raw_user_meta_data = raw_user_meta_data || jsonb_build_object('nota', 'x')
 where id = '00000000-0000-0000-0000-0000000000e1';

update auth.users set email = email
 where id = '00000000-0000-0000-0000-0000000000e1';

do $$
declare v text;
begin
  select contact_email into v from public.profiles
   where id = '00000000-0000-0000-0000-0000000000e1';
  if v is distinct from 'Nuova@Esempio.IT' then
    raise exception 'T4 FAIL: un update innocuo ha toccato la colonna (ora %)', coalesce(v, '<null>');
  end if;
  raise notice 'T4 PASS: update senza cambio di mail = nessun effetto, nemmeno sulle maiuscole';
end $$;

-- ---------------------------------------------------------------------------
-- T5 (GUARDIA RELAY, come la 0011): se la mail NUOVA è un alias Apple Private
-- Relay non va scritta — renderebbe il profilo «completo» con un indirizzo che non
-- è quello della persona. Meglio tenere il vecchio, che almeno era reale.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e5',
  'reale@esempio.it',
  jsonb_build_object(
    'first_name', 'Sara', 'last_name', 'Neri',
    'phone', '+393331110005', 'city', 'Genova', 'province', 'GE',
    'country', 'IT', 'birth_date', '1991-03-03'
  )
);

update auth.users set email = 'zzz111@privaterelay.appleid.com'
 where id = '00000000-0000-0000-0000-0000000000e5';

do $$
declare v text;
begin
  select contact_email into v from public.profiles
   where id = '00000000-0000-0000-0000-0000000000e5';
  if v is distinct from 'reale@esempio.it' then
    raise exception 'T5 FAIL: un alias di relay è finito in colonna (ora %)', coalesce(v, '<null>');
  end if;
  raise notice 'T5 PASS: l''alias di relay non entra in contact_email';
end $$;

-- ---------------------------------------------------------------------------
-- T6: il confronto è normalizzato. Una colonna con maiuscole diverse è comunque
-- «la stessa mail dell'account»: se non lo fosse, il caso derivato smetterebbe di
-- essere riconosciuto e il difetto tornerebbe in silenzio proprio per chi ha
-- scritto l'indirizzo a mano.
-- NB — spazi NON si testano qui perché non possono esistere in colonna: il vincolo
-- `profiles_contact_email_chk` (0009) li vieta. È il primo giro di questa suite ad
-- averlo scoperto, e ha trovato un difetto vero nella migration: scriveva il valore
-- grezzo, quindi un indirizzo con spazi avrebbe fatto fallire il vincolo DENTRO il
-- trigger, cioè avrebbe impedito il cambio email. Ora scrive `btrim`.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e6',
  'maiuscole@esempio.it',
  jsonb_build_object(
    'first_name', 'Elena', 'last_name', 'Conti',
    'phone', '+393331110006', 'city', 'Bari', 'province', 'BA',
    'country', 'IT', 'birth_date', '1993-04-04'
  )
);

update public.profiles set contact_email = 'Maiuscole@Esempio.IT'
 where id = '00000000-0000-0000-0000-0000000000e6';

update auth.users set email = 'minuscole@esempio.it'
 where id = '00000000-0000-0000-0000-0000000000e6';

do $$
declare v text;
begin
  select contact_email into v from public.profiles
   where id = '00000000-0000-0000-0000-0000000000e6';
  if v is distinct from 'minuscole@esempio.it' then
    raise exception 'T6 FAIL: confronto non normalizzato (colonna = %)', coalesce(v, '<null>');
  end if;
  raise notice 'T6 PASS: maiuscole e spazi non impediscono il riconoscimento';
end $$;

-- ---------------------------------------------------------------------------
-- T6b (CONTRO-PROVA del difetto trovato al primo giro): se la mail nuova arriva
-- con spazi ai bordi, il trigger deve ripulirla. Senza `btrim` questo `update`
-- NON fallisce «in silenzio»: viola `profiles_contact_email_chk` e fa fallire
-- l'UPDATE su auth.users, cioè rende IMPOSSIBILE il cambio email — un difetto
-- peggiore di quello che la migration voleva chiudere. Se qualcuno toglie il
-- btrim, questo test spara.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e9',
  'origine@esempio.it',
  jsonb_build_object(
    'first_name', 'Ivo', 'last_name', 'Sala',
    'phone', '+393331110009', 'city', 'Lecce', 'province', 'LE',
    'country', 'IT', 'birth_date', '1979-12-12'
  )
);

update auth.users set email = '  con.spazi@esempio.it  '
 where id = '00000000-0000-0000-0000-0000000000e9';

do $$
declare v text;
begin
  select contact_email into v from public.profiles
   where id = '00000000-0000-0000-0000-0000000000e9';
  if v is distinct from 'con.spazi@esempio.it' then
    raise exception 'T6b FAIL: valore non ripulito (colonna = %)', coalesce(v, '<null>');
  end if;
  raise notice 'T6b PASS: gli spazi vengono tolti, il cambio email non si blocca';
end $$;

-- ---------------------------------------------------------------------------
-- T7: IL MOTIVO PER CUI QUESTA MIGRATION ESISTE — l'oblio end-to-end.
-- Scenario reale: la persona si registra con un indirizzo, l'archivio storico la
-- conosce sotto un ALTRO indirizzo (quello che userà dopo), poi cambia la mail
-- dell'account e infine chiede la cancellazione. Senza la 0013 la 0012 cancella
-- per la chiave VECCHIA e la riga storica sopravvive: una seconda copia dei suoi
-- dati che nessuno porta via. È la stessa classe chiusa in `411e0d4`.
-- ---------------------------------------------------------------------------
insert into public.legacy_contacts (id, email_norm, first_name, last_name, source)
values ('00000000-0000-0000-0000-0000000000d7', 'dopo.il.cambio@esempio.it',
        'Giorgio', 'Fabbri', 'access');

insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e7',
  'prima.del.cambio@esempio.it',
  jsonb_build_object(
    'first_name', 'Giorgio', 'last_name', 'Fabbri',
    'phone', '+393331110007', 'city', 'Verona', 'province', 'VR',
    'country', 'IT', 'birth_date', '1980-09-09'
  )
);

do $$
declare v uuid;
begin
  select claimed_by into v from public.legacy_contacts
   where id = '00000000-0000-0000-0000-0000000000d7';
  if v is not null then
    raise exception 'T7 SETUP FAIL: la riga non doveva essere rivendicata alla nascita';
  end if;
end $$;

update auth.users set email = 'dopo.il.cambio@esempio.it'
 where id = '00000000-0000-0000-0000-0000000000e7';

delete from public.profiles where id = '00000000-0000-0000-0000-0000000000e7';

do $$
declare n int;
begin
  select count(*) into n from public.legacy_contacts
   where id = '00000000-0000-0000-0000-0000000000d7';
  if n <> 0 then
    raise exception 'T7 FAIL: la riga storica è sopravvissuta alla cancellazione (Art. 17)';
  end if;
  raise notice 'T7 PASS: l''oblio raggiunge la riga registrata sotto la mail nuova';
end $$;

-- ---------------------------------------------------------------------------
-- T7b: IL VERSO OPPOSTO — la regressione che questa migration STAVA introducendo
-- e che T7 da solo non poteva vedere, perché provava solo il verso favorevole
-- (riga registrata sotto la mail NUOVA). Trovata da un critico avversariale, non
-- dalla suite: è la classe «rilevatore testato solo sui casi positivi».
--
-- Scenario: la persona si registra PRIMA che l'archivio venga caricato (è il caso
-- per cui esiste il §4 della 0012), quindi la sua riga storica resta NON
-- rivendicata sotto l'indirizzo con cui si era registrata. Poi cambia indirizzo.
-- Spostando `contact_email`, l'oblio della 0012 — che cancella su
-- `old.contact_email` — non raggiungerebbe più quella riga: sopravvivrebbe alla
-- cancellazione dell'account. Il riaggancio la rivendica, e la porta via la
-- cascata su `claimed_by`.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000ea',
  'registrato.prima@esempio.it',
  jsonb_build_object(
    'first_name', 'Nadia', 'last_name', 'Riva',
    'phone', '+393331110010', 'city', 'Como', 'province', 'CO',
    'country', 'IT', 'birth_date', '1983-03-13'
  )
);

-- L'import arriva DOPO la registrazione → la riga nasce non rivendicata.
insert into public.legacy_contacts (id, email_norm, first_name, last_name, source)
values ('00000000-0000-0000-0000-0000000000da', 'registrato.prima@esempio.it',
        'Nadia', 'Riva', 'access');

do $$
declare v uuid;
begin
  select claimed_by into v from public.legacy_contacts
   where id = '00000000-0000-0000-0000-0000000000da';
  if v is not null then
    raise exception 'T7b SETUP FAIL: la riga non doveva risultare rivendicata';
  end if;
end $$;

update auth.users set email = 'poi.cambiata@esempio.it'
 where id = '00000000-0000-0000-0000-0000000000ea';

do $$
declare v uuid; d timestamptz;
begin
  select claimed_by, claimed_at into v, d from public.legacy_contacts
   where id = '00000000-0000-0000-0000-0000000000da';
  if v is distinct from '00000000-0000-0000-0000-0000000000ea'::uuid then
    raise exception 'T7b FAIL: riga storica abbandonata sotto l''indirizzo vecchio (claimed_by = %)',
      coalesce(v::text, '<null>');
  end if;
  if d is null then
    raise exception 'T7b FAIL: claimed_by valorizzato senza claimed_at (vincolo di coerenza)';
  end if;
  raise notice 'T7b PASS: la riga sotto l''indirizzo vecchio viene rivendicata, non abbandonata';
end $$;

delete from auth.users where id = '00000000-0000-0000-0000-0000000000ea';

do $$
declare n int;
begin
  select count(*) into n from public.legacy_contacts
   where id = '00000000-0000-0000-0000-0000000000da';
  if n <> 0 then
    raise exception 'T7b FAIL: la riga è sopravvissuta alla cancellazione dell''account (Art. 17)';
  end if;
  raise notice 'T7b PASS: e la cancellazione dell''account se la porta via';
end $$;

-- ---------------------------------------------------------------------------
-- T8: IL ROLLBACK, ESEGUITO. Non basta scriverlo nell'intestazione: la 0012 aveva
-- un rollback dichiarato che ROMPEVA le registrazioni, e se ne è accorto solo chi
-- l'ha lanciato. Qui si esegue davvero e si verificano DUE cose: che il riallineo
-- smetta (effetto tolto) e che il resto del sistema regga — cioè che una
-- registrazione nuova continui a funzionare.
-- ---------------------------------------------------------------------------
drop trigger if exists on_auth_user_email_changed on auth.users;
drop function if exists public.sync_contact_email_on_email_change();

insert into auth.users (id, email, raw_user_meta_data)
values (
  '00000000-0000-0000-0000-0000000000e8',
  'post.rollback@esempio.it',
  jsonb_build_object(
    'first_name', 'Chiara', 'last_name', 'Ferri',
    'phone', '+393331110008', 'city', 'Trieste', 'province', 'TS',
    'country', 'IT', 'birth_date', '1987-11-11'
  )
);

do $$
declare v text;
begin
  select contact_email into v from public.profiles
   where id = '00000000-0000-0000-0000-0000000000e8';
  if v is distinct from 'post.rollback@esempio.it' then
    raise exception 'T8 FAIL: dopo il rollback la registrazione non funziona più (contact_email = %)',
      coalesce(v, '<null>');
  end if;
end $$;

update auth.users set email = 'cambiata.dopo.rollback@esempio.it'
 where id = '00000000-0000-0000-0000-0000000000e8';

do $$
declare v text;
begin
  select contact_email into v from public.profiles
   where id = '00000000-0000-0000-0000-0000000000e8';
  if v is distinct from 'post.rollback@esempio.it' then
    raise exception 'T8 FAIL: il rollback non ha tolto l''effetto (colonna = %)', coalesce(v, '<null>');
  end if;
  raise notice 'T8 PASS: rollback eseguito — effetto tolto, registrazioni intatte';
end $$;

-- Riga d'esito finale, come tutte le suite sorelle: `tests/README.md` la definisce
-- come IL criterio di verde quando si esegue una coppia a mano. Mancava, e una
-- suite verde sarebbe stata letta come rossa.
select 'ALL TESTS PASS' as esito;
