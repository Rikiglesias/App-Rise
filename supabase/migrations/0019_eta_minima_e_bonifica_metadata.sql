-- Migration 0019 — si entra dai 14 anni, e l'anagrafica smette di restare nei metadata
--
-- QUATTRO COSE IN UN FILE SOLO, e il motivo per cui non sono quattro migration: ogni
-- apply in produzione è una leva di Riccardo più un rischio. Le prime due sono la fase
-- F-MINORI; le ultime due sono i due difetti che la 0016 si era lasciata dietro,
-- tracciati in `~/todos/improvements-proposed.md` con l'istruzione esplicita di
-- accorparli «alla prossima migration che tocca quest'area». Questa è quella migration.
--
-- ---------------------------------------------------------------------------------
-- §1 — L'ETÀ MINIMA SCENDE DA 18 A 14
-- ---------------------------------------------------------------------------------
-- DECISIONE DI RICCARDO (2026-07-30, «scelta A»): si entra dai 14 anni, **un solo
-- regime**, nessun consenso genitoriale da raccogliere. Sotto i 14 si resta fuori.
--
-- Perché non «nessun vincolo»: la soglia italiana per il consenso digitale è **14 anni**
-- (art. 8 GDPR, che fissa 16 e lascia agli Stati di scendere fino a 13; l'Italia ha
-- recepito a 14 col d.lgs. 101/2018, art. 2-quinquies del Codice Privacy). Sotto quella
-- soglia il consenso lo presta chi ha la responsabilità genitoriale, e andrebbe RACCOLTO
-- e PROVATO: il nostro registro consensi non ha nemmeno un campo per dire chi l'ha
-- prestato (`consent_events`, 0003), e `purpose` ha un CHECK a lista chiusa. Aprire sotto
-- i 14 non è togliere un numero: è un altro impianto. La scelta A lo evita per intero.
--
-- ORIGINE DEL VINCOLO DEI 18, per la storia: `docs/superpowers/specs/2026-06-15-donor-auth-design.md:56`
-- — «età minima 18+ … semplifica il consenso GDPR». Nato come scorciatoia tecnica in una
-- spec, cementato nel database il giorno dopo, mai discusso come scelta di prodotto.
--
-- COSTO OGGI: zero. Verificato sul DB vivo il 2026-07-30 prima di scrivere: 0 profili,
-- 0 profili sotto i 18. E il vincolo nuovo è più PERMISSIVO del vecchio — ogni riga che
-- passava a 18 passa a 14 — quindi l'`add constraint` non può fallire sulla validazione
-- delle righe esistenti, né oggi né su un database già popolato.
--
-- IL NOME CAMBIA, e non è cosmesi: `adult` continuerebbe a dire «maggiorenne» in ogni
-- messaggio d'errore di Postgres e in ogni `\d profiles` letto fra sei mesi. Verificato
-- che nessuno legge quel nome: `CONSTRAINT_NAME` viene interrogato solo per
-- `profiles_nickname_unico` (0017), e nel codice dell'app «adult» compare solo come
-- chiave i18n, che questa fase rinomina insieme.
--
-- ---------------------------------------------------------------------------------
-- §2 — L'ANAGRAFICA NON RESTA NEI `user_metadata`
-- ---------------------------------------------------------------------------------
-- IL FATTO, verificato leggendo il sorgente di Supabase Auth il 2026-07-29: l'endpoint
-- **UserInfo**, chiamato con scope `profile`, restituisce i `user_metadata` **interi**.
-- Non un sottoinsieme, non i soli claim standard: tutto ciò che c'è dentro. (L'ID token
-- no: quello porta solo `name`, `picture`, `preferred_username`, `updated_at`.)
-- ⇒ i `user_metadata` sono **superficie consegnabile a un partner**, non un cassetto
-- privato.
--
-- E oggi ci finisce l'anagrafica intera. Il punto di scrittura è UNO — `AuthContext.tsx`,
-- `signUp` — e ci mette `first_name`, `last_name`, `phone`, `city`, `province`,
-- `country`, `birth_date`, `marketing_consent`. Nessuno le toglie mai più.
-- ⚠️ La cosa si legge nel PUNTO DI SCRITTURA, non contando le chiavi degli account
-- esistenti: i due account del database sono vecchi e non sono nati da quel flusso
-- (verificato: 0 utenti con anagrafica nei metadata). Contarli avrebbe detto «non c'è
-- nessun problema» — errore già commesso il 2026-07-29 e corretto lo stesso giorno.
--
-- PERCHÉ NON SI RISOLVE SMETTENDO DI SCRIVERLE. Con «Confirm email» acceso, al momento
-- del `signUp` non esiste ancora una sessione: un insert su `public.profiles` fatto dal
-- client verrebbe respinto da RLS (`auth.uid()` è null). I metadata sono il **canale**
-- con cui l'anagrafica arriva al trigger che crea il profilo. Non si può non scriverli.
-- Si può solo ripulirli **appena consumati**, ed è ciò che fa questo §.
--
-- COSA RESTA, di proposito: `name` e `preferred_username` (i due claim OIDC che i partner
-- leggono davvero) e tutto ciò che scrive il provider nel login federato (`sub`, `iss`,
-- `picture`, `email`, `email_verified`, …). Quelle chiavi non sono nostre e toglierle
-- significherebbe rompere il pezzo di GoTrue che le ha scritte.
-- ⚠️ RESIDUO DICHIARATO: per chi entra col social, `email` resta nei metadata scritti dal
-- provider, quindi UserInfo continuerà a consegnarla. Questa migration riduce la
-- superficie all'essenziale nostro, non la azzera — e i login social sono oggi rimossi
-- dall'app.
--
-- DUE PUNTI DI PULIZIA, e il SECONDO è quello che regge davvero.
-- 🔴 LA PREMESSA CHE SEMBRAVA OVVIA È SMENTITA: due discussioni Supabase (#20714, #22158)
-- riportano che un AFTER INSERT su `auth.users` che aggiorna `raw_user_meta_data` **non
-- ha effetto**, mentre la stessa identica query lanciata dall'editor SQL funziona. La
-- spiegazione meccanica è che GoTrue, dopo l'INSERT, riscrive la riga dal proprio oggetto
-- in memoria — che i metadata originali ce li ha ancora. Non è documentazione ufficiale
-- (sono discussioni), quindi il disegno non si appoggia a quel comportamento: si appoggia
-- al fatto che regge **in entrambi i mondi**.
--   · in coda a `handle_new_user` (AFTER INSERT): copre la nascita SE nessuno riscrive
--     dopo di noi. Sta DENTRO quella funzione, e non in un trigger separato, per una
--     ragione di sicurezza: due trigger AFTER INSERT sulla stessa tabella scattano in
--     ordine ALFABETICO di nome, e un trigger di pulizia che scattasse per primo
--     cancellerebbe i metadata **prima** che `handle_new_user` li legga — il profilo non
--     nascerebbe più, e nessun errore lo direbbe. Dentro la funzione, l'ordine è per
--     costruzione;
--   · il trigger AFTER UPDATE OF `raw_user_meta_data`: copre tutto ciò che li riscrive
--     DOPO, e proprio per questo copre anche il caso qui sopra. Per riscrivere quei
--     metadata bisogna toccare QUELLA colonna, e toccarla fa scattare questo trigger.
--     Copre anche il secondo `signUp` sullo stesso indirizzo mai confermato, dove GoTrue
--     aggiorna la riga esistente e nessun AFTER INSERT riparte.
-- ⇒ LA COPERTURA È COMPLETA per costruzione, non per fortuna: o l'INSERT resta l'ultima
-- parola (e allora ha pulito il primo punto), o qualcuno riscrive (e allora scatta il
-- secondo). Non esiste una terza strada in cui i metadata cambiano senza passare da un
-- UPDATE di quella colonna.
-- ⚠️ COSA RESTA DA PROVARE SUL CAMPO, e nessuna suite può farlo: qui gira Postgres nudo,
-- GoTrue non c'è. Quale dei due punti fa il lavoro si vede solo con una registrazione
-- vera, dopo l'apply. Il risultato osservabile è lo stesso — metadata puliti — ma chi
-- verificherà deve sapere che sta guardando due difese, non una.
--
-- LA STRADA MIGLIORE È PRECLUSA, e va detto perché non venga riproposta: la forma
-- canonica per modificare `raw_user_meta_data` è un trigger **BEFORE INSERT** che assegna
-- `new.raw_user_meta_data` (niente UPDATE, niente ricorsione, sopravvive a qualunque
-- riscrittura). Non è praticabile qui: `public.profiles.id` ha una foreign key verso
-- `auth.users(id)`, e in un BEFORE INSERT quella riga non esiste ancora — creare il
-- profilo di là fallirebbe sulla FK. E un BEFORE che pulisse soltanto lascerebbe
-- `handle_new_user` senza i dati da cui nasce il profilo.
--
-- NIENTE RICORSIONE, e non per fortuna: il trigger di pulizia aggiorna la stessa colonna
-- che lo fa scattare, quindi si richiama una seconda volta — ma alla seconda la guardia
-- `?|` non trova più nessuna chiave da togliere e non esegue nessun UPDATE. Profondità 2,
-- non infinita. È la ragione per cui la guardia sta PRIMA dell'update e non dopo, ed è il
-- rimedio che la documentazione Postgres mette in capo a chi scrive il trigger
-- («it is the trigger programmer's responsibility to avoid infinite recursion»).
--
-- BEST-EFFORT ESPLICITO: l'UPDATE su `auth.users` è avvolto in un EXCEPTION che inghiotte
-- `insufficient_privilege` con un `raise warning`. Verificato sul database vivo che il
-- ruolo `postgres` — proprietario di queste funzioni `security definer` — ha il privilegio
-- UPDATE su `auth.users` (`has_table_privilege` = true) pur non essendone owner
-- (`supabase_auth_admin`) né superuser. La guardia esiste per l'ambiente in cui quel
-- privilegio non ci fosse: fra «i metadata restano sporchi» e «nessuno riesce più a
-- registrarsi», il primo è incomparabilmente meno grave. Il warning resta nei log perché
-- un fallimento silenzioso qui somiglierebbe troppo a un successo.
--
-- ---------------------------------------------------------------------------------
-- §3 e §4 — I DUE DIFETTI CHE LA 0016 SI ERA LASCIATA DIETRO
-- ---------------------------------------------------------------------------------
-- Trovati dal secondo critico avversariale, DOPO che la 0016 era già in produzione, e
-- tracciati con l'istruzione di accorparli qui. Nessuno dei due è innescabile oggi.
--   · §3 — nell'exception del §4 della 0016 manca `check_violation`, mentre il gemello
--     che scrive gli stessi valori ce l'ha: il giorno in cui comparisse un CHECK su
--     `phone`/`city`/`province`, l'errore risalirebbe fino all'`update auth.users set
--     email` e **la persona non riuscirebbe più a cambiare indirizzo**.
--   · §4 — `claim_legacy_contact` dichiara `v_legacy public.legacy_contacts`, un tipo
--     COMPOSITO: si risolve alla compilazione della funzione, cioè fuori da qualunque
--     blocco EXCEPTION. Dopo un rollback della 0012, ogni signup con `birth_date`
--     morirebbe su «relation does not exist» prima che una guardia possa intervenire:
--     **nessuno potrebbe più registrarsi**. Gli altri tre accessi alla tabella sono
--     protetti, questo no — e la suite della 0016 SCHIVA quel percorso, quindi nessun
--     test lo vedrà mai finché non si riscrive la funzione. Qui si riscrive con scalari,
--     come il ramo B, e il test che mancava esiste (T14 di questa suite).
--
-- ---------------------------------------------------------------------------------
-- ORDINE, DIPENDENZE, RIESECUZIONE
-- ---------------------------------------------------------------------------------
-- VA DOPO la 0017 (che è l'ultima a definire `handle_new_user`) e dopo la 0018.
-- 🔴 **DA QUI IN POI IL CORPO BUONO È QUESTO FILE** per `handle_new_user`,
-- `claim_legacy_contact` e `sync_contact_email_on_email_change`. Riapplicare 0011/0017
-- (la prima), 0012/0015/0016 (la seconda) o 0013/0014/0016 (la terza) senza rimettere in
-- coda questa migration riporta indietro i corpi in silenzio. Il corpo buono di una
-- funzione condivisa sta sempre nell'ULTIMA migration che l'ha toccata, che si trova con
--   grep -l "create or replace function public.<nome>" migrations/*.sql
-- non nel file dove la funzione compare la prima volta.
--
-- RIESEGUIBILE: sì, **verificato dalla batteria** e non dichiarato a priori — la prima
-- stesura non lo era (mancava il `drop constraint if exists` sul vincolo NUOVO) e ha fatto
-- 16 combinazioni rosse su 24. `drop constraint if exists` × 2 + `create or replace
-- function` + `drop trigger if exists` seguito da `create trigger`; il backfill del §2 è
-- idempotente (toglie chiavi che dopo il primo giro non ci sono più).
-- ⚠️ Il `drop`+`add` del vincolo lascia la tabella un istante senza CHECK: è dentro la
-- transazione della migration, quindi nessuna riga può entrare in quella finestra.
--
-- OGGETTI NUOVI, da nominare perché sono ciò che un rollback ingenuo lascia indietro:
-- la funzione `public.pulisci_metadata_anagrafici()` e il trigger
-- `on_auth_user_metadata_pulizia`.
--
-- ROLLBACK:
--   alter table public.profiles drop constraint if exists eta_minima;
--   alter table public.profiles add constraint adult
--     check (birth_date <= (now()::date - interval '18 years'));
--   drop trigger if exists on_auth_user_metadata_pulizia on auth.users;
--   drop function if exists public.pulisci_metadata_anagrafici();
--   -- poi riapplicare, IN QUEST'ORDINE, i corpi superati:
--   --   0017 (handle_new_user), 0016 (claim_legacy_contact + sync_contact_email…)
-- ⚠️ Il rollback del §1 può FALLIRE, ed è giusto così: se nel frattempo si è registrato
-- qualcuno fra i 14 e i 18 anni, rimettere il vincolo a 18 significherebbe avere righe che
-- lo violano. Postgres rifiuta l'`add constraint`, e chi lo esegue deve decidere cosa fare
-- di quelle persone — non scoprirlo dopo.
-- ⚠️ Il backfill del §2 NON è reversibile: i dati tolti dai metadata non tornano. Non è
-- una perdita — sono la copia di ciò che sta in `public.profiles`, che resta intatta.

-- ---------------------------------------------------------------------------------
-- ---------------------------------------------------------------------------------
-- ✅ APPLICATA AL DB VIVO il 2026-07-31, su autorizzazione esplicita di Riccardo.
-- ---------------------------------------------------------------------------------
-- In DUE tempi, e vale la pena sapere perché: §2, §3 e §4 sono passati subito; il §1 no,
-- perché contiene le uniche due ELIMINAZIONI e il guard MCP le rifiutava in blocco. Nello
-- stesso turno il guard è stato cambiato da «rifiuta» a «chiedi» (richiesta di Riccardo:
-- «è giusto che tu lo blocchi, però devi chiedere a me»), e il §1 è stato eseguito con la
-- sua conferma — registrato a parte come `0019_eta_minima_vincolo`.
--
-- Stato al momento dell'apply: 0 profili, 2 utenti, 0 righe d'archivio. Nessun dato toccato.
-- VERIFICATO DOPO, non per ack:
--   · CHECK su `public.profiles` = `eta_minima` (14 anni), `nickname_forma`,
--     `profiles_contact_email_chk`. **`adult` non esiste più**;
--   · 5 trigger su `auth.users`, tutti abilitati, e quello di pulizia ascolta
--     `raw_user_meta_data` (non un altro evento);
--   · le due funzioni di pulizia NON sono chiamabili da `anon`/`authenticated`;
--   · `claim_legacy_contact` non dichiara più il tipo composito (fix ②) e
--     `sync_contact_email_on_email_change` ha `check_violation` (fix ①);
--   · 0 utenti con anagrafica nei metadata.
-- ⚠️ ADVISOR: rispetto a prima compaiono DUE warning NUOVI, entrambi voluti —
-- `nickname_disponibile` è `security definer` ed è chiamabile da `anon`/`authenticated`.
-- È il motivo per cui la 0018 esiste (le policy di `profiles` farebbero rispondere «libero»
-- sempre); la funzione restituisce SOLO un booleano, mai righe. Gli altri tre advisor
-- erano già presenti e non c'entrano con questa migration.
-- 🔴 LIMITE: il comportamento non è mai stato esercitato con una registrazione VERA (0
-- profili). In particolare, quale dei due punti di pulizia dei metadata faccia davvero il
-- lavoro si vede solo al primo utente reale — vedi §2.
--
-- ---------------------------------------------------------------------------
-- 1. Età minima: 14 anni, un solo regime
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint if exists adult;
-- 🔴 ANCHE IL VINCOLO NUOVO, prima di aggiungerlo: `add constraint` non è idempotente e
-- alla seconda applicazione esce «constraint eta_minima already exists». Non è teoria —
-- la batteria applica ogni migration DUE volte proprio per provare la rieseguibilità, e
-- questa riga mancante ha fatto 16 combinazioni rosse su 24. L'intestazione dichiarava
-- «RIESEGUIBILE: sì» quando non lo era: il claim è arrivato prima della prova.
alter table public.profiles drop constraint if exists eta_minima;

alter table public.profiles
  add constraint eta_minima
  check (birth_date <= (now()::date - interval '14 years'));

comment on constraint eta_minima on public.profiles is
  'Età minima 14 anni: soglia italiana per il consenso digitale (art. 8 GDPR + '
  'd.lgs. 101/2018). Sotto i 14 servirebbe il consenso di chi ha la responsabilità '
  'genitoriale, raccolto e provato: non lo raccogliamo, quindi non si entra. '
  'Sostituisce il vincolo `adult` (18 anni) della migration 0001.';

-- ---------------------------------------------------------------------------
-- 2a. La pulizia dei metadata, al momento in cui il trigger li ha consumati
-- ---------------------------------------------------------------------------
-- Corpo preso dalla **0017**, che è l'ultima ad averlo definito, con in coda il solo
-- blocco nuovo (marcato). Tutto il resto è identico riga per riga: se qui si perdesse un
-- pezzo, si perderebbero in silenzio i fix delle 0011/0013/0014/0017.
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
  -- (0017). La chiave si chiama `preferred_username` e non `nickname` perché è
  -- quella — e solo quella — che il server auth legge per costruire il claim OIDC.
  -- Il valore viene ripulito e VALIDATO qui: se non rispetta la forma della colonna
  -- diventa null, così un nickname storto non può mai far fallire la registrazione.
  v_nickname text := nullif(btrim(coalesce(v_meta->>'preferred_username', '')), '');
  -- Nome del vincolo che ha respinto l'insert, per distinguere la collisione del nickname da
  -- qualunque altra: perdonare alla cieca ogni `unique_violation` nasconderebbe un guasto vero.
  v_vincolo text;
begin
  -- Stessa forma del CHECK `nickname_forma` della 0017, ripetuta di proposito: là è la
  -- difesa, qui è la clemenza. Scritta con `<`/`>` e non con `not between` perché la
  -- precedenza di BETWEEN rispetto ad AND è stata storicamente incoerente in Postgres
  -- (sistemata in 9.5, ma la documentazione raccomanda comunque le parentesi): una
  -- condizione che si legge male è il posto sbagliato per essere spiritosi.
  -- Se le due regole divergeranno, a rompersi è la registrazione → cambiarle INSIEME.
  if v_nickname is not null
     and (char_length(v_nickname) < 2 or char_length(v_nickname) > 30) then
    v_nickname := null;
  end if;

  -- UNICITÀ, primo livello di clemenza (0017): se il nickname è già di qualcun altro lo si
  -- SCARTA, invece di far fallire la registrazione. La persona entra comunque; il nickname lo
  -- rimette da «modifica profilo», dove il modulo le dice subito se è libero. Confronto su
  -- `lower()` perché è la stessa regola dell'indice: se qui e là divergessero, a rompersi
  -- sarebbe la registrazione — cambiarle INSIEME.
  if v_nickname is not null
     and exists (
       select 1 from public.profiles
       where lower(nickname) = lower(v_nickname)
     ) then
    v_nickname := null;
  end if;

  -- Marker del form email: birth_date è sempre presente nel signup email, mai nel social.
  if v_meta ? 'birth_date' then
    -- UNICITÀ, secondo livello di clemenza (0017): la corsa che l'`exists` qui sopra NON può
    -- vedere — due registrazioni simultanee con lo stesso nickname, dove nessuna delle due ha
    -- ancora committato. Lì decide l'indice, e senza questa rete l'insert respinto porterebbe
    -- giù la REGISTRAZIONE INTERA (il trigger vive nella transazione di `auth.users`), con un
    -- errore generico davanti alla persona. Due tentativi: il secondo senza nickname.
    -- Si perdona SOLO la collisione del nickname: `CONSTRAINT_NAME` distingue quale vincolo ha
    -- respinto (verificato dal vivo su Postgres 15 il 2026-07-30 che è popolato anche per un
    -- indice unico parziale su espressione — la documentazione lasciava il dubbio). Qualunque
    -- altra violazione viene rilanciata: perdonarle tutte nasconderebbe un guasto vero.
    for i in 1..2 loop
      begin
        insert into public.profiles (
          id, first_name, last_name, phone, city, province, country,
          birth_date, privacy_consent_at, marketing_consent, contact_email,
          nickname                                        -- NUOVO (0017)
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
          v_contact_email,
          v_nickname                                      -- NUOVO (0017)
        );
        exit;
      exception when unique_violation then
        get stacked diagnostics v_vincolo = CONSTRAINT_NAME;
        if v_vincolo is distinct from 'profiles_nickname_unico' or i = 2 then
          raise;
        end if;
        v_nickname := null;
      end;
    end loop;

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

  -- NUOVO (0019). L'anagrafica è stata consumata: non deve restare nei metadata, che
  -- UserInfo consegna INTERI a chi ha lo scope `profile`. Sta FUORI dal ramo qui sopra
  -- di proposito — se un domani qualcuno scrivesse quelle chiavi in un flusso senza
  -- `birth_date`, resterebbero lì senza che nessuno se ne accorga.
  -- `name` e `preferred_username` NON si toccano: sono i claim che i partner leggono.
  perform public.pulisci_metadata_anagrafici_di(new.id);

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2b. La pulizia vera e propria — una funzione sola, due chiamanti
-- ---------------------------------------------------------------------------
-- L'elenco delle chiavi sta scritto UNA VOLTA. Averlo in due copie (il trigger di
-- nascita e quello di aggiornamento) significherebbe che un domani se ne aggiunge una
-- da una parte sola, e la superficie resta aperta esattamente sul campo nuovo.
create or replace function public.pulisci_metadata_anagrafici_di(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- Le chiavi che scriviamo NOI nel signup email (`AuthContext.signUp`), più
  -- `contact_email`: oggi nessuno la manda per quella via, ma il trigger la LEGGE, quindi
  -- il giorno in cui qualcuno la mandasse resterebbe lì.
  -- NON in elenco, e non per dimenticanza: `name` e `preferred_username` (claim OIDC, è
  -- il loro mestiere stare qui) e tutto ciò che scrive il provider nel login federato.
  v_chiavi text[] := array[
    'first_name', 'last_name', 'phone', 'city', 'province',
    'country', 'birth_date', 'marketing_consent', 'contact_email'
  ];
begin
  -- La guardia PRIMA dell'update, non dopo: è ciò che ferma la ricorsione del trigger
  -- 2c (che aggiorna la stessa colonna che lo fa scattare) al secondo giro.
  update auth.users
     set raw_user_meta_data = raw_user_meta_data - v_chiavi
   where id = p_user_id
     and raw_user_meta_data ?| v_chiavi;
exception
  -- Best-effort dichiarato. Sul database vivo il privilegio c'è (verificato il
  -- 2026-07-30: `postgres` ha UPDATE su `auth.users` pur non essendone owner). Se in un
  -- altro ambiente non ci fosse, questa riga è la differenza fra «i metadata restano
  -- sporchi» e «nessuno riesce più a registrarsi». Il warning resta nei log: un
  -- fallimento silenzioso qui somiglierebbe troppo a un successo.
  when insufficient_privilege then
    raise warning 'pulisci_metadata_anagrafici_di: nessun privilegio di UPDATE su auth.users, metadata non ripuliti per %', p_user_id;
end;
$$;

revoke execute on function public.pulisci_metadata_anagrafici_di(uuid)
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2c. Il presidio che regge in ogni caso: tutto ciò che riscrive i metadata
-- ---------------------------------------------------------------------------
-- Non è la rete di scorta del 2a: è il punto che copre anche il 2a. Per rimettere quelle
-- chiavi bisogna toccare questa colonna, e toccarla fa scattare questo trigger — che sia
-- GoTrue che riscrive la riga subito dopo l'INSERT (discussioni #20714/#22158), o un
-- secondo `signUp` sullo stesso indirizzo mai confermato, dove GoTrue aggiorna la riga
-- che c'è già e nessun AFTER INSERT riparte.
create or replace function public.pulisci_metadata_anagrafici()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.pulisci_metadata_anagrafici_di(new.id);
  -- AFTER trigger: il valore di ritorno viene ignorato.
  return null;
end;
$$;

revoke execute on function public.pulisci_metadata_anagrafici()
  from public, anon, authenticated;

-- `update of raw_user_meta_data` restringe il fuoco alla colonna giusta: senza, il
-- trigger scatterebbe a ogni singolo UPDATE su `auth.users` — e GoTrue ne fa molti
-- (token, ultimo accesso, conferme) che con i metadata non c'entrano nulla.
drop trigger if exists on_auth_user_metadata_pulizia on auth.users;
create trigger on_auth_user_metadata_pulizia
  after update of raw_user_meta_data on auth.users
  for each row
  execute procedure public.pulisci_metadata_anagrafici();

-- ---------------------------------------------------------------------------
-- 2d. Backfill: le righe già sporche
-- ---------------------------------------------------------------------------
-- Sul database vivo, al 2026-07-30, questo tocca **0 righe** (2 utenti, nessuno nato dal
-- signup email). Non è inutile: senza, il giorno in cui la migration venisse applicata a
-- un database già in uso, tutto ciò che è nato prima resterebbe esposto — ed è
-- esattamente il caso che nessuno verifica, perché «da adesso funziona».
--
-- ⚠️ CHIAMA LA FUNZIONE invece di ripetere l'UPDATE con l'elenco delle chiavi. Scriverlo
-- due volte avrebbe significato che il giorno in cui si aggiunge un campo lo si aggiunge
-- da una parte sola — e la parte dimenticata è proprio quella che nessun test esercita,
-- perché il backfill gira una volta e non lascia traccia. Una sola definizione, un solo
-- posto dove sbagliare. La funzione ha la guardia dentro: sulle righe già pulite non
-- scrive nulla, quindi questo giro è idempotente.
select public.pulisci_metadata_anagrafici_di(id) from auth.users;

-- ---------------------------------------------------------------------------
-- 3. La guardia mancante nel cambio email (finding ① della 0016)
-- ---------------------------------------------------------------------------
-- Corpo identico a quello della **0016 §4**, con l'aggiunta di `check_violation`
-- nell'exception del blocco di rivendicazione. Il blocco gemello del recapito ce l'ha già
-- e scrive gli stessi valori, presi dallo stesso archivio importato di qualità ignota:
-- averla su uno e non sull'altro era un'asimmetria senza ragione.
create or replace function public.sync_contact_email_on_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cambiata boolean := new.email is distinct from old.email;
  v_nuova_valida boolean := new.email is not null
    and new.email not like '%@privaterelay.appleid.com';
  -- L'indirizzo che si sta abbandonando era stato provato? (0016)
  v_vecchia_provata boolean := old.email_confirmed_at is not null;
  v_spostata boolean := false;
  -- NB: nessuna variabile di tipo `public.legacy_contacts` — un tipo composito si risolve
  -- alla COMPILAZIONE, fuori da ogni blocco EXCEPTION, e vanificherebbe la guardia sotto.
begin
  if not v_cambiata or not v_nuova_valida then
    return new;
  end if;

  begin
    update public.profiles
       set contact_email = btrim(new.email)
     where id = new.id
       and contact_email is not null
       and lower(btrim(contact_email)) = lower(btrim(old.email));
    v_spostata := found;
  exception when check_violation then
    return new;
  end;

  -- Identico alla 0014/0016. Le ragioni per cui questo blocco esiste (senza, la 0013
  -- REGREDIVA la 0012 sull'oblio) stanno là e non si ricopiano.
  if v_spostata and v_vecchia_provata then
    begin
      update public.legacy_contacts
         set claimed_by = new.id,
             claimed_at = now()
       where email_norm = lower(btrim(old.email))
         and claimed_by is null;

      if found then
        update public.profiles p
           set phone = case
                 when nullif(btrim(p.phone), '') is null
                  and nullif(btrim(l.phone), '') is not null
                 then l.phone else p.phone end,
               city = case
                 when nullif(btrim(p.city), '') is null
                  and nullif(btrim(l.city), '') is not null
                 then l.city else p.city end,
               province = case
                 when coalesce(nullif(btrim(p.country), ''), 'IT') = 'IT'
                  and coalesce(nullif(btrim(l.country), ''), 'IT') = 'IT'
                  and nullif(btrim(p.province), '') is null
                  and nullif(btrim(l.province), '') is not null
                 then l.province else p.province end
          from public.legacy_contacts l
         where p.id = new.id
           and l.email_norm = lower(btrim(old.email));
      end if;
    exception
      when undefined_table then
        return new;
      -- NUOVO (0019, finding ① della 0016). Stessa ragione del gemello venti righe più
      -- su: i valori vengono da un archivio importato di qualità ignota. Se un domani su
      -- `phone`, `city` o `province` comparisse un CHECK, l'errore risalirebbe fino
      -- all'`update auth.users set email` che ha fatto scattare il trigger, e **la persona
      -- non riuscirebbe più a cambiare indirizzo** — per colpa di una colonna che con
      -- l'indirizzo non c'entra. Fra «il profilo resta da riempire a mano» e «non si può
      -- più cambiare mail», il primo è incomparabilmente meno grave.
      when check_violation then
        return new;
    end;
  end if;

  return new;
end;
$$;

revoke execute on function public.sync_contact_email_on_email_change()
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Il ramo A senza tipo composito, così la guardia può funzionare (finding ②)
-- ---------------------------------------------------------------------------
-- Corpo della **0016 §1**, con una sola differenza strutturale: niente
-- `v_legacy public.legacy_contacts`. Quel tipo si risolve alla COMPILAZIONE della
-- funzione, cioè PRIMA che qualunque EXCEPTION possa intervenire: dopo un rollback della
-- 0012 ogni signup con `birth_date` moriva su «relation does not exist», e nessuno poteva
-- più registrarsi. Con le variabili scalari la tabella si risolve a runtime, dentro il
-- blocco protetto — la stessa forma che il ramo B ha già.
create or replace function public.claim_legacy_contact()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text;
  -- La prova, non il valore: ci basta sapere SE l'indirizzo è confermato.
  v_confermata boolean;
  -- Scalari, non `public.legacy_contacts`: vedi sopra. È il fix del finding ②.
  v_phone text;
  v_city text;
  v_province text;
  v_country text;
  v_trovata boolean := false;
begin
  select lower(btrim(u.email)), u.email_confirmed_at is not null
    into v_key, v_confermata
    from auth.users u
   where u.id = new.id;

  if v_key is null
     or v_key = ''
     or v_key like '%@privaterelay.appleid.com' then
    return new;
  end if;

  -- ⚠️ LA RIGA CHE CHIUDE IL FURTO USA-E-GETTA (0016). Senza di lei il profilo nato prima
  -- della conferma rivendica la riga d'archivio di chiunque. Chi arriva qui non
  -- confermato non è perduto: lo raccoglie il ramo B alla conferma.
  if not coalesce(v_confermata, false) then
    return new;
  end if;

  -- Il blocco protetto che prima non poteva esistere: ora `public.legacy_contacts`
  -- compare solo dentro istruzioni, quindi un `undefined_table` è catturabile.
  begin
    update public.legacy_contacts
       set claimed_by = new.id,
           claimed_at = now()
     where email_norm = v_key
       and claimed_by is null
    returning phone, city, province, country
      into v_phone, v_city, v_province, v_country;

    v_trovata := found;

    -- Se non c'era niente da rivendicare, può darsi che la riga sia GIÀ NOSTRA: succede
    -- quando il ramo B ha confermato prima che il profilo esistesse (signup senza
    -- `birth_date` nei metadata, dove `handle_new_user` non crea la riga, e il profilo
    -- nasce più tardi dall'app). Senza questa seconda lettura il backfill non avverrebbe
    -- mai per quelle persone: la riga risulterebbe agganciata e i campi resterebbero
    -- vuoti, che è il modo peggiore di sbagliare — sembra tutto a posto.
    if not v_trovata then
      select phone, city, province, country
        into v_phone, v_city, v_province, v_country
        from public.legacy_contacts
       where email_norm = v_key
         and claimed_by = new.id;
      v_trovata := found;
    end if;
  exception when undefined_table then
    return new;
  end;

  -- Da qui in giù la semantica è quella della 0014/0015/0016: si riempiono solo le
  -- colonne rimaste vuote, «vuota» vale NULL o stringa vuota da entrambi i lati, e la
  -- provincia si colma solo fra italiani. Le ragioni stanno là e non si ricopiano, per
  -- non farle divergere.
  if v_trovata then
    if nullif(btrim(new.phone), '') is null
       and nullif(btrim(v_phone), '') is not null then
      new.phone := v_phone;
    end if;

    if nullif(btrim(new.city), '') is null
       and nullif(btrim(v_city), '') is not null then
      new.city := v_city;
    end if;

    if coalesce(nullif(btrim(new.country), ''), 'IT') = 'IT'
       and coalesce(nullif(btrim(v_country), ''), 'IT') = 'IT'
       and nullif(btrim(new.province), '') is null
       and nullif(btrim(v_province), '') is not null then
      new.province := v_province;
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.claim_legacy_contact() from public, anon, authenticated;
