-- Migration 0016 — l'archivio si muove solo su un indirizzo PROVATO, non dichiarato in un signup
--
-- IL RESIDUO CHE LA 0015 AVEVA LASCIATO APERTO, e che qui si chiude.
-- La 0015 ha spostato la chiave da `profiles.contact_email` (che la persona scrive da
-- sé) a `auth.users.email` (l'indirizzo dell'account), sulla premessa che quello
-- «è verificato per costruzione, perché da noi si entra solo dopo aver confermato la
-- mail». La premessa è vera per chi ENTRA. Non è vera per la riga di `auth.users`,
-- che nasce **prima** della conferma.
--
-- LA SEQUENZA, tracciata sui file il 2026-07-28 e non ricostruita a memoria:
--   1. `signUp(email = vittima, metadata con birth_date)` — chiamata ANONIMA, basta la
--      chiave pubblica, nessuna sessione;
--   2. GoTrue inserisce in `auth.users` con `email_confirmed_at = NULL`;
--   3. `on_auth_user_created` (AFTER INSERT, 0011) chiama `handle_new_user()`, che
--      inserisce SUBITO la riga in `public.profiles` — il ramo scatta perché
--      `birth_date` è nel metadata;
--   4. il BEFORE INSERT su `profiles` chiama `claim_legacy_contact()` (0015), che legge
--      `auth.users.email` — presente, ma non ancora provato — e fa
--      `update legacy_contacts set claimed_by = … where email_norm = … and claimed_by is null`.
--
-- → Il furto è compiuto **senza confermare l'indirizzo e senza mai avere una sessione**,
-- al costo di una richiesta HTTP per vittima. E la vittima vera, quando si registrerà,
-- troverà `claimed_by` già valorizzato: la guardia `claimed_by is null` non passa e il
-- suo storico non si aggancia più. In silenzio — nessun errore, nessun avviso, e prima
-- di registrarsi non ha un account con cui accorgersene.
--
-- L'ATTENUANTE CHE CI ERAVAMO SCRITTI ERA FALSA, e va detto perché non torni: «costa una
-- registrazione usa-e-getta, che però manda una mail alla vittima ed è rate-limited».
-- La mail parte, sì, ma il danno è già fatto al passo 4: non serve che qualcuno clicchi
-- niente. Il rate limit alza il prezzo, non chiude la porta.
--
-- PERCHÉ NON BASTA AGGIUNGERE UNA GUARDIA E BASTA. La correzione ovvia — pretendere
-- `email_confirmed_at is not null` dentro `claim_legacy_contact()` — da sola **spegne
-- l'aggancio sull'intero canale email/password**: al passo 4 quel campo è SEMPRE NULL,
-- perché il profilo nasce prima della conferma. Non è una guardia da aggiungere: è il
-- MOMENTO dell'aggancio da spostare. E i momenti sono due, perché la prova arriva in due
-- istanti diversi a seconda di come si entra.
--
-- IL RIMEDIO, DUE RAMI.
--   · ramo A — alla nascita del profilo, ma solo se l'indirizzo risulta GIÀ confermato.
--     Copre l'autoconfirm e, **se** il provider lo consegna già verificato, il social.
--     ⚠️ ASSUNTO, NON VERIFICATO: che con OAuth `email_confirmed_at` sia valorizzato
--     nello STESSO insert. GoTrue potrebbe crearlo e confermarlo con un UPDATE separato,
--     nel qual caso anche il social passerebbe dal ramo B. La cosa non apre nessun buco —
--     entrambi i rami agganciano — ma chi legge non deve prendere per verificata una
--     cosa che non lo è. Oggi la domanda è comunque teorica: i login social sono stati
--     RIMOSSI dal codice dell'app, quindi il ramo A vive solo per l'autoconfirm.
--   · ramo B — alla conferma: un trigger nuovo su `auth.users` che scatta quando
--     `email_confirmed_at` passa da NULL a NOT NULL. Qui il profilo esiste già, quindi il
--     ramo non può riempire `new.*` come fa un BEFORE INSERT: fa un UPDATE su
--     `public.profiles`.
-- I due rami non si sovrappongono: `claimed_by is null` resta la guardia comune, e chi
-- arriva secondo non trova più niente da rivendicare.
--
-- IL GEMELLO, trovato scrivendo questa migration e non nell'analisi che l'ha preceduta.
-- Se un indirizzo dichiarato-e-mai-provato non può RIVENDICARE una riga, a maggior
-- ragione non deve poterla CANCELLARE. Prima di qui poteva: `purge_legacy_contact` e
-- `purge_legacy_on_user_delete` cancellano le righe MAI rivendicate confrontando
-- l'indirizzo dell'account, senza chiedersi se quell'indirizzo sia mai stato provato.
-- La strada non è teorica: il giorno in cui facessimo pulizia degli account mai
-- confermati — cosa sensata e prima o poi inevitabile — ogni cancellazione porterebbe
-- via la scheda d'archivio della persona il cui indirizzo era stato usato per
-- registrarsi. Un lavoro di manutenzione igienica diventerebbe una cancellazione di
-- dati altrui, silenziosa e in blocco.
-- → Stessa guardia sui due percorsi di oblio. Dall'app il costo è nessuno: per cancellare
-- il proprio profilo serve una sessione, e per avere una sessione serve aver confermato.
-- ⚠️ MA IL COSTO NON È ZERO IN ASSOLUTO, e scriverlo sarebbe stato falso: chi si registra
-- col PROPRIO indirizzo, non conferma mai, e poi chiede la cancellazione per altra via
-- (mail all'associazione, cancellazione da console), non si porta più via la riga
-- d'archivio registrata sotto quell'indirizzo — resta lì, in silenzio. È una richiesta
-- Art. 17 da evadere a mano, e la query è questa:
--   delete from public.legacy_contacts
--    where email_norm = lower(btrim('<indirizzo della richiesta>'))
--      and claimed_by is null;
-- Il compromesso è voluto: fra «una richiesta di cancellazione va evasa a mano» e «una
-- pulizia degli account non confermati cancella in blocco le schede di terzi», la seconda
-- è incomparabilmente peggiore — nessuno l'avrebbe chiesta e nessuno se ne accorgerebbe.
--
-- IL QUARTO PERCORSO, che la prima stesura dichiarava innocuo SBAGLIANDO (trovato dal
-- critico avversariale). `sync_contact_email_on_email_change` (0013) rivendica su
-- `old.email`, cioè l'indirizzo ABBANDONATO, e la giustificazione «vive su un cambio email
-- già confermato, quindi la chiave è provata» non regge: parla di `new.email`, mentre la
-- chiave usata è `old.email`, per il quale nessuno controlla se sia mai stato provato.
-- Oggi non è raggiungibile da un anonimo (per cambiare indirizzo serve una sessione), ma
-- basterebbe `mailer_autoconfirm`, un invito da console o un `updateUserById` per riaprire
-- il furto da lì — con la stessa registrazione usa-e-getta, un passo più in là.
-- → Il §4 di questo file mette la guardia anche là. Un buco a quattro porte non si chiude
--   chiudendone tre e dichiarando sicura la quarta.
--
-- COSA NON CAMBIA, dichiarato per non farlo scoprire a qualcun altro:
--   · il ramo `claimed_by = old.id` dell'oblio resta senza guardia, ed è giusto: dopo la
--     0015 quel legame non può più essere stato ottenuto dichiarando l'indirizzo di un
--     altro, e dopo questa migration nemmeno registrandolo senza provarlo;
--   · 🔴 IL PROFILO E IL CONSENSO NASCONO ANCORA PRIMA DELLA PROVA DELL'INDIRIZZO, e
--     questa migration NON lo tocca. Una `signUp` anonima con l'indirizzo di un altro
--     continua a creare una riga in `public.profiles` (con nome e data di nascita scelti
--     dall'attaccante) e una riga in `consent_events` «privacy_notice / granted / signup»
--     (0011): un consenso che nessuno ha prestato, registrato come se fosse la prova
--     dell'Art. 7. E siccome `auth.users.email` è unico, quell'indirizzo resta occupato:
--     la persona vera non può più registrarsi con la propria mail.
--     È un difetto PREESISTENTE (0011) e di classe diversa — riguarda l'account, non
--     l'archivio storico — ma va scritto qui perché è il residuo che resta in piedi dopo
--     aver chiuso il furto della scheda, e nessun test lo copre. La contromisura naturale
--     è far nascere profilo e consenso alla conferma invece che al signup, oppure una
--     pulizia programmata degli account mai confermati: decisione di prodotto, non un fix
--     da infilare in coda a una migration di sicurezza.
--
-- COSA SI PERDE. Chi entra col social e ha, per qualunque ragione, l'indirizzo non
-- confermato dal provider non si aggancia alla nascita del profilo: si aggancerà alla
-- prima conferma, per mano del ramo B. Nessuno resta fuori per sempre.
--
-- SCARTATO: rendere l'aggancio un'operazione esplicita dell'app («collega il mio
-- storico», chiamata dopo il login). Sarebbe più leggibile, ma sposterebbe una regola di
-- integrità dentro un client che possiamo non controllare (versioni vecchie, un domani la
-- pagina web) e che potrebbe non tornare mai. La prova dell'indirizzo la possiede il
-- database: è lì che va letta.
--
-- QUANDO SI ARMA. Come la 0015: oggi mai (0 profili, 0 righe in `legacy_contacts`,
-- verificato all'apply della 0015). Si arma **nell'istante in cui carichiamo le 1352
-- anagrafiche**. 🔴 VA APPLICATA PRIMA DEL CARICAMENTO, non prima del rilascio dell'app.
--
-- ✅ APPLICATA AL DB VIVO il 2026-07-29 (registro: 20260729140217), su autorizzazione
-- esplicita di Riccardo. Stato al momento dell'apply: 0 profili, 0 righe in
-- `legacy_contacts`, 2 utenti entrambi già confermati — nessun dato reale toccato.
-- Verificato DOPO, non per ack: 5 funzioni `security definer` con `search_path=""`, nessuna
-- eseguibile da `anon`/`authenticated`; 8 trigger tutti `ABILITATO (origin)`; la guardia del
-- ramo B presente nella definizione del trigger; advisor di sicurezza identici a prima.
-- ⚠️ La copia registrata in `supabase_migrations.schema_migrations` ha l'INTESTAZIONE
-- RIDOTTA (il DDL è identico byte per byte, i commenti di testa no): **l'SSOT è questo
-- file**, non il registro.
-- 🔴 LIMITE: il comportamento non è mai stato esercitato sul DB vivo — con 0 profili non
-- scatta nulla. È coperto dalle suite su Postgres usa-e-getta; la prova reale arriva col
-- primo utente vero.
--
-- ORDINE DI RILASCIO: dopo la 0015 (sostituisce di nuovo il corpo delle stesse funzioni).
-- Richiede 0012 applicata (la tabella), 0011 (il trigger di nascita del profilo) e — per il
-- §4 — la 0013, di cui questo file diventa il corpo buono.
-- 🔴 **DA QUI IN POI IL CORPO BUONO DI TUTTE E QUATTRO LE FUNZIONI È QUESTO FILE**:
-- `claim_legacy_contact`, `purge_legacy_contact`, `purge_legacy_on_user_delete`,
-- `sync_contact_email_on_email_change`. Riapplicare 0012, 0013 o 0014 senza rimettere in
-- coda 0015 **e 0016** riporta indietro i corpi e riapre il furto: le note in testa a quei
-- tre file sono state aggiornate, ma se ci si arriva da qui vale lo stesso avvertimento.
--
-- RIESEGUIBILE: sì. `create or replace function` + `revoke` + `drop trigger if exists`
-- seguito da `create trigger`. Come la 0015, questo file crea anche un OGGETTO NUOVO
-- (`on_auth_user_email_confirmed`): va nominato, perché è ciò che un rollback ingenuo
-- lascia indietro.
--
-- ROLLBACK: riapplicare i corpi della 0015 **più `sync_contact_email_on_email_change` dalla
-- 0014** (il §4 sostituisce una funzione che la 0015 non conosce, quindi la sola 0015 non la
-- riporterebbe indietro) e togliere gli oggetti nuovi del §2:
-- ⚠️ **DALLA 0014, NON DALLA 0013.** La 0013 è dove quella funzione è *definita*, ma la 0014
-- l'ha già sostituita col fix dei campi vuoti: un rollback che ripesca la 0013 riporta
-- indietro quel fix in silenzio. Questa riga diceva «0013» fino a poco fa — lo stesso errore
-- che avevo appena commesso scrivendo il §4, che sarebbe rimasto congelato nelle istruzioni
-- di rollback. Vale la regola generale: **il corpo buono di una funzione condivisa sta
-- nell'ULTIMA migration che l'ha toccata**, che si trova con
-- `grep -l "create or replace function public.<nome>" migrations/*.sql`, non nel file dove
-- la funzione compare la prima volta.
--   drop trigger if exists on_auth_user_email_confirmed on auth.users;
--   drop function if exists public.claim_legacy_on_email_confirmed();
-- Senza queste due righe resta uno stato MISTO (corpi vecchi + trigger nuovo), e il
-- trigger nuovo continuerebbe a rivendicare in parallelo a un ramo A che rivendica già
-- senza guardia: doppio lavoro, non un danno, ma non è uno stato che qualcuno ha scelto.
-- Sconsigliato comunque: riapre il furto usa-e-getta.

-- ---------------------------------------------------------------------------
-- 1. Ramo A — l'aggancio alla nascita del profilo, solo su indirizzo già provato
-- ---------------------------------------------------------------------------
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
  v_legacy public.legacy_contacts;
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

  -- ⚠️ LA RIGA CHE CHIUDE IL FURTO USA-E-GETTA. Senza di lei il profilo nato al passo 3
  -- della sequenza in testa rivendica la riga di chiunque, prima che l'indirizzo sia
  -- provato. Chi arriva qui non confermato non è perduto: lo raccoglie il ramo B alla
  -- conferma.
  if not coalesce(v_confermata, false) then
    return new;
  end if;

  update public.legacy_contacts
     set claimed_by = new.id,
         claimed_at = now()
   where email_norm = v_key
     and claimed_by is null
  returning * into v_legacy;

  -- Se non c'era niente da rivendicare, può darsi che la riga sia GIÀ NOSTRA: succede
  -- quando il ramo B ha confermato prima che il profilo esistesse (signup senza
  -- `birth_date` nei metadata, dove `handle_new_user` non crea la riga, e il profilo
  -- nasce più tardi dall'app). Senza questa seconda lettura il backfill non avverrebbe
  -- mai per quelle persone: la riga risulterebbe agganciata e i campi resterebbero vuoti,
  -- che è il modo peggiore di sbagliare — sembra tutto a posto.
  if v_legacy.id is null then
    select * into v_legacy
      from public.legacy_contacts
     where email_norm = v_key
       and claimed_by = new.id;
  end if;

  -- Da qui in giù è identico alla 0014/0015: si riempiono solo le colonne rimaste vuote,
  -- «vuota» vale NULL o stringa vuota da entrambi i lati, e la provincia si colma solo
  -- fra italiani. Le ragioni stanno là e non si ricopiano, per non farle divergere.
  if v_legacy.id is not null then
    if nullif(btrim(new.phone), '') is null
       and nullif(btrim(v_legacy.phone), '') is not null then
      new.phone := v_legacy.phone;
    end if;

    if nullif(btrim(new.city), '') is null
       and nullif(btrim(v_legacy.city), '') is not null then
      new.city := v_legacy.city;
    end if;

    if coalesce(nullif(btrim(new.country), ''), 'IT') = 'IT'
       and coalesce(nullif(btrim(v_legacy.country), ''), 'IT') = 'IT'
       and nullif(btrim(new.province), '') is null
       and nullif(btrim(v_legacy.province), '') is not null then
      new.province := v_legacy.province;
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function public.claim_legacy_contact() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Ramo B — l'aggancio alla conferma, dove l'indirizzo diventa provato
-- ---------------------------------------------------------------------------
-- È il momento in cui l'indirizzo smette di essere una dichiarazione. Il profilo di
-- norma esiste già (l'ha creato `handle_new_user` al signup), quindi qui si fa un UPDATE
-- e non si riempie `new.*`.
create or replace function public.claim_legacy_on_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text := lower(btrim(new.email));
  -- Scalari, NON una variabile di tipo `public.legacy_contacts`: un tipo composito si
  -- risolve alla COMPILAZIONE della funzione, cioè fuori da qualunque blocco EXCEPTION.
  -- Dichiararlo qui farebbe fallire il trigger prima che la guardia `undefined_table`
  -- possa intervenire, vanificandola. Lezione già pagata nella 0013.
  v_phone text;
  v_city text;
  v_province text;
  v_country text;
  v_trovata boolean := false;
begin
  if v_key is null
     or v_key = ''
     or v_key like '%@privaterelay.appleid.com' then
    return new;
  end if;

  -- `public.legacy_contacts` è di un'altra migration. Se questa girasse senza la 0012,
  -- o dopo un suo rollback, ogni CONFERMA DI REGISTRAZIONE morirebbe su «relation does
  -- not exist»: nessuno riuscirebbe più ad attivare il proprio account, per colpa di una
  -- tabella che con l'accesso non c'entra. `undefined_table` è l'unica classe inghiottita;
  -- tutto il resto deve continuare a fallire rumorosamente.
  begin
    update public.legacy_contacts
       set claimed_by = new.id,
           claimed_at = now()
     where email_norm = v_key
       and claimed_by is null
    returning phone, city, province, country
      into v_phone, v_city, v_province, v_country;

    v_trovata := found;
  exception when undefined_table then
    return new;
  end;

  if not v_trovata then
    return new;
  end if;

  -- Stessa semantica del ramo A e della 0014: si riempiono SOLO le colonne rimaste
  -- vuote, e la provincia solo fra italiani. Qui in forma di UPDATE, perché il profilo
  -- esiste già. Se non esiste ancora, questo UPDATE non trova righe e non è un errore:
  -- al momento in cui nascerà, la seconda lettura del ramo A recupera il backfill.
  begin
    update public.profiles p
       set phone = case
             when nullif(btrim(p.phone), '') is null
              and nullif(btrim(v_phone), '') is not null
             then v_phone else p.phone end,
           city = case
             when nullif(btrim(p.city), '') is null
              and nullif(btrim(v_city), '') is not null
             then v_city else p.city end,
           province = case
             when coalesce(nullif(btrim(p.country), ''), 'IT') = 'IT'
              and coalesce(nullif(btrim(v_country), ''), 'IT') = 'IT'
              and nullif(btrim(p.province), '') is null
              and nullif(btrim(v_province), '') is not null
             then v_province else p.province end
     where p.id = new.id;
  exception
    when undefined_table then
      return new;
    -- Stessa ragione del gemello nella 0013: i valori che stiamo scrivendo vengono da un
    -- archivio importato di qualità ignota (1352 righe). Se un domani su `phone`, `city` o
    -- `province` comparisse un CHECK, l'errore risalirebbe fino all'UPDATE di `auth.users`
    -- che ha fatto scattare il trigger — e la persona non riuscirebbe più a CONFERMARE il
    -- proprio account, per colpa di una colonna che con l'accesso non c'entra. Fra «il
    -- profilo resta da riempire a mano» e «non ci si può più attivare», il primo è
    -- incomparabilmente meno grave: best-effort esplicito.
    when check_violation then
      return new;
  end;

  return new;
end;
$$;

revoke execute on function public.claim_legacy_on_email_confirmed()
  from public, anon, authenticated;

-- `update of email_confirmed_at` restringe il fuoco alla colonna giusta; la WHEN
-- restringe alla TRANSIZIONE giusta. Servono entrambe: la prima da sola firerebbe anche
-- quando GoTrue riscrive lo stesso valore, e senza la seconda una conferma ripetuta
-- ri-rivendicherebbe (idempotenza), oltre a rivendicare al passaggio inverso — un
-- indirizzo che torna NON confermato.
drop trigger if exists on_auth_user_email_confirmed on auth.users;
create trigger on_auth_user_email_confirmed
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute procedure public.claim_legacy_on_email_confirmed();

-- ---------------------------------------------------------------------------
-- 3. L'oblio: un indirizzo mai provato non porta via la scheda di nessuno
-- ---------------------------------------------------------------------------
-- Il gemello descritto in testa. Le due funzioni sotto sono quelle della 0015, con la
-- sola aggiunta della guardia sulla conferma nel ramo «righe MAI rivendicate», cioè
-- l'unico che usa l'indirizzo come chiave. Il ramo `claimed_by` non cambia.
create or replace function public.purge_legacy_contact()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text;
  v_confermata boolean;
begin
  -- Protetto come i gemelli: dopo un rollback della 0012 avrebbe fatto fallire ogni
  -- cancellazione di PROFILO su «relation does not exist» — cioè la persona bloccata
  -- dentro, per una tabella che con il suo profilo non c'entra.
  -- ⚠️ RESIDUO DICHIARATO, e la prima stesura di questo commento diceva il falso («l'unico
  -- rimasto scoperto»): **il §1 resta scoperto e non è rimediabile qui**. `claim_legacy_contact`
  -- dichiara `v_legacy public.legacy_contacts`, un tipo composito che si risolve alla
  -- COMPILAZIONE della funzione, quindi fuori da qualunque blocco EXCEPTION: senza la 0012
  -- ogni signup con `birth_date` morirebbe prima che una guardia possa intervenire, e
  -- nessuno potrebbe più registrarsi. Per chiuderlo davvero il §1 va riscritto con variabili
  -- scalari come il §2 — lavoro da fare in una migration nuova, non qui.
  begin
    delete from public.legacy_contacts where claimed_by = old.id;
  exception when undefined_table then
    return old;
  end;

  -- ⚠️ QUI L'EMAIL NON SEMPRE C'È: quando la cancellazione parte da `auth.users`, la riga
  -- dell'utente non è più leggibile da qui e la chiave resta NULL. Non si ripiega su
  -- `old.contact_email` — rimetterebbe la falla della 0015 proprio nel ramo che CANCELLA.
  -- Il percorso «cancella account» è coperto dal trigger sotto, che l'email ce l'ha.
  select lower(btrim(u.email)), u.email_confirmed_at is not null
    into v_key, v_confermata
    from auth.users u
   where u.id = old.id;

  if v_key is not null and v_key <> '' and coalesce(v_confermata, false) then
    delete from public.legacy_contacts
     where email_norm = v_key
       and claimed_by is null;
  end if;
  return old;
end;
$$;

revoke execute on function public.purge_legacy_contact() from public, anon, authenticated;

create or replace function public.purge_legacy_on_user_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text := lower(btrim(old.email));
begin
  -- La guardia è la stessa del §1, letta però su `old.*`: l'utente che si sta cancellando
  -- ha in mano la propria riga, non serve andarla a cercare. Chi non ha mai confermato
  -- non porta via niente — e non perde niente di suo, perché la scheda d'archivio non è
  -- un suo dato: è il dato di chi quell'indirizzo lo possiede davvero.
  if v_key is not null
     and v_key <> ''
     and old.email_confirmed_at is not null then
    -- Stessa protezione dei gemelli della 0013/0015: senza la 0012 ogni cancellazione di
    -- account morirebbe su «relation does not exist», cioè non si potrebbe più cancellare
    -- un account — peggio del problema che stiamo risolvendo.
    begin
      delete from public.legacy_contacts
       where email_norm = v_key
         and claimed_by is null;
    exception when undefined_table then
      return old;
    end;
  end if;
  return old;
end;
$$;

revoke execute on function public.purge_legacy_on_user_delete() from public, anon, authenticated;

drop trigger if exists on_auth_user_purge_legacy on auth.users;
create trigger on_auth_user_purge_legacy
  before delete on auth.users
  for each row execute procedure public.purge_legacy_on_user_delete();

-- ---------------------------------------------------------------------------
-- 4. La quarta porta: il cambio email rivendicava su un indirizzo mai provato
-- ---------------------------------------------------------------------------
-- `sync_contact_email_on_email_change` (0013) fa due cose al cambio di indirizzo: sposta il
-- recapito derivato, e RIVENDICA la riga d'archivio registrata sotto `old.email` — perché
-- «l'indirizzo vecchio era suo, la riga è sua». Quel «era suo» è la stessa premessa non
-- controllata che questa migration sta chiudendo altrove: nessuno verifica che `old.email`
-- sia mai stato provato.
--
-- LO SCENARIO, un passo più in là della registrazione usa-e-getta: si fa `signUp` con
-- l'indirizzo della vittima, non si conferma (il §1 impedisce il claim), poi si sposta
-- l'account sul proprio indirizzo — e nello spostamento la riga della vittima viene
-- rivendicata da qui. Oggi il passo finale non è raggiungibile da un anonimo, perché
-- `updateUser({email})` richiede una sessione e la sessione richiede la conferma. Ma la
-- distanza è UN'IMPOSTAZIONE: `mailer_autoconfirm` acceso, un invito creato da console, un
-- `updateUserById` fatto da un service_role, e la porta si riapre — senza che nessuno
-- colleghi la cosa a questa migration, perché il codice sta in un altro file.
--
-- Il corpo è quello della 0013 con UNA condizione in più. Non si tocca la 0013: è già
-- applicata in produzione, e le migration applicate non si riscrivono.
--
-- ⚠️ La guardia sta sul ramo della RIVENDICAZIONE, non su quello del recapito: spostare
-- `contact_email` quando la persona cambia indirizzo è giusto comunque, confermato o no —
-- quella colonna dice «a cosa scriviamo», non «chi sei», ed è l'unica cosa che tiene onesto
-- l'oblio per email. Metterla più in alto avrebbe spento anche quello.
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
  -- LA CONDIZIONE NUOVA: l'indirizzo che si sta abbandonando era stato provato?
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

  -- Identico alla **0014**, salvo `v_vecchia_provata`. Le ragioni per cui questo blocco
  -- esiste (senza, la 0013 REGREDIVA la 0012 sull'oblio) stanno là e non si ricopiano.
  -- ⚠️ IL CORPO DA CUI PARTIRE È QUELLO DELLA 0014, NON DELLA 0013: la prima stesura di
  -- questo §4 ha copiato la 0013, cioè `coalesce(p.phone, l.phone)`, e ha **regredito** il
  -- fix dei campi vuoti — una cella che nell'archivio è stringa vuota tornava a essere
  -- letta come piena. Non l'ha preso nessuna verifica di questo file: l'ha preso **T10
  -- della suite 0014** («phone = , il vuoto non è stato colmato dal backfill») quando è
  -- girata la batteria completa. È esattamente il motivo per cui la batteria esiste, ed è
  -- il motivo per cui ogni file di questa catena porta in testa l'avviso sul corpo buono.
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
    exception when undefined_table then
      return new;
    end;
  end if;

  return new;
end;
$$;

revoke execute on function public.sync_contact_email_on_email_change()
  from public, anon, authenticated;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute procedure public.sync_contact_email_on_email_change();
