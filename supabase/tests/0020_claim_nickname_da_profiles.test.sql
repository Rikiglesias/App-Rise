-- TEST migration 0020 — il claim del nickname nasce da `profiles`, e il Paese resta.
--
-- I test che contano davvero sono T2, T5 e T9.
--   · T2 è la ragione per cui questa migration esiste: la registrazione con un nickname
--     GIÀ OCCUPATO. Oggi la clemenza lo scarta da `profiles` e lo lascia nei metadata,
--     quindi al partner arriverebbe il nickname di un'ALTRA persona — e il brief gli
--     promette il contrario in due punti. Non serve un client malevolo: è il percorso
--     ordinario. Se qualcuno riscrivesse la derivazione lasciando fuori questo caso, T1
--     resterebbe verde (il nickname libero funziona!) e solo T2 diventerebbe rosso.
--   · T5 è l'altro capo: chi scrive il claim SENZA passare da `profiles` (il client, o
--     `PUT /user` chiamato a mano con una sessione valida). È il caso contro cui una
--     correzione lato app non può nulla, ed è il motivo per cui il presidio sta nel DB.
--   · T9 prova la TERMINAZIONE con un numero invece che con «non si è bloccato». Due
--     trigger che scrivono la colonna che li fa scattare sono una ricorsione infinita a
--     meno di una guardia, e la guardia va nel WHERE: `update of colonna` fa scattare il
--     trigger quando la colonna compare nel SET, NON quando il valore cambia davvero
--     (documentazione PostgreSQL, verificata il 2026-07-31). Ciò che ferma la catena è
--     che l'update non tocca nessuna riga. Chi spostasse la guardia in un `if` dentro il
--     corpo scriverebbe codice all'apparenza equivalente e T9 è l'unico che se ne
--     accorgerebbe.
--
-- ⚠️ CIÒ CHE QUESTA SUITE NON PUÒ PROVARE, e va detto invece di lasciarlo credere:
--   · che il claim arrivi davvero al partner con quel valore. Il provider OIDC è spento;
--     la prova end-to-end sul token vero va rifatta quando si accende (stesso residuo
--     dichiarato dalla 0017).
--   · che in produzione GoTrue non riscriva i metadata DOPO di noi. Qui gira Postgres
--     nudo. È esattamente il motivo per cui le facce sono due: T4 prova la nascita, T5
--     prova il presidio che regge se qualcuno riscrive dopo.
--
-- ⚠️ I profili di prova nascono dal trigger `handle_new_user` (insert in `auth.users` con
-- `birth_date` nei metadata, il marker del form email): stessa strada delle suite 0011-0019.
--
-- Prerequisiti: 0001→0019 applicate, poi 0020. Uno dei due shim.
-- Range di id dedicato (`…0700`+).

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE A — IL CLAIM NASCE DA `profiles` (§2)
-- ═══════════════════════════════════════════════════════════════════════════

-- ---------------------------------------------------------------------------
-- T1: il caso normale. Nickname libero → finisce in colonna E nel claim.
-- Non-regressione: un presidio scritto troppo largo (che cancella sempre la chiave)
-- passerebbe T2, T3 e T6 e spegnerebbe il nickname per TUTTI senza rompere altro.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000701', 'primo@esempio.it',
   jsonb_build_object('first_name', 'Primo', 'last_name', 'Arrivato',
                      'phone', '+393330000701', 'city', 'Bologna',
                      'province', 'BO', 'country', 'IT',
                      'birth_date', '1990-01-01',
                      'marketing_consent', false,
                      'preferred_username', 'presomia'));

do $$
declare
  v_colonna text;
  v_claim   text;
begin
  select nickname into v_colonna from public.profiles
   where id = '00000000-0000-0000-0000-000000000701';
  select raw_user_meta_data->>'preferred_username' into v_claim from auth.users
   where id = '00000000-0000-0000-0000-000000000701';

  if v_colonna is distinct from 'presomia' then
    raise exception 'T1 FAIL: il nickname libero non è finito in colonna (%)', coalesce(v_colonna, '<null>');
  end if;
  if v_claim is distinct from 'presomia' then
    raise exception 'T1 FAIL: il claim non riflette il nickname in colonna (%)', coalesce(v_claim, '<null>');
  end if;
  raise notice 'T1 PASS: nickname libero → colonna e claim allineati';
end $$;

-- ---------------------------------------------------------------------------
-- T2 🔴 IL TEST DELLA PROMESSA. Registrazione con un nickname GIÀ OCCUPATO.
-- La clemenza della 0017 lo scarta da `profiles` (la persona entra comunque, senza
-- nickname). Prima della 0020 il valore CHIESTO restava nei metadata, ed era quello che
-- il partner avrebbe ricevuto: il nickname di un'altra persona, che da noi non esiste.
-- Il brief promette il contrario in due punti («se il nome scelto risulta occupato … il
-- nickname resta vuoto» e «è unico da voi? Da noi sì»).
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000702', 'secondo@esempio.it',
   jsonb_build_object('first_name', 'Secondo', 'last_name', 'Arrivato',
                      'phone', '+393330000702', 'city', 'Bologna',
                      'province', 'BO', 'country', 'IT',
                      'birth_date', '1990-01-01',
                      'marketing_consent', false,
                      -- maiuscole diverse: l'unicità è su `lower()`, come l'indice
                      'preferred_username', 'PresoMia'));

do $$
declare
  v_colonna text;
  v_meta    jsonb;
begin
  select nickname into v_colonna from public.profiles
   where id = '00000000-0000-0000-0000-000000000702';
  select raw_user_meta_data into v_meta from auth.users
   where id = '00000000-0000-0000-0000-000000000702';

  -- Prima di tutto: la persona è ENTRATA. La clemenza non deve essere diventata un rifiuto.
  if v_colonna is not null then
    raise exception 'T2 FAIL: il nickname occupato è finito in colonna (%) — la clemenza della 0017 non ha funzionato', v_colonna;
  end if;
  if not exists (select 1 from public.profiles where id = '00000000-0000-0000-0000-000000000702') then
    raise exception 'T2 FAIL — REGISTRAZIONE UCCISA: chi chiede un nickname occupato non è entrato affatto';
  end if;

  if v_meta ? 'preferred_username' then
    raise exception 'T2 FAIL — AL PARTNER ARRIVA IL NICKNAME DI UN ALTRO: `preferred_username` = % è rimasto nei metadata mentre in colonna non c''è nulla',
      v_meta->>'preferred_username';
  end if;
  raise notice 'T2 PASS: nickname occupato → la persona entra, e al partner non arriva nulla';
end $$;

-- ---------------------------------------------------------------------------
-- T3: nickname fuori forma (1 carattere, sotto il minimo di 2 del CHECK `nickname_forma`).
-- La clemenza lo scarta da `profiles`; il claim deve seguirlo. Caso distinto da T2: qui a
-- scartare è il controllo sulla FORMA, non quello sull'unicità — sono due punti diversi
-- della funzione, e un presidio agganciato al solo secondo passerebbe T2 e non questo.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000703', 'terzo@esempio.it',
   jsonb_build_object('first_name', 'Terzo', 'last_name', 'Arrivato',
                      'phone', '+393330000703', 'city', 'Bologna',
                      'province', 'BO', 'country', 'IT',
                      'birth_date', '1990-01-01',
                      'marketing_consent', false,
                      'preferred_username', 'x'));

do $$
declare v_meta jsonb;
begin
  if (select nickname from public.profiles
       where id = '00000000-0000-0000-0000-000000000703') is not null then
    raise exception 'T3 FAIL: un nickname di 1 carattere è finito in colonna';
  end if;

  select raw_user_meta_data into v_meta from auth.users
   where id = '00000000-0000-0000-0000-000000000703';
  if v_meta ? 'preferred_username' then
    raise exception 'T3 FAIL: il nickname fuori forma è rimasto nel claim (%) — al partner arriverebbe un valore che i nostri vincoli rifiutano',
      v_meta->>'preferred_username';
  end if;
  raise notice 'T3 PASS: nickname fuori forma → scartato anche dal claim';
end $$;

-- ---------------------------------------------------------------------------
-- T4: il profilo è nato COMPLETO, e il claim è stato allineato DOPO l'insert.
-- È il test dell'ORDINE, gemello del T7 della 0019: se l'allineamento girasse PRIMA
-- dell'insert in `profiles`, leggerebbe una riga che non c'è ancora e cancellerebbe il
-- claim di TUTTI — e T1 sarebbe l'unico ad accorgersene. Qui si controlla anche che i
-- dati del profilo non siano stati toccati dal giro di trigger.
-- ---------------------------------------------------------------------------
do $$
declare r public.profiles;
begin
  select * into r from public.profiles
   where id = '00000000-0000-0000-0000-000000000701';

  if r.first_name is distinct from 'Primo'
     or r.last_name is distinct from 'Arrivato'
     or r.phone is distinct from '+393330000701'
     or r.city is distinct from 'Bologna'
     or r.province is distinct from 'BO'
     or r.nickname is distinct from 'presomia' then
    raise exception 'T4 FAIL: il profilo non è integro dopo il giro di trigger (nome=%, tel=%, città=%, nick=%)',
      coalesce(r.first_name,'<null>'), coalesce(r.phone,'<null>'),
      coalesce(r.city,'<null>'), coalesce(r.nickname,'<null>');
  end if;
  raise notice 'T4 PASS: profilo integro e claim allineato dopo l''insert, non prima';
end $$;

-- ---------------------------------------------------------------------------
-- T5 🔴 FACCIA B — chi scrive il claim SCAVALCANDO `profiles`.
-- Simula ciò che fa `syncNicknameClaim` (`nickname.ts:116`) e, identico, `PUT /user`
-- chiamato a mano da chiunque abbia una sessione valida: scrive `preferred_username`
-- direttamente nei metadata. Il valore scelto qui è occupato da un altro E lungo oltre i
-- 30 caratteri ammessi: due garanzie del brief violate in un colpo solo.
-- Nessuna correzione lato app può chiudere questo caso — la chiamata non passa dal nostro
-- codice. È il motivo per cui il presidio sta nel database.
-- ---------------------------------------------------------------------------
update auth.users
   set raw_user_meta_data = raw_user_meta_data
       || jsonb_build_object('preferred_username', repeat('intruso', 10))
 where id = '00000000-0000-0000-0000-000000000703';

do $$
declare v_meta jsonb;
begin
  select raw_user_meta_data into v_meta from auth.users
   where id = '00000000-0000-0000-0000-000000000703';

  if v_meta ? 'preferred_username' then
    raise exception 'T5 FAIL — IL CLAIM SI PUÒ SCAVALCARE: un valore scritto a mano nei metadata (% caratteri) è sopravvissuto, mentre in colonna non c''è nickname',
      char_length(v_meta->>'preferred_username');
  end if;
  raise notice 'T5 PASS: un claim scritto fuori da `profiles` non sopravvive';
end $$;

-- Stesso caso, ma su un utente che IL NICKNAME CE L'HA: il valore intruso non deve
-- vincere sul valore in colonna. Distinto dal precedente perché qui il rimedio non è
-- «cancella» ma «riporta a quello vero»: un presidio che sa solo cancellare passerebbe
-- il test qui sopra e spegnerebbe il nickname di chi lo ha legittimamente.
update auth.users
   set raw_user_meta_data = raw_user_meta_data
       || jsonb_build_object('preferred_username', 'rubato')
 where id = '00000000-0000-0000-0000-000000000701';

do $$
declare v_claim text;
begin
  select raw_user_meta_data->>'preferred_username' into v_claim from auth.users
   where id = '00000000-0000-0000-0000-000000000701';

  if v_claim is distinct from 'presomia' then
    raise exception 'T5b FAIL: il claim non è tornato al nickname di `profiles` (vale %)', coalesce(v_claim, '<null>');
  end if;
  raise notice 'T5b PASS: un claim sovrascritto torna al valore di `profiles`';
end $$;

-- ---------------------------------------------------------------------------
-- T6: utente SENZA profilo (login social prima del completamento) che ha un
-- `preferred_username` nei metadata — per esempio scritto dal provider. Al partner non
-- deve arrivare: non nasce da `profiles`, e `profiles` è ciò che il brief descrive.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000704', 'social@esempio.it',
   -- niente `birth_date`: è il marker del form email, quindi qui NON nasce un profilo
   jsonb_build_object('name', 'Social Sociale',
                      'preferred_username', 'daldiprovider'));

do $$
declare v_meta jsonb;
begin
  if exists (select 1 from public.profiles
              where id = '00000000-0000-0000-0000-000000000704') then
    raise exception 'T6 FAIL (premessa): è nato un profilo dove non doveva — il test non prova più ciò che dice';
  end if;

  select raw_user_meta_data into v_meta from auth.users
   where id = '00000000-0000-0000-0000-000000000704';
  if v_meta ? 'preferred_username' then
    raise exception 'T6 FAIL: un claim senza profilo dietro è sopravvissuto (%)', v_meta->>'preferred_username';
  end if;
  raise notice 'T6 PASS: nessun profilo → nessun claim';
end $$;

-- ---------------------------------------------------------------------------
-- T7 FACCIA A — `profiles` cambia, il claim la segue.
-- È il caso del completamento profilo dopo il login social (`useProfileForm.ts:336`), che
-- scrive `profiles` e sincronizza SOLO il nome (`:356`), mai il nickname: senza questa
-- faccia, il claim resterebbe al valore vecchio per sempre. Copre anche ogni modifica
-- futura fatta in SQL, che l'app non intercetterebbe comunque.
-- ---------------------------------------------------------------------------
update public.profiles set nickname = 'cambiato'
 where id = '00000000-0000-0000-0000-000000000701';

do $$
declare v_claim text;
begin
  select raw_user_meta_data->>'preferred_username' into v_claim from auth.users
   where id = '00000000-0000-0000-0000-000000000701';
  if v_claim is distinct from 'cambiato' then
    raise exception 'T7 FAIL: cambiato il nickname in colonna, il claim è rimasto a %', coalesce(v_claim, '<null>');
  end if;
  raise notice 'T7 PASS: il claim segue `profiles` quando cambia';
end $$;

-- ---------------------------------------------------------------------------
-- T8: il nickname viene TOLTO da `profiles` → il claim sparisce.
-- È la terza promessa del brief: «lo togliamo dal nostro lato e smette di arrivarvi».
-- Senza questo, chi cancella il proprio nickname continuerebbe a comparire sulle liste
-- pubbliche del partner — cioè l'esatto contrario di ciò che ha chiesto.
-- ---------------------------------------------------------------------------
update public.profiles set nickname = null
 where id = '00000000-0000-0000-0000-000000000701';

do $$
declare v_meta jsonb;
begin
  select raw_user_meta_data into v_meta from auth.users
   where id = '00000000-0000-0000-0000-000000000701';
  if v_meta ? 'preferred_username' then
    raise exception 'T8 FAIL: tolto il nickname, il claim è rimasto (%) — al partner continuerebbe ad arrivare',
      v_meta->>'preferred_username';
  end if;
  raise notice 'T8 PASS: nickname tolto → il claim smette di arrivare';
end $$;

-- ---------------------------------------------------------------------------
-- T9 🔴 TERMINAZIONE, misurata. Due trigger scrivono la colonna che li fa scattare:
-- senza la guardia nel WHERE è una ricorsione infinita. Non basta che il test «non si
-- blocchi» — quello lo direbbe anche una catena di 40 giri — quindi si CONTA.
-- Atteso: 2 UPDATE (quello esterno + il riallineamento). La soglia è 5 per non essere
-- fragile su un giro in più della pulizia della 0019, che convive sulla stessa colonna.
-- ---------------------------------------------------------------------------
create table public._t9_giri (n serial);

create function public._t9_conta() returns trigger
language plpgsql as $$
begin
  insert into public._t9_giri default values;
  return null;
end $$;

-- Nome con `zzz`: i trigger dello stesso tipo girano in ordine alfabetico, e questo deve
-- contare DOPO che gli altri hanno fatto il loro lavoro.
create trigger zzz_t9_conta
  after update of raw_user_meta_data on auth.users
  for each row execute procedure public._t9_conta();

update auth.users
   set raw_user_meta_data = raw_user_meta_data
       || jsonb_build_object('preferred_username', 'provocazione')
 where id = '00000000-0000-0000-0000-000000000702';

do $$
declare v_giri int;
begin
  select count(*) into v_giri from public._t9_giri;
  if v_giri > 5 then
    raise exception 'T9 FAIL — RICORSIONE: % update su auth.users per una sola scrittura esterna (atteso 2)', v_giri;
  end if;
  if v_giri < 2 then
    raise exception 'T9 FAIL (premessa): solo % update contati — il riallineamento non è scattato affatto, quindi questo test non sta provando la terminazione', v_giri;
  end if;
  raise notice 'T9 PASS: la catena si spegne in % update, nessuna ricorsione', v_giri;
end $$;

drop trigger zzz_t9_conta on auth.users;
drop function public._t9_conta();
drop table public._t9_giri;

-- ---------------------------------------------------------------------------
-- T10: la chiave presente con valore JSON `null`. `->>` la rende indistinguibile
-- dall'assenza, quindi una guardia scritta con la sola disuguaglianza la lascerebbe lì
-- per sempre: innocua per il server auth, ma è una chiave in più nella superficie che
-- UserInfo consegna intera — cioè il problema che la 0019 esiste per ridurre.
-- ---------------------------------------------------------------------------
update auth.users
   set raw_user_meta_data = raw_user_meta_data
       || jsonb_build_object('preferred_username', null)
 where id = '00000000-0000-0000-0000-000000000704';

do $$
declare v_meta jsonb;
begin
  select raw_user_meta_data into v_meta from auth.users
   where id = '00000000-0000-0000-0000-000000000704';
  if v_meta ? 'preferred_username' then
    raise exception 'T10 FAIL: la chiave con valore null è rimasta nei metadata';
  end if;
  raise notice 'T10 PASS: la chiave con valore null viene tolta, non solo svuotata';
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE B — IL PAESE RESTA (§1)
-- ═══════════════════════════════════════════════════════════════════════════

-- ---------------------------------------------------------------------------
-- T11: dopo la registrazione, `country` è ANCORA nei metadata. È la decisione di
-- Riccardo del 2026-07-31: il modulo del partner lo chiede come obbligatorio, quindi
-- tenerlo nascosto non protegge nessuno e costa al partner un campo da richiedere.
-- Questo test è il gemello rovesciato del T5 della 0019, che pretendeva il contrario.
-- ---------------------------------------------------------------------------
do $$
declare v_meta jsonb;
begin
  select raw_user_meta_data into v_meta from auth.users
   where id = '00000000-0000-0000-0000-000000000701';

  if not (v_meta ? 'country') then
    raise exception 'T11 FAIL: `country` è stato portato via dalla bonifica — il partner dovrebbe richiederlo di nuovo';
  end if;
  if v_meta->>'country' is distinct from 'IT' then
    raise exception 'T11 FAIL: `country` alterato (%)', v_meta->>'country';
  end if;
  raise notice 'T11 PASS: il Paese resta nei metadata e arriva al partner';
end $$;

-- ---------------------------------------------------------------------------
-- T12: NON-REGRESSIONE della 0019 — tutto il RESTO dell'anagrafica continua a sparire.
-- Senza questo test, «escludere country» e «spegnere la bonifica» sarebbero
-- indistinguibili: T11 sarebbe verde in entrambi i casi.
-- ---------------------------------------------------------------------------
do $$
declare v_rimaste text[];
begin
  select array_agg(k order by k) into v_rimaste
    from auth.users u,
         lateral jsonb_object_keys(u.raw_user_meta_data) k
   where u.id = '00000000-0000-0000-0000-000000000701'
     and k in ('first_name','last_name','phone','city','province',
               'birth_date','marketing_consent','contact_email');

  if v_rimaste is not null then
    raise exception 'T12 FAIL — BONIFICA SPENTA, non ristretta: l''anagrafica è rimasta nei metadata: %', v_rimaste;
  end if;
  raise notice 'T12 PASS: il resto dell''anagrafica continua a sparire';
end $$;

-- ---------------------------------------------------------------------------
-- T13 🔴 IL PAESE CAMBIATO NEL PROFILO ARRIVA AL PARTNER. Dal momento in cui `country`
-- viaggia verso di loro, vale la stessa promessa del nickname: quello che ricevono è
-- quello che c'è nel profilo. La persona lo può cambiare da «modifica profilo»
-- (`ProfileEditScreen.tsx:198`) e l'app NON risincronizza i metadata — `AuthContext`
-- sincronizza solo nome e nickname. Senza la derivazione, al partner resterebbe per
-- sempre il Paese scelto in registrazione.
-- ---------------------------------------------------------------------------
update public.profiles set country = 'FR', province = null
 where id = '00000000-0000-0000-0000-000000000701';

do $$
declare v_paese text;
begin
  select raw_user_meta_data->>'country' into v_paese from auth.users
   where id = '00000000-0000-0000-0000-000000000701';
  if v_paese is distinct from 'FR' then
    raise exception 'T13 FAIL: cambiato il Paese nel profilo, al partner arriverebbe ancora % ', coalesce(v_paese, '<assente>');
  end if;
  raise notice 'T13 PASS: il Paese segue `profiles` quando cambia';
end $$;

-- ---------------------------------------------------------------------------
-- T13b: il Paese scritto a mano nei metadata torna a quello di `profiles`. Stessa faccia
-- B del nickname, e serve per la stessa ragione: `country` non ha vincoli nei metadata,
-- e chiunque abbia una sessione può scriverci quello che vuole con `PUT /user`.
-- ---------------------------------------------------------------------------
update auth.users
   set raw_user_meta_data = raw_user_meta_data || jsonb_build_object('country', 'ZZ')
 where id = '00000000-0000-0000-0000-000000000701';

do $$
declare v_paese text;
begin
  select raw_user_meta_data->>'country' into v_paese from auth.users
   where id = '00000000-0000-0000-0000-000000000701';
  if v_paese is distinct from 'FR' then
    raise exception 'T13b FAIL: un Paese scritto fuori da `profiles` è sopravvissuto (%)', coalesce(v_paese, '<assente>');
  end if;
  raise notice 'T13b PASS: un Paese scritto fuori da `profiles` non sopravvive';
end $$;

-- ---------------------------------------------------------------------------
-- T13c: il ripristino per chi il Paese l'ha già perso con la 0019. Sul database vivo
-- tocca 0 righe (0 profili), ed è proprio per questo che va esercitato qui: è il pezzo
-- che entrerebbe in produzione senza che nessuno l'abbia visto funzionare. Non ha una
-- funzione propria — lo fa il backfill del §2e, che chiama la stessa derivazione.
-- ---------------------------------------------------------------------------
-- Si ricrea la condizione lasciata dalla 0019: Paese in colonna, chiave assente nei
-- metadata. `update ... - 'country'` NON fa scattare la faccia B su sé stessa in modo
-- utile qui (rimetterebbe subito il valore), quindi si verifica che il backfill sappia
-- farlo comunque: è lui a girare all'apply, su righe che nessun trigger ha svegliato.
do $$
declare v_paese text;
begin
  -- Si spegne per un istante il presidio, per simulare lo stato in cui la 0019 lascia il
  -- database: senza questo, la chiave verrebbe rimessa dal trigger e il test proverebbe
  -- la faccia B invece del backfill.
  alter table auth.users disable trigger on_auth_user_metadata_claim_allineamento;
  update auth.users set raw_user_meta_data = raw_user_meta_data - 'country'
   where id = '00000000-0000-0000-0000-000000000701';
  alter table auth.users enable trigger on_auth_user_metadata_claim_allineamento;

  select raw_user_meta_data->>'country' into v_paese from auth.users
   where id = '00000000-0000-0000-0000-000000000701';
  if v_paese is not null then
    raise exception 'T13c FAIL (premessa): il Paese non è stato tolto, il test non prova più il backfill';
  end if;

  -- Il giro che fa il §2e su tutti gli utenti.
  perform public.allinea_claim_da_profiles_di(id) from auth.users;

  select raw_user_meta_data->>'country' into v_paese from auth.users
   where id = '00000000-0000-0000-0000-000000000701';
  if v_paese is distinct from 'FR' then
    raise exception 'T13c FAIL: il backfill non ha rimesso il Paese (%)', coalesce(v_paese, '<assente>');
  end if;
  raise notice 'T13c PASS: chi aveva perso il Paese se lo vede ripristinato dal backfill';
end $$;

-- ---------------------------------------------------------------------------
-- T14: `name` non viene toccato da nessuno dei due presidi. È l'altro claim OIDC, e a
-- differenza del nickname ha un RIPIEGO nel server auth: se manca, al partner viene
-- mandata l'EMAIL dell'account. Una derivazione scritta troppo larga, che ripulisse i
-- claim invece del solo `preferred_username`, farebbe trapelare l'indirizzo — un guasto
-- che nessuno degli altri test vedrebbe.
-- ---------------------------------------------------------------------------
do $$
declare v_nome text;
begin
  select raw_user_meta_data->>'name' into v_nome from auth.users
   where id = '00000000-0000-0000-0000-000000000704';
  if v_nome is distinct from 'Social Sociale' then
    raise exception 'T14 FAIL: il claim `name` è stato toccato (vale %) — se sparisce, il server auth ci mette l''email dell''account',
      coalesce(v_nome, '<assente>');
  end if;
  raise notice 'T14 PASS: il claim `name` non viene toccato';
end $$;

-- ---------------------------------------------------------------------------
-- T15: SUPERFICIE. Le funzioni di questa migration scrivono su `auth.users` e sono
-- `security definer`: esposte a `anon` o `authenticated`, sarebbero un modo per far
-- scrivere il database a chiunque abbia la chiave pubblica. I `revoke` ci sono, ma un
-- `create or replace` futuro che li dimenticasse non romperebbe nessun altro test —
-- questo è l'unico posto dove si vedrebbe. Gemello del T12 della suite 0019.
-- ---------------------------------------------------------------------------
do $$
declare n int;
begin
  select count(*) into n
    from pg_proc p
   where p.pronamespace = 'public'::regnamespace
     and p.proname in ('allinea_claim_da_profiles',
                       'allinea_claim_da_profiles_di',
                       'allinea_claim_da_profiles_su_metadata')
     and (has_function_privilege('anon', p.oid, 'EXECUTE')
          or has_function_privilege('authenticated', p.oid, 'EXECUTE'));
  if n <> 0 then
    raise exception 'T15 FAIL: % funzioni di allineamento sono chiamabili dal client', n;
  end if;

  -- E che ci siano tutte e tre: un `revoke` su una funzione che non esiste più passerebbe
  -- il controllo qui sopra senza dire niente.
  select count(*) into n
    from pg_proc p
   where p.pronamespace = 'public'::regnamespace
     and p.proname in ('allinea_claim_da_profiles',
                       'allinea_claim_da_profiles_di',
                       'allinea_claim_da_profiles_su_metadata');
  if n <> 3 then
    raise exception 'T15 FAIL: trovate % delle 3 funzioni di allineamento attese', n;
  end if;
  raise notice 'T15 PASS: le tre funzioni esistono e nessuna è chiamabile dal client';
end $$;
