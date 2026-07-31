-- Migration 0020 — il nickname che arriva al partner nasce da `profiles`, e il Paese resta
-- (goal partner-identita, F-CLAIM-PRESIDIATI — decisioni di Riccardo del 2026-07-31)
--
-- DUE COSE IN UN FILE SOLO, per la stessa ragione della 0019: ogni apply in produzione è
-- una leva di Riccardo più un rischio, e queste due toccano la stessa colonna
-- (`auth.users.raw_user_meta_data`) con la stessa meccanica. Separarle avrebbe voluto dire
-- due apply e due giri di verifica sullo stesso oggetto.
--
-- ---------------------------------------------------------------------------------
-- §1 — IL PAESE TORNA NEI `user_metadata` (decisione 2 di Riccardo, 2026-07-31)
-- ---------------------------------------------------------------------------------
-- Il modulo di Let's Donation chiede il Paese come campo OBBLIGATORIO
-- (`docs/integrazioni/scambio-dati-quadro.md:104`). Noi ce l'abbiamo, ma non viaggia con i
-- dati dell'accesso: così com'è, il partner deve chiederlo comunque — cioè proprio ciò che
-- l'integrazione dovrebbe evitare.
--
-- La 0019 lo aveva incluso nella bonifica insieme al resto dell'anagrafica. Questa
-- migration lo ESCLUDE e ripristina il valore a chi l'ha già perso. Motivo dominante nelle
-- parole della decisione: il Paese lo raccolgono comunque, quindi tenerlo nascosto non
-- protegge nessuno e costa al partner un modulo in più. Le alternative (un canale dati
-- nuovo, o richiederlo di nuovo alla persona) costavano settimane o erano già escluse.
--
-- COSTO PER IL PARTNER, già scritto nel brief (§5, domanda 6): in UserInfo `country` non è
-- un claim standard, quindi il loro client va adattato per leggerlo.
--
-- ⚠️ QUESTO RIBALTA UNA REGOLA CHE LA SUITE 0019 VERIFICA (il suo T5 pretendeva che
-- `country` sparisse). Il test non è stato lasciato rompere né cancellato: la chiave è
-- stata spostata nel test gemello che presidia ciò che RESTA, con il puntatore a qui.
-- Perdere quella riga avrebbe voluto dire che nessuno si accorge più se un domani la
-- bonifica se lo riprende.
--
-- ---------------------------------------------------------------------------------
-- §2 — IL CLAIM `preferred_username` NASCE DA `profiles`, E NESSUNO LO SCAVALCA
-- ---------------------------------------------------------------------------------
-- IL BUCO, trovato da due critici avversariali il 2026-07-31. Il brief promette al partner
-- tre cose sul nickname: che è **unico da noi**, che ha **da 2 a 30 caratteri**, e che se
-- lo togliamo **smette di arrivargli**. Tutte e tre sono garantite da vincoli che stanno
-- su `public.profiles` (CHECK `nickname_forma` e indice `profiles_nickname_unico`, 0017).
-- Ma il claim che il partner riceve NON viene letto da `profiles`: il server auth lo legge
-- da `auth.users.raw_user_meta_data->>'preferred_username'`, dove non c'è nessun vincolo.
--
-- QUATTRO PUNTI DI SCRITTURA, verificati alla fonte nel codice dell'app il 2026-07-31, e
-- nessuno dei quattro passa dai vincoli di `profiles`:
--   1. `AuthContext.tsx:223` (signUp) — scrive il nickname CHIESTO nei metadata. Se è
--      occupato, la clemenza di `handle_new_user` lo scarta da `profiles` (`v_nickname :=
--      null`) ma **nei metadata resta**, e la 0019 li preserva di proposito.
--      ⇒ al partner arriverebbe il nickname **di un'altra persona**, che da noi non esiste.
--      Non serve un client malevolo: è il percorso ORDINARIO di registrazione.
--   2. `nickname.ts:116` (`syncNicknameClaim` → `updateUser`) — scrive qualunque valore.
--   3. `PUT /user` chiamato a mano da chiunque abbia una sessione valida — stessa strada
--      del punto 2 senza passare dall'app: nickname occupato, lungo 500 caratteri, o
--      offensivo.
--   4. `useProfileForm.ts:336` (completamento profilo dopo il login social) — scrive
--      `profiles` e sincronizza **solo il nome** (`:356`), mai il nickname. È la
--      divergenza opposta: il profilo cambia e il claim resta quello vecchio.
--
-- PERCHÉ IL PRESIDIO STA NEL DATABASE E NON NELL'APP. I punti di scrittura sono quattro e
-- il terzo non passa nemmeno dal nostro codice. Una correzione lato app chiuderebbe i
-- punti 1, 2 e 4 e lascerebbe aperto proprio quello contro cui la promessa va difesa.
-- Qui il claim non viene «controllato»: viene DERIVATO da `profiles`, che è la fonte di
-- verità dichiarata fin dalla 0017. Ciò che non nasce da lì non sopravvive.
--
-- ⚠️ SCARTO DICHIARATO dal contenuto previsto nel binding. Il piano diceva «nella clemenza,
-- togliere il valore anche dai `raw_user_meta_data`». Quella riga avrebbe chiuso UN caso
-- (la collisione in registrazione) lasciando aperti gli altri tre, e avrebbe dovuto essere
-- ripetuta nei tre punti in cui `handle_new_user` scarta un nickname (forma, unicità,
-- corsa) — tre copie che un domani divergono. La derivazione da `profiles` li chiude tutti
-- con una definizione sola, e per costruzione: la clemenza non va nemmeno toccata, perché
-- il claim segue ciò che è finito in colonna, qualunque sia il motivo per cui ci è finito.
--
-- DUE FACCE, e servono ENTRAMBE:
--   · faccia A — `profiles` cambia  → i metadata si riallineano. Copre il completamento
--     post-social (punto 4) e ogni futura modifica del nickname, anche fatta in SQL.
--   · faccia B — i metadata cambiano → si riallineano da `profiles`. Copre i punti 1, 2 e
--     3, cioè tutto ciò che scrive il claim scavalcando la colonna.
-- Una faccia sola non basta: A non vede chi scrive solo i metadata, B non vede chi scrive
-- solo `profiles`.
--
-- TERMINAZIONE (il rischio vero di due trigger che si scrivono a vicenda). La faccia A
-- scrive `auth.users`, il che sveglia la faccia B; B rilegge `profiles`, calcola lo stesso
-- valore, e la GUARDIA lo trova già a posto ⇒ zero righe toccate, nessun terzo giro. Vale
-- anche verso il trigger di pulizia della 0019, che ha la sua guardia (`?| v_chiavi`) e si
-- spegne allo stesso modo.
-- ⚠️ LA RAGIONE PER CUI SI FERMA NON È QUELLA CHE SEMBRA, ed è la differenza fra questo
-- disegno e uno che va in ricorsione infinita. `UPDATE OF colonna` fa scattare il trigger
-- quando la colonna compare nella clausola SET, **non** quando il valore cambia davvero
-- (documentazione PostgreSQL, CREATE TRIGGER — verificata il 2026-07-31): riscrivere i
-- metadata con un valore identico sveglierebbe eccome il trigger. Ciò che ferma la catena
-- è che la guardia sta nel **WHERE** dell'update, quindi l'update non tocca NESSUNA riga —
-- e un trigger `for each row` su zero righe non gira. ⇒ chi un domani spostasse quella
-- condizione in un `if` dentro il corpo, dopo aver scritto, riaprirebbe la ricorsione
-- lasciando il codice all'apparenza equivalente. È la stessa tecnica della 0019 §2b, ed è
-- provata dal test T9 di questa suite: senza una prova, «tanto converge» è esattamente il
-- ragionamento con cui nascono le ricorsioni infinite.
--
-- ORDINE DEI DUE TRIGGER su `auth.users`, per chi legge fra sei mesi: PostgreSQL esegue i
-- trigger dello stesso tipo in ordine ALFABETICO di nome (non di creazione), quindi
-- `on_auth_user_metadata_claim_allineamento` gira prima di `on_auth_user_metadata_pulizia`.
-- L'ordine non conta, ma è scritto perché nessuno ci costruisca sopra una dipendenza
-- credendola casuale.
--
-- 🔴 COSA CONTA DAVVERO, INVECE: che le due liste di chiavi siano DISGIUNTE. Non è una
-- questione di ordine né di gusto — è la seconda condizione di terminazione, e l'abbiamo
-- scoperta il 2026-07-31 da un mutante che si aspettava un test rosso e ha invece
-- prodotto `stack depth limit exceeded`. Se una chiave finisse in entrambe (la bonifica
-- del §1 e la derivazione del §2a), i due presidi si combatterebbero all'infinito: uno la
-- toglie, l'altro la rimette, e ogni UPDATE risveglia l'altro trigger. Le guardie di
-- idempotenza NON servono a niente in quel caso, perché ciascuno dei due trova sempre
-- qualcosa da fare — ed è il motivo per cui il ragionamento «tanto ho messo la guardia»
-- non basta. In produzione: stack overflow sulla REGISTRAZIONE.
-- ⇒ l'invariante è reso MECCANICO nel §1 (le chiavi protette vengono tolte dalla lista
-- qualunque cosa ci si scriva dentro), non lasciato a questo commento. I mutanti N11 e
-- N12 presidiano quel filtro sui suoi due esiti diversi: un claim perduto e la ricorsione.
--
-- COSA QUESTA MIGRATION NON FA, detto invece di lasciarlo credere:
--   · non modera il contenuto del nickname (parole offensive, impersonificazione). La
--     moderazione è nostra ed è dichiarata al partner come «su segnalazione, nessun filtro
--     automatico»: resta quella, qui si presidia solo forma, unicità e provenienza.
--   · non copre il caso in cui una riga di `profiles` venga cancellata SENZA cancellare
--     l'utente: oggi quel flusso non esiste (la cancellazione account cancella
--     `auth.users`, e `profiles` la segue in cascata), quindi il trigger della faccia A
--     non ascolta il DELETE. Se un domani nascesse, il claim resterebbe all'ultimo valore.
--   · non prova nulla sul giro OIDC vero: il provider è ancora spento. Come per la 0017,
--     la prova end-to-end sul token reale va rifatta quando si accende.
--
-- RIESEGUIBILE: `create or replace function` + `drop trigger if exists` prima di ogni
-- `create trigger` + update con guardia di idempotenza. Provata dal doppio passaggio in
-- `tests/run-all.sh`, non dichiarata a parole (la 0019 aveva dichiarato «RIESEGUIBILE: sì»
-- prima della prova e la batteria era uscita rossa in 16 combinazioni su 24).
--
-- ROLLBACK:
--   drop trigger if exists on_profile_claim_allineamento on public.profiles;
--   drop trigger if exists on_auth_user_metadata_claim_allineamento on auth.users;
--   drop function if exists public.allinea_claim_da_profiles();
--   drop function if exists public.allinea_claim_da_profiles_su_metadata();
--   drop function if exists public.allinea_claim_da_profiles_di(uuid);
--   -- e riapplicare `handle_new_user` e `pulisci_metadata_anagrafici_di` dalla 0019.
--   -- ⚠️ Il corpo di ripristino va preso dall'ULTIMA migration che tocca la funzione
--   --    (regola scritta dopo l'errore del 2026-07-29). Alla data del rollback: la 0019.
--   -- NB: il rollback riporta `country` dentro la bonifica. Se si vuole tenere la sola
--   --    decisione sul Paese, ripristinare `handle_new_user` dalla 0019 e lasciare
--   --    `pulisci_metadata_anagrafici_di` come la lascia questo file.

-- ═══════════════════════════════════════════════════════════════════════════
-- §1 — Il Paese resta nei metadata
-- ═══════════════════════════════════════════════════════════════════════════

-- Corpo preso dalla **0019 §2b**, che è l'ultima ad averlo definito, con la sola riga di
-- `v_chiavi` cambiata. Tutto il resto è identico: la guardia prima dell'update (che è ciò
-- che ferma la ricorsione del trigger 2c) e l'exception dichiarata best-effort.
create or replace function public.pulisci_metadata_anagrafici_di(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- 🔴 LA DISGIUNZIONE FRA QUESTE DUE LISTE È UNA CONDIZIONE DI TERMINAZIONE, non una
  -- questione di gusto — scoperto il 2026-07-31 da un mutante che si aspettava un test
  -- rosso e ha invece prodotto `stack depth limit exceeded`.
  -- Se una chiave finisce sia qui sia nella derivazione del claim (§2a), i due trigger si
  -- combattono all'infinito: la pulizia la toglie → il suo UPDATE sveglia l'allineamento
  -- → l'allineamento la rimette → il suo UPDATE sveglia la pulizia → e così via. Le
  -- guardie individuali NON bastano, perché ognuno dei due trova sempre qualcosa da fare:
  -- ciascuno annulla il lavoro dell'altro. In produzione sarebbe uno stack overflow sulla
  -- REGISTRAZIONE, cioè il guasto peggiore possibile, innescato da qualcuno che un domani
  -- aggiunge una voce a un array credendo di fare una cosa innocua.
  -- ⇒ per questo l'invariante è MECCANICO e non affidato a questo commento: le chiavi
  -- protette vengono tolte dalla lista qui sotto, qualunque cosa ci si scriva dentro.
  v_protetti constant text[] := array['name', 'preferred_username', 'picture', 'country'];
  -- Le chiavi che scriviamo NOI nel signup email (`AuthContext.signUp`), più
  -- `contact_email`: oggi nessuno la manda per quella via, ma il trigger la LEGGE, quindi
  -- il giorno in cui qualcuno la mandasse resterebbe lì.
  -- NON in elenco, e non per dimenticanza:
  --   · `name` e `preferred_username` — i claim OIDC, è il loro mestiere stare qui
  --     (`picture` è nei protetti per lo stesso motivo: il claim esiste già nel server
  --     auth, e sarebbe la chiave dell'immagine di profilo se un domani si facesse);
  --   · `country` — TOLTO DA QUESTA MIGRATION (0020). Il modulo del partner lo chiede
  --     come obbligatorio e lo raccoglierebbe comunque: tenerlo fuori dai metadata non
  --     protegge nessuno e costa al partner un campo da richiedere di nuovo. Decisione di
  --     Riccardo del 2026-07-31. Il § in testa a questo file ha il ragionamento completo;
  --   · tutto ciò che scrive il provider nel login federato.
  v_richieste constant text[] := array[
    'first_name', 'last_name', 'phone', 'city', 'province',
    'birth_date', 'marketing_consent', 'contact_email'
  ];
  v_chiavi text[];
begin
  -- Il filtro che rende l'invariante impossibile da violare per distrazione. Un claim
  -- protetto messo in `v_richieste` viene semplicemente ignorato: la bonifica fa meno di
  -- quanto le si è chiesto, invece di uccidere la registrazione.
  select coalesce(array_agg(k), array[]::text[]) into v_chiavi
    from unnest(v_richieste) k
   where not (k = any (v_protetti));

  -- La guardia PRIMA dell'update, non dopo: è ciò che ferma la ricorsione del trigger
  -- 2c della 0019 (che aggiorna la stessa colonna che lo fa scattare) al secondo giro.
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

-- Il ripristino per chi il Paese l'ha già perso con la 0019 NON sta qui: lo fa il backfill
-- del §2e, insieme al nickname, perché `country` è una delle due chiavi DERIVATE da
-- `profiles` (§2a). Una funzione di ripristino a parte sarebbe stata un secondo
-- meccanismo che scrive la stessa chiave con una regola diversa — e le due regole
-- divergevano già in partenza: il ripristino «non sovrascrivere ciò che c'è» contro la
-- derivazione «`profiles` è la fonte di verità». Due padroni per un campo solo è il modo
-- in cui nasce un dato che nessuno sa più da dove viene.

-- ═══════════════════════════════════════════════════════════════════════════
-- §2 — Il claim del nickname deriva da `profiles`
-- ═══════════════════════════════════════════════════════════════════════════

-- ---------------------------------------------------------------------------
-- 2a. La derivazione — una funzione sola, tre chiamanti
-- ---------------------------------------------------------------------------
-- Scritta UNA VOLTA e chiamata dalle due facce più dalla nascita del profilo, per la
-- stessa ragione per cui la 0019 fece così con l'elenco delle chiavi: tre copie della
-- stessa regola sono tre posti in cui un domani se ne cambia una sola, e la copia
-- dimenticata è sempre quella che nessun test esercita.
create or replace function public.allinea_claim_da_profiles_di(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- LE DUE CHIAVI DERIVATE, e sono due per decisioni diverse: `preferred_username` perché
  -- il brief promette al partner che è unico e conforme (garanzie che vivono su
  -- `profiles`), `country` perché dal 2026-07-31 viaggia verso di loro e la persona lo può
  -- CAMBIARE da «modifica profilo» (`ProfileEditScreen.tsx:198`) senza che nessuno
  -- risincronizzi i metadata — al partner arriverebbe il Paese vecchio per sempre.
  -- `null` copre due casi che qui si comportano allo stesso modo, ed è voluto: il campo
  -- vuoto, e il profilo che non esiste ancora (login social prima del completamento). In
  -- entrambi al partner non deve arrivare nulla.
  v_nickname text;
  v_country  text;
  v_nuovo    jsonb;
begin
  select p.nickname, nullif(btrim(p.country), '')
    into v_nickname, v_country
    from public.profiles p
   where p.id = p_user_id;

  -- Si CALCOLA lo stato completo che i metadata devono avere: si tolgono le chiavi
  -- derivate e si rimettono dai valori di `profiles`. `jsonb_strip_nulls` fa sì che un
  -- valore assente non lasci una chiave a JSON null — che `->>` renderebbe
  -- indistinguibile dall'assenza, e che resterebbe lì per sempre nella superficie che
  -- UserInfo consegna intera.
  select (u.raw_user_meta_data - 'preferred_username' - 'country')
         || jsonb_strip_nulls(jsonb_build_object(
              'preferred_username', v_nickname,
              'country',            v_country))
    into v_nuovo
    from auth.users u
   where u.id = p_user_id;

  update auth.users u
     set raw_user_meta_data = v_nuovo
   where u.id = p_user_id
     -- LA GUARDIA, e la sua forma conta più di quanto sembri. Confronta lo stato ATTUALE
     -- con il risultato GIÀ CALCOLATO, non con i singoli valori attesi: così, dopo un
     -- update, la condizione è falsa per costruzione — qualunque cosa faccia il calcolo
     -- qui sopra — e la catena di trigger si spegne sempre al giro dopo.
     -- ⚠️ Una guardia scritta «per campi» (`->>'x' is distinct from v_x`) sembra
     -- equivalente e NON lo è: se un domani il calcolo e il confronto divergessero, lo
     -- stato non raggiungerebbe mai quello atteso e l'update si ripeterebbe all'infinito.
     -- Non è teoria — è successo davvero il 2026-07-31, su due mutanti scritti per far
     -- fallire un test che hanno invece prodotto `stack depth limit exceeded`. Questa
     -- forma rende quella classe di guasto impossibile, non improbabile.
     and u.raw_user_meta_data is distinct from v_nuovo;
exception
  -- Stessa scelta della 0019 §2b, e per lo stesso motivo: senza questa riga, un ambiente
  -- in cui il ruolo non ha UPDATE su `auth.users` non avrebbe «il claim non si allinea»,
  -- avrebbe «nessuno riesce più a registrarsi» — perché questa funzione è chiamata anche
  -- dentro `handle_new_user`, che vive nella transazione dell'INSERT.
  when insufficient_privilege then
    raise warning 'allinea_claim_da_profiles_di: nessun privilegio di UPDATE su auth.users, claim non allineati per %', p_user_id;
end;
$$;

revoke execute on function public.allinea_claim_da_profiles_di(uuid)
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2b. Faccia A — `profiles` cambia, il claim la segue
-- ---------------------------------------------------------------------------
-- Copre il completamento del profilo dopo il login social (`useProfileForm.ts:336`, che
-- sincronizza solo il nome), il CAMBIO DEL PAESE da «modifica profilo»
-- (`ProfileEditScreen.tsx:198`, che non sincronizza niente) e qualunque modifica futura,
-- compresa una fatta in SQL a mano. `update of nickname, country` restringe il fuoco alle
-- colonne giuste: senza, il trigger scatterebbe a ogni scrittura su `profiles`.
-- ⚠️ Le colonne elencate qui e le chiavi derivate nel §2a sono LO STESSO INSIEME visto da
-- due lati. Aggiungerne una di là senza aggiungerla di qua dà il guasto silenzioso: il
-- valore si allinea alla nascita e alla prima modifica di un'ALTRA colonna, mai quando
-- cambia il campo che interessa. Cambiarle INSIEME.
create or replace function public.allinea_claim_da_profiles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.allinea_claim_da_profiles_di(new.id);
  -- AFTER trigger: il valore di ritorno viene ignorato.
  return null;
end;
$$;

revoke execute on function public.allinea_claim_da_profiles()
  from public, anon, authenticated;

drop trigger if exists on_profile_claim_allineamento on public.profiles;
create trigger on_profile_claim_allineamento
  after insert or update of nickname, country on public.profiles
  for each row
  execute procedure public.allinea_claim_da_profiles();

-- ---------------------------------------------------------------------------
-- 2c. Faccia B — i metadata cambiano, il claim torna quello di `profiles`
-- ---------------------------------------------------------------------------
-- È il presidio che regge contro chi scrive il claim SENZA passare da `profiles`: la
-- registrazione con nickname occupato (dove la clemenza svuota la colonna e i metadata
-- conservano il valore chiesto), `syncNicknameClaim`, e `PUT /user` chiamato a mano da
-- chiunque abbia una sessione. Per mettere un valore lì bisogna toccare questa colonna, e
-- toccarla fa scattare questo trigger.
--
-- Trigger SEPARATO da `on_auth_user_metadata_pulizia` (0019) invece di fondere i due
-- corpi: fare un `create or replace` di quella funzione per aggiungerci l'allineamento
-- avrebbe reso il suo nome bugiardo, e riscrivere il corpo di una funzione della 0019 per
-- una ragione che con la pulizia non c'entra è il modo in cui si perdono pezzi in
-- silenzio. Convivono: entrambi hanno la guardia di idempotenza, quindi al secondo giro
-- non scrivono e la catena si spegne (provato da T9).
create or replace function public.allinea_claim_da_profiles_su_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.allinea_claim_da_profiles_di(new.id);
  -- AFTER trigger: il valore di ritorno viene ignorato.
  return null;
end;
$$;

revoke execute on function public.allinea_claim_da_profiles_su_metadata()
  from public, anon, authenticated;

drop trigger if exists on_auth_user_metadata_claim_allineamento on auth.users;
create trigger on_auth_user_metadata_claim_allineamento
  after update of raw_user_meta_data on auth.users
  for each row
  execute procedure public.allinea_claim_da_profiles_su_metadata();

-- ---------------------------------------------------------------------------
-- 2d. La nascita: il claim allineato prima che la transazione si chiuda
-- ---------------------------------------------------------------------------
-- Corpo preso dalla **0019 §2a**, che è l'ultima ad averlo definito, con in coda la sola
-- riga nuova (marcata). Tutto il resto è identico riga per riga: se qui si perdesse un
-- pezzo, si perderebbero in silenzio i fix delle 0011/0013/0014/0017/0019.
--
-- Perché serve anche qui, avendo GIÀ le due facce: la faccia B è un AFTER UPDATE, e alla
-- nascita c'è stato un INSERT. Se nessuno riscrive i metadata dopo di noi, senza questa
-- riga il nickname scartato dalla clemenza resterebbe nei metadata fino alla prima
-- modifica del profilo — cioè, per chi non ne fa nessuna, per sempre.
-- ⚠️ E nemmeno la faccia A la rende superflua, benché l'insert in `profiles` qui sotto la
-- faccia scattare: la riga NON è ridondante, ed è un fatto MISURATO, non dedotto — il
-- mutante N5 la spegne e la suite diventa rossa su T2. Se un domani sembrasse codice in
-- più da togliere, è quel mutante la risposta.
-- ⚠️ Va DOPO l'insert in `profiles`, non prima: legge la colonna che quell'insert scrive.
-- È lo stesso ordine che la 0019 documenta per la pulizia, e il test T4 lo presidia.
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

  -- (0019). L'anagrafica è stata consumata: non deve restare nei metadata, che
  -- UserInfo consegna INTERI a chi ha lo scope `profile`. Sta FUORI dal ramo qui sopra
  -- di proposito — se un domani qualcuno scrivesse quelle chiavi in un flusso senza
  -- `birth_date`, resterebbero lì senza che nessuno se ne accorga.
  -- `name` e `preferred_username` NON si toccano qui: il primo è un claim che scriviamo
  -- noi, il secondo lo allinea la riga sotto.
  perform public.pulisci_metadata_anagrafici_di(new.id);

  -- NUOVO (0020). I claim derivati si allineano a ciò che è REALMENTE finito in colonna.
  -- È la riga che chiude il caso della collisione: la clemenza qui sopra ha messo `null`
  -- in `profiles`, mentre nei metadata è rimasto il nickname CHIESTO — che è di un'altra
  -- persona. Da qui in poi il claim non può che venire da `profiles`.
  perform public.allinea_claim_da_profiles_di(new.id);

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2e. Backfill: gli utenti già esistenti
-- ---------------------------------------------------------------------------
-- Sul database vivo, al 2026-07-31, questo tocca **0 righe** (2 utenti, 0 profili, quindi
-- 0 nickname). Non è inutile, e fa DUE lavori:
--   · allinea anche in negativo — un utente senza profilo che avesse un
--     `preferred_username` nei metadata se lo vede togliere, ed è esattamente il caso
--     «claim che non nasce da `profiles`» contro cui esiste questa migration;
--   · RIMETTE IL PAESE a chi la 0019 gliel'ha tolto. È il ripristino previsto dalla
--     decisione di Riccardo del 2026-07-31: non serve una funzione a parte, perché
--     `country` è una delle chiavi derivate e questo giro le scrive tutte.
--
-- CHIAMA LA FUNZIONE invece di ripetere la logica, per la stessa ragione scritta nella
-- 0019 §2d: una sola definizione, un solo posto dove sbagliare. La guardia è dentro,
-- quindi sulle righe già allineate non scrive nulla e questo giro è idempotente.
select public.allinea_claim_da_profiles_di(id) from auth.users;
